# VOC-115 — Test Plan

## VOC-115-TEST-00 — Intake, scope, and authority

- Covers: `VOC-115-AC-00`
- Procedure: inspect issue #216, PR #215 FAIL, all four exact plan-candidate FAILs,
  VOC-106/VOC-114, DOC-15/DOC-16, current surfaces, paths, and action wording.
- Expected: both candidates are superseded/no-transfer; PR #215 draft; 27 paths exact;
  ordinary scoped head updates only after adoption; no other authority.
- Evidence: `VOC-115-EV-00`

## VOC-115-TEST-01 — Claim/attempt grammar and durable identity

- Covers: `VOC-115-AC-01`
- Procedure: validate genesis, prior-PR, and conflict claim names; canonical same-tree
  one-parent claim commits/message/actor/nonce; attempt name; decimal/BigInt bounds;
  digest construction; byte limits; and check-ref-format. Bind winning claim SHA and
  attempt head SHA/tree to frozen develop.
- Negatives: zero/sign/leading-zero/decimal/above-max/unsafe Number, short/mixed digest,
  Unicode/control/traversal, wrong prefix/frontier/SHA/tree, overlength, invalid ref,
  reused identity, and exhaustion.
- Expected: exact inputs pass; every mutation stops without fallback.
- Evidence: `VOC-115-EV-01`

## VOC-115-TEST-02 — Atomic claim concurrency and terminal states

- Covers: `VOC-115-AC-01`
- Procedure: race distinct canonical claim commits from same-SHA and different-SHA
  contenders on the same fixed claim ref; fixture server accepts exactly one target.
  Cover unknown response with own/other/absent/malformed readback, stale consumed claim,
  genesis, active, closed-unmerged, merged, and impossible multiple matching PRs.
- Expected: one immutable claim winner alone may create attempt ref/PR; loser performs
  no further mutation and absence after unknown is never reposted. Closed PR advances,
  merged closes allocation, and duplicates close before the conflict claim frontier.
- Evidence: `VOC-115-EV-02`

## VOC-115-TEST-03 — Complete scans and reconstructible receipts

- Covers: `VOC-115-AC-02`
- Procedure: build 0/1/99/100/101/multipage all-state PR/timeline fixtures, canonical
  claim commits, and dual-source ref sets. Reconstruct every JCS projection, count,
  high-watermark, binding, and non-self-referential digest after a simulated handoff.
- Negatives: filtered-only scan, missing/repeated/out-of-order/changed/truncated pages,
  incomplete Link traversal, duplicate ids, malformed fields, ref-source disagreement,
  orphan ref/PR, missing deleted-source state, self-referential/POST-response digest,
  stale count/high-watermark, body/comment edit/deletion, and hostile JSON/Unicode.
- Expected: authoritative GET state reconstructs identical receipts; evidence loss
  stops but cannot reset genesis/frontier or change authority.
- Evidence: `VOC-115-EV-03`

## VOC-115-TEST-04 — Complete crash and uncertain-response matrix

- Covers: `VOC-115-AC-03`
- Procedure: crash before/after freeze, claim commit POST, claim-ref POST/readback,
  attempt-ref POST/readback, PR POST/readback, binder edit, conflict close, ordinary
  invalidation close, and receipt storage. Test `201`, `422`, timeout, disconnect, and
  malformed response.
- Expected: own accepted claim resumes, another valid target loses, absence after
  unknown stops without repost, and mismatch stops. Unknown PR POST: zero stops with no
  retry, one recovers, duplicates enter conflict closure. Exact readback alone resumes.
- Evidence: `VOC-115-EV-04`

## VOC-115-TEST-05 — Collision, deletion, and same-develop retry

- Covers: `VOC-115-AC-03`
- Procedure: close attempt PR A unmerged while preserving claim/attempt refs A, derive
  the PR-A-number claim frontier at unchanged develop, atomically accept claim B, then
  create PR B. Interpose comment/body deletion, attempts to delete/recreate consumed
  claims, source-branch deletion before/after PR, wrong-target collision, unmatched
  objects, duplicate candidate commits, and multiple PRs.
- Expected: durable claim/PR history prevents false genesis; B has a distinct accepted
  claim and attempt identity; A's refs remain immutable. Consumed claims cannot be
  recreated. Collision is never adopted/updated/deleted.
- Evidence: `VOC-115-EV-05`

## VOC-115-TEST-06 — Actor, topology, and recovery regression

- Covers: `VOC-115-AC-04`
- Procedure: enforce `/root` -> `m-e-h-r-d-a-a-d`/`7955432`/
  `MDQ6VXNlcjc5NTU0MzI=`. Test owner resume and a hypothetical separately adopted
  mapping plus durable assignment. Disposable Git topology proves merge base,
  zero-main-only, head/develop SHA/tree, compare, prospective/actual tree, separate
  reviewed promotion/sync merges, permanent refs, ancestry/zero-behind, deletion
  eligibility, and recovery request.
- Negatives: subagent mutation, wrong author/id/node id, self-asserted/unmapped handoff,
  unauthorized assignment/reopen, and every wrong ref/tree/PR/review/merge/sync/
  ancestry/delete/recovery/action mutation.
- Expected: current handoff is impossible; exact topology passes and one mutation stops.
- Evidence: `VOC-115-EV-06`

## VOC-115-TEST-07 — Validator discovery and focused suite

- Covers: `VOC-115-AC-05`
- Procedure: run the validator/test directly and through the committed foundation glob;
  inspect exports, mutation-fixture isolation, network denial, and path diagnostics.
- Expected: every specification case executes, test is auto-discovered, no package
  script changes, no credential/network/real-ref operation, and each negative fails
  for its intended invariant.
- Evidence: `VOC-115-EV-07`

## VOC-115-TEST-08 — Exact paths, reviews, and rollback

- Covers: `VOC-115-AC-05`
- Procedure: compare expected/actual 27 paths and OIDs; audit 25 current text surfaces;
  preserve adoption/history; run governance/risk/diff/format/link, foundation, and
  hosted checks. Reverse the full actual diff in a disposable worktree. Bind fresh
  exact specialist and different cross-model R4 reviews after every edit.
- Expected: no other path/current contradiction; all checks/reviews zero-blocker;
  exact parent tree restores; separate non-author merge.
- Evidence: `VOC-115-EV-08`

## VOC-115-TEST-09 — DOC-15 section 24.18 monitoring

- Covers: `VOC-115-AC-06`
- Procedure: adoption owner observes exact correction merge/readback, validator/full
  matrix, then first corrected VOC-106 promotion/sync. Retain synthetic concurrency,
  unknown-response, deletion/conflict, and same-D retry; inspect a real retry if any.
- Expected: no concurrent active, false genesis, duplicate POST, receipt, ownership,
  ref, or topology recurrence before #216/#213/#191 close.
- Evidence: `VOC-115-EV-09`

## Commands

- `node scripts/foundation/voc106-release-attempt-policy.mjs`
- `node --test scripts/foundation/voc106-release-attempt-policy.test.mjs`
- `pnpm run ci:foundation`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact path/OID/surface audits and disposable topology/rollback fixtures

No test uses network, GitHub/Cloudflare/settings APIs, credentials, real refs, push,
force, deletion, dispatch, deployment, migration, data, DNS/traffic, spending, or launch.

## Evidence definitions

- `VOC-115-EV-00`: intake, superseded reviews, scope, and authority evidence.
- `VOC-115-EV-01`: frontier grammar, numeric/digest domain, and identity bindings.
- `VOC-115-EV-02`: atomic same/different-SHA race and terminal conflict matrix.
- `VOC-115-EV-03`: complete scans and reconstructed canonical receipts.
- `VOC-115-EV-04`: every-boundary crash/unknown-response recovery matrix.
- `VOC-115-EV-05`: collision/deletion/same-D immutable retry matrix.
- `VOC-115-EV-06`: actor mapping, topology, deletion, and recovery regression.
- `VOC-115-EV-07`: validator exports, discovery, isolation, and focused results.
- `VOC-115-EV-08`: paths/OIDs, surfaces, checks, reviews, rollback, and merge.
- `VOC-115-EV-09`: bounded postmerge/first-use monitoring and issue disposition.
