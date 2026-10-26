"use client";

import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { cn } from "@/shared/utils/cn";

type AiResponseProps = {
  text: string;
  isStreaming: boolean;
  className?: string;
};

export function AiResponse({ text, isStreaming, className }: AiResponseProps) {
  return (
    <Streamdown
      className={cn("text-sm leading-relaxed", className)}
      animated={{ animation: "blurIn", duration: 280, sep: "word" }}
      isAnimating={isStreaming}
      caret={isStreaming ? "circle" : undefined}
    >
      {text}
    </Streamdown>
  );
}
