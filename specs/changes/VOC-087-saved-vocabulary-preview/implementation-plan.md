# VOC-087 — Implementation Plan

## Preconditions and boundaries

Do not implement while `change.yaml` remains draft or
`implementation_authorized: false`. Before implementation, a different non-author
actor must review the exact plan candidate, blocking findings must be resolved, and the
plan PR must record the approved candidate SHA, review/approval evidence,
`status: adopted`, and `implementation_authorized: true` before merge. The final
adoption-bookkeeping revision must receive its own different-actor exact-SHA review if
it differs from the reviewed candidate; candidate review never silently transfers to a
later SHA.

No protected area is in scope. Re-read the target files and classify concurrent work
before editing. Any material conflict or need for an API/schema/auth/dependency/workflow
change stops implementation and returns to planning.

## One-PR implementation sequence

1. From the adopted `develop` revision, create one isolated short-lived implementation
   branch/worktree for `VOC-087-T00`.
2. In `apps/web/src/app/(app)/progress/page.tsx`, keep the existing API request and auth
   error path. For a non-empty response, replace the length-derived count with the exact
   heading/supporting copy in `VOC-087-D00`. Preserve the native list, keys, word and
   definition rows, empty-state text, and all unrelated Progress sections.
3. In `apps/web/tests/e2e/mock-api-server.mjs`, add a narrowly named cookie-selected
   synthetic fixture mode for saved words. Its response contains exactly 10 distinct,
   ordered items plus a non-empty `nextCursor`; the default stateful mock behavior stays
   unchanged for the rest of the suite.
4. In `apps/web/tests/e2e/progress-accessibility.spec.ts`, add a bounded regression test
   that selects the fixture, directly asserts its 10-item/cursor contract through the
   Playwright request context, visits Progress, and asserts preview copy, absence of the
   false total, and exact list count/order/content. Add an explicit assertion for the
   existing default empty message while retaining the existing axe, keyboard, and
   non-color-only coverage. Bind the unchanged one-page request boundary through exact-
   diff review because the server-to-server fetch is not visible to browser request
   events.
5. Format and run the focused test, full `pnpm validate`, governance checks, and diff
   checks in `test-plan.md`. Record exact commands and honest results in the PR.
6. Rehearse a repository-only revert in a disposable worktree and prove the authorized
   paths match the pre-implementation base. Remove the disposable worktree.
7. Obtain a different-actor review of the exact final SHA and passing hosted CI,
   Governance, Security, and Quality evidence. Resolve every blocker with a new SHA and
   fresh review/checks. A separate actor may merge normally into `develop`.
8. Attach final merge and applicable post-merge evidence to the same implementation PR.
   Only then may an accountable operator close issue #132 with links to the merged PR
   and post-merge evidence. No second code or evidence-only PR is planned.

## Compatibility and rollback

The API contract, request count, request limit, ordering, server component boundary,
auth redirect, and empty state remain compatible. The rollback target is the exact
`develop` commit immediately preceding the implementation. Use a normal revert PR if
rollback is required; never reset a protected branch or perform a live rollback.
