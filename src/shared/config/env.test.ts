import { describe, expect, it } from "vitest";
import { parseServerEnv } from "@/shared/config/env";

describe("parseServerEnv", () => {
  it("returns the variables when they are valid", () => {
    const url = "postgres://app:password@localhost:5432/app";
    expect(parseServerEnv({ DATABASE_URL: url })).toEqual({ DATABASE_URL: url });
  });

  it("names the missing variables in the error", () => {
    expect(() => parseServerEnv({})).toThrow(/DATABASE_URL/);
  });
});
