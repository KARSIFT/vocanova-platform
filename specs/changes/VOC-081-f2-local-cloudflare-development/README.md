# VOC-081 — Deterministic local Cloudflare development and F2 acceptance gate

Status: draft; implementation is not authorized.

VOC-080 makes the active repository Cloudflare-native and proves the web Worker, API
Worker, D1, service binding, and held delivery separately. The next dependency in
DOC-12 is F2 acceptance: a contributor must be able to clone, install, initialize local
D1, run both Workers, and observe the technical foundation through documented commands.

Issue [#101](https://github.com/KARSIFT/vocanova-platform/issues/101) demonstrates that
the current root `pnpm dev` starts only Next.js, starts no API or migration, disagrees
with the API Worker port, and causes Next 16 to generate untracked nested agent-rule
files. This package defines the bounded fix without claiming F3 staging or product
milestone acceptance.

## Planned result

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

## Authority boundary

All commands must force local simulation and disable remote bindings and automatic
resource provisioning. No command may deploy, use a Cloudflare account, send email,
invoke OAuth/AI providers, add an auth bypass, or inspect production data. GitHub keeps
canonical evidence; external Ruflo remains optional coordination with no authority.

Adoption requires a different-role exact-plan-revision review. Implementation then
requires separate exact-SHA review and hosted evidence. The planner/builder cannot
approve or merge its own work.
