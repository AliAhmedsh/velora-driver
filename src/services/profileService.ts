import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export async function fetchProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(updates: {
  full_name?: string;
  email?: string;
  language?: string;
  payout_method?: 'bank' | 'easypaisa' | 'jazzcash' | 'cash';
  payout_account?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}

const TIER_THRESHOLDS: { tier: string; ridesNeeded: number; label: string }[] = [
  { tier: 'standard', ridesNeeded: 0, label: 'Standard' },
  { tier: 'silver', ridesNeeded: 50, label: 'Silver' },
  { tier: 'gold', ridesNeeded: 200, label: 'Gold' },
  { tier: 'platinum', ridesNeeded: 500, label: 'Platinum' },
];

export async function requestPayout(amountPkr: number, method: 'bank' | 'easypaisa' | 'jazzcash' | 'cash', accountDetails?: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('payout_requests').insert({
    driver_id: userId,
    amount_pkr: amountPkr,
    method,
    account_details: accountDetails ?? null,
  });
  if (error) throw error;
}

export function getTierProgress(totalRides: number, currentTier: string) {
  const currentIndex = TIER_THRESHOLDS.findIndex(t => t.tier === currentTier);
  const next = TIER_THRESHOLDS[currentIndex + 1];
  if (!next) return { next: null, ridesToNext: 0, progress: 1 };
  const prevThreshold = TIER_THRESHOLDS[currentIndex]?.ridesNeeded ?? 0;
  const progress = Math.min(1, (totalRides - prevThreshold) / (next.ridesNeeded - prevThreshold));
  return { next: next.label, ridesToNext: Math.max(0, next.ridesNeeded - totalRides), progress };
}
