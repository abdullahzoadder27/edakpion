import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
let rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Fix for malformed keys (e.g. if the user accidentally pasted the key twice)
if (rawAnonKey && rawAnonKey.split('.').length > 3) {
  rawAnonKey = rawAnonKey.split('.').slice(0, 3).join('.');
}

const supabaseAnonKey = rawAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isMockData = false;
