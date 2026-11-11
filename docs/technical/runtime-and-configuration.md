# Runtime and configuration

How the system runs, in Claude Code on the web sessions (the default), in Docker Compose on a computer, and in CI, and every setting it reads. Both ways work on a fresh clone with no configuration. How it runs online is in [deployment](deployment.md).

## Cloud sessions

Claude Code on the web runs each session in a temporary cloud container with no usable Docker (see [decision 0005](decisions/0005-cloud-first-development.md)). Commands are plain `npm ...`. Instead of Docker Compose, the `SessionStart` hook in `.claude/settings.json` runs `.claude/hooks/session-start.sh`, which runs `scripts/cloud-setup.sh` only when `CLAUDE_CODE_REMOTE=true`.

```mermaid
flowchart LR
  start["Session starts"] --> hook[".claude/hooks/session-start.sh"]
  hook --> pg["PostgreSQL installed if missing,<br/>started, role and database app"]
  pg --> install["npm install<br/>(skipped when package files are unchanged)"]
  install --> env["Session variables written<br/>to CLAUDE_ENV_FILE"]
  env --> migrate["npm run db:migrate"]
  migrate --> dev["npm run dev in the background<br/>log in /tmp/dev-foundation-app.log"]
  dev --> healthy["/api/health = ok"]
```

| Variable | Value | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://app:app@localhost:5432/app` | Application database on the container's Postgres; built from `app.environment` in `docker-compose.yml` by `scripts/local-env.mjs`, with the host `db` replaced by `localhost` |
| `TEST_DATABASE_URL` | `postgres://app:app@localhost:5432/app_test` | Integration tests |
| `DEV_FOUNDATION_CLOUD` | `true` | Tells Claude, skills and subagents to run commands without the Docker prefix |
| `NODE_USE_ENV_PROXY` | `1`, only when `HTTPS_PROXY` is set | Makes server-side `fetch` (for example the AI SDK) go through the session's egress proxy |

The script is idempotent: a second run only checks health. `npm install` is skipped while `scripts/cloud-setup.sh`, `package.json` and `package-lock.json` match the hashes in `node_modules/.cloud-setup.sha256`. User-provided keys and logins come from the cloud environment's settings: environment variables, or a network secret that the egress proxy injects into requests to its host (the recommended way for `OPENAI_API_KEY`, with a placeholder value in the variable). The participant guide is `PREREQUISITES.md`.

## Docker Compose

The option on a computer: only Docker, Git and Claude Code are needed, and commands run as `docker compose exec -T app <command>`.

### Containers

The diagram shows the services in `docker-compose.yml`, their ports and volumes.

```mermaid
flowchart LR
  host["Computer<br/>browser at localhost:3000"]
  subgraph compose["docker compose"]
    app["app<br/>node:22-alpine<br/>next dev on 3000"]
    db[("db<br/>postgres:17-alpine<br/>5432, not exposed")]
  end
  code["project folder<br/>bind mount at /app"]
  data[("postgres-data<br/>named volume")]
  host -- "3000:3000" --> app
  app -- "postgres://app:app@db:5432/app" --> db
  code --- app
  data --- db
```

| Service | Image | Ports | Health check | Depends on |
| --- | --- | --- | --- | --- |
| `db` | `postgres:17-alpine` | 5432 inside the network only | `pg_isready` every 5 s | none |
| `app` | `node:22-alpine` | 3000 → 3000 | `GET /api/health` answers 200, every 5 s, up to 5 min after a 30 s start period | `db` healthy |

### Startup

`docker compose up` runs this sequence in the `app` container. The first run downloads the images and installs the dependencies, which takes a few minutes.

```mermaid
flowchart LR
  up["docker compose up"] --> dbready["db healthy"]
  dbready --> install["npm install<br/>(node_modules in the project folder)"]
  install --> migrate["npm run db:migrate"]
  migrate --> dev["npm run dev --hostname 0.0.0.0"]
  dev --> healthy["app healthy<br/>/api/health = 200"]
```

`node_modules` is installed by the container into the mounted folder, so editors see the types; it must never be installed from the computer, because native packages are built for the container platform.

## Environment variables

There are two kinds of settings: **local values** the project defines in `docker-compose.yml`, so nothing needs configuring, and **user-provided keys** that only the product owner can supply, in a `.env` file (Docker) or the cloud environment settings (cloud sessions), never committed and is listed by name in `.env.example`. All application code reads settings through `getServerEnv()` in `src/shared/config/env.ts`, which validates them with zod on first use.

| Variable | Kind | Local value | Read by | Purpose |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Local | `postgres://app:app@db:5432/app` | `src/shared/config/env.ts`, `scripts/migrate.mjs` | Application database |
| `TEST_DATABASE_URL` | Local | `postgres://app:app@db:5432/app_test` | `scripts/test-integration.mjs` | Database recreated for integration tests |
| `WATCHPACK_POLLING` | Local | `true` | Next.js | Hot reload on mounted volumes |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Local (db service) | `app`, `app`, `app` | Postgres image | Development database credentials |
| `CI` | Set by GitHub Actions | | `docker-compose.yml` | Marks CI runs |

User-provided keys: none in Dev Foundation. `.env.example` is empty; a feature that needs one (for example `OPENAI_API_KEY`) adds the name there, makes it `.optional()` in the schema, and fails only that feature with `UnavailableError` while the key is missing. `npm run check:env` lists missing names, never values. Every local value above is for development only; online, Neon provides `DATABASE_URL` and `DATABASE_URL_UNPOOLED` and the product owner adds the keys in Vercel ([deployment](deployment.md)).

## Commands

In a cloud session, run them as written. With Docker Compose, run them inside the `app` container with the app running, prefixed with `docker compose exec -T app` (for example `docker compose exec -T app npm test`).

| Command | What it does |
| --- | --- |
| `docker compose up` | Starts everything (add `-d --wait` to run in the background until healthy) |
| `npm test` | Unit tests |
| `npm run test:integration` | Integration tests on a fresh `app_test` database |
| `npm run typecheck` | TypeScript check |
| `npm run check:secrets` | Secret scan |
| `npm run check:env` | Missing user-provided keys, by name |
| `npm run db:migrate` | Applies pending migrations |
| `npm run db:query -- "<SELECT …>"` | Runs one read statement on the development database, read-only with a 5-second timeout |
| `npm run db:explain -- "<SELECT …>"` | Prints the execution plan and warns about large sequential scans; `--force-index` disables sequential scans |
| `npm run build` | Production build |
| `npm run vercel-build` | Migrations then production build, run by Vercel |
| `npx shadcn@latest add <name>` | Adds a shadcn/ui component to `src/shared/ui/` |
| `docker compose down -v` | Stops everything and erases the database volume |

## Claude Code integration

| File | Purpose |
| --- | --- |
| `.claude/launch.json` | Lets the Claude desktop app start the stack (`docker compose up`, port 3000) and open it in its built-in browser; `autoVerify` is off so browser checks happen at the defined points of the workflow |
| `.mcp.json` | Headless Playwright browser in Docker (`mcr.microsoft.com/playwright/mcp`) for Claude Code in the terminal; it reaches the app at `http://host.docker.internal:3000`, allowed in `next.config.ts` |
| `.claude/hooks/session-start.sh` | Prepares cloud sessions (see [Cloud sessions](#cloud-sessions)) |
| `.claude/settings.json` | `SessionStart` hook for cloud sessions; commands Claude may run without asking (tests, checks, compose, git read and commit) and what is denied (reading `.env`, `rm -rf`) |

Related: [deployment](deployment.md) · [testing and quality](testing-and-quality.md) · [security](security.md)
