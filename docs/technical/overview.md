# Overview

What the system is, what it talks to and what it is built with. The project starts from **Dev Foundation**, a base to build any kind of software with AI: it ships no product, only the foundation where features are added as modules, and this page grows with them.

## Context

The diagram shows who uses the system and which services it depends on. External services appear here as soon as a feature integrates one.

```mermaid
flowchart LR
  user["End user (browser)"]
  owner["Product owner (Claude Code)"]
  app["Next.js app<br/>(Vercel, or next dev locally)"]
  db[("Postgres<br/>(Neon, or local Postgres 17)")]
  anthropic["Anthropic API<br/>(optional, server only)"]
  user -- "HTTPS, or HTTP :3000 locally" --> app
  owner -- "skills, subagents, npm commands" --> app
  app -- "SQL over pg" --> db
  app -. "AI SDK, when a feature uses AI" .-> anthropic
```

## Tech stack

| Area | Technology | Version | Where |
| --- | --- | --- | --- |
| Web framework | Next.js (App Router) | 16.4.3 | `src/app/` |
| UI library | React | 19.3.1 | `src/` |
| Language | TypeScript, strict mode | 5.9.3 | `tsconfig.json` |
| Database | Postgres (local: 17; online: Neon) | 17 | `docker-compose.yml`, `scripts/cloud-setup.sh`, [deployment](deployment.md) |
| Database client | `pg` | 8.23.1 | `src/shared/database/client.ts` |
| Validation | zod | 4.6.7 | schemas in modules, `src/shared/config/env.ts` |
| Styling | Tailwind CSS | 4.3.3 | `src/app/globals.css` |
| Components | shadcn/ui pattern, class-variance-authority, lucide-react | 0.7.1, 1.61.0 | `src/shared/ui/` |
| Animation | Motion, tw-animate-css | 14.6.0, 1.4.0 | components |
| Typeface | Instrument Sans (Fontsource, self-hosted) | 5.3.0 | `src/app/globals.css` |
| URL state | nuqs | 2.10.2 | `src/app/layout.tsx`, module `presentation/url-state.ts` |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) | 7.0.153, 4.0.157, 4.0.91 | `src/shared/ai/`, module `infrastructure/ai/` |
| Markdown streaming | Streamdown | 2.7.1 | `src/shared/ui/ai/ai-response.tsx` |
| Tests | Vitest | 5.0.5 | `vitest.config.ts`, `vitest.integration.config.ts` |
| Runtime | Node.js, in a Claude Code on the web session or in Docker | 22 | `scripts/cloud-setup.sh`, `docker-compose.yml`, `.nvmrc` |
| CI | GitHub Actions | | `.github/workflows/ci.yml` |
| Hosting | Vercel (Hobby, published by Claude through the pinned Vercel CLI) with Neon Postgres, both on free plans | | `package.json` (`vercel-build`), [deployment](deployment.md) |

## Quality goals

| Goal | How the project achieves it |
| --- | --- |
| Runs anywhere with no setup | Cloud sessions prepare themselves, or Docker Compose on a computer; local values live in `docker-compose.yml` ([runtime](runtime-and-configuration.md)) |
| Online with no cloud account to configure | Vercel and Neon on free plans, published by Claude with the Vercel CLI, migrations on build ([deployment](deployment.md)) |
| Predictable place for every change | Modules with four layers, enforced by a test ([architecture](architecture.md)) |
| Changes do not break what works | Unit and integration tests in CI, end-to-end check by Claude in the browser ([testing](testing-and-quality.md)) |
| No leaked secrets or customer data | Secret scan in CI, server-only keys, typed errors without internals ([security](security.md)) |
| Consistent, modern UI | Theme tokens and shared components ([UI](ui.md)) |

Related: [project structure](project-structure.md) · [architecture](architecture.md)
