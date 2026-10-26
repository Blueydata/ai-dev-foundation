import { afterAll, describe, expect, it } from "vitest";
import { postgresDatabaseProbe } from "@/modules/system-status/infrastructure/postgres-database-probe";
import { getPool } from "@/shared/database/client";

describe("postgresDatabaseProbe", () => {
  afterAll(async () => {
    await getPool().end();
  });

  it("reaches the real database", async () => {
    expect(await postgresDatabaseProbe.isReachable()).toBe(true);
  });
});
