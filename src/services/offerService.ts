import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type RideOffer = {
  id: string;
  rideId: string;
  driverId: string;
  offeredFare: number;
  etaMinutes?: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  createdAt: string;
};

/** Driver sends a counter-offer/bid for a ride instead of straight accept (InDriver-style negotiation). */
export async function submitRideOffer(rideId: string, offeredFare: number, etaMinutes?: number, message?: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ride_offers')
    .upsert(
      {
        ride_id: rideId,
        driver_id: userId,
        offered_fare: offeredFare,
        eta_minutes: etaMinutes ?? null,
        message: message ?? null,
        status: 'pending',
      },
      { onConflict: 'ride_id,driver_id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as RideOffer;
}

export async function fetchMyOfferForRide(rideId: string): Promise<RideOffer | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('ride_offers')
    .select('*')
    .eq('ride_id', rideId)
    .eq('driver_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as RideOffer | null;
}

export async function withdrawRideOffer(offerId: string) {
  const { error } = await supabase.from('ride_offers').update({ status: 'withdrawn' }).eq('id', offerId);
  if (error) throw error;
}

export function subscribeToMyOffer(rideId: string, driverId: string, onChange: () => void) {
  const channel = supabase
    .channel(`driver-offer-${rideId}-${driverId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ride_offers', filter: `ride_id=eq.${rideId}` },
      () => onChange(),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
