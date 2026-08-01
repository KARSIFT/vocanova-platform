# VOC-037 — Begin Milestone R2 (Production Readiness)

This is a **draft, unapproved change package**. It is not implementation authority.
Nothing in this directory may be treated as adopted, approved, or authorized until a
human founder decision is recorded in `change.yaml`'s `approval_status`,
`implementation_authorized`, and `repository_adoption_status` fields.

## Identity and lifecycle

- Package ID: `VOC-037`
- Title: Begin Milestone R2 (Production Readiness): Sequenced Task Set From R1's
  Closed State to a Recorded Go/No-Go Decision
- Canonical path: `specs/changes/VOC-037-begin-milestone-r2-production-readiness-docs`
- Lifecycle state: `draft` (see `change.yaml`)
- Proposed risk: `R3` — a draft proposal only, not a determination. See
  `change.yaml`'s `planned_implementation_risk_floor` and `specification.md`'s "Risk
  and protected areas" for the reasoning, including the flag that `T00` and `T02`
  plausibly reach `R4`.
- Owner (decision): founder
- Owner (package preparation): planner
- Approval evidence: none yet — `approval_status: not-approved`
- Target branch: `develop`
- Linked GitHub issue: none yet; the calling workflow is expected to open or link one
  at adoption

## Objective and requirement source

This package drafts the smallest sequenced task set to carry the project from R1's
now-closed state (see `specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`,
R1 closed 2026-08-01 on issue [#256](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/256))
to R2's gate: production resources ready, credentials protected, launch controls
work, legal/privacy prerequisites complete, the release PR passes all checks,
required review returns `approve` or an explicitly accepted follow-up, and the
founder records a go/no-go decision — per `docs/product/12-mvp-implementation-plan.md`
(DOC-12) section 5.

See `specification.md` for the full objective, requirement grounding, and open
questions this package could not resolve on its own.

## Scope, non-goals, risk, and protected areas

See `specification.md`'s "Scope and non-goals" and "Risk and protected areas"
sections, and `impact-analysis.md` for the full security/privacy/data/rollback
analysis. In summary: this package covers the production hosting/deploy-target
decision, production credential/secrets management, legal/privacy prerequisites,
launch kill-switches/rollback controls, monitoring/alerting readiness, and the final
release-PR-plus-go/no-go task — and explicitly excludes the four tracked R1
follow-ups (DOC-09 §23 thresholds, T14/T15 live email/OAuth evidence, T11/T13
documentation rewrites) as new scope, per the request's own instruction.

## Verification, approvals, release, and closure

No verification, approval, or release has occurred. This package proposes (in
`tasks.md`, `test-plan.md`, and `release-plan.md`) how each future task should be
verified and by whom, but none of that is authorized to run against production
until the package is adopted and each task is separately implementation-authorized
per the active A-003 model (see `AGENTS.md` and `CLAUDE.md`).
