---
name: test-in-browser
description: Claude tests the application end to end itself, like a real user, in the built-in browser where the product owner watches live - follows every done criterion on screen, checks URLs, console and mobile, and reports with evidence. Runs at the end of every feature implementation, after changes visible on screen, and when asked to test in the browser.
---

# Test in browser

This is the end-to-end test of the project. **You do the test yourself**, using the application like a customer would, in a real browser, while the product owner watches. You do not write end-to-end test files: what stays in the code are the unit and integration tests; this pass checks the whole product working together.

**You do not change any project file during the test.** You only test and report; fixes come after, with the product owner's approval.

## Which browser

1. **The built-in browser of the Claude desktop app (preferred).** Use the preview tools: start the `app` server from `.claude/launch.json` (it runs `docker compose up` on port 3000; if the app is already running, it attaches to it) and drive the app at http://localhost:3000. Before the first step, tell the product owner in one line to open the **Browser** pane (Cmd+Shift+B on macOS, Ctrl+Shift+B on Windows) to follow along.
2. **Fallback, when the built-in browser is not available** (for example, Claude Code in the terminal): the `playwright` server from `.mcp.json`, which runs a headless browser inside Docker. Open http://host.docker.internal:3000 (inside the container, `localhost` is the container itself) and show a screenshot of each step, since there is no window to watch.

## Before starting

1. Check that the app is running: `curl -s http://localhost:3000/api/health` returns `"database":"ok"`. If not, start it (built-in browser) or ask to run `docker compose up` (fallback).
2. Define what to test:
   - at the end of a feature: **every done criterion** approved in the interview, plus the out-of-scope items that must stay absent;
   - otherwise: what came with the command, or what changed on screen.
3. Turn each item into a scenario, one line each, and add at least: one common error (empty field, invalid data), one blocked access if there is a restricted area, and the same main flow at mobile width (390 px). Show the list before starting.

## During the test

- Go step by step like a user: click, type, wait for the screen to respond. Read what appears on screen; do not check things only through the API or the database.
- Say in one short line what you are about to do in each scenario, so the product owner can follow in the browser.
- Use only made-up data with recognizable names (`Teste — ...`). Never real customer data.
- Never read `.env`. Logins use the development credentials in `docker-compose.yml`.
- In each scenario, check the browser console and failed network requests.
- **URL and state** (`url-state` skill): after changing a filter, tab, page or opening an item, the URL changes; reloading brings back the same state; back and forward follow; opening the URL directly shows the same screen.
- **AI features:** check the response streams word by word, stays on topic, uses only the product's data and says when it does not know. Try one off-topic request.
- Take a screenshot at the end of each scenario and whenever something fails.

## How to answer

In the conversation language, a table with one line per scenario:

| Scenario | Result | What happened |
| --- | --- | --- |
| [done criterion or scenario] | ✓ or ✗ | [what appeared on screen, in one sentence] |

End with `X of Y scenarios ok.` and, for each ✗, the likely cause in one line. If something failed, suggest the fix in one line (`/fix-bug [what happened]` outside a feature). The fix comes with a unit or integration test whenever the cause is in a rule, a use case or a repository, and the failed scenarios are repeated in the browser after the fix.
