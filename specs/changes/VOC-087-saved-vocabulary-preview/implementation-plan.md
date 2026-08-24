# VOC-087 — Implementation Plan

## Preconditions and boundaries

Exact candidate `eea8d41447a9dc88125df546d62bd851bd4ad496` received different-actor
PASS with zero blockers and the accountable adoption decision. `change.yaml` now records
`status: adopted` and `implementation_authorized: true`. Do not implement yet: this
authorization becomes effective only after the adoption-bookkeeping revision receives
its own different-actor exact-SHA review and final hosted evidence, PR #137 normally
merges, and applicable post-merge checks pass. Candidate review never silently
transfers to this later bookkeeping SHA, whose future SHA/review/merge/post-merge facts
must not be invented inside the candidate commit.

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
   synthetic fixture mode for saved words. Only the existing
   `GET /api/v1/user-words` branch may return the exact `VOC-087-D06` response when
   parsed cookies contain `e2e_saved_words_fixture: "truncated-page"`. Keep the default
   `buildSavedWords(state)` behavior unchanged for every other cookie value and keep all
   mutation/other-endpoint behavior unchanged.
4. In `apps/web/tests/e2e/progress-accessibility.spec.ts`, add a bounded regression test
   receiving `{ page, baseURL }`. Fail clearly if `baseURL` is absent. Before any fixture
   request, call `page.context().addCookies` with
   `{ name: "e2e_saved_words_fixture", value: "truncated-page", url: baseURL }`. Then
   set `mockApiPort = Number(process.env.MOCK_API_PORT ?? 8080)` and call
   ``page.request.get(`http://127.0.0.1:${mockApiPort}/api/v1/user-words?limit=10`)``.
   Assert HTTP success, the exact `VOC-087-D06` rows/order, and exact cursor. Next call
   `page.goto("/progress")` and assert preview copy, absence of the false total, and the
   same exact list count/order/content. The request context associated with `page`
   shares the browser cookie jar; cookies are scoped by host/path rather than port, so
   the web-origin cookie is sent to the mock's `127.0.0.1` port. Navigation sends it to
   Next, where unchanged `createServerApiClient` copies the incoming `Cookie` header to
   the SSR mock fetch. Do not use `page.route` as proof of the server-side request. Add
   an explicit assertion for the default empty message while retaining existing axe,
   keyboard, and non-color-only coverage. Bind the unchanged one-page request boundary
   through exact-diff review because browser request events cannot see the SSR fetch.
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
The fixture chain uses existing browser-context cookie sharing and existing
`createServerApiClient` forwarding, so neither `apps/web/src/lib/api-server.ts` nor
`apps/web/playwright.config.ts` may change.
