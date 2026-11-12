# 0007 — Claude publishes through the Vercel CLI

## Context

Decision [0004](0004-vercel-and-neon-instead-of-aws.md) chose Vercel and Neon. Publishing was first done by the product owner importing the repository in the Vercel dashboard, with Claude following the build through the Vercel connector. That needs several clicks by a non-programmer, the Git integration of Vercel Hobby accepts only repositories of personal GitHub accounts, and the connector depends on an extra setup in each session.

## Decision

- Claude publishes with the Vercel CLI, pinned in `package.json` as `"vercel": "npx --yes vercel@65.14.0"` and run as `npm run vercel -- <command> --token "$VERCEL_TOKEN"`.
- The Vercel token is a network secret for `api.vercel.com` (header `Authorization`, prefix `Bearer`). `scripts/cloud-setup.sh` exports `VERCEL_TOKEN=vianetworksecret` as a placeholder and `VERCEL_TELEMETRY_DISABLED=1`; the proxy adds the real token.
- Flow: `whoami`, `project create` and `link`, `integration add neon --no-env-pull`, `env add` for local values, the product owner pastes `ANTHROPIC_API_KEY` in Vercel through a link, `deploy` (preview from the session branch; `--prod` from a worktree of `origin/main` after the merge), `inspect --logs` on failure, `curl /api/health --deployment <url>`.
- `.vercelignore` keeps `.git`, `node_modules`, `.next`, `.vercel` and `.env` files out of the upload; `.vercel/` is git-ignored.
- Migrations still run in `vercel-build` through `DATABASE_URL_UNPOOLED`.
- `.claude/settings.json` allows plain `npm` commands, `scripts/cloud-setup.sh` and reading the app log.

## Alternatives considered

- **Dashboard import plus the Vercel connector:** the original flow; many manual clicks and a connector to set up in every session.
- **Git integration (automatic deploy on push):** convenient, but Hobby limits it to repositories of personal GitHub accounts and it publishes without Claude checking the result.
- **Unpinned `npx vercel`:** simpler, but behavior changes between runs.

## Consequences

- The product owner only provides two secrets once (Vercel token and Anthropic key) and accepts the Neon terms if asked.
- Pushing to GitHub does not publish; every publish is a deliberate `deploy` run that Claude verifies with the health check.
- CLI deploys do not connect the Git repository, so organization repositories also work on Hobby.
- Vercel Hobby is non-commercial only; a commercial product must change plan.
- Upgrading the CLI is a deliberate change of the pinned version.

Related: [deployment](../deployment.md) · [security](../security.md)
