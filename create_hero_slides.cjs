const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // Actually we need to execute SQL which might require service_role key or postgres connection.
    // But we can check if it works using rpc or if we have postgrest endpoint.
    console.log('Use sql editor or postgrest to create table.');
}
run();
