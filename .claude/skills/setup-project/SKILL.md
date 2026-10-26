---
name: setup-project
description: Guided setup of the project - checks Git and Docker, starts the app with Docker Compose, checks database, tests, secrets, keys and product context, and guides the person step by step until everything is ready. Use on first use, after cloning Dev Foundation, before a workshop, or when something stops working.
---

# Setup project

Take the person from "just cloned" to "ready to develop". Check each item in order; when something is missing, give the exact next step for their operating system, wait for them to say it is done, and check again. Do what you safely can yourself (starting the containers); never install software, change system settings or read `.env`.

The computer only needs **Git**, **Docker Desktop** and **Claude** (this app). Node.js, the dependencies, the database and the browser all run inside Docker: never ask the person to install them.

## Steps

Find the operating system first (`uname -s`; on Windows the shell reports MINGW, MSYS or similar) so every instruction matches it.

1. **Git:** `git --version`.
   - Missing on macOS: run `git --version` in the Terminal and accept the installation the system offers.
   - Missing on Windows: install Git for Windows from https://git-scm.com/download/win with the default options, then reopen the app.
2. **Docker installed:** `docker --version`.
   - Missing: install Docker Desktop from https://www.docker.com/products/docker-desktop (on Windows, accept enabling WSL 2 and restart).
3. **Docker running:** `docker info --format "{{.ServerVersion}}"`.
   - Fails: open Docker Desktop and wait until it says it is running, then say "pronto".
4. **Project folder:** `test -f docker-compose.yml`. If it fails, the app was opened in the wrong folder: tell the person to open the project folder (the folder created by `git clone`, `ai-dev-foundation` by default).
5. **App and database running:** `curl -s http://localhost:3000/api/health`.
   - If it does not answer with `"database":"ok"`, start everything yourself: `docker compose up -d --wait` with a long timeout (the first run downloads the images and installs the dependencies, which can take several minutes; say so before starting). Then check the health again.
   - If it still fails, read `docker compose logs --tail 40 app`, explain the cause in one line and the fix. A busy port 3000 means another program is using it: ask the person to close it.
6. **Tests and types:** ask the `tester` subagent.
7. **Secrets:** `docker compose exec -T app npm run check:secrets` reports nothing.
8. **User-provided keys:** `docker compose exec -T app npm run check:env`. Missing keys are **optional** for setup: say which features need them, where to get each key, and that it goes into a `.env` file in the project folder (then `docker compose up -d` again).
9. **Product context:** the "Product" section of `CLAUDE.md` has no bracketed placeholders left. If it does, that is the next step, not a problem.
10. **Built-in browser:** in the Claude desktop app, tell the person they can open the **Browser** pane (Cmd+Shift+B on macOS, Ctrl+Shift+B on Windows) to see the app at http://localhost:3000.

## How to answer

In the conversation language (`CLAUDE.md`), short:

- While something is missing: show the list so far with ✓ or ✗ and, for the **first** ✗ only, the exact steps to fix it. End with: `Me avise quando terminar que eu confiro de novo.`
- When the person says it is done, check again from that item on.
- When everything is ready:

```
✓ Git
✓ Docker instalado e rodando
✓ Aplicação e banco no ar (http://localhost:3000)
✓ Testes e tipos
✓ Sem segredos no código
– Chave da OpenAI não configurada (opcional: só o chat precisa dela)
✗ "Product" ainda não preenchido no CLAUDE.md → é o próximo passo
```

Then one line: ready to develop, start by filling in the "Product" section, then `/new-feature` and what you want.

Do not explain what each item is unless asked.
