# Dev Foundation

A foundation to start building any kind of software with AI. It ships the technical base already running and Claude configured to work with a process — architecture, standards, skills, subagents, tests, CI and documentation — but no product built in: you define what the software does, one feature at a time.

## What is included

| Piece | Where | Purpose |
| --- | --- | --- |
| Architecture | `src/` | Business modules with four layers (domain, application, infrastructure, presentation) plus shared code, with the rules checked by a test, so Claude always knows where each thing goes |
| Application | `src/app/`, `src/shared/` | Next.js connected to a Postgres database |
| Migrations | `src/shared/database/migrations/` | SQL files applied in order, automatically on `docker compose up` |
| UI | `src/app/globals.css`, `src/shared/ui/` | Tailwind CSS, shadcn/ui and Motion, with ready-made layouts (admin shell, page header, empty state) and a complete AI chat panel; the brand in `CLAUDE.md` sets the colors |
| URL state | module `presentation/url-state.ts` | nuqs: every URL reflects exactly what is on screen |
| AI | `src/shared/ai/`, `src/shared/ui/ai/` | Vercel AI SDK for LLMs and agents, with streamed responses and animated text |
| Docker Compose | `docker-compose.yml` | Starts the database and the app with one command |
| Claude context | `CLAUDE.md` | The product, the rules and the workflow |
| Permissions | `.claude/settings.json` | What Claude can do on its own and what is blocked |
| Workflow skills | `.claude/skills/` | `/setup-project`, `/new-feature`, `/adjust-feature`, `/fix-bug`, `/test-in-browser` and `/deliver` |
| Standards skills | `.claude/skills/` | `project-structure`, `code-standards`, `ui-standards`, `url-state`, `ai-integration` and `technical-docs`, which Claude follows on its own |
| Subagents | `.claude/agents/` | Eight specialists, each with its own model and effort level |
| Documentation | `docs/` | Technical in English, complete from day one: overview, folder tree, architecture, module pages, data model, API, runtime, testing, security, AI and UI, with Mermaid diagrams (start at `docs/technical/README.md`). Business in English and Brazilian Portuguese, created with the first feature. Both grow with every delivery |
| Tests | `*.test.ts`, `*.integration.test.ts`, `.claude/launch.json` | Unit tests, integration tests against the real database, and the end-to-end check: at the end of each feature Claude uses the app in the built-in browser of the Claude desktop app, while you watch |
| CI | `.github/workflows/ci.yml` | Types, unit tests, integration tests and secret scanning, with no external tool |

Code and project definitions are in English and code has no comments: whatever needs explanation lives in `docs/technical/`. Text on screen and the conversation with Claude are in Brazilian Portuguese (configurable in `CLAUDE.md`).

## Prerequisites

Step-by-step installation guide, in Brazilian Portuguese: [`PREREQUISITES.md`](PREREQUISITES.md).

To work with Claude (specify, plan, document):

- [Claude Code](https://code.claude.com/docs/en/quickstart), already signed in. Use it in the Claude desktop app to watch the end-to-end checks in the built-in browser; in the terminal, Claude uses a headless browser and shows screenshots

To run the app:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), open and running (it includes Docker Compose)

Nothing else is installed on the computer: Node.js, the dependencies, the database and the browser for browser tests all run inside Docker.

To deliver through GitHub:

- [Git](https://git-scm.com/), [GitHub CLI](https://cli.github.com/) and a [GitHub](https://github.com/) account

## How to run

**Docker Compose** starts the database and the app together, with a single command, the same way on any computer. The configuration is in `docker-compose.yml`.

```bash
docker compose up
```

No configuration is needed: local values are already set in `docker-compose.yml`. When a feature needs a key that only you can provide, such as an API key, create a `.env` file with the names listed in `.env.example` and run `docker compose up` again.

The first run downloads the images and installs the dependencies, which takes a few minutes. Open http://localhost:3000. If you see **"Banco de dados: conectado"**, everything is fine.

To stop: `Ctrl + C`. To also erase the database data: `docker compose down -v`.

## Workshop

The step-by-step prompts used in the training, to build the workshop product along with the presenters or to reproduce it later, are in [`WORKSHOP.md`](WORKSHOP.md) (in Brazilian Portuguese).

## How to work with Claude

1. Fill in the "Product" section of `CLAUDE.md` with your business context.
2. Open Claude in the project folder (`claude`) and run `/setup-project`: it checks Git and Docker, starts the app and tells you what to do until everything is ready.
3. Ask for the first feature by saying what you want, for example: `/new-feature um chat para tirar dúvidas dos clientes`.

From there, the skill drives the way and stops at each phase for your approval:

1. **Interview:** Claude asks questions until it understands the problem, who uses it, what is in, what is out and how to know it is done.
2. **Plan:** it proposes the stages; you approve or ask for changes.
3. **Implementation:** one stage at a time, with tests and one commit per stage.
4. **End-to-end check:** Claude uses the app in the built-in browser and checks every done criterion. Open the **Browser** pane (Cmd+Shift+B) to watch.
5. **Review:** validator and code, security and UX reviewers, in parallel.
6. **Documentation:** the documenters update `docs/` with what was delivered.

Then `/deliver` prepares the pull request. To change something that exists, use `/adjust-feature`; when something breaks, `/fix-bug`.

## Useful commands

All commands run inside the `app` container, with the app running (`docker compose up`):

| Command | What it does |
| --- | --- |
| `docker compose exec app npm test` | Runs the unit tests |
| `docker compose exec app npm run test:integration` | Runs the integration tests on a fresh test database |
| `docker compose exec app npm run typecheck` | Checks TypeScript types |
| `docker compose exec app npm run check:secrets` | Looks for API keys, tokens and private keys in the code |
| `docker compose exec app npm run check:env` | Lists keys from `.env.example` still missing in `.env` |
| `docker compose exec app npm run db:migrate` | Applies pending database migrations |
| `docker compose exec app npx shadcn@latest add <name>` | Adds a shadcn/ui component |
| `docker compose exec app npm run build` | Builds for production |

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
scripts/                  Migrations and secret scan
docs/technical/           Technical documentation (English)
docs/business/            Business documentation (en and pt-BR)
.claude/                  Permissions, skills and subagents
.github/workflows/        CI
CLAUDE.md                 Project context for Claude
docker-compose.yml        Database + application
.env.example              Keys only you can provide (names only, no values)
```

Tests sit next to the file they test (`*.test.ts`).
