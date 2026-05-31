-- Sprint 9 + Sprint 10
-- Execute manualmente no Supabase SQL Editor.
-- Objetivo:
-- 1. Tratar cada ambiente como instancia individual com room_label.
-- 2. Aumentar precisao de metragens para ate 4 casas decimais.
-- 3. Preparar estimativas salvas com updated_at, indices e nomes unicos por usuario.

begin;

alter table public.projects
  alter column total_square_meters type numeric(12, 4),
  alter column complexity_score type numeric(12, 4);

alter table public.projects
  add column if not exists updated_at timestamptz not null default now();

alter table public.project_rooms
  add column if not exists room_label text;

alter table public.project_rooms
  alter column square_meters type numeric(12, 4),
  alter column weight_used type numeric(10, 4),
  alter column complexity_points type numeric(12, 4);

with numbered_rooms as (
  select
    id,
    initcap(replace(room_type, '_', ' ')) || ' ' ||
      lpad(row_number() over (
        partition by project_id, room_type
        order by id
      )::text, 2, '0') as generated_label
  from public.project_rooms
  where room_label is null
)
update public.project_rooms
set room_label = numbered_rooms.generated_label
from numbered_rooms
where project_rooms.id = numbered_rooms.id;

alter table public.project_rooms
  alter column room_label set not null;

alter table public.project_rooms
  drop constraint if exists project_rooms_room_label_not_empty;

alter table public.project_rooms
  add constraint project_rooms_room_label_not_empty
  check (length(trim(room_label)) > 0);

create index if not exists project_rooms_project_type_idx
  on public.project_rooms (project_id, room_type);

create index if not exists projects_user_estimates_updated_idx
  on public.projects (user_id, updated_at desc)
  where actual_days is null;

with duplicate_estimates as (
  select
    id,
    name,
    row_number() over (
      partition by user_id, lower(name)
      order by created_at, id
    ) as duplicate_position
  from public.projects
  where actual_days is null
)
update public.projects
set name = duplicate_estimates.name || ' ' ||
  lpad(duplicate_estimates.duplicate_position::text, 3, '0')
from duplicate_estimates
where projects.id = duplicate_estimates.id
  and duplicate_estimates.duplicate_position > 1;

create unique index if not exists projects_user_estimate_name_unique_idx
  on public.projects (user_id, lower(name))
  where actual_days is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_rooms enable row level security;
alter table public.user_statistics enable row level security;

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
    room_type,
    room_label,
    quantity,
    square_meters,
    weight_used,
    complexity_points
  )
  values
    (baseline_project_id, 'integrated', 'Integrado 01', 1, 63.1800, 1.1800, 1.0000),
    (baseline_project_id, 'circulation', 'Circulacao 01', 1, 15.1000, 0.7500, 0.9000),
    (baseline_project_id, 'bathroom', 'BWC Casal', 1, 6.6200, 1.3500, 1.0000),
    (baseline_project_id, 'bathroom', 'BWC Filha', 1, 6.5300, 1.3500, 1.0000);

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
