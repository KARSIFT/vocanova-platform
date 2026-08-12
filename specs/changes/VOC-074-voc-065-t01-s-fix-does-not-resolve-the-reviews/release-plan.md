# VOC-074 — Release Plan

## Release and deployment authorization

This package requests no new deployment authority beyond what AGENTS.md already
describes for adopted packages. Once adopted and implemented, each task PR
follows the existing governed path: independent review, automatic merge into
`develop` (per `karsift-ai-infra`'s `merge-gate.yml` and this package's
`automatic_merge_allowed: true` draft unless adoption changes it), then — when
this package's task roster closes — automatic promotion to `main` and automatic
production deployment per the 2026-08-08 founder delegation documented in
AGENTS.md.

A merged package does **not** itself authorize production deployment outside
that existing mechanism. This package does not alter release/deploy workflows.

If T01 confirms a real increment defect, the production effect is
user-visible and desirable: daily mission / "words reviewed today" begins
incrementing for real review submissions. T02 affects staging CI signal only.

## Preconditions, monitoring, and outcome

Preconditions:

- Package adopted with explicit stance on `VOC-074-DEP-01` (default:
  forward-fix only), `VOC-074-DEP-02` (VOC-065-T02 blocked until T03), and
  `VOC-074-DEP-03` (queue reset scope).
- `VOC-074-T00` evidence names the cause before T01 proceeds (or explicitly
  scopes T02-only).
- `VOC-074-T02` merges before T03 records staging verification.

Monitoring after T01/T02:

- `deploy-staging.yml` core-loop E2E: step 5 `reviewedCards`, step 7
  annotations with all three integers, pass/fail.
- VOC-050-T02 diagnostic dump: today's `reviews_completed` and `updated_at`
  must advance when reviews occur — a green E2E with frozen dump is failure.
- Watch for unexpected double-increments or review-submission 5xx rates after
  any mission-path fix.

Outcome owner: implementer of `VOC-074-T03` records the passing staging run in
`VOC-074-EV-03`.

This package's completion closes the residual never-increments symptom for
issue #539 and provides the verification VOC-065-AC-03 still lacks. It does not
claim to resolve issue #450's original decrease symptom.

## Rollback

Trigger: review submissions fail in staging/production after T01; mission
counters increment incorrectly; E2E gate fails for unrelated reasons after T02;
or independent review finds the fix incorrect.

Mechanism: revert `VOC-074-T01` and/or `VOC-074-T02` commit(s) as appropriate.

Validation: confirm a subsequent staging deploy restores prior behavior. If T01
fixed a real defect, mission non-increment may return — that is the pre-fix
state, not a failed rollback.

Accountable owner: implementer of the affected task.

Last-known-good reference: tree immediately preceding the reverted task's merge.

## Independent verification, human approvals, and closure

Independent verification must confirm, against the exact implemented revision's
commit SHA:

- Root cause in T00 matches work in T01/T02.
- T02 meets `VOC-074-AC-03` (no vacuous pass).
- T03 staging evidence meets `VOC-074-AC-04` including diagnostic dump — not
  only Playwright green.
- VOC-065/VOC-063/issue #450 boundaries respected (`VOC-074-AC-05`).
- VOC-065-T02 (PR #529) not recorded as closure without T03 evidence.
- No unauthorized migration/`VOC-074-DEP-01` expansion.
- Active authority model is A-003; no standing steward approval assumed solely
  for R3; R4/EHR not triggered unless verifier escalates.
- Implementer did not approve or merge their own work.

Under active A-003, replace routine R3 steward approval with strengthened
applicable technical evidence; preserve R4 founder authority and triggered EHR
evidence.

Repository merge into `develop` and production release/deployment are not the
same event as closure — closure requires this package's acceptance criteria
recorded as passing with linked evidence.
