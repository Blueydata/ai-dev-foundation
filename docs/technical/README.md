# Technical documentation

How the system is built, for a developer who just joined. The code has no comments, so everything that needs explanation is here. The pages follow the `technical-docs` skill and are updated by the `technical-documenter` subagent after every delivery.

## Reading order

1. [Overview](overview.md): what the system is, who talks to it and the tech stack.
2. [Project structure](project-structure.md): the complete folder tree and where each kind of file goes.
3. [Architecture](architecture.md): layers, dependency rules, request lifecycle and error handling.
4. [Runtime and configuration](runtime-and-configuration.md): how it runs in Docker, environment variables and commands.
5. The page of the module you will work on, in [modules](modules/).

## All pages

| Page | Covers |
| --- | --- |
| [overview.md](overview.md) | Purpose, context diagram, tech stack with versions, quality goals |
| [project-structure.md](project-structure.md) | Annotated folder tree of the whole repository |
| [architecture.md](architecture.md) | Layers, dependency rules, request lifecycle, error handling, module map, notes |
| [modules/system-status.md](modules/system-status.md) | The reference module: app and database health |
| [data-model.md](data-model.md) | Tables, relationships and migrations |
| [api.md](api.md) | Every route, with input, output, errors and examples |
| [runtime-and-configuration.md](runtime-and-configuration.md) | Docker Compose topology, startup, environment variables, commands |
| [testing-and-quality.md](testing-and-quality.md) | Test layers, CI pipeline, architecture rules, secret scan |
| [security.md](security.md) | Threats and the control that handles each one |
| [ai.md](ai.md) | AI integration and the streaming pipeline |
| [ui.md](ui.md) | Theme, typeface, shared components, layouts and URL state |

## Decisions

| # | Decision | Status |
| --- | --- | --- |
| [0001](decisions/0001-initial-stack.md) | Initial stack | accepted |
| [0002](decisions/0002-modular-architecture.md) | Modular architecture in `src` | accepted |

Business documentation, for non-technical readers, is in [`docs/business/`](../business/) once the first feature is delivered.
