import { describe, expect, it } from "vitest";
import { simulateReadableStream, streamText } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { smoothTextStream } from "@/shared/ai/stream";

const mockModel = () =>
  new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "t1" },
          { type: "text-delta", id: "t1", delta: "We deliver from Monday " },
          { type: "text-delta", id: "t1", delta: "to Saturday, until 8 pm." },
          { type: "text-end", id: "t1" },
          {
            type: "finish",
            finishReason: { unified: "stop", raw: undefined },
            logprobs: undefined,
            usage: {
              inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 10, text: 10, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });

describe("smoothTextStream", () => {
  it("releases the text word by word without losing content", async () => {
    const result = streamText({ model: mockModel(), prompt: "When do you deliver?", experimental_transform: smoothTextStream() });

    const chunks: string[] = [];
    for await (const chunk of result.textStream) chunks.push(chunk);

    expect(chunks.join("")).toBe("We deliver from Monday to Saturday, until 8 pm.");
    expect(chunks.length).toBeGreaterThan(2);
  });
});
