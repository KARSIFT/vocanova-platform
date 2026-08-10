# VOC-065 — Release Plan

## Release and deployment authorization

This package requests no new deployment authority beyond what AGENTS.md already
describes for adopted packages. Once adopted and implemented, each task PR
follows the existing governed path: independent review, automatic merge into
`develop` (per `karsift-ai-infra`'s `merge-gate.yml`), then — when this
package's task roster closes — automatic promotion to `main` and automatic
production deployment per the 2026-08-08 founder delegation documented in
AGENTS.md.

A merged package does **not** itself authorize production deployment outside
that existing mechanism. This package does not alter release/deploy workflows.

If the primary candidate is confirmed, the production effect of T01 is
user-visible and desirable: daily mission / "words reviewed today" begins
incrementing for real review submissions. That is a correctness fix, not a
feature flag activation.

## Preconditions, monitoring, and outcome

Preconditions:

- Package adopted with explicit stance on `VOC-065-DEP-01` (default:
  forward-fix only).
- `VOC-065-T00` evidence names the cause before T01 merges.
- `VOC-065-T01` merges to `develop` before T02 records staging verification.

Monitoring after T01:

- `deploy-staging.yml` core-loop E2E step 7 pass/fail and observed
  `reviewedBefore` / `reviewedCards` / `reviewedAfter`.
- VOC-050-T02 diagnostic dump (if still present): today's
  `reviews_completed` and `updated_at` should advance when reviews occur.
- Watch for unexpected double-increments or review-submission 5xx rates after
  wiring P4 into the live path.

Outcome owner: implementer of `VOC-065-T02` records the passing staging run in
`VOC-065-EV-02`.

This package's completion unblocks the staging core-loop gate for the
never-increments failure mode issue #482 documented. It does not claim to
resolve issue #450's original decrease symptom.

## Rollback

Trigger: review submissions fail in staging/production after T01; mission
counters increment incorrectly; or independent review finds the fix incorrect.

Mechanism: revert `VOC-065-T01`'s commit(s).

Validation: confirm a subsequent staging deploy restores prior behavior
(known-broken mission increments if the primary candidate was real — that is
the pre-fix state, not a failed rollback) and that review submissions still
succeed on the P2 path.

Accountable owner: implementer of `VOC-065-T01`.

Last-known-good reference: tree immediately preceding `VOC-065-T01`'s merge.

## Independent verification, human approvals, and closure

Independent verification must confirm, against the exact implemented revision's
commit SHA:

- Root cause in T00 matches the fix in T01.
- Regression coverage meets `VOC-065-AC-02`.
- Real staging evidence meets `VOC-065-AC-03`.
- VOC-063/VOC-053/issue #450 boundaries respected (`VOC-065-AC-04`).
- No unauthorized migration/`VOC-065-DEP-01` expansion.
- Active authority model is A-003; no standing steward approval assumed solely
  for R3; R4/EHR not triggered unless verifier escalates.
- Implementer did not approve or merge their own work.

Under active A-003, replace routine R3 steward approval with strengthened
applicable technical evidence; preserve R4 founder authority and triggered EHR
evidence.

Repository merge into `develop` and production release/deployment are not the
same event as closure — closure requires this package's acceptance criteria
recorded as passing with linked evidence.
