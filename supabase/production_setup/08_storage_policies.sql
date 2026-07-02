-- 08_storage_policies.sql
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'categories', 'collections', 'homepage', 'banners', 'users', 'logos', 'icons', 'fashion-journal'));
CREATE POLICY "Admin Full Storage Access" ON storage.objects USING (public.is_super_admin());

CREATE POLICY "Users upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'users' AND auth.role() = 'authenticated');
CREATE POLICY "Users update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'users' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'users' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload support" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'support' AND auth.role() = 'authenticated');
CREATE POLICY "Users read own support" ON storage.objects FOR SELECT USING (bucket_id = 'support' AND auth.uid()::text = (storage.foldername(name))[1]);
