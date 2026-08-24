# VOC-081 — Deterministic local Cloudflare development and F2 acceptance gate

Status: repository/local F2 implementation complete through T04. The exact implementation
head `a8694932671ad9c44fd2a97c128b14e6089e5faf` merged through PR #108 as
`36d526bdec83e28b17aa30a6814d42b92f058ec1`, with the hosted, review, rollback, and
post-merge evidence recorded in the VOC-084 closure inventory. No live action or deployment
is authorized.

VOC-080 makes the active repository Cloudflare-native and proves the web Worker, API
Worker, D1, service binding, and held delivery separately. The next dependency in
DOC-12 is F2 acceptance: a contributor must be able to clone, install, initialize local
D1, run both Workers, and observe the technical foundation through documented commands.

Issue [#101](https://github.com/KARSIFT/vocanova-platform/issues/101) demonstrates that
the current root `pnpm dev` starts only Next.js, starts no API or migration, disagrees
with the API Worker port, and causes Next 16 to generate untracked nested agent-rule
files. This package defines the bounded fix without claiming F3 staging or product
milestone acceptance.

## Implemented repository/local result

- `pnpm dev:init` prepares an explicit local-only D1 state directory and applies all
  forward migrations idempotently.
- `pnpm dev` provides the fast edit loop with Next hot reload plus the local API Worker,
  consistent origins, readiness, and deterministic termination.
- `pnpm dev:workers` builds and runs both real Worker bundles under local workerd on
  separate stable URLs; their service binding is connected.
- `pnpm test:local-stack` proves the same contract with disposable state and no live
  service or credential.
- start/stop leaves the tracked tree clean and creates no generated agent instructions.
- an F2 evidence record distinguishes repository/local acceptance from still-held F3.

AC-00 through AC-07 and T00 through T04 are complete for repository/local F2. This record
does not claim F3, A1/product acceptance, Windows-native support, staging, production,
deployment, activation, release, or live verification. VOC-080-HOLD-00, HOLD-01, and
HOLD-02 remain held.

## Authority boundary

All commands must force local simulation and disable remote bindings and automatic
resource provisioning. No command may deploy, use a Cloudflare account, send email,
invoke OAuth/AI providers, add an auth bypass, or inspect production data. GitHub keeps
canonical evidence; external Ruflo remains optional coordination with no authority.

Adoption requires a different-role exact-plan-revision review. Implementation then
requires separate exact-SHA review and hosted evidence. The planner/builder cannot
approve or merge its own work.
