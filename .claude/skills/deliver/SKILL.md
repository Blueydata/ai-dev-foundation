---
name: deliver
description: Runs the final checks and opens the pull request for a finished feature, change or fix. Use when the work is ready to go into the project.
disable-model-invocation: true
---

# Deliver

1. **Checks** (show ✓ or ✗ for each; stop only on a ✗ you cannot fix yourself):
   - the `tester` subagent: types, unit and integration tests;
   - `npm run check:secrets` reports nothing and no `.env` is in the diff;
   - the browser test ran after the last change visible on screen;
   - the review left no high finding and `docs/` has the entry for this delivery.
   Fix what is missing yourself (a failing test, a missing changelog line) and commit it.
2. **Branch:** commit anything pending on the work branch (the session's branch in the cloud; `feature/…`, `change/…` or `fix/…` otherwise). Never on `main`.
3. **Pull request**, description in English:

```markdown
## Summary
[What changes for the user, in business language.]

## What changed
- [Main technical change]

## How to test
1. [Step]
```

4. **Cloud session:** push the branch and open the pull request yourself; give the product owner its link and say that CI checks types, tests, queries, secrets and the production build there, and Vercel adds a preview link to the pull request when the project is connected (`deploy`). **On a computer:** show the product owner the commands to run:

```bash
git push -u origin <branch-name>
gh pr create --fill
```

Then one line: after the merge, `/clear` and the next feature.
