---
name: deliver
description: Closes a finished feature, change or fix - runs the final checks, makes sure every step is merged into main and publishes production on Vercel. Use when the work is ready.
disable-model-invocation: true
---

# Deliver

Every stage was already merged into `main` and shown in a preview (`deploy` skill, "Merge and show a step"). Delivering closes the work and puts it in production.

1. **Checks** (show ✓ or ✗ for each; fix yourself what you can, commit, and merge and show again):
   - the `tester` subagent: types, unit and integration tests;
   - `npm run check:secrets` reports nothing and no `.env` file is tracked;
   - the browser test ran after the last change visible on screen;
   - the review left no high finding and `docs/` has the entry for this delivery;
   - `main` has every commit of the work branch (`git fetch origin main` and `git log origin/main..HEAD` is empty) and CI is green on `main`.
2. **Production:** publish `main` (`deploy` skill, "Production") and check it.
3. **Answer** in up to 6 lines: the checklist, the production link, what changed for the user in one sentence, and the next step: `/clear` and the next feature.

On a computer with Docker, production is published the same way when the Vercel CLI and token are available; otherwise show the product owner the commands to push `main` and stop there.
