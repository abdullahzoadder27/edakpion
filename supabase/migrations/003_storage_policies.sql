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
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public read category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Public read avatar images" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public read review images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
CREATE POLICY "Public read testimonial images" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
CREATE POLICY "Public read site content" ON storage.objects FOR SELECT USING (bucket_id = 'site-content');

-- Admin can manage all
CREATE POLICY "Admin can manage all objects" ON storage.objects FOR ALL USING (public.is_admin());

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND owner = auth.uid());
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Users can upload review images
CREATE POLICY "Users can upload review images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own review images" ON storage.objects FOR UPDATE USING (bucket_id = 'review-images' AND owner = auth.uid());
CREATE POLICY "Users can delete own review images" ON storage.objects FOR DELETE USING (bucket_id = 'review-images' AND owner = auth.uid());

-- Users can upload support attachments
CREATE POLICY "Users can read own support attachments" ON storage.objects FOR SELECT USING (bucket_id = 'support-attachments' AND owner = auth.uid());
CREATE POLICY "Users can upload support attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own support attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'support-attachments' AND owner = auth.uid());
CREATE POLICY "Users can delete own support attachments" ON storage.objects FOR DELETE USING (bucket_id = 'support-attachments' AND owner = auth.uid());
