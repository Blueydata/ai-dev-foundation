# 0006 — Anthropic API for the app's AI

## Context

The AI features of the product are built by Claude and the workshop runs in Claude Code on the web, where the environment already supports network secrets for hosts such as `api.anthropic.com`. The template first shipped with `@ai-sdk/openai`, which meant a second provider account and a second key for participants.

## Decision

- The app's AI uses the Anthropic API through the Vercel AI SDK provider `@ai-sdk/anthropic` 4.0.91, which replaces `@ai-sdk/openai`. `ai` and `@ai-sdk/react` are unchanged.
- Features read `ANTHROPIC_API_KEY` (user-provided, optional in the schema) and `ANTHROPIC_MODEL` (a local value with a default in `docker-compose.yml`, starting with `claude-haiku-5-5`) through `getServerEnv()`.
- In cloud sessions the key is a network secret for `api.anthropic.com` (header `x-api-key`, no prefix); the variable holds the placeholder `via-network-secret` and the proxy injects the real key, so Claude and the code never see it.
- `scripts/check-secrets.mjs` checks Anthropic keys before OpenAI ones, and the OpenAI pattern excludes `sk-ant-`, so an Anthropic key is reported with the right name.

## Alternatives considered

- **Keep OpenAI:** works with the SDK, but needs a second provider account and key and does not match the Claude-centered workshop.
- **Vercel AI Gateway:** one key for many providers, but the AI must stay on Anthropic, it adds a service and a billing path, and the network secret already covers `api.anthropic.com`.

## Consequences

- Participants need one Anthropic key, saved once as a network secret; online, the product owner pastes the same key in Vercel.
- Changing provider later means replacing the provider package and the model setting in the module's `infrastructure/ai/`; use cases and the streaming pipeline do not change.
- Tests keep mocking the model, so no test calls Anthropic.

Related: [ai](../ai.md) · [runtime and configuration](../runtime-and-configuration.md) · [security](../security.md)
