---
name: code-standards
description: Project code standards - everything in English, no comments in code, clear names, strict TypeScript, tests and where to document what needs explanation. Use whenever writing, changing or reviewing code, tests, scripts or configuration.
---

# Code standards

Applies to every code, test, script and configuration file in the project.

## Language

- **All code is in English:** file and folder names, variables, functions, types, components, API routes, URL paths and query parameters, tables, columns, tests (`describe` and `it`), error and log messages, and commit messages.
- **Project definitions are in English too:** `CLAUDE.md`, skills, subagents, technical documentation and pull request descriptions.
- **Text the end user reads on screen** follows the product language (`CLAUDE.md`, "Product"). It lives in the component, never mixed with logic.
- The conversation with the product owner follows the conversation language (`CLAUDE.md`).

## No comments in code

- Do not write comments: no `//`, no `/* */`, no JSDoc, no `#` in YAML or CSS. Good code explains itself through names.
- If something needs explanation (why a decision was made, non-obvious behavior, a limitation), write it in the technical documentation (`technical-docs` skill): the "Notes" of the module page in `docs/technical/modules/`, of the relevant page, or a decision in `docs/technical/decisions/`.
- When you find a comment, move its content to the technical documentation and delete the comment.

## Names and structure

- Names say what the thing is or does: `isDatabaseConnected`, `sendMessage`, `OrderList`. No `data`, `temp`, `x` or abbreviations.
- Files in `kebab-case` (`chat-message.tsx`); components in `PascalCase`; functions and variables in `camelCase`; global constants in `UPPER_SNAKE_CASE`.
- Short functions with one responsibility. Return early instead of nesting `if`.
- Where things live and what may import what: `project-structure` skill. Every file goes where it says, and `src/architecture.test.ts` checks it.
- LLM and agent integrations follow `ai-integration`. Screens follow `ui-standards`. URLs follow `url-state`.

## TypeScript

- Strict mode, no `any`. Explicit types at boundaries: parameters of exported functions, API responses and database data.
- Validate every external input (request body, parameters, responses from services) with `zod`, using the schemas in the module `application/schemas.ts`; in route handlers, `parseJsonBody` from `src/shared/http/responses.ts`.
- Environment variables only through `getServerEnv()` from `src/shared/config/env.ts`; add new ones to its schema. Local values get a development default in `docker-compose.yml`; only keys the product owner must provide go to `.env.example` ("Configuration" in `project-structure`).
- SQL only in module `infrastructure/` repositories, always with parameters (`$1`, `$2`), never built from user text. Schema changes only through a new migration in `src/shared/database/migrations/`.
- Errors: throw the typed errors from `src/shared/kernel/errors.ts` (`ValidationError`, `NotFoundError`…); route handlers use `withErrorHandling`, which returns the right status without exposing internal details.

## Tests

Two layers of automated tests live in the code. The end-to-end check is done by Claude itself in the browser (`test-in-browser`), not written as test files.

| Layer | What it proves | Where | Run with |
| --- | --- | --- | --- |
| **Unit** | Domain rules and use cases, with fake dependencies; parsers, schemas, helpers | Next to the file: `get-order.ts` → `get-order.test.ts` | `docker compose exec -T app npm test` |
| **Integration** | Repositories and adapters against the real Postgres, with the migrations applied | Next to the file: `order-repository.ts` → `order-repository.integration.test.ts` (only in `infrastructure/` or `shared/database/`) | `docker compose exec -T app npm run test:integration` |
| **End to end** | The whole product working for the user, every done criterion on screen | Not in the code: Claude uses the app in the built-in browser | `test-in-browser` skill |

- **Every rule and use case gets a unit test**, with fake dependencies (see `src/modules/system-status/application/use-cases/get-system-status.test.ts`). External services are never called: for AI, use `MockLanguageModelV4` from `ai/test` (see `src/shared/ai/stream.test.ts`).
- **Every repository gets an integration test.** SQL is never only mocked. The runner recreates the `app_test` database and applies the migrations before each run, so tests may write freely; close the pool in `afterAll` (`await getPool().end()`).
- **Lists and searches prove they have no N+1:** wrap the use case in `countQueries` (`src/shared/database/query-counter.ts`) with few and many rows and assert the same number of queries. Every new or changed query is also checked with `npm run db:explain` (`database-queries`).
- **Do not write end-to-end test files** (no Playwright or Cypress specs). The end-to-end check is `test-in-browser`, at the end of each feature.
- Test names are English sentences that describe the behavior: `it("returns 401 without a password")`.

## Commits

- In English, as `type: what changed`, with `feat`, `fix`, `docs`, `test`, `build` (infrastructure, Docker, CI) or `chore`. Example: `feat: add order history page`.

## Before saying it is done

- [ ] Everything in English, except the text the end user sees
- [ ] No comments in code; what needed explanation is in `docs/technical/`
- [ ] Every file in the place `project-structure` defines
- [ ] No `any`; external inputs validated with `zod`
- [ ] Unit and integration tests cover the new behavior and pass in the `tester` subagent
