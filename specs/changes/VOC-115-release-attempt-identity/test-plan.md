# VOC-115 — Test Plan

## VOC-115-TEST-00 — Intake, scope, and authority

- Covers: `VOC-115-AC-00`
- Procedure: inspect #216, PR #215 FAIL, all eleven exact plan-candidate FAILs and the
  superseded 2308e8d specialist PASS,
  VOC-106/VOC-114, policy, surfaces, paths, and action wording.
- Expected: six candidates superseded/no-transfer; PR #215 draft; 27 paths exact;
  ruleset action held/separate; no implementation/ref/settings/release authority.
- Evidence: `VOC-115-EV-00`

## VOC-115-TEST-01 — Ruleset, claim, attempt, submit, and domains

- Covers: `VOC-115-AC-01`
- Procedure: validate exact no-bypass active three-pattern ruleset fixture, genesis/pr/
  conflict claim names, SHA-bound attempt names, allocation-digest submit names,
  decimal/BigInt/node/SHA/digest/time/URL domains, exact branch/full-ref byte lengths
  `29/40`, `41/52`, `101/112`, `72/83`, `84/95`, `144/155`, and `87/98`, and both
  `check-ref-format --branch`/full-ref checks. Accept PR max `2147483647` and exact
  64-byte digest fixtures; reject their +1 values and every one-byte suffix extension.
  For every frontier/claim_ref/attempt_ref/submit_ref occurrence, accept only branch-v1;
  accept full-ref-v1 only in ref-create requests, ruleset patterns, ref-v1, and dual
  enumeration. Swap each field representation independently.
- Negatives: absent/disabled/wrong-target/wrong-pattern/exclude/bypass/missing rule;
  zero/sign/leading-zero/above-max/unsafe Number; Unicode/control/traversal; wrong SHA/
  digest/frontier; overlength/invalid ref; unauthorized settings claim.
- Expected: only exact fixture/domain passes; unavailable capability holds VOC-106.
- Evidence: `VOC-115-EV-01`

## VOC-115-TEST-02 — Atomic coalescence and stale terminal

- Covers: `VOC-115-AC-01`
- Procedure: race same-target duplicate/replayed requests and different-target requests
  on one claim name with 201/422/timeout/readback permutations. Repeat downstream
  attempt-ref calls from the same logical claim. Mutate develop/main SHA/tree after claim.
- Expected: identical target is one logical claim/attempt, not multiple caller winners;
  claim/attempt creates coalesce. Different target loses. Fresh matching topology proceeds;
  any post-claim drift is permanent `stale-protected-topology`, creates no attempt/PR,
  derives no frontier, and intentionally requires governed correction.
- Evidence: `VOC-115-EV-02`

## VOC-115-TEST-03 — Exact JSON, page captures, and stable view

- Covers: `VOC-115-AC-02`
- Procedure: mutate every exact own key/type/null/enum/id/domain of PR, timeline, ref,
  protected, ruleset/history/version, page/object/command/scan/pass-capture, stable-state,
  and reconciliation schemas. Parse raw JSON with duplicate keys/large ids. Test
  all-PR/timeline/ruleset-history 0/1/99/100/101 pages,
  explicit empty sentinel, exact Link/query order, local filtering, counts, and
  high-watermarks. Include ordinary local, foreign-fork, reserved local, and deleted-
  source PR boundaries; only exact nonnull canonical repository/label pairs reach
  reserved detail. A reserved-looking null repository must stop as ambiguous even with
  canonical-looking label and `head_ref_deleted`. Re-fetch equal state with different
  timestamps/ETags/raw bytes.
- Expected: capture digest changes while timestamp-free stable-state digest reproduces.
  Missing/extra/wrong fields, unsafe numbers, unknown timeline event, raw/projection
  mismatch, gaps/repeats/truncation, wrong history numeric max/version state, wrong
  filter/boundary/count/high-watermark fail. Pass members cover exact ordered history,
  pull/timeline/ref scans, ls-remote command, ruleset/version/protected/PR/Git objects;
  omission, duplicate, reorder, wrong subject/hash/count, or pass number fails.
  An empty all-PR/timeline/ref source may pass its domain, but empty ruleset history
  fails because no latest state is provable.
- Evidence: `VOC-115-EV-03`

## VOC-115-TEST-04 — Stable algorithm and crash matrix

- Covers: `VOC-115-AC-03`
- Procedure: build two identical complete passes and mutations before/between/after
  passes in protected refs, ruleset, any repository PR boundary, reserved PR/timeline,
  and either ref source. Exercise claim/attempt-ref POST before/after response/readback,
  submit-ref 201/422/timeout/lost response, exact submit-award schema, crash before PR,
  the single PR POST with retries/redirects disabled, unknown-zero, restart/handoff,
  binder, closure, and owner loss. Mutate canonical ref/PR request keys and bytes.
  Validate merge-commit projection parents/SHA/tree and every object-capture source.
- Expected: comparison is exact JCS stable-state equality, never capture equality;
  reconciliation pass digests equal the exact pass-1/pass-2 capture hashes and each
  pass binds the same stable-state digest;
  unstable pairs discard/retry at most three pairs. Claim/attempt absence authorizes the
  same canonical ref request without a counter. Only the exact submit-ref `201`
  invocation receives a nontransferable award and makes one PR POST. Same-target 422,
  readback, crash, and unknown-zero never authorize a POST/retry; zero remains a durable
  irrecoverable hold. One PR recovers; multiple enter cleanup. No authorized deletion
  can pass the ruleset fixture.
- Evidence: `VOC-115-EV-04`

## VOC-115-TEST-05 — Cardinality, deletion boundary, and same-D retry

- Covers: `VOC-115-AC-03`
- Procedure: fixtures cover zero/one/multiple matching PRs, none/one/two merged, open/
  closed/reopened duplicates, wrong merge SHA/tree, and failed close/readback. Close PR
  A unmerged, preserve claim/attempt refs, then create after-PR-A claim/attempt at same D.
  Prove the old identity had exactly one awarded no-retry POST, then attempt a delayed
  old-identity POST after the successor claim. Simulate body/comment deletion, attempted
  claim/attempt/submit ref update/delete denied by ruleset, and an explicitly
  unauthorized settings mutation outside the safety guarantee.
- Expected: multiplicity precedes merged. Every nonmerged duplicate closes/readbacks
  before one valid merge can succeed; multiple/conflicting merges stop. No merged case
  advances conflict frontier. With no merge, all closed duplicates advance conflict
  digest. Same-D retry is distinct and old refs immutable. Body/comment loss grants no
  state; no actor is authorized to issue the delayed POST, so successor cardinality
  cannot change under authorized actions. Ruleset mutation stops and does not pretend
  deletion resistance.
- Evidence: `VOC-115-EV-05`

## VOC-115-TEST-06 — Actor, topology, and recovery regression

- Covers: `VOC-115-AC-04`
- Procedure: enforce `/root` -> `m-e-h-r-d-a-a-d`/`7955432`/
  `MDQ6VXNlcjc5NTU0MzI=` and no current handoff. Disposable Git topology proves merge
  base, zero-main-only, head/develop SHA/tree, compare, prospective/actual tree,
  separately reviewed promotion/sync merges, permanent refs, ancestry/zero-behind,
  claim/attempt/submit ruleset survival, and recovery request.
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
- Procedure: audit exact 27 paths/OIDs and 25 textual surfaces; preserve adoption,
  failed-review history, and superseded specialist PASS; run governance/risk/diff/
  format/link/foundation/hosted checks;
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
- Expected: no duplicate active, false genesis, delayed old-identity PR, inferred null
  provenance under authorized actions, schema, ownership, ref, or topology recurrence
  before #216/#213/#191 closure.
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
- `VOC-115-EV-01`: ruleset, claim/attempt/submit grammar, exact lengths, and primitive domains.
- `VOC-115-EV-02`: coalesced races and explicit stale terminal matrix.
- `VOC-115-EV-03`: exact schemas, exhaustive history, pass captures, and stable state.
- `VOC-115-EV-04`: stable equality and every crash/unknown-response boundary.
- `VOC-115-EV-05`: cardinality cleanup, deletion boundary, and same-D retry.
- `VOC-115-EV-06`: actor, topology, settings hold, and recovery regression.
- `VOC-115-EV-07`: validator discovery/isolation/focused results.
- `VOC-115-EV-08`: paths/OIDs, checks, reviews, rollback, and merge.
- `VOC-115-EV-09`: bounded postmerge/ruleset/first-use monitoring.
