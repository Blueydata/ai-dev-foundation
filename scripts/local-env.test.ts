import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseAppEnvironment, toCloudEnvironment, toShellExports } from "./local-env.mjs";

const compose = `services:
  db:
    environment:
      POSTGRES_USER: app
  app:
    image: node:22-alpine
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
      ANTHROPIC_MODEL: "claude-small"
      WATCHPACK_POLLING: "true"
    ports:
      - "3000:3000"
  infra:
    environment:
      - AWS_PROFILE
`;

describe("local-env", () => {
  it("reads only the app service environment from docker-compose.yml", () => {
    expect(parseAppEnvironment(compose)).toEqual({
      DATABASE_URL: "postgres://app:app@db:5432/app",
      ANTHROPIC_MODEL: "claude-small",
      WATCHPACK_POLLING: "true",
    });
  });

  it("points the database at the cloud session's own Postgres and drops Docker-only settings", () => {
    expect(toCloudEnvironment(parseAppEnvironment(compose))).toEqual({
      DATABASE_URL: "postgres://app:app@localhost:5432/app",
      ANTHROPIC_MODEL: "claude-small",
    });
  });

  it("writes quoted shell exports", () => {
    expect(toShellExports({ NAME: "it's" })).toBe("export NAME='it'\\''s'");
  });

  it("finds the database URLs in the project's docker-compose.yml", () => {
    const values = toCloudEnvironment(parseAppEnvironment(readFileSync("docker-compose.yml", "utf8")));
    expect(values.DATABASE_URL).toBe("postgres://app:app@localhost:5432/app");
    expect(values.TEST_DATABASE_URL).toBe("postgres://app:app@localhost:5432/app_test");
  });
});
