-- Sprint 21.3: correção definitiva do schema usado pelas estimativas total_area.
-- Execute manualmente no Supabase SQL Editor do projeto ProjeCalculo.
-- O banco remoto ainda não possui public.projects.calculation_mode (SQLSTATE 42703).

begin;

alter table public.projects
  add column if not exists calculation_mode text;

update public.projects project
set calculation_mode = case
  when exists (
    select 1 from public.project_rooms room where room.project_id = project.id
  ) then 'rooms'
  else 'total_area'
end
where calculation_mode is null;

alter table public.projects
  alter column calculation_mode set default 'rooms';

alter table public.projects
  alter column calculation_mode set not null;

alter table public.projects
  drop constraint if exists projects_calculation_mode_check;

alter table public.projects
  add constraint projects_calculation_mode_check
  check (calculation_mode in ('rooms', 'total_area'));

commit;
