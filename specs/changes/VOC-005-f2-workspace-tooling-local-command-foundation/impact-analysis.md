# VOC-005 Impact Analysis

## Repository and developer workflow

The later implementation changes the repository from a governance-only foundation to
a buildable polyglot monorepo foundation. Contributors gain canonical web/API roots,
shared package boundaries, reproducible tool versions, frozen dependency installation,
and predictable root commands. No learner-facing behavior is delivered.

## Architecture and compatibility

The approved split is preserved: `apps/web` is the web root, `apps/api` is the Go
backend, and shared JavaScript/TypeScript packages remain under `packages/`. Go is not
forced into pnpm. No task runner or monorepo framework is justified for this slice.
Framework selection or upgrade is not authorized by this package.

## Security, privacy, and supply chain

No credentials, production access, personal data, or authorization surface is added.
New dependency manifests create supply-chain exposure; exact versions, a frozen
lockfile, package-manager pinning, dependency audit, minimal dependencies, and review
of install scripts mitigate it. The implementation must not require secrets.

## Data, migrations, analytics, and accessibility

There is no domain data, schema, executable migration, analytics, telemetry, UI, or
accessibility behavior. Tracked `ent` and `migrations` foundations are structural only.
Database migration and accessibility checks remain unavailable rather than being
reported as passing placeholders.

## Operations, release, and rollback

There is no deployment, environment, Cloudflare, staging, production, or release
effect. Before implementation merge, rollback is PR closure. After an authorized
implementation merge, rollback is a governed revert of its squash commit followed by
the previously valid governance checks; dependency caches and generated local files
are disposable and not rollback records.

## Risks

- **VOC-005-RISK-01 — Scope creep:** scaffolding could introduce features or later F2
  concerns. Control: explicit path/behavior exclusions and full-diff review.
- **VOC-005-RISK-02 — False validation:** root commands could be no-ops or mask child
  failures. Control: real command wiring and negative failure-propagation tests.
- **VOC-005-RISK-03 — Supply-chain drift:** floating tools or dependencies could make
  clean installs nondeterministic. Control: explicit tool versions, exact dependencies,
  frozen lockfile, and audit evidence.
- **VOC-005-RISK-04 — Polyglot coupling:** pnpm could incorrectly own Go lifecycle.
  Control: separate Go module/toolchain with root orchestration only.
- **VOC-005-RISK-05 — Premature architecture choice:** a scaffold could silently
  select or replace a frontend framework. Control: framework-neutral minimum and stop
  condition when framework-specific authority is absent.
- **VOC-005-RISK-06 — Protected-path under-classification:** `infra/` and
  `apps/api/.../migrations/` establish at least an R3 path floor when tracked. Control:
  classify the actual diff and accept the highest path or semantic assessment.

## Dependencies

- **VOC-005-DEP-01:** Founder-approved requirement and layout in GitHub issue #14 —
  resolved.
- **VOC-005-DEP-02:** Canonical live `develop` base
  `76d5ab47cd847a5634f3b8f429247726bd72a579` — resolved for package grounding;
  re-verify before implementation.
- **VOC-005-DEP-03:** Active DOC-15/DOC-16/A-003 governance, classifier, and repository
  validation — resolved and binding.
- **VOC-005-DEP-04:** Exact supported stable Node.js, pnpm, Go, and dependency versions
  — resolve and document in the implementation diff without changing product
  architecture; a material framework choice is not part of this dependency.

## Evidence register

- **VOC-005-EV-01:** Issue #14 and live-base verification.
- **VOC-005-EV-02:** Complete nine-file package and canonical index diff.
- **VOC-005-EV-03:** Application/shared-package file tree and workspace inspection.
- **VOC-005-EV-04:** Go format, vet, build, and test output.
- **VOC-005-EV-05:** Tool-version declarations and clean frozen-install output.
- **VOC-005-EV-06:** Root-command and dependency-audit output.
- **VOC-005-EV-07:** Web build, lint, and type-check output.
- **VOC-005-EV-08:** Developer documentation and clean-checkout procedure review.
- **VOC-005-EV-09:** Governance/foundation plus F2 positive and negative validation.
- **VOC-005-EV-10:** Exact changed-file list and full scope/safety diff review.
- **VOC-005-EV-11:** Implementation PR, exact candidate SHA, classifier, hosted checks,
  Claude report, approvals, and rollback record.
- **VOC-005-EV-12:** Package PR validation, exact-SHA Claude report, applicable R3
  hosted-control evidence, and canonical merge evidence.
