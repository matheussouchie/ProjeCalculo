-- Sprint 21: dois modos de cálculo de prazo.
-- Execute manualmente no Supabase SQL Editor.
begin;

alter table public.projects
  add column if not exists calculation_mode text;

update public.projects p
set calculation_mode = case
  when exists (select 1 from public.project_rooms pr where pr.project_id = p.id) then 'rooms'
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
