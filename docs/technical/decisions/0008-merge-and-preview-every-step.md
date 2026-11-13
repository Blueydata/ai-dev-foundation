# 0008 — A merge and a preview for every step

## Context

Decision [0007](0007-claude-publishes-through-the-vercel-cli.md) had Claude publish a preview at `/deliver` and production only after the product owner merged a pull request on GitHub. In a workshop and for a non-programmer, that leaves the product owner without anything to look at for most of the build, and the merge is a manual step in another tool. When a feature needed something the project did not have, nothing said where to look first.

## Decision

- Every stage of `/new-feature`, every `/adjust-feature` and every `/fix-bug` whose tests pass is committed, merged into `main` (`git push origin HEAD:main`, merging `origin/main` first if it moved, never rebasing) and published as a Vercel preview. The product owner gets the link with one line on what to look at, and Claude goes on without waiting.
- `/setup-project` prepares Vercel before any feature: project, Neon database (`integration accept-terms neon --yes`), settings, keys and a first preview checked with `/api/health`. A new session only links again.
- `/deliver` runs the final checks, confirms `main` has every commit and CI is green, and publishes production from `main`.
- `/setup-project` checks that `LLM_API_KEY` works (a non-printing call to the Anthropic models endpoint) and that the Vercel token works (`whoami`).
- A capability the project does not have is looked for first in the Vercel Marketplace (`integration discover`, `integration guide`), proposed with its free plan and installed only after approval.

## Alternatives considered

- **Pull request per feature:** reviewable on GitHub, but adds a manual merge and shows nothing until the end.
- **Git integration with automatic previews:** limited to personal repositories on Hobby, and publishes without Claude checking the result (see 0007).
- **Writing every capability in the project or picking any external service:** more code to maintain and more accounts for the product owner.

## Consequences

- `main` always holds tested steps that were shown in a preview; each one is a safe point to go back to.
- There is no pull request review; quality relies on the tests, the `reviewer` subagent and CI on `main`.
- Previews and production share the Neon database unless a Neon branch is used.
- New capabilities usually arrive with a free plan and their variables already set on Vercel.

Related: [deployment](../deployment.md) · [decision 0007](0007-claude-publishes-through-the-vercel-cli.md)
