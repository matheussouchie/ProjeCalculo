-- Sprint 15
-- Execute manualmente no Supabase SQL Editor.
-- Objetivo:
-- 1. Associar projetos concluídos a estimativas salvas.
-- 2. Garantir que a estimativa relacionada pertença ao mesmo usuário.
-- 3. Manter isolamento por RLS já existente.

begin;

alter table public.projects
  add column if not exists prediction_id uuid references public.projects(id) on delete set null;

create index if not exists projects_prediction_id_idx
  on public.projects (prediction_id);

create or replace function public.validate_project_prediction_owner()
returns trigger
language plpgsql
as $$
declare
  linked_user_id uuid;
begin
  if new.prediction_id is null then
    return new;
  end if;

  select user_id
  into linked_user_id
  from public.projects
  where id = new.prediction_id;

  if linked_user_id is null then
    raise exception 'Estimativa relacionada não encontrada.';
  end if;

  if linked_user_id <> new.user_id then
    raise exception 'A estimativa relacionada deve pertencer ao mesmo usuário.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_project_prediction_owner_trigger on public.projects;
create trigger validate_project_prediction_owner_trigger
  before insert or update on public.projects
  for each row
  execute function public.validate_project_prediction_owner();

commit;
