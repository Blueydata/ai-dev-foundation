import { describe, expect, it } from "vitest";
import { findSecrets } from "./check-secrets.mjs";

const fakeKey = "sk-" + "proj-" + "a1B2c3D4".repeat(6);

describe("findSecrets", () => {
  it("finds an OpenAI key and reports the line", () => {
    const code = `const x = 1;\nconst apiKey = "${fakeKey}";`;
    expect(findSecrets(code)).toEqual([{ line: 2, rule: "OpenAI API key" }]);
  });

  it("ignores code that reads the key from the environment", () => {
    expect(findSecrets("const apiKey = process.env.OPENAI_API_KEY;")).toEqual([]);
  });
});
