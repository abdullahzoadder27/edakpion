-- 04_storage.sql
INSERT INTO storage.buckets (id, name, public) VALUES 
('products', 'products', true),
('categories', 'categories', true),
('collections', 'collections', true),
('homepage', 'homepage', true),
('banners', 'banners', true),
('users', 'users', true),
('logos', 'logos', true),
('icons', 'icons', true),
('fashion-journal', 'fashion-journal', true),
('support', 'support', false),
('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;
