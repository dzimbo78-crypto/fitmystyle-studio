-- RUN ONLY in a newly created, dedicated FitMyStyle Supabase project.
-- Mandatory RLS prevents any user from accessing another user's data.
create table if not exists public.user_studio (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint payload_size check (octet_length(payload::text) <= 3000000)
);
alter table public.user_studio enable row level security;
revoke all on public.user_studio from anon;
grant select,insert,update,delete on public.user_studio to authenticated;
create policy "only own user can read" on public.user_studio for select to authenticated using (auth.uid() = user_id);
create policy "only own user can create" on public.user_studio for insert to authenticated with check (auth.uid() = user_id);
create policy "only own user can update" on public.user_studio for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "only own user can delete" on public.user_studio for delete to authenticated using (auth.uid() = user_id);