# VOC-005 Tasks

## VOC-005-T01 — Re-verify authority and base

Confirm canonical VOC-005 adoption, issue #14, current `develop`, applicable
instructions, and the absence of conflicting target work.

## VOC-005-T02 — Create canonical application roots

Create only `apps/web` and `apps/api`; prove prohibited alternative roots are absent.

## VOC-005-T03 — Create approved shared packages

Create the four approved `packages/*` boundaries, preserve `docs/` and `scripts/`, add
only the approved non-deploying `infra/` structural placeholder, and configure the
pnpm workspace without the Go backend.

## VOC-005-T04 — Establish the Go backend skeleton

Create the minimal modular-monolith foundations and real build/test proof without
domain behavior, schema, or executable migrations.

## VOC-005-T05 — Pin tools and dependencies

Resolve supported stable versions, declare Node.js/pnpm/Go toolchains, use exact
dependencies, and create a reproducible frozen lockfile.

## VOC-005-T06 — Wire honest root commands

Add real development, validation, lint, type-check, test, build, formatting, and audit
entry points that propagate child failures and advertise no unavailable capability.

## VOC-005-T07 — Validate the web skeleton

Add only the minimal framework-neutral or already-authorized scaffold required for
real build, lint, and type checks; stop before any product or framework decision.

## VOC-005-T08 — Document local workflow

Add necessary cross-platform configuration and concise clean-checkout/setup/command
documentation.

## VOC-005-T09 — Add and run deterministic validation

Run existing governance validation, all committed F2 commands, clean frozen install,
dependency audit, and representative negative failure-propagation checks.

## VOC-005-T10 — Inspect scope, safety, and risk

Review the complete diff for exclusions, secrets, generated artifacts, architecture
drift, and protected paths; record the highest effective risk.

## VOC-005-T11 — Publish and independently verify implementation

Create a separate draft PR to `develop`, preserve exact evidence, and repeat the
exact-SHA Claude remediation loop until no blocking finding remains.

## Task traceability

Tasks `T02`–`T11` map respectively to acceptance criteria `AC-01`–`AC-10`; `T01`
enforces the authority precondition for all requirements and is evidenced by
`VOC-005-EV-01`.
