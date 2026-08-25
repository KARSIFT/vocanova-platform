# VOC-094 — Acceptance Criteria

## VOC-094-AC-00 — Package, review, and authority remain exact and separated

- Requirements: `VOC-094-D00`, `D15`, `D16`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-00`, `TEST-06`
- Evidence: `VOC-094-EV-00`, `EV-06`
- Result: pending

One adopted package, one task, and one implementation PR show exact-SHA builder,
specialist, independent-reviewer, merge-actor, and action-operator separation with no
unresolved blocker. `automatic_merge_allowed: true` performs no merge. Plan and
implementation source-head lifecycle evidence is complete, while every existing
worktree/recovery ref remains preserved and no manual branch/worktree deletion occurs.

## VOC-094-AC-01 — Phase 1 account, zone, permissions, and Free plan fail closed

- Requirements: `VOC-094-D02`, `D04`, `D05`, `D06`, `D07`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-01`
- Evidence: `VOC-094-EV-01`
- Result: pending

Readback binds one account ID and the Active `vocanova.site` zone ID, verifies Workers
Free and USD 0, and inventories all account Workers/D1/Custom Domains. No mutation is
possible if production Workers/D1 exist without explicit residual-scope acceptance.
One Phase 1 local/interactive short-lived credential has only the adopted account/zone
permissions, is used first for inventory, is never disclosed or stored in the overlay,
and is revoked/expired after Phase 1. No GitHub environment or secret exists yet
because of this package.

## VOC-094-AC-02 — Exact staging resources and privacy controls read back correctly

- Requirements: `VOC-094-D01`, `D03`, `D11`, `D13`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-02`
- Evidence: `VOC-094-EV-02`
- Result: pending

Cloudflare readbacks prove only the two named staging Workers, `vocanova-staging` with
a real UUID, requested `eeur` location hint, no jurisdiction, and recorded actual
placement/served region, plus service binding `API` and Custom Domains
`api-stag.vocanova.site` and `stag.vocanova.site` configured with
`custom_domain: true`. A documented actual placement different from the requested
hint does not fail acceptance. Synthetic-only and feature-disable config plus privacy-
safe observability pass. Production sentinels/resources, reserved names, `HOLD-01`,
and `HOLD-02` remain unchanged.

## VOC-094-AC-03 — A real reviewed rollback baseline precedes ordinary delivery

- Requirements: `VOC-094-D08`, `D10`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-03`
- Evidence: `VOC-094-EV-03`
- Result: pending

Separate Phase 1 action evidence binds a clean exact reviewed repository SHA and the
hash of a sanitized untracked disposable external Wrangler overlay containing only
reviewed non-secret real bindings/vars. It proves ordered migrations, API-first
creation/promotion, web creation/promotion with service binding, Custom Domain
bootstrap/readback, smoke, and real immutable API/web UUIDs without tracked sentinel
changes. A claimed rollback rehearsal first promotes a newer reviewed probe/candidate
or equivalent valid transition, then returns both Workers to the baseline UUIDs and
proves unchanged D1; migration compatibility and forward-correction evidence are
complete. The overlay and Phase 1 credential are removed only after evidence capture.

## VOC-094-AC-04 — One exact ordinary staging dispatch and soak succeed

- Requirements: `VOC-094-D09`, `D10`, `D11`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-04`
- Evidence: `VOC-094-EV-04`
- Result: pending

After the Phase 3 implementation PR merges, GitHub has exactly
`cloudflare-staging`, only the two named secrets backed by a new distinct Phase 4
short-lived token, no disclosed value or variable, and no production mutation. One
manual staging-only dispatch on the exact independently reviewed merged `develop` SHA
passes authority/expiry/zero-cost/baseline gates, ordered migrations, immutable
uploads, unique UUID resolution, 100% promotion, API/config/contract/web smoke,
resource/version/domain readback, and bounded soak. Logs contain no prohibited data;
the run and any failure history remain immutable evidence.

## VOC-094-AC-05 — Ruflo, cleanup, docs, and final state stay bounded

- Requirements: `VOC-094-D12`, `D14`, `D16`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-05`, `TEST-06`
- Evidence: `VOC-094-EV-05`, `EV-06`
- Result: pending

After Phase 1, pinned Ruflo is reverified externally in Phase 2 using sanitized
context, performs no privileged action, and leaves no disposable process/state. Phase
3 binds real readbacks in one reviewed/merged implementation PR. The distinct Phase 4
token is expired/revoked; successful staging resources remain unless separately
authorized cleanup applies; failed partial resources are handled only by exact-ID
cleanup authority. All living delivery/settings/governance documents match the
observed staging state and preserve production exclusions.

## VOC-094-AC-06 — Validation and exact post-merge evidence close the outcome

- Requirements: all
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-06`
- Evidence: `VOC-094-EV-06`
- Result: pending

All declared local/hosted checks, exact-SHA specialist and independent verdicts,
non-author merge, implementation source-head readback/recreation evidence, post-merge
`develop` review, external action records, successful dispatch, and final Cloudflare/
GitHub/no-production readbacks are attached before issue #158 closes.
