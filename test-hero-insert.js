import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('hero_slides').insert([
    {
      title: 'Experience Pure\nLuxury Water',
      subtitle: 'PREMIUM QUALITY',
      description: 'Discover the purest, most refreshing mineral water sourced from pristine natural springs.',
      image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=2070',
      desktop_image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=2070',
      primary_button_text: 'Shop Now',
      primary_button_url: '/shop',
      badge: 'New Collection',
      is_active: true,
      display_order: 0
    }
  ]);
  console.log('Insert:', error ? error.message : 'success');
}
test();
