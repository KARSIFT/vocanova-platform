# VOC-006 Impact Analysis

## Repository and developer workflow

The later implementation changes only the web workspace from a TypeScript validation
skeleton into a runnable framework foundation. Contributors gain real Next.js
development, build, type-check, lint, and start paths. Root workspace commands remain
the integration surface. No learner-facing product behavior is delivered.

## Architecture and compatibility

The canonical layout remains unchanged: web at `apps/web`, Go API at `apps/api`, and
shared packages under `packages/`. App Router, React, TypeScript, and minimal Tailwind
CSS implement already approved direction. The frontend remains a client of future Go
APIs and never becomes a direct PostgreSQL client. F2-I04 and later architecture are
unaffected.

## Security, privacy, and supply chain

There is no auth, learner data, secret, production connection, telemetry, or database
access. Framework dependencies increase supply-chain and install-script exposure.
Controls are authoritative stable-version resolution, exact pins, minimal dependency
selection, frozen installation, audit, lockfile review, and no unrelated upgrades.

## Operations, accessibility, and release

The development server and production build are local validation targets only. No
Cloudflare/OpenNext adapter, deploy configuration, environment, preview, staging, or
production operation exists. The minimal technical page should use reasonable HTML
defaults but does not claim completion of later UI, accessibility, component, or E2E
test foundations.

## Risks

- **VOC-006-RISK-01 — Scope creep:** a scaffold may add starter product UI or future
  libraries. Control: minimal technical page, dependency allowlist, exclusions, and
  exact changed-file/full-diff review.
- **VOC-006-RISK-02 — Version incompatibility:** latest packages may not support the
  pinned toolchain or one another. Control: authoritative upstream compatibility
  review, stable exact pins, clean frozen install, build, type, and lint evidence.
- **VOC-006-RISK-03 — False command validation:** framework-neutral or obsolete
  scripts may pass without checking Next.js. Control: inspect commands, run real
  checks, and prove representative failures propagate.
- **VOC-006-RISK-04 — Generated-artifact drift:** Next.js may create cache or generated
  files. Control: review ignored/untracked files and commit only required canonical
  configuration and source.
- **VOC-006-RISK-05 — Frontend authority drift:** server-capable framework code could
  bypass the Go API and reach data directly. Control: prohibit database dependencies,
  credentials, schemas, queries, and direct data-store connections.
- **VOC-006-RISK-06 — Premature deployment:** framework configuration may add a
  Cloudflare/OpenNext or production path. Control: deployment-specific dependencies,
  config, scripts, and claims remain excluded.
- **VOC-006-RISK-07 — Risk under-classification:** package adoption touches protected
  `specs/README.md`; implementation changes manifests/lockfile. Control: accept the
  highest classifier or semantic assessment for each exact diff.

## Dependencies

- **VOC-006-DEP-01:** Founder-approved bounded requirement in issue #19 — resolved.
- **VOC-006-DEP-02:** Canonical package base
  `e97cce408c19312d1f88afb8be4bffa697d98a82` — resolved for preparation; re-verify
  live `develop` before adoption and implementation.
- **VOC-006-DEP-03:** Active DOC-15/DOC-16/A-003 governance and repository controls —
  resolved and binding.
- **VOC-006-DEP-04:** Completed VOC-005 workspace/tooling foundation — resolved at the
  grounded base.
- **VOC-006-DEP-05:** Exact supported stable framework/dependency versions — resolve
  from authoritative upstream sources during implementation and document rationale;
  this package intentionally invents no versions.

## Evidence register

- **VOC-006-EV-01:** Issue #19, roadmap boundary, and live-base verification.
- **VOC-006-EV-02:** Complete nine-file package and canonical index diff.
- **VOC-006-EV-03:** Tracked web tree and canonical-root inspection.
- **VOC-006-EV-04:** Rendered root layout/page and styling inspection.
- **VOC-006-EV-05:** Clean production-build output.
- **VOC-006-EV-06:** Bounded development-server readiness/request/termination record.
- **VOC-006-EV-07:** Real type-check, lint, and representative failure-propagation
  output.
- **VOC-006-EV-08:** Version rationale, manifests, lockfile, frozen install, and audit.
- **VOC-006-EV-09:** Root/workspace/API/governance regression-validation output.
- **VOC-006-EV-10:** Exact changed files, full diff, scope/safety/secret/data-access/
  deployment inspection.
- **VOC-006-EV-11:** Implementation PR, exact candidate, classifier, hosted checks,
  independent verdict, approvals, and rollback record.
- **VOC-006-EV-12:** Package PR deterministic validation, exact candidate, applicable
  hosted R3 checks, exact-SHA independent verdict, and canonical adoption evidence.
