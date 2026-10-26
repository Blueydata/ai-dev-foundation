---
name: fix-bug
description: Fixes a bug methodically - reproduces it with a failing test, fixes the root cause, confirms with the tests, reviews and documents. Use when something does not work as it should, when a customer reports an error or when a test breaks.
---

# Fix a bug

The goal is to fix the cause, not the symptom, and make sure the same bug does not come back. Every fixed bug leaves a test behind.

## Steps

1. **Understand the report.** Summarize in one sentence what happens and what should happen. If information is missing (where, when, with which data), ask before going on.
2. **Locate.** Ask the `explorer` subagent for the files involved instead of reading the whole project.
3. **Reproduce with a test.** Write the test at the layer that shows the bug: unit next to the rule or use case, integration next to the repository, and confirm with the `tester` subagent that it **fails**. If the bug only shows on screen, reproduce it in the browser (`test-in-browser`) and write the test for the cause you find. If you cannot reproduce it, stop and explain what you tried.
4. **Find the cause.** Explain in up to 3 lines why the bug happens.
5. **Fix** with the smallest change that solves the cause, following `code-standards`. Do not refactor other things along the way.
6. **Confirm** with the `tester`: the new test passes and the existing ones still pass. If the bug was visible on screen, repeat the scenario in the browser with `test-in-browser`.
7. **Review:** if the bug is about security or customer data, ask the `security-reviewer` to check the fix.
8. **Record and document:**
   - ask the `business-documenter` for a changelog entry starting with "Fix:" ("Correção:" in the pt-BR version) and, if the visible behavior changed, the features update; if the fix changed the architecture, also ask the `technical-documenter`;
   - commit: `fix: [what was fixed]`.
9. Answer with: what the bug was, the cause, the fix and the name of the test that protects against it.

## Rules

- No reproducing test, no fix: only an attempt.
- If the fix requires changing a behavior documented in `docs/business/en/features.md`, stop and ask the product owner.
