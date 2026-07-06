require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('support_tickets').select('*, profiles!support_tickets_user_id_fkey(full_name)').limit(1);
  console.log('Keys:', data?.[0] ? Object.keys(data[0]) : 'no data');
  console.log('Data:', data);
  console.log('Error:', error);
}
check();
