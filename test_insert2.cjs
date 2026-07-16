const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const payload = {
    name: "Test2",
    slug: "test-slug-12345",
    price: 100,
    features: ['feature1', 'feature2']
  };
  const { data, error } = await supabase.from('products').insert([payload]);
  console.log('Error:', error);
}
check();
