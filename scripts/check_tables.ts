import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://alpougdeizdmuwxdevgw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscG91Z2RlaXpkbXV3eGRldmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjMxMDMsImV4cCI6MjA5ODgzOTEwM30.4TGlaLUAnCVFkp89V5X-SWeZ5bEksywLXnE5BnVNn_E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  let { error: err1 } = await supabase.from('reviews').select('*').limit(1);
  console.log('reviews error:', err1?.message || 'None');
  let { error: err2 } = await supabase.from('product_reviews').select('*').limit(1);
  console.log('product_reviews error:', err2?.message || 'None');
}
check();
