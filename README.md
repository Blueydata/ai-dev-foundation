# Dev Foundation

A foundation to start building any kind of software with AI. It ships the technical base already running and Claude configured to work with a process — architecture, standards, skills, subagents, tests, CI and documentation — but no product built in: you define what the software does, one feature at a time.

## What is included

| Piece | Where | Purpose |
| --- | --- | --- |
| Architecture | `src/` | Business modules with four layers (domain, application, infrastructure, presentation) plus shared code, with the rules checked by a test, so Claude always knows where each thing goes |
| Application | `src/app/`, `src/shared/` | Next.js connected to a Postgres database |
| Migrations | `src/shared/database/migrations/` | SQL files applied in order, automatically when the app starts (cloud session, `docker compose up` or the Vercel build) |
| UI | `src/app/globals.css`, `src/shared/ui/` | Tailwind CSS, shadcn/ui and Motion, with ready-made layouts (admin shell, page header, empty state) and a complete AI chat panel; the brand in `CLAUDE.md` sets the colors |
| URL state | module `presentation/url-state.ts` | nuqs: every URL reflects exactly what is on screen |
| AI | `src/shared/ai/`, `src/shared/ui/ai/` | Vercel AI SDK for LLMs and agents, with streamed responses and animated text |
| Cloud sessions | `.claude/hooks/session-start.sh`, `scripts/cloud-setup.sh` | In Claude Code on the web, each session installs Postgres, applies migrations and starts the app on its own, with nothing installed on your computer |
| Docker Compose | `docker-compose.yml` | The option on a computer: starts the database and the app with one command |
| Claude context | `CLAUDE.md` | The product, the rules and the workflow |
| Permissions | `.claude/settings.json` | What Claude can do on its own and what is blocked |
| Workflow skills | `.claude/skills/` | `/setup-project`, `/new-feature`, `/adjust-feature`, `/fix-bug`, `/test-in-browser`, `/deliver` and `/deploy` |
| Standards skills | `.claude/skills/` | `project-structure`, `code-standards`, `ui-standards`, `url-state`, `database-queries`, `ai-integration` and `technical-docs`, which Claude follows on its own |
| Subagents | `.claude/agents/` | Four specialists (`explorer`, `tester`, `reviewer`, `documenter`), each with its own model and effort level |
| Data at scale | `database-queries` skill, `scripts/db-query.mjs`, `src/shared/database/query-counter.ts` | Rules for queries that stay fast with large data, AI that answers plain-language questions through typed tools, and the tools to prove it: read-only `db:query` and `db:explain`, and N+1 tests |
| Deploy | `deploy` skill, `package.json` (`vercel-build`) | Vercel and Neon on free plans: Claude publishes with the pinned Vercel CLI (`npm run vercel`): a preview from the work branch, production from `main`, migrations applied on build; no infrastructure code to maintain |
| Documentation | `docs/` | Technical in English, complete from day one: overview, folder tree, architecture, module pages, data model, API, runtime, testing, security, AI and UI, with Mermaid diagrams (start at `docs/technical/README.md`). Business in English and Brazilian Portuguese, created with the first feature. Both grow with every delivery |
| Tests | `*.test.ts`, `*.integration.test.ts`, `.claude/launch.json` | Unit tests, integration tests against the real database, and the end-to-end check: at the end of each feature Claude uses the app in the built-in browser of the Claude desktop app, while you watch |
| CI | `.github/workflows/ci.yml` | Types and unit tests, integration tests, read-only query checks, secret scanning, the production build and a check of the cloud session setup |

Code and project definitions are in English and code has no comments: whatever needs explanation lives in `docs/technical/`. Text on screen and the conversation with Claude are in Brazilian Portuguese (configurable in `CLAUDE.md`).

## Prerequisites and how to run

**Cloud-first, nothing to install:** work with Claude Code on the web, following [`PREREQUISITES.md`](PREREQUISITES.md) (in Brazilian Portuguese). In each session the `SessionStart` hook runs `scripts/cloud-setup.sh`, which installs Postgres if missing, installs the dependencies, applies migrations and starts the app on http://localhost:3000 (log in `/tmp/dev-foundation-app.log`). Commands are plain `npm ...`. Keys that only you can provide are set in the cloud environment's settings, never in the repository.

**On your computer instead (Docker Compose):** works on Windows, macOS and Linux; the step-by-step installation guide, in Brazilian Portuguese, is [`LOCAL.md`](LOCAL.md). You need:

- [Claude Code](https://code.claude.com/docs/en/quickstart), already signed in. In the Claude desktop app you watch the end-to-end checks in the built-in browser; in the terminal, Claude uses a headless browser and shows screenshots
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) on Windows and macOS, open and running (it includes Docker Compose); on Linux, [Docker Engine](https://docs.docker.com/engine/install/) with the Compose plugin, or Docker Desktop
- [Git](https://git-scm.com/), [GitHub CLI](https://cli.github.com/) and a [GitHub](https://github.com/) account to deliver through GitHub

Nothing else is installed on the computer: Node.js, the dependencies, the database and the browser for browser tests all run inside Docker.

```bash
docker compose up
```

No configuration is needed: local values are already set in `docker-compose.yml`. When a feature needs a key that only you can provide, such as an API key, create a `.env` file with the names listed in `.env.example` and run `docker compose up` again. The first run downloads the images and installs the dependencies, which takes a few minutes. Open http://localhost:3000. If you see **"Banco de dados: conectado"**, everything is fine.

To stop: `Ctrl + C`. To also erase the database data: `docker compose down -v`.

## Deploy

The app goes online on Vercel with a Neon Postgres database, both on free plans (Vercel Hobby is for non-commercial use). Ask Claude to run `/deploy`: it publishes through the pinned Vercel CLI (`npm run vercel`), using a Vercel token saved as a network secret for `api.vercel.com` (see [`PREREQUISITES.md`](PREREQUISITES.md)), creates the project and the database, adds the local settings and gives you a link to paste your own `ANTHROPIC_API_KEY` in Vercel. A preview is deployed from the work branch and production from `main` after the merge; `npm run vercel-build` applies pending migrations before building. Pushing does not publish by itself. Details: [`docs/technical/deployment.md`](docs/technical/deployment.md).

## Workshop

The step-by-step prompts used in the training, to build the workshop product along with the presenters or to reproduce it later, are in [`WORKSHOP.md`](WORKSHOP.md) (in Brazilian Portuguese).

## How to work with Claude

1. Fill in the "Product" section of `CLAUDE.md` with your business context.
2. Start from the template: create an empty repository (with a README) in your personal GitHub account, open a Claude Code on the web session on it and ask Claude to copy this template in, run `scripts/cloud-setup.sh`, commit and push to `main` (the exact prompt, in Brazilian Portuguese, is in step 1 of [`WORKSHOP.md`](WORKSHOP.md)). Then open a new session and run `/setup-project`: it checks the environment and tells you what to do until everything is ready. On a computer, clone the repository and run `/setup-project` in Claude Code.
3. Ask for the first feature by saying what you want, for example: `/new-feature um chat para tirar dúvidas dos clientes`.

From there, the skill drives the way and stops at each phase for your approval:

1. **Interview and plan:** Claude asks questions until it understands the problem, who uses it, what is in, what is out and how to know it is done, then proposes the stages. This is the one approval point: you approve or ask for changes.
2. **Implementation:** one stage at a time, with tests and one commit per stage.
3. **End-to-end check:** Claude uses the app in the browser and checks every done criterion.
4. **Review:** the `reviewer` checks the done criteria, code, security and UX.
5. **Documentation:** the `documenter` updates `docs/` with what was delivered.

Then `/deliver` prepares the pull request. To change something that exists, use `/adjust-feature`; when something breaks, `/fix-bug`; to put it online, `/deploy`.

## Useful commands

In a cloud session, run the commands as written. With Docker Compose, prefix them with `docker compose exec -T app` (for example `docker compose exec -T app npm test`), with the app running:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the unit tests |
| `npm run test:integration` | Runs the integration tests on a fresh test database |
| `npm run typecheck` | Checks TypeScript types |
| `npm run check:secrets` | Looks for API keys, tokens and private keys in the code |
| `npm run check:env` | Lists keys from `.env.example` still missing in `.env` |
| `npm run db:migrate` | Applies pending database migrations |
| `npm run db:query -- "SELECT …"` | Runs one read-only query on the development database |
| `npm run db:explain -- "SELECT …"` | Shows the query plan and warns about large sequential scans |
| `npx shadcn@latest add <name>` | Adds a shadcn/ui component |
| `npm run build` | Builds for production |
| `npm run vercel-build` | Applies migrations and builds, as Vercel does |

## Structure

```
src/
  app/                    Routes only: pages, layouts and route handlers
  modules/<module>/       One business capability
    domain/               Business concepts and rules (pure TypeScript)
    application/          Use cases, ports and input schemas
    infrastructure/       Repositories, external APIs and AI agents
    presentation/         Components, hooks, server actions and URL state
    index.ts              Public API: use cases wired with infrastructure
  shared/
    ui/                   shadcn/ui, AI components and layout
    kernel/               Typed errors
    http/                 Route handler helpers
    config/env.ts         Validated environment variables
    database/             Postgres client and migrations
    ai/                   Smooth streaming for AI responses
    utils/                Generic helpers
  architecture.test.ts    The architecture rules, as tests
scripts/                  Cloud session setup, migrations, read-only queries, test runner and checks
workshop/                 Training material: the Ilha Clara rental listings CSV and its specification
docs/technical/           Technical documentation (English)
docs/business/            Business documentation (en and pt-BR)
.claude/                  Permissions, skills and subagents
.github/workflows/        CI
CLAUDE.md                 Project context for Claude
docker-compose.yml        Database + application (Docker option)
.env.example              Keys only you can provide (names only, no values)
```

Tests sit next to the file they test (`*.test.ts`).
