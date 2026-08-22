# Server-runtime retirement and repository rollback

Status: active repository record for VOC-080-T11. This record describes source-tree
retirement only. T11 did not inspect, mutate, stop, or assert the state of a live server.

## Retirement gate

The former Go/PostgreSQL/Docker/Nginx implementation remained active during the
compatibility window. T11 ran only after exact revisions existed for the complete
T03-T10 parity chain recorded in
`infrastructure/cloudflare/server-retirement-manifest.json`:

1. OpenNext web Worker and local workerd compatibility;
2. Hono/D1 API foundation and complete identity, content, review, mission, progress,
   AI, email, and observability domain parity;
3. deterministic synthetic PostgreSQL-to-D1 conversion and bounded reconciliation;
4. credential-free staging/production dry runs and fail-closed held delivery controls.

The manifest binds each gate to a 40-character revision. The retirement validator
fails closed if the chain is incomplete, if a retired executable path returns, or if
the record claims any live-server access.

## Active replacement

| Retired repository surface                  | Active replacement                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| Go/Huma API and PostgreSQL repositories     | `apps/api-worker` Hono Module Worker and typed D1 repositories                      |
| PostgreSQL/Atlas migrations                 | Forward-only D1 migrations under `apps/api-worker/migrations`                       |
| Standalone Next.js container                | OpenNext-generated Cloudflare Web Worker exercised in local workerd                 |
| Compose and Nginx topology                  | Held, environment-scoped Worker/D1 delivery model under `infrastructure/cloudflare` |
| Host deployment, smoke, and cutover scripts | Credential-free dry runs plus mocked, fail-closed delivery policy checks            |
| Real-server Playwright configuration        | Deterministic browser contract tests plus local two-Worker workerd integration      |
| Go CI and dependency automation             | Node/pnpm subsystem jobs, Worker/D1 tests, and the retirement guard                 |

The active tree contains no executable Go module, PostgreSQL server runtime,
Dockerfile, Compose file, Nginx configuration, host deployment script, or real-server
test configuration. Historical change packages under `specs/changes/` and archived
documents under `docs/archive/` remain immutable evidence.

## Retained non-runtime evidence

Three compact artifacts remain because the active migration checks need deterministic
oracles:

- `apps/api-worker/openapi/public-contract-baseline.json` records the retired public
  API contract hash and operation/status surface;
- `apps/api-worker/test/fixtures/postgres-schema-v1.json` records the retired 25-table
  source schema, exact source revision, and canonical table-map hash;
- `apps/api-worker/test/fixtures/postgres-export-v1.ts` is synthetic conversion input,
  not learner or production data.

These artifacts cannot listen on a port, connect to PostgreSQL, start a container, or
perform a remote action. The contract and conversion validators compare the active
Worker/D1 implementation against them without reading deleted runtime source.

## Validation

From the repository root:

```bash
pnpm run ci:retirement
pnpm --filter @vocanova/api-worker contract:check
pnpm --filter @vocanova/api-worker data-conversion:inventory
```

`ci:retirement` validates the evidence manifest, scans the active tree, exercises
negative fixtures, and rejects stale executable server instructions. The ordinary web,
Worker API, governance, quality, and security gates continue to validate the active
Cloudflare-native implementation.

## Repository rollback

Revert the T11 commit to restore the former repository files if source-level rollback
is required. That revert restores code and documentation only. It does not connect to,
restart, restore, reconfigure, or otherwise make a claim about any live server, database,
DNS record, Cloudflare resource, secret, or deployed version. Any future live recovery
must use its separately reviewed runbook and action-specific authority.
