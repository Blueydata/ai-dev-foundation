import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { runMigrations } from "./migrate.mjs";

export function buildDatabaseUrl(environment) {
  if (environment.DATABASE_URL) {
    return environment.DATABASE_URL;
  }
  const { DB_HOST, DB_PORT = "5432", DB_NAME, DB_USER, DB_PASSWORD, DB_SSL_MODE = "verify-full" } = environment;
  const missing = Object.entries({ DB_HOST, DB_NAME, DB_USER, DB_PASSWORD })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`Set DATABASE_URL, or ${missing.join(", ")} to build it.`);
  }
  const credentials = `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`;
  return `postgres://${credentials}@${DB_HOST}:${DB_PORT}/${encodeURIComponent(DB_NAME)}?sslmode=${DB_SSL_MODE}`;
}

async function start() {
  const databaseUrl = buildDatabaseUrl(process.env);
  await runMigrations(databaseUrl);
  const server = spawn(process.execPath, ["server.js"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => server.kill(signal));
  }
  server.on("exit", (code) => process.exit(code ?? 1));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
