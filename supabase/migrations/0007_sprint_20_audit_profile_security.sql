-- Sprint 20 - Auditoria, isolamento por usuario, perfil e Storage de avatares
-- Execute manualmente no Supabase SQL Editor.

begin;

alter table public.profiles
  add column if not exists avatar_path text;

alter table public.profiles
  drop constraint if exists profiles_avatar_path_owner_check;

alter table public.profiles
  add constraint profiles_avatar_path_owner_check
  check (
    avatar_path is null
    or avatar_path ~ ('^' || id::text || '/[^/]+[.](jpg|png|webp)$')
  );

-- Mantem o perfil isolado pelo mesmo id do usuario autenticado.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Mantem uma consulta eficiente para listagens do usuario autenticado.
create index if not exists projects_user_completion_idx
  on public.projects (user_id, completed_at desc, created_at desc);

-- Impede associar um projeto concluido a uma estimativa de outro usuario
-- ou a outro projeto concluido.
create or replace function public.validate_project_prediction_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_user_id uuid;
  linked_actual_days integer;
begin
  if new.prediction_id is null then
    return new;
  end if;

  select user_id, actual_days
  into linked_user_id, linked_actual_days
  from public.projects
  where id = new.prediction_id;

  if linked_user_id is null then
    raise exception 'Estimativa relacionada não encontrada.';
  end if;

  if linked_user_id <> new.user_id then
    raise exception 'A estimativa relacionada deve pertencer ao mesmo usuário.';
  end if;

  if linked_actual_days is not null then
    raise exception 'A relação deve apontar para uma estimativa ainda não concluída.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_project_prediction_owner_trigger on public.projects;
create trigger validate_project_prediction_owner_trigger
  before insert or update of prediction_id, user_id on public.projects
  for each row
  execute function public.validate_project_prediction_owner();

-- Bucket publico apenas para leitura das imagens exibidas na interface.
-- O upload, alteracao e exclusao continuam restritos a pasta do proprio usuario.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

commit;
