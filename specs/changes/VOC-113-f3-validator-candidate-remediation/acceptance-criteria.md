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

The exact public staging account, zone, and D1 IDs pass only at their canonical labels
and locations in the delivery document. Every moved/unknown identifier, protected
Worker UUID, token/secret/credential value, and unknown credential name fails on every
surface; the two exact Cloudflare names pass only without values. Tests use no secret.

## VOC-113-AC-03 — Live action and later authority fail closed everywhere

- Requirements: `VOC-113-D04`
- Tests: `VOC-113-TEST-03`
- Evidence: `VOC-113-EV-03`

The exact conditional, authority-bounded credential removal/cancel/retry/verify and
migration/upload/promotion/smoke/rollback procedures pass only in the canonical
delivery-document regions with their guards. Relocated, guard-removed, unconditional,
or appended live commands fail on every surface, as do false later-boundary/hold-release
claims. Sanitized past events and unresolved/held/no-action truth pass without execution.

## VOC-113-AC-04 — Historical pending state cannot masquerade as current

- Requirements: `VOC-113-D05`
- Tests: `VOC-113-TEST-04`
- Evidence: `VOC-113-EV-04`

For every VOC-094 through VOC-104 reference and every surface, only superseded
prospective F3/staging pending/unresolved wording presented as current fails. Explicit
immutable F3 history plus later-VOC-105 supersession passes. Current production and
learner-data held truth and HOLD-01/HOLD-02 remain-held statements pass even when
historical lineage is cited. Historical packages remain unchanged.

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
regressions pass. Immediately before both observations status is clean, staged/unstaged
HEAD diff is zero, and every working-file OID equals `HEAD:path`. Exact head/tree,
inventory, 12 HEAD/working OIDs, and digest are identical. Any dirt or drift stops merge.

## VOC-113-AC-07 — Exact revision is independently verified and reversible

- Requirements: `VOC-113-D07`, `VOC-113-D08`, `VOC-113-D09`
- Tests: `VOC-113-TEST-07`
- Evidence: `VOC-113-EV-07`

The correction changes exactly two files relative to stopped head, PR #209 retains
exactly VOC-105's 12-path outcome relative to historical base, and hosted/governance/
path checks pass. A disposable scoped 12-path reverse restores historical `5330844...`
content without claiming it is the future first parent; an integrated full revert is
specified against PR #209's actual then-current first parent including VOC-113. Fresh distinct
specialist and independent cross-model R4 reviewers pass the final exact head with
zero blockers; a separate non-author performs any merge.

## VOC-113-AC-08 — Post-merge monitoring closes explicitly

- Requirements: `VOC-113-D10`
- Tests: `VOC-113-TEST-08`
- Evidence: `VOC-113-EV-08`

The adoption-recorded owner monitors from PR #209 merge through exact-merge-SHA CI,
Governance, Security, and fresh `origin/develop` readback of both runtime/focused
validators, `ci:foundation`, governance, canonical positives, and negative matrices.
All signals must pass before issue closure or VOC-106 release. Failure is recorded in
issue #211 or a linked bug and routes governed remediation or full integrated revert.
