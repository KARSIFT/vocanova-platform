# VOC-088 — Implementation Plan

## Preconditions and boundaries

Do not implement this draft. Before implementation begins, a different non-author
actor must review the exact plan candidate, the accountable decision owner must adopt
that exact candidate, `change.yaml` must truthfully record adoption and
`implementation_authorized: true`, the plan PR must normally merge into `develop`, and
applicable post-merge checks must pass. Candidate review never transfers to a later
bookkeeping SHA; every material edit needs fresh exact-revision review.

The planned implementation is R2 with no protected path. Start from the exact adopted
`develop` revision in a new isolated short-lived branch/worktree. Re-read all eleven
target files and preserve concurrent compatible work. A conflict or need for any
twelfth file, schema/migration, scheduling, auth/session, dependency/generator,
workflow/governance, Wrangler/infrastructure, live, deployment, or `main` change stops
the task and returns to planning.

## One-PR implementation sequence

1. In `apps/api-worker/src/domain/content-learning.ts`, export the exact
   `WordReviewState` union from `VOC-088-D00` and add required nullable `reviewState`
   to `WordMeaning`. Do not add raw schedule fields.
2. In `apps/api-worker/src/content/repository.ts`, capture one ISO request clock inside
   `getWord`, extend the existing prepared meaning query with only `uw.status` and
   `uw.next_review_at`, and add a pure exhaustive mapper implementing `D01`. Preserve
   the bound `userId`, active-row predicate, query count/order, and example/note
   behavior. Unexpected active statuses throw rather than normalize silently.
3. In `apps/api-worker/test/content-review-parity.test.ts`, extend the existing fixed
   D1 harness with:

   - a table-driven projection test for absent, soft-deleted, every status, null,
     past, exact equality, and +1 ms boundaries;
   - negative assertions for raw `reviewStep`/`nextReviewAt` response fields;
   - two hashed, non-expiring synthetic session tokens attached to USER_A/USER_B,
     conflicting rows for the same meaning, and real authenticated route requests
     proving isolation while retaining anonymous `401`; and
   - a generated OpenAPI document assertion that canonical Word Meaning
     `reviewState` is required, nullable, and has the exact enum.

4. In `apps/api-worker/src/content/routes.ts`, register a named Zod enum and add its
   required nullable field to `WordMeaning`. Run the existing write command to update
   only `apps/api-worker/openapi/worker-foundation.openapi.json`; review the nested
   schema diff and keep operation metadata/unrelated schemas stable.
5. In `packages/api-client/src/index.ts`, mirror the exact exported union and required
   nullable property. Update the canonical-word fixture/assertion in
   `packages/api-client/src/index.test.ts`. Run package build/test to generate ignored
   declarations and prove consumption. Do not introduce code generation tooling.
6. In the existing Word Detail server page, add one exhaustive local display-copy
   mapper and render `Review state: <value>` only for a non-null state inside its
   meaning card. Preserve definitions, examples, usage notes, links, ordering, and the
   existing saved-only `SentenceFeedback` condition.
7. In `meaning-save-button.tsx`, use Next's router and invoke `router.refresh()` once
   only after a successful save or unsave, after confirmed local state/error handling.
   Keep payloads, CSRF, idempotency, labels, loading, failure copy, and mutation API
   unchanged; do not refresh on error.
8. In `apps/web/tests/e2e/mock-api-server.mjs`, make the default Word Detail response
   include `reviewState: null`/`due` from its stateful saved set. Add the bounded
   `e2e_word_detail_review_state` GET-only fixture selector from `D12`; preserve every
   other endpoint, mutation, cookie, and default session behavior.
9. In `discover-accessibility.spec.ts`, retain the existing Word Detail scan and add:

   - a table-driven SSR assertion for all seven fixture values and exact copy/absence,
     with saved/practice behavior and no raw enum/step copy;
   - axe, keyboard, and non-color-only evidence across existing 360 px, 430 px, and
     desktop projects; and
   - one isolated-session/CSRF functional round trip proving save -> refreshed due +
     sentence practice -> unsave -> refreshed absence. Include a failed-mutation case
     or a focused component-level substitute only if the existing E2E mock exposes a
     deterministic failure selector within the same file allowlist.

10. Run the focused commands first, then the complete applicable workspace/Worker/web
    validation in `test-plan.md`. Record exact output and any unavailable check
    honestly; do not substitute a placeholder pass.
11. In a disposable worktree, revert the exact implementation revision without
    committing and compare all eleven authorized paths to the pre-implementation base.
    Discard only the disposable worktree after recording tree equality.
12. Obtain a different-actor independent review of the exact final SHA and passing
    hosted CI, Governance, Security, and Quality evidence. Resolve any blocker with a
    new SHA and fresh checks/review. A separate non-author merge actor may merge
    normally into `develop` only after eligibility is proven. Attach merge and
    applicable post-merge evidence before issue closure.

## Compatibility, deployment, and rollback

The response change is additive: old JSON readers ignore the new property, while the
Worker/client/web revisions adopt it atomically. The field is required-nullable so new
readers never guess whether omission means unsaved or contract drift. Existing route,
auth, status codes, save/unsave payloads, review scheduling, and persistence remain
compatible.

This is repository implementation only. No Cloudflare preview/staging/production,
deployment, DNS, settings, secret, live-system, production-data, or `main` action is
permitted. The rollback target is the exact `develop` commit immediately preceding the
implementation. Use a normal revert PR; never reset a protected branch or perform a
live rollback. No data rollback exists because no write/schema/migration changes.
