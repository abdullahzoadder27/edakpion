require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abdullahzoadder27@gmail.com',
    password: 'password123'
  });
  if (authError) {
    console.log('Auth Error:', authError.message);
    return;
  }
  const { count, error } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });
  console.log('Count:', count);
  console.log('Error:', error);
}
check();
