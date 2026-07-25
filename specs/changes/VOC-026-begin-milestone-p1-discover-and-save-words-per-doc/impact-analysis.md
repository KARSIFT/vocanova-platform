# VOC-026 — Impact Analysis

## Security and privacy

`VOC-026-R00`: cross-learner exposure of saved-word state. `user_words` is learner-owned
personal behavior data. Mitigate with authenticated requester context (`Requester`/
`RequesterUserID`), service-level query scoping to the requester, the 404-private-resource rule
for any owner mismatch, two-user tests, and exact-SHA review. Never log, analytics-identify, or
expose another learner's saved-meaning choices.

`VOC-026-R01`: save/unsave abuse, double-writes, or unauthorized state change. Mitigate with
`RequireAuth`, `CSRFMiddleware` (`X-CSRF-Token` double-submit), user+operation-scoped
`Idempotency-Key` (duplicate → safe, conflicting fingerprint → 409), one transaction per
save/restore, soft-delete on unsave, and replay tests. Logs/errors must redact tokens, secrets,
and personal content; responses do not leak internal Ent models or ids.

`VOC-026-R02`: seed-data integrity or content-tampering. Canonical content is platform-owned and
authoritative; a bad/rerunnable seed corrupts discovery for everyone. Mitigate with versioned
deterministic seed JSON, fixed UUIDs, single-transaction load, rerun-safety tests, duplicate
normalized-word rejection, and reviewability. No production secrets or copyrighted unlicensed
content in seed; the adopted `VOC-026-D01` scope bounds what ships.

## Data and migrations

`VOC-026-R03`: migration integrity or rollback failure across seven content tables plus
`user_words`. Mitigate with reviewed versioned Atlas SQL, the DOC-05 §18 table order, partial
unique indexes and check constraints, disposable PostgreSQL forward/recovery rehearsal, explicit
migration execution outside API startup, and compatibility review. Reverting the code must not
corrupt canonical content or another learner's `user_words`; user-words rollback preserves the
DOC-05 §16 soft-delete semantics (soft-deleted rows stay soft-deleted). Data repair/recovery
ownership is assigned at the future release decision.

`VOC-026-R04`: shared `user_words` row coupling P1/P2/P4 across milestones. The same row carries
P1 save state, P2 scheduling fields, and feeds P4 counters/points. Mitigate by bounding P1 writes
to exactly the adopted `VOC-026-D04` resolution and writing no P2/P4 tables or counters; the
field-level boundary is a protected interface, not an implementation detail to fill "to look
complete."

## Analytics and accessibility

Analytics is excluded; saved-word choices are personal behavior data and must not be logged or
analytics-identified without a later privacy-reviewed change. Accessibility is material and this
package owns it for the wired screens: labelled controls, visible focus, semantic status, a saved
label/badge (non-color-only state, not color alone), keyboard reachability for the save/unsave
control, mobile layout, and sensible error/empty/loading states. `VOC-026-R05` is an inaccessible
or non-color-only-broken saved-state affordance; absent test automation must be reported honestly
as a limitation, never a pass.

## Risks, dependencies, and evidence

- `VOC-026-R06`: open founder decisions (`D01` seed scope, `D03` discovery-vs-mock contradiction,
  `D04` save side-effects on the P2/P4 boundary, `D05` mock-screen transition) could push the
  milestone past its real scope or let the implementer invent P2–P4 behavior; founder adoption
  must resolve them before the affected tasks proceed (`VOC-026-DEP-02`).
- `VOC-026-R07`: the request's "see it saved consistently across the app (home/discover/progress)"
  phrase overlaps P4-owned Home/Progress fields; conflate them and this package invents P4. The
  package keeps the overlap as open `D05` rather than resolving it by guessing.
- `VOC-026-R08`: the API server bootstrap (`apps/api/cmd/api/main.go`) is currently a no-op stub
  and the client appears hand-maintained against the committed OpenAPI rather than code-generated;
  reconcile the real server wiring and the actual generation/drift tooling at the adopted base
  before relying on either, and do not report absent tooling as passing.
- `VOC-026-DEP-01`..`DEP-04`: dependencies recorded in `change.yaml`.
- `VOC-026-EV-00`..`EV-24`: migration, seed, content-read, save/unsave, contract-drift, screen,
  mock-inventory, staging, rollback, and exact-SHA review evidence referenced by the acceptance
  criteria.