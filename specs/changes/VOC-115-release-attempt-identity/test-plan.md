# VOC-115 — Test Plan

## VOC-115-TEST-00 — Intake, scope, and authority

- Covers: `VOC-115-AC-00`
- Procedure: inspect #216, PR #215 FAIL, all eight exact plan-candidate FAILs,
  VOC-106/VOC-114, policy, surfaces, paths, and action wording.
- Expected: four candidates superseded/no-transfer; PR #215 draft; 27 paths exact;
  ruleset action held/separate; no implementation/ref/settings/release authority.
- Evidence: `VOC-115-EV-00`

## VOC-115-TEST-01 — Ruleset, claim, attempt, and domains

- Covers: `VOC-115-AC-01`
- Procedure: validate exact no-bypass active ruleset fixture, genesis/pr/conflict claim
  names, SHA-bound attempt names, decimal/BigInt/node/SHA/digest/time/URL domains, byte
  lengths, and `check-ref-format`.
- Negatives: absent/disabled/wrong-target/wrong-pattern/exclude/bypass/missing rule;
  zero/sign/leading-zero/above-max/unsafe Number; Unicode/control/traversal; wrong SHA/
  digest/frontier; overlength/invalid ref; unauthorized settings claim.
- Expected: only exact fixture/domain passes; unavailable capability holds VOC-106.
- Evidence: `VOC-115-EV-01`

## VOC-115-TEST-02 — Atomic coalescence and stale terminal

- Covers: `VOC-115-AC-01`
- Procedure: race same-target duplicate/replayed requests and different-target requests
  on one claim name with 201/422/timeout/readback permutations. Repeat downstream
  attempt-ref/PR calls from same logical claim. Mutate develop/main SHA/tree after claim.
- Expected: identical target is one logical claim/attempt, not multiple caller winners;
  downstream creates coalesce. Different target loses. Fresh matching topology proceeds;
  any post-claim drift is permanent `stale-protected-topology`, creates no attempt/PR,
  derives no frontier, and intentionally requires governed correction.
- Evidence: `VOC-115-EV-02`

## VOC-115-TEST-03 — Exact JSON, page captures, and stable view

- Covers: `VOC-115-AC-02`
- Procedure: mutate every exact own key/type/null/enum/id/domain of PR, timeline, ref,
  protected, ruleset, page-capture, scan-capture, stable-state, and reconciliation
  schemas. Parse raw JSON with duplicate keys/large ids. Test 0/1/99/100/101 pages,
  explicit empty sentinel, exact Link/query order, local filtering, counts, and
  high-watermarks. Include ordinary local, foreign-fork, reserved local, and deleted-
  source PR boundaries; only exact canonical/deleted-canonical labels reach reserved
  detail. Re-fetch equal state with different timestamps/ETags/raw bytes.
- Expected: capture digest changes while timestamp-free stable-state digest reproduces.
  Missing/extra/wrong fields, unsafe numbers, unknown timeline event, raw/projection
  mismatch, gaps/repeats/truncation, wrong filter/boundary/count/high-watermark fail.
- Evidence: `VOC-115-EV-03`

## VOC-115-TEST-04 — Stable algorithm and crash matrix

- Covers: `VOC-115-AC-03`
- Procedure: build two identical complete passes and mutations before/between/after
  passes in protected refs, ruleset, any repository PR boundary, reserved PR/timeline,
  and either ref source. Exercise claim/attempt-ref POST before/after response/readback,
  PR POST unknown, restart/handoff with zero PR, delayed duplicate, binder, closure, and
  owner loss. Mutate canonical ref/PR request keys and bytes. Validate merge-commit
  projection parents/SHA/tree and every object-capture source.
- Expected: comparison is exact JCS stable-state equality, never capture equality;
  unstable pairs discard/retry at most three pairs. Pre-first-call and post-unknown-zero
  are the same reconstructible state and authorize the same canonical request; no local
  counter exists. One PR recovers; multiple enter cleanup. No authorized deletion can
  pass the ruleset fixture.
- Evidence: `VOC-115-EV-04`

## VOC-115-TEST-05 — Cardinality, deletion boundary, and same-D retry

- Covers: `VOC-115-AC-03`
- Procedure: fixtures cover zero/one/multiple matching PRs, none/one/two merged, open/
  closed/reopened duplicates, wrong merge SHA/tree, and failed close/readback. Close PR
  A unmerged, preserve claim/attempt refs, then create after-PR-A claim/attempt at same D.
  Simulate body/comment deletion, attempted ref update/delete denied by ruleset, and an
  explicitly unauthorized settings mutation outside the safety guarantee.
- Expected: multiplicity precedes merged. Every nonmerged duplicate closes/readbacks
  before one valid merge can succeed; multiple/conflicting merges stop. No merged case
  advances conflict frontier. With no merge, all closed duplicates advance conflict
  digest. Same-D retry is distinct and old refs immutable. Body/comment loss grants no
  state; ruleset mutation stops and does not pretend deletion resistance.
- Evidence: `VOC-115-EV-05`

## VOC-115-TEST-06 — Actor, topology, and recovery regression

- Covers: `VOC-115-AC-04`
- Procedure: enforce `/root` -> `m-e-h-r-d-a-a-d`/`7955432`/
  `MDQ6VXNlcjc5NTU0MzI=` and no current handoff. Disposable Git topology proves merge
  base, zero-main-only, head/develop SHA/tree, compare, prospective/actual tree,
  separately reviewed promotion/sync merges, permanent refs, ancestry/zero-behind,
  ruleset survival, and recovery request.
- Negatives: wrong actor/id/node, subagent mutation, self-asserted/unmapped handoff,
  unauthorized assignment/settings, and every wrong topology/review/merge/recovery.
- Expected: exact topology passes; one mutation stops.
- Evidence: `VOC-115-EV-06`

## VOC-115-TEST-07 — Validator discovery and focused suite

- Covers: `VOC-115-AC-05`
- Procedure: run validator/test directly and through foundation glob; inspect exports,
  fixture isolation, network denial, and path diagnostics.
- Expected: every case executes, auto-discovery passes, no package script change, no
  network/credential/real-ref/settings operation, and each negative fails correctly.
- Evidence: `VOC-115-EV-07`

## VOC-115-TEST-08 — Exact paths, reviews, and rollback

- Covers: `VOC-115-AC-05`
- Procedure: audit exact 27 paths/OIDs and 25 textual surfaces; preserve adoption and
  failed-review history; run governance/risk/diff/format/link/foundation/hosted checks;
  reverse full diff in disposable worktree; bind fresh exact specialist and different
  cross-model R4 reviews after every edit.
- Expected: no other path/contradiction; zero blockers; exact parent tree restores;
  separate non-author merge. Ruleset remains a held external prerequisite, not executed.
- Evidence: `VOC-115-EV-08`

## VOC-115-TEST-09 — DOC-15 section 24.18 monitoring

- Covers: `VOC-115-AC-06`
- Procedure: observe correction merge/readback, separately authorized ruleset evidence,
  then first corrected VOC-106 finalization. Retain coalescence/different-target/stale,
  capture/stable, unknown-response, ruleset drift, multiplicity, and same-D fixtures.
- Expected: no duplicate active, false genesis under authorized actions, schema,
  ownership, ref, or topology recurrence before #216/#213/#191 closure.
- Evidence: `VOC-115-EV-09`

## Commands

- `node scripts/foundation/voc106-release-attempt-policy.mjs`
- `node --test scripts/foundation/voc106-release-attempt-policy.test.mjs`
- `pnpm run ci:foundation`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact path/OID/surface audits and disposable topology/rollback fixtures

No test uses network, APIs, credentials, real refs/settings, push, force, deletion,
dispatch, deployment, migration, data, DNS/traffic, spending, or launch.

## Evidence definitions

- `VOC-115-EV-00`: intake, all superseded reviews, scope, and authority.
- `VOC-115-EV-01`: ruleset, claim/attempt grammar, and primitive domains.
- `VOC-115-EV-02`: coalesced races and explicit stale terminal matrix.
- `VOC-115-EV-03`: exact schemas, page captures, and stable state.
- `VOC-115-EV-04`: stable equality and every crash/unknown-response boundary.
- `VOC-115-EV-05`: cardinality cleanup, deletion boundary, and same-D retry.
- `VOC-115-EV-06`: actor, topology, settings hold, and recovery regression.
- `VOC-115-EV-07`: validator discovery/isolation/focused results.
- `VOC-115-EV-08`: paths/OIDs, checks, reviews, rollback, and merge.
- `VOC-115-EV-09`: bounded postmerge/ruleset/first-use monitoring.
