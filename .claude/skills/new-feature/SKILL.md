---
name: new-feature
description: Takes a new feature from request to delivery - interviews the product owner, plans, implements stage by stage, reviews and documents - stopping for the product owner's approval between phases. Use when someone asks for something new in the product.
---

# New feature

The product owner says what they want in a few words. You drive the rest: interview, plan, implementation, review and documentation. There are five phases, and **between phases you stop and wait for approval**. The product owner decides; you ask, propose, build and show.

The specification and the plan live in this conversation. **Do not create specification or plan files.** What stays in the project is the code, the tests and the documentation of what was delivered, written by the documenters in phase 5. If the conversation gets long, suggest `/compact`: the compact instructions in `CLAUDE.md` keep the approved understanding and the plan.

Talk to the product owner in the conversation language (`CLAUDE.md`), in business terms.

## Phase 1 — Interview

1. Read the "Product" section of `CLAUDE.md` and, if it exists, `docs/business/en/features.md`, to learn what the product already does. Do not read code in this phase.
2. If the request is too large for one delivery, propose splitting it into smaller parts and ask which one to start with.
3. Ask **at most 5 questions**, numbered, one line each, in a single message, covering: who uses it and in which situation; which problem it solves; what is in this version; what is out; how we will know it is done. Do not ask what the request already makes clear.
4. If the answers leave important gaps, ask **one** short round of follow-up questions.
5. Present the understanding in this format (headings in the conversation language):

```
**Understanding**
- Problem: ...
- Who uses it: ...
- In scope: ...
- Out of scope: ...
- Done criteria:
  1. [something the product owner can check on screen; Claude tests each one in the browser at the end]
```

6. **Stop and ask whether the understanding is approved.** Adjust as many times as needed.

## Phase 2 — Plan

1. Read `docs/technical/README.md`, `architecture.md`, the pages of the modules involved and `decisions/`. To locate code, use the `explorer` subagent.
2. Build a plan with **at most 5 stages**, each one deliverable and testable on its own, with goal, files, risks (security, customer data, new packages, data volume) and its tests: unit tests for its rules and use cases and integration tests for its repositories (`code-standards`, "Tests"). For stages that store or read data, list the tables, the indexes and the queries that must be validated (`database-queries`). For each stage, say what changes in the infrastructure of `dev` and `prod` (new environment variables, secrets, resources), following `infrastructure-as-code`, or "no infrastructure change". The plan ends with the end-to-end check: Claude tests every done criterion in the browser after the last stage. Name the files following the `project-structure` skill: the module and its layers (domain rules, use cases and ports, repositories and gateways, AI, components), migrations and routes. Build each stage inside out: domain, application, infrastructure, wiring, presentation.
3. Prefer what the project already uses. A new package only with the reason explained. Mark relevant technical decisions as "decision to record".
4. Present the plan. If the product owner is in plan mode, they approve it on the plan mode screen. **Stop and wait for approval**; adjust as many times as needed.
5. Once approved, **stop and ask whether you can start stage 1.**

## Phase 3 — Implementation (one stage at a time)

1. Say in one line which stage you are on ("Stage 2 of 3: ...").
2. Read only the files for the stage. Write the unit and integration tests together with the code. External services are mocked. Follow `project-structure` and `code-standards`; if the stage has screens, `ui-standards` and `url-state`; if it uses AI, `ai-integration`; if it stores or reads data, `database-queries`.
3. Ask the `tester` subagent to run types, unit and integration tests. Fix until they pass; after 3 failed attempts, stop and explain.
4. **Validate the queries** the stage added or changed (`database-queries`, "Validating queries"): integration tests for the results, `countQueries` for lists, and `docker compose exec -T app npm run db:explain -- "<query>"` on the development data. Fix any large sequential scan or N+1 before going on.
5. If a new environment variable appeared, follow "Configuration" in `project-structure`: a local default in `docker-compose.yml`, or `.env.example` only for keys the product owner must provide.
6. **Infrastructure:** if the stage changes configuration or needs a new resource, call the `infrastructure-engineer` subagent with a summary of the stage; it updates `infra/` for `dev` and `prod` (`infrastructure-as-code`) and runs `docker compose run --rm infra check`. Commit: `feat: [what the stage delivers]`.
7. Answer in up to 5 lines: what was done, the query validation result, and how to see it on screen. If more stages remain, **stop and ask whether to move to the next stage**.

### End of implementation: end-to-end test in the browser

After the last stage, before the review:

1. Call the `infrastructure-engineer` with the approved understanding and the plan, to confirm that `dev` and `prod` cover everything the feature needs and that `docker compose run --rm infra check` passes. Commit any change: `build: infrastructure for [feature name]`.
2. Run the `test-in-browser` skill with **every done criterion** and the out-of-scope items, in the built-in browser, so the product owner watches you use the product.
3. If a scenario fails, explain the cause in one line, fix it (with a unit or integration test when the cause is in a rule, a use case or a repository), and repeat the failed scenarios in the browser.
4. Show the final table and **stop and ask whether to move to the review**.

## Phase 4 — Review

1. Call the subagents below **in parallel**. They do not see this conversation, so pass what each one needs in the call:
   - `validator`: the done criteria and the out-of-scope list, exactly as approved, and the result table of the browser test;
   - `code-reviewer`: a summary of what is in and out of scope and the queries validated;
   - `security-reviewer`: a summary of the feature, including the infrastructure changes;
   - `ux-reviewer`: who uses the screen and in which situation (only if there are screens).

2. Merge everything into a single report, including the browser test result: "X of Y done criteria met" and the findings by severity (high, medium, low), merging duplicates.
3. **Stop and ask which findings to fix.** High-severity findings must be fixed before delivery; each fix comes with a test and a commit, and fixes visible on screen are checked again in the browser (`test-in-browser`).
4. With the fixes done, **stop and ask whether to move to documentation.**

## Phase 5 — Documentation

1. Call both documenters **in parallel**, passing the approved understanding, the plan and the decisions to record:
   - `business-documenter`: features and changelog, in `docs/business/en/` and `docs/business/pt-BR/`;
   - `technical-documenter`: every page of `docs/technical/` the feature touches, following the `technical-docs` skill (module page with diagrams and its main queries, folder tree, data model with indexes, API reference, configuration, infrastructure), and one page in `docs/technical/decisions/` for each decision to record.
2. Commit: `docs: [feature name]`.
3. Show the list of documentation files changed and a 3 to 5 line summary. Suggest `/deliver` as the next step and, after delivery, `/clear` to start the next feature in a clean conversation.

## Rules

- Never skip a phase or an approval point.
- Answer short and direct, as the "How to answer" section of `CLAUDE.md` requires.
- The interview is in business language; code only from phase 3 on.
- One stage at a time, one commit per stage.
- `docker compose up` keeps working with no setup; user-provided keys and credentials only through `.env`, chosen by the product owner and never written in the conversation; external API keys only on the server.
- Every query validated before the stage is done; every feature leaves `infra/` ready for `dev` and `prod`.
