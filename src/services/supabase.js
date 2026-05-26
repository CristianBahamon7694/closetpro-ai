import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sanitize URL to handle potential copy-paste mistakes (trailing slashes, rest/v1 paths, etc.)
const sanitizeUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

const supabaseUrl = sanitizeUrl(rawUrl);
const supabaseAnonKey = rawAnonKey ? rawAnonKey.trim() : '';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)