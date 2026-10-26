---
name: technical-docs
description: Standard for the technical documentation in docs/technical - which pages exist, what each one must contain, Mermaid diagrams (context, layers, sequence, ER, class, deployment), the annotated folder tree, the API reference, module pages and decision records, and how to keep them in sync with the code. Use whenever writing or updating technical documentation, after any delivery that changes code, and when asked to document the system.
---

# Technical documentation

The technical documentation is how a developer who just joined understands the system **without reading the code**, and the code has no comments, so everything that needs explanation lives here. It is written in English, it is complete, and it always matches the code. Diagrams come first; text explains what the diagram cannot.

## Pages

```
docs/technical/
  README.md                     Index: what each page covers, reading order, how the docs are kept up to date
  overview.md                   What the system does, context diagram, tech stack with versions, quality goals
  project-structure.md          The complete annotated folder tree and where each kind of file goes
  architecture.md               Layers, dependency rules, request lifecycle, error handling, module map, notes
  modules/<module>.md           One page per module in src/modules: purpose, use cases, ports, flows, data, routes, tests
  data-model.md                 ER diagram of every table, columns, constraints, indexes, migrations
  api.md                        Every route: method, path, access, input, output, errors, example
  runtime-and-configuration.md  Docker Compose topology, startup sequence, environment variables, commands
  testing-and-quality.md        Test layers, how to run them, CI pipeline, architecture rules, secret scan
  security.md                   Threats and the control that handles each one, where it lives in the code
  ai.md                         Models, agents, tools, instructions, streaming pipeline, limits (when the product uses AI)
  ui.md                         Theme tokens, typeface, shared components and layouts, screen states, URL state
  decisions/NNNN-title.md       One decision record per relevant technical decision
```

Every page starts with one paragraph saying what it covers and ends with a "Related" line linking the pages a reader needs next. Use relative links between pages and to code (`../../src/modules/orders/index.ts`).

## Diagrams (Mermaid)

Write diagrams as Mermaid code blocks (```` ```mermaid ````): GitHub and most editors render them, and they live in the repository next to the text. Every page that describes structure or behavior has at least one.

| To show | Diagram | Where |
| --- | --- | --- |
| The system and who/what talks to it | `flowchart LR` with people, the app, the database and external services | `overview.md` |
| Layers and allowed dependencies | `flowchart TB` with one subgraph per layer, arrows in the allowed direction | `architecture.md` |
| A request from the browser to the database and back | `sequenceDiagram` with Browser, route, module index, use case, repository, Postgres | `architecture.md`, module pages |
| A use case, its ports and their implementations | `classDiagram` | module pages |
| Tables and relationships | `erDiagram` with every column, type and key | `data-model.md`, module pages (only their tables) |
| Containers, ports and volumes | `flowchart LR` | `runtime-and-configuration.md` |
| Startup and CI pipelines | `flowchart LR` | `runtime-and-configuration.md`, `testing-and-quality.md` |
| A streamed AI answer or agent loop | `sequenceDiagram` | `ai.md` |

Rules for diagrams:

- Names in the diagram are the real names in the code (`createGetOrder`, `orders` table, `/api/orders/[orderId]`), so a reader can search for them.
- One idea per diagram; split when it passes about 15 nodes.
- Keep the syntax simple (quoted labels with special characters, no styling, no HTML) so it renders everywhere.
- Every diagram has one sentence before it saying what it shows.

## Folder structure

`project-structure.md` holds the **complete** tree of the repository (every folder and the main files, not `node_modules`), each line with a short comment of what it holds. Generate it from the real tree (`find`, `ls`), never from memory, and update it whenever folders or files are added, moved or removed. Module folders are listed down to their files.

## Module pages

Every module in `src/modules/` has `docs/technical/modules/<module>.md` with these sections:

1. **Purpose:** what business capability it covers, in two sentences.
2. **Files:** the module tree with one line per file.
3. **Domain:** the concepts and rules, with the function names.
4. **Use cases:** a table with use case, input, output, errors and the ports it needs.
5. **Ports and adapters:** a `classDiagram` of use cases, ports and implementations.
6. **Flows:** a `sequenceDiagram` for each main flow (from the screen or route to the database and back).
7. **Data:** the module's tables (`erDiagram`) and migrations, or "No tables".
8. **Routes and screens:** pages and API routes that use the module, with URL parameters.
9. **Configuration:** environment variables it reads and which kind they are (local default or user-provided).
10. **Tests:** unit and integration test files and what they cover.
11. **Notes:** anything not obvious from the code.

## API reference

`api.md` lists every route in `src/app/` that is not a page, and every page with its URL parameters. For each API route:

| Field | Content |
| --- | --- |
| Method and path | `POST /api/orders` |
| Access | public, logged-in admin, internal job |
| Input | the zod schema name and a JSON example |
| Output | the status codes and a JSON example of each |
| Errors | the `AppError` codes it can return and why |
| Example | a `curl` command that works against the local app |
| Code | link to the route file and the use case |

## Keeping it in sync

- After every delivery, the `technical-documenter` updates every page the change touches; a new module gets its module page, a new table updates `data-model.md`, a new route updates `api.md`, a new variable updates `runtime-and-configuration.md`, a new folder updates `project-structure.md`.
- Decisions with alternatives (a library, a data model, a security approach) get a record in `decisions/`, listed in `README.md`.
- Facts come from the code and the commands' output, never from the plan alone. If the code and the plan differ, document the code and say so in the answer.
- Never write secret values, only variable names.

## Before saying the documentation is done

- [ ] Every page touched by the change is updated, in English
- [ ] Every new module has its page with the eleven sections
- [ ] Diagrams use real names and match the code
- [ ] `project-structure.md` matches the real tree
- [ ] `api.md` has every route with examples; `data-model.md` has every table
- [ ] `README.md` lists every page and decision
