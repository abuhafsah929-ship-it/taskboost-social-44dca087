
CREATE POLICY "proofs_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "proofs_select_own_or_admin" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'proofs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_select_all" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');
