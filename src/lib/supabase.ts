import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rxkpxsofkcucpjfbeofo.supabase.co';
let rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3B4c29ma2N1Y3BqZmJlb2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDQyODgsImV4cCI6MjA5ODc4MDI4OH0.NH0puarkd89SN9fmiVww5GMpvPcRfQ_RCSIB_GlT_x4';

// Fix for malformed keys (e.g. if the user accidentally pasted the key twice)
if (rawAnonKey && rawAnonKey.split('.').length > 3) {
  rawAnonKey = rawAnonKey.split('.').slice(0, 3).join('.');
}

const supabaseAnonKey = rawAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isMockData = false;
