import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const RULES = [
  { name: "OpenAI API key", pattern: /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/ },
  { name: "Anthropic API key", pattern: /sk-ant-[A-Za-z0-9_-]{32,}/ },
  { name: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: "Stripe secret key", pattern: /sk_live_[A-Za-z0-9]{24,}/ },
  { name: "Slack token", pattern: /xox[abprs]-[A-Za-z0-9-]{10,}/ },
  { name: "Private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const IGNORED_FILES = [/(^|\/)package-lock\.json$/, /\.(png|jpe?g|gif|ico|webp|pdf|woff2?)$/i, /(^|\/)\.env(\..+)?$/];
const IGNORED_DIRECTORIES = new Set(["node_modules", ".git", ".next"]);

function listFiles() {
  try {
    return execSync("git ls-files", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);
  } catch {
    const files = [];
    const walk = (directory) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue;
        const path = directory === "." ? entry.name : join(directory, entry.name);
        if (entry.isDirectory()) walk(path);
        else files.push(path);
      }
    };
    walk(".");
    return files;
  }
}

function isScanned(file) {
  return file.endsWith(".env.example") || !IGNORED_FILES.some((pattern) => pattern.test(file));
}

export function findSecrets(text) {
  const findings = [];
  text.split("\n").forEach((line, index) => {
    for (const rule of RULES) {
      if (rule.pattern.test(line)) findings.push({ line: index + 1, rule: rule.name });
    }
  });
  return findings;
}

function main() {
  const files = listFiles().filter(isScanned);
  let total = 0;
  for (const file of files) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const finding of findSecrets(text)) {
      console.error(`${file}:${finding.line}  ${finding.rule}`);
      total++;
    }
  }
  if (total > 0) {
    console.error(`\n${total} possible secret(s) found. Move them to .env and revoke any real key.`);
    process.exit(1);
  }
  console.log(`No secrets found in ${files.length} files.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
