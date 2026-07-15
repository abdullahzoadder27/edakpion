import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*, admin_activity_logs(count)').limit(1);
  console.log('Profiles with count:', error ? error.message : 'success');
  
  const { data: d2, error: e2 } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles plain:', e2 ? e2.message : 'success');

  const { data: d3, error: e3 } = await supabase.from('admin_auth_users').select('*').limit(1);
  console.log('admin_auth_users view:', e3 ? e3.message : 'success');
}
test();
