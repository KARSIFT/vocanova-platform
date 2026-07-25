# VOC-027 — Impact Analysis

## Security and privacy

`VOC-027-R00`: cross-learner exposure of due words or review history.
`review_attempts` and the due-queue result are learner-owned personal behavior
data (answers, response times, chosen options, schedule state). Mitigate with
authenticated requester context (`Requester`/`RequesterUserID`), service-level
query scoping to the requester, the 404-private-resource rule for any owner
mismatch, two-user tests, and exact-SHA review. Never log, analytics-identify, or
expose another learner's due words, answers, response times, or schedule state.

`VOC-027-R01`: double-applied rating corrupting the schedule. The submission
mutates scheduling state inside one transaction; a bug (or a replayed idempotency
key that is not recognized) could apply the step/counter update twice and corrupt
the learner's schedule. Mitigate with the `client_attempt_id` partial-unique
idempotency guard, the pure + unit-tested T00 domain function, the
lock-row-then-update ordering, replay/409 tests, and the exactly-once acceptance
criterion. Logs/errors must redact tokens and personal content; responses do not
leak internal Ent models or ids.

`VOC-027-R02`: submission abuse, unauthorized schedule mutation, or CSRF bypass.
Mitigate with `RequireAuth`, `CSRFMiddleware` (`X-CSRF-Token` double-submit),
user+operation-scoped `Idempotency-Key` (duplicate → safe, conflicting
fingerprint → 409), one transaction per submission, 404 for any owner mismatch,
and replay tests.

## Data and migrations

`VOC-027-R03`: migration integrity or rollback failure across `review_attempts`
(plus the existing `user_words` rows the transaction mutates). Mitigate with
reviewed versioned Atlas SQL, the DOC-05 §18 table order (`user_words →
review_attempts`), the partial-unique idempotency index, check constraints, no
`ON DELETE CASCADE` onto/through `review_attempts`, disposable PostgreSQL
forward/recovery rehearsal, explicit migration execution outside API startup, and
compatibility review. Reverting the code must not destroy immutable attempt
history or corrupt another learner's `user_words` schedule; rollback preserves
committed `review_attempts` rows (immutable history) and soft-deleted `user_words`
semantics. Data repair/recovery ownership is assigned at the future release
decision.

`VOC-027-R04`: shared `user_words` row coupling P1/P2/P4 across milestones. The
same row carries P1 save state, P2 scheduling fields (now mutated by this
package), and would feed P4 counters/points later. Mitigate by bounding P2 writes
to exactly the P2-owned scheduling fields and writing **no** P4 tables
(`daily_mission_snapshots`/`confidence_point_ledger`/`streak_states`/
`daily_activity_summaries`) and **no** Confidence Point awards; the field-level
boundary is a protected interface, not an implementation detail to fill "to look
complete." P1 save behavior is not changed (`D01`).

## Analytics and accessibility

Analytics is excluded; review answers/response-times and schedule choices are
personal behavior data and must not be logged or analytics-identified without a
later privacy-reviewed change. Accessibility is material and this package owns it
for the new review route: labelled controls, visible focus, semantic
correct/incorrect status (non-color-only feedback, not color alone), keyboard
reachability for the rating/submit control, mobile layout, and sensible
empty/loading/error/done (queue-drained / "all caught up") states.
`VOC-027-R05` is an inaccessible or non-color-only-broken review affordance;
absent test automation must be reported honestly as a limitation, never a pass.

## Risks, dependencies, and evidence

- `VOC-027-R06`: open founder decisions (`D02` prompt-type contract
  contradiction vs DOC-07, `D03` which prompt type first, `D04` review-session
  UX/flow, `D05` Home due-count wiring) could let the implementer invent P3/P4
  behavior or guess a contract past an approved-document contradiction; founder
  adoption must resolve them into `D06` before the affected tasks proceed
  (`VOC-027-DEP-01`). `D02` is a DOC-05/DOC-07 contradiction and must be reconciled
  under the DOC-12 §11 change-control rule, not by guessing.
- `VOC-027-R07`: the review-submission transaction is the first learning-state-
  mutating workflow; an incomplete transaction (e.g. inserting `review_attempts`
  without applying the schedule update, or applying it without the insert) leaves
  history and current state inconsistent. Mitigate with the strict DOC-05 §15
  ordering inside one transaction, integration tests asserting both rows move
  together, and dry-run rollback rehearsal.
- `VOC-027-R08`: the API server bootstrap and OpenAPI/client generation tooling
  reconciliation is the same carry-forward risk as `VOC-026-R08`; reconcile the
  real server/client wiring and the actual generation/drift tooling at the
  adopted base before relying on either, and do not report absent tooling as
  passing.
- `VOC-027-DEP-01`..`DEP-03`: dependencies recorded in `change.yaml`.
- `VOC-027-EV-00`..`EV-24`: review-domain, migration, due-queue, submission,
  idempotency, contract-drift, screen, mock-inventory, staging, rollback, and
  exact-SHA review evidence referenced by the acceptance criteria.