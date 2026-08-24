import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const baselinePath = path.resolve("openapi/public-contract-baseline.json");
const clientPath = path.resolve("../../packages/api-client/src/index.ts");
const workerPath = path.resolve("openapi/worker-foundation.openapi.json");
const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
assert.equal(
  baseline.schema_version,
  "vocanova-retired-api-contract-v1",
  "retired API contract snapshot schema drifted",
);
assert.equal(baseline.retired_at_task, "VOC-080-T11");
assert.match(baseline.retired_source_revision, /^[0-9a-f]{40}$/);
assert.match(baseline.retired_source_sha256, /^[0-9a-f]{64}$/);
const operations = baseline.operations;
const clientExceptions = baseline.clientExceptions;
const expectedWorkerOperations = baseline.workerMigratedOperations;
const workerOperationIds = new Set(
  expectedWorkerOperations.map((operation) => operation.operationId),
);
const workerSuccessStatus = Object.fromEntries(
  expectedWorkerOperations.map((operation) => [
    operation.operationId,
    operation.successStatus,
  ]),
);
const worker = JSON.parse(await readFile(workerPath, "utf8"));
const workerCandidates = Object.entries(worker.paths)
  .flatMap(([route, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({
      method: method.toUpperCase(),
      operationId: operation.operationId,
      path: route,
    })),
  )
  .filter((operation) => workerOperationIds.has(operation.operationId))
  .sort((left, right) => left.operationId.localeCompare(right.operationId));
const workerOperations = operationManifest(worker, workerCandidates);

const client = await readFile(clientPath, "utf8");
for (const { path: route } of operations) {
  if (Object.hasOwn(clientExceptions, route)) continue;
  const stablePrefix = route.split("{")[0];
  assert.ok(
    client.includes(stablePrefix),
    `API client has no request path matching canonical route ${route}`,
  );
}
assert.ok(operations.length > 0, "canonical API has no operations");
assert.deepEqual(
  workerOperations,
  expectedWorkerOperations,
  "Worker operation method, path, parameters, or shape drifted from the retired parity snapshot",
);
assert.equal(
  workerOperations.length,
  workerOperationIds.size,
  "Worker migrated parity manifest is incomplete",
);
assert.deepEqual(
  Object.keys(clientExceptions),
  operations
    .map((operation) => operation.path)
    .filter((route) => !client.includes(route.split("{")[0])),
  "client-path exceptions must be exact, documented, and minimal",
);
process.stdout.write(
  `Public contract drift check: PASS (${operations.length} retired-source operations; ${workerOperations.length} Worker operations; API client coverage present)\n`,
);

function operationManifest(document, candidates) {
  return candidates.map((candidate) => {
    const operation =
      document.paths[candidate.path][candidate.method.toLowerCase()];
    const successStatus = workerSuccessStatus[candidate.operationId];
    assert.ok(
      operation.responses[String(successStatus)],
      `${candidate.operationId} is missing successful response ${successStatus}`,
    );
    return {
      ...candidate,
      successStatus,
      parameters: (operation.parameters ?? [])
        .map((parameter) => ({
          in: parameter.in,
          name: parameter.name,
          required: parameter.required ?? false,
        }))
        .sort((left, right) =>
          `${left.in}:${left.name}`.localeCompare(`${right.in}:${right.name}`),
        ),
      request: schemaManifest(
        document,
        operation.requestBody?.content?.["application/json"]?.schema,
      ),
      response: schemaManifest(
        document,
        operation.responses[String(successStatus)]?.content?.[
          "application/json"
        ]?.schema,
      ),
    };
  });
}

function schemaManifest(document, input) {
  if (!input) return null;
  const schema = resolveSchema(document, input);
  return {
    properties: Object.keys(schema.properties ?? {})
      .filter((property) => property !== "$schema")
      .sort(),
    required: (schema.required ?? [])
      .filter((property) => property !== "$schema")
      .sort(),
  };
}

function resolveSchema(document, input) {
  if (!input.$ref) return input;
  const parts = input.$ref.replace(/^#\//, "").split("/");
  return parts.reduce((value, part) => value[part], document);
}
