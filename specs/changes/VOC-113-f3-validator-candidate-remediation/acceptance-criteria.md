# VOC-113 — Acceptance Criteria

## VOC-113-AC-00 — Lifecycle, stopped evidence, and scope are exact

- Requirements: `VOC-113-D00`, `VOC-113-D01`, `VOC-113-D08`, `VOC-113-D09`
- Tests: `VOC-113-TEST-00`
- Evidence: `VOC-113-EV-00`

The R4 draft binds issue #211, stopped SHA/digest `841d263...`/`903e7f80...`, and
historical VOC-111 digest `7205f485...` without relabeling. It declares one task, one
corrected PR #209 implementation, exactly two correction paths,
`automatic_merge_allowed: true`, required exact reviews, and no external authority.

## VOC-113-AC-01 — Every designated current-truth file is governed

- Requirements: `VOC-113-D02`
- Tests: `VOC-113-TEST-01`
- Evidence: `VOC-113-EV-01`

All nine exact files are loaded independently. Canonical content passes; absence or
unreadability fails by path. Every cross-cutting validator diagnostic identifies the
surface whose content violated policy.

## VOC-113-AC-02 — Disclosure and credential vocabulary fail closed everywhere

- Requirements: `VOC-113-D03`
- Tests: `VOC-113-TEST-02`
- Evidence: `VOC-113-EV-02`

Every surface rejects token/secret/credential values, protected Worker UUIDs, and any
credential-like uppercase name outside the two exact Cloudflare interface names.
Those names pass only without values. The tests use no real secret or environment.

## VOC-113-AC-03 — Live action and later authority fail closed everywhere

- Requirements: `VOC-113-D04`
- Tests: `VOC-113-TEST-03`
- Evidence: `VOC-113-EV-03`

Every surface rejects each direct-live imperative and every positive/authorized later-
milestone, product, production, live, launch, learner-data, or hold-release claim,
including the issue #211 examples. Exact unresolved/held/skipped/prohibited language
and the evidence-bound current F3 decision pass without executing a command.

## VOC-113-AC-04 — Historical pending state cannot masquerade as current

- Requirements: `VOC-113-D05`
- Tests: `VOC-113-TEST-04`
- Evidence: `VOC-113-EV-04`

For every VOC-094 through VOC-104 reference and every surface, prospective pending or
held wording presented as current fails. Explicit immutable historical context plus
the later-evidence supersession/current boundary passes. Historical packages remain
unchanged.

## VOC-113-AC-05 — Gate, delivery, and rollback objects are exact

- Requirements: `VOC-113-D06`
- Tests: `VOC-113-TEST-05`
- Evidence: `VOC-113-EV-05`

Only the exact schema/key/type/value/array/gate/delivery object passes. Every missing,
extra, renamed, duplicated, wrong-type, failed, skipped, unknown, or noncanonical gate,
job, step, production, rollback outcome, or rollback proof fails with the intended
specific diagnostic.

## VOC-113-AC-06 — The replacement candidate is stable and regressions pass

- Requirements: `VOC-113-D01`, `VOC-113-D07`
- Tests: `VOC-113-TEST-06`
- Evidence: `VOC-113-EV-06`

All existing focused evidence remains unchanged in effect and the complete new matrix,
both runtime/focused validators, foundation/workspace suites, and VOC-110/VOC-109
regressions pass. The exact corrected head, fixed inventory, 12 blob OIDs, and canonical
digest are identical immediately before and after observation. Drift stops merge.

## VOC-113-AC-07 — Exact revision is independently verified and reversible

- Requirements: `VOC-113-D07`, `VOC-113-D08`, `VOC-113-D09`
- Tests: `VOC-113-TEST-07`
- Evidence: `VOC-113-EV-07`

The correction changes exactly two files relative to stopped head, PR #209 retains
exactly VOC-105's 12-path outcome relative to base, hosted/governance/path checks pass,
and a disposable full-PR reverse restores exact base with no residue. Fresh distinct
specialist and independent cross-model R4 reviewers pass the final exact head with
zero blockers; a separate non-author performs any merge.
