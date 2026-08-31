-- Sprint 20 - Correcoes apontadas pelos advisors de seguranca Supabase
-- Execute manualmente no Supabase SQL Editor.

begin;

alter function public.set_updated_at()
  set search_path = public;

revoke execute on function public.handle_new_user()
  from public, anon, authenticated;

revoke execute on function public.refresh_user_statistics()
  from public, anon, authenticated;

revoke execute on function public.seed_default_user_rooms(uuid)
  from public, anon, authenticated;

revoke execute on function public.validate_project_prediction_owner()
  from public, anon, authenticated;

commit;
