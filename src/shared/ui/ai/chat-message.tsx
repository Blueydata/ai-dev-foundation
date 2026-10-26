"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type ChatMessageProps = {
  role: "user" | "assistant";
  avatar?: ReactNode;
  children: ReactNode;
};

export function ChatMessage({ role, avatar, children }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("flex w-full gap-3", role === "user" ? "justify-end" : "justify-start")}
    >
      {role === "assistant" && avatar ? <div className="mt-0.5 shrink-0">{avatar}</div> : null}
      <div
        className={cn(
          "min-w-0 text-[0.9375rem] leading-relaxed",
          role === "user" ? "max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-secondary-foreground" : "flex-1 pt-0.5",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
