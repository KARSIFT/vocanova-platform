# VOC-119 — Test Plan

All tests are repository-only and local unless explicitly labeled hosted-check
readback. No test may query settings, deploy, dispatch, access Cloudflare, touch
production or learner data, or change live traffic.

## VOC-119-TEST-00 — Governance, allocation, and exact scope

- Covers: `VOC-119-AC-00`, `VOC-119-AC-01`
- Procedure: validate all nine package files, allocator evidence for VOC-116/VOC-118/
  VOC-119, exact issue/run/job/base linkage, R3 declaration, one task/PR/path,
  explicit `automatic_merge_allowed: true`, pending review/adoption, rollback, and
  prohibited authority.
- Expected: complete draft package with no implementation or external-action
  authority.
- Evidence: `VOC-119-EV-00`

## VOC-119-TEST-01 — Read-only diagnosis is exact

- Covers: `VOC-119-AC-02`
- Procedure: confirm the issue's five hosted durations, reproduce the local planning
  profile values, and verify the 6,462-assertion cardinality used for the largest
  timing inference.
- Expected: planning measurements are recorded exactly, and the disproved dominant-
  cause assumption is explicit.
- Evidence: `VOC-119-EV-01`

## VOC-119-TEST-02 — One-file immutable-baseline contract

- Covers: `VOC-119-AC-03`
- Procedure: diff parent/head paths, inspect helper structure, and prove that only
  designated-surface one-file mutation cases move to the immutable-baseline /
  `inspectF3Surface()` path while aggregate cases retain full `inspectF3Evidence()`.
- Expected: one implementation file only, no policy-module edit, and no aggregate
  case accidentally localized.
- Evidence: `VOC-119-EV-02`

## VOC-119-TEST-03 — No coverage reduction or timeout increase

- Covers: `VOC-119-AC-03`, `VOC-119-AC-04`
- Procedure: search the changed file and repo diff for reduced loops, changed
  assertion counts, weakened regexes, `skip`, `only`, retry, repeat, shard,
  parallelization, timeout additions, timeout increases, workflow edits, or package-
  script changes.
- Expected: the mutation matrix and exact 20-minute hosted cap remain unchanged.
- Evidence: `VOC-119-EV-03`

## VOC-119-TEST-04 — Before/after named timing evidence

- Covers: `VOC-119-AC-05`
- Procedure: capture exact before/after durations for the five issue-named slow tests,
  then compare the complete VOC-105 file result and wall duration.
- Expected: all named tests still pass, coverage stays complete, and elapsed time
  drops materially enough to restore hosted headroom confidence.
- Evidence: `VOC-119-EV-04`

## VOC-119-TEST-05 — Complete foundation validation

- Covers: `VOC-119-AC-04`, `VOC-119-AC-05`
- Procedure: run the complete VOC-105 file, `pnpm run ci:foundation`, governance/risk/
  diff checks, and inspect hosted required-check readback for the final exact SHA.
- Expected: no skipped or lost tests, all applicable checks pass, and hosted
  foundation regains concrete headroom below the exact 20-minute cap.
- Evidence: `VOC-119-EV-05`

## VOC-119-TEST-06 — Rollback and monitoring

- Covers: `VOC-119-AC-06`
- Procedure: reverse the one-file implementation in a disposable worktree, prove exact
  parent equality, reapply, and define post-merge monitoring for the five named tests,
  complete VOC-105 file, complete foundation suite, and hosted headroom.
- Expected: clean complete revert capability and explicit post-merge stop signals.
- Evidence: `VOC-119-EV-06`

## VOC-119-TEST-07 — Independent review and holds

- Covers: `VOC-119-AC-07`
- Procedure: bind exact-SHA independent cross-model R3 review to both plan and
  implementation and verify all external-effect holds remain unchanged.
- Expected: distinct non-author review with zero unresolved blockers; no new
  authority.
- Evidence: `VOC-119-EV-07`

## Commands

- `node --test scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `node --test --test-name-pattern="later authority claim grammar fails across every surface" scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `node --test --test-name-pattern="canonical guarded runbook regions pass and every guard drift or command fails" scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `node --test --test-name-pattern="history checks reject only superseded F3 current claims" scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `node --test --test-name-pattern="protected credential and F3 occurrences fail closed on every surface" scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `node --test --test-name-pattern="protected safe subjects bind generated positive continuation grammar" scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `pnpm run ci:foundation`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact path, count, timeout, and hosted headroom audits

No unavailable command may be represented as passing.

## Evidence definitions

- `VOC-119-EV-00`: allocator/intake/base/scope/authority package evidence.
- `VOC-119-EV-01`: hosted/local timing evidence and disproved-assumption proof.
- `VOC-119-EV-02`: one-file immutable-baseline and aggregate-case boundary proof.
- `VOC-119-EV-03`: no-coverage-reduction and no-timeout-increase audit.
- `VOC-119-EV-04`: before/after five-test and complete-file timing table.
- `VOC-119-EV-05`: complete foundation validation and hosted required-check evidence.
- `VOC-119-EV-06`: full revert/reapply rehearsal and post-merge monitoring contract.
- `VOC-119-EV-07`: exact-SHA independent review and unchanged holds.
