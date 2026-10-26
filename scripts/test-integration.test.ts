import { describe, expect, it } from "vitest";
import { toAdminUrl } from "./test-integration.mjs";

describe("toAdminUrl", () => {
  it("points to the postgres database and returns the test database name", () => {
    expect(toAdminUrl("postgres://app:app@db:5432/app_test")).toEqual({
      adminUrl: "postgres://app:app@db:5432/postgres",
      databaseName: "app_test",
    });
  });
});
