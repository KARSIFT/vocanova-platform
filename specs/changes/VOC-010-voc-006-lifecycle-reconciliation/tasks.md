# VOC-010 Tasks

## VOC-010-T01 — Verify corrected authority and base

Confirm issue #39, approval `5045859897`, superseded approval `5045604851`, live
`develop`, active A-003, instructions, and a clean tree.

## VOC-010-T02 — Prepare package-only adoption

Add exactly the nine package files and `specs/README.md` entry; edit no VOC-006 or
excluded path.

## VOC-010-T03 — Reproduce immutable history

Verify all PR #20/#21/#22/#24 and issue #19 states, SHAs, timestamps, verdicts,
comments, URLs, parents, and merges without trusting PR #24's proposed state.

## VOC-010-T04 — Inventory correction paths

After package adoption, find every directly stale VOC-006/index lifecycle claim and
derive the smallest complete allowlist.

## VOC-010-T05 — Reconcile VOC-006 lifecycle

In a separate PR, record completed F2-I03, exercised/exhausted authority, PR #22
evidence, PR #24 abandonment, issue #19 closure, and no later authority.

## VOC-010-T06 — Enforce exclusions and activation invariants

Prove excluded paths have zero diff and all six activation values remain disabled.

## VOC-010-T07 — Validate and prove rollback

Run all applicable deterministic, YAML/link, scope, risk, diff, lifecycle, and
reverse-apply/tree-equivalence checks for each stage.

## VOC-010-T08 — Publish and independently verify candidates

Create separate draft PRs, record exact base/head/files/evidence, obtain fresh
exact-SHA reports, and stop without self-approval or merge.

## VOC-010-T09 — Synchronize lifecycle and close correctly

After correction merge, separately record canonical completion evidence; close issue
#39 only after final synchronization merges.

## Traceability

Tasks `T01`–`T09` map to `AC-01`–`AC-12`. Package adoption performs `T01`, `T02`, the
package portion of `T03`, `T07`, and `T08`; it does not perform `T04`–`T06` or `T09`.
