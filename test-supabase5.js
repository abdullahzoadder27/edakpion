import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('profiles').select('id, orders(total_amount)').limit(1);
  console.log(error ? error.message : JSON.stringify(data));
}
test();
