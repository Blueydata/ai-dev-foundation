import { pathToFileURL } from "node:url";
import pg from "pg";

export const READ_ONLY_KEYWORDS = ["select", "with", "explain", "show", "table", "values"];
export const LARGE_SCAN_ROWS = 10_000;
export const MAX_PRINTED_ROWS = 50;
export const MAX_CELL_LENGTH = 80;
export const STATEMENT_TIMEOUT = "5s";

export function toReadOnlyStatement(sql) {
  const statement = (sql ?? "").trim().replace(/;+\s*$/, "");
  if (!statement) {
    throw new Error('Pass one SQL statement, for example: npm run db:query -- "SELECT count(*) FROM products"');
  }
  if (statement.includes(";")) {
    throw new Error("Only one statement at a time.");
  }
  const keyword = statement.split(/\s+/, 1)[0].toLowerCase();
  if (!READ_ONLY_KEYWORDS.includes(keyword)) {
    throw new Error(`Only read queries are allowed (${READ_ONLY_KEYWORDS.join(", ")}). To change data, write a migration or a use case.`);
  }
  return statement;
}

export function parseArguments(argv) {
  const flags = new Set(argv.filter((argument) => argument.startsWith("--")));
  const sql = argv.filter((argument) => !argument.startsWith("--")).join(" ");
  return { explain: flags.has("--explain"), forceIndex: flags.has("--force-index"), sql };
}

export function formatRows(rows, limit = MAX_PRINTED_ROWS) {
  return rows.slice(0, limit).map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([column, value]) => {
        const text = value instanceof Date ? value.toISOString() : typeof value === "object" && value !== null ? JSON.stringify(value) : value;
        return [column, typeof text === "string" && text.length > MAX_CELL_LENGTH ? `${text.slice(0, MAX_CELL_LENGTH - 1)}…` : text];
      }),
    ),
  );
}

export function analyzePlan(planLines) {
  const sequentialScans = [];
  let executionTimeMs;
  planLines.forEach((line, index) => {
    const scan = line.match(/Seq Scan on (\S+).*actual time=[\d.]+\.\.[\d.]+ rows=(\d+)/);
    if (scan) {
      const following = planLines.slice(index + 1, index + 6);
      const nextNode = following.findIndex((nextLine) => nextLine.includes("->"));
      const details = nextNode === -1 ? following : following.slice(0, nextNode);
      const removed = details.map((detail) => detail.match(/Rows Removed by Filter: (\d+)/)).find(Boolean);
      const rowsRead = Number(scan[2]) + (removed ? Number(removed[1]) : 0);
      sequentialScans.push({ table: scan[1], rowsRead });
    }
    const time = line.match(/Execution Time: ([\d.]+) ms/);
    if (time) {
      executionTimeMs = Number(time[1]);
    }
  });
  const warnings = sequentialScans
    .filter((scan) => scan.rowsRead >= LARGE_SCAN_ROWS)
    .map((scan) => `Sequential scan on ${scan.table} read ${scan.rowsRead} rows: add an index for this filter or sort.`);
  return { executionTimeMs, sequentialScans, warnings };
}

async function run({ explain, forceIndex, sql }) {
  const statement = toReadOnlyStatement(sql);
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query(`SET LOCAL statement_timeout = '${STATEMENT_TIMEOUT}'`);
    if (forceIndex) {
      await client.query("SET LOCAL enable_seqscan = off");
    }
    if (explain) {
      const result = await client.query(`EXPLAIN (ANALYZE, BUFFERS) ${statement}`);
      const planLines = result.rows.map((row) => row["QUERY PLAN"]);
      console.log(planLines.join("\n"));
      const { executionTimeMs, sequentialScans, warnings } = analyzePlan(planLines);
      console.log(`\nExecution time: ${executionTimeMs ?? "unknown"} ms`);
      sequentialScans.forEach((scan) => console.log(`Sequential scan: ${scan.table} (${scan.rowsRead} rows read)`));
      warnings.forEach((warning) => console.log(`WARNING: ${warning}`));
      if (warnings.length === 0) {
        console.log("No large sequential scans.");
      }
    } else {
      const result = await client.query(statement);
      console.table(formatRows(result.rows));
      console.log(`${result.rowCount ?? result.rows.length} row(s)${result.rows.length > MAX_PRINTED_ROWS ? `, showing the first ${MAX_PRINTED_ROWS}` : ""}.`);
    }
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(parseArguments(process.argv.slice(2))).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
