---
name: deliver
description: Checks tests, review, documentation and secrets, and prepares the branch, the commit and the pull request description. Use when a feature, change or fix is ready to go into the project.
disable-model-invocation: true
---

# Deliver

Nothing goes into the project without passing the checklist, and the pull request description explains the change to the business and to the technical team.

## Checklist

Check each item and show the result as a list with ✓ or ✗:

1. **Tests and types:** ask the `tester` subagent (types, unit and integration).
2. **End to end:** the browser test (`test-in-browser`) ran after the last change visible on screen, with every done criterion ✓.
3. **Review:** the review was done (phase 4 of `/new-feature`, or the reviewers called in the change or fix) and no high-severity finding is left.
4. **Documentation:** the changelog (`docs/business/en/` and `docs/business/pt-BR/`) has the entry for this delivery and `docs/technical/` reflects what changed, following the `technical-docs` checklist (module page, folder tree, data model, API, configuration).
5. **Secrets:** run `docker compose exec -T app npm run check:secrets` (the same check as CI) and confirm `.env` is not in the diff.
6. **Environment variables:** `docker compose up` works with no `.env`; local values have defaults in `docker-compose.yml`; only user-provided keys are in `.env.example`, without a value.
7. **Code standards:** no comments in code and everything in English (`code-standards` skill).

If any item fails, stop and explain what is missing.

## Steps

1. If on `main`, create the branch: `feature/short-name`, `change/short-name` or `fix/short-name`.
2. Commit anything pending.
3. Write the pull request description, in English:

```markdown
## Summary
[What changes for the user, in business language.]

## What changed
- [Main technical change]

## How to test
1. [Step]

## Checklist
- [x] Types, unit and integration tests
- [x] End-to-end check in the browser, all done criteria ok
- [x] Review with no high-severity findings
- [x] Documentation updated
- [x] No secrets in code
- [x] Runs locally with no setup; user-provided keys listed in .env.example
```

4. The product owner does the push. Show the commands for them to run:

```bash
git push -u origin <branch-name>
gh pr create --fill
```

And hand over the description above to paste into the pull request.
