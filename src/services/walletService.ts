import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export async function getOrCreateWallet() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: existing } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase.from('wallets').insert({ user_id: userId }).select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchWalletBalance(): Promise<number> {
  const wallet = await getOrCreateWallet();
  return wallet.balance_pkr ?? 0;
}

export async function fetchWalletTransactions() {
  const wallet = await getOrCreateWallet();
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', wallet.id)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function fetchTodayEarnings(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('rides')
    .select('fare, customer_offer, commission_amount')
    .eq('driver_id', userId)
    .eq('status', 'completed')
    .gte('updated_at', start.toISOString());
  if (error) throw error;
  return (data ?? []).reduce((sum, r) => {
    const fare = r.customer_offer ?? r.fare ?? 0;
    const commission = r.commission_amount ?? 0;
    return sum + fare - commission;
  }, 0);
}

export async function fetchWeekEarnings(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const { data, error } = await supabase
    .from('rides')
    .select('fare, customer_offer, commission_amount')
    .eq('driver_id', userId)
    .eq('status', 'completed')
    .gte('updated_at', start.toISOString());
  if (error) throw error;
  return (data ?? []).reduce((sum, r) => {
    const fare = r.customer_offer ?? r.fare ?? 0;
    const commission = r.commission_amount ?? 0;
    return sum + fare - commission;
  }, 0);
}
