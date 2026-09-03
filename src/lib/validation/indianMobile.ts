/** International phone: optional + country prefix, 7–15 digits (E.164 range). */
export const INDIAN_MOBILE_REGEX = /^\+?[0-9 ()-]+$/;

export function isValidIndianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return INDIAN_MOBILE_REGEX.test(value) && digits.length >= 7 && digits.length <= 15 && (!value.includes('+') || value.trim().startsWith('+'));
}

export function indianMobileError(value: string, required = false): string | undefined {
  if (!value) return required ? 'Mobile number is required.' : undefined;
  if (!isValidIndianMobile(value)) return 'Enter a valid phone number with 7 to 15 digits; an optional + country code is allowed.';
  return undefined;
}

/** Preserve normal international formatting while preventing invalid characters. */
export function nextIndianMobileValue(next: string, current = ''): string {
  if (!/^\+?[0-9 ()-]*$/.test(next)) return current;
  return next.slice(0, 20);
}
