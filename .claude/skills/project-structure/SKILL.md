---
name: project-structure
description: Project architecture - everything lives in src/, organized in business modules with four layers (domain, application, infrastructure, presentation) plus shared code; where every kind of code goes, the dependency rules, recipes for each kind of implementation and how to create a module. Use before creating, moving or locating any file, and when planning which files a change touches.
---

# Project structure

All source code lives in `src/`. The product is split into **modules**, one per business capability, and every module has the same **four layers**. Code used by every module lives in `src/shared/`. `src/app/` only routes. `src/architecture.test.ts` enforces every rule below on each `npm test` and in CI.

## Map

```
src/
  app/                                   Next.js routes only: pages, layouts, route handlers, globals.css
  modules/<module>/
    domain/                              Business concepts and rules. Pure TypeScript
      <concept>.ts                       Types, entities, value objects and the functions that apply rules
    application/                         What the system does: one use case per action
      use-cases/<verb-noun>.ts           createXxx(dependencies) returns the use case function
      ports.ts                           Interfaces the use cases need (repositories, gateways, AI, clock)
      schemas.ts                         zod schemas for use case inputs and outputs
      errors.ts                          Module errors, extending shared/kernel errors
    infrastructure/                      How it is done: implementations of the ports
      <name>-repository.ts               Postgres implementation of a repository port
      <service>-gateway.ts               External API client implementing a gateway port
      ai/                                AI SDK model, agents, tools and instructions
    presentation/                        What the user sees and touches
      components/                        React components (server by default)
      hooks/                             Client hooks
      actions/                           Server actions ("use server") for forms and mutations
      url-state.ts                       nuqs parsers, loader and serializer for the module screens
    index.ts                             Public API: wires use cases with infrastructure and exports them
  shared/
    ui/                                  shadcn/ui components (shadcn add puts them here)
    ui/ai/                               AiResponse, ChatMessage, TypingIndicator
    ui/layout/                           App shell: header, navigation, page container
    kernel/                              Shared domain primitives: AppError and its subclasses
    http/                                parseJsonBody, errorResponse, withErrorHandling for route handlers
    config/env.ts                        The only reader of process.env, validated with zod
    database/client.ts                   Postgres pool
    database/migrations/                 NNNN-description.sql, applied in order on docker compose up
    ai/stream.ts                         smoothTextStream for every streamed AI response
    utils/                               Generic helpers with no business meaning (cn)
    hooks/                               Generic client hooks
  architecture.test.ts                   The rules of this file, as tests
scripts/                                 Tooling: migrate, read-only db:query and db:explain, check-secrets, check-env, test runner
infra/                                   Terraform modules and Terragrunt units for dev and prod (infrastructure-as-code skill)
```

Unit tests sit next to the file they test (`get-order.ts` → `get-order.test.ts`) and integration tests next to repositories (`*.integration.test.ts`). The end-to-end check is done by Claude in the browser (`test-in-browser`), not written as files. See "Tests" in `code-standards`. Create folders and files on demand; never create empty ones.

## The four layers

| Layer | Answers | Contains | May import |
| --- | --- | --- | --- |
| `domain` | What is true in the business? | Types, entities, value objects, rule functions | Its own module `domain`, `shared/kernel`. No packages, no I/O |
| `application` | What can the system do? | Use cases, ports, input schemas, module errors | Its own `domain` and `application`, `shared/kernel`, `zod` |
| `infrastructure` | How is it done? | Repositories, gateways, AI agents, adapters to other modules | Its own `domain`, `application`, `infrastructure`; `shared/*`; any package; another module's `index.ts` |
| `presentation` | What does the user see? | Components, hooks, server actions, URL state | Its own `domain`, `application`, `presentation` and `index.ts`; `shared/*` except `database`, `config`, `ai`; UI packages |
| `index.ts` | What does the module offer? | Wired use cases and public types | Its own layers except `presentation`; `shared/*` |

## Dependency rules

```
app ──→ modules/<m>/index.ts, modules/<m>/presentation, shared
presentation ──→ application ──→ domain
infrastructure ──→ application (implements ports), domain, shared
```

1. **Dependencies point inward.** `domain` knows nothing else; `application` knows `domain` and declares ports; `infrastructure` implements ports; `presentation` and `app` drive use cases.
2. **Use cases receive their dependencies.** `createGetOrder({ orderRepository })` returns the function. `index.ts` passes the real implementations; tests pass fakes. No `vi.mock` needed for your own code.
3. **`app/` is thin.** A page loads data through the module `index.ts` and renders `presentation` components. A route handler parses input, calls a use case and returns. No rules, SQL or AI calls in `app/`.
4. **Modules talk only through `index.ts`, and only from `infrastructure`.** If `billing` needs customer data, `billing/application/ports.ts` declares `CustomerDirectory` and `billing/infrastructure/customer-directory.ts` implements it by calling `@/modules/customers`. Pages in `app/` may compose several modules.
5. **`shared/` never imports `modules/` or `app/`.**
6. **Only `infrastructure` imports `shared/database`.** All SQL lives in repositories, always parameterized.
7. **Only `shared/config/env.ts` reads `process.env`.** Everything else calls `getServerEnv()`; new variables follow "Configuration" below.
8. **Client components never import a module `index.ts`, `infrastructure`, `shared/database`, `shared/config` or `shared/ai`.** They reach the server through server actions in `presentation/actions/`, route handlers or props.
9. **Server components are the default.** Add `"use client"` only to the smallest component that needs state, effects or browser APIs.
10. **Errors are typed.** Throw `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError` or `UnavailableError` from `shared/kernel/errors.ts` (or a subclass in the module `application/errors.ts`). Route handlers use `withErrorHandling` so each becomes the right HTTP status without leaking details.

## Recipes

| To implement… | Files |
| --- | --- |
| **A business rule** | `domain/<concept>.ts` function + test. Use cases call it |
| **A new action** (create order, approve refund) | `application/schemas.ts` input → `application/use-cases/<verb-noun>.ts` → port in `ports.ts` if it needs I/O → implementation in `infrastructure/` → wire in `index.ts` |
| **Persistence** | Migration `shared/database/migrations/NNNN-create-<table>.sql` (apply with `docker compose exec -T app npm run db:migrate`) → port `<Name>Repository` in `ports.ts` → `infrastructure/<name>-repository.ts` with parameterized SQL. Never edit an applied migration |
| **A page** | `app/<route>/page.tsx` (English, kebab-case, plural: `url-state` skill) → calls `index.ts` → renders `presentation/components/` |
| **A form** | Client form in `presentation/components/` → server action in `presentation/actions/<verb-noun>.ts` that parses with the `application/schemas.ts` schema and calls the use case from `index.ts` → `revalidatePath` or redirect |
| **An API endpoint** | `app/api/<resource>/route.ts`: `withErrorHandling`, `parseJsonBody(request, schema)`, call the use case, `Response.json` |
| **A webhook** | Same as an API endpoint, plus signature verification in an `infrastructure/` adapter; the secret comes from `shared/config/env.ts` |
| **An external service** (payments, email, CRM) | Port `<Name>Gateway` in `ports.ts` → `infrastructure/<service>-gateway.ts` with the provider package → wire in `index.ts`; tests use a fake gateway |
| **A list, search or report over large data** | Filters schema with a maximum page size in `application/schemas.ts` → use case → repository query with indexes in the migration (`database-queries`) → integration test with `countQueries` → `db:explain` |
| **A bulk import** (CSV, spreadsheet, API) | Row schema in `application/schemas.ts` → import use case (validate every row, report rejected lines, upsert by business key in batches) → repository → command in `scripts/` or server action calling the module `index.ts` (`database-queries`, "Bulk imports") |
| **AI chat or agent** | `infrastructure/ai/` (model, agent, tools, instructions; `ai-integration` skill). Tools call use cases with typed filters and small results, never the whole table in the prompt. Route in `app/api/<resource>/route.ts`. Screen in `presentation/components/` with `shared/ui/ai` |
| **Using another module** | Port in your `application/ports.ts`, adapter in your `infrastructure/` calling `@/modules/<other>` |
| **Screen state in the URL** | `presentation/url-state.ts` (`url-state` skill) |
| **Scheduled job** | Use case in the module → `app/api/jobs/<job-name>/route.ts` protected by a secret from `env.ts`, called by the scheduler |
| **Authentication and access** | An `access` or `auth` module: domain rules for who can do what, infrastructure for sessions in signed, `httpOnly` cookies (never in server memory: the app runs as several copies behind a load balancer); other modules declare an `AccessChecker` port. Shared route protection in `app/` layouts or `src/proxy.ts` |
| **A UI piece used by many modules** | `shared/ui/` (shadcn: `docker compose exec app npx shadcn@latest add <name>`) or `shared/ui/layout/` |
| **A generic helper** | `shared/utils/` only if it has no business meaning; otherwise it belongs to a module `domain` |
| **Tests for a feature** | Unit next to domain and use cases; `*.integration.test.ts` next to each repository; the done criteria checked in the browser with `test-in-browser` |
| **A new environment variable** | Schema in `shared/config/env.ts` + a local value in `docker-compose.yml`, or `.env.example` when only the product owner can provide it (see "Configuration") + the value for `dev` and `prod` in `infra/live/<env>/env.hcl` or a secret (`infrastructure-as-code`) |
| **A new cloud resource** (bucket, queue, scheduled job) | Terraform module in `infra/modules/` + units in `infra/live/dev` and `infra/live/prod`, by the `infrastructure-engineer` (`infrastructure-as-code`) |

## Configuration: runs locally with no setup

`docker compose up` must work on a fresh clone with no `.env` and no questions to the product owner. Split every new variable into one of three kinds:

| Kind | Examples | Where its value lives |
| --- | --- | --- |
| **Local value the project can define** | Database URL, ports, model names, feature flags, session secrets for development, seed options | A working development value in `docker-compose.yml` under `app.environment`. Never ask the product owner for these |
| **Value only the product owner can provide** | External API keys and tokens (OpenAI, Stripe, e-mail providers), anything tied to a real account | `.env`, which is never committed; the name goes into `.env.example` with an empty value |
| **Credentials of people** | Admin e-mail and password, any login a person types | `.env` only, chosen by the product owner; the name goes into `.env.example` with an empty value. **Never** in code, tests, seeds, `docker-compose.yml`, documentation, prompts or the conversation, not even for development. Never ask for them and never suggest values |

Rules:

1. Add every variable to the zod schema in `src/shared/config/env.ts`. Local values are required (Compose always provides them); user-provided keys are `.optional()`.
2. The app starts and every screen that does not need a missing key works. Code that needs a user-provided key checks it when used and throws `UnavailableError` (`src/shared/kernel/errors.ts`) with the service name, so only that feature fails, with a clear message. A restricted area whose credentials are missing shows that access is not configured and which variable names to set in `.env`; it never falls back to a default login.
3. Development values in `docker-compose.yml` are for local use only and are documented in `docs/technical/runtime-and-configuration.md` (Environment variables) as values that production must replace.
4. When a feature needs a user-provided key or credential, say so once in your answer: which names to add to `.env`, where to get a key, that the product owner chooses credentials, and to run `docker compose up -d` afterwards so the app reads them. `docker compose exec -T app npm run check:env` lists the names still missing, never the values. Tests use their own fake credentials passed to the use cases, never the real ones.

## Creating a module

1. Name it with the product owner's vocabulary, in English, kebab-case: `orders`, `customer-support`, `billing`.
2. Build inside out: `domain` (concepts and rules, with tests) → `application` (schemas, ports, use cases with fake dependencies in tests) → `infrastructure` (migration, repository, gateways, AI) → `index.ts` (wiring) → `presentation` and the routes in `app/`.
3. Only create the layers and files the module needs. A module without data has no repository; a module without screens has no presentation.
4. The `technical-documenter` creates `docs/technical/modules/<module>.md` and updates the other pages (`technical-docs` skill).

`src/modules/system-status/` is the reference module: a domain rule, a port, a use case with a fake in the test, a Postgres adapter, the wiring in `index.ts`, a presentation component, the page and the `/api/health` route.

## Before saying it is done

- [ ] Every file is in the place the map and the recipes define
- [ ] Use cases receive dependencies; `index.ts` wires them
- [ ] No imports between modules except another module's `index.ts` from `infrastructure`
- [ ] `app/` is thin; SQL only in repositories; `process.env` only in `env.ts`
- [ ] `docker compose up` still works with no `.env`; only user-provided keys go to `.env.example`
- [ ] Database changes come as a new migration
- [ ] Unit tests for rules and use cases, integration tests for repositories
- [ ] Tests pass in the `tester` subagent, including `src/architecture.test.ts`
