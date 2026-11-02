-- APPLY ONLY TO A DEDICATED FITMYSTYLE SUPABASE PROJECT. NOT B-CORE.
-- This migration does not activate login or data upload in the static guest app.
-- Body measurements are personal data. For children, use an adult account, suitable notices and minimal retention.
create extension if not exists pgcrypto;
create table if not exists public.family_measurement_sets (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid null references public.family_projects(id) on delete set null,
 title text not null check (char_length(title) between 1 and 120),
 people jsonb not null check (jsonb_typeof(people)='array' and jsonb_array_length(people) between 1 and 8 and octet_length(people::text) < 130000),
 cloud_storage_consent_at timestamptz not null,
 revision integer not null default 1 check (revision between 1 and 9999),
 status text not null default 'draft' check (status in ('draft','awaiting-review','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_family_measurement_sets_owner on public.family_measurement_sets(owner_id,updated_at desc);
create or replace function public.touch_family_measurements() returns trigger language plpgsql set search_path=public as $$begin new.updated_at=now();return new;end;$$;
drop trigger if exists trg_family_measurements_updated on public.family_measurement_sets;
create trigger trg_family_measurements_updated before update on public.family_measurement_sets
 for each row execute function public.touch_family_measurements();
alter table public.family_measurement_sets enable row level security;
revoke all on public.family_measurement_sets from anon, authenticated;
grant select,insert,update,delete on public.family_measurement_sets to authenticated;
drop policy if exists "measurements_read_own" on public.family_measurement_sets;
create policy "measurements_read_own" on public.family_measurement_sets for select to authenticated
 using (owner_id=(select auth.uid()));
drop policy if exists "measurements_insert_own" on public.family_measurement_sets;
create policy "measurements_insert_own" on public.family_measurement_sets for insert to authenticated
 with check (owner_id=(select auth.uid()) and cloud_storage_consent_at<=now() and status='draft');
drop policy if exists "measurements_update_own" on public.family_measurement_sets;
create policy "measurements_update_own" on public.family_measurement_sets for update to authenticated
 using (owner_id=(select auth.uid()))
 with check (owner_id=(select auth.uid()) and cloud_storage_consent_at<=now() and status in ('draft','archived'));
drop policy if exists "measurements_delete_own" on public.family_measurement_sets;
create policy "measurements_delete_own" on public.family_measurement_sets for delete to authenticated
 using (owner_id=(select auth.uid()));
-- Future implementation must separately implement: explicit consent UI for cloud storage,
-- account export/delete requests, short retention for generated documents, owner authorization,
-- privacy notices, and verification against two distinct authenticated Supabase test users.
-- Do not expose service_role to browser; no external manufacture submission without separate opt-in.