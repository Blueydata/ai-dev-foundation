"use client";

import { motion } from "motion/react";

export function TypingIndicator() {
  return (
    <div role="status" aria-label="Gerando resposta" className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
