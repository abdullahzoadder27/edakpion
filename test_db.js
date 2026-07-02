import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function testCols(cols) {
  for (const col of cols) {
    const { error } = await supabase.from('addresses').select(col).limit(1);
    if (!error) console.log("EXISTS:", col);
  }
}
testCols(['id', 'user_id', 'created_at', 'updated_at', 'contact_number', 'phone_number', 'mobile', 'street_address', 'address1', 'zip_code', 'zip', 'region', 'division']);
