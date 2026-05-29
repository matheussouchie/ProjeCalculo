# ProjeCalculo

Sistema web para previsao de prazos de detalhamento arquitetonico/interiores com base em historico real de produtividade.

## Versao

- Sprint 1: `1.1` - fundacao Next.js, UI, Supabase e arquitetura base.
- Sprint 2: `1.2` - modelagem relacional PostgreSQL/Supabase.

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
