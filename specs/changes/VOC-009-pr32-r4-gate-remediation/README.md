# VOC-009 — PR #32 R4 Gate Remediation

## Identity and lifecycle

- Change ID: `VOC-009`
- Status: `proposed`
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

## Boundaries and next gate

This package preparation does not revert or re-adopt any document. It changes only the
package index and this nine-file proposed package. Package adoption itself requires
deterministic and hosted checks, exact-revision independent verification with no
blocking finding, exact-revision founder R4 approval, and authorized human merge.

Only after valid package adoption may Codex prepare the separate revert candidate.
The revert and later fresh adoption each require their own exact-revision independent
verification and founder R4 approval before an authorized human merge. Automatic and
autonomous merge, deployment, production release, and RL1/RL2 activation remain
disabled. No historical approval or retrospective claim may satisfy a future gate.
