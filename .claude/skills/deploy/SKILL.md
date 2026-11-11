---
name: deploy
description: Puts the app online on Vercel with a Neon Postgres database, both on free plans, and keeps the deploy working as features add settings - guides the product owner through the clicks only they can do, checks the build and the health of the published app. Use when asked to publish, deploy or put the app online, and whenever a feature adds an environment variable.
---

# Deploy

The app runs on **Vercel** (Hobby plan, free, sign in with a personal GitHub account) with a **Neon** Postgres database created from inside Vercel. Every push to `main` publishes production; every pull request gets its own preview link. There is no infrastructure code to maintain.

## How it works

- Vercel runs `npm run vercel-build`: `scripts/migrate.mjs` applies pending migrations (through `DATABASE_URL_UNPOOLED` when Neon provides it) and then `next build`.
- The Neon integration sets `DATABASE_URL` (pooled, used by the app) and `DATABASE_URL_UNPOOLED` (direct, used by migrations) for every environment.
- Keys and logins (`OPENAI_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, …) are set by the product owner in Vercel, **Settings → Environment Variables**, never in code or in the conversation.
- Local values that have a default in `docker-compose.yml` (model names, flags) must also exist in Vercel: list them for the product owner when a feature adds one.

## First deploy (the product owner clicks, you guide)

Give these steps one at a time, in the conversation language, and wait for "pronto" after each:

1. Open https://vercel.com/new, sign in with GitHub and **import** the project repository (the personal account must own the repository: organization repositories need a paid plan).
2. Before **Deploy**, open **Environment Variables** and add every name in `.env.example` with their own values (a login made up for the workshop, never a real password).
3. Click **Deploy**. The first build fails without a database; that is expected.
4. In the project, **Storage → Create Database → Neon**, free plan, region `São Paulo` when offered, connect it to all environments.
5. **Deployments → … → Redeploy**. When it finishes, send me the production URL.

Then check it yourself: `curl -s <url>/api/health` answers `"database":"ok"`, and open the main pages with the browser test (`test-in-browser`) against the URL.

## When a feature changes configuration

In the final report of the feature, list the new variable names the product owner must add in Vercel (and in which environments). Nothing else changes for deploy.

## When something fails

- Build failed: ask the product owner for the last lines of the build log (no secrets in it) or, if the Vercel tools are available, read it yourself. A migration error comes with the file name.
- `/api/health` says the database is down: the Neon database is not connected to that environment, or the deploy happened before the integration; redeploy.
- The chat says the AI is unavailable: `OPENAI_API_KEY` is missing in that environment; add it and redeploy.

Never ask for or print keys, passwords or connection strings.
