# VOC-088 — Acceptance Criteria

## VOC-088-AC-00 — Word Detail returns the exact normalized state at one clock instant

- Requirements: `VOC-088-D00` through `D04`, `D10`
- Tasks: `VOC-088-T00`
- Tests: `VOC-088-TEST-00`, `TEST-01`
- Evidence: `VOC-088-EV-00`
- Result: pending

Given fixed repository clock `2026-08-24T12:00:00.000Z`, when the authenticated
requester's active row is exercised across every DOC-05 status and time boundary,
then Word Detail contains the required `reviewState` property with the exact `D01`
mapping. Null or exact-equality schedules for active review statuses are `due`; one
millisecond later is the underlying `new`, `learning`, or `reviewing` state;
`mastered` is never overridden by due; and `ignored`/`archived` normalize to
`not_reviewing`. A soft-deleted or absent requester row produces `saved: false`, no
`userWordId`, and `reviewState: null`. No raw step or schedule field appears.

## VOC-088-AC-01 — Authenticated requester isolation is preserved

- Requirements: `VOC-088-D03`, `D04`, `D11`
- Tasks: `VOC-088-T00`
- Tests: `VOC-088-TEST-02`
- Evidence: `VOC-088-EV-01`
- Result: pending

Given two valid sessions and two different active `user_words` rows for the same
meaning, when each session calls the real
`GET /api/v1/canonical-words/{wordSlug}` route, then each `200` response carries only
that requester's `saved`, `userWordId`, and `reviewState`. Neither response contains
the other learner's identifier/state, and the existing unauthenticated call remains
`401`.

## VOC-088-AC-02 — OpenAPI and the API client expose one identical stable contract

- Requirements: `VOC-088-D00`, `D05`, `D06`
- Tasks: `VOC-088-T01`
- Tests: `VOC-088-TEST-03`, `TEST-04`
- Evidence: `VOC-088-EV-02`
- Result: pending

The runtime Hono schema, generated committed OpenAPI document, maintained API-client
source, and generated TypeScript declaration all represent `reviewState` as required,
nullable, and limited to the same six enum strings. The canonical-word operation ID,
path, parameters, status, and unrelated fields do not change. OpenAPI generation/check,
retired-contract drift check, API-client test, and package type generation pass without
a new dependency or generator.

## VOC-088-AC-03 — SSR renders exact accessible learner copy for every projection

- Requirements: `VOC-088-D07`, `D08`, `D12`, `D13`
- Tasks: `VOC-088-T02`
- Tests: `VOC-088-TEST-05`, `TEST-06`
- Evidence: `VOC-088-EV-03`
- Result: pending

Given each declared cookie-selected Word Detail fixture, when the existing SSR route
renders, then unsaved displays no `Review state:` row, while the saved fixtures display
exactly one corresponding row: `Due now`, `New`, `Learning`, `Reviewing`, `Mastered`,
or `Not in review`. Saved fixtures retain the Saved/unsave control and sentence
practice. The text is present in the accessibility tree, no state depends on color,
the existing meaning/example/note structure remains, and configured viewport axe and
keyboard assertions pass.

## VOC-088-AC-04 — Save, unsave, and sentence practice remain backend-coherent

- Requirements: `VOC-088-D08`, `D09`, `D12`, `D13`
- Tasks: `VOC-088-T02`
- Tests: `VOC-088-TEST-07`
- Evidence: `VOC-088-EV-04`
- Result: pending

Given an isolated synthetic session starts with the meaning unsaved and a valid CSRF
cookie, when the learner saves it through the existing control, then the confirmed
button state is Saved, exactly one router refresh re-reads the backend, `Review state:
Due now` appears, and the existing sentence-practice entry appears. When the learner
unsaves it, the confirmed state returns to Save, one refresh occurs, and both the state
row and sentence-practice entry disappear. A forced mutation failure preserves the
prior state and performs no refresh.

## VOC-088-AC-05 — The correction is bounded, reversible, and fully qualified

- Requirements: `VOC-088-D14`, `D15`
- Tasks: `VOC-088-T00`, `T01`, `T02`
- Tests: `VOC-088-TEST-08`, `TEST-09`
- Evidence: `VOC-088-EV-05`
- Result: pending

The final implementation diff contains only the eleven authorized files, changes no
schema/migration/auth/scheduling/dependency/workflow/config/live state, passes focused
and full applicable validation, and can be reverted in a disposable worktree to the
pre-implementation tree. A different non-author actor records PASS on the exact final
SHA with no unresolved blocker and hosted checks pass before normal merge. Issue #139
remains open until merge and applicable post-merge checks are attached.
