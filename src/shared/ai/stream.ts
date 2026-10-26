import { smoothStream, type ToolSet } from "ai";

export function smoothTextStream<TOOLS extends ToolSet = ToolSet>() {
  return smoothStream<TOOLS>({ delayInMs: 15, chunking: "word" });
}
