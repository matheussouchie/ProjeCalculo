# OnTime²

Sistema web para previsao de prazos de detalhamento arquitetonico/interiores com base em historico real de produtividade.

## Versao

- Marco 1: `1.1` - fundacao Next.js, UI, Supabase e arquitetura base.
- Marco 2: `1.2` - modelagem relacional PostgreSQL/Supabase.
- Marco 3: `1.3` - autenticacao completa e app shell protegido.
- Marco 3.5: branding oficial com favicon, logo e icone.
- Marco 4: `1.4` - calculadora principal de prazo com cards interativos.
- Marco 5: `1.5` - motor de previsao isolado da UI.
- Marco 6: `1.6` - registro de projeto concluido para atualizar produtividade.
- Marco 6.5: metragem total editavel na calculadora com redistribuicao proporcional.
- Marco 7: `1.7` - aprendizado dinamico com peso maior para projetos recentes.
- Marco 8: `1.8` - dashboard analitico, graficos, historico e configuracoes.
- Marco 9: `1.9` - ambientes individualizados e metragens com 4 casas decimais.
- Marco 10: `1.10` - gerenciador de estimativas salvas.
- Marco 11: `1.11` - catalogo de ambientes por usuario com pesos personalizados.
- Marco 12: `1.12` - preferencias, tema persistido e sessao nao persistente.
- Marco 13: `1.13` - autosave global, rascunhos recuperaveis e notificacoes.
- Marco 14: `1.14` - confirmacao profissional de cadastro via email.
- Marco 15: `1.15` - acoes em projetos e associacao de estimativas concluidas.

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
NEXT_PUBLIC_SITE_URL=
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
- `src/services/drafts`: leitura e mapeamento dos rascunhos de autosave.
- `src/services/project-area-adjustment.ts`: redistribui metragens para fechar um total informado.
- `src/hooks`: hooks reutilizaveis de interface.
- `src/utils`: utilitarios puros.
- `src/lib/site-url.ts`: resolve a URL base do app para callbacks e emails.

## Modelagem Marco 2

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

## Auth Marco 3

- `/login`: entrada com email e senha.
- `/signup`: cadastro com nome, email e senha.
- `/recover-password`: envio de email para recuperacao.
- `/reset-password`: definicao de nova senha apos callback do Supabase.
- `/dashboard`, `/calcular-prazo`, `/projetos`, `/estatisticas`, `/configuracoes`: rotas protegidas dentro do app shell.
- `/registrar-projeto-concluido`: fluxo protegido para ensinar o sistema com projetos finalizados.

## Motor Marco 5

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

## Marco 6

O fluxo "Registrar Projeto Concluído" grava:

- nome do projeto;
- ambientes e metragens;
- quantidade por ambiente;
- dias corridos reais.

Ao salvar, o projeto entra como concluído em `projects`, os ambientes entram em
`project_rooms` e o trigger do Supabase recalcula `user_statistics`.

## Marco 8

O dashboard analitico exibe:

- produtividade media;
- precisao historica;
- erro percentual medio;
- tempo medio dos projetos;
- evolucao da produtividade;
- historico de projetos.

As abas finais do SaaS permanecem enxutas: Dashboard, Calcular Prazo, Projetos,
Estatisticas e Configuracoes.

## Marco 9 e Marco 10

A migration `supabase/migrations/0002_room_instances_and_saved_estimates.sql`
deve ser executada manualmente no Supabase SQL Editor.

- `project_rooms.room_label` representa o nome individual do ambiente.
- `projects.total_square_meters`, `projects.complexity_score` e
  `project_rooms.square_meters` passam a aceitar 4 casas decimais.
- `projects.updated_at` permite listar estimativas por ultima alteracao.
- Estimativas salvas usam `projects.actual_days is null`.
- O usuario pode salvar, editar, duplicar e excluir estimativas em
  `/calcular-prazo`.

## Marco 11 e Marco 12

As migrations abaixo devem ser executadas manualmente no Supabase SQL Editor:

- `supabase/migrations/0003_user_room_catalog.sql`
- `supabase/migrations/0004_user_preferences.sql`

Marco 11 cria `user_rooms`, insere ambientes padrao por usuario e permite usar
pesos personalizados no algoritmo.

Marco 12 cria `user_preferences`, persiste tema claro/escuro, adiciona toggle
Sol/Lua no header e configura a sessao para nao persistir no navegador.

## Marco 13

A migration `supabase/migrations/0005_drafts_autosave.sql` deve ser executada
manualmente no Supabase SQL Editor.

- `drafts`: rascunhos por usuario, tela e entidade.
- Autosave local imediato com sincronizacao no Supabase apos 3 segundos sem
  digitacao.
- Recuperacao de rascunho em `/calcular-prazo` e
  `/registrar-projeto-concluido`.
- Aviso offline e notificacoes padronizadas por tom: sucesso, erro, aviso e
  informacao.

## Marco 14

- `/auth/confirm`: confirmacao profissional de cadastro via email.
- `NEXT_PUBLIC_SITE_URL`: base dinamica usada em redirects do Supabase Auth.
- O signup envia o usuario para `/auth/confirm`, evitando cair em `localhost`
  sem contexto.

## Marco 15

- `/projetos`: edicao, duplicacao e exclusao com acoes visiveis.
- `/registrar-projeto-concluido`: associacao opcional de estimativa salva.
- `projects.prediction_id`: relacao para comparar previsao e resultado real.
