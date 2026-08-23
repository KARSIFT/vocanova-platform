/* global console, process */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const middleware = await read("src/middleware.ts");
const transport = await read("src/lib/server-api-transport.ts");
const wranglerConfig = await read("wrangler.jsonc");

assert.doesNotMatch(
  middleware,
  /export\s+const\s+runtime\s*=\s*["']nodejs["']/,
  "Cloudflare OpenNext does not support Node.js middleware",
);
assert.match(transport, /getCloudflareContext\(\)\.env\.API/);
assert.match(transport, /binding\.fetch\(/);
assert.doesNotMatch(wranglerConfig, /["']remote["']\s*:\s*true/);
assert.doesNotMatch(
  wranglerConfig,
  /(api[_-]?token|account[_-]?id|password|secret)\s*["']?\s*:/i,
  "Wrangler configuration must not contain credentials or secret values",
);

const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
assert.ok(configPath, "tsconfig.json not found");
const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, ts.sys);
assert.ok(parsed, "unable to parse tsconfig.json");
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const findings = [];

for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.fileName.startsWith(path.join(root, "src"))) continue;
  const source = sourceFile.getFullText();
  for (const pattern of [
    /\bBuffer\s*\./g,
    /from\s+["']node:(?:child_process|cluster|dgram|fs|net|tls|worker_threads)["']/g,
    /\b(?:request|response)\.(?:arrayBuffer|blob|bytes|text)\(\)/g,
  ]) {
    for (const match of source.matchAll(pattern)) {
      findings.push(
        `${relative(sourceFile.fileName)}: unsupported/unbounded pattern ${match[0]}`,
      );
    }
  }

  visit(sourceFile);

  function visit(node) {
    if (ts.isExpressionStatement(node) && isPromiseLike(node.expression)) {
      const position = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(),
      );
      findings.push(
        `${relative(sourceFile.fileName)}:${position.line + 1}: floating Promise expression`,
      );
    }
    ts.forEachChild(node, visit);
  }
}

assert.deepEqual(findings, [], findings.join("\n"));
console.log(
  "Worker compatibility scan: PASS (edge middleware, typed service binding, no remote bindings, unsupported globals, unbounded body buffering, or floating Promises)",
);

function isPromiseLike(node) {
  if (ts.isAwaitExpression(node) || ts.isVoidExpression(node)) return false;
  const type = checker.getTypeAtLocation(node);
  return checker.getPropertyOfType(type, "then") !== undefined;
}

function relative(file) {
  return path.relative(root, file);
}

async function read(file) {
  return readFile(path.join(root, file), "utf8");
}
