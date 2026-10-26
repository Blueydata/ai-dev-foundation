# 0001 — Initial stack

**Date:** 2026-10-26 · **Status:** accepted

## Context

The project needs a simple base to build AI-powered web products that runs the same way on any machine and that Claude knows well.

## Decision

- **Next.js with TypeScript:** pages and API in the same project; types catch errors early.
- **Postgres:** a mature relational database, enough for most early products.
- **Docker Compose:** starts the database and the app with one command; nothing but Docker is installed on the computer.
- **Tailwind CSS + shadcn/ui + Motion:** a consistent, modern UI built from shared components and design tokens.
- **Vercel AI SDK:** one API for LLMs and agents, with streaming, tools and React hooks.
- **Vitest:** fast, simple tests.
- **GitHub Actions with a project secret scan:** every change goes through types, tests and a secret scan before it is merged. No external tool or license, so it works in personal and organization accounts.

## Consequences

- Running the project requires only Docker; Node.js, the dependencies and the database run inside containers.
- Calls to external services happen in server routes, never in the browser.
- Code is written in English and has no comments; explanations live in `docs/technical/`.
