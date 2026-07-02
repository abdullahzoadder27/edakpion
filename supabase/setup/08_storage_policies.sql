-- 08_storage_policies.sql
-- Public read access to products bucket
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'categories', 'avatars'));

-- Users can upload their own avatar
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
