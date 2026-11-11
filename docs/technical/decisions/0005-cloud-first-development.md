# 0005 — Cloud-first development with Claude Code on the web

**Date:** 2026-11-11 · **Status:** accepted

## Context

In a workshop, installing Docker, Git and Claude Code on every computer is the slowest and most fragile step. Claude Code on the web runs each session in a temporary cloud container with a browser as the only requirement, but that container has no usable Docker (containers there cannot reach the npm registry through the session's egress proxy), and its egress proxy allows only HTTPS.

## Decision

- Claude Code on the web is the default way to work; the guide is `PREREQUISITES.md`.
- The `SessionStart` hook in `.claude/settings.json` runs `.claude/hooks/session-start.sh`, which runs `scripts/cloud-setup.sh` only when `CLAUDE_CODE_REMOTE=true`. The script installs PostgreSQL if missing, installs npm dependencies unless the package files are unchanged, writes the session variables (from `app.environment` in `docker-compose.yml` through `scripts/local-env.mjs`, with `DATABASE_URL` pointing at `localhost`), applies migrations and starts `next dev` in the background (log in `/tmp/dev-foundation-app.log`).
- Commands are plain `npm ...`. Docker Compose stays as the option on a computer (`docker compose exec -T app <command>`), and `docker-compose.yml` stays the single source of local values.
- CI proves the script works: the `cloud-setup` job runs it on Ubuntu and then the integration tests.

## Alternatives considered

- **Hosted database such as Supabase:** rejected because the session egress proxy only allows HTTPS, so the Postgres protocol cannot reach it, and every participant would need another account.
- **Docker inside the cloud session:** rejected because containers cannot reach the npm registry through the proxy.
- **Docker only, on each computer:** kept as an option, but too slow to set up for a workshop.

## Consequences

- Nothing is installed on the participant's computer.
- Two ways of running exist and must stay equivalent; local values are defined once, in `docker-compose.yml`.
- Keys come from the cloud environment's settings, not from a `.env` file.
- The cloud setup depends on `apt` access to install PostgreSQL in the session image.
