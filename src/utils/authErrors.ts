/** Maps Supabase auth errors to user-friendly messages. */
export function getAuthErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Something went wrong';

  const lower = raw.toLowerCase();

  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return (
      'Supabase blocked sending more auth emails (about 4/hour on free tier). ' +
      'Wait ~1 hour, then in Supabase Dashboard → Authentication → Providers → Email turn OFF "Confirm email". ' +
      'Phone sign-up does not need real email — that setting was sending mail on every attempt.'
    );
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Wrong email/phone or password. Try again or create an account.';
  }

  if (lower.includes('user already registered')) {
    return 'An account already exists. Use Sign in instead.';
  }

  if (lower.includes('password') && lower.includes('least')) {
    return 'Password must be at least 6 characters.';
  }

  if (lower.includes('confirm email') || lower.includes('confirmation is required')) {
    return 'Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email, then try again.';
  }

  return raw;
}

function isInvalidCredentials(error: unknown): boolean {
  const msg = getAuthErrorMessage(error).toLowerCase();
  return msg.includes('wrong email/phone') || msg.includes('invalid login');
}

export { isInvalidCredentials };
