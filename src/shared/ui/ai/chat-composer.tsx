"use client";

import { ArrowUp, Square } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/shared/ui/button";

type ChatComposerProps = {
  isBusy: boolean;
  placeholder: string;
  maxLength?: number;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function ChatComposer({ isBusy, placeholder, maxLength = 1000, onSend, onStop }: ChatComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0 && !isBusy;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20"
    >
      <label htmlFor="chat-composer" className="sr-only">
        {placeholder}
      </label>
      <textarea
        id="chat-composer"
        ref={textareaRef}
        value={text}
        maxLength={maxLength}
        rows={1}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        className="field-sizing-content max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[0.9375rem] outline-none placeholder:text-muted-foreground"
      />
      {isBusy ? (
        <Button type="button" size="icon" variant="secondary" className="rounded-xl" onClick={onStop} aria-label="Parar resposta">
          <Square className="fill-current" />
        </Button>
      ) : (
        <Button type="submit" size="icon" className="rounded-xl" disabled={!canSend} aria-label="Enviar mensagem">
          <ArrowUp />
        </Button>
      )}
    </form>
  );
}
