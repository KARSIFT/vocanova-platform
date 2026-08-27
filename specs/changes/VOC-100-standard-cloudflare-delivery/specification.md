# VOC-100 — Standard Cloudflare Environment Delivery: Specification

## Objective and requirement source

Issue [#173](https://github.com/KARSIFT/vocanova-platform/issues/173) records that
the custom five-record binder is an operational defect: it duplicates GitHub review
and check evidence, couples credential expiry to bookkeeping, and has already caused
multiple corrective packages without producing a staging dispatch.

This draft defines one prospective supersession. It does not rewrite VOC-094 through
VOC-099; those remain historical evidence. Where their still-future delivery
instructions conflict with an adopted VOC-100, VOC-100 controls.

## Scope and non-goals

The implementation changes the living GitHub Actions workflow, delivery policy and
tests, delivery manifest state, settings truth, and operations/governance guidance.
It retains the PR-168 resource and rollout design but removes the custom comment
binder and its supporting inputs/checks.

It does not change application behavior, D1 schema, Worker names, domains, account,
zone, Free/$0 ceiling, synthetic-only staging rule, production configuration, or
learner-data boundary. It does not create a repository-level Cloudflare secret.

## Stable decisions and requirements

### VOC-100-D00 — Adoption is exact and non-recursive

The issue and chat are intake only. The exact plan must be reviewed and adopted before
repository implementation. The adopted package records true authorization fields
before merge and creates no future `authority_effective` or self-bookkeeping package.

### VOC-100-D01 — PR-168 staging safety is preserved

Keep the exact staging resources/hostnames/D1 placement/service binding, Free/$0
ceiling, synthetic-only data, privacy-safe logging, ordered migrations, immutable
versions, exact promotion, smoke, Worker rollback, and forward-only D1 correction.
Production sentinels and `HOLD-01`/`HOLD-02` remain unchanged.

### VOC-100-D02 — Credential scope and classification are explicit

`cloudflare-staging` contains the two environment secret names. The account ID
`0a9eda28b96d77c24dcde74f3e074d47` is a public canonical identifier retained in the
secret interface only for Wrangler compatibility. Only the API-token value is
confidential. Neither name may exist as a repository or organization Actions secret,
and the token value is prohibited from repository/evidence/agent surfaces.

### VOC-100-D03 — Token creation and rotation are independently provable

A separately authorized account owner creates a finite, maximum-90-day token in the
Cloudflare dashboard. Sanitized dashboard policy readback proves one-account scope,
exactly Workers Scripts Edit plus D1 Edit, status, and expiry; the deployment token
has no token-management permission. Status verification and Wrangler account
readback supplement but do not replace policy evidence. Rotation creates and verifies
the replacement, installs it, passes a no-write environment-reviewed credential
check, then revokes the old token. Failure retains/reinstalls the old token and revokes
the failed replacement. No PR or deploy is required for ordinary rotation.

### VOC-100-D04 — Manual dispatch has a standard enforceable approval

Only actor `m-e-h-r-d-a-a-d` may dispatch staging from `develop`. Confirmation is
`DEPLOY staging <github.sha>`. The environment requires `NegarJafari` review, prevents
self-review, and disables admin bypass. That GitHub deployment approval is the
per-run action record; no issue-comment binder is reconstructed.

### VOC-100-D05 — Preflight and rollback discovery precede secrets and writes

A credential-free gate reads live environment settings and fails unless the required
reviewer/protection/custom `develop` branch policy is exact. Required same-run checks
pass before the environment job. Then exact account/secrets and current API/web
deployments are checked; each Worker must have one UUID at 100% traffic before the
first write. Those UUIDs are rollback targets.

### VOC-100-D06 — The delivery policy becomes small and deterministic

Validate only trigger, actor, branch, event SHA, confirmation, live environment
protection, manifest/resources, zero cost, production holds, rollout, and rollback.
No PR/push/reusable/validation/build/test/smoke/summary path may evaluate Cloudflare
secrets or enter a secret-bearing job. Remove comment network fetches, JCS, digests,
nonces, replay state, and binder/credential-expiry coupling.

### VOC-100-D07 — Settings truth follows the current two-PR rule

The delivery-control PR merges first with staging fail-closed while the environment is
absent. A separately authorized operator then creates/reconciles the exact environment,
reviewer/protections/custom branch policy, and two secrets, while proving broader-
scope name absence. One immediate documentation-only settings-truth PR records the
sanitized result. It is a one-time governance boundary, not a per-deploy PR.

### VOC-100-D08 — Production stays separate and held

Future production uses `cloudflare-production`, `main`, a different credential, and a
separately approved environment. This package neither creates nor enables it and
cannot dispatch, migrate, route, access data, or release production holds.

### VOC-100-D09 — All living surfaces change; historical evidence does not

Update the complete authorized living path inventory through the ordered PRs.
VOC-094 through VOC-099 and point-in-time VOC-080 records remain immutable. VOC-100
prospectively supersedes only their still-future conflicting binder instructions.

### VOC-100-D10 — Exact independent verification remains mandatory

Plan, delivery-control PR, and settings-truth PR each receive applicable exact-SHA
Cloudflare, security/settings, and independent R4 review plus hosted checks and a
different non-author merge. None grants external authority.

### VOC-100-D11 — The two-PR boundary is fixed and sufficient

One plan and task map to the delivery-control PR and the immediate documentation-only
settings-truth PR because the external settings mutation cannot be truthfully
preclaimed. Ordinary dispatches and rotations create no package or PR. Any further
split requires a newly documented hard boundary and overhead tradeoff.

## Security, privacy, and action authority

Environment secrets are narrower than repository or organization secrets because
only jobs referencing the protected environment can access them after its rules pass.
The separate environment reviewer catches workflow misuse by the dispatcher;
credential-free live settings checks catch protection drift. Credentials are scoped
at individual steps, never echoed, and absent from PR/push jobs. Account-wide
Workers/D1 permissions still create residual risk to unrelated resources in that
account; exact manifest/resource checks, separate production credentials, expiry,
review, and revocation mitigate but cannot eliminate that platform limitation.

Package adoption authorizes repository implementation only. Settings/secret entry
requires separate exact authority. A later exact standing staging delegation names
the sole dispatcher, reviewer, scope, token-expiry ceiling, revocation conditions,
and completion/expiry; it also records the named reviewer's confirmed participation.
Without that confirmation, activation stops for a reviewed plan amendment rather than
silently substituting an actor. Each environment approval binds a particular event
SHA. Production remains prohibited.

## Data, migrations, analytics, and accessibility

Staging contains synthetic/non-personal data only. Existing compatible ordered D1
migrations remain forward-only; a Worker rollback does not roll back D1. No analytics
or application accessibility behavior changes. Delivery logs must exclude learner
text, cookies, authorization headers, secrets, magic links, and prompt/response data.
