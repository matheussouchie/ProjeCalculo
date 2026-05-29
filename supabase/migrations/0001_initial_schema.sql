create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Projeto sem nome',
  total_square_meters numeric(10, 2) not null check (total_square_meters > 0),
  predicted_days integer not null check (predicted_days > 0),
  actual_days integer check (actual_days > 0),
  complexity_score numeric(10, 2) not null default 1,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.project_rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_type text not null,
  quantity integer not null default 1 check (quantity > 0),
  square_meters numeric(10, 2) not null check (square_meters > 0),
  weight_used numeric(10, 4) not null default 1,
  complexity_points numeric(10, 4) not null default 1
);

create table if not exists public.user_statistics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  average_productivity numeric(10, 4) not null default 8.3118,
  average_days numeric(10, 2) not null default 11,
  total_projects integer not null default 1 check (total_projects >= 0),
  average_error_margin numeric(10, 4) not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists projects_user_created_idx on public.projects (user_id, created_at desc);
create index if not exists projects_user_completed_idx on public.projects (user_id, completed_at desc);
create index if not exists project_rooms_project_idx on public.project_rooms (project_id);
create index if not exists user_statistics_user_idx on public.user_statistics (user_id);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_rooms enable row level security;
alter table public.user_statistics enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own projects"
  on public.projects
  for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects
  for delete
  using (auth.uid() = user_id);

create policy "Users can read rooms from own projects"
  on public.project_rooms
  for select
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_rooms.project_id
        and projects.user_id = auth.uid()
    )
  );

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
  );

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
  );

create policy "Users can delete rooms from own projects"
  on public.project_rooms
  for delete
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_rooms.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can read own statistics"
  on public.user_statistics
  for select
  using (auth.uid() = user_id);

create policy "Users can update own statistics"
  on public.user_statistics
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_statistics_updated_at on public.user_statistics;
create trigger set_user_statistics_updated_at
  before update on public.user_statistics
  for each row
  execute function public.set_updated_at();

create or replace function public.refresh_user_statistics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  target_user_id := coalesce(new.user_id, old.user_id);

  insert into public.user_statistics (
    user_id,
    average_productivity,
    average_days,
    total_projects,
    average_error_margin
  )
  select
    target_user_id,
    coalesce(avg(total_square_meters / nullif(actual_days, 0)), 8.3118),
    coalesce(avg(actual_days), 11),
    count(*),
    coalesce(avg(abs(actual_days - predicted_days)::numeric / nullif(predicted_days, 0)), 0)
  from public.projects
  where user_id = target_user_id
    and actual_days is not null
  on conflict (user_id)
  do update set
    average_productivity = excluded.average_productivity,
    average_days = excluded.average_days,
    total_projects = excluded.total_projects,
    average_error_margin = excluded.average_error_margin,
    updated_at = now();

  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_user_statistics_on_project_change on public.projects;
create trigger refresh_user_statistics_on_project_change
  after insert or update of actual_days, completed_at or delete on public.projects
  for each row
  execute function public.refresh_user_statistics();

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
    91.43,
    11,
    11,
    1,
    now()
  )
  returning id into baseline_project_id;

  insert into public.project_rooms (
    project_id,
    room_type,
    quantity,
    square_meters,
    weight_used,
    complexity_points
  )
  values
    (baseline_project_id, 'integrated', 1, 63.18, 1.18, 1),
    (baseline_project_id, 'circulation', 1, 15.10, 0.75, 0.9),
    (baseline_project_id, 'bathroom', 1, 6.62, 1.35, 1),
    (baseline_project_id, 'bathroom', 1, 6.53, 1.35, 1);

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
