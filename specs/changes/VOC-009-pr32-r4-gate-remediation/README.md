# VOC-009 — PR #32 R4 Gate Remediation

## Identity and lifecycle

- Change ID: `VOC-009`
- Status: `completed`
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
Founder direction explicitly does not retroactively approve that merge. PR #32 remains
permanently recorded as procedurally invalid even though its content later returned
through a new valid adoption sequence.

PR #33 validly adopted exact package candidate
`3a9da8ded7e79711fc5ea0b8dbc83155b23dff41` into canonical `develop` at
`f28b670c0ea41577a91379e7d29618db38dd8a0a`. Deterministic and hosted checks
passed, exact-revision independent verification returned `PASS` in comment
`5031390973`, and exact-revision founder R4 approval was recorded in comment
`5032416230` before the authorized human merge. This evidence does not retroactively
validate PR #32.

PR #36 then reverted the complete 22-path PR #32 change. Exact candidate
`f846c54f19d5dcf45f30e584e84581d49539bd2e` received independent `PASS` in comment
`5038800736` and founder R4 approval in comment `5038911442` before its authorized
human merge at canonical `develop` commit
`8b88ea42de83f741f46555c3771eb26163f90a3d`.

PR #37 freshly re-presented the reviewed reconciliation with zero differences across
the 22 authorized paths. Exact candidate
`33fc2d9765cc50ff59a5a877e7a48b7e6fa8df4f` received independent `PASS` in comment
`5040056721` and founder R4 approval in comment `5042722711` before its authorized
human merge at canonical `develop` commit
`95408cc6e7dada087ec44d9d3a22bb3728820a06`.

## Completion and closure gate

The governed revert and fresh adoption are complete. Their verification and approval
evidence is distinct and no evidence retroactively validates PR #32. DOC-00 through
DOC-12 become authoritative only when this final lifecycle synchronization is validly
merged; downstream application planning remains paused until then.

Issue #29 remains open until that merge and may then close. Automatic/autonomous
merge, deployment, production release, RL1/RL2 activation, and autonomous production
release remain disabled. This completion grants no application implementation or
external-action authority.
