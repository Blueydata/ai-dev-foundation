import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function listRequiredNames(exampleText) {
  return exampleText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
    .map((line) => line.slice(0, line.indexOf("=")));
}

export function findMissing(names, environment) {
  return names.filter((name) => !environment[name] || environment[name].trim() === "");
}

function checkEnvironment() {
  const names = listRequiredNames(readFileSync(".env.example", "utf8"));
  const missing = findMissing(names, process.env);
  if (missing.length === 0) {
    console.log(names.length === 0 ? "No user-provided variables are needed." : `All ${names.length} user-provided variables are set.`);
    return;
  }
  console.error(`Missing in .env: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkEnvironment();
}
