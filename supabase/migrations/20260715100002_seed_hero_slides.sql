INSERT INTO public.hero_slides (
    title, subtitle, description, image_url, desktop_image, 
    primary_button_text, primary_button_url, badge, is_active, display_order
) VALUES (
    'Discover Our<br/>Premium Collection',
    'WELCOME TO EDAKPION',
    'Experience unparalleled quality and style with our latest curated selections.',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'Shop Now',
    '/shop',
    'New Arrivals',
    true,
    0
) ON CONFLICT DO NOTHING;
