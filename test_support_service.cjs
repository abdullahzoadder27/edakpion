require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const serviceKeyLine = envFile.split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=') || l.startsWith('SUPABASE_SERVICE_ROLE_KEY='));
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceKeyLine) {
  serviceKey = serviceKeyLine.split('=')[1].replace(/"/g, '');
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, serviceKey);

async function check() {
  const { data, error } = await supabase.from('support_tickets').select('*, profiles!support_tickets_user_id_fkey(full_name)');
  console.log('Data:', data);
  console.log('Error:', error);
}
check();
