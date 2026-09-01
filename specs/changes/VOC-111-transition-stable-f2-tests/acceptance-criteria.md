# VOC-111 — Acceptance Criteria

## VOC-111-AC-00 — Lifecycle, reproduction, and risk are exact

- Requirements: `VOC-111-D00`, `VOC-111-D06`, `VOC-111-D07`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-00`
- Evidence: `VOC-111-EV-00`
- Result: pending exact implementation evidence

The plan binds base `c94444bc74d3ed1b5ca0aca65141d0532f70fa11`, VOC-110 implementation
`66928cb432ace3440990514526cc3afc6262d3de`, runtime-validator PASS/PASS, and focused
24/27 / foundation 179/182 with exactly the three issue #206 failures. Current
candidate identity is the exact base plus fixed sorted 12 paths and exact
path-NUL/blob-OID-no-LF-NUL command in `VOC-111-CANDIDATE-MANIFEST-00`, yielding
`7205f4856b2839f7302ab9a9fd9fbac57ee69942723f283241ac2970bb147e43` both before and
after reproduction; `8efd149c...` is superseded pre-format history. The package is R3,
one task, one PR, `automatic_merge_allowed: true`, draft, and unauthorized. Exactly
one future implementation path is declared and every external action remains
prohibited.

## VOC-111-AC-01 — The live profile is selected exactly

- Requirements: `VOC-111-D01`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-01`
- Evidence: `VOC-111-EV-01`
- Result: pending exact implementation evidence

The test helper returns `pre-voc105` or `voc105` only after complete exact-object
comparison with object order ignored and array order preserved. Current surface
validation passes in either complete repository state. Every extra, absent, renamed,
wrong-type, wrong-value, or misordered-array mutation refuses profile selection; no
single-field/default heuristic is used.

## VOC-111-AC-02 — Duplicate keys fail under either profile

- Requirements: `VOC-111-D02`, `VOC-111-D04`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-02`
- Evidence: `VOC-111-EV-02`
- Result: pending exact implementation evidence

Profile-independent raw injection proves duplicate `f3_staging` rejection for both
exact profiles and duplicate `f3_current_evidence` rejection for VOC-105. Fixture
setup obtains the unique current serialized value from the selected exact object,
asserts one member before and two after, and never searches for the fixed old
`unresolved-held` pair. Each aggregate diagnostic names the duplicated key.

## VOC-111-AC-03 — Plan-owned fixtures prove both transition directions

- Requirements: `VOC-111-D03`, `VOC-111-D04`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-03`
- Evidence: `VOC-111-EV-03`
- Result: pending exact implementation evidence

All five pre-profile human sources are assembled only from the specification's exact
committed marker/support arrays. Each pre and future source passes its explicit
profile, every required marker fails when removed, and the F2 document passes its
additional document contract. Complete synthetic pre and VOC-105 repositories pass.
For every human path, a future repository with that one pre source and a pre repository
with that one future source fail with a path-specific diagnostic. No expected fixture
text comes from mutable `repositoryRoot`, a worktree, branch, PR, or runtime diff.

## VOC-111-AC-04 — VOC-110 and VOC-109 evidence remains complete

- Requirements: `VOC-111-D04`, `VOC-111-D05`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-04`
- Evidence: `VOC-111-EV-04`
- Result: pending exact implementation evidence

Every existing immutable-F2, history, profile, marker, normalization, false-claim,
hold, external-effect, malformed/missing input, no-execution, and VOC-109 command-chain
positive/negative remains present and unchanged in effect. No assertion is deleted,
skipped, narrowed to the active repository only, or satisfied by an unrelated error.

## VOC-111-AC-05 — The exact one-file revision is verified and reversible

- Requirements: `VOC-111-D06`, `VOC-111-D07`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-05`
- Evidence: `VOC-111-EV-05`
- Result: pending exact implementation evidence

Focused, runtime, foundation, workspace, governance, risk, path, whitespace, hosted,
and disposable-worktree rollback checks pass at the exact implementation SHA. The diff
contains only `scripts/foundation/voc081-f2-evidence-policy.test.mjs`. A distinct
foundation-policy-test/CI specialist and independent cross-model R3 verifier report
PASS with zero blockers; a separate non-author performs any merge.

## VOC-111-AC-06 — The first real VOC-105 transition is observed

- Requirements: `VOC-111-D08`
- Task: `VOC-111-T00`
- Tests: `VOC-111-TEST-06`
- Evidence: `VOC-111-EV-06`
- Result: pending post-merge observation

The accountable owner records the first refreshed real VOC-105 candidate's two
runtime validators, focused suite, `ci:foundation`, and hosted checks. Exact live
profile selection and all protected transition/VOC-110/VOC-109 evidence remain green.
The exact TEST-00 manifest command yields the same current digest immediately before
and after observation. Any identity drift, recurrence, or false acceptance stops
VOC-105 merge and VOC-111 closure and invokes the linked remediation/revert
disposition. A governed abandonment/supersession record is the only alternate end
condition.
