# VOC-030 — P4 Daily Habit and Progress Mock Disposition Inventory

## Scope and authority

This document is the `T06` inventory. It is drafted **before adoption** and
records the current mock state plus the intended disposition once `D01`–`D05`
are resolved and `T00`–`T05` are implemented; it is not evidence of completed
work.

## Current mock state (confirmed at draft time, 2026-07-26)

| File / area | VOC source | Mock identifier / field | Current status |
| --- | --- | --- | --- |
| `apps/web/src/app/(app)/home/page.tsx` | VOC-019 / VOC-026 | `MOCK_HOME_STATE.missionTargetWords` | Mocked, P4-pending |
| `apps/web/src/app/(app)/home/page.tsx` | VOC-019 / VOC-026 | `MOCK_HOME_STATE.reviewedWordsToday` | Mocked, P4-pending |
| `apps/web/src/app/(app)/home/page.tsx` | VOC-019 / VOC-026 | `MOCK_HOME_STATE.currentStreakDays` | Mocked, P4-pending |
| `apps/web/src/app/(app)/home/page.tsx` | VOC-027-D05 | `dueReviewWords` (real P2 due-queue) | Already real — untouched by P4 |
| `apps/web/src/app/(app)/progress/page.tsx` | VOC-020 / VOC-026 | `MOCK_PROGRESS_STATE.confidencePointsTotal` | Mocked, P4-pending |
| `apps/web/src/app/(app)/progress/page.tsx` | VOC-020 / VOC-026 | `MOCK_PROGRESS_STATE.currentStreakDays` | Mocked, P4-pending |
| `apps/web/src/app/(app)/progress/page.tsx` | VOC-020 / VOC-026 | `MOCK_PROGRESS_STATE.longestStreakDays` | Mocked, P4-pending |
| `apps/web/src/app/(app)/progress/page.tsx` | VOC-020 / VOC-026 | `MOCK_PROGRESS_STATE.completionHistory` | Mocked, P4-pending |
| `apps/api/business/aifeedback/mission.go` | VOC-028-D01 | `StubMissionUpdater` | Real interface, stub implementation — the exact P4 seam |

## Intended disposition (post-`T00`–`T06`, pending adoption)

- `MOCK_HOME_STATE.missionTargetWords`/`.reviewedWordsToday`/
  `.currentStreakDays`: **decommissioned to real P4** — sourced from
  `GET /api/v1/daily-mission` (`T04`/`T05`).
- `MOCK_PROGRESS_STATE.confidencePointsTotal`/`.currentStreakDays`/
  `.longestStreakDays`/`.completionHistory`: **decommissioned to real P4** —
  sourced from `GET /api/v1/progress` (`T04`/`T05`).
- `apps/api/business/aifeedback/mission.go`'s `StubMissionUpdater`:
  **superseded by a real `missions.MissionUpdater` implementation** (`T03`);
  the stub type itself is kept in the codebase as the documented rollback
  fallback (per implementation-plan.md's rollback section), not deleted.
- No P5 route, table, or behavior is created; no Settings API/UI beyond the
  minimal `user_settings` row (`D01`) is built; no retroactive backfill is
  performed for pre-activation P1/P2/P3 activity (`D05`).

## Verified boundaries (to be enforced by an extended `scripts/foundation/mock-inventory.mjs`)

- The only business modules under `apps/api/business/` after P4 are `auth`
  (A1), `content`/`learning` (P1), `reviews` (P2), `aifeedback` (P3), and the
  new `missions`/`gamification` (P4).
- The only new Ent schemas are `dailymissionsnapshot`, `dailyactivitysummary`,
  `confidencepointledger`, `streakstate`, `gracedayledger`, and `usersettings`
  — no A1/P1/P2/P3 schema is changed.
- No `MOCK_HOME_STATE`/`MOCK_PROGRESS_STATE` field remains after `T05` except
  the already-real `dueReviewWords` (unchanged from `VOC-027-D05`).
- No P5 route, table, or behavior is invented.

## Follow-up work

- P5 follow-up: full cross-feature reliability/accessibility/performance pass
  across the integrated core loop.
- A future Settings package: build the public `/settings` API/UI on top of
  the `user_settings` table this package creates minimally (`D01`).
- `D03` follow-up: if the founder activates the optional new-word/
  sentence-practice mission goals after MVP launch, extend `T01`/`T03`'s
  wiring accordingly under a new `policy_version`.
