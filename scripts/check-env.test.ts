import { describe, expect, it } from "vitest";
import { findMissing, listRequiredNames } from "./check-env.mjs";

describe("check-env", () => {
  it("lists the variable names declared in .env.example", () => {
    expect(listRequiredNames("OPENAI_API_KEY=\nSTRIPE_SECRET_KEY=\n\n")).toEqual(["OPENAI_API_KEY", "STRIPE_SECRET_KEY"]);
  });

  it("reports only the names that are missing or empty, never the values", () => {
    expect(findMissing(["OPENAI_API_KEY", "STRIPE_SECRET_KEY"], { OPENAI_API_KEY: "value", STRIPE_SECRET_KEY: " " })).toEqual(["STRIPE_SECRET_KEY"]);
  });

  it("needs nothing when .env.example is empty", () => {
    expect(listRequiredNames("")).toEqual([]);
  });
});
