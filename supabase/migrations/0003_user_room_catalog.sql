-- Sprint 11
-- Execute manualmente no Supabase SQL Editor.
-- Objetivo:
-- 1. Criar catalogo de ambientes por usuario.
-- 2. Inserir ambientes padrao automaticamente para novos usuarios.
-- 3. Isolar ambientes por RLS.
-- 4. Permitir que project_rooms referencie o ambiente personalizado usado no calculo.

begin;

create table if not exists public.user_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  complexity_weight numeric(3, 1) not null default 1.0,
  color text,
  is_active boolean not null default true,
  system_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_rooms_name_not_empty check (length(trim(name)) > 0),
  constraint user_rooms_complexity_weight_range check (
    complexity_weight >= 0.5
    and complexity_weight <= 3.0
    and complexity_weight = round(complexity_weight, 1)
  ),
  constraint user_rooms_color_hex check (
    color is null
    or color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

alter table public.project_rooms
  add column if not exists user_room_id uuid references public.user_rooms(id) on delete set null;

create index if not exists user_rooms_user_active_idx
  on public.user_rooms (user_id, is_active, name);

create unique index if not exists user_rooms_user_name_unique_idx
  on public.user_rooms (user_id, lower(name));

create index if not exists project_rooms_user_room_idx
  on public.project_rooms (user_room_id);

alter table public.user_rooms enable row level security;

drop policy if exists "Users can read own rooms" on public.user_rooms;
create policy "Users can read own rooms"
  on public.user_rooms
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own rooms" on public.user_rooms;
create policy "Users can create own rooms"
  on public.user_rooms
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own rooms" on public.user_rooms;
create policy "Users can update own rooms"
  on public.user_rooms
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own rooms" on public.user_rooms;
create policy "Users can delete own rooms"
  on public.user_rooms
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can create rooms in own projects" on public.project_rooms;
create policy "Users can create rooms in own projects"
  on public.project_rooms
  for insert
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = project_rooms.project_id
        and projects.user_id = auth.uid()
    )
    and (
      project_rooms.user_room_id is null
      or exists (
        select 1
        from public.user_rooms
        where user_rooms.id = project_rooms.user_room_id
          and user_rooms.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can update rooms from own projects" on public.project_rooms;
create policy "Users can update rooms from own projects"
  on public.project_rooms
  for update
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_rooms.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = project_rooms.project_id
        and projects.user_id = auth.uid()
    )
    and (
      project_rooms.user_room_id is null
      or exists (
        select 1
        from public.user_rooms
        where user_rooms.id = project_rooms.user_room_id
          and user_rooms.user_id = auth.uid()
      )
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_rooms_updated_at on public.user_rooms;
create trigger set_user_rooms_updated_at
  before update on public.user_rooms
  for each row
  execute function public.set_updated_at();

create or replace function public.seed_default_user_rooms(target_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.user_rooms (
    user_id,
    name,
    description,
    complexity_weight,
    color,
    is_active,
    system_key
  )
  values
    (target_user_id, 'Living', 'Area social principal', 1.4, '#111827', true, 'living'),
    (target_user_id, 'Integrado', 'Ambientes conectados', 1.3, '#2563EB', true, 'integrated'),
    (target_user_id, 'Cozinha', 'Marcenaria e detalhamento tecnico', 1.5, '#7C3AED', true, 'kitchen'),
    (target_user_id, 'Sala de Estar', 'Mobiliario e layout social', 1.2, '#0F766E', true, 'living_room'),
    (target_user_id, 'Quarto', 'Ambiente intimo', 1.1, '#475569', true, 'bedroom'),
    (target_user_id, 'Suite', 'Dormitorio com apoio tecnico', 1.4, '#9333EA', true, 'suite'),
    (target_user_id, 'Banheiro', 'Areas molhadas', 1.6, '#0284C7', true, 'bathroom'),
    (target_user_id, 'Banheiro Social', 'Banheiro de uso comum', 1.5, '#0891B2', true, 'social_bathroom'),
    (target_user_id, 'Lavabo', 'Ambiente compacto', 1.2, '#0D9488', true, 'powder_room'),
    (target_user_id, 'Circulacao', 'Corredores e acessos', 0.6, '#64748B', true, 'circulation'),
    (target_user_id, 'Outro', 'Ambiente personalizado', 1.0, '#52525B', true, 'other')
  on conflict (user_id, (lower(name))) do nothing;
$$;

insert into public.user_rooms (
  user_id,
  name,
  description,
  complexity_weight,
  color,
  is_active,
  system_key
)
select
  profiles.id,
  defaults.name,
  defaults.description,
  defaults.complexity_weight,
  defaults.color,
  true,
  defaults.system_key
from public.profiles
cross join (
  values
    ('Living', 'Area social principal', 1.4::numeric, '#111827', 'living'),
    ('Integrado', 'Ambientes conectados', 1.3::numeric, '#2563EB', 'integrated'),
    ('Cozinha', 'Marcenaria e detalhamento tecnico', 1.5::numeric, '#7C3AED', 'kitchen'),
    ('Sala de Estar', 'Mobiliario e layout social', 1.2::numeric, '#0F766E', 'living_room'),
    ('Quarto', 'Ambiente intimo', 1.1::numeric, '#475569', 'bedroom'),
    ('Suite', 'Dormitorio com apoio tecnico', 1.4::numeric, '#9333EA', 'suite'),
    ('Banheiro', 'Areas molhadas', 1.6::numeric, '#0284C7', 'bathroom'),
    ('Banheiro Social', 'Banheiro de uso comum', 1.5::numeric, '#0891B2', 'social_bathroom'),
    ('Lavabo', 'Ambiente compacto', 1.2::numeric, '#0D9488', 'powder_room'),
    ('Circulacao', 'Corredores e acessos', 0.6::numeric, '#64748B', 'circulation'),
    ('Outro', 'Ambiente personalizado', 1.0::numeric, '#52525B', 'other')
) as defaults(name, description, complexity_weight, color, system_key)
on conflict (user_id, (lower(name))) do nothing;

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
