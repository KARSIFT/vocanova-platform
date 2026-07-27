# VOC-030 — Release Plan

## Release and deployment authorization

No release or deployment is authorized by this draft. Merge into `develop`,
staging validation, production activation, and the DOC-12 P4 milestone gate
are distinct and none is granted here. Production and autonomous production
release remain disabled. `T00` additionally cannot be accepted until `D01`
(`user_settings` scope) and `D02` (the DOC-05 §12 ledger enum contradiction)
are resolved; `T01`–`T03` additionally depend on `D03` and, for `T02`, `D04`.
This draft is not adopted.

## Preconditions, monitoring, and outcome

Before any staging candidate: an adopted package with `D01`–`D05` resolved
into `D06`, the exact base/revision, required PR checks, the six-new-table
migration plan, non-production identities, exact-SHA independent review, and a
named rollback owner/procedure. Monitor mission-completion rate, streak
advance/protect/break rate, point-award volume by reason, `daily-mission`/
`progress` read latency and error rate, and — critically — a duplicate-reward
detection signal (any two ledger entries with the same source event but
different idempotency keys, or the same idempotency key inserted twice, is an
immediate defect signal) grouped by reward reason and mission status, never
including learner identity beyond the aggregate count. The founder owns the
open `D01`–`D05` product/scope decisions; the future release authority records
the accountable technical/operational owner. Live staging gate evidence is
blocked until the F3 staging environment exists (`VOC-030-DEP-02`).

## Rollback

Trigger on false mission/streak/point state reaching a learner, suspected
cross-user exposure of progress data, a confirmed duplicate reward in
production, inconsistent Home-vs-Progress figures, a regression in the
underlying P1/P2/P3 write paths this package extends, or migration/schema
failure. Use the approved deploy/migration recovery procedure: preserve
committed immutable `confidence_point_ledger`/`grace_day_ledger` rows (never
drop reward history on rollback), preserve `daily_mission_snapshots`/
`streak_states`/`user_settings` state, restore the pre-P4 P1/P2/P3 transaction
behavior cleanly, validate with non-production identities, and preserve
incident/rollback evidence. If `missions`' real `MissionUpdater` is rolled
back independently of the P3 module it plugs into, the `StubMissionUpdater`
fallback must keep the P3 orchestration itself fully functional (honest
`missionCompleted=false`, no crash). The last-known-good revision is recorded
at the future release decision, not guessed here.

## Independent verification, human approvals, and closure

Claude Code must report the final SHA, evidence, limitations, findings, the
active A-003 authority, and the remaining R3/R4/adoption/activation gates.
Routine R3 needs strengthened controls and independent verification; the open
`D01`–`D05` product/scope decisions need founder approval before their
affected tasks proceed. Closure requires all P4 task evidence, the
duplicate/failed/unauthorized-safety evidence (`VOC-030-AC-08`), the
mock-decommission inventory, and the DOC-12 P4 gate evidence; neither a
package merge nor a staging deploy alone closes the milestone, live staging
gate evidence is blocked until F3 exists (`VOC-030-DEP-02`), and the P4 gate
additionally requires the DOC-12 §5 P4 wording itself — missions accurately
reflect completed behavior, progress is understandable, and duplicate/
failed/unauthorized actions can't create false progress — demonstrated with
evidence, not merely asserted.
