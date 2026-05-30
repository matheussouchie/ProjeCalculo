# ProjeCalculo

Sistema web para previsao de prazos de detalhamento arquitetonico/interiores com base em historico real de produtividade.

## Versao

- Sprint 1: `1.1` - fundacao Next.js, UI, Supabase e arquitetura base.
- Sprint 2: `1.2` - modelagem relacional PostgreSQL/Supabase.
- Sprint 3: `1.3` - autenticacao completa e app shell protegido.
- Sprint 3.5: branding oficial com favicon, logo e icone.
- Sprint 4: `1.4` - calculadora principal de prazo com cards interativos.
- Sprint 5: `1.5` - motor de previsao isolado da UI.

## Stack

- Next.js App Router, TypeScript e Tailwind CSS
- shadcn/ui como linguagem visual
- React Hook Form e Zod para formularios
- Framer Motion para microinteracoes
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
- `src/lib/algorithm`: funcoes puras do motor matematico de previsao.
- `src/services/prediction`: service de aplicacao usado pela UI e Server Actions.
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
