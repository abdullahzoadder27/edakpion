import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function testCols(cols) {
  for (const col of cols) {
    const { error } = await supabase.from('orders').select(col).limit(1);
    if (!error) console.log("EXISTS:", col);
  }
}
testCols(['delivery_charge', 'delivery_method', 'delivery_amount', 'shipping_cost', 'subtotal', 'discount']);
