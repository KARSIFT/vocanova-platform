# VOC-115 — Test Plan

## VOC-115-TEST-00 — Intake, lifecycle, scope, and authority

- Covers: `VOC-115-AC-00`
- Procedure: inspect issue #216, PR #215 FAIL, both f7abcc8 plan FAILs, VOC-106,
  VOC-114, DOC-15/DOC-16, current surfaces, package state, and ref authority wording.
- Expected: f7abcc8 is superseded/no-transfer; PR #215 draft; 27 paths exact; scoped
  ordinary PR-head update only after adoption; no other action authority.
- Evidence: `VOC-115-EV-00`

## VOC-115-TEST-01 — Identity, BigInt, and ref grammar

- Covers: `VOC-115-AC-01`
- Procedure: test full SHA plus server id, raw lossless integer-to-string decoding,
  BigInt ordering, signed-64 ceiling, byte lengths, safe ASCII, and check-ref-format.
- Positives: ids `1`, `9007199254740993`, `9223372036854775807`; distinct ids under
  same SHA; unrelated ids across different SHA.
- Negatives: zero/sign/leading zero/decimal/non-digit/20 digits/above max/Number loss,
  short/mixed/wrong SHA, suffix/prefix injection, control/Unicode/path traversal,
  85-byte head, 96-byte full ref, and invalid Git ref.
- Expected: exact domain passes without JS Number conversion; exhaustion stops.
- Evidence: `VOC-115-EV-01`

## VOC-115-TEST-02 — Exact event schema, tamper, and pagination

- Covers: `VOC-115-AC-01`
- Procedure: one positive for every event and transition; independently mutate each
  common/event key, enum, id/link, timestamp, author, issue/API/HTML URL, response
  digest, marker, LF, key order, whitespace, duplicate key, NFC/body byte, and
  minimized state. Build 0/1/99/100/101/multipage page sets.
- Negatives: missing/repeated/out-of-order/truncated/final-page ambiguity, ignored
  recognized malformed marker, edit (`updated_at != created_at`), referenced deletion,
  duplicate envelope id, missing predecessor, branch/terminal conflict, and extra
  transition child.
- Expected: exact ordinary comments are ignored; every malformed recognized record,
  tamper, conflict, or incomplete enumeration fails and never releases an id.
- Evidence: `VOC-115-EV-02`

## VOC-115-TEST-03 — Concurrency and global single-active arbitration

- Covers: `VOC-115-AC-02`
- Procedure: fixtures race same-SHA and different-SHA reservations before/after both
  scan pairs and activation. Include stale frozen SHA, lower/higher ids, late old-
  frontier reservation, active-existing reservation, duplicate activation, disposed
  winner, all candidates stale, retry after abandon, and forbidden reserve after a
  merged terminal.
- Expected: reservations are provisional; lowest valid current-frontier/current-SHA
  id alone activates after stable full scans; all others disposition; globally at most
  one active chain. Later reservations cannot challenge active. Arbitrary id size is
  compared by BigInt, not lexical/Number order.
- Evidence: `VOC-115-EV-03`

## VOC-115-TEST-04 — Actor, handoff, and complete crash matrix

- Covers: `VOC-115-AC-03`
- Procedure: for reserve response, activate response, before/after ref POST/readback,
  before/after PR POST, binder edit/event, invalidation, PR closure, and abandonment,
  simulate crash before request, after server mutation before local receipt, and after
  receipt before event. Test valid owner resume and one exact handoff.
- Negatives: blind repost, wrong actor, self-asserted takeover, owner-unavailable
  disposition/recovery handoff without exact accountable evidence, competing handoffs,
  absent/unknown/422 ref receipt, matching foreign/orphan ref, zero/multiple/conflicting
  PRs, wrong author/head/base/marker, binder digest drift, retry before terminal close/
  abandon, missing/moved ref, and silent timeout.
- Expected: one documented idempotent continuation or permanent fail-closed route;
  no orphan adoption and no second active attempt.
- Evidence: `VOC-115-EV-04`

## VOC-115-TEST-05 — Collision, invalidation, and same-develop retry

- Covers: `VOC-115-AC-03`
- Procedure: create fixture attempt at D/id A, invalidate one binder input, verify
  close and abandon with ref A unchanged, then reserve id B at unchanged D. Interpose
  same/different-D reservations, collisions, and dispositions.
- Expected: B is fresh and distinct from every earlier id but need not be adjacent or
  ordered relative to A; old ref remains immutable; complete new ref/PR/binder/check/
  review evidence is required. Preflight/422 collision never adopts/mutates and must
  terminate before another reservation.
- Evidence: `VOC-115-EV-05`

## VOC-115-TEST-06 — Protected-history and recovery regression

- Covers: `VOC-115-AC-04`
- Procedure: disposable Git topology proves main merge base/zero-main-only,
  head/develop SHA/tree, compare, prospective/actual tree, separate reviewed promotion/
  sync merge commits, permanent refs, ancestry/zero-behind, deletion eligibility, and
  nonexecuted POST recreation digest.
- Negatives: every wrong/permanent/stale/diverged/extra/mismatched ref/tree/PR/check/
  review/actor/merge/sync/ancestry/behind/delete/recovery/prohibited-action mutation.
- Expected: preserved topology passes; one mutation stops.
- Evidence: `VOC-115-EV-06`

## VOC-115-TEST-07 — Validator discovery and complete focused suite

- Covers: `VOC-115-AC-05`
- Procedure: run the new validator/test directly and through the committed foundation
  glob; inspect exports/capabilities and mutation-fixture isolation; deny network and
  credentials; require path-specific diagnostics and no real ref operation.
- Expected: all specification cases execute, focused test is auto-discovered, no
  package script changes, and each negative fails for its intended invariant.
- Evidence: `VOC-115-EV-07`

## VOC-115-TEST-08 — Exact paths, current surfaces, reviews, and rollback

- Covers: `VOC-115-AC-05`
- Procedure: compare exact expected/actual 27 paths and OIDs; audit 25 current text
  surfaces; preserve adoption evidence/history; run governance/risk/diff/format/links,
  foundation and hosted checks. Reverse actual full diff in a disposable worktree.
  Bind exact specialist and different cross-model R4 reviews; repeat after edits.
- Expected: no other path/current contradiction; all checks/reviews zero-blocker;
  exact parent tree restores; separate non-author merge.
- Evidence: `VOC-115-EV-08`

## VOC-115-TEST-09 — DOC-15 section 24.18 monitoring

- Covers: `VOC-115-AC-06`
- Procedure: adoption owner observes exact correction merge hosted/develop readback,
  validator/full matrix, then first corrected VOC-106 promotion/sync. Always retain
  synthetic same-D retry; if real retry occurs, verify old ref and distinct new id.
- Expected: no concurrent active, tamper, crash ambiguity, reuse, movement, ownership,
  or topology recurrence before #216/#213/#191 close. Failure is recorded and routes
  governed remediation or reviewed integrated revert.
- Evidence: `VOC-115-EV-09`

## Commands

- `node scripts/foundation/voc106-release-attempt-policy.mjs`
- `node --test scripts/foundation/voc106-release-attempt-policy.test.mjs`
- `pnpm run ci:foundation`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact path/OID/current-surface audits and disposable Git topology/rollback fixtures

No test uses network, GitHub/Cloudflare/settings APIs, credentials, real refs, push,
force, deletion, dispatch, deployment, migration, data, DNS/traffic, spending, or launch.

## Evidence definitions

- `VOC-115-EV-00`: intake, superseded review, authority, and exact impact evidence.
- `VOC-115-EV-01`: identity/BigInt/ref-domain matrix.
- `VOC-115-EV-02`: event bytes/envelope/tamper/pagination/transition matrix.
- `VOC-115-EV-03`: same/different-SHA race and single-active arbitration matrix.
- `VOC-115-EV-04`: actor/handoff and every-boundary crash/recovery matrix.
- `VOC-115-EV-05`: collision/invalidation/same-D distinct-id retry matrix.
- `VOC-115-EV-06`: protected-history/deletion/recreation regression.
- `VOC-115-EV-07`: validator exports, discovery, isolation, and complete focused results.
- `VOC-115-EV-08`: exact 27 paths/OIDs, surfaces, checks, reviews, rollback, and merge.
- `VOC-115-EV-09`: bounded postmerge/first-use monitoring and issue disposition.
