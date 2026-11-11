---
name: deploy
description: Puts the app online on Vercel with a Neon Postgres database, both on free plans, and keeps the deploy working as features add settings - guides the product owner through the one-time clicks only they can do, then follows every deploy through the Vercel connector, fixes failed builds and hands over the link. Use when asked to publish, deploy or put the app online, and whenever a feature adds an environment variable.
---

# Deploy

The app runs on **Vercel** (Hobby plan, free, sign in with a personal GitHub account) with a **Neon** Postgres database created from inside Vercel. Every push to `main` publishes production; every pull request gets its own preview link. There is no infrastructure code to maintain.

## How it works

- Vercel runs `npm run vercel-build`: `scripts/migrate.mjs` applies pending migrations (through `DATABASE_URL_UNPOOLED` when Neon provides it) and then `next build`.
- The Neon integration sets `DATABASE_URL` (pooled, used by the app) and `DATABASE_URL_UNPOOLED` (direct, used by migrations) for every environment.
- Keys and logins (`OPENAI_API_KEY`, …) are set by the product owner in Vercel, **Settings → Environment Variables**, never in code or in the conversation.
- Local values that have a default in `docker-compose.yml` (model names, flags) must also exist in Vercel: list them for the product owner when a feature adds one.

## Vercel connector

The Vercel connector of claude.ai (connected once at https://claude.ai/customize/connectors, then a new session) gives you its tools in cloud sessions: projects, deployments, build logs and the Vercel docs. It does not create projects, databases or environment variables: those are the one-time clicks below. Every push you make deploys on its own (Vercel watches the GitHub repository): a pushed branch gets a preview, `main` gets production.

If its tools are not in the session, tell the product owner once, in one line, to connect it and open a new session; meanwhile follow the steps below by asking them.

**After every push** (stages, fixes, `/deliver`), use the connector, without being asked:

1. Find the project and the deployment for the commit you just pushed; wait until it finishes.
2. Failed: read the build log, fix the cause in the code (with a test when the cause is in a rule or a repository), commit, push and follow the new deployment. After 3 failed attempts, stop and explain.
3. Ready: give the product owner the link in one line (preview for a branch, production for `main`) and check it: `/api/health` answers `"database":"ok"` and the main pages work, through the connector's tools to read a Vercel URL when they exist, or `curl` and `test-in-browser` when the session's network reaches it.

## First deploy (the product owner clicks once, you guide)

Give these steps one at a time, in the conversation language, and wait for "pronto" after each:

1. Open https://vercel.com/new, sign in with GitHub and **import** the project repository (the personal account must own the repository: organization repositories need a paid plan).
2. Before **Deploy**, open **Environment Variables** and add every name in `.env.example` with their own values (logins made up for the purpose, never a real password).
3. Click **Deploy**. The first build fails without a database; that is expected.
4. In the project, **Storage → Create Database → Neon**, free plan, region `São Paulo` when offered, connect it to all environments.
5. **Deployments → … → Redeploy**.

Then follow that deployment with the connector, as in "After every push", and give the production link. Without the connector, ask for the production URL and check it with `curl` and `test-in-browser`.

## When a feature changes configuration

In the final report of the feature, list the new variable names the product owner must add in Vercel (and in which environments). Nothing else changes for deploy.

## When something fails

- Build failed: read the build log with the connector (without it, ask the product owner for the last lines, never for secrets). A migration error comes with the file name.
- `/api/health` says the database is down: the Neon database is not connected to that environment, or the deploy happened before the integration; redeploy.
- The chat says the AI is unavailable: `OPENAI_API_KEY` is missing in that environment; add it and redeploy.

Never ask for or print keys, passwords or connection strings.
