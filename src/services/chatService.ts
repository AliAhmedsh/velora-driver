import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type ChatMessage = {
  id: string;
  rideId: string;
  senderId: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

export async function fetchChatMessages(rideId: string): Promise<ChatMessage[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('ride_id', rideId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    rideId: row.ride_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    isMine: row.sender_id === userId,
  }));
}

export async function sendChatMessage(rideId: string, body: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('chat_messages').insert({
    ride_id: rideId,
    sender_id: userId,
    body: body.trim(),
  });
  if (error) throw error;
}

export function subscribeToChat(rideId: string, onMessage: () => void) {
  const channel = supabase
    .channel(`chat-${rideId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `ride_id=eq.${rideId}` },
      () => onMessage(),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
