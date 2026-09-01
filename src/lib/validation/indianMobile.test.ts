import { describe, expect, it } from 'vitest';
import { indianMobileError, isValidIndianMobile, nextIndianMobileValue } from './indianMobile';

describe('Indian mobile validation', () => {
  it.each(['9876543210', '9123456789', '8765432101'])('accepts %s', (value) => expect(isValidIndianMobile(value)).toBe(true));
  it.each(['987654321', '98765432101', '1234567890', 'abc9876543', '98765-43210', '98765 43210', '+91 9876543210'])('rejects %s', (value) => expect(isValidIndianMobile(value)).toBe(false));
  it('rejects non-digit paste and caps direct input at ten digits', () => {
    expect(nextIndianMobileValue('+91 9876543210', '9876543210')).toBe('9876543210');
    expect(nextIndianMobileValue('98765432101')).toBe('9876543210');
    expect(indianMobileError('', true)).toBe('Mobile number is required.');
  });
});
