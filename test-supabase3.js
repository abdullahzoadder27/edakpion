import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: profiles, error: e1 } = await supabase.from('profiles').select('*').limit(3);
  const { data: authUsers, error: e2 } = await supabase.from('admin_auth_users').select('*').limit(3);
  console.log('Profiles:', JSON.stringify(profiles, null, 2));
  console.log('Auth Users:', JSON.stringify(authUsers, null, 2));
}
test();
