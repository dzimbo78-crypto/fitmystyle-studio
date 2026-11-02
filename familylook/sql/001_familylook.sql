-- ONLY execute in a NEW isolated FitMyStyle Supabase project (not B-CORE).
-- A published anon key is safe in the browser; NEVER put service_role in client code.
create extension if not exists pgcrypto;
create table if not exists public.family_projects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (length(title) between 1 and 120),
 config jsonb not null check (jsonb_typeof(config) = 'object' and octet_length(config::text) < 100000),
 status text not null default 'draft' check (status in ('draft','awaiting-review','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists ix_family_projects_owner on public.family_projects(owner_id,updated_at desc);
create or replace function public.touch_family_project() returns trigger language plpgsql set search_path = public as $$begin new.updated_at=now();return new;end;$$;
drop trigger if exists trg_family_project_updated on public.family_projects;
create trigger trg_family_project_updated before update on public.family_projects for each row execute function public.touch_family_project();
alter table public.family_projects enable row level security;
revoke all on public.family_projects from anon,authenticated;
grant select,insert,update,delete on public.family_projects to authenticated;
create policy "Read own family projects" on public.family_projects for select to authenticated using ((select auth.uid())=owner_id);
create policy "Create own family projects" on public.family_projects for insert to authenticated with check ((select auth.uid())=owner_id and status='draft');
create policy "Update own family projects" on public.family_projects for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id and status in ('draft','archived'));
create policy "Delete own family projects" on public.family_projects for delete to authenticated using ((select auth.uid())=owner_id);
-- Private raster graphic assets, not exposed publicly. Use signed URLs only for authorized production staff.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('fitmystyle-family-artwork','fitmystyle-family-artwork',false,10485760,array['image/png','image/jpeg','image/webp'])
 on conflict (id) do nothing;
create policy "Artwork select own" on storage.objects for select to authenticated
 using (bucket_id='fitmystyle-family-artwork' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Artwork insert own" on storage.objects for insert to authenticated
 with check (bucket_id='fitmystyle-family-artwork' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Artwork update own" on storage.objects for update to authenticated
 using (bucket_id='fitmystyle-family-artwork' and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check (bucket_id='fitmystyle-family-artwork' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Artwork delete own" on storage.objects for delete to authenticated
 using (bucket_id='fitmystyle-family-artwork' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Policies should be integration-tested with two real auth users before enabling commercial accounts.