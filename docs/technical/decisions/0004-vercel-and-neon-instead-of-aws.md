# 0004 — Vercel and Neon instead of AWS

**Date:** 2026-11-11 · **Status:** accepted

## Context

The template is used in a two-hour workshop. Every participant must be able to put their own product online with only a personal GitHub account, on free plans, with no cloud account to configure and no infrastructure code to learn. The AWS setup of [0003](0003-aws-infrastructure-as-code.md) needs an AWS account, credentials, a long first deploy and a monthly cost, and it added a Dockerfile, a tools container, two CI jobs and a subagent to maintain.

## Decision

- The app is published on Vercel (Hobby plan) and the database is Neon Postgres created from inside Vercel's Storage tab, both on free plans.
- Every push to `main` publishes production; every pull request gets a preview deployment.
- Vercel runs `npm run vercel-build`, which is `node scripts/migrate.mjs && next build`: migrations are applied before the build. The migration runner prefers `DATABASE_URL_UNPOOLED` (direct connection) over `DATABASE_URL` (pooled), through `selectMigrationUrl`.
- `infra/`, `Dockerfile`, `.dockerignore`, `scripts/start.mjs`, the `infra` Compose service, the CI jobs `infrastructure` and `image`, the `infrastructure-as-code` skill and the `infrastructure-engineer` subagent are removed, and `output: "standalone"` is dropped from `next.config.ts`.
- The `deploy` skill guides the product owner through the steps only they can do.

## Alternatives considered

- **AWS with Terraform and Terragrunt (0003):** full control and scale, but needs an account and a payment method, takes long to set up and is too much to teach in two hours.
- **Render:** simple, but the free database expires and free web services sleep for long periods.
- **Railway:** simple, but no lasting free plan.
- **Fly.io:** needs a payment method and a CLI install, plus a Dockerfile to maintain.

## Consequences

- Deploying needs a GitHub account and a few clicks; there is no infrastructure code to keep in sync with features.
- A feature that adds an environment variable must list it for the product owner to add in Vercel ([deployment](../deployment.md)).
- The app is tied to Vercel's serverless limits (function duration, no long-running processes) and to Neon's free-plan limits.
- Moving to AWS later is possible, but infrastructure code and a container image would have to be written again.
