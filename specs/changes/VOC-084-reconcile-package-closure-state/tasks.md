# VOC-084 — Tasks

## VOC-084-T00 — Record the immutable closure evidence inventory

- Requirements: `VOC-084-D00`, `VOC-084-D01`, `VOC-084-D03`
- Acceptance: `VOC-084-AC-00`
- Tests: `VOC-084-TEST-00`
- Evidence: `VOC-084-EV-00`
- Status: complete-exact-SHA-c6c13ed43418ba6faae70ce8c5e93f9674260859-merged-through-PR-121-with-hosted-and-post-merge-evidence

Create the package-local machine-readable inventory for every VOC-080 through VOC-083
task. Verify existing GitHub/repository evidence read-only. Record exact heads, PRs,
merge commits, reviews, hosted runs/applicability, rollback, post-merge results, and
historical FAILs. Enumerate every committed file in all four target packages and
classify each exactly once as `active-claim`, `historical`, or `prospective`, including
release plans and closure-evidence material. Add no validator or existing-package edits
yet.

The earlier exact SHA `080409ebc9beeb734f28123168803bfc28cbebfd` recorded FAIL on PR
#121 comment `5388123368`. Final exact SHA
`c6c13ed43418ba6faae70ce8c5e93f9674260859` then received PASS on comment `5388129185`,
merged as `91365f35c078171d98dd204134f20f9fb8eebef5`, and passed post-merge
CI/Governance/Security.

## VOC-084-T01 — Reconcile VOC-080 and VOC-081 active records

- Requirements: `VOC-084-D00` through `VOC-084-D03`
- Acceptance: `VOC-084-AC-01`
- Tests: `VOC-084-TEST-01`
- Evidence: `VOC-084-EV-01`
- Status: complete-exact-SHA-d83a94d20d4626613befde515619e60d2b954c18-merged-through-PR-122-after-preserving-FAIL-and-integrated-base-hosted-proof

Update the active lifecycle, task, acceptance, README, and directly contradictory
evidence wording for VOC-080 and VOC-081. Preserve historical drafting and failed-run
context. Repeat all inherited holds and limitations. Do not change runtime or living
settings guidance.

The earlier exact SHA `a350d965792b4a35bf6240d8995436bb931e259c` recorded FAIL on PR
#122 comment `5388262981`. Final exact SHA
`d83a94d20d4626613befde515619e60d2b954c18` then received PASS on comment `5388274788`,
passed exact-head hosted proof on comment `5388287562`, passed integrated-base hosted
proof on comment `5388313912`, merged as
`22563a40d033da2bc40a1ed18b2a09d326978ed7`, and passed post-merge
CI/Governance/Security.

## VOC-084-T02 — Reconcile VOC-082 and VOC-083 active records

- Requirements: `VOC-084-D00` through `VOC-084-D03`
- Acceptance: `VOC-084-AC-02`
- Tests: `VOC-084-TEST-02`
- Evidence: `VOC-084-EV-02`
- Status: complete-exact-SHA-9066d1563533739991b4cddf31857a0c7a485bb4-merged-through-PR-123-with-hosted-and-post-merge-evidence

Update the active lifecycle, task, acceptance, README, specification, and directly
contradictory evidence wording for VOC-082 and VOC-083. Preserve every exact-SHA FAIL
and its corrected PASS. Do not change evaluator, Worker, Sentry, workflow, or other
implementation behavior.

Exact SHA `9066d1563533739991b4cddf31857a0c7a485bb4` received PASS on PR #123 comment
`5388268060`, passed exact-head hosted proof on comment `5388287552`, merged as
`644387bf423f57919100f7ebab3122011d234e8a`, and passed post-merge
CI/Governance/Security on comment `5388302704`.

## VOC-084-T03 — Enforce static closure consistency

- Requirements: `VOC-084-D01`, `VOC-084-D03`, `VOC-084-D04`
- Acceptance: `VOC-084-AC-03`
- Tests: `VOC-084-TEST-03`, `VOC-084-TEST-04`
- Evidence: `VOC-084-EV-03`
- Status: complete-exact-SHA-5cb1196b4edc0658ba43c2f51ba88d8cbb872908-merged-through-PR-124-after-four-preserved-FAILs-and-final-hosted-post-merge-proof

Add the network-free foundation validator, targeted parsers, positive contract, and
independent negative fixtures. Wire it into the existing foundation aggregate through
`package.json`. Avoid workflow edits, dynamic GitHub calls, global word bans, or a
generic package state machine.

Exact SHAs `40cac438c4563baaf3510094ed81ab6efc162449`,
`228fd9a2e4bfda4afbf1358ecec574f1ef09aa20`,
`38b1fad18bc4d61b3c3a3a8cf557f0d54b3cf78e`, and
`9ba2cdd5872dc287d7c7fb5bce63ca9ff053cf76` each recorded independent FAILs on PR
#124 comments `5388399909`, `5388455163`, `5388532487`, and `5388623210`, with their
matching fail-closed Governance histories preserved on comments `5388401386`,
`5388457377`, `5388533878`, and `5388625103`. Final exact SHA
`5cb1196b4edc0658ba43c2f51ba88d8cbb872908` then received PASS on comment `5388671132`,
passed exact-head hosted proof on comment `5388686709`, merged as
`a578d287f9ce263e8bb3d8aa16dd8ef216e3d38c`, and passed post-merge
CI/Governance/Security on comment `5388700671`.

## VOC-084-T04 — Final verification, rollback, and issue closure record

- Requirements: all
- Acceptance: `VOC-084-AC-04`, `VOC-084-AC-05`
- Tests: `VOC-084-TEST-05`, `VOC-084-TEST-06`
- Evidence: `VOC-084-EV-04`, `VOC-084-EV-05`
- Status: candidate-local-validation-and-reverse-order-rollback-prepared-pending-different-role-review-hosted-proof-merge-post-merge-checks-and-issue-closure

Run full inventory and proportional repository validation, verify all task SHAs and
evidence links, rehearse reverse-order rollback, obtain different-role exact-SHA
review, and prove applicable hosted workflows. After the final merge and post-merge
checks, close issue #85 and issue #118 with repository-only evidence. Keep issue #119
and every inherited live hold open.

T00-T03 are already merged on `develop`, so T04 now starts from exact base
`a578d287f9ce263e8bb3d8aa16dd8ef216e3d38c`. In the candidate state before the T04 PR
merges, issue #85 and issue #118 remain open and may only have their exact
repository-only closure wording prepared. Issue #119 and VOC-080-HOLD-00/01/02 remain
open regardless of T04 validation.
