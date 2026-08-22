# Worker API contracts

`worker-foundation.openapi.json` is generated from the Hono route registry.
`public-contract-baseline.json` binds this migration workspace to the canonical
Go `/api/v1` OpenAPI document until every endpoint has passed Worker parity. Its
identity/account manifest compares all 13 migrated operation IDs, methods, paths,
primary success statuses, public request/response fields, required fields, and
query/header parameters against the Go reference.

Regenerate either file only through the package scripts and review the semantic
diff. The OpenAPI scripts build their ignored TypeScript output first, so they
also work directly after a clean checkout. The CI check modes compare
deterministic bytes and fail closed on drift.
