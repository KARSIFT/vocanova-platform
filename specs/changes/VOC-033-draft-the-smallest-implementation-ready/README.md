# VOC-033 — Atlas Migration txmode Directive and Duplicate-Index Fix

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption and separate implementation authorization are required before
work begins. No authorization, approval, activation, deployment, or closure
field is set by this draft.

## Identity and lifecycle

- Package ID: `VOC-033`; canonical path:
  `specs/changes/VOC-033-draft-the-smallest-implementation-ready/`.
- Lifecycle: `implementation-ready` (drafting complete); every authorization
  field in `change.yaml` remains at its unadopted default
  (`approval_status: not-approved`, `implementation_authorized: false`,
  `automatic_merge_allowed: false`, `repository_adoption_status: not-adopted`).
- Proposed risk: **R3** (proposal only — not a determination), matching the
  path-based floor `scripts/governance/classify-change-risk.sh` computes for
  this package's exact planned file set (all under `apps/api/migrations/`,
  which the classifier's `*/migrations/*` rule floors at R3). Nothing in
  scope touches an R4 path or an R4 consequence.
- Decision owner: founder; target branch: `develop`; base:
  `d6b41ee95476fe1e365b1dd46dda5ef57212c4fd`.
- Request source: free text, grounded in
  `specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`'s
  "T06 follow-ups" section, `.karsift/lessons.md`'s 2026-07-29 Atlas entries,
  and GitHub Actions run
  [30555539008](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/30555539008)
  — see `specification.md` for exactly what each source authorizes and, for
  the run, what this draft could and could not independently confirm about it.
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3.

## Objective and requirement source

Unblock `VOC-032-T09` (the migration-and-rollback rehearsal that precedes the
first real staging deploy) by making `apps/api/migrations/*.sql` actually
applicable by Atlas. Today it is not: every one of the 13 forward migration
files carries the invalid per-file directive `-- atlas:txmode transaction`
(Atlas v1.x accepts only `none`/`file` per file), and a second, independent
defect — a duplicate unique index in
`20260725130002_voc030_p4_gamification_tables.sql` — would abort the very
first real apply attempt even after the directive is fixed. Both defects were
discovered and documented by `VOC-032-T06`'s own implementer while adding the
Atlas tooling this package amends, but left as an explicit, protected-area
follow-up rather than silently fixed in T06's scope. See `specification.md`
for full requirement traceability.

## Scope, non-goals, risk, and protected areas

Scope is the three-task sequence in `tasks.md` (`T00 → T01 → T02`, physically
ordered — see that file for why): fix the directive and the duplicate index
and regenerate `atlas.sum` (`T00`); add general, regression-proof deterministic
tests for both defect classes (`T01`); add a disposable-PostgreSQL-16-backed
integration test proving `atlas migrate apply` succeeds end to end and
re-applies as a no-op (`T02`).

Non-goals: any `.down.sql.example` change; any column/type/constraint/index
change beyond the one deleted index; any product behavior change; any
`.github/workflows/*` edit; any public database port; any real staging or
production deployment or fabricated evidence of one. Full list in
`specification.md`.

Protected areas touched: `apps/api/migrations/*.sql` (content edit),
`apps/api/migrations/atlas.sum` (regenerated), two new
`apps/api/migrations/*_test.go` files (additive). Active governance model:
A-003 (routine R3, strengthened controls, independent verification — see
`CLAUDE.md`). No EHR trigger; no R4 consequence in scope, so R4 founder
authority is not implicated by this package's own scope.

One flagged, unresolved design tradeoff for the adopting human:
`VOC-033-D02` in `specification.md` — the proof that `atlas migrate apply`
succeeds is a build-tag-gated, on-demand Go integration test, not a permanent
CI-wired check, because wiring it permanently would require editing
`.github/workflows/*` (out of this package's declared scope) and/or the
separately-owned `KARSIFT/karsift-ai-infra` `ci.yml` (not writable from this
repository at all). This is presented as a tradeoff, not decided silently.

## Verification, approvals, release, and closure

Every PR in this package requires Claude Code review bound to the exact final
SHA; authorization, migration-content, and diff-scope findings block release.
Run the deterministic commands in `implementation-plan.md` (Go
vet/format/test/build, the repository's own governance/risk-classification
scripts) per PR, plus `VOC-033-T02`'s own integration-test run (Docker + the
pinned Atlas v1.2.0 binary) as evidence wherever it is exercised. This package
authorizes no deployment; see `release-plan.md`. It has not been adopted as of
this draft, and no field in `change.yaml` claims otherwise.
