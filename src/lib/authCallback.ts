import { Linking } from 'react-native';
import { supabase } from './supabase';

/** Deep-link / email redirect callback — veloradriver://auth/callback#access_token=... */
export function getAuthRedirectUrl(scheme: string): string {
  return `${scheme}://auth/callback`;
}

function parseAuthParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const paramString =
    hashIndex >= 0
      ? url.slice(hashIndex + 1)
      : queryIndex >= 0
        ? url.slice(queryIndex + 1)
        : '';

  if (!paramString) return {};

  return Object.fromEntries(
    paramString.split('&').map((part) => {
      const [key, ...rest] = part.split('=');
      return [key, decodeURIComponent(rest.join('='))];
    }),
  );
}

export async function createSessionFromAuthUrl(url: string): Promise<boolean> {
  if (!url.includes('access_token')) return false;

  const params = parseAuthParams(url);
  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  if (!access_token || !refresh_token) return false;

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
  return true;
}

export function subscribeToAuthDeepLinks(onError?: (message: string) => void): () => void {
  const handleUrl = async (url: string | null) => {
    if (!url) return;
    try {
      await createSessionFromAuthUrl(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not complete sign-in from link';
      onError?.(message);
    }
  };

  Linking.getInitialURL().then(handleUrl);
  const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
  return () => subscription.remove();
}
