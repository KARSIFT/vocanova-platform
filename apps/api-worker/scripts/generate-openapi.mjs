import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { createOpenApiDocument } from "../dist/app.js";

const outputPath = path.resolve("openapi/worker-foundation.openapi.json");
const generated = `${JSON.stringify(sortDeep(createOpenApiDocument()), null, 2)}\n`;

if (process.argv.includes("--write")) {
  await writeFile(outputPath, generated, "utf8");
  process.stdout.write(`Wrote ${outputPath}\n`);
} else {
  assert.ok(process.argv.includes("--check"), "use --check or --write");
  const committed = await readFile(outputPath, "utf8");
  assert.equal(
    committed,
    generated,
    "Worker OpenAPI is stale; run pnpm openapi:write and review the contract diff",
  );
  process.stdout.write("Worker OpenAPI drift check: PASS\n");
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortDeep(child)]),
    );
  }
  return value;
}
