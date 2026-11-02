-- Apply ONLY to an isolated FitMyStyle Supabase project. Never run against B-CORE.
create extension if not exists pgcrypto;
create table if not exists public.familylook_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  payload jsonb not null check (jsonb_typeof(payload)='object' and pg_column_size(payload)<1024*1024),
  schema_version text not null default '2.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists familylook_projects_owner_updated on public.familylook_projects(owner_id,updated_at desc);
alter table public.familylook_projects enable row level security;
-- Explicit ownership for every operation. User identity comes from the signed JWT,
-- not from the client's payload or a project owner_id supplied in JSON.
create policy "FamilyLook owners can read" on public.familylook_projects for select to authenticated using(owner_id=auth.uid());
create policy "FamilyLook owners can create" on public.familylook_projects for insert to authenticated with check(owner_id=auth.uid());
create policy "FamilyLook owners can edit" on public.familylook_projects for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "FamilyLook owners can delete" on public.familylook_projects for delete to authenticated using(owner_id=auth.uid());
revoke all on public.familylook_projects from anon;
grant select, insert, update, delete on public.familylook_projects to authenticated;
create or replace function public.familylook_set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now();return new;end;$$;
create trigger familylook_updated_at before update on public.familylook_projects for each row execute function public.familylook_set_updated_at();
-- No public storage bucket; do not store photographs or measurements without a dedicated privacy review.