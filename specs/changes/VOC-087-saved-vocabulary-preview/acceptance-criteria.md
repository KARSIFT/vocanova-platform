# VOC-087 — Acceptance Criteria

## VOC-087-AC-00 — A truncated page is presented as a preview, not a total

- Requirements: `VOC-087-D00`, `D01`, `D06`
- Task: `VOC-087-T00`
- Tests: `VOC-087-TEST-00`, `TEST-01`
- Evidence: `VOC-087-EV-00`
- Result: pending

Given the deterministic saved-word fixture returns exactly 10 items and a non-empty
continuation cursor, when Progress renders that response, then the section is named
`Recently saved vocabulary`, displays `A preview of up to 10 recently saved words.`,
and does not display `10 words saved` or any other claim that the page length is the
learner's total.

## VOC-087-AC-01 — Preview rows and order are preserved

- Requirements: `VOC-087-D02`, `D06`
- Task: `VOC-087-T00`
- Tests: `VOC-087-TEST-00`, `TEST-02`
- Evidence: `VOC-087-EV-01`
- Result: pending

Given the 10-item fixture has distinct, known words in a declared order, when Progress
renders it, then all 10 words and definitions appear exactly once in the same order
inside the saved-vocabulary list. No subsequent cursor page is requested.

## VOC-087-AC-02 — Empty, accessible, and authenticated behavior is preserved

- Requirements: `VOC-087-D03`, `D04`, `D05`
- Task: `VOC-087-T00`
- Tests: `VOC-087-TEST-03`, `TEST-04`
- Evidence: `VOC-087-EV-02`
- Result: pending

Given the default empty fixture, Progress retains the existing empty-state message.
For empty and non-empty states, section heading/list semantics remain valid and the
configured Progress accessibility assertions pass. Existing unauthenticated failure
handling still redirects through the unchanged `/progress` return path.

## VOC-087-AC-03 — The correction remains bounded and reversible

- Requirements: `VOC-087-D01`, `D04`, `D07`
- Task: `VOC-087-T00`
- Tests: `VOC-087-TEST-05`, `TEST-06`
- Evidence: `VOC-087-EV-03`
- Result: pending

The final diff changes only the authorized Progress presentation and existing
Playwright fixture/spec, introduces no API/schema/dependency/workflow/live effect,
passes proportional local and hosted checks, receives different-actor exact-SHA review,
and can be reverted to its pre-implementation tree. Issue #132 remains open until the
implementation merges into `develop` and applicable post-merge checks pass.
