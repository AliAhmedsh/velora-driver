import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
};

export async function fetchMyTickets(): Promise<SupportTicket[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    subject: row.subject,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createTicket(subject: string, category: string, firstMessage: string, rideId?: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({ user_id: userId, subject, category, ride_id: rideId ?? null })
    .select('*')
    .single();
  if (error) throw error;

  const { error: msgError } = await supabase
    .from('support_messages')
    .insert({ ticket_id: ticket.id, sender_id: userId, body: firstMessage, is_admin: false });
  if (msgError) throw msgError;

  return ticket;
}
