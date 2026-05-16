const { isValidPhoneNumber } = require('libphonenumber-js/min');

/** Matches PhoneInput `defaultCountry` on business commute / contact forms */
const DEFAULT_COUNTRY = 'IN';

/**
 * Country-aware validation: E.164 (+…), or national number for default country.
 */
function isValidInternationalPhone(value, defaultCountry = DEFAULT_COUNTRY) {
  const raw = String(value ?? '').trim();
  if (!raw) return false;

  // Common user-entered patterns for India:
  // - 10 digits: 9876543210
  // - leading 0: 09876543210
  // - country code without +: 919876543210
  // Allow these by normalizing before libphonenumber validation.
  if (!raw.startsWith('+') && String(defaultCountry).toUpperCase() === 'IN') {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits.length === 10) {
      // ok as-is
      try {
        return isValidPhoneNumber(digits, 'IN');
      } catch {
        return false;
      }
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      const national = digits.slice(1);
      try {
        return isValidPhoneNumber(national, 'IN');
      } catch {
        return false;
      }
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      const e164 = `+${digits}`;
      try {
        return isValidPhoneNumber(e164);
      } catch {
        return false;
      }
    }
    return false; // enforce India 10-digit national number if no '+'
  }

  try {
    if (raw.startsWith('+')) {
      return isValidPhoneNumber(raw);
    }
    return isValidPhoneNumber(raw, defaultCountry);
  } catch {
    return false;
  }
}

module.exports = {
  isValidInternationalPhone,
  DEFAULT_COUNTRY,
};
