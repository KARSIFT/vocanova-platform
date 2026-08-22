# VOC-080 — Specification

## Objective and requirement source

Correct CI/CD before further product implementation, replace the server-bound runtime with a
Cloudflare-native staging and production architecture, remove verified runtime incompatibilities,
and use Ruflo as an external hierarchical orchestration aid. The founder direction is recorded in
[issue #85](https://github.com/KARSIFT/vocanova-platform/issues/85). This package translates that
direction into stable implementation requirements; it cannot implement itself before adoption.

## Decisions

### VOC-080-D00 — Preserve four workflows and make their contracts explicit

The workflow inventory remains exactly `ci.yml`, `governance.yml`, `quality.yml`, and
`security.yml`. Mature-repository practices are adopted selectively: immutable action SHAs,
`persist-credentials: false`, least-privilege job permissions, strict shells, bounded timeouts,
concurrency cancellation for superseded PR work, stable check names, local commands as the source
of truth, reusable repository-local setup, narrow artifacts on failure, and job separation that
identifies the failing subsystem. GitHub Actions does not call an AI model or decide product scope.

`ci.yml` is the only file that may contain Cloudflare build/version/deployment jobs, preserving the
four-file invariant. Pull-request jobs never receive deployment credentials. A deployment job must
depend on the exact validation revision and satisfy its environment/action hold. Production work is
never auto-cancelled after a data migration begins.

### VOC-080-D01 — CI optimization may not reduce evidence

The current `pnpm validate` contract remains locally reproducible while hosted CI gains diagnostic
jobs for repository foundation, formatting/lint/typecheck, packages, web, reference Go API during
migration, Worker API, contract parity, D1 migrations, builds, and Cloudflare dry runs. Path-based
skips may be introduced only behind a deterministic changed-path classifier with positive and
negative tests and a stable aggregate required result. Cache misses degrade to normal execution;
caches are not correctness evidence.

Quality retains accessibility and Lighthouse. Security retains dependency and secret scanning and
adds only tools that work on the private repository's current plan without falsely claiming GitHub
Advanced Security. Governance retains fail-closed structure, risk, authority, and read-only merge
eligibility evaluation.

### VOC-080-D02 — Cloudflare Workers and D1 replace owned servers

The target runtime is managed Cloudflare services, not an owned VM or server:

- web: Next.js 16 through `@opennextjs/cloudflare` on Workers;
- API: TypeScript Module Worker using Hono and schema-driven request/response validation;
- relational persistence: separate Cloudflare D1 databases for local, staging, and production;
- inter-service calls: Cloudflare service bindings where the web Worker must call the API Worker;
- async work: `ctx.waitUntil`, Queues, or Workflows only where a measured requirement exists;
- assets: Workers Static Assets and, only when required, R2/Images;
- observability: structured Workers logs/metrics/traces with privacy-safe fields;
- secrets: Cloudflare secrets or Secrets Store bindings, never source or Wrangler plaintext;
- AI: existing provider abstraction first; Workers AI is an optional provider, not an implicit
  product change.

Cloudflare Containers, Go/Wasm, Hyperdrive to an external PostgreSQL service, and a new VM are
rejected as the primary target. Containers and external PostgreSQL preserve a server-shaped cost
and operations model. Go/Wasm does not solve the current `net/http`, Ent, `lib/pq`, PostgreSQL SQL,
or D1 JavaScript-binding incompatibilities, and Workers WASI support remains experimental.

### VOC-080-D03 — Adapt the web through OpenNext and prove workerd compatibility

The web application keeps Next.js 16, App Router, Server Components, SSR, middleware, and the
existing API-client boundary where compatible. OpenNext replaces standalone Docker output. The
package adds Cloudflare build, preview, and dry-run commands; a committed `wrangler.jsonc` with a
current compatibility date, `nodejs_compat`, observability, generated binding types, explicit
preview behavior, and separate environment configuration; and workerd integration tests.

No task may declare compatibility from `next build` alone. CI must execute the OpenNext transform,
Wrangler dry run, compressed-size/startup checks, and relevant requests under workerd. Unsupported
Node middleware, process-global request state, unbounded buffering, floating promises, or
hard-coded runtime configuration must be removed or adapted without changing product behavior.

### VOC-080-D04 — Replace the Go transport/runtime incrementally behind the API contract

The committed `/api/v1` OpenAPI contract and observable business behavior are the migration seam.
A new TypeScript Worker workspace starts with health/config/error contracts, then migrates bounded
domains in dependency order. Hono provides Web-standard routing and middleware;
`@hono/zod-openapi` provides typed validation and generated OpenAPI. Cloudflare binding types are
generated with `wrangler types`; hand-written `any` binding interfaces are prohibited.

Domain logic stays transport- and storage-independent. D1 repositories sit behind typed interfaces.
The Go implementation remains a read-only behavioral reference and test oracle until parity is
proven for every endpoint and protected invariant. New product behavior is prohibited during the
port. A domain may cut over only when request/response/error/auth/idempotency fixtures match and its
Worker tests pass in workerd. The final retirement task removes Go only after complete parity.

### VOC-080-D05 — Model D1 explicitly rather than translating PostgreSQL mechanically

D1 uses SQLite semantics. New SQL migrations are forward-only Wrangler D1 migrations. UUID/UUIDv7
values are stored as canonical text, UTC timestamps as canonical ISO-8601 text or another single
documented representation, booleans as constrained integers, and flexible JSON as validated text.
Foreign keys, uniqueness, partial indexes, checks, idempotency, and ordering are re-specified and
tested. JavaScript numeric precision prohibits unsafe use of 64-bit values as `number`.

Prepared statements are mandatory for dynamic values. Atomic multi-step writes use D1 `batch()`
or a Durable Object only where the bounded-domain invariant cannot be represented safely by an
atomic batch. Read-after-write flows use appropriate D1 session consistency. Schema and query
design must stay inside documented row, column, parameter, query, size, and subrequest limits.

### VOC-080-D06 — Data migration is a separately authorized, rehearsed conversion

PostgreSQL dumps are not directly importable into D1. Repository tooling may define a deterministic
export schema, normalize types, transform records to SQLite-compatible SQL/NDJSON, validate foreign
keys and counts, and import into local D1 using synthetic fixtures. It must be resumable and
idempotent, redact secrets/tokens, and emit machine-readable reconciliation without learner content
in logs.

Production export, transformation, upload, and deletion require `VOC-080-HOLD-02`. A successful
code migration does not imply production-data migration. Time Travel and code rollback do not
automatically reverse incompatible schema/data changes; expand/migrate/contract ordering and a
forward corrective path are required.

### VOC-080-D07 — Build immutable versions, verify staging, then promote explicitly

CI builds and tests exact revisions. Deployment jobs use a full-SHA-pinned Cloudflare action or the
locked Wrangler CLI, a least-privilege account-scoped token, and no persisted Git credentials.
Pull requests perform credential-free dry runs. Staging and production have different Worker names,
D1 databases, secrets, routes, and GitHub environments.

The deployment sequence is: validate exact SHA -> apply compatible staging D1 migrations -> upload
immutable API and web versions -> smoke/contract/E2E test staging -> record version IDs and evidence
-> obtain any action-specific production authority -> verify production backup/Time Travel and
migration preconditions -> apply compatible production migration -> promote exact tested versions
-> smoke test -> record outcome. Production deployment is never triggered by issue/comment events
or Ruflo judgment and is never automatically cancelled mid-migration.

### VOC-080-D08 — Ruflo is external coordination, not repository authority

Ruflo is pinned to an audited npm version and integrity and runs in an operator-controlled external
workspace or user-level MCP configuration. The project does not run `ruflo init --force`: upstream
initialization can write `AGENTS.md`, `.agents/`, `.codex/`, hooks, plugins, and MCP registrations.
Any adopted tracked integration is hand-reconciled and minimal.

Ruflo may coordinate planner, researcher, architect, builder, tester, specialist, reviewer, and
task-orchestrator roles in isolated worktrees. It may store non-sensitive development patterns and
route tasks. It may not receive repository merge/approve/close authority, Cloudflare credentials,
production secrets/data, spending authority, or deployment authority. It cannot turn issue or
comment events into agent execution. A Ruflo receipt is supporting provenance, not a substitute for
an approved package, deterministic checks, exact-SHA independent review, GitHub evidence, or an
action-specific hold.

Builder and reviewer roles must be different participants with separate context and no shared
authorship of the reviewed revision. Review prompts receive completed test evidence and prohibit
redundant long-running test suites or background processes.

### VOC-080-D09 — Retire old infrastructure only after parity and cutover evidence

Dockerfiles, Compose, Nginx, host scripts, PostgreSQL runtime code, and stale server documentation
remain during the compatibility window. After all endpoint/data/web/deployment acceptance criteria
pass, a dedicated reviewed task removes or archives them and updates validators. Repository removal
does not inspect, stop, or claim to stop any live server. Historical change packages remain
immutable evidence.

### VOC-080-D10 — Cost and platform limits are acceptance inputs

The plan targets no owned server, not guaranteed zero cost. The Workers Free plan is acceptable for
local/prototype evidence only. Production readiness records compressed Worker sizes, startup time,
CPU, request volume, D1 reads/writes/storage, query counts, and cost caps. A paid-plan decision is a
separate spending action. The implementation must fail visibly at configured limits and avoid
unbounded billing behavior.

## Scope and non-goals

In scope are the four workflows, supported repository settings, canonical architecture and
operations documentation, OpenNext adaptation, the TypeScript Worker API, D1 schema and migration
tooling, staged deployment controls, Ruflo's external permission envelope, old-runtime retirement,
and the validation/evidence needed for each.

Non-goals are new product features, a native mobile client, automatic merge, GitHub-hosted AI
review, issue-triggered agents, live server inspection, automatic DNS mutation, use of production
secrets or data during reconstruction, and any claim that a merged repository change is itself a
production deployment.

## Risk and protected areas

R4 applies throughout. Authentication, authorization, learner data, schema migration, AI privacy,
CI/CD, production deployment, canonical governance, and agent authority receive specialist review.
Unknown compatibility, data reconciliation, action authority, or platform-limit evidence fails
closed. No EHR is triggered merely by R4; an actual exceptional uncertainty is recorded if found.

## Data, analytics, accessibility, security, and privacy

Synthetic fixtures are the only migration data used before explicit production-data authority.
Logs must exclude sentence text, tokens, magic links, OAuth material, cookies, and personal data.
Worker and D1 usage metrics are operational telemetry and follow the privacy baseline. Web tasks
retain accessibility and Lighthouse gates. Security checks cover dependency integrity, secrets,
authorization/cross-user behavior, timing-safe secret comparison where relevant, CORS/CSRF,
session cookies, rate limits, and failure behavior under platform limits.
