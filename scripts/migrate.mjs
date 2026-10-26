import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";

export const MIGRATIONS_DIRECTORY = path.resolve("src/shared/database/migrations");
export const MIGRATION_FILE_PATTERN = /^\d{4}-[a-z0-9-]+\.sql$/;

export function listPendingMigrations(fileNames, appliedNames) {
  return fileNames
    .filter((fileName) => MIGRATION_FILE_PATTERN.test(fileName))
    .sort()
    .filter((fileName) => !appliedNames.has(fileName));
}

async function readMigrationFileNames() {
  try {
    return await readdir(MIGRATIONS_DIRECTORY);
  } catch {
    return [];
  }
}

async function applyMigration(client, fileName) {
  const sql = await readFile(path.join(MIGRATIONS_DIRECTORY, fileName), "utf8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [fileName]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Migration ${fileName} failed: ${error.message}`);
  }
}

export async function runMigrations(connectionString) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in the values.");
  }
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const pending = listPendingMigrations(await readMigrationFileNames(), new Set(rows.map((row) => row.name)));
    for (const fileName of pending) {
      await applyMigration(client, fileName);
      console.log(`Applied ${fileName}`);
    }
    if (pending.length === 0) {
      console.log("Database is up to date.");
    }
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMigrations(process.env.DATABASE_URL).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
