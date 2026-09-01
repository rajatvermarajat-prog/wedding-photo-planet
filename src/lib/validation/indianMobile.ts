/** Shared rule for every Indian mobile field in the CRM. Country code is not part of the field. */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function isValidIndianMobile(value: string): boolean {
  return INDIAN_MOBILE_REGEX.test(value);
}

export function indianMobileError(value: string, required = false): string | undefined {
  if (!value) return required ? 'Mobile number is required.' : undefined;
  if (!/^\d+$/.test(value)) return 'Mobile number can contain digits only.';
  if (value.length !== 10) return 'Mobile number must be exactly 10 digits.';
  if (!/^[6-9]/.test(value)) return 'Enter a valid Indian mobile number starting with 6, 7, 8, or 9.';
  return undefined;
}

/** Reject non-digit paste/input rather than silently converting country-coded values. */
export function nextIndianMobileValue(next: string, current = ''): string {
  if (!/^\d*$/.test(next)) return current;
  return next.slice(0, 10);
}
