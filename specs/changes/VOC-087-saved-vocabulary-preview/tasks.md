# VOC-087 — Tasks

## VOC-087-T00 — Correct and prove the saved-vocabulary preview

- Requirements: `VOC-087-D00` through `VOC-087-D08`
- Acceptance criteria: `VOC-087-AC-00` through `VOC-087-AC-03`
- Tests: `VOC-087-TEST-00` through `VOC-087-TEST-06`
- Evidence: `VOC-087-EV-00` through `VOC-087-EV-03`
- Risk: R1
- Status: pending-adoption; implementation unauthorized

In one implementation PR, make the Progress saved-vocabulary section explicitly a
recent, up-to-10 preview and remove its page-length-as-total claim. Add the deterministic
10-item-plus-continuation-cursor fixture selected only by
`e2e_saved_words_fixture=truncated-page` on the saved-word GET. Prove both the direct
`page.request` response and the identical browser → Next → mock SSR selection while
preserving the list, response order, empty state, accessibility, auth path, API
contract, and single-page request boundary.

The same PR must carry exact local commands/results, rollback rehearsal, different-
actor exact-SHA review, hosted CI/Governance/Security/Quality results, normal merge
evidence, and a final post-merge evidence comment. Issue #132 closes only after merge
and applicable post-merge checks pass. No follow-up implementation or ceremony-only
package-record PR is part of this task.

The task must stop and return to planning if implementation requires any file outside
the three declared affected paths. An API/schema/auth/dependency/workflow/governance/
live-system change is never an incidental extension of this task.
