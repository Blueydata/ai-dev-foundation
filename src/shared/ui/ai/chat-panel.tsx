"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { AiResponse } from "@/shared/ui/ai/ai-response";
import { ChatComposer } from "@/shared/ui/ai/chat-composer";
import { ChatMessage } from "@/shared/ui/ai/chat-message";
import { TypingIndicator } from "@/shared/ui/ai/typing-indicator";
import { Button } from "@/shared/ui/button";

export type ChatPanelMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type ChatPanelStatus = "ready" | "submitted" | "streaming" | "error";

type ChatPanelProps = {
  messages: ChatPanelMessage[];
  status: ChatPanelStatus;
  assistantAvatar: ReactNode;
  welcome: ReactNode;
  suggestions?: string[];
  placeholder: string;
  errorMessage: string;
  footnote?: ReactNode;
  onSend: (text: string) => void;
  onStop: () => void;
  onRetry: () => void;
};

export function ChatPanel({
  messages,
  status,
  assistantAvatar,
  welcome,
  suggestions = [],
  placeholder,
  errorMessage,
  footnote,
  onSend,
  onStop,
  onRetry,
}: ChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);
  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: status === "streaming" ? "auto" : "smooth" });
  }, [messages, status]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col gap-5 pt-[8vh]">
              {welcome}
              {suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => onSend(suggestion)}
                      className="rounded-full border bg-card px-3.5 py-1.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {messages.map((message) => {
            const isStreamingThis = status === "streaming" && message.id === lastMessage?.id && message.role === "assistant";
            return (
              <ChatMessage key={message.id} role={message.role} avatar={assistantAvatar}>
                {message.role === "assistant" ? <AiResponse text={message.text} isStreaming={isStreamingThis} /> : message.text}
              </ChatMessage>
            );
          })}
          {status === "submitted" ? (
            <ChatMessage role="assistant" avatar={assistantAvatar}>
              <TypingIndicator />
            </ChatMessage>
          ) : null}
          {status === "error" ? (
            <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
              <span>{errorMessage}</span>
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RotateCcw />
                Tentar de novo
              </Button>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>
      <div className="bg-gradient-to-t from-background from-70% to-transparent">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pt-2 pb-4">
          <ChatComposer isBusy={isBusy} placeholder={placeholder} onSend={onSend} onStop={onStop} />
          {footnote ? <p className="text-center text-xs text-muted-foreground">{footnote}</p> : null}
        </div>
      </div>
    </div>
  );
}
