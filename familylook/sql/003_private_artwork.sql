-- Optional: after 001_familylook_measurements.sql, in the dedicated FitMyStyle project.
-- Private artwork only; the static guest studio does not need a database or upload.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('familylook-artwork','familylook-artwork',false,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
drop policy if exists "FamilyLook private artwork read" on storage.objects;
create policy "FamilyLook private artwork read" on storage.objects for select to authenticated
using (bucket_id='familylook-artwork' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "FamilyLook private artwork create" on storage.objects;
create policy "FamilyLook private artwork create" on storage.objects for insert to authenticated
with check (bucket_id='familylook-artwork' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "FamilyLook private artwork update" on storage.objects;
create policy "FamilyLook private artwork update" on storage.objects for update to authenticated
using (bucket_id='familylook-artwork' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='familylook-artwork' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "FamilyLook private artwork delete" on storage.objects;
create policy "FamilyLook private artwork delete" on storage.objects for delete to authenticated
using (bucket_id='familylook-artwork' and (storage.foldername(name))[1]=auth.uid()::text);
