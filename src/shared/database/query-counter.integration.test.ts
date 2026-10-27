import { afterAll, describe, expect, it } from "vitest";
import { getPool } from "@/shared/database/client";
import { countQueries } from "@/shared/database/query-counter";

describe("countQueries", () => {
  afterAll(async () => {
    await getPool().end();
  });

  it("counts the queries sent through the pool while the function runs", async () => {
    const { result, queries } = await countQueries(async () => {
      await getPool().query("SELECT 1");
      const { rows } = await getPool().query<{ answer: number }>("SELECT 42 AS answer");
      return rows[0].answer;
    });
    expect(result).toBe(42);
    expect(queries).toBe(2);
  });

  it("stops counting when the function ends", async () => {
    await countQueries(async () => undefined);
    const { queries } = await countQueries(async () => {
      await getPool().query("SELECT 1");
    });
    expect(queries).toBe(1);
  });
});
