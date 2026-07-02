import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function testCols(cols) {
  for (const col of cols) {
    const { error } = await supabase.from('profiles').select(col).limit(1);
    if (!error) console.log("EXISTS:", col);
    else console.log("NOT EXISTS:", col, error.message);
  }
}
testCols(['full_name', 'phone_number', 'date_of_birth', 'gender', 'avatar_url', 'phone']);
