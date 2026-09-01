# VOC-117 — Test Plan

## VOC-117-TEST-00 — Governance, intake, and exact scope

- Covers: `VOC-117-AC-00`
- Preconditions: Exact base `b22a735fa5986023a7795c3f7cb89af7cf1cfccb`; clean plan branch; issue/run/job evidence available.
- Procedure: Validate all nine package files, allocator evidence (VOC-116 exists on a remote plan ref and no VOC-117 exists), R3 declaration, one task/PR, `automatic_merge_allowed: true`, pending adoption, exact one-file inventory, preservation surfaces, cross-model fields, rollback, and prohibited authority.
- Expected result: Complete draft package with no implementation or external authority.
- Evidence: `VOC-117-EV-00`

## VOC-117-TEST-01 — Parameterized SIGINT/SIGTERM readiness and outcomes

- Covers: `VOC-117-AC-01`
- Preconditions: Isolated test file; exact Node/pnpm toolchain; no production data.
- Procedure: Run the existing parameterized cases for SIGINT and SIGTERM. Each child must register its handler, emit the exact marker, and await the parent waiter before `stopAll(signal)`. Assert one requested signal, `forced === false`, settled child, and code 23/24.
- Expected result: Both cases pass without any elapsed-time precondition; `stopAll` and child outcome semantics remain unchanged.
- Evidence: `VOC-117-EV-01`

## VOC-117-TEST-02 — Stream, buffer, timeout, and disposal contract

- Covers: `VOC-117-AC-02`
- Preconditions: Waiter and marker helper exist in the test file.
- Procedure: Exercise a marker already present in `record.output`, a marker split across stdout chunks, an exact marker followed by extra output, and a positive startup near but below the finite bound. Inspect listener/timer cleanup after resolve, reject, and timeout.
- Expected result: Exact marker resolves once, split/buffered output is accepted, unrelated output is ignored, and every waiter path removes temporary resources.
- Evidence: `VOC-117-EV-02`

## VOC-117-TEST-03 — Bounded missing/wrong/early readiness negatives

- Covers: `VOC-117-AC-03`
- Preconditions: Disposable supervised children; injected short timeout such as 50 ms.
- Procedure: Spawn (a) a live fixture with no marker, (b) a live fixture emitting a wrong marker, and (c) a fixture exiting with a known code before any marker. Assert bounded timeout or early-exit diagnostics; always call child cleanup in `finally`, then assert `record.settled === true`.
- Expected result: Every negative rejects promptly, leaves no process/timer/listener/port, and never retries or hangs.
- Evidence: `VOC-117-EV-03`

## VOC-117-TEST-04 — Exact disposable mutation matrix

- Covers: `VOC-117-AC-04`
- Preconditions: Clean disposable copy of the exact candidate; mutation commands recorded but never committed.
- Procedure: One at a time: remove marker emission; rename marker; emit the exact marker in two stdout chunks; emit a split marker with a missing/altered byte; move marker before `process.on`; replace waiter call with `await delay(75)`; change expected 23 or 24. Run focused tests and source/order audit after each mutation, restoring from the clean copy.
- Expected result: Correctly split exact output passes; missing/wrong/altered/order mutations fail bounded readiness/order controls; delay mutation fails the no-fixed-delay audit; changed expected code fails the outcome assertion; clean candidate passes and no mutation remains.
- Evidence: `VOC-117-EV-04`

## VOC-117-TEST-05 — Runtime, command, discovery, and exact path preservation

- Covers: `VOC-117-AC-05`
- Preconditions: Parent and candidate revisions available.
- Procedure: Compare `local-development-supervisor.mjs`, `docs/development.md`, `package.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml`, and the `ci:foundation` script/discovery against the exact parent. Confirm `node --test scripts/foundation/*.test.mjs` still discovers the focused file and no other path changes.
- Expected result: Only the declared test file differs; runtime supervisor and all public/CI semantics remain unchanged.
- Evidence: `VOC-117-EV-05`

## VOC-117-TEST-06 — Full deterministic, hosted, and exact-revision evidence

- Covers: `VOC-117-AC-06`
- Preconditions: Final candidate SHA and clean tree.
- Procedure: Run the commands below, capture exact SHA/tree/path and hosted URLs, obtain distinct local-process specialist PASS and independent cross-model R3 PASS by non-authors, and repeat all affected checks after edits.
- Expected result: Focused and complete foundation checks pass; hosted required checks pass; no blocker remains; a separate non-author actor is eligible to merge only this exact SHA.
- Evidence: `VOC-117-EV-06`

## VOC-117-TEST-07 — Rollback/reapply and post-merge monitoring

- Covers: `VOC-117-AC-07`
- Preconditions: Candidate and actual implementation parent SHAs recorded.
- Procedure: In a disposable worktree reverse the one test path to the actual parent, prove the fixed-delay baseline is restored, reapply the candidate, rerun focused/foundation checks, and verify no residue. After reviewed merge, monitor exact merge-SHA foundation and required aggregate results and record child settlement/forced status on issue #221.
- Expected result: Reverse/reapply is exact and clean. Closure requires no recurrence, no timeout/leak/forced-kill drift, complete test success, and required aggregate success; otherwise route governed follow-up or revert.
- Evidence: `VOC-117-EV-07`

## VOC-117-TEST-08 — Self-modification, cross-model, and zero-privilege proof

- Covers: `VOC-117-AC-08`
- Preconditions: Final exact diff and reviewer assignments.
- Procedure: Prove no governance, validator, permissions, review/merge/deploy authority, runtime source, dependency, workflow, credential, or external-system change. Record distinct plan builder/reviewer and implementation builder/reviewer actors; require distinct reviewer model for each exact R3 review; reject review transfer after any edit.
- Expected result: Zero authority expansion; scoped cross-model R3 evidence passes as defense in depth; any protected-surface expansion is a hard planning stop.
- Evidence: `VOC-117-EV-08`

## Commands

- `node --test --test-name-pattern="owned children receive SIGINT once and settle|owned children receive SIGTERM once and settle|shutdown escalates after the bounded grace period" scripts/foundation/local-development-supervisor.test.mjs`
- `node --test scripts/foundation/local-development-supervisor.test.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `pnpm exec prettier --check scripts/foundation/local-development-supervisor.test.mjs`
- `git diff --check`
- exact parent/head/tree/path and preservation-surface audits
- disposable mutation and reverse/reapply rehearsals

No command may query settings, read secrets, dispatch, deploy, access Cloudflare,
migrate, access production/learner data, change DNS/traffic, spend, release, promote
main, or launch.

## Evidence definitions

- `VOC-117-EV-00`: issue, allocator, package, base, risk, scope, authority evidence.
- `VOC-117-EV-01`: both signal readiness and exact 23/24 outcome evidence.
- `VOC-117-EV-02`: stream/buffer/split/timeout/disposal evidence.
- `VOC-117-EV-03`: bounded negative and child-cleanup evidence.
- `VOC-117-EV-04`: disposable mutation matrix and clean-candidate evidence.
- `VOC-117-EV-05`: exact one-path and runtime/command/discovery preservation audit.
- `VOC-117-EV-06`: local/hosted checks, exact identity, specialist, cross-model review,
  and merge-eligibility evidence.
- `VOC-117-EV-07`: reverse/reapply and post-merge monitoring evidence.
- `VOC-117-EV-08`: zero-privilege, self-modification boundary, and actor/model
  separation evidence.
