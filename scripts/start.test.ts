import { describe, expect, it } from "vitest";
import { buildDatabaseUrl } from "./start.mjs";

describe("buildDatabaseUrl", () => {
  it("uses DATABASE_URL when it is set", () => {
    expect(buildDatabaseUrl({ DATABASE_URL: "postgres://app:app@db:5432/app", DB_HOST: "ignored" })).toBe("postgres://app:app@db:5432/app");
  });

  it("builds the URL from the parts with TLS verification by default", () => {
    expect(buildDatabaseUrl({ DB_HOST: "cluster.example.com", DB_NAME: "app", DB_USER: "app", DB_PASSWORD: "secret" })).toBe(
      "postgres://app:secret@cluster.example.com:5432/app?sslmode=verify-full",
    );
  });

  it("encodes special characters in the password", () => {
    const url = buildDatabaseUrl({ DB_HOST: "h", DB_PORT: "6543", DB_NAME: "app", DB_USER: "app", DB_PASSWORD: "p@ss:w/rd#?" });
    expect(url).toBe("postgres://app:p%40ss%3Aw%2Frd%23%3F@h:6543/app?sslmode=verify-full");
    expect(decodeURIComponent(new URL(url).password)).toBe("p@ss:w/rd#?");
  });

  it("names the missing parts", () => {
    expect(() => buildDatabaseUrl({ DB_HOST: "h" })).toThrow("Set DATABASE_URL, or DB_NAME, DB_USER, DB_PASSWORD to build it.");
  });
});
