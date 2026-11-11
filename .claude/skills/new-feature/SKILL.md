---
name: new-feature
description: Takes a new feature from request to delivery - a short interview, one approval of the understanding and plan, then implementation, browser test, review and documentation in one go. Use when someone asks for something new in the product.
---

# New feature

The product owner says what they want in a few words. You drive the rest. There is **one approval point**: the understanding and the plan, together. After it you build, test, review and document without stopping, and come back with the result. Stop earlier only for a real blocker or a decision that is the product owner's (a new package, a change of scope, a missing key).

The understanding and the plan live in this conversation; do not create specification or plan files. Talk to the product owner in the conversation language (`CLAUDE.md`), in business terms.

## 1 — Interview

1. Read the "Product" section of `CLAUDE.md` and, if it exists, `docs/business/en/features.md`. Do not read code yet.
2. If the request already answers who uses it, what is in and out and how to know it is done, skip the questions. Otherwise ask **at most 5**, numbered, one line each, in one message. If the request is too large for one delivery, propose a first part.

## 2 — Understanding and plan (the approval point)

1. Read `docs/technical/README.md` and `architecture.md`; use the `explorer` subagent only if you need to locate code.
2. Present in one message, in at most 30 lines:

```
**Entendimento**
- Problema · Quem usa · Dentro · Fora
- Pronto quando:
  1. [something the product owner can check on screen]

**Plano**
1. [stage]: [what it delivers] — [main files or module]
```

   At most 4 stages, each one testable on its own. Mention only what the product owner should weigh: new tables, new packages (with the reason), keys they must provide, and decisions to record. The skills (`project-structure`, `code-standards`, `database-queries`, `ui-standards`, `url-state`, `ai-integration`) are followed during implementation and do not need to be restated in the plan.
3. **Stop and wait for approval.** Adjust as many times as needed. If the product owner is in plan mode, they approve on the plan mode screen.

## 3 — Build (no stops)

1. **Branch:** in a cloud session, work on the branch the session was given. Otherwise create `feature/<short-name>` from `main` (if there are uncommitted changes, ask first). Never implement on `main`.
2. For each stage, in order, saying in one line which stage you are on:
   - write the code with its unit and integration tests, following the skills that apply;
   - validate new queries (`database-queries`: integration test, `countQueries` on lists, `npm run db:explain`);
   - new environment variables follow "Configuration" in `project-structure`;
   - run the `tester` subagent and fix until it passes (after 3 failed attempts, stop and explain);
   - if the stage changed something on screen, check it in the browser right away (a quick pass of `test-in-browser` on what the stage delivered), send a screenshot and say in one line which page to open in the preview to try it;
   - commit `feat: [what the stage delivers]`.
3. **Browser test:** run `test-in-browser` with every done criterion and the out-of-scope items. Fix what fails (with a test when the cause is in a rule or repository) and repeat those scenarios.
4. **Review:** call the `reviewer` subagent once, passing the done criteria, the out-of-scope list, a summary of what was built and the browser test table. Fix the **high** findings right away (with a test and a commit) and keep the medium ones for the report.
5. **Documentation:** call the `documenter` subagent with the understanding, a summary of what was built and the decisions to record. Commit `docs: [feature name]`.

## 4 — Result

Answer in up to 12 lines:

- the browser test table (done criteria ✓/✗);
- what the review found and what was fixed; medium findings left, one line each, if any;
- how to see it on screen, and the new variables to add in Vercel, if any (`deploy`);
- next step: `/deliver` (and, after it, `/clear` for the next feature).

## Rules

- One approval point. Do not ask "can I continue?" between stages, the test, the review or the documentation.
- One commit per stage, all on the feature branch.
- Keys and logins only from the environment (cloud environment settings or `.env` with Docker), never written in the conversation; external API keys only on the server.
