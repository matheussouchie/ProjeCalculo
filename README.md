# ProjeCalculo

Sistema web para previsao de prazos de detalhamento arquitetonico/interiores com base em historico real de produtividade.

## Versao

- Sprint 1: `1.1` - fundacao Next.js, UI, Supabase e arquitetura base.
- Sprint 2: `1.2` - modelagem relacional PostgreSQL/Supabase.
- Sprint 3: `1.3` - autenticacao completa e app shell protegido.
- Sprint 3.5: branding oficial com favicon, logo e icone.
- Sprint 4: `1.4` - calculadora principal de prazo com cards interativos.
- Sprint 5: `1.5` - motor de previsao isolado da UI.
- Sprint 6: `1.6` - registro de projeto concluido para atualizar produtividade.
- Sprint 6.5: metragem total editavel na calculadora com redistribuicao proporcional.
- Sprint 7: `1.7` - aprendizado dinamico com peso maior para projetos recentes.
- Sprint 8: `1.8` - dashboard analitico, graficos, historico e configuracoes.
- Sprint 9: `1.9` - ambientes individualizados e metragens com 4 casas decimais.
- Sprint 10: `1.10` - gerenciador de estimativas salvas.
- Sprint 11: `1.11` - catalogo de ambientes por usuario com pesos personalizados.
- Sprint 12: `1.12` - preferencias, tema persistido e sessao nao persistente.

## Stack

- Next.js App Router, TypeScript e Tailwind CSS
- shadcn/ui como linguagem visual
- React Hook Form e Zod para formularios
- Framer Motion para microinteracoes
- Recharts para visualizacoes analiticas
- Supabase Auth e PostgreSQL
- Prettier e ESLint para qualidade
- Deploy preparado para Vercel

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

1. Crie um projeto no Supabase.
2. Rode a migration `supabase/migrations/0001_initial_schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Sem as variaveis do Supabase, o calculo continua funcionando, mas o historico nao e persistido.

## Arquitetura

- `src/services/project-estimation.service.ts`: regra de negocio do algoritmo inicial.
- `src/services/user-statistics.service.ts`: adaptacao das estatisticas do banco para produtividade.
- `src/lib/schemas.ts`: validacoes Zod compartilhadas.
- `src/constants/initial-history.ts`: historico inicial de produtividade.
- `src/types`: tipos centrais do dominio e do banco.
- `src/app/actions`: Server Actions para calculo, persistencia e auth.
- `src/components`: UI componentizada e reutilizavel.
- `src/components/app`: shell permanente, sidebar, header e estrutura protegida.
- `src/components/auth`: formularios de login, cadastro e recuperacao de senha.
- `src/components/calculator`: calculadora principal com cards, resumo e resultado.
- `src/components/completed-project`: fluxo para registrar entregas concluidas.
- `src/components/analytics`: cards, graficos, historico e empty/loading states.
- `src/components/settings`: ajustes de perfil e workspace.
- `src/lib/algorithm`: funcoes puras do motor matematico de previsao.
- `src/services/prediction`: service de aplicacao usado pela UI e Server Actions.
- `src/services/analytics`: leitura e preparacao das metricas analiticas.
- `src/services/estimates`: leitura e mapeamento de estimativas salvas.
- `src/services/rooms`: geracao de nomes de ambientes individualizados.
- `src/services/user-rooms`: catalogo de ambientes por usuario.
- `src/services/user-preferences`: preferencias persistidas do usuario.
- `src/services/project-area-adjustment.ts`: redistribui metragens para fechar um total informado.
- `src/hooks`: hooks reutilizaveis de interface.
- `src/utils`: utilitarios puros.

## Modelagem Sprint 2

- `profiles`: identidade publica do usuario ligada ao Supabase Auth.
- `projects`: projetos estimados/concluidos por usuario.
- `project_rooms`: ambientes detalhados de cada projeto.
- `user_statistics`: produtividade media, prazo medio, total de projetos e margem de erro.

O trigger `handle_new_user` cria perfil, estatisticas e o primeiro historico automatico:

- Integrado: 63.18 m2
- Circulacao: 15.10 m2
- BWC Casal: 6.62 m2
- BWC Filha: 6.53 m2
- Total: 91.43 m2 em 11 dias corridos

## Auth Sprint 3

- `/login`: entrada com email e senha.
- `/signup`: cadastro com nome, email e senha.
- `/recover-password`: envio de email para recuperacao.
- `/reset-password`: definicao de nova senha apos callback do Supabase.
- `/dashboard`, `/calcular-prazo`, `/projetos`, `/estatisticas`, `/configuracoes`: rotas protegidas dentro do app shell.
- `/registrar-projeto-concluido`: fluxo protegido para ensinar o sistema com projetos finalizados.

## Motor Sprint 5

A UI nao conhece a formula. Componentes chamam apenas `src/services/prediction`.

Formula base:

```text
complexidade_total = soma(metragem_do_ambiente * peso_do_ambiente)
dias_previstos = complexidade_total / produtividade_media
```

Regras aplicadas:

- minimo de 1 dia;
- arredondamento inteligente para prazos curtos;
- fallback com produtividade inicial quando nao houver historico;
- outliers extremos removidos antes de calcular produtividade historica;
- pesos por ambiente mantidos em `src/lib/algorithm/weights.ts`.
- media movel ponderada: projetos recentes representam 70% e antigos 30%;
- normalizacao limita saltos bruscos de produtividade.

## Sprint 6

O fluxo "Registrar Projeto Concluído" grava:

- nome do projeto;
- ambientes e metragens;
- quantidade por ambiente;
- dias corridos reais.

Ao salvar, o projeto entra como concluído em `projects`, os ambientes entram em
`project_rooms` e o trigger do Supabase recalcula `user_statistics`.

## Sprint 8

O dashboard analitico exibe:

- produtividade media;
- precisao historica;
- erro percentual medio;
- tempo medio dos projetos;
- evolucao da produtividade;
- historico de projetos.

As abas finais do SaaS permanecem enxutas: Dashboard, Calcular Prazo, Projetos,
Estatisticas e Configuracoes.

## Sprint 9 e Sprint 10

A migration `supabase/migrations/0002_room_instances_and_saved_estimates.sql`
deve ser executada manualmente no Supabase SQL Editor.

- `project_rooms.room_label` representa o nome individual do ambiente.
- `projects.total_square_meters`, `projects.complexity_score` e
  `project_rooms.square_meters` passam a aceitar 4 casas decimais.
- `projects.updated_at` permite listar estimativas por ultima alteracao.
- Estimativas salvas usam `projects.actual_days is null`.
- O usuario pode salvar, editar, duplicar e excluir estimativas em
  `/calcular-prazo`.

## Sprint 11 e Sprint 12

As migrations abaixo devem ser executadas manualmente no Supabase SQL Editor:

- `supabase/migrations/0003_user_room_catalog.sql`
- `supabase/migrations/0004_user_preferences.sql`

Sprint 11 cria `user_rooms`, insere ambientes padrao por usuario e permite usar
pesos personalizados no algoritmo.

Sprint 12 cria `user_preferences`, persiste tema claro/escuro, adiciona toggle
Sol/Lua no header e configura a sessao para nao persistir no navegador.
