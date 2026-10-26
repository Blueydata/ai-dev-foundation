# 0002 — Modular architecture in src

**Date:** 2026-10-26 · **Status:** accepted

## Context

Most of the code is written by AI agents, one feature at a time, and the product can grow in any direction: screens, forms, APIs, webhooks, external services, AI agents, scheduled jobs. Without a fixed place for each kind of code, changes spread across folders, files mix responsibilities and the agent has to search the whole project to know where to work.

## Decision

- All source code lives in `src/`.
- The product is split into business modules in `src/modules/<module>/`, each with the same four layers: `domain` (rules), `application` (use cases and ports), `infrastructure` (database, external APIs, AI) and `presentation` (components, hooks, server actions, URL state), plus an `index.ts` that wires use cases with their implementations.
- Shared code lives in `src/shared/`: UI, typed errors, HTTP helpers, configuration, database, AI streaming and utilities.
- `src/app/` only routes.
- Use cases receive their dependencies, so tests pass fakes and implementations can change without touching rules.
- Modules talk only through `index.ts`, from `infrastructure`, behind a port.
- Database changes come only as ordered SQL migrations.
- `src/architecture.test.ts` enforces the rules on every `npm test` and in CI.

## Alternatives considered

- **Folders by technical type at the root** (`components/`, `services/`, `lib/`): simple at first, but one feature ends up spread across many folders.
- **Feature folders without layers:** less structure, but rules, SQL and AI calls end up mixed in the same files as the product grows.
- **A lint plugin for import boundaries:** more configuration and another dependency; a Vitest test with the TypeScript compiler covers the same rules.
- **An ORM with its own migrations:** more power, but more concepts; plain SQL keeps the database visible.

## Consequences

- An agent or a new developer knows where every file goes from the module name and the kind of code.
- Business rules are testable without a database, a provider or a browser.
- Replacing a database, an external service or an AI provider touches only `infrastructure`.
- Small features carry some ceremony (port, use case, wiring); layers and files are created only when needed.
