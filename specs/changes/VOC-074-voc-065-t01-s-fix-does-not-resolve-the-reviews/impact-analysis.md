# VOC-074 — Impact Analysis

## Security and privacy

No new secret, credential, or personal-data handling is introduced. Staging
verification continues to use only the existing non-personal synthetic
smoke-test account (VOC-050). Fixes on the review/mission write path use
existing authenticated `req.UserID` boundaries — independent verification must
confirm the fix does not bypass CSRF, auth, or idempotency checks on
`SubmitReview`. E2E hardening (T02) exposes counter integers in CI logs only
for the synthetic account — no new PII.

## Data and migrations

Default scope: **no migration**. Forward-fix only — after the fix, new
successful reviews increment `reviews_completed`. Existing rows left at 0
despite prior `review_attempts` are historical under-counts
(`VOC-074-DEP-01`). Expanding to a corrective backfill would:

- Touch protected `apps/api/migrations/` (path floor R3).
- Need an explicit adoption decision and careful per-day mapping from
  `review_attempts` (timezone/`local_date` rules, caps, skipped semantics).
- Must not be invented ad hoc inside T01 without that decision.

Integrity risk while unfixed: users complete reviews (P2 path) while daily
mission / Home progress stays at 0; staging CI reports false confidence when
`reviewedCards = 0`.

## Analytics and accessibility

None expected. No analytics-pipeline change. No intentional UI/accessibility
change unless T01 forces a narrow client fix; if so, preserve existing review-
session accessibility patterns and the Tailwind `max-w-*` workaround (see
`.karsift/lessons.md`).

## Risks, dependencies, and evidence

- `VOC-074-R00`: **Mission counter still never advances (current defect).**
  Post-VOC-065-T01, staging/production users may still not get daily-mission
  credit. Mitigation: T00 confirm, T01 fix, T03 verify with dump.
- `VOC-074-R01`: **False confidence from vacuous E2E pass.** Step 7 passes when
  `reviewedCards = 0`, hiding the bug. Mitigation: T02 hardening (AC-03).
- `VOC-074-R02`: **Mis-diagnosis as queue exhaustion only.** Fixing only the
  test while a real increment bug remains leaves production broken. Mitigation:
  T00 must distinguish; T03 requires DB dump movement, not only E2E green.
- `VOC-074-R03`: **Over-broad fix.** Refactoring review scheduling, streak
  logic, or unrelated E2E helpers beyond the confirmed cause. Mitigation: narrow
  T01; independent review rejects drive-bys.
- `VOC-074-R04`: **Premature VOC-065-T02 closure.** Merging PR #529 as
  satisfying VOC-065-AC-03 while the dump still shows 0. Mitigation:
  `VOC-074-DEP-02` / AC-05.
- `VOC-074-R05`: **Historical under-count ambiguity.** Leaving old rows at 0 may
  confuse operators; careless backfill may double-count. Mitigation: default
  forward-fix only; `VOC-074-DEP-01` requires explicit adoption to expand.
- `VOC-074-DEP-00`: Unresolved at drafting — residual root cause (T00).
- `VOC-074-DEP-01`: Unresolved at drafting — historical backfill decision.
- `VOC-074-DEP-02`: Unresolved at drafting — VOC-065-T02 disposition.
- `VOC-074-DEP-03`: Unresolved at drafting — synthetic queue reset scope.
- `VOC-074-EV-00`: T00 evidence with confirmed cause and `reviewedCards`
  disposition.
- `VOC-074-EV-01`: T01 diff, regression test output, local validation.
- `VOC-074-EV-02`: T02 diff and local/CI evidence of vacuous-pass rejection.
- `VOC-074-EV-03`: Real staging deploy run with step 5/7 values and diagnostic
  dump confirmation.
