# VOC-080 — Impact Analysis

## Reconciled repository outcome

The repository implementation is complete through T12 at final head
`3d6699c5eb378b9a00679d61a5c28b6b7e27c32c`, merged by PR #100 as
`a05ab5c60534f36d1b89d9b9d32296469e9942bf`. The closure inventory records exact
task review, hosted, rollback, and post-merge evidence and preserves prior failures.
No external activation is implied: VOC-080-HOLD-00, HOLD-01, and HOLD-02 remain held.

## Security and privacy

This is an R4 security boundary migration. Primary risks are authentication/session regression,
cross-user data exposure, CORS/CSRF mistakes, secret leakage into PR jobs or bundles, unsafe AI
telemetry, unreviewed Ruflo hooks/tools, and deployment credentials reaching untrusted code.

Controls include contract and negative authorization fixtures; workerd tests; generated binding
types; parameterized D1 statements; timing-safe secret comparison where applicable; secure cookie,
OAuth-state, and magic-link parity; environment-scoped secrets; no secrets in repository or PR jobs;
privacy-safe structured logs; dependency/secret scanning; and exact-SHA security review. Ruflo receives
no secrets, production data, GitHub write authority, or Cloudflare authority.

## Data and migrations

The current PostgreSQL schema contains UUIDs, timestamptz, JSONB, foreign keys, checks, partial
indexes, transactions, and idempotency behavior that cannot be mechanically imported into D1.
Conversion risks include precision loss, timestamp drift, broken references, uniqueness differences,
transaction splitting, read-after-write inconsistency, and rollback after schema evolution.

Controls are an explicit SQLite schema, canonical representations, D1 batch/session semantics,
expand/migrate/contract ordering, synthetic conversion fixtures, per-table and domain-level
reconciliation, idempotent/resumable tooling, Time Travel/backups, no destructive automatic rollback,
and a separate production-data hold. The reference Go API remains until complete parity.

## Runtime, operations, and cost

OpenNext introduces Worker compressed-size/startup/CPU constraints. D1 introduces database, query,
parameter, row, storage, and subrequest limits. A Next.js SSR request may exceed the Free plan's CPU
budget even when functional tests pass. The package therefore records measurements and cost caps
instead of promising zero cost. The owner avoids buying/operating a server, but may separately accept
Cloudflare's paid plan.

Staging/production isolation, immutable versions, smoke tests, explicit promotion, version rollback,
and migration locks replace SSH/Docker/Nginx operations. No server-health polling is reintroduced.

## CI/CD and repository settings

Splitting CI improves diagnosis but can accidentally skip evidence or create unstable required-check
names. The aggregate contract, deterministic changed-path tests, local scripts, and exact workflow
inventory prevent this. Full-SHA pins and no persisted checkout credentials reduce supply-chain risk.
GitHub Free limitations remain visible; policy is not described as hosted enforcement.

## Agent orchestration and governance

Ruflo's upstream defaults can write project instructions and configure hooks/MCP/plugins. Its rapid
release cadence also raises dependency drift and supply-chain risk. Exact version/integrity pinning,
external installation, a deny-by-default permission envelope, reviewed upgrades, worktree isolation,
and retained GitHub evidence mitigate those risks. Ruflo coordination never authorizes scope, review,
merge, deployment, secrets, spending, or production access.

## Analytics and accessibility

Workers operational metrics replace host metrics. No learner text, token, cookie, magic-link, or AI
prompt/response content enters routine logs. Product analytics behavior is unchanged. Web migration
retains accessibility and Lighthouse evidence; architecture/docs-only tasks mark UI evidence N/A.

## Risks, dependencies, and evidence

- `VOC-080-R00`: contract or behavioral drift during the Go-to-Worker rewrite.
- `VOC-080-R01`: PostgreSQL-to-SQLite semantic or data-integrity loss.
- `VOC-080-R02`: credentials or production authority leak into CI/Ruflo/PR contexts.
- `VOC-080-R03`: OpenNext bundle/startup/CPU exceeds Cloudflare limits.
- `VOC-080-R04`: deployment and migration ordering creates an unrecoverable mixed version.
- `VOC-080-R05`: old infrastructure is removed before parity or live cutover is actually complete.
- `VOC-080-R06`: CI optimization skips a required subsystem or hides unavailable enforcement.
- `VOC-080-R07`: Ruflo-generated instructions or tools override canonical governance.
- `VOC-080-R08`: Cloudflare cost/quotas fail the product under real usage.
- `VOC-080-DEP-00` through `VOC-080-DEP-04`: recorded in `change.yaml`.
- `VOC-080-EV-00` through `VOC-080-EV-12`: exact task evidence defined in the test and task plans.
