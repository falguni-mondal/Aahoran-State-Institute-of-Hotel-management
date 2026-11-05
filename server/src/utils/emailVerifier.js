import dns from 'dns/promises';
import validator from 'validator';

// Known disposable / temporary email providers blocked in production
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'temp-mail.org',
]);

/**
 * Validates an email address without using regular expressions:
 * 1. Structural RFC 5322 parsing via `validator.isEmail`
 * 2. Disposable domain blocklist check
 * 3. Live DNS MX / A record verification using Node's native `dns.promises`
 *
 * @param {string} rawEmail - Email address to verify
 * @returns {Promise<{ isValid: boolean, normalizedEmail: string, reason?: string }>}
 */
export const verifyEmailDeliverability = async (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      isValid: false,
      normalizedEmail: '',
      reason: 'Email address is required.',
    };
  }

  const trimmed = rawEmail.trim().toLowerCase();

  // 1. Non-regex structural validation using validator.isEmail
  const isStructurallyValid = validator.isEmail(trimmed, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false,
  });

  if (!isStructurallyValid) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      reason: 'Please enter a valid, properly formatted email address.',
    };
  }

  const atIndex = trimmed.lastIndexOf('@');
  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (!localPart || !domain || !domain.includes('.')) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      reason: 'Email domain is incomplete or invalid.',
    };
  }

  // 2. Block disposable/throwaway email providers
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      reason:
        'Disposable or temporary email addresses are not permitted. Please use your personal or corporate email.',
    };
  }

  // 3. Live DNS MX (Mail Exchange) & A record lookup
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      return {
        isValid: true,
        normalizedEmail: trimmed,
      };
    }
  } catch (dnsErr) {
    if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'EBADNAME') {
      return {
        isValid: false,
        normalizedEmail: trimmed,
        reason: `The email domain "${domain}" does not exist or cannot receive mail.`,
      };
    }

    try {
      const aRecords = await dns.resolve4(domain);
      if (Array.isArray(aRecords) && aRecords.length > 0) {
        return {
          isValid: true,
          normalizedEmail: trimmed,
        };
      }
    } catch (fallbackErr) {
      if (fallbackErr.code === 'ENOTFOUND') {
        return {
          isValid: false,
          normalizedEmail: trimmed,
          reason: `The email domain "${domain}" could not be verified via DNS.`,
        };
      }
    }
  }

  return {
    isValid: true,
    normalizedEmail: trimmed,
  };
};

export default verifyEmailDeliverability;