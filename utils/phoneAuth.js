import { supabase } from './supabase';
import { formatEthiopianPhone } from '../constants/formatters';

/** Local mobile digits after +251 (e.g. 912345678). */
export const normalizeEthiopianMobile = (input = '') => {
  const digits = String(input).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('251')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
};

export const isValidEthiopianMobile = (input = '') => /^9\d{8}$/.test(normalizeEthiopianMobile(input));

/**
 * Resolve the account email for phone login via Supabase RPC get_email_by_phone.
 * @returns {Promise<string|null>}
 */
export const getEmailByPhone = async (phoneInput) => {
  const formatted = formatEthiopianPhone(phoneInput);
  const fallback = phoneInput ? `+251${normalizeEthiopianMobile(phoneInput)}` : '';
  const phoneForLookup = formatted || fallback;

  if (!phoneForLookup || !isValidEthiopianMobile(phoneForLookup)) {
    return null;
  }

  const { data, error } = await supabase.rpc('get_email_by_phone', {
    phone_input: phoneForLookup,
  });

  if (error) {
    throw error;
  }

  return typeof data === 'string' && data.trim() ? data.trim() : null;
};

/**
 * Email for sign-in: direct email or lookup by phone.
 */
export const resolveSignInEmail = async ({ authMethod, email, phoneNumber }) => {
  if (authMethod === 'email') {
    return email.trim();
  }

  const resolved = await getEmailByPhone(phoneNumber);
  return resolved;
};
