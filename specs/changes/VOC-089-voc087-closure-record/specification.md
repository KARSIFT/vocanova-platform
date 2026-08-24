# VOC-089 - Reconcile VOC-087 closure record with completed evidence: Specification

## Objective and requirement source

GitHub issue [#140](https://github.com/KARSIFT/vocanova-platform/issues/140) reports a
repository-governance truthfulness defect. At the issue baseline `develop` commit
`ea357ce506f42fe74c7e88f670db9ce4f848d80e`, and again on the refreshed planning base
`66c2cd20ab7197dd9af34dc2b78a4d03b2c5b48d`, the active VOC-087 package still says its
adoption effectiveness, implementation, and post-merge gates are pending even though
the plan PR, implementation PR, post-merge checks, and issue closure have completed.

Issue #140 granted planning authority only. Exact candidate
`72847c42f3d34e91b24431f4dadfbcd5a9ac6fd8` has since received different-actor
independent PASS and the accountable adoption decision. Implementation authorization is
recorded by the adopted package, but PR #141 did not make that authorization effective:
its final pre-merge Governance adapter decision was blocked before the later exact
bookkeeping review was posted and before the evidence binder was populated. VOC-089
implementation authority is inactive pending the prospective VOC-091 recovery boundary.

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
- Closing issue #140 before VOC-091 recovery completes and the later refreshed PR #147
  implementation merges with its own applicable post-merge checks.

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
  README, specification, acceptance criteria, impact analysis, implementation plan,
  and release plan so they no longer say completed PR #137 or PR #138 gates remain
  pending. Preserve prospective requirements and deterministic test descriptions as
  historical plan contract text where they are still useful and true.
- `VOC-089-D04` - Preserve the exact historical sequence: initial plan FAIL at
  `cbede7d17e0883e0871d9921aaef781dee087f45`, amended candidate PASS at
  `eea8d41447a9dc88125df546d62bd851bd4ad496`, final bookkeeping PASS at
  `dd4db05be3473a1cc4a2cbb790b0276cb0fe0029`, implementation PASS at
  `14e146deeab182b6e663986a113b4c25d102a7dc`, and the PR #137 sequencing incident
  audit at comment `5390981903`.
- `VOC-089-D05` - The implementation diff must be repository-record only. If any
  target outside the listed VOC-087 package files is needed, stop and return to
  planning.

## VOC-091 authority-recovery overlay

The requirements above remain the inactive future contract for `VOC-089-T00` and the
eight-file PR #147 implementation. They are not deleted, broadened, or repurposed by
the recovery overlay.

PR [#141](https://github.com/KARSIFT/vocanova-platform/pull/141) merged as
`925faf774ded5128c8aef2a298a8d6f506164ee0`, but the normal activation boundary failed.
At `2026-08-24T11:33:44Z`, Governance run
[`32722390643`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722390643)
reported `decision: "blocked"`, `eligible: false`, and exactly these reason codes:
`review.identity_missing`, `review.stale`, `review.not_passing`,
`review.blocking_findings`, and `review.evidence_missing`. The later exact bookkeeping
review
[5394643309](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394643309)
did not populate the PR body's single binder or produce a later pre-merge
`eligible: true` / `reasons: []` adapter result. The merge-readiness comment
[5394657645](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394657645)
was inaccurate when it said run `32722390643` passed merge eligibility.

Post-merge CI
[`32722900390`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900390),
Governance
[`32722900352`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900352),
and Security
[`32722900426`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900426)
passed on the merge SHA, but those valid post-merge facts are non-retroactive. The
independent incident audit
[5394825877](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394825877)
therefore records the active conclusion: the adoption decision remains valid
authorization evidence, `implementation_authorized: true` remains true, and
implementation authority is not effective until VOC-091 recovery prospectively passes
its own exact review, populated binder, literal pre-merge `eligible: true` /
`reasons: []`, normal merge, and applicable post-merge checks.

The preserved PR #137 precedent remains distinct. Its audit
[5390981903](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903)
records that PR #137 had genuine pre-merge `eligible: true` / `reasons: []` evidence
before its disclosed sequencing incident. PR #141 lacked that eligible gate. PR #147
therefore remains draft and blocked under
[5394841275](https://github.com/KARSIFT/vocanova-platform/pull/147#issuecomment-5394841275)
until recovery completes; no current PR #147 SHA, check, review, or binder transfers.

## Evidence anchors

| Event                                               | Evidence                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| PR #137 final head                                  | `dd4db05be3473a1cc4a2cbb790b0276cb0fe0029`                                      |
| PR #137 merge                                       | `61894b46705d0383028e2829903815477ea82939`                                      |
| PR #137 final evidence                              | https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390946743   |
| PR #137 merge-sequencing audit and post-merge proof | https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903   |
| PR #138 implementation head                         | `14e146deeab182b6e663986a113b4c25d102a7dc`                                      |
| PR #138 merge                                       | `ea357ce506f42fe74c7e88f670db9ce4f848d80e`                                      |
| PR #138 completion evidence                         | https://github.com/KARSIFT/vocanova-platform/pull/138#issuecomment-5391130488   |
| Issue #132 closure                                  | https://github.com/KARSIFT/vocanova-platform/issues/132#issuecomment-5391130633 |

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
implementation needs VOC-091 recovery first, then a refreshed PR #147 with different
non-author exact-SHA review, applicable hosted evidence, genuine pre-merge
`eligible: true` / `reasons: []`, normal merge, and post-merge checks. No founder or
standing technical-steward approval is required merely because this is R3. No
action-specific external authority or EHR is triggered by this repository-record-only
scope.
