const fs = require('fs');
let code = `
import { supabase } from './src/lib/supabase.js';

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      id,
      total,
      status,
      created_at,
      profiles (
        full_name,
        email
      )
    \`)
    .order('created_at', { ascending: false });
    
  console.log('DATA:', data?.length);
  if (error) console.error('ERROR:', error);
}

run();
`;
// But I can't run it easily because it's TS and needs env vars loaded. 
