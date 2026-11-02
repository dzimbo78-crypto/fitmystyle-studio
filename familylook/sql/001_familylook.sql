-- Apply ONLY in a newly created Supabase project dedicated to FitMyStyle.
-- These are body and possibly child measurement data: collect minimum necessary information.
create table if not exists public.family_projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (length(title) <= 90),
 configuration jsonb not null check (jsonb_typeof(configuration)='object'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists family_projects_user_idx on public.family_projects(user_id, updated_at desc);
alter table public.family_projects enable row level security;
revoke all on table public.family_projects from anon;
grant select,insert,update,delete on table public.family_projects to authenticated;
create policy "Read own projects" on public.family_projects for select to authenticated using ((select auth.uid())=user_id);
create policy "Create own projects" on public.family_projects for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own projects" on public.family_projects for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Delete own projects" on public.family_projects for delete to authenticated using ((select auth.uid())=user_id);
-- RLS is enabled but must also be confirmed in integration tests using two different test accounts.
-- DO NOT allow anonymous remote writes and DO NOT put service_role keys in browser code.