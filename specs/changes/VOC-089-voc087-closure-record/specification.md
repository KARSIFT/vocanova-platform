# VOC-089 - Reconcile VOC-087 closure record with completed evidence: Specification

## Objective and requirement source

GitHub issue [#140](https://github.com/KARSIFT/vocanova-platform/issues/140) reports a
repository-governance truthfulness defect. At exact `develop` commit
`ea357ce506f42fe74c7e88f670db9ce4f848d80e`, the active VOC-087 package still says its
adoption effectiveness, implementation, and post-merge gates are pending even though
the plan PR, implementation PR, post-merge checks, and issue closure have completed.

Issue #140 grants planning authority only. This package is a draft until it receives
different-actor exact-revision plan review, accountable adoption, normal merge, and
applicable post-merge checks. It creates no implementation authority while draft.

## Scope

In scope:

- Correct active VOC-087 lifecycle and evidence claims that are now false because PR
  #137, PR #138, their applicable post-merge checks, and issue #132 closure completed.
- Record exact completed evidence from PR #137, PR #138, and issue #132.
- Mark VOC-087-T00 and VOC-087 acceptance criteria complete only to the extent proved
  by the exact merged implementation and its recorded evidence.
- Preserve every historical FAIL, PASS, adoption decision, expected Governance refresh
  block, and the PR #137 merge-sequencing incident as immutable history.

Out of scope:

- Product behavior, UI, API, schema, authentication, authorization, tests, fixtures,
  dependencies, workflow behavior, evaluator or validator logic, repository settings,
  Cloudflare, DNS, deployment, Sentry, server access, secrets, production data, `main`
  promotion, branch deletion, or live-system mutation.
- Creating new implementation authority for VOC-087 beyond recording that it already
  became effective and was used for the bounded PR #138 implementation.
- Closing issue #140 before the VOC-089 implementation PR merges and applicable
  post-merge checks pass.

## Requirements and decisions

- `VOC-089-D00` - Use only exact, completed GitHub evidence. The implementation may
  cite PR #137 merge `61894b46705d0383028e2829903815477ea82939`, PR #138 merge
  `ea357ce506f42fe74c7e88f670db9ce4f848d80e`, and issue #132 closure evidence. It may
  not invent a future hosted run, review, merge, deployment, or live result.
- `VOC-089-D01` - In `specs/changes/VOC-087-saved-vocabulary-preview/change.yaml`,
  update exactly the active stale fields for adoption effectiveness, implementation
  status, repository adoption status, blocking reasons, completed implementation
  evidence, issue closure, and dependency `VOC-087-DEP-01`. Keep `risk: R1`,
  `automatic_merge_allowed: true`, the approved candidate SHA, historical review
  history, and external-effect prohibitions intact.
- `VOC-089-D02` - In `specs/changes/VOC-087-saved-vocabulary-preview/tasks.md`, add a
  completed status/evidence entry for `VOC-087-T00`. The task must say the work
  completed through PR #138 and issue #132 closed after post-merge evidence; it must
  not imply another implementation PR is still pending.
- `VOC-089-D03` - Update only active stale status/evidence wording in the VOC-087
  README, specification, acceptance criteria, implementation plan, and release plan so
  they no longer say completed PR #137 or PR #138 gates remain pending. Preserve
  prospective requirements and deterministic test descriptions as historical plan
  contract text where they are still useful and true.
- `VOC-089-D04` - Preserve the exact historical sequence: initial plan FAIL at
  `cbede7d17e0883e0871d9921aaef781dee087f45`, amended candidate PASS at
  `eea8d41447a9dc88125df546d62bd851bd4ad496`, final bookkeeping PASS at
  `dd4db05be3473a1cc4a2cbb790b0276cb0fe0029`, implementation PASS at
  `14e146deeab182b6e663986a113b4c25d102a7dc`, and the PR #137 sequencing incident
  audit at comment `5390981903`.
- `VOC-089-D05` - The implementation diff must be repository-record only. If any
  target outside the listed VOC-087 package files is needed, stop and return to
  planning.

## Evidence anchors

| Event | Evidence |
| --- | --- |
| PR #137 final head | `dd4db05be3473a1cc4a2cbb790b0276cb0fe0029` |
| PR #137 merge | `61894b46705d0383028e2829903815477ea82939` |
| PR #137 final evidence | https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390946743 |
| PR #137 merge-sequencing audit and post-merge proof | https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903 |
| PR #138 implementation head | `14e146deeab182b6e663986a113b4c25d102a7dc` |
| PR #138 merge | `ea357ce506f42fe74c7e88f670db9ce4f848d80e` |
| PR #138 completion evidence | https://github.com/KARSIFT/vocanova-platform/pull/138#issuecomment-5391130488 |
| Issue #132 closure | https://github.com/KARSIFT/vocanova-platform/issues/132#issuecomment-5391130633 |

## Risk and protected areas

The semantic risk is R3 because the package corrects canonical lifecycle and evidence
records. A stale pending state can incorrectly block or confuse downstream planning;
a false completed state can incorrectly imply authority or closure. The implementation
does not change the VOC-087 product fix, authority model, governance enforcement,
validator, evaluator, workflow behavior, or external state.

Protected areas are the VOC-087 active package lifecycle record, acceptance state, task
state, historical review evidence, and issue-closure evidence.

## Review and authority

VOC-089 needs different-actor exact-revision plan review before adoption. The later
implementation needs a different non-author exact-SHA review, applicable hosted
evidence, normal merge, and post-merge checks. No founder or standing technical-steward
approval is required merely because this is R3. No action-specific external authority
or EHR is triggered by this repository-record-only scope.
