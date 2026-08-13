import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type DbProfile = {
  id: string;
  phone: string;
  full_name: string;
  role: 'rider' | 'driver';
  rating: number;
  created_at: string;
};

export type DbRide = {
  id: string;
  rider_id: string | null;
  driver_id: string | null;
  rider_name: string;
  driver_name: string | null;
  driver_rating: number | null;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  fare: number;
  recommended_fare: number | null;
  customer_offer: number | null;
  service_type: string | null;
  scheduled_at: string | null;
  origin_city: string | null;
  destination_city: string | null;
  fuel_option: string | null;
  rental_duration: string | null;
  vehicle_count: number | null;
  distance_km: number | null;
  duration_min: number | null;
  payment_method: string | null;
  declined_driver_ids: string[] | null;
  commission_percent: number | null;
  commission_amount: number | null;
  women_only: boolean | null;
  ac_preference: string | null;
  negotiation_enabled: boolean | null;
  status: string;
  created_at: string;
  updated_at: string;
};
