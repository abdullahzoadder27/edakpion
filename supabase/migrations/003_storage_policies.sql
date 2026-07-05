-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('category-images', 'category-images', true),
('blog-images', 'blog-images', true),
('avatars', 'avatars', true),
('review-images', 'review-images', true),
('testimonial-images', 'testimonial-images', true),
('site-content', 'site-content', true),
('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Public website images
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Public read category images" ON storage.objects;
CREATE POLICY "Public read category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
DROP POLICY IF EXISTS "Public read avatar images" ON storage.objects;
CREATE POLICY "Public read avatar images" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Public read review images" ON storage.objects;
CREATE POLICY "Public read review images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
DROP POLICY IF EXISTS "Public read testimonial images" ON storage.objects;
CREATE POLICY "Public read testimonial images" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
DROP POLICY IF EXISTS "Public read site content" ON storage.objects;
CREATE POLICY "Public read site content" ON storage.objects FOR SELECT USING (bucket_id = 'site-content');

-- Admin can manage all
DROP POLICY IF EXISTS "Admin can manage all objects" ON storage.objects;
CREATE POLICY "Admin can manage all objects" ON storage.objects FOR ALL USING (public.is_admin());

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Users can upload review images
DROP POLICY IF EXISTS "Users can upload review images" ON storage.objects;
CREATE POLICY "Users can upload review images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update own review images" ON storage.objects;
CREATE POLICY "Users can update own review images" ON storage.objects FOR UPDATE USING (bucket_id = 'review-images' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;
CREATE POLICY "Users can delete own review images" ON storage.objects FOR DELETE USING (bucket_id = 'review-images' AND owner = auth.uid());

-- Users can upload support attachments
DROP POLICY IF EXISTS "Users can read own support attachments" ON storage.objects;
CREATE POLICY "Users can read own support attachments" ON storage.objects FOR SELECT USING (bucket_id = 'support-attachments' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can upload support attachments" ON storage.objects;
CREATE POLICY "Users can upload support attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update own support attachments" ON storage.objects;
CREATE POLICY "Users can update own support attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'support-attachments' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can delete own support attachments" ON storage.objects;
CREATE POLICY "Users can delete own support attachments" ON storage.objects FOR DELETE USING (bucket_id = 'support-attachments' AND owner = auth.uid());
