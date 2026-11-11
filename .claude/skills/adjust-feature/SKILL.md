---
name: adjust-feature
description: Changes the behavior of an existing feature - a rule, a text, a field, a flow - with minimal impact, a test and updated documentation. Use when the request is to change something that already works, not to build something new.
---

# Adjust an existing feature

Change only what is needed, prove it with a test and keep the documentation accurate.

1. **Understand what exists:** `docs/business/en/features.md` and, to locate files, the `explorer` subagent.
2. **Confirm only when it is ambiguous:** if the request leaves the new behavior unclear or contradicts a documented business rule, answer "Hoje: … Depois: … Impacto: …" and wait. If it is clear, go ahead. If it is large (more than a day of work), suggest `/new-feature`.
3. **Branch:** the session's branch in the cloud; otherwise `change/<short-name>` (never on `main`).
4. **Test first:** update or write the tests for the new behavior, then change the code with the smallest change that makes them pass, following the skills that apply. Queries changed: `db:explain` and `countQueries`. Configuration changed: update `infra/` for `dev` and `prod`.
5. **Confirm:** the `tester` subagent passes; if the change is visible on screen, check it with `test-in-browser`.
6. **Review only when it matters:** if it touches routes, customer data, integrations or AI, call the `reviewer` once and fix high findings.
7. **Document:** call the `documenter` (changelog entry with "Change:"/"Ajuste:" and the features update).
8. Commit `feat: [what changed]` and answer in up to 5 lines: what changed and how to see it on screen.

Do not use the change as an excuse to touch other things.
