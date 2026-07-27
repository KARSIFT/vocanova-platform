# VOC-030 — Impact Analysis

## Security and privacy

`VOC-030-R00`: cross-learner exposure of mission/streak/point/settings data.
`daily_mission_snapshots`, `daily_activity_summaries`, `confidence_point_ledger`,
`streak_states`, `grace_day_ledger`, and `user_settings` are all
requester-owned personal state. Mitigate with the existing authenticated
requester context, service-level query scoping (both new reads are implicitly
self-scoped with no ID parameter to enumerate), and exact-SHA review. Never log
or analytics-identify another learner's mission/streak/point/settings values.

`VOC-030-R01`: retroactively corrupting an already-shipped, already-accepted
write path. This package is the first to add new writes *inside* the existing
P1 word-addition, P2 review-submission, and P3 AI-feedback-orchestration
transactions rather than only adding a new isolated one. A bug in the added
steps (wrong order, a query that fails and rolls back the whole transaction, a
lock held longer than before) degrades a flow that already works today.
Mitigate with: adding the new writes strictly after the transaction's existing
success-path writes and before its existing commit (never reordering existing
steps), integration tests that assert the pre-existing P1/P2/P3 behavior is
byte-for-byte unchanged when the new steps are stubbed out, and exact-SHA
review of each of the three wiring tasks (`T01`–`T03`) independently.

`VOC-030-R02`: client-supplied timezone abuse. `VOC-030-D01` proposes a
request-time client-supplied IANA timezone as a fallback when
`user_settings.timezone` hasn't been set. An unvalidated or malicious value
could corrupt daily-date-boundary math (e.g. a bogus zone name, or a
learner claiming a timezone far from their actual one to manipulate mission/
streak timing). Mitigate with strict IANA-database validation before use or
storage (reject, don't silently default), and tests asserting an invalid value
is rejected rather than accepted.

`VOC-030-R03`: false progress via duplicate, failed, or unauthorized actions —
the P4 gate's own named risk. Mitigate with the two independent defenses
described in `VOC-030-AC-08`: each module's existing idempotency guard (P1
word-add dedup, P2 `client_attempt_id`, P3's request-hash dedup) plus a
second, ledger-level per-source-event idempotency key so even a bug that
somehow re-entered a wiring call cannot double-award; reward/mission writes
placed only in each transaction's success path (never in a path a failed or
blocked/self-harm-intervened attempt can reach); and no new write endpoint —
every reward/mission/streak write happens inside an already-authenticated,
already-authorized P1/P2/P3 transaction.

## Data and migrations

`VOC-030-R04`: migration integrity across five new tables plus `user_settings`.
Mitigate with reviewed versioned Atlas SQL, the DOC-05 §18 ordering (added
after `ai_feedback_attempts`), the documented check/unique constraints,
disposable PostgreSQL forward/recovery rehearsal, explicit migration execution
outside API startup, and compatibility review confirming no existing
A1/P1/P2/P3 table, column, or constraint is altered. Reverting the code must
not destroy learner-owned mission/streak/point history; rollback preserves
committed `confidence_point_ledger`/`grace_day_ledger` rows (immutable) and
`daily_mission_snapshots`/`streak_states` state.

`VOC-030-R05`: the DOC-05 §12 `confidence_point_ledger.reason`/`source_type`
enum gap versus the DOC-06 §11 reward table (`VOC-030-D02`, a genuine
contradiction between two approved documents). If left unresolved, a
word-addition point award has no valid `reason` value to write, either
blocking `T01` or forcing an ad hoc, unapproved enum value into production
schema. Mitigate by surfacing the contradiction explicitly (done, in
specification.md) and blocking `T00`'s ledger schema finalization on the
founder's resolution rather than guessing a fix into the migration silently.

`VOC-030-R06`: the streak-reconciliation lazy-evaluation design (no
queue/cron — DOC-06 §15) means a learner who doesn't open the app for many
days will have their streak "break" only computed the next time they *do*
interact, not on the calendar day it actually lapsed. This is a deliberate,
documented consequence of the no-queue-system MVP constraint, not a bug, but
it means `streak_states.status` can be stale between visits; the API/UI must
never present a stale `active` status as current without triggering
reconciliation on read. Mitigate with reconciliation running on every
`GET /api/v1/daily-mission` and `GET /api/v1/progress` read, not only on
mission-completion writes, and a test asserting a multi-day-gap read correctly
breaks the streak before returning it.

`VOC-030-R07`: cross-module transaction discipline. `missions` and
`gamification` must expose transaction-scoped functions the P1/P2/P3 callers
invoke inside their *own* existing `*sql.Tx` (DOC-06 §3: "cross-module
coordination happens through services, not direct cross-module table
access"); if either new module instead opens its own transaction, the DOC-05
§15 single-transaction requirement for review submission and word addition is
silently violated, risking partial state (e.g. a review recorded but its
point award lost, or vice versa, on a crash between the two transactions).
Mitigate with an explicit transaction-scoped API design (reviewed in `T00`)
and lifecycle tests in `T01`–`T03` asserting no additional transaction/commit
boundary is introduced.

## Analytics and accessibility

Analytics is aggregate/structured only: `daily_activity_summaries` and both
ledgers hold counters and enum reasons, never learner sentence or feedback
text; metrics group by mission/streak status and reward reason only.
Accessibility is material for `T05`'s Home/Progress wiring: labelled
progress indicators (non-color-only mission/streak state), visible focus,
keyboard reachability, mobile layout, and sensible loading/empty (a day-one
learner with no snapshot yet)/error states for both new reads. `VOC-030-R08`
is an inaccessible or color-only-broken mission/streak affordance; absent test
automation must be reported honestly as a limitation, never a pass.

## Risks, dependencies, and evidence

- `VOC-030-R09`: five open founder decisions (`D01`–`D05`). `D01` (user_settings
  scope) blocks `T00`; `D02` (ledger enum contradiction) blocks `T00`'s ledger
  schema and therefore `T01`–`T03`; `D03` (optional mission goals) affects the
  shape of `T01`/`T02`/`T03`'s writes; `D04` (grace-day automatic application)
  affects `T00`'s domain logic; `D05` (no retroactive backfill) affects how
  `T06`'s staging/evaluation evidence should be interpreted for any
  pre-existing test accounts. Founder adoption must resolve them into `D06`
  before the affected tasks proceed; this draft does not guess them.
- `VOC-030-R10`: this is the first milestone to touch three separately-shipped
  business modules' existing transactions in one package. A task-ordering
  mistake (e.g. wiring `T02` before `T00`'s domain logic is stable) risks
  rework across all three. Mitigate with the fixed `T00 → T01 → T02 → T03 →
  T04 → T05 → T06` order and each task's own independent Claude Code review.
- `VOC-030-DEP-01`..`DEP-05`: dependencies recorded in `change.yaml`.
- `VOC-030-EV-00`..`EV-37`: migration, persistence, domain-logic, transaction-
  wiring, contract, consistency, evaluation, mock-inventory, staging, rollback,
  and exact-SHA review evidence referenced by the acceptance criteria.
