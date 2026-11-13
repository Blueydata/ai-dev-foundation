---
name: setup-project
description: Guided setup of the project - checks that the app, database, tests, secrets, keys and product context are ready, in a cloud session or on a computer with Docker, and guides the person step by step until everything is ready. Use on first use, before a workshop, or when something stops working.
---

# Setup project

Take the person from "just opened" to "ready to develop". Check each item in order; fix what you safely can yourself; for anything only the person can do, give the exact next step and wait. Never read `.env` and never ask for keys or passwords in the conversation.

## Cloud session (the default)

`DEV_FOUNDATION_CLOUD=true` or `CLAUDE_CODE_REMOTE=true`: the person installed nothing and the SessionStart hook already ran `scripts/cloud-setup.sh`.

1. **App and database:** `curl -s http://localhost:3000/api/health` answers `"database":"ok"`. If not, run `scripts/cloud-setup.sh` and check again; if it still fails, read `tail -n 40 /tmp/dev-foundation-app.log` and explain the cause and the fix in one line each.
2. **Tests and types:** the `tester` subagent.
3. **Secrets:** `npm run check:secrets` reports nothing.
4. **User-provided keys:** `npm run check:env` lists the names in `.env.example` still missing. Missing keys go in the cloud environment settings (environment menu of the session, **Edit**: environment variables), followed by a new session. The guide is `PREREQUISITES.md`.
5. **AI key (`LLM_API_KEY`):** never print it. First `[ -n "$LLM_API_KEY" ]`. If it is set, check that it works without showing it: `curl -s -o /dev/null -w "%{http_code}" https://api.anthropic.com/v1/models -H "x-api-key: $LLM_API_KEY" -H "anthropic-version: 2023-06-01"` answers `200` (`401` means an invalid or revoked key). If it is missing: if `ANTHROPIC_API_KEY` exists in the environment settings, explain that this name is reserved by Claude Code and does not reach the session, and that it must be renamed to `LLM_API_KEY`; otherwise, point to `PREREQUISITES.md`, step 6. Without it everything works except the AI features.
6. **Vercel:** `npm run vercel -- whoami --token "$VERCEL_TOKEN"` prints the account. If it fails, the Vercel token is missing or expired in the cloud environment's network secrets (`api.vercel.com`, `PREREQUISITES.md`, step 6), followed by a new session. Without it the work goes on, but nothing can be published or shown in a preview.
7. **Preview:** report port 3000 with the preview port tool (`report_preview_port`, when it exists) and tell the person they can open the app in the preview pane.
8. **Product context:** the "Product" section of `CLAUDE.md` has no bracketed placeholders left. If it does, that is the next step, not a problem.

## On a computer with Docker

Only when the session is not in the cloud. The computer needs Git, Docker and Claude; the full guide, per operating system, is `LOCAL.md`. Find the system with `uname -s` and give instructions for it.

1. **Git:** `git --version`. **Docker:** `docker info --format "{{.ServerVersion}}"`; if it fails, Docker Desktop must be open (Windows, macOS) or the service started (`sudo systemctl start docker` on Linux).
2. **App and database:** `curl -s http://localhost:3000/api/health`. If it does not answer `"database":"ok"`, run `docker compose up -d --wait` with a long timeout (the first run takes minutes; say so). If it still fails, read `docker compose logs --tail 40 app`.
3. **Tests, secrets, keys and product context:** as in the cloud, running each command as `docker compose exec -T app <command>`; missing keys go in a `.env` file, followed by `docker compose up -d`.

## How to answer

In the conversation language, short. While something is missing: the list with ✓ or ✗ and, for the **first** ✗ only, the exact steps. When everything is ready:

```
✓ Ambiente na nuvem (nada instalado no computador)
✓ Aplicação e banco no ar
✓ Testes e tipos
✓ Sem segredos no código
✓ Chave da IA (LLM_API_KEY) funcionando
✓ Vercel conectada (pronta para publicar as prévias)
✗ "Product" ainda não preenchido no CLAUDE.md → é o próximo passo
```

Then one line: ready to develop; fill in "Product", then `/new-feature` and what you want.
