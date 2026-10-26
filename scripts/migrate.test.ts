import { describe, expect, it } from "vitest";
import { listPendingMigrations } from "./migrate.mjs";

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
