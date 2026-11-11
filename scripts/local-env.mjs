import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SKIPPED_NAMES = new Set(["WATCHPACK_POLLING"]);

export function parseAppEnvironment(composeText) {
  const lines = composeText.split("\n");
  const values = {};
  let inApp = false;
  let inEnvironment = false;
  for (const line of lines) {
    if (/^ {2}[a-z][\w-]*:\s*$/.test(line)) {
      inApp = line.trim() === "app:";
      inEnvironment = false;
      continue;
    }
    if (!inApp) {
      continue;
    }
    if (/^ {4}[a-z_]+:/.test(line)) {
      inEnvironment = line.trim() === "environment:";
      continue;
    }
    const match = inEnvironment && line.match(/^ {6}([A-Z][A-Z0-9_]*):\s*(.*)$/);
    if (match) {
      values[match[1]] = match[2].trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    }
  }
  return values;
}

export function toCloudEnvironment(values) {
  return Object.fromEntries(
    Object.entries(values)
      .filter(([name]) => !SKIPPED_NAMES.has(name))
      .map(([name, value]) => [name, value.replace(/@db:5432\//, "@localhost:5432/")]),
  );
}

export function toShellExports(values) {
  return Object.entries(values)
    .map(([name, value]) => `export ${name}='${value.replaceAll("'", "'\\''")}'`)
    .join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const values = toCloudEnvironment(parseAppEnvironment(readFileSync("docker-compose.yml", "utf8")));
  console.log(toShellExports(values));
}
