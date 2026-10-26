import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";
import { toChatPanelMessages } from "@/shared/ui/ai/to-chat-panel-messages";

describe("toChatPanelMessages", () => {
  it("keeps user and assistant messages with their text parts joined", () => {
    const messages: UIMessage[] = [
      { id: "1", role: "system", parts: [{ type: "text", text: "rules" }] },
      { id: "2", role: "user", parts: [{ type: "text", text: "Qual café é mais doce?" }] },
      { id: "3", role: "assistant", parts: [{ type: "text", text: "O " }, { type: "text", text: "Catuaí." }] },
    ];
    expect(toChatPanelMessages(messages)).toEqual([
      { id: "2", role: "user", text: "Qual café é mais doce?" },
      { id: "3", role: "assistant", text: "O Catuaí." },
    ]);
  });
});
