# 0006 — Anthropic API for the app's AI

## Context

The AI features of the product are built by Claude and the workshop runs in Claude Code on the web, where network secrets are available for most hosts. Claude Code on the web refuses network secrets for Anthropic hosts ("Secrets can't be added for Anthropic hosts"), so the key cannot be injected by the proxy; `api.anthropic.com` is reachable from cloud sessions without allowing any host (an invalid key answers 401). The template first shipped with `@ai-sdk/openai`, which meant a second provider account and a second key for participants.

## Decision

- The app's AI uses the Anthropic API through the Vercel AI SDK provider `@ai-sdk/anthropic` 4.0.91, which replaces `@ai-sdk/openai`. `ai` and `@ai-sdk/react` are unchanged.
- Features read `LLM_API_KEY` (user-provided, optional in the schema) and `LLM_MODEL` (a local value with a default in `docker-compose.yml`, starting with `claude-haiku-5-5`) through `getServerEnv()`.
- In cloud sessions `LLM_API_KEY` is a plain environment variable of the cloud environment holding the real key (participants paste it under Environment variables; the screen warns that Claude Code itself does not use it, which is fine because it is the app's key). Only the code reads it, through `getServerEnv()`; Claude never prints it.
- The app's variables are `LLM_API_KEY` and `LLM_MODEL`, not `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`: Claude Code reserves the `ANTHROPIC_*` names, and the rehearsal showed `ANTHROPIC_API_KEY` set in the cloud environment never reached the session's shell.
- `scripts/check-secrets.mjs` checks Anthropic keys before OpenAI ones, and the OpenAI pattern excludes `sk-ant-`, so an Anthropic key is reported with the right name.

## Alternatives considered

- **Keep OpenAI:** works with the SDK, but needs a second provider account and key and does not match the Claude-centered workshop.
- **Vercel AI Gateway:** one key for many providers, but the AI must stay on Anthropic, it adds a service and a billing path, and it is not needed to reach `api.anthropic.com`.

## Consequences

- Participants need one Anthropic key, saved once as an environment variable of the cloud environment; online, Claude copies it to Vercel through stdin (see decision 0007).
- Changing provider later means replacing the provider package and the model setting in the module's `infrastructure/ai/`; use cases and the streaming pipeline do not change.
- Tests keep mocking the model, so no test calls Anthropic.

Related: [ai](../ai.md) · [runtime and configuration](../runtime-and-configuration.md) · [security](../security.md)
