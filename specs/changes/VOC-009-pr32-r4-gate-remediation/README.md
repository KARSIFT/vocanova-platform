# VOC-009 — PR #32 R4 Gate Remediation

## Identity and lifecycle

- Change ID: `VOC-009`
- Status: `implementation-ready`
- Package-adoption risk: `R4`
- Planned remediation risk: `R4` for both the revert and fresh adoption revisions
- Requirement source: founder remediation direction on issue #29
- Scope-approval evidence: issue comment `5031045639`
- Base branch: `develop`
- Exact grounded base: `b591ee7d4034d62fa4da6edeb85fb8cf68bcbddc`
- Canonical path: `specs/changes/VOC-009-pr32-r4-gate-remediation`

## Objective

Restore a valid, evidence-bound adoption sequence after PR #32 merged the R4
DOC-00–DOC-12 adoption before independent verification and exact-revision founder
approval. Preserve the complete failure record, revert the unauthorized lifecycle
change through a separately verified and approved R4 revision, then re-present the
substantively reviewed reconciliation through a fresh R4 adoption revision with all
gates completed before merge.

## Current truth

PR #32 candidate `c2154042ebe8cad2452717a10ab0958455bf5fa3` merged as canonical
`develop` commit `b591ee7d4034d62fa4da6edeb85fb8cf68bcbddc`. The merged tree is
byte-identical to the candidate and the later independent review found the content
thorough, but returned `FAIL` because the R4 merge occurred before its required gates.
Founder direction explicitly does not retroactively approve that merge. DOC-00 through
DOC-12 must therefore be treated as non-authoritative pending remediation even though
their currently merged metadata says `approved`.

PR #33 validly adopted exact package candidate
`3a9da8ded7e79711fc5ea0b8dbc83155b23dff41` into canonical `develop` at
`f28b670c0ea41577a91379e7d29618db38dd8a0a`. Deterministic and hosted checks
passed, exact-revision independent verification returned `PASS` in comment
`5031390973`, and exact-revision founder R4 approval was recorded in comment
`5032416230` before the authorized human merge. This evidence does not retroactively
validate PR #32.

## Boundaries and next gate

This package adoption does not revert or re-adopt any document. It authorizes only
preparation of the separate revert candidate after this lifecycle synchronization is
validly merged.

Codex may then prepare the separate revert candidate.
The revert and later fresh adoption each require their own exact-revision independent
verification and founder R4 approval before an authorized human merge. Automatic and
autonomous merge, deployment, production release, and RL1/RL2 activation remain
disabled. No historical approval, PR #33 evidence, or retrospective claim may satisfy
a future revert or fresh-adoption gate.
