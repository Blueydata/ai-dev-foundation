---
name: adjust-feature
description: Changes the behavior of an existing feature - a rule, a text, a field, a flow - with minimal impact, a test and updated documentation. Use when the request is to change something that already works, not to build something new.
---

# Adjust an existing feature

Adjustments look small, but they are where working things break most often. The goal is to change only what is needed, prove it with a test and keep the documentation accurate.

## Steps

1. **Understand what exists.** Read the feature in `docs/business/en/features.md` and ask the `explorer` subagent for the files involved.
2. **Confirm the change.** Answer, in the conversation language, with "Today: [current behavior]. After: [new behavior]. Impact: [what else may be affected]." **Stop and wait for confirmation.** If the change is large (more than a day of work), suggest handling it as `/new-feature`.
3. **Test first.** Update or create the tests that describe the new behavior, in the layers it touches (unit, integration), and confirm with the `tester` subagent that they fail.
4. **Change the code** with the smallest possible change, following `code-standards` (and `ui-standards` and `url-state` if it touches screens, `ai-integration` if it touches AI).
5. **Confirm** with the `tester` that everything passes, including the existing tests. If the change is visible on screen, check it in the browser with `test-in-browser`, before and after showing the new behavior.
6. **Review:** if the change touches routes, customer data or integrations, ask the `security-reviewer`; if it touches screens, the `ux-reviewer`.
7. **Document:** call in parallel the `business-documenter` (features and changelog in both languages, with "Change:") and, if something technical changed, the `technical-documenter`.
8. Commit: `feat: [what changed]`, and answer with the summary and how to test it on screen.

## Rules

- Do not use the change as an excuse to touch other things.
- If the change contradicts a business rule documented in `docs/business/en/features.md`, warn before going on.
