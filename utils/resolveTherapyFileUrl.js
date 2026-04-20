import { supabase } from './supabase';

const ASSETS_BUCKET = 'assets';

/**
 * @param {string|null|undefined} fileUrl Full https URL or Storage object path in `assets`.
 * @returns {Promise<string|null>}
 */
export async function resolveTherapyFileUrl(fileUrl) {
  const raw = String(fileUrl || '').trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const { data: signed, error: signedErr } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrl(raw, 60 * 60);
  if (!signedErr && signed?.signedUrl) return signed.signedUrl;

  const { data: pub } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(raw);
  return pub?.publicUrl || null;
}
