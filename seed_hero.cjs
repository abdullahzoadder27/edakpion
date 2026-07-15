const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // Check if empty
    const { data, error } = await supabase.from('hero_slides').select('id');
    
    if (error) {
        console.log('Error', error.message);
        return;
    }
    
    if (data.length === 0) {
        const slides = [
          {
            title: 'Streetwear\\nBangladesh',
            subtitle: 'Premium Fashion Store',
            description: "EDAKPION is a premium men's fashion & clothing brand in Bangladesh offering timeless shirts, polos, panjabis, hoodies and modern essentials crafted with premium quality, comfort and confidence.",
            desktop_image: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=1200&auto=format&fit=crop',
            primary_button_text: 'SHOP NOW',
            primary_button_url: '/shop',
            display_order: 0,
            is_active: true
          },
          {
            title: 'Modern\\nEssentials',
            subtitle: 'New Arrival',
            description: "Discover our latest collection of premium modern essentials. Upgrade your wardrobe with our versatile and stylish pieces.",
            desktop_image: 'https://images.unsplash.com/photo-1523398002811-999aa8ffdd59?q=80&w=1200&auto=format&fit=crop',
            primary_button_text: 'VIEW LOOKBOOK',
            primary_button_url: '/shop',
            secondary_button_text: 'SHOP NOW',
            secondary_button_url: '/shop',
            display_order: 1,
            is_active: true
          }
        ];
        
        await supabase.from('hero_slides').insert(slides);
        console.log('Inserted default slides');
    } else {
        console.log('Slides already exist');
    }
}
run();
