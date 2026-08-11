# VOC-065 — Impact Analysis

## Security and privacy

No new secret, credential, or personal-data handling is introduced. Staging
verification continues to use only the existing non-personal synthetic
smoke-test account (VOC-050). Wiring missions/gamification into the reviews
repository (primary candidate) does not expand authz boundaries by itself —
`SubmitReview` already runs as the authenticated user; P4 writes use
`req.UserID`. Independent verification must still confirm the fix does not
accidentally bypass CSRF, auth, or idempotency checks already present on the
review submission path.

## Data and migrations

Default scope: **no migration**. Forward-fix only — after the fix, new
successful reviews increment `reviews_completed`. Existing rows left at 0
despite prior `review_attempts` are historical under-counts
(`VOC-065-DEP-01`). Expanding to a corrective backfill would:

- Touch protected `apps/api/migrations/` (path floor R3).
- Need an explicit adoption decision and a separate, careful mapping from
  `review_attempts` → per-day counts (timezone/`local_date` rules, caps,
  skipped vs completed semantics).
- Must not be invented ad hoc inside T01 without that decision.

Integrity risk if the primary candidate is real and unfixed: every user
appears to complete reviews while daily mission / Home progress stays at 0 —
product state diverges from `review_attempts` reality.

## Analytics and accessibility

None expected. No analytics-pipeline change. No intentional UI/accessibility
change unless T00 forces a narrow client await/submit fix; if so, preserve
existing review-session accessibility patterns and do not reintroduce the
Tailwind `max-w-*` token collision (see `.karsift/lessons.md`).

## Risks, dependencies, and evidence

- `VOC-065-R00`: **Production mission counter never advances (current defect).**
  If the primary wiring candidate is real, staging and production users never
  get daily-mission credit for completed reviews. Mitigation: confirm in T00,
  fix in T01, verify on real staging in T02 before treating the package closed.
- `VOC-065-R01`: **False confidence from UI-only success.** Review UX can
  succeed (P2 path) while P4 mission writes are skipped. Mitigation:
  AC-01/AC-03 require DB/counter evidence, not only UI click success; regression
  test in AC-02.
- `VOC-065-R02`: **Over-broad fix.** Implementer might refactor review
  scheduling, streak logic, or E2E helpers beyond the confirmed cause.
  Mitigation: T01 scope is narrow; independent review rejects drive-bys.
- `VOC-065-R03`: **Historical under-count ambiguity.** Leaving old rows at 0
  may confuse operators reading staging dumps; backfilling without care may
  double-count. Mitigation: default forward-fix only; `VOC-065-DEP-01` requires
  explicit adoption to expand.
- `VOC-065-R04`: **Mis-attribution to VOC-053's decrease symptom.** Treating
  this as the same bug could reopen a closed investigation path or weaken
  step 7 again. Mitigation: `VOC-065-DEP-02` / AC-04 keep packages distinct.
- `VOC-065-DEP-00`: Unresolved at drafting — root cause confirmation (T00).
- `VOC-065-DEP-01`: Unresolved at drafting — historical backfill decision.
- `VOC-065-DEP-02`: Resolved at drafting — distinct from VOC-053/VOC-063.
- `VOC-065-EV-00`: T00 evidence file with confirmed cause.
- `VOC-065-EV-01`: T01 diff, regression test output, local validation.
- `VOC-065-EV-02`: Real staging deploy run log with step 7 pass and counter /
  dump values.
