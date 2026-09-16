import { describe, expect, it } from 'vitest';
import { indianMobileError, isValidIndianMobile, nextIndianMobileValue } from './indianMobile';

describe('Indian mobile validation', () => {
  it.each(['9876543210', '9123456789', '8765432101', '987654321', '98765432101', '+91 9876543210', '98765-43210', '98765 43210'])('accepts %s', (value) => expect(isValidIndianMobile(value)).toBe(true));
  it.each(['123456', '1234567890123456', 'abc9876543', '98+76543210', '++919876543210'])('rejects %s', (value) => expect(isValidIndianMobile(value)).toBe(false));
  it('rejects invalid characters and preserves normal international formatting', () => {
    expect(nextIndianMobileValue('+91 9876543210', '9876543210')).toBe('+91 9876543210');
    expect(nextIndianMobileValue('987654321012345678901')).toBe('98765432101234567890');
    expect(nextIndianMobileValue('abc9876543', '9876543')).toBe('9876543');
    expect(indianMobileError('', true)).toBe('Mobile number is required.');
  });
});
