-- Sprint 13
-- Execute manualmente no Supabase SQL Editor.
-- Objetivo:
-- 1. Criar rascunhos por usuario para autosave global.
-- 2. Persistir payloads de formulario em JSONB.
-- 3. Garantir isolamento total por RLS.
-- 4. Manter um rascunho ativo por usuario/escopo/entidade.

begin;

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drafts_scope_not_empty check (length(trim(scope)) > 0),
  constraint drafts_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists drafts_user_updated_idx
  on public.drafts (user_id, updated_at desc);

create index if not exists drafts_user_scope_idx
  on public.drafts (user_id, scope);

create unique index if not exists drafts_user_scope_entity_unique_idx
  on public.drafts (user_id, scope, coalesce(entity_id, '00000000-0000-0000-0000-000000000000'::uuid));

alter table public.drafts enable row level security;

drop policy if exists "Users can read own drafts" on public.drafts;
create policy "Users can read own drafts"
  on public.drafts
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own drafts" on public.drafts;
create policy "Users can create own drafts"
  on public.drafts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own drafts" on public.drafts;
create policy "Users can update own drafts"
  on public.drafts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own drafts" on public.drafts;
create policy "Users can delete own drafts"
  on public.drafts
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

drop trigger if exists set_drafts_updated_at on public.drafts;
create trigger set_drafts_updated_at
  before update on public.drafts
  for each row
  execute function public.set_updated_at();

commit;
