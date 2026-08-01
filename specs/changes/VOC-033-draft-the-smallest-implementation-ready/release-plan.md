# VOC-033 — Release Plan

## Release and deployment authorization

This package authorizes no deployment. It changes only files under
`apps/api/migrations/` (SQL comment directives, one duplicate index statement,
the regenerated integrity hash, and two new Go test files); it does not build,
push, or deploy any container, and it does not run `apps/api/scripts/migrate.sh`
against any staging or production database. A merge of this package's PRs to
`develop` does not itself authorize or perform any production or staging
deployment — that remains a separate, distinctly-gated action, unchanged by
this package.

## Preconditions, monitoring, and outcome

- Exact revision: each PR's own final SHA, recorded by Claude Code's exact-SHA
  independent review per `CLAUDE.md`.
- Checks: the deterministic commands in `implementation-plan.md`'s "Validation
  and independent verification" section, run per PR.
- Approvals: routine R3 under active A-003 — strengthened applicable controls
  and independent verification, not standing steward/founder approval solely
  for being R3 (`docs/governance/a003-transition-state.yaml`). No R4 trigger
  in scope (see `specification.md` "Risk and protected areas"); EHR not
  presumed.
- Staged evidence: none required beyond the deterministic checks and the
  `VOC-033-T02` integration-test run (`VOC-033-EV-03`) — this package has no
  live staging exercise of its own, unlike `VOC-032`'s `T09`/`T10`. Its
  relationship to `VOC-032-T09` is that it removes a tooling-level defect that
  would otherwise make `T09`'s own rehearsal fail immediately; it is not
  itself part of `T09`'s credential-gated live-evidence chain.
- Monitoring: none applicable — no running service, deployment, or user-facing
  surface is introduced or changed.
- Outcome owner: the human who adopts this package, per this repository's
  normal PR-merge process; no distinct release decision beyond the routine
  merge gate each PR already goes through.

## Rollback

- Trigger: any of this package's PRs found to introduce a defect after merge
  (e.g. an incorrect regression-test assertion, or a mistaken edit beyond the
  documented one-line/three-line changes).
- Mechanism: `git revert` of the specific merge commit. No `.down.sql.example`
  file is added or exercised by this package, and none is needed — the fix
  itself never touches live data (see `implementation-plan.md` "Deployment and
  rollback").
- Owner: whoever discovers the regression, through this repository's normal PR
  process.
- Validation: re-run the deterministic commands in `implementation-plan.md`
  against the reverted state; confirm `apps/api/migrations/*.sql` returns to
  its pre-`VOC-033` content and `atlas.sum` matches it again.
- Last-known-good reference: `d6b41ee95476fe1e365b1dd46dda5ef57212c4fd` (this
  package's `base_sha`).

## Independent verification, human approvals, and closure

Claude Code independent review, bound to the exact final SHA of each PR, is
required before merge per `CLAUDE.md`; Codex (or whichever implementer model is
bound) cannot approve or merge its own implementation. No R4 founder approval
is required by this package's own scope (no R4 path or consequence is
touched). No EHR trigger applies. Repository merge of these PRs is not release,
activation, or closure of `VOC-032-T09` or any other package's gate — it only
removes this package's own, narrowly-scoped defect. Closure evidence for this
package is: all three tasks' PRs merged, all `VOC-033-TEST-00`..`06` passing at
the final merged SHA, and `acceptance-criteria.md`'s `Result` fields updated
from `pending` to their actual outcome by whoever performs that closure
bookkeeping (not asserted here, since no task has been implemented as of this
draft).
