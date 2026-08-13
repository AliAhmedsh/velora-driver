import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config/app';
import { parseIdentifier, normalizePhone, phoneToAuthEmail } from '../utils/phone';
import { isInvalidCredentials } from '../utils/authErrors';

async function upsertProfile(userId: string, identifier: string) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      phone: identifier,
      full_name: APP_CONFIG.defaultName,
      role: APP_CONFIG.role,
      rating: APP_CONFIG.role === 'driver' ? 4.9 : 5,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}

async function finishAuth(session: { user: { id: string } }, identifier: string) {
  await upsertProfile(session.user.id, identifier);
  return session;
}

export async function signInWithEmail(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (error) throw error;
  if (!data.session) throw new Error('Sign in failed');

  return finishAuth(data.session, normalized);
}

export async function signUpWithEmail(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      data: {
        role: APP_CONFIG.role,
        full_name: APP_CONFIG.defaultName,
      },
    },
  });

  if (error) throw error;

  if (data.session) {
    return finishAuth(data.session, normalized);
  }

  throw new Error(
    'Account created but email confirmation is required. Disable "Confirm email" in Supabase Auth settings.',
  );
}

export async function signInWithPhone(phone: string, password: string) {
  const normalized = normalizePhone(phone);
  const email = phoneToAuthEmail(normalized);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.session) throw new Error('Sign in failed');

  return finishAuth(data.session, normalized);
}

export async function signUpWithPhone(phone: string, password: string) {
  const normalized = normalizePhone(phone);
  const email = phoneToAuthEmail(normalized);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        phone: normalized,
        role: APP_CONFIG.role,
        full_name: APP_CONFIG.defaultName,
      },
    },
  });

  if (error) throw error;

  if (data.session) {
    return finishAuth(data.session, normalized);
  }

  throw new Error(
    'Account created but confirmation is required. Disable "Confirm email" in Supabase Auth settings.',
  );
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Sign in with email or Pakistani phone number + password. */
export async function signIn(identifier: string, password: string) {
  const parsed = parseIdentifier(identifier);
  if (parsed.type === 'email') {
    return signInWithEmail(parsed.value, password);
  }
  return signInWithPhone(parsed.value, password);
}

/** Create account with email or Pakistani phone number + password. */
export async function signUp(identifier: string, password: string) {
  const parsed = parseIdentifier(identifier);

  try {
    if (parsed.type === 'email') {
      return await signInWithEmail(parsed.value, password);
    }
    return await signInWithPhone(parsed.value, password);
  } catch (error) {
    if (!isInvalidCredentials(error)) {
      throw error;
    }
  }

  if (parsed.type === 'email') {
    return signUpWithEmail(parsed.value, password);
  }
  return signUpWithPhone(parsed.value, password);
}
