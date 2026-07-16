const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const payload = {
    name: "Test Product 3",
    slug: "test-product-3",
    price: 150,
    features: [JSON.stringify({ is_new: true, rating: 5 })]
  };
  const { data, error } = await supabase.from('products').insert([payload]);
  console.log('Error:', error);
}
check();
