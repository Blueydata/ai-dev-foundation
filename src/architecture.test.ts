import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, sep } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const CODE_EXTENSIONS = /\.(ts|tsx|mts|mjs)$/;
const IGNORED_DIRECTORIES = new Set(["node_modules", ".next", ".git"]);
const MODULE_ENTRIES = new Set(["domain", "application", "infrastructure", "presentation", "index.ts"]);
const APPLICATION_ENTRIES = new Set(["use-cases", "ports.ts", "schemas.ts", "errors.ts"]);
const PRESENTATION_ENTRIES = new Set(["components", "hooks", "actions", "url-state.ts"]);
const SERVER_ONLY_SHARED = ["shared/database", "shared/config", "shared/ai"];

type Location =
  | { kind: "app" }
  | { kind: "shared"; area: string }
  | { kind: "module"; module: string; layer: string }
  | { kind: "other" };

function listFiles(directory: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(join(ROOT, directory));
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    if (IGNORED_DIRECTORIES.has(entry)) return [];
    const path = join(directory, entry);
    return statSync(join(ROOT, path)).isDirectory() ? listFiles(path) : [path.split(sep).join("/")];
  });
}

const sourceFiles = listFiles("src").filter((file) => CODE_EXTENSIONS.test(file));
const productionFiles = sourceFiles.filter((file) => !/\.test\.tsx?$/.test(file));
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

function locate(srcPath: string): Location {
  const [top, name, layer] = srcPath.split("/");
  if (top === "app") return { kind: "app" };
  if (top === "shared") return { kind: "shared", area: name };
  if (top === "modules" && name) return { kind: "module", module: name, layer: (layer ?? "index").replace(/\.tsx?$/, "") };
  return { kind: "other" };
}

function resolveImport(file: string, specifier: string): string | undefined {
  if (specifier.startsWith("@/")) return specifier.slice(2);
  if (specifier.startsWith(".")) return relative("src", normalize(join(dirname(file), specifier))).split(sep).join("/");
  return undefined;
}

function importsOf(file: string): string[] {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      const callee = node.expression.getText(source);
      if (callee === "import" || callee === "require" || callee === "vi.mock") specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return specifiers;
}

function commentsOf(file: string): string[] {
  const text = read(file);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const positions = new Set<number>();
  const visit = (node: ts.Node) => {
    positions.add(node.getFullStart());
    positions.add(node.getEnd());
    ts.forEachChild(node, visit);
  };
  visit(source);
  const ranges = [...positions].flatMap((position) => [
    ...(ts.getLeadingCommentRanges(text, position) ?? []),
    ...(ts.getTrailingCommentRanges(text, position) ?? []),
  ]);
  const comments = [...new Set(ranges.map((range) => text.slice(range.pos, range.end)))];
  const jsxComments = Array.from(text.matchAll(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g), (match) => match[0]);
  return [...comments, ...jsxComments];
}

function isAllowed(from: Location, target: Location, targetPath: string, specifier: string): boolean {
  const isPackage = target.kind === "other" && !specifier.startsWith("@/") && !specifier.startsWith(".");
  if (from.kind === "shared") {
    return isPackage || target.kind === "shared";
  }
  if (from.kind === "app") {
    if (isPackage || target.kind === "shared" || target.kind === "app") return true;
    return target.kind === "module" && (target.layer === "index" || target.layer === "presentation");
  }
  if (from.kind !== "module") return true;
  if (target.kind === "app") return false;
  if (target.kind === "module" && target.module !== from.module) {
    return targetPath === `modules/${target.module}` && (from.layer === "infrastructure" || from.layer === "index");
  }
  const sameModuleLayer = target.kind === "module" ? target.layer : undefined;
  const sharedArea = target.kind === "shared" ? target.area : undefined;
  switch (from.layer) {
    case "domain":
      return sameModuleLayer === "domain" || sharedArea === "kernel";
    case "application":
      return sameModuleLayer === "domain" || sameModuleLayer === "application" || sharedArea === "kernel" || specifier === "zod";
    case "infrastructure":
      return isPackage || target.kind === "shared" || (sameModuleLayer !== undefined && sameModuleLayer !== "presentation" && sameModuleLayer !== "index");
    case "presentation":
      return isPackage || (sharedArea !== undefined && !SERVER_ONLY_SHARED.includes(`shared/${sharedArea}`)) || (sameModuleLayer !== undefined && sameModuleLayer !== "infrastructure");
    case "index":
      return isPackage || target.kind === "shared" || (sameModuleLayer !== undefined && sameModuleLayer !== "presentation");
    default:
      return false;
  }
}

describe("architecture", () => {
  it("respects the dependency rules between app, modules, layers and shared", () => {
    const violations = productionFiles.flatMap((file) => {
      const from = locate(file.slice(4));
      return importsOf(file)
        .map((specifier) => ({ specifier, targetPath: resolveImport(file, specifier) }))
        .filter(({ specifier, targetPath }) => {
          const target = targetPath === undefined ? ({ kind: "other" } as const) : locate(targetPath);
          return !isAllowed(from, target, targetPath ?? "", specifier);
        })
        .map(({ specifier }) => `${file} imports ${specifier}`);
    });
    expect(violations).toEqual([]);
  });

  it("only uses the allowed entries inside modules and layers", () => {
    const entries = new Set(listFiles("src/modules").map((file) => file.split("/").slice(2, 5).join("/")));
    const violations = [...entries].filter((entry) => {
      const [, moduleEntry, layerEntry] = entry.split("/");
      if (!MODULE_ENTRIES.has(moduleEntry)) return true;
      if (moduleEntry === "application" && layerEntry) return !APPLICATION_ENTRIES.has(layerEntry.replace(/(\.integration)?\.test\.ts$/, ".ts"));
      if (moduleEntry === "presentation" && layerEntry) return !PRESENTATION_ENTRIES.has(layerEntry);
      return false;
    });
    expect(violations).toEqual([]);
  });

  it("never imports server-only code into client components", () => {
    const violations = productionFiles
      .filter((file) => /^\s*["']use client["']/.test(read(file)))
      .flatMap((file) =>
        importsOf(file)
          .filter((specifier) => {
            const targetPath = resolveImport(file, specifier);
            if (!targetPath) return false;
            const target = locate(targetPath);
            if (target.kind === "module") return target.layer === "index" || target.layer === "infrastructure";
            return SERVER_ONLY_SHARED.some((area) => targetPath.startsWith(area));
          })
          .map((specifier) => `${file} imports ${specifier}`),
      );
    expect(violations).toEqual([]);
  });

  it("keeps server actions in presentation/actions", () => {
    const violations = productionFiles.filter((file) => /^\s*["']use server["']/.test(read(file)) && !/\/presentation\/actions\//.test(file));
    expect(violations).toEqual([]);
  });

  it("accesses the database only from infrastructure", () => {
    const violations = productionFiles
      .filter((file) => !file.startsWith("src/shared/database/"))
      .filter((file) => importsOf(file).some((specifier) => resolveImport(file, specifier)?.startsWith("shared/database")))
      .filter((file) => !/^src\/modules\/[^/]+\/infrastructure\//.test(file));
    expect(violations).toEqual([]);
  });

  it("reads environment variables only through shared/config/env.ts", () => {
    const violations = productionFiles.filter((file) => file !== "src/shared/config/env.ts" && read(file).includes("process.env"));
    expect(violations).toEqual([]);
  });

  it("names files and folders in kebab-case", () => {
    const segmentPattern = /^(\[{1,2}(\.\.\.)?[a-z][a-zA-Z0-9]*\]{1,2}|\([a-z0-9-]+\)|[a-z0-9]+(-[a-z0-9]+)*)$/;
    const violations = [...sourceFiles, ...listFiles("scripts")].flatMap((file) => {
      const segments = file.split("/");
      const fileName = segments.pop()!.replace(/(\.d)?(\.integration)?(\.test)?\.(ts|tsx|mts|mjs|css)$/, "");
      return [...segments, fileName].filter((segment) => !segmentPattern.test(segment)).map((segment) => `${file}: ${segment}`);
    });
    expect(violations).toEqual([]);
  });

  it("keeps integration tests next to infrastructure", () => {
    const misplacedIntegrationTests = sourceFiles.filter(
      (file) => file.endsWith(".integration.test.ts") && !/^src\/(modules\/[^/]+\/infrastructure|shared\/database)\//.test(file),
    );
    expect(misplacedIntegrationTests).toEqual([]);
  });

  it("names migrations as NNNN-description.sql", () => {
    const violations = listFiles("src/shared/database/migrations").filter(
      (file) => !file.endsWith(".gitkeep") && !/\/\d{4}-[a-z0-9-]+\.sql$/.test(file),
    );
    expect(violations).toEqual([]);
  });

  it("has no comments in code", () => {
    const codeFiles = [...sourceFiles, ...listFiles("scripts").filter((file) => CODE_EXTENSIONS.test(file))];
    const codeComments = codeFiles.flatMap((file) => commentsOf(file).map((comment) => `${file}: ${comment.slice(0, 60)}`));
    const otherFiles = [...listFiles("src").filter((file) => /\.(css|sql)$/.test(file)), "docker-compose.yml", ".env.example", ...listFiles(".github/workflows")];
    const otherComments = otherFiles.flatMap((file) =>
      read(file)
        .split("\n")
        .filter((line) => (file.endsWith(".sql") ? /^\s*--/ : /^\s*#/).test(line) || line.replace(/"[^"]*"/g, "").includes("/*"))
        .map((line) => `${file}: ${line.trim()}`),
    );
    expect([...codeComments, ...otherComments]).toEqual([]);
  });
});
