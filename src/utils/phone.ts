export function phoneToAuthEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@velora.app`;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  return `+92${digits}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailIdentifier(value: string): boolean {
  return value.trim().includes('@');
}

/** Pakistani mobile digits without country code or leading 0. */
export function nationalPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('92')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function isValidIdentifier(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isEmailIdentifier(trimmed)) return EMAIL_RE.test(trimmed);
  return nationalPhoneDigits(trimmed).length >= 10;
}

export function getSignInValidationError(identifier: string, password: string): string | null {
  const trimmed = identifier.trim();
  if (!trimmed) return 'Enter your email or phone number.';
  if (isEmailIdentifier(trimmed) && !EMAIL_RE.test(trimmed)) {
    return 'Enter a valid email address (e.g. you@example.com).';
  }
  if (!isEmailIdentifier(trimmed) && nationalPhoneDigits(trimmed).length < 10) {
    return 'Enter a valid Pakistani phone number (10 digits, e.g. 0322 9280780).';
  }
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function parseIdentifier(value: string): { type: 'email' | 'phone'; value: string } {
  const trimmed = value.trim();
  if (isEmailIdentifier(trimmed)) {
    return { type: 'email', value: trimmed.toLowerCase() };
  }
  return { type: 'phone', value: normalizePhone(trimmed) };
}
