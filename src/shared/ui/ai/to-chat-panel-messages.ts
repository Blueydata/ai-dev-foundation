import type { UIMessage } from "ai";
import type { ChatPanelMessage } from "@/shared/ui/ai/chat-panel";

export function toChatPanelMessages(messages: UIMessage[]): ChatPanelMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as ChatPanelMessage["role"],
      text: message.parts.map((part) => (part.type === "text" ? part.text : "")).join(""),
    }));
}
