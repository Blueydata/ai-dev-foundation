---
name: deploy
description: Publishes the app on Vercel with a Neon Postgres database, both on free plans, through the Vercel CLI - creates the project and the database the first time, deploys a preview for the work branch and production from main, follows the build, fixes failures and hands over the link. The product owner only provides keys. Use when asked to publish, deploy or put the app online, after /deliver, and whenever a feature adds an environment variable.
---

# Deploy

The app runs on **Vercel** (Hobby plan, free, personal account) with a **Neon** Postgres database created through Vercel. You publish it with the Vercel CLI; the product owner never clicks through Vercel: they only keep their keys in the cloud environment settings.

## How it works

- The CLI is pinned: always run it as `npm run vercel -- <command> --token "$VERCEL_TOKEN"`.
- The token is a network secret of the cloud environment for `api.vercel.com`. `scripts/cloud-setup.sh` sets `VERCEL_TOKEN` to a placeholder (`vianetworksecret`) and the network proxy puts the real token in each request: you never see it, never print it and never ask for it in the conversation.
- Vercel builds with `npm run vercel-build`: `scripts/migrate.mjs` applies pending migrations (through `DATABASE_URL_UNPOOLED`) and then `next build`.
- The Neon integration sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for every environment. Never pull them into the project (`--no-env-pull`): the local app uses the session's own Postgres.
- `.vercelignore` keeps `node_modules`, `.next`, `.vercel` and every `.env` file out of the upload.
- The project name is the repository name in lowercase (`basename "$(git rev-parse --show-toplevel)"`).
- Local values with a default in `docker-compose.yml` (for example `LLM_MODEL`) also go to Vercel: `npm run vercel -- env add <NAME> --environment production,preview --value <value> --no-sensitive --yes --force --token "$VERCEL_TOKEN"` (they are not secrets).
- Keys the product owner provides (`LLM_API_KEY`) are environment variables of the cloud environment (Anthropic hosts cannot be network secrets). Copy each one to Vercel yourself, through stdin so the value never appears in a command, a log or the conversation: `printf '%s' "$LLM_API_KEY" | npm run --silent vercel -- env add LLM_API_KEY --environment production,preview --sensitive --yes --force --token "$VERCEL_TOKEN"`. Never echo, print or inspect the value; checking that it is set is `[ -n "$LLM_API_KEY" ]`.

## Before anything: the token works

`npm run vercel -- whoami --token "$VERCEL_TOKEN"` prints the account. If it fails with an authentication or network error, tell the product owner in one line to save the Vercel token as a network secret for `api.vercel.com` (header `Authorization`, prefix `Bearer`) in the cloud environment settings and open a new session (`PREREQUISITES.md`, step 6). Stop there.

## First publish (once per repository)

1. **Project:** `npm run vercel -- project create <name> --token "$VERCEL_TOKEN"` (an "already exists" answer is fine), then `npm run vercel -- link --yes --project <name> --token "$VERCEL_TOKEN"`.
2. **Database:** `npm run vercel -- integration add neon --no-env-pull --token "$VERCEL_TOKEN"`. If it answers with a link to accept the integration terms, give the link to the product owner, wait for "pronto" and run it again.
3. **Settings:** add every local value the app needs (`docker-compose.yml`) with `env add` for `production` and `preview`.
4. **Keys:** for each name in `.env.example`, copy it from the session to Vercel as shown above. If a name is not set in the session (`[ -n "$NAME" ]` fails), tell the product owner in one line to add it in the cloud environment settings (environment variables) and open a new session; meanwhile publish without it (only the feature that needs it is unavailable). Confirm with `npm run vercel -- env list --token "$VERCEL_TOKEN"` (names only).
5. Continue with "Every publish".

## Every publish

1. **Where:** a preview from the session's branch after `/deliver`; production only from `main`, after the pull request is merged, from a fresh checkout: `git fetch origin main && git worktree add /tmp/release origin/main`, then deploy with `--cwd /tmp/release`.
2. **Deploy:** `npm run vercel -- deploy --yes --token "$VERCEL_TOKEN"` (add `--prod` for production). It waits for the build and prints the URL.
3. **Failed build:** `npm run vercel -- inspect <url> --logs --token "$VERCEL_TOKEN"`, fix the cause in the code (with a test when it is in a rule or a repository), commit, push and deploy again. After 3 failed attempts, stop and explain.
4. **Check:** `npm run vercel -- curl /api/health --deployment <url> --token "$VERCEL_TOKEN"` answers `"database":"ok"`; then open the main pages the same way (or with `test-in-browser` when the session's network reaches the URL).
5. **Hand over** the link in one line. Preview links ask the product owner to be signed in to Vercel; that is expected.

## When something fails

- Migration error in the build: the log names the migration file; fix it as a new migration.
- `/api/health` says the database is down: the Neon integration is not connected to that environment; run step 2 of "First publish" again.
- The chat says the AI is unavailable: `LLM_API_KEY` is missing in that Vercel environment; copy it again (step 4) and deploy again.

Never ask for or print keys, tokens or connection strings.
