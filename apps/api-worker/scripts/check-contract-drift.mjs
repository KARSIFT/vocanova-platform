import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const canonicalPath = path.resolve("../api/openapi/vocanova.openapi.json");
const baselinePath = path.resolve("openapi/public-contract-baseline.json");
const clientPath = path.resolve("../../packages/api-client/src/index.ts");
const canonicalBytes = await readFile(canonicalPath);
const canonical = JSON.parse(canonicalBytes.toString("utf8"));
const operations = Object.entries(canonical.paths)
  .flatMap(([route, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({
      method: method.toUpperCase(),
      operationId: operation.operationId,
      path: route,
    })),
  )
  .sort((left, right) =>
    `${left.path}:${left.method}`.localeCompare(
      `${right.path}:${right.method}`,
    ),
  );
const clientExceptions = {
  "/api/v1/auth/oauth/google/callback":
    "OAuth provider redirect target; navigated by the browser/provider rather than VocanovaClient",
};
const expected = {
  canonical: "apps/api/openapi/vocanova.openapi.json",
  sha256: createHash("sha256").update(canonicalBytes).digest("hex"),
  clientExceptions,
  operations,
};
const serialized = `${JSON.stringify(expected, null, 2)}\n`;

if (process.argv.includes("--write")) {
  await writeFile(baselinePath, serialized, "utf8");
  process.stdout.write(`Wrote ${baselinePath}\n`);
} else {
  const committed = await readFile(baselinePath, "utf8");
  assert.equal(
    committed,
    serialized,
    "canonical Go OpenAPI drifted from the Worker migration baseline",
  );
}

const client = await readFile(clientPath, "utf8");
for (const { path: route } of operations) {
  if (Object.hasOwn(clientExceptions, route)) continue;
  const stablePrefix = route.split("{")[0];
  assert.ok(
    client.includes(stablePrefix),
    `API client has no request path matching canonical route ${route}`,
  );
}
assert.equal(canonical.openapi, "3.1.0");
assert.ok(operations.length > 0, "canonical API has no operations");
assert.deepEqual(
  Object.keys(clientExceptions),
  operations
    .map((operation) => operation.path)
    .filter((route) => !client.includes(route.split("{")[0])),
  "client-path exceptions must be exact, documented, and minimal",
);
process.stdout.write(
  `Public contract drift check: PASS (${operations.length} operations; API client path coverage present)\n`,
);
