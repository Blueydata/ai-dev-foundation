import { describe, expect, it } from "vitest";
import { analyzePlan, formatRows, parseArguments, toReadOnlyStatement } from "./db-query.mjs";

describe("toReadOnlyStatement", () => {
  it("accepts a read query and drops the trailing semicolon", () => {
    expect(toReadOnlyStatement("  SELECT * FROM products;  ")).toBe("SELECT * FROM products");
  });

  it("accepts common table expressions", () => {
    expect(toReadOnlyStatement("WITH cheap AS (SELECT 1) SELECT * FROM cheap")).toBe("WITH cheap AS (SELECT 1) SELECT * FROM cheap");
  });

  it("rejects statements that change data", () => {
    expect(() => toReadOnlyStatement("DELETE FROM products")).toThrow("Only read queries");
    expect(() => toReadOnlyStatement("UPDATE products SET price_brl = 0")).toThrow("Only read queries");
  });

  it("rejects more than one statement", () => {
    expect(() => toReadOnlyStatement("SELECT 1; DROP TABLE products")).toThrow("Only one statement");
  });

  it("rejects an empty query", () => {
    expect(() => toReadOnlyStatement("   ")).toThrow("Pass one SQL statement");
  });
});

describe("parseArguments", () => {
  it("separates flags from the query", () => {
    expect(parseArguments(["--explain", "SELECT", "1"])).toEqual({ explain: true, forceIndex: false, sql: "SELECT 1" });
    expect(parseArguments(["--explain", "--force-index", "SELECT 1"])).toEqual({ explain: true, forceIndex: true, sql: "SELECT 1" });
  });
});

describe("formatRows", () => {
  it("limits the rows and shortens long values", () => {
    const rows = Array.from({ length: 60 }, (_, index) => ({ id: index, description: "x".repeat(100) }));
    const formatted = formatRows(rows);
    expect(formatted).toHaveLength(50);
    expect(String(formatted[0].description)).toHaveLength(80);
    expect(String(formatted[0].description).endsWith("…")).toBe(true);
  });

  it("formats dates and objects as text", () => {
    const [row] = formatRows([{ createdAt: new Date("2026-10-27T12:00:00.000Z"), tags: ["a", "b"], price: 64 }]);
    expect(row).toEqual({ createdAt: "2026-10-27T12:00:00.000Z", tags: '["a","b"]', price: 64 });
  });
});

describe("analyzePlan", () => {
  it("reports execution time and an index scan without warnings", () => {
    const result = analyzePlan([
      "Index Scan using products_folder_id_idx on products  (cost=0.15..8.17 rows=1 width=64) (actual time=0.010..0.012 rows=3 loops=1)",
      "  Index Cond: (folder_id = 2)",
      "Planning Time: 0.100 ms",
      "Execution Time: 0.031 ms",
    ]);
    expect(result).toEqual({ executionTimeMs: 0.031, sequentialScans: [], warnings: [] });
  });

  it("counts rows removed by the filter and warns on large sequential scans", () => {
    const result = analyzePlan([
      "Seq Scan on products  (cost=0.00..2400.00 rows=10 width=64) (actual time=0.020..12.500 rows=12 loops=1)",
      "  Filter: (price_brl < 80)",
      "  Rows Removed by Filter: 49988",
      "Execution Time: 12.700 ms",
    ]);
    expect(result.sequentialScans).toEqual([{ table: "products", rowsRead: 50000 }]);
    expect(result.warnings).toEqual(["Sequential scan on products read 50000 rows: add an index for this filter or sort."]);
  });

  it("does not warn on small tables", () => {
    const result = analyzePlan([
      "Seq Scan on folders  (cost=0.00..1.06 rows=6 width=40) (actual time=0.005..0.006 rows=6 loops=1)",
      "Execution Time: 0.020 ms",
    ]);
    expect(result.sequentialScans).toEqual([{ table: "folders", rowsRead: 6 }]);
    expect(result.warnings).toEqual([]);
  });
});
