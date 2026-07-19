import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://alpougdeizdmuwxdevgw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscG91Z2RlaXpkbXV3eGRldmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjMxMDMsImV4cCI6MjA5ODgzOTEwM30.4TGlaLUAnCVFkp89V5X-SWeZ5bEksywLXnE5BnVNn_E';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['orders', 'products', 'profiles', 'subscribers', 'support_tickets', 'categories', 'coupons', 'testimonials', 'store_settings', 'admin_activity_logs', 'hero_slides'];
  for (const t of tables) {
    let { error } = await supabase.from(t).select('*').limit(1);
    console.log(t, 'error:', error?.message || 'None');
  }
}
check();
