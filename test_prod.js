import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: p } = await supabase.from('products').select('id').limit(1);
  if (!p || !p[0]) return console.log("No product");
  const id = p[0].id;
  const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url),
            product_variants(size, color, price)
          `)
          .eq('id', id)
          .single();
  console.log("Error:", prodErr);
}
run();
