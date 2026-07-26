# VOC-030 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft is adopted, `D01`–`D05` are resolved into `D06`,
the adopted `develop` base and its repository commands are recorded, and the
P1→P2→P3 acceptance chain status is confirmed (`VOC-030-DEP-01`). `D01` (
`user_settings` scope) and `D02` (ledger enum contradiction) are hard gates on
`T00`; no later task may proceed on a guessed resolution. Database
schemas/migrations, Ent schemas, the existing P1/P2/P3 write transactions this
package extends, immutable `confidence_point_ledger`/`grace_day_ledger`
history, requester-scoped authorization, per-source-event idempotency, and the
committed OpenAPI/client contract are R3/R4 protected. Preserve existing
compatible work; no A1/P1/P2/P3 mechanic outside the three specific
transaction points in scope is re-litigated.

## File reconciliation and implementation sequence

First inventory the actual scaffold carried from VOC-025/026/027/028: the A1
glue, the `learning`/`reviews`/`aifeedback` modules and their Ent
schemas/migrations, the `MissionUpdater`/`StubMissionUpdater` seam at
`apps/api/business/aifeedback/mission.go`, the review-submission transaction
at `apps/api/business/reviews/postgres.go`, and the word-addition transaction
at `apps/api/business/learning/postgres.go` — and confirm
`daily_mission_snapshots`/`daily_activity_summaries`/`confidence_point_ledger`/
`streak_states`/`grace_day_ledger`/`user_settings` still do not exist
immediately before starting (repeat the `VOC-030-D00` inspection at the
adopted base SHA, since time may have passed since this draft). Then execute
`T00 → T01 → T02 → T03 → T04 → T05 → T06` in order; a task depending on an
open decision waits for `D06` rather than guessing. Keep `missions`/
`gamification` transaction-scoped (no own-transaction opens — DOC-06 §3) so
`T01`–`T03` can call into them from inside the caller's existing `*sql.Tx`.
Keep streak/reward/grace-day logic pure and unit-tested in isolation (mirrors
the P2 `scheduling.go` pattern) so the transaction layer and tests can exercise
it deterministically. Add the new writes strictly after each transaction's
existing success-path writes and before its existing commit — never reorder
what P1/P2/P3 already do. Commit generated OpenAPI and the matched client with
their source changes. Do not wire a frontend read to a real endpoint until the
approved contract exists (`T05` follows `T04`). Do not invent a Settings
API/UI beyond the minimal `user_settings` row (`D01`), retroactive backfill
(`D05`), or any P5 behavior.

## Validation and independent verification

Run every installed relevant command discovered at implementation time: root
`pnpm validate`/`pnpm test`/`pnpm build`, the
`scripts/governance/validate-governance.sh` and
`scripts/governance/classify-change-risk.sh` checks as applicable to the
changed paths, Go `gofmt`/`go vet`/`go test`/`go build`, web
lint/typecheck/build/format, the domain/migration/transaction/contract/
consistency tests this package adds, and the extended mock-inventory check
(`T06`). Claude Code independently reviews each exact final SHA for: scope and
the classifier floor; migration safety and no A1/P1/P2/P3 schema regression;
for each of `T01`–`T03` specifically, that the pre-existing transaction's
success-path behavior is unchanged when the new steps are stubbed out and that
no new transaction/commit boundary was introduced (`VOC-030-R07`); the
duplicate/failed/unauthorized-safety guarantee (`VOC-030-AC-08`) with concrete
evidence, not an assertion; requester scope and the 404-private-resource rule
on the two new reads; the lazy streak-reconciliation correctness across a
multi-day gap (`VOC-030-R06`); client-supplied-timezone validation
(`VOC-030-R02`); the `D01`/`D02` resolutions actually implemented as recorded
(not silently altered); contract/OpenAPI/client drift; accessibility of the
Home/Progress wiring; staging/rollback evidence; and implementer separation.
Missing staging, open-decision, or tooling evidence remains a blocker or
limitation, never a pass; a missing check is not reported as passing.

## Deployment and rollback

This draft authorizes no deployment. Future staging rollout (when F3 exists
and `D01`–`D05` are resolved) is ordered: adopted-baseline build/checks →
apply the six new-table migration under the approved procedure → deploy →
health/smoke → verify save-word → review → submit-sentence → mission-completes
→ streak-advances → `GET /api/v1/daily-mission`/`GET /api/v1/progress` reads
agree with Home/Progress under non-production identities → cross-user/CSRF/
idempotency/duplicate-safety validation → multi-day-gap streak-break
validation → monitoring → then a new-tables rollback rehearsal. Trigger
rollback on false mission/streak/point state reaching a learner, suspected
cross-user exposure of progress data, a duplicate reward confirmed in
production, inconsistent Home-vs-Progress figures, migration/schema failure,
or a regression in the underlying P1/P2/P3 write paths this package extends.
Roll back/recover under the approved procedure: preserve immutable
`confidence_point_ledger`/`grace_day_ledger` history (never drop committed
rows on rollback), preserve `daily_mission_snapshots`/`streak_states`/
`user_settings` state, restore the pre-P4 P1/P2/P3 transaction behavior
cleanly (the `StubMissionUpdater` path must remain a safe fallback if the real
`MissionUpdater` is rolled back independently of the P3 module it plugs into),
validate with non-production identities, and record the last-known-good
revision; production activation remains separately governed.
