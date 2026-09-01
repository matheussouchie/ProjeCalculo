-- Prazos curtos usam incrementos de meio dia no algoritmo de previsao.
-- Mantemos dias realizados inteiros, mas a previsao precisa aceitar uma casa decimal.

begin;

alter table public.projects
  alter column predicted_days type numeric(6, 1)
  using predicted_days::numeric(6, 1);

commit;
