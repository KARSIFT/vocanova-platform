# VOC-068 — Release Plan

## Release and deployment authorization

This package requests no new deployment authority. Once adopted and
implemented, each task's pull request follows the existing governed path:
independent review, then merge into `develop` per `merge-gate.yml`, then —
per AGENTS.md's "Release and deployment authority" section — automatic
promotion to `main` and automatic production deployment once this package's
task roster closes. This package does not alter any of that mechanism.

No production user-facing effect is expected: changes are confined to
`AGENTS.md`, the change-package template, and conditionally DOC-15 /
change-risk-classification docs.

**Note on this package's own `automatic_merge_allowed`:** as an unadopted
draft it correctly remains `false`. At adoption, the reviewing human should
set this package's field consistently with the rule this package itself
introduces (proposed R3 → per `VOC-068-DEP-01`). Leaving it `false` after
adoption without a stated reason would recreate the bug this package exists
to fix, for its own implementation PRs.

## Preconditions, monitoring, and outcome

Preconditions:

- Package adopted with `VOC-068-DEP-00`, `VOC-068-DEP-01`, and template-shape
  (open question 4) settled in writing.
- Implementation authorized.
- Independent verification PASS (or PASS WITH NON-BLOCKING FINDINGS) on the
  exact revision.

Monitoring after merge:

- Subsequent newly drafted packages' `change.yaml` values for
  `automatic_merge_allowed` relative to their declared risk (spot-check the
  next few plan PRs).
- Merge-gate decision text on those packages' task PRs: R0–R3 packages that
  did not deliberately opt out should no longer produce
  "this package's own change.yaml sets automatic_merge_allowed: false -
  requires founder approval" as the default outcome.
- No change expected in R4 hard-block behavior.

Outcome owner: implementer records T00/T01 evidence; adopting human owns the
policy decisions recorded at adoption.

## Rollback

Trigger: guidance weakens R4/EHR/verification, or creates contradictory docs,
or independent review fails closed on the exact revision.

Mechanism: revert the implementation commit(s) for AGENTS.md / template /
conditional DOC-15.

Validation: governance scripts pass on the reverted tree; template and
AGENTS.md match pre-change text.

Accountable owner: implementer of the reverted task(s).

Last-known-good reference: `AGENTS.md` and
`specs/templates/change-package/` revisions immediately preceding this
package's implementation merge.

## Independent verification, human approvals, and closure

Independent verification must confirm, against the exact implemented
revision's commit SHA:

- Adoption decisions for open questions were followed, not silently
  re-litigated by the implementer.
- `VOC-068-AC-00` through `VOC-068-AC-03` hold with linked evidence.
- Codex (or whichever model occupied `implementer`) did not approve or merge
  its own implementation.
- Active authority model remains `a003-active`.
- If DOC-15 was edited: R4 founder approval is recorded for that revision.
- If DOC-15 was not edited: option-a reconciliation evidence is present.
- No still-required EHR trigger applies.

Under active A-003, no standing technical-steward approval is assumed solely
because this work is proposed R3. If the path floor rises to R4 via DOC-15,
founder approval is mandatory for that consequence.

Repository merge into `develop` and production release/deployment are not the
same event as closure — closure requires this package's acceptance criteria
recorded as passing with linked evidence.
