# VOC-105 — Test Plan

## VOC-105-TEST-00 — Evidence inventory and gate decision

- Covers: `VOC-105-AC-00`
- Procedure: inspect the exact F2, VOC-094 Phase 1/2, VOC-100/101, and run 33386240492
  records; compare every DOC-12 F3 gate item to the structured record.
- Expected: each item has immutable public evidence, or the record remains partial/
  pending; the current delivery event is not conflated with the milestone decision.
- Evidence: `VOC-105-EV-00`

## VOC-105-TEST-01 — Current/history and later-gate boundaries

- Covers: `VOC-105-AC-01`, `AC-05`
- Procedure: run the validator against all designated active files and mutate one at a
  time: unresolved F3 text, missing current evidence, history presented as current,
  A1/P1+ acceptance, production/live claim, or removed hold.
- Expected: the valid tree passes; each mutation fails with a concrete diagnostic.
- Evidence: `VOC-105-EV-01`

## VOC-105-TEST-02 — Exact evidence and run outcomes

- Covers: `VOC-105-AC-00`, `AC-02`
- Procedure: mutate the JSON SHA, run ID/attempt, F2 dependency, resource/settings
  links, required successful job/step result, or expected rollback-skipped result.
- Expected: wrong, missing, failed, skipped, or ambiguous evidence fails closed; no
  network request or protected value is needed.
- Evidence: `VOC-105-EV-02`

## VOC-105-TEST-03 — Redaction and schema negatives

- Covers: `VOC-105-AC-02`
- Procedure: inject token-like values, secret names outside the permitted interface,
  immutable Worker UUIDs, malformed JSON, unknown status, missing hold, or a direct
  live-action instruction into disposable fixtures.
- Expected: every fixture fails; synthetic/public IDs remain accepted.
- Evidence: `VOC-105-EV-03`

## VOC-105-TEST-04 — Scope, rollback, and regression

- Covers: `VOC-105-AC-03`, `AC-05`
- Procedure: verify the exact allowed-path inventory, run `ci:foundation`, workspace
  validation, governance validation/classification, and `git diff --check`; rehearse
  a reverse-order repository revert in a disposable worktree and compare exact trees.
- Expected: no application/runtime/settings/manifest/history path changes; revert is
  repository-only and restores the prior tree.
- Evidence: `VOC-105-EV-04`

## VOC-105-TEST-05 — Exact-SHA review and hosted proof

- Covers: `VOC-105-AC-04`
- Procedure: bind specialist and independent R4 PASS verdicts to the exact candidate,
  run applicable CI/Governance/Security/Quality checks, resolve findings, and record
  normal non-author merge plus post-merge readback.
- Expected: no self-review or self-merge; VOC-105 receives its own closure evidence,
  while issue #189 remains open for the separately governed A1 planning outcome.
- Evidence: `VOC-105-EV-05`

## Commands

- `node scripts/foundation/voc105-f3-evidence-policy.mjs`
- `node --test scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

No test runs Wrangler, dispatches a workflow, queries Cloudflare, accesses a secret,
or uses production/learner data. Hosted staging run 33386240492 is immutable evidence,
not an implementation test to rerun.

## Evidence definitions

- `VOC-105-EV-00`: exact evidence inventory and gate-decision record.
- `VOC-105-EV-01`: active-surface and current/history boundary results.
- `VOC-105-EV-02`: exact IDs, run outcomes, and dependency-chain negatives.
- `VOC-105-EV-03`: schema, redaction, hold, and prohibited-claim negatives.
- `VOC-105-EV-04`: path, validation, rollback rehearsal, and scope proof.
- `VOC-105-EV-05`: exact reviews, hosted checks, merge, post-merge readback, and
  closure contract.
