---
name: fix-bug
description: Fixes a bug methodically - reproduces it with a failing test, fixes the root cause, confirms with the tests and documents. Use when something does not work as it should, when a customer reports an error or when a test breaks.
---

# Fix a bug

Fix the cause, not the symptom, and leave a test so it does not come back.

1. **Understand:** one sentence with what happens and what should happen. Ask only if you cannot reproduce it without more information.
2. **Locate:** the `explorer` subagent, instead of reading the whole project. For slowness or wrong data, look at the data and the plan with `npm run db:query` and `npm run db:explain` first.
3. **Branch:** the session's branch in the cloud; otherwise `fix/<short-name>` (never on `main`).
4. **Reproduce with a test** at the layer that shows the bug (unit next to the rule or use case, integration next to the repository) and confirm with the `tester` that it fails. If it only shows on screen, reproduce it with `test-in-browser` and write the test for the cause. If you cannot reproduce it, stop and say what you tried.
5. **Fix** with the smallest change that solves the cause, following `code-standards`. Confirm with the `tester`; if it was visible on screen, repeat the scenario in the browser.
6. **Security or customer data bug:** call the `reviewer` once on the fix.
7. **Document:** call the `documenter` for a changelog entry ("Fix:"/"Correção:"). Commit `fix: [what was fixed]`.
8. **Merge and show** (`deploy` skill, "Merge and show a step"): merge into `main` and publish a preview.
9. Answer in up to 5 lines: the bug, the cause, the fix, the test that protects against it and the preview link to check it.

If the fix changes a behavior documented in `docs/business/en/features.md`, ask the product owner first.
