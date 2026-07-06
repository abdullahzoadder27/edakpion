const fs = require('fs');
const content = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://alpougdeizdmuwxdevgw.supabase.co';
let rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscG91Z2RlaXpkbXV3eGRldmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjMxMDMsImV4cCI6MjA5ODgzOTEwM30.4TGlaLUAnCVFkp89V5X-SWeZ5bEksywLXnE5BnVNn_E';

// Fix for malformed keys (e.g. if the user accidentally pasted the key twice)
if (rawAnonKey && rawAnonKey.split('.').length > 3) {
  rawAnonKey = rawAnonKey.split('.').slice(0, 3).join('.');
}

const supabaseAnonKey = rawAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`;
fs.writeFileSync('src/lib/supabase.ts', content);
