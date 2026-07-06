require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('support_tickets').select('*, profiles!support_tickets_user_id_fkey(full_name, email)');
  console.log('Data Length:', data?.length);
  console.log('Error:', error);
}
check();
