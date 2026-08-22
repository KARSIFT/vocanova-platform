import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { format } from "prettier";

const canonicalPath = path.resolve("../api/openapi/vocanova.openapi.json");
const baselinePath = path.resolve("openapi/public-contract-baseline.json");
const clientPath = path.resolve("../../packages/api-client/src/index.ts");
const workerPath = path.resolve("openapi/worker-foundation.openapi.json");
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
const workerOperationIds = new Set([
  "GetCurrentUser",
  "RequestMagicLink",
  "ConsumeMagicLink",
  "OAuthStart",
  "OAuthCallback",
  "Logout",
  "GetOnboarding",
  "CompleteOnboarding",
  "GetSettings",
  "UpdateSettings",
  "RequestEmailChangeLink",
  "ConsumeEmailChangeLink",
  "CreateAccountDeletionRequest",
  "ListJourneySituations",
  "GetJourneySituation",
  "GetCanonicalWord",
  "ListSavedWords",
  "SaveUserWord",
  "UnsaveUserWord",
  "GetReviewsDue",
  "SubmitReview",
]);
const workerSuccessStatus = {
  CompleteOnboarding: 200,
  ConsumeEmailChangeLink: 200,
  ConsumeMagicLink: 200,
  CreateAccountDeletionRequest: 200,
  GetCurrentUser: 200,
  GetOnboarding: 200,
  GetSettings: 200,
  Logout: 204,
  OAuthCallback: 302,
  OAuthStart: 200,
  RequestEmailChangeLink: 204,
  RequestMagicLink: 204,
  UpdateSettings: 200,
  GetCanonicalWord: 200,
  GetJourneySituation: 200,
  GetReviewsDue: 200,
  ListJourneySituations: 200,
  ListSavedWords: 200,
  SaveUserWord: 200,
  SubmitReview: 200,
  UnsaveUserWord: 204,
};
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
const canonicalWorkerCandidates = operations
  .filter((operation) => workerOperationIds.has(operation.operationId))
  .sort((left, right) => left.operationId.localeCompare(right.operationId));
const workerOperations = operationManifest(worker, workerCandidates);
const canonicalWorkerOperations = operationManifest(
  canonical,
  canonicalWorkerCandidates,
);
const expected = {
  canonical: "apps/api/openapi/vocanova.openapi.json",
  sha256: createHash("sha256").update(canonicalBytes).digest("hex"),
  clientExceptions,
  workerMigratedOperations: workerOperations,
  operations,
};
const serialized = await format(JSON.stringify(expected), { parser: "json" });

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
  workerOperations,
  canonicalWorkerOperations,
  "Worker migrated operation method, path, parameters, or shape drifted from the canonical Go contract",
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
  `Public contract drift check: PASS (${operations.length} canonical operations; ${workerOperations.length} Worker migrated operations; API client coverage present)\n`,
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
