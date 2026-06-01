-- Sprint 12
-- Execute manualmente no Supabase SQL Editor.
-- Objetivo:
-- 1. Criar preferencias por usuario.
-- 2. Persistir tema claro/escuro.
-- 3. Garantir isolamento total por RLS.
-- 4. Atualizar trigger de novo usuario para criar preferencias iniciais.

begin;

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_theme_check check (theme in ('light', 'dark'))
);

create index if not exists user_preferences_user_idx
  on public.user_preferences (user_id);

alter table public.user_preferences enable row level security;

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own preferences" on public.user_preferences;
create policy "Users can create own preferences"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own preferences" on public.user_preferences;
create policy "Users can delete own preferences"
  on public.user_preferences
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function public.set_updated_at();

insert into public.user_preferences (user_id, theme)
select profiles.id, 'light'
from public.profiles
on conflict (user_id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  baseline_project_id uuid;
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  perform public.seed_default_user_rooms(new.id);

  insert into public.user_preferences (user_id, theme)
  values (new.id, 'light')
  on conflict (user_id) do nothing;

  insert into public.projects (
    user_id,
    name,
    total_square_meters,
    predicted_days,
    actual_days,
    complexity_score,
    completed_at
  )
  values (
    new.id,
    'Historico inicial ProjeCalculo',
    91.4300,
    11,
    11,
    1.0000,
    now()
  )
  returning id into baseline_project_id;

  insert into public.project_rooms (
    project_id,
    user_room_id,
    room_type,
    room_label,
    quantity,
    square_meters,
    weight_used,
    complexity_points
  )
  values
    (baseline_project_id, (select id from public.user_rooms where user_id = new.id and system_key = 'integrated' limit 1), 'integrated', 'Integrado 01', 1, 63.1800, 1.3000, 1.0000),
    (baseline_project_id, (select id from public.user_rooms where user_id = new.id and system_key = 'circulation' limit 1), 'circulation', 'Circulacao 01', 1, 15.1000, 0.6000, 1.0000),
    (baseline_project_id, (select id from public.user_rooms where user_id = new.id and system_key = 'bathroom' limit 1), 'bathroom', 'BWC Casal', 1, 6.6200, 1.6000, 1.0000),
    (baseline_project_id, (select id from public.user_rooms where user_id = new.id and system_key = 'bathroom' limit 1), 'bathroom', 'BWC Filha', 1, 6.5300, 1.6000, 1.0000);

  insert into public.user_statistics (
    user_id,
    average_productivity,
    average_days,
    total_projects,
    average_error_margin
  )
  values (new.id, 8.3118, 11, 1, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

commit;
