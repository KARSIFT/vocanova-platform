import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceFiles = await filesUnder(path.join(root, "src"), ".ts");
const migrationFiles = await filesUnder(path.join(root, "migrations"), ".sql");
const wrangler = await readFile(path.join(root, "wrangler.jsonc"), "utf8");
const findings = [];

for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  for (const [pattern, description] of [
    [/\.exec\s*\(/g, "D1 exec is prohibited outside migration tooling"],
    [/\.prepare\s*\(\s*`[^`]*\$\{/gs, "dynamic SQL interpolation"],
    [
      /\b(?:Buffer|process|require)\b/g,
      "unsupported Node request-runtime global",
    ],
    [
      /console\.(?:log|error)[\s\S]{0,160}\b(?:authorization|cookie|email|password|secret|token|body|query)\b/gi,
      "sensitive log field",
    ],
  ]) {
    if (pattern.test(source))
      findings.push(`${path.relative(root, file)}: ${description}`);
  }
}

for (const file of migrationFiles) {
  const source = await readFile(file, "utf8");
  if (/\bDROP\s+(?:TABLE|COLUMN)\b/i.test(source)) {
    findings.push(
      `${path.relative(root, file)}: destructive migration statement`,
    );
  }
  if (/\bCREATE\s+TABLE\b/i.test(source)) {
    for (const marker of ["STRICT", "CHECK"]) {
      if (!source.includes(marker)) {
        findings.push(
          `${path.relative(root, file)}: missing ${marker} constraint`,
        );
      }
    }
  }
  if (
    /\b[a-z0-9_]+_json\s+TEXT\b/i.test(source) &&
    !source.includes("json_valid")
  ) {
    findings.push(
      `${path.relative(root, file)}: JSON column lacks json_valid constraint`,
    );
  }
}

if (/"remote"\s*:\s*true/.test(wrangler))
  findings.push("wrangler.jsonc: remote binding enabled");
if (/(api[_-]?token|password|secret)\s*"?\s*:/i.test(wrangler)) {
  findings.push("wrangler.jsonc: credential-like field");
}
assert.deepEqual(findings, [], findings.join("\n"));
process.stdout.write(
  "Worker API safety scan: PASS (prepared SQL, non-destructive constrained migration, redacted logs, local-only config)\n",
);

async function filesUnder(directory, suffix) {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => path.join(entry.parentPath, entry.name));
}
