# Project structure

The complete folder tree of the repository, with what each folder and file holds. The rules for where new files go are in the `project-structure` skill and are enforced by `src/architecture.test.ts`; this page shows what exists today. Generated folders (`node_modules/`, `.next/`) and files ignored by git are left out.

## Top level

```
.
├── .claude/                       Claude Code setup for this project
│   ├── agents/                    Subagents, one file each, with model and effort
│   ├── skills/                    Skills: workflow (setup-project, new-feature, ...) and standards (code-standards, ...)
│   ├── launch.json                Starts the app (docker compose up) in the built-in browser of the Claude desktop app
│   └── settings.json              Permissions: commands Claude may run alone, and what is denied
├── .github/workflows/ci.yml       CI: types, unit tests, secret scan, integration tests
├── docs/
│   ├── technical/                 This documentation (English)
│   └── business/                  Business documentation in en and pt-BR (created with the first feature)
├── scripts/                       Node tooling run inside the app container (migrations, checks, test runner)
├── src/                           All application source code (see below)
├── .env.example                   Names of keys only the product owner can provide; empty means none needed
├── .gitignore                     Keeps .env, build output and dependencies out of git
├── .mcp.json                      Headless Playwright browser in Docker, used when the built-in browser is not available
├── .nvmrc                         Node.js major version used by CI
├── AGENTS.md                      Written by next dev: points agents to the docs of the installed Next.js version
├── CLAUDE.md                      Product context, rules and workflow, read by Claude in every conversation
├── README.md                      How to run the project and work with Claude
├── components.json                shadcn/ui settings: where generated components and utilities go
├── docker-compose.yml             The db and app services, with local values for every setting
├── next.config.ts                 Next.js settings (allowed dev origins for the headless browser)
├── package.json                   Dependencies, pinned versions and npm scripts
├── postcss.config.mjs             Tailwind CSS through PostCSS
├── tsconfig.json                  Strict TypeScript; the @/ alias points to src/
├── vitest.config.ts               Unit tests: src/**/*.test.ts and scripts/*.test.ts
└── vitest.integration.config.ts   Integration tests: src/**/*.integration.test.ts against the real database
```

## src/

```
src/
├── app/                                      Next.js routes only: pages, layouts, route handlers
│   ├── api/health/route.ts                   GET /api/health, app and database status
│   ├── globals.css                           Tailwind, theme tokens (light and dark), typeface, reduced motion
│   ├── layout.tsx                            Root layout: language, metadata, NuqsAdapter
│   └── page.tsx                              Home page: system status card
├── modules/                                  One folder per business capability
│   └── system-status/                        Reference module (see modules/system-status.md)
│       ├── domain/
│       │   ├── system-status.ts              SystemStatus type, buildSystemStatus, isSystemHealthy
│       │   └── system-status.test.ts
│       ├── application/
│       │   ├── ports.ts                      DatabaseProbe port
│       │   └── use-cases/
│       │       ├── get-system-status.ts      createGetSystemStatus({ databaseProbe })
│       │       └── get-system-status.test.ts
│       ├── infrastructure/
│       │   ├── postgres-database-probe.ts    DatabaseProbe implemented with SELECT 1
│       │   └── postgres-database-probe.integration.test.ts
│       ├── presentation/components/
│       │   └── system-status-card.tsx        Status card shown on the home page
│       └── index.ts                          Public API: wired getSystemStatus, isSystemHealthy, SystemStatus
├── shared/                                   Code used by every module, with no business rules
│   ├── ai/stream.ts                          smoothTextStream for every streamed AI answer
│   ├── config/env.ts                         getServerEnv: the only reader of process.env, validated with zod
│   ├── database/
│   │   ├── client.ts                         getPool: one shared pg pool
│   │   └── migrations/                       NNNN-description.sql files, applied in order
│   ├── http/responses.ts                     parseJsonBody, errorResponse, withErrorHandling
│   ├── kernel/errors.ts                      AppError and ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, UnavailableError
│   ├── ui/                                   shadcn/ui components: badge, button, card, input, label, skeleton, table, textarea
│   │   ├── ai/                               AiResponse, ChatComposer, ChatMessage, ChatPanel, TypingIndicator, toChatPanelMessages
│   │   └── layout/                           AppShell, PageHeader, EmptyState
│   └── utils/cn.ts                           cn: merges Tailwind classes
└── architecture.test.ts                      The structure, naming and no-comments rules, as tests
```

Test files sit next to the file they test (`*.test.ts` for unit, `*.integration.test.ts` for integration) and are listed above only inside the module, as an example.

## scripts/

```
scripts/
├── check-env.mjs           Lists keys from .env.example missing in the environment (names only)
├── check-secrets.mjs       Looks for API keys, tokens and private keys in tracked files
├── migrate.mjs             Applies pending SQL migrations and records them in schema_migrations
├── test-integration.mjs    Recreates app_test, applies migrations and runs the integration tests
└── *.d.mts, *.test.ts      Types for the TypeScript tests, and the tests of each script
```

## Where new things go

| Adding | Goes to |
| --- | --- |
| A business capability | `src/modules/<module>/` with the layers it needs, and `docs/technical/modules/<module>.md` |
| A page or API route | `src/app/`, calling the module `index.ts` |
| A table | a new `src/shared/database/migrations/NNNN-description.sql` |
| A shared UI piece | `src/shared/ui/` (shadcn) or `src/shared/ui/layout/` |
| A setting | `src/shared/config/env.ts` plus a local value in `docker-compose.yml`, or `.env.example` for user-provided keys |

Related: [architecture](architecture.md) · [testing and quality](testing-and-quality.md)
