import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('orders').insert([{
    order_number: 'TEST-123',
    total_amount: 100,
    shipping_address: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
  }]).select('id');
  console.log("error:", error?.message || "SUCCESS");
}
run();
