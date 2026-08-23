# VOC-084 — Tasks

## VOC-084-T00 — Record the immutable closure evidence inventory

- Requirements: `VOC-084-D00`, `VOC-084-D01`, `VOC-084-D03`
- Acceptance: `VOC-084-AC-00`
- Tests: `VOC-084-TEST-00`
- Evidence: `VOC-084-EV-00`
- Status: blocked-by-plan-adoption

Create the package-local machine-readable inventory for every VOC-080 through VOC-083
task. Verify existing GitHub/repository evidence read-only. Record exact heads, PRs,
merge commits, reviews, hosted runs/applicability, rollback, post-merge results, and
historical FAILs. Add no validator or existing-package edits yet.

## VOC-084-T01 — Reconcile VOC-080 and VOC-081 active records

- Requirements: `VOC-084-D00` through `VOC-084-D03`
- Acceptance: `VOC-084-AC-01`
- Tests: `VOC-084-TEST-01`
- Evidence: `VOC-084-EV-01`
- Status: blocked-by-T00

Update the active lifecycle, task, acceptance, README, and directly contradictory
evidence wording for VOC-080 and VOC-081. Preserve historical drafting and failed-run
context. Repeat all inherited holds and limitations. Do not change runtime or living
settings guidance.

## VOC-084-T02 — Reconcile VOC-082 and VOC-083 active records

- Requirements: `VOC-084-D00` through `VOC-084-D03`
- Acceptance: `VOC-084-AC-02`
- Tests: `VOC-084-TEST-02`
- Evidence: `VOC-084-EV-02`
- Status: blocked-by-T00

Update the active lifecycle, task, acceptance, README, specification, and directly
contradictory evidence wording for VOC-082 and VOC-083. Preserve every exact-SHA FAIL
and its corrected PASS. Do not change evaluator, Worker, Sentry, workflow, or other
implementation behavior.

## VOC-084-T03 — Enforce static closure consistency

- Requirements: `VOC-084-D01`, `VOC-084-D03`, `VOC-084-D04`
- Acceptance: `VOC-084-AC-03`
- Tests: `VOC-084-TEST-03`, `VOC-084-TEST-04`
- Evidence: `VOC-084-EV-03`
- Status: blocked-by-T01-and-T02

Add the network-free foundation validator, targeted parsers, positive contract, and
independent negative fixtures. Wire it into the existing foundation aggregate through
`package.json`. Avoid workflow edits, dynamic GitHub calls, global word bans, or a
generic package state machine.

## VOC-084-T04 — Final verification, rollback, and issue closure record

- Requirements: all
- Acceptance: `VOC-084-AC-04`, `VOC-084-AC-05`
- Tests: `VOC-084-TEST-05`, `VOC-084-TEST-06`
- Evidence: `VOC-084-EV-04`, `VOC-084-EV-05`
- Status: blocked-by-T03

Run full inventory and proportional repository validation, verify all task SHAs and
evidence links, rehearse reverse-order rollback, obtain different-role exact-SHA
review, and prove applicable hosted workflows. After the final merge and post-merge
checks, close issue #85 and issue #118 with repository-only evidence. Keep issue #119
and every inherited live hold open.
