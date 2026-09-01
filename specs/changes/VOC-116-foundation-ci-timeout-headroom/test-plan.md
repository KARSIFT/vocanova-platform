# VOC-116 — Test Plan

## VOC-116-TEST-00 — Governance, intake, and exact scope

- Covers: `VOC-116-AC-00`
- Procedure: validate all nine package files, issue/base linkage, R3 declaration,
  explicit automatic merge policy, pending review/adoption, one task/PR, exact sorted
  six-path implementation inventory, superseded candidate/reviews with no transfer,
  prospective cross-model fields remaining pending, holds, rollback, and prohibited
  authority.
- Expected: draft is internally complete but grants no implementation or external action.
- Evidence: `VOC-116-EV-00`

## VOC-116-TEST-01 — Measured exact timeout

- Covers: `VOC-116-AC-01`
- Procedure: derive durations from hosted job timestamps for PR job `99830331854` and
  push job `99837345020`; prove `20 * 60 = 1200`, `1200 - 873 = 327`,
  `1200 - 916 = 284`, and `(20 - 15) / 15 = 33.3%` rounded to one decimal. Diff all
  workflow timeout lines against the parent.
- Expected: foundation alone changes 15 to integer 20 and every recorded measurement is exact.
- Evidence: `VOC-116-EV-01`

## VOC-116-TEST-02 — Complete unchanged foundation suite

- Covers: `VOC-116-AC-02`
- Procedure: prove `.github/workflows/ci.yml` still contains exactly
  `run: pnpm run ci:foundation`; prove the root `ci:foundation` script and every
  discovered `scripts/foundation/*.test.mjs` path match the parent; run the command and
  capture the final TAP counts.
- Expected: 204 pass, zero fail/cancelled/skipped/todo on the adopted baseline, with no
  command/filter/order/discovery change. A mismatch or later authorized count change
  requires truthful evidence review rather than silently forcing 204.
- Evidence: `VOC-116-EV-02`

## VOC-116-TEST-03 — Timeout policy mutation matrix

- Covers: `VOC-116-AC-03`
- Procedure: canonical `ci.yml` passes. In isolated strings, mutate only the foundation
  value to 15, 19, 21, 30, `20.0`, `"20"`, and `${{ matrix.timeout }}`; omit it; add a
  duplicate timeout key; duplicate the foundation job; and set another job to 20 while
  foundation is absent/wrong. Assert a foundation-specific diagnostic for each.
- Expected: only one exact unquoted integer 20 on one foundation job passes; common
  every-runner timeout checks remain passing on canonical content.
- Evidence: `VOC-116-EV-03`

## VOC-116-TEST-04 — Aggregate fail-closed matrix

- Covers: `VOC-116-AC-04`
- Procedure: retain structural checks for `if: always()`, complete needs/result/env/
  argument mapping, and exact aggregation script. Execute the script with all-success,
  then one at a time set foundation to `failure`, `cancelled`, `skipped`, empty/missing,
  and `unknown` while peers remain success.
- Expected: all-success exits zero; every nonsuccess/absent/unknown case exits nonzero
  with the required-jobs diagnostic.
- Evidence: `VOC-116-EV-04`

## VOC-116-TEST-05 — Living truth and path audit

- Covers: `VOC-116-AC-05`
- Procedure: search all living repository content for foundation timeout/aggregation
  claims, compare the three updated surfaces, and list the implementation diff against
  its exact parent. Confirm package.json, lockfile, other workflows/jobs, historical
  packages, applications, and infrastructure are unchanged.
- Expected: exactly six paths change and all living statements agree without historical edits.
- Evidence: `VOC-116-EV-05`

## VOC-116-TEST-06 — Full validation and exact review

- Covers: `VOC-116-AC-06`
- Procedure: run the commands below, capture exact head/tree/path set and hosted check
  URLs, and obtain a different non-author R3 verdict bound to the final SHA. Repeat all
  affected checks/review after any edit.
- Expected: every applicable local/hosted check passes, risk is at least R3, zero
  blocker remains, and only a separate non-author may merge.
- Evidence: `VOC-116-EV-06`

## VOC-116-TEST-07 — Rollback rehearsal and post-merge monitoring

- Covers: `VOC-116-AC-07`
- Procedure: in a disposable worktree reverse all six paths to the implementation
  parent, prove exact equality and 15-minute cap, then reapply and rerun focused policy.
  After merge, monitor exact merge-SHA CI/Governance/Security and fresh develop
  readback; record foundation lifecycle/validation duration, full test count, and
  aggregate result in issue #218.
- Expected: rollback/reapply is complete and residue-free. Success is 204 tests,
  foundation PASS below 20 minutes, `ci required` PASS, and unchanged scope. Any stop
  signal opens/reopens governed intake; no automatic cap increase occurs.
- Evidence: `VOC-116-EV-07`

## VOC-116-TEST-08 — Self-modification, privilege, and protection continuity

- Covers: `VOC-116-AC-08`
- Procedure: record exact actor and model provenance for the plan builder/reviewer and,
  separately, implementation builder/reviewer; require actor inequality and model
  inequality for each exact SHA, with no evidence transfer. Diff every workflow field
  against the parent and allow only foundation timeout 15 to 20, proving the sole
  effects are at most +5 minutes runner occupation and feedback delay. Inventory every
  parent workflow-policy diagnostic and focused test; replay every existing positive/
  negative unchanged in effect against the proposed complete workflow, then run the
  new exact-20 matrix. Inspect source/test diff to reject removed/bypassed/relaxed old
  guards and require the final atomic revision to contain preserved protections plus
  the new invariant/proof.
- Expected: both cross-model gates pass with distinct actor/model provenance; no
  authority/capability field changes; every old protection and new exact-20 invariant
  passes before eligibility; no weakened intermediate revision authorizes transition.
- Evidence: `VOC-116-EV-08`

## Commands

- `node --test scripts/foundation/workflow-policy.test.mjs`
- `node scripts/foundation/workflow-policy.mjs --phase final`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `pnpm exec prettier --check .github/README.md .github/workflows/ci.yml docs/development.md docs/operations/11-devops-and-ci-cd.md scripts/foundation/workflow-policy.mjs scripts/foundation/workflow-policy.test.mjs`
- `git diff --check`
- exact parent/head/tree/path/timeout/command/discovered-test audits
- disposable six-path reverse/reapply rehearsal

No test queries settings, reads secrets, dispatches, deploys, migrates, contacts
Cloudflare, accesses production/data, changes DNS/traffic, spends, releases, or launches.

## Evidence definitions

- `VOC-116-EV-00`: issue/base/package/governance/scope/authority evidence.
- `VOC-116-EV-01`: hosted timestamp arithmetic and timeout-only workflow diff.
- `VOC-116-EV-02`: unchanged command/discovery inventory and complete TAP result.
- `VOC-116-EV-03`: exact timeout positive and mutation matrix.
- `VOC-116-EV-04`: aggregate structural and result matrix.
- `VOC-116-EV-05`: living-document audit and exact six-path implementation manifest.
- `VOC-116-EV-06`: local/hosted checks, exact identity, review, and merge eligibility.
- `VOC-116-EV-07`: rollback rehearsal and bounded post-merge issue evidence.
- `VOC-116-EV-08`: plan/implementation cross-model provenance, exact privilege diff,
  parent-protection inventory, unchanged-effect replay, additive invariant proof, and
  no-weakened-intermediate evidence.
