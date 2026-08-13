import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config/app';

let configured = false;

export function configureGoogleSignIn() {
  if (configured || !GOOGLE_WEB_CLIENT_ID) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

async function upsertProfile(userId: string, identifier: string, fullName?: string) {
  const isEmail = identifier.includes('@');
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      phone: isEmail ? userId.slice(0, 15) : identifier,
      email: isEmail ? identifier : undefined,
      full_name: fullName ?? APP_CONFIG.defaultName,
      role: APP_CONFIG.role,
      rating: APP_CONFIG.role === 'driver' ? 4.9 : 5,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function signInWithGoogle() {
  configureGoogleSignIn();
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Google Sign-In is not configured. Add GOOGLE_WEB_CLIENT_ID to .env');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) throw new Error('Google sign-in failed');

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  if (!data.session) throw new Error('No session');

  const email = data.session.user.email ?? data.session.user.id;
  const name = data.session.user.user_metadata?.full_name as string | undefined;
  await upsertProfile(data.session.user.id, email, name);
  return data.session;
}
