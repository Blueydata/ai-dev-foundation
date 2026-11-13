---
name: deploy
description: Publishes the app on Vercel with a Neon Postgres database, both on free plans, through the Vercel CLI - merges every finished step into main and shows it in a preview, publishes production from main, follows the build and fixes failures, and finds Vercel Marketplace integrations for new capabilities. The product owner only provides keys. Use after every finished stage, adjustment or fix, when asked to publish, at /deliver, and whenever a feature needs a capability or a setting the project does not have.
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
2. **Database:** accept the Neon terms without a browser, `npm run vercel -- integration accept-terms neon --yes --token "$VERCEL_TOKEN"`, then `npm run vercel -- integration add neon --no-env-pull --token "$VERCEL_TOKEN"`. Only if it still answers with a link to accept terms, give the link to the product owner, wait for "pronto" and run it again.
3. **Settings:** add every local value the app needs (`docker-compose.yml`) with `env add` for `production` and `preview`.
4. **Keys:** for each name in `.env.example`, copy it from the session to Vercel as shown above. If a name is not set in the session (`[ -n "$NAME" ]` fails), tell the product owner in one line to add it in the cloud environment settings (environment variables) and open a new session; meanwhile publish without it (only the feature that needs it is unavailable). Confirm with `npm run vercel -- env list --token "$VERCEL_TOKEN"` (names only).
5. Continue with "Merge and show a step".

## Merge and show a step

After every stage of `/new-feature`, every `/adjust-feature` and every `/fix-bug`, once its tests pass and it is committed:

1. **Merge into `main`:** `git fetch origin main`, `git merge --no-edit origin/main` (only if `main` moved; never rebase), run the `tester` again if the merge brought changes, then `git push origin HEAD:main` and `git push origin HEAD` (the session's branch). On a computer, merge the work branch into `main` the same way.
2. **Preview:** if the project does not exist yet, do "First publish" first. Then `npm run vercel -- deploy --yes --token "$VERCEL_TOKEN"`: it builds and prints the preview URL.
3. **Failed build:** `npm run vercel -- inspect <url> --logs --token "$VERCEL_TOKEN"`, fix the cause in the code (with a test when it is in a rule or a repository), commit and go back to step 1. After 3 failed attempts, stop and explain.
4. **Check:** `npm run vercel -- curl /api/health --deployment <url> --token "$VERCEL_TOKEN"` answers `"database":"ok"`; open the pages the step changed the same way (or with `test-in-browser` when the session's network reaches the URL).
5. **Show it:** give the product owner the preview link and one line on what to open and look at ("Abra o link e veja a vitrine com os filtros"). The link asks them to be signed in to Vercel; that is expected.

## Production

At `/deliver`, or when the product owner asks: from a fresh checkout of `main`, `git fetch origin main && git worktree add /tmp/release origin/main`, then `npm run vercel -- deploy --prod --yes --cwd /tmp/release --token "$VERCEL_TOKEN"`. Check `/api/health` as above and give the production link.

## Marketplace: new capabilities

When a feature needs something the project does not have (login, e-mail, file storage, payments, cache, search, queues, analytics…), look for a Vercel Marketplace integration before writing it yourself or bringing in another service:

1. **Search:** `npm run vercel -- integration discover <what is needed> --json --token "$VERCEL_TOKEN"` (categories: `integration categories`). Read the best two or three with `integration guide <slug>`.
2. **Propose** to the product owner, in up to 3 lines, the option you recommend: what it does, its free plan and what would cost money. A new service is the product owner's decision (`CLAUDE.md`, rule 12): wait for the approval.
3. **Install:** `integration accept-terms <slug> --yes` when it supports it (otherwise give the terms link), then `integration add <slug> --no-env-pull --token "$VERCEL_TOKEN"`. Its keys arrive as environment variables of the Vercel project; never print them.
4. **Use it in the code** through a gateway in the module `infrastructure/` (`project-structure`), with the variable names in `src/shared/config/env.ts` and `.env.example`. For the session to run it locally, ask the product owner to add the same variables in the cloud environment settings and open a new session; until then the feature answers with `UnavailableError`.
5. Record the choice as a decision (`documenter`) and list the integration in `docs/technical/deployment.md`.

## When something fails

- Migration error in the build: the log names the migration file; fix it as a new migration.
- `/api/health` says the database is down: the Neon integration is not connected to that environment; run step 2 of "First publish" again.
- The chat says the AI is unavailable: `LLM_API_KEY` is missing in that Vercel environment; copy it again (step 4) and deploy again.

Never ask for or print keys, tokens or connection strings.
