-- 10_seed.sql
INSERT INTO public.settings (key, value) VALUES
('site_settings', '{"site_name": "EDAKPION", "contact_email": "support@edakpion.com", "currency": "BDT"}'),
('seo_settings', '{"meta_title": "EDAKPION - Premium Fashion", "meta_description": "Shop the latest fashion"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.delivery_charges (city, charge) VALUES
('Dhaka', 60.00),
('Outside Dhaka', 120.00)
ON CONFLICT (city) DO NOTHING;

INSERT INTO public.homepage_sections (section_name, title, subtitle, is_active, display_order) VALUES
('hero', 'Welcome to EDAKPION', 'Discover your style', true, 1),
('featured_categories', 'Shop by Category', 'Find exactly what you need', true, 2),
('new_arrivals', 'New Arrivals', 'The latest trends', true, 3)
ON CONFLICT (section_name) DO NOTHING;
