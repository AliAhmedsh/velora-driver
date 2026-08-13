import { supabase, type DbRide } from '../lib/supabase';
import type { Ride, RideStatus } from '../types/ride';
import { APP_CONFIG } from '../config/app';
import { getCurrentUserId } from './authService';

export function mapDbRideToRide(row: DbRide): Ride {
  return {
    id: row.id,
    riderName: row.rider_name,
    driverName: row.driver_name ?? undefined,
    driverRating: row.driver_rating ?? undefined,
    pickup: { address: row.pickup_address, latitude: row.pickup_lat, longitude: row.pickup_lng },
    dropoff: { address: row.dropoff_address, latitude: row.dropoff_lat, longitude: row.dropoff_lng },
    fare: row.customer_offer ?? row.fare,
    recommendedFare: row.recommended_fare ?? row.fare,
    customerOffer: row.customer_offer ?? row.fare,
    status: row.status as RideStatus,
    serviceType: (row.service_type as Ride['serviceType']) ?? 'local',
    originCity: row.origin_city ?? undefined,
    destinationCity: row.destination_city ?? undefined,
    fuelOption: row.fuel_option as Ride['fuelOption'],
    rentalDuration: row.rental_duration as Ride['rentalDuration'],
    vehicleCount: row.vehicle_count ?? undefined,
    distanceKm: row.distance_km ?? undefined,
    durationMin: row.duration_min ?? undefined,
    paymentMethod: row.payment_method as Ride['paymentMethod'],
    driverId: row.driver_id ?? undefined,
    womenOnly: row.women_only ?? undefined,
    acPreference: (row.ac_preference as Ride['acPreference']) ?? undefined,
    negotiationEnabled: row.negotiation_enabled ?? true,
    createdAt: row.created_at,
  };
}

async function getCommissionRate(serviceType: string): Promise<number> {
  const { data } = await supabase
    .from('commission_rules')
    .select('rate_percent')
    .eq('service_type', serviceType)
    .eq('is_active', true)
    .maybeSingle();
  return data?.rate_percent ?? 10;
}

export async function fetchActiveRide(isOnline = false): Promise<Ride | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data: assigned, error: assignedError } = await supabase
    .from('rides')
    .select('*')
    .eq('driver_id', userId)
    .not('status', 'in', '("completed","cancelled")')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assignedError) throw assignedError;
  if (assigned) return mapDbRideToRide(assigned as DbRide);

  if (!isOnline) return null;

  const { data: searching, error: searchingError } = await supabase
    .from('rides')
    .select('*')
    .eq('status', 'searching')
    .order('created_at', { ascending: false })
    .limit(5);

  if (searchingError) throw searchingError;
  const match = (searching as DbRide[] | null)?.find(
    r => !(r.declined_driver_ids ?? []).includes(userId),
  );
  return match ? mapDbRideToRide(match) : null;
}

export async function fetchRideHistory(): Promise<Ride[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('driver_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as DbRide[]).map(mapDbRideToRide);
}

export async function acceptRideRequest(rideId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('rides')
    .update({
      driver_id: userId,
      driver_name: APP_CONFIG.defaultName,
      driver_rating: APP_CONFIG.defaultRating,
      status: 'driver_assigned',
    })
    .eq('id', rideId)
    .eq('status', 'searching')
    .select('*')
    .single();

  if (error) throw error;
  return mapDbRideToRide(data as DbRide);
}

export async function declineRideRequest(rideId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: ride, error: fetchErr } = await supabase
    .from('rides')
    .select('declined_driver_ids')
    .eq('id', rideId)
    .single();
  if (fetchErr) throw fetchErr;

  const declined = [...(ride.declined_driver_ids ?? []), userId];
  const { error } = await supabase.from('rides').update({ declined_driver_ids: declined }).eq('id', rideId);
  if (error) throw error;
  return null;
}

export async function advanceRideStatus(rideId: string, currentStatus: RideStatus) {
  const userId = await getCurrentUserId();
  const nextStatus: Partial<Record<RideStatus, RideStatus>> = {
    driver_assigned: 'driver_arriving',
    driver_arriving: 'in_progress',
    in_progress: 'completed',
  };
  const next = nextStatus[currentStatus];
  if (!next) throw new Error('Invalid ride status transition');

  const updates: Record<string, unknown> = { status: next };

  if (next === 'completed') {
    const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single();
    if (ride) {
      const rate = await getCommissionRate(ride.service_type ?? 'local');
      const fare = ride.customer_offer ?? ride.fare;
      const commissionAmount = Math.round(fare * rate / 100);
      const driverEarning = fare - commissionAmount;
      updates.commission_percent = rate;
      updates.commission_amount = commissionAmount;

      if (userId) {
        const { data: wallet } = await supabase.from('wallets').select('id, balance_pkr').eq('user_id', userId).maybeSingle();
        if (wallet) {
          await supabase.from('wallets').update({ balance_pkr: (wallet.balance_pkr ?? 0) + driverEarning }).eq('id', wallet.id);
          await supabase.from('wallet_transactions').insert({
            wallet_id: wallet.id,
            ride_id: rideId,
            type: 'earning',
            amount_pkr: driverEarning,
            description: `Trip earning (${rate}% commission)`,
          });
        }
      }
    }
  }

  const { data, error } = await supabase.from('rides').update(updates).eq('id', rideId).select('*').single();
  if (error) throw error;
  return mapDbRideToRide(data as DbRide);
}

export function subscribeToRides(onChange: () => void) {
  const channel = supabase
    .channel('velora-rides-driver')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => onChange())
    .subscribe();
  return () => supabase.removeChannel(channel);
}
