import { describe, expect, it } from "vitest";
import { listPendingMigrations, selectMigrationUrl } from "./migrate.mjs";

describe("listPendingMigrations", () => {
  it("returns migrations not applied yet, in order", () => {
    const files = ["0002-add-status.sql", "0001-create-orders.sql", "0003-create-customers.sql"];
    expect(listPendingMigrations(files, new Set(["0001-create-orders.sql"]))).toEqual([
      "0002-add-status.sql",
      "0003-create-customers.sql",
    ]);
  });

  it("ignores files that do not follow the naming pattern", () => {
    expect(listPendingMigrations([".gitkeep", "notes.txt", "1-bad.sql", "0001-create-orders.sql"], new Set())).toEqual([
      "0001-create-orders.sql",
    ]);
  });
});

describe("selectMigrationUrl", () => {
  it("prefers the direct connection that Neon provides for migrations", () => {
    expect(selectMigrationUrl({ DATABASE_URL: "pooled", DATABASE_URL_UNPOOLED: "direct" })).toBe("direct");
  });

  it("uses DATABASE_URL when there is no direct connection", () => {
    expect(selectMigrationUrl({ DATABASE_URL: "pooled" })).toBe("pooled");
  });
});
