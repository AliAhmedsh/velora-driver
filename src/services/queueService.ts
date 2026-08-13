import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type QueueItem = {
  id?: string;
  city_name: string;
  priority: number;
  eta?: string;
};

export async function fetchDestinationQueue(): Promise<QueueItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('driver_destination_queue')
    .select('*')
    .eq('driver_id', userId)
    .eq('is_active', true)
    .order('priority');
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    city_name: row.city_name,
    priority: row.priority,
    eta: row.eta,
  }));
}

export async function saveDestinationQueue(items: QueueItem[]) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  await supabase.from('driver_destination_queue').delete().eq('driver_id', userId);

  if (items.length === 0) return;

  const rows = items.map(item => ({
    driver_id: userId,
    city_name: item.city_name,
    priority: item.priority,
    eta: item.eta,
    is_active: true,
  }));

  const { error } = await supabase.from('driver_destination_queue').insert(rows);
  if (error) throw error;
}

export async function updateDriverSettings(settings: {
  is_online?: boolean;
  auto_match?: boolean;
  return_trip_enabled?: boolean;
  return_destination?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('profiles').update(settings).eq('id', userId);
  if (error) throw error;
}

export async function fetchDriverSettings() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('is_online, auto_match, return_trip_enabled, return_destination, tier')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchC2CPlans() {
  const { data, error } = await supabase.from('c2c_driver_plans').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return data ?? [];
}
