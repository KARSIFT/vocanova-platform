# VOC-089 - Implementation Plan

Exact candidate `72847c42f3d34e91b24431f4dadfbcd5a9ac6fd8` received different-actor
PASS with zero blockers and the accountable adoption decision. `change.yaml` now
records `status: adopted` and `implementation_authorized: true`. Do not implement yet:
this authorization becomes effective only after the adoption-bookkeeping revision
receives its own different-actor exact-SHA review and final hosted evidence, PR #141
normally merges, and applicable post-merge checks pass. Candidate review never
silently transfers to this later bookkeeping SHA, whose future SHA/review/merge/post-
merge facts must not be invented inside the approved candidate commit.

## Target files and exact edit intent

Issue #140 directly names `change.yaml` and `tasks.md`. Read-only comparison with the
completed PR #137, PR #138, and issue #132 records proves that the VOC-087 README,
specification, acceptance criteria, impact analysis, implementation plan, and release
plan also contain active pending-state claims (not merely prospective contract text).
Those six files are therefore the only additional targets necessary to make the package
internally truthful. `test-plan.md` remains intentionally excluded because its
prospective procedures do not make a completed-gate claim.

Update only these existing VOC-087 package files:

- `specs/changes/VOC-087-saved-vocabulary-preview/change.yaml`
- `specs/changes/VOC-087-saved-vocabulary-preview/README.md`
- `specs/changes/VOC-087-saved-vocabulary-preview/specification.md`
- `specs/changes/VOC-087-saved-vocabulary-preview/acceptance-criteria.md`
- `specs/changes/VOC-087-saved-vocabulary-preview/impact-analysis.md`
- `specs/changes/VOC-087-saved-vocabulary-preview/implementation-plan.md`
- `specs/changes/VOC-087-saved-vocabulary-preview/release-plan.md`
- `specs/changes/VOC-087-saved-vocabulary-preview/tasks.md`

Do not edit VOC-087 product/test contract content except where the sentence is an
active stale lifecycle claim. Do not edit VOC-087 `test-plan.md` unless exact-diff
review finds a concrete active stale claim that cannot be corrected in the listed
files; if that happens, stop and return to planning.

## Required change.yaml updates

In VOC-087 `change.yaml`, make these active-state corrections:

- `implementation_authority_status`: replace the pending-effectiveness value with a
  completed value that cites PR #137 merge `61894b46705d0383028e2829903815477ea82939`
  and post-merge evidence comment `5390981903`.
- `dependencies[VOC-087-DEP-01].status` and evidence: record that adoption
  effectiveness is satisfied by final bookkeeping review, hosted final-head evidence,
  normal PR #137 merge, and post-merge checks.
- `implementation.authority_effective`: set to `true`.
- `implementation.status`: record completed VOC-087-T00 through PR #138 head
  `14e146deeab182b6e663986a113b4c25d102a7dc`, merge
  `ea357ce506f42fe74c7e88f670db9ce4f848d80e`, and post-merge evidence.
- `repository_adoption_status`: record adopted and effective after PR #137 merge and
  post-merge checks, including the PR #137 sequencing audit.
- `release.issue_closure`: record issue #132 closed after PR #138 completion evidence.
- `blocking_reasons`: replace the stale pending list with an empty completed-state
  representation such as `[]` or a clearly named `none-voc-087-completed` value.
- Add structured implementation and post-merge evidence fields if needed to keep the
  completed chain machine-readable.

Keep the VOC-087 risk, approved candidate SHA, automatic-merge setting, historical plan
review history, approvals, EHR state, action-specific authority state, and external
effects unchanged except for adding completed evidence references.

## Narrative-file updates

Update VOC-087 narrative files only where they actively report stale pending state:

- `README.md`: current status and final paragraph should state PR #137 and PR #138
  are complete and issue #132 is closed, while preserving historical review sequence.
- `specification.md`: replace current-effectiveness-pending wording with completed
  effectiveness and implementation facts.
- `acceptance-criteria.md`: update `Result: pending` entries to completed results
  backed by PR #138 and issue #132 closure evidence.
- `impact-analysis.md`: replace the active claim that adoption-bookkeeping exact-SHA
  review is still required with completed review, merge, and post-merge evidence while
  preserving the immutable initial FAIL and later PASS history.
- `implementation-plan.md`: mark the plan as historically executed through PR #138
  instead of saying implementation must not begin.
- `release-plan.md`: mark issue closure and post-merge evidence complete without
  inventing a release or deployment.
- `tasks.md`: mark `VOC-087-T00` complete and include exact PR #138, post-merge, and
  issue #132 closure evidence.

## Validation and handoff

Run only the proportional repository/governance checks for this record-only
implementation:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Do not run long product suites for this package-record-only correction unless the diff
unexpectedly touches application, test, package, or shared code paths. The PR must
record exact-SHA independent review before merge and post-merge CI/Governance/Security
evidence before issue #140 may close.

## Rollback

Rollback is a normal repository revert PR of the exact VOC-089 implementation commit.
The revert restores the previous VOC-087 package record text only. No deployment,
database, settings, branch, or live-system rollback exists or is needed.
