-- 012 — Storage buckets (all private) + RLS policies on storage.objects
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('client-documents',    'client-documents',    false, 10485760, array['application/pdf','image/jpeg','image/png']),
  ('funder-submissions',  'funder-submissions',  false, 26214400, array['application/pdf','image/jpeg','image/png','application/zip']),
  ('signed-agreements',   'signed-agreements',   false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "fnc_admin_storage_all"
  on storage.objects for all to authenticated
  using (
    bucket_id in ('client-documents','funder-submissions','signed-agreements')
    and app.is_admin()
  )
  with check (
    bucket_id in ('client-documents','funder-submissions','signed-agreements')
    and app.is_admin()
  );

create policy "fnc_client_documents_own"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'client-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'client-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
