import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type AppNotification = {
  id: string;
  type: 'ride_status' | 'driver_offer' | 'promo' | 'support' | 'document' | 'sos' | 'system';
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
};

/**
 * In-app / realtime notification center backed by Supabase. This is what
 * feeds the "new ride request" alert while the app is foregrounded; wiring
 * native FCM/APNs for backgrounded push requires platform credentials
 * (google-services.json, APNs certs) supplied per-deployment.
 */
export async function fetchNotifications(): Promise<AppNotification[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    data: row.data ?? {},
    readAt: row.read_at ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function unreadNotificationCount(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
}

export function subscribeToNotifications(userId: string, onInsert: (n: AppNotification) => void) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      payload => {
        const row = payload.new as any;
        onInsert({
          id: row.id,
          type: row.type,
          title: row.title,
          body: row.body,
          data: row.data ?? {},
          readAt: row.read_at ?? undefined,
          createdAt: row.created_at,
        });
      },
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function registerDeviceToken(token: string, platform: 'ios' | 'android') {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const { error } = await supabase
    .from('device_tokens')
    .upsert({ user_id: userId, token, platform }, { onConflict: 'user_id,token' });
  if (error) throw error;
}
