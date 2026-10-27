---
name: ai-integration
description: How to integrate LLMs and AI agents in the project - always with the Vercel AI SDK (ai, @ai-sdk/react and the provider package), with smooth streaming, tools, agents that answer plain-language questions over large data through typed tools, cost limits and tests. Use whenever a feature calls a language model, an agent or an AI API.
---

# AI integration

Every call to language models and agents uses the **Vercel AI SDK**. Do not use the provider SDK directly (OpenAI, Anthropic, etc.) or `fetch` for AI APIs. The AI SDK gives one interface for any provider, with streaming, tools, agents and React hooks.

To confirm an AI SDK API, the docs for the installed version are in `node_modules/ai/docs/`.

## Packages

- `ai`: core (`streamText`, `generateText`, `ToolLoopAgent`, `tool`, `smoothStream`…). Already installed.
- `@ai-sdk/react`: the `useChat` hook for chat screens. Already installed.
- Provider: `@ai-sdk/openai` is already installed. For another provider, install its package (for example `@ai-sdk/anthropic`) with an exact version, explaining why first.

## Rules

1. **Server only.** Model, instructions and agents live in the module `infrastructure/ai/` and are served by route handlers in `src/app/api/` (`project-structure` skill). The API key is provided by the product owner: `OPENAI_API_KEY` goes into the schema as `.optional()` and into `.env.example` with an empty value. The model name is a local value: `OPENAI_MODEL` gets a default in `docker-compose.yml`. Without the key the app still runs and only the AI feature answers with a clear error (see "Configuration" in `project-structure`).
2. **Always streamed** when the response is shown to the user, always with `experimental_transform: smoothTextStream()` from `src/shared/ai/stream.ts`. It releases text word by word at a steady pace and the screen animates each word, so the response never looks stuck.
3. **Instructions separate from user input.** The assistant rules go in `instructions` (agent) or `system` (`streamText`), in English. User text goes only in the messages and never changes the rules. If the assistant answers end users, tell it in the instructions to answer in the product language.
4. **Validated inputs and outputs:** request bodies with `parseJsonBody` and a schema, messages with `validateUIMessages`, tool parameters with `inputSchema`, structured outputs with `zod`.
5. **Limits:** maximum number and length of messages, maximum agent steps (`stopWhen: stepCountIs(n)`) and, on public routes, rate limiting.
6. **Tools call use cases.** An agent never runs SQL or business rules itself: its tools call use cases received as dependencies.
7. **Customer data:** do not log conversation content or personal data.

## Where each piece lives

| Piece | File |
| --- | --- |
| Model provider | `src/modules/<module>/infrastructure/ai/model.ts` |
| System instructions (English) | `src/modules/<module>/infrastructure/ai/instructions.ts` |
| Streamed reply or agent | `src/modules/<module>/infrastructure/ai/<name>.ts` |
| Request schema | `src/modules/<module>/application/schemas.ts` |
| Wiring (agent tools receive use cases) | `src/modules/<module>/index.ts` |
| Route | `src/app/api/<resource>/route.ts` |
| Screen | `src/modules/<module>/presentation/components/`, with `src/shared/ui/ai/` |

## Model provider

```ts
import { createOpenAI } from "@ai-sdk/openai";
import { getServerEnv } from "@/shared/config/env";
import { UnavailableError } from "@/shared/kernel/errors";

export function getChatModel() {
  const { OPENAI_API_KEY, OPENAI_MODEL } = getServerEnv();
  if (!OPENAI_API_KEY) {
    throw new UnavailableError("OpenAI");
  }
  return createOpenAI({ apiKey: OPENAI_API_KEY })(OPENAI_MODEL);
}
```

## Request schema

```ts
import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(50),
});
```

## Simple chat (no tools)

```ts
import { convertToModelMessages, streamText, validateUIMessages } from "ai";
import { SUPPORT_INSTRUCTIONS } from "@/modules/support-chat/infrastructure/ai/instructions";
import { getChatModel } from "@/modules/support-chat/infrastructure/ai/model";
import { smoothTextStream } from "@/shared/ai/stream";

export async function streamSupportReply(messages: unknown[], abortSignal: AbortSignal) {
  const uiMessages = await validateUIMessages({ messages });
  return streamText({
    model: getChatModel(),
    system: SUPPORT_INSTRUCTIONS,
    messages: await convertToModelMessages(uiMessages),
    experimental_transform: smoothTextStream(),
    abortSignal,
  });
}
```

```ts
import { createUIMessageStreamResponse, toUIMessageStream } from "ai";
import { chatRequestSchema, streamSupportReply } from "@/modules/support-chat";
import { parseJsonBody, withErrorHandling } from "@/shared/http/responses";

export const POST = withErrorHandling(async (request: Request) => {
  const { messages } = await parseJsonBody(request, chatRequestSchema);
  const result = await streamSupportReply(messages, request.signal);
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
});
```

## Agent (with tools)

When the AI needs to read data or take actions, create an agent with `ToolLoopAgent`. Each tool calls a use case, which the agent receives as a dependency, so business rules stay in the module and the agent stays testable:

```ts
import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
import type { OrderStatus } from "@/modules/support-chat/domain/order-status";
import { SUPPORT_INSTRUCTIONS } from "@/modules/support-chat/infrastructure/ai/instructions";
import { getChatModel } from "@/modules/support-chat/infrastructure/ai/model";

type SupportAgentDependencies = {
  getOrderStatus: (orderCode: string) => Promise<OrderStatus>;
};

export function createSupportAgent({ getOrderStatus }: SupportAgentDependencies) {
  return new ToolLoopAgent({
    model: getChatModel(),
    instructions: SUPPORT_INSTRUCTIONS,
    stopWhen: stepCountIs(5),
    tools: {
      getOrderStatus: tool({
        description: "Get the status of an order by its code",
        inputSchema: z.object({ orderCode: z.string().min(1) }),
        execute: async ({ orderCode }) => getOrderStatus(orderCode),
      }),
    },
  });
}
```

In `index.ts`, wire it lazily so the environment is only read on a request:

```ts
import { createGetOrderStatus } from "@/modules/support-chat/application/use-cases/get-order-status";
import { createSupportAgent } from "@/modules/support-chat/infrastructure/ai/support-agent";
import { postgresOrderRepository } from "@/modules/support-chat/infrastructure/order-repository";

const getOrderStatus = createGetOrderStatus({ orderRepository: postgresOrderRepository });

export const getSupportAgent = () => createSupportAgent({ getOrderStatus });
```

```ts
import { createAgentUIStreamResponse } from "ai";
import { chatRequestSchema, getSupportAgent } from "@/modules/support-chat";
import { smoothTextStream } from "@/shared/ai/stream";
import { parseJsonBody, withErrorHandling } from "@/shared/http/responses";

export const POST = withErrorHandling(async (request: Request) => {
  const { messages } = await parseJsonBody(request, chatRequestSchema);
  return createAgentUIStreamResponse({
    agent: getSupportAgent(),
    uiMessages: messages,
    abortSignal: request.signal,
    experimental_transform: smoothTextStream(),
  });
});
```

## Answering questions over data

People talk to the assistant in plain language ("tem algum café frutado para V60 até 80 reais?"). They never write filters, ids or SQL. The assistant turns the question into **tool calls with typed filters**, and the database does the heavy work. This is what keeps answers correct and cheap when the data grows from 10 rows to 100 000.

**Never put the whole table in the prompt.** It works with 10 products and fails with 1 000: every message pays for all of it in tokens and latency, the model misses rows in the middle, and hidden or stale data leaks. The prompt carries only the rules; the data comes from tools, a few rows at a time.

### Design the tools

| Tool | Use for | Input | Output |
| --- | --- | --- | --- |
| `search<Things>` | "tem algo assim?", recommendations, comparisons | Optional typed filters from the domain vocabulary (`z.enum` for closed lists, numbers with `min`/`max` for ranges), an optional free-text `query`, `limit` (max 10) | Compact rows: id, name and only the fields needed to answer, plus `total` matches |
| `get<Thing>` | Details of one item the user picked | The id or code returned by a search | The full item |
| `summarize<Things>` | "quantos…", "qual o mais barato/mais bem avaliado…", "quais origens vocês têm?" | Optional filters and a grouping or ranking from an enum | Counts, minimum, maximum, average or groups computed in SQL |
| `list<Categories>` | "o que vocês vendem?" | Nothing | The categories with counts |

Rules:

1. **Filters, not SQL.** The model never writes SQL and never sees table names. Each tool input is a `zod` schema whose enums come from the domain (the same vocabulary the import and the screens use), so an invalid filter fails validation instead of reaching the database. Describe every field in `.describe()` in English, including the units and the vocabulary.
2. **Tools call use cases, use cases call repositories** following `database-queries`: parameterized, indexed, limited, no N+1. Visibility and permission rules (for example "hidden products never appear") live in the use case or the query, **never only in the instructions**.
3. **Small results.** Return at most 10 rows per call and only the fields needed; include `total` so the model can say "encontrei 23, estes são os 5 melhores". Ranking and aggregation happen in SQL, never by sending many rows for the model to sort.
4. **Empty is an answer.** When nothing matches, the tool returns an empty list and the instructions say to tell the user plainly and suggest the closest alternative (relax one filter), never to invent.
5. **Instructions explain the tools, not the data:** when to use each tool, to call `search` before answering about products, to use only tool results for facts (names, prices, availability), to ask one short question when the request is too vague, and to answer in the product language.
6. **Steps and limits:** `stopWhen: stepCountIs(5)` is enough for search → details → answer; keep `maxOutputTokens` proportional to the answer size.

```ts
const productFilters = z.object({
  query: z.string().max(100).optional().describe("Free text such as flavor notes or a product name, in Portuguese"),
  folder: z.enum(FOLDERS).optional().describe("Catalog folder"),
  roast: z.enum(ROASTS).optional(),
  brewMethod: z.enum(BREW_METHODS).optional().describe("Brewing method the product is recommended for"),
  maxPriceBrl: z.number().positive().optional().describe("Maximum price in Brazilian reais"),
  sortBy: z.enum(["relevance", "price-asc", "price-desc", "score-desc"]).default("relevance"),
  limit: z.number().int().min(1).max(10).default(5),
});

tools: {
  searchProducts: tool({
    description: "Search visible catalog products with optional filters. Always call before recommending or quoting a product.",
    inputSchema: productFilters,
    execute: async (filters) => searchProducts(filters),
  }),
}
```

### Test it

- Unit tests of each tool with fake use cases: valid filters reach the use case unchanged; invalid ones are rejected.
- Integration tests of the repository with a realistic volume (`database-queries`), including the hidden-item rule and the empty result.
- In the browser (`test-in-browser`), ask in plain language questions that need filters, ranking, counts and an item that does not exist, and compare the answers with the data (`npm run db:query`).

## Cost

Every message to the model is paid in tokens, and the same mistakes cost more with more users:

1. **Smallest model that answers well.** Start with the small model of the provider (`OPENAI_MODEL` default in `docker-compose.yml`); move up only with evidence (a failing conversation), as a decision to record.
2. **Short, stable instructions.** Keep the system instructions short and identical between requests, so the provider can cache the prefix; never add per-request data to them.
3. **Data through tools, a few rows at a time** (see above), never the whole table in the prompt.
4. **Limits:** maximum messages and message length per request (`application/schemas.ts`), `maxOutputTokens`, `stopWhen: stepCountIs(n)` and rate limiting on public routes.
5. **Send only recent history** when conversations get long: the last N messages are usually enough.
6. **Measure:** the AI SDK returns `usage` (input and output tokens) per call; record totals, never content, when the product owner wants to follow cost.

## On screen

Use `useChat` from `@ai-sdk/react` in a client component in the module `presentation/components/`, and render `ChatPanel` from `src/shared/ui/ai/` (see `ui-standards`):

```tsx
const { messages, sendMessage, status, stop, regenerate } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" }),
});

<ChatPanel
  messages={toChatPanelMessages(messages)}
  status={status}
  onSend={(text) => sendMessage({ text })}
  onStop={stop}
  onRetry={() => regenerate()}
  assistantAvatar={...}
  welcome={...}
  suggestions={[...]}
  placeholder="..."
  errorMessage="..."
/>
```

`ChatPanel` already handles the typing indicator, the animated streaming text, the stop button, errors with retry and scrolling. If the screen has a conversation list, the selected conversation goes in the URL (`/conversations/[conversationId]`, `url-state` skill).

## Tests

Mock the model with `MockLanguageModelV4` from `ai/test` and `simulateReadableStream`, as in `src/shared/ai/stream.test.ts`. Test agent tools by passing fake use cases to `createSupportAgent`. No test calls a real provider.
