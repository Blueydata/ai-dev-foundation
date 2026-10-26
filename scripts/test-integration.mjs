import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import pg from "pg";
import { runMigrations } from "./migrate.mjs";

export function toAdminUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.slice(1);
  url.pathname = "/postgres";
  return { adminUrl: url.toString(), databaseName };
}

async function recreateDatabase(databaseUrl) {
  const { adminUrl, databaseName } = toAdminUrl(databaseUrl);
  if (!/^[a-z0-9_]+_test$/.test(databaseName)) {
    throw new Error(`Refusing to reset "${databaseName}": the test database name must end with _test.`);
  }
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS ${databaseName} WITH (FORCE)`);
    await client.query(`CREATE DATABASE ${databaseName}`);
  } finally {
    await client.end();
  }
}

async function runIntegrationTests() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("TEST_DATABASE_URL is not set. Run this inside the app container: docker compose exec app npm run test:integration");
  }
  await recreateDatabase(databaseUrl);
  await runMigrations(databaseUrl);
  const result = spawnSync("npx", ["vitest", "run", "--config", "vitest.integration.config.ts", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  process.exit(result.status ?? 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runIntegrationTests().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
