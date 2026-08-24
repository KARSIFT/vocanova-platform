# VOC-088 — Show Backend-Authoritative Review State on Word Detail: Specification

## Objective and requirement source

Correct issue #139 by exposing and rendering the authenticated learner's current,
backend-derived Word Detail review state. DOC-03 section 1 says the frontend never
invents scheduling state, and section 6 requires saved meanings to show a state such
as due, learning, or mastered. DOC-05 section 9 defines the authoritative fields and
the due predicate. DOC-06 sections 7–8 require requester-scoped authorization and
typed prepared D1 access. DOC-07 requires explicit DTOs and a generated committed
OpenAPI contract. DOC-08 requires SSR through the Worker API and WCAG 2.2 AA behavior.

Issue #139 grants planning authority only. Implementation remains prohibited until a
different actor independently reviews the exact plan revision, the accountable
decision owner adopts it, adoption bookkeeping is complete, and the plan PR normally
merges with applicable post-merge checks.

## Scope and non-goals

In scope:

- Add one normalized review-state field to every Word Detail meaning returned by the
  existing authenticated canonical-word endpoint.
- Derive the field from the requester's active `user_words.status`,
  `next_review_at`, and `deleted_at` using one injected repository clock instant.
- Carry the exact enum/nullability through the Worker domain type, Zod/OpenAPI schema,
  regenerated committed OpenAPI artifact, maintained API-client source, and generated
  TypeScript declarations.
- Render exact, text-based state copy in the existing server-rendered Word Detail
  meaning card.
- Refresh server-rendered data after successful save/unsave so the projection and
  existing sentence-practice visibility follow the backend-confirmed state.
- Add deterministic D1, authenticated requester-isolation, OpenAPI, API-client, mock,
  and Playwright coverage.

Out of scope:

- Changing the scheduling algorithm, review steps, rating transitions, due-queue
  endpoint, review session, mission/progress counters, or save/unsave persistence.
- Adding or changing a D1 table, column, constraint, migration, seed, or production
  data conversion.
- Returning raw `review_step`, `next_review_at`, `last_result`, `last_rating`, counts,
  or any schedule interval in the Word Detail DTO.
- Adding another endpoint, a review action on Word Detail, calendar-relative copy,
  countdowns, timezone/day calculations, localization infrastructure, analytics, or
  telemetry.
- Introducing an OpenAPI client-code generator or dependency. The existing maintained
  API-client source remains the source edited in this repository; `tsc` generates its
  untracked build declarations.
- Changing authentication, authorization, sessions, cookies, CSRF, idempotency,
  privacy/retention policy, infrastructure, Wrangler configuration, workflows,
  governance, repository settings, Cloudflare state, deployment, live systems,
  production data, `main`, or issue closure before implementation evidence completes.

## Requirements and decisions

- `VOC-088-D00` — Add the exported domain/client union
  `WordReviewState = "due" | "new" | "learning" | "reviewing" | "mastered" | "not_reviewing"`.
  Every `WordMeaning` returned by `GET /api/v1/canonical-words/{wordSlug}` must contain
  the required property `reviewState: WordReviewState | null`. It is never omitted.
- `VOC-088-D01` — The projection must use the following exhaustive mapping. “Active
  requester row” means `user_words.user_id` equals the authenticated requester,
  `meaning_id` equals the returned meaning, and `deleted_at IS NULL`.

  | Persisted condition at the request clock                                  | `saved` | `userWordId` | `reviewState`   |
  | ------------------------------------------------------------------------- | ------: | ------------ | --------------- |
  | No active requester row, including a soft-deleted row                     | `false` | omitted      | `null`          |
  | `status` in `new/learning/reviewing` and `next_review_at IS NULL`         |  `true` | present      | `due`           |
  | `status` in `new/learning/reviewing` and `next_review_at <= now`          |  `true` | present      | `due`           |
  | `status = new` and `next_review_at > now`                                 |  `true` | present      | `new`           |
  | `status = learning` and `next_review_at > now`                            |  `true` | present      | `learning`      |
  | `status = reviewing` and `next_review_at > now`                           |  `true` | present      | `reviewing`     |
  | `status = mastered`, regardless of `next_review_at`                       |  `true` | present      | `mastered`      |
  | `status = ignored` or `status = archived`, regardless of `next_review_at` |  `true` | present      | `not_reviewing` |

- `VOC-088-D02` — Due is an instant, not a local-calendar classification. The
  repository must capture `this.now().toISOString()` once at the start of `getWord`
  and use that same value for every meaning in the response. Equality is due. One
  millisecond after the clock is not due. The web must say `Due now`, not calculate or
  claim `Due today`.
- `VOC-088-D03` — The `getWord` prepared query must select only the requester's active
  row and the minimum new projection inputs (`uw.status`, `uw.next_review_at`) beside
  the existing `uw.id`. It must not remove the `uw.user_id = ?1` or
  `uw.deleted_at IS NULL` predicates, read another learner's state, add a cross-user
  fallback, or expose raw scheduling inputs in the public response.
- `VOC-088-D04` — The mapper must derive `saved`, `userWordId`, and `reviewState` from
  the same joined row. An impossible status outside the DOC-05/check-constraint enum
  must fail rather than be labelled as another valid learner state. It must not use a
  module-level mutable clock or request-state cache.
- `VOC-088-D05` — The Hono Zod schema must make `reviewState` required and nullable
  with exactly the six public enum values in `D00`. Running the existing
  `openapi:write` command must regenerate
  `apps/api-worker/openapi/worker-foundation.openapi.json`; `openapi:check` must prove
  the committed artifact matches the runtime schema. The existing operation ID,
  path, status, parameters, and all unrelated shapes remain unchanged.
- `VOC-088-D06` — `packages/api-client/src/index.ts` must export the same union and
  required nullable property. Its canonical-word client test must consume a response
  with a non-null state and assert that state. `pnpm run build:packages` must regenerate
  and type-check the ignored `dist` declarations. No new generator, dependency, or
  committed generated client directory is part of this package.
- `VOC-088-D07` — Word Detail must render state only when `reviewState` is non-null,
  inside the corresponding meaning card and adjacent to its definition/save control.
  Exact visible copy is `Review state: Due now`, `Review state: New`,
  `Review state: Learning`, `Review state: Reviewing`, `Review state: Mastered`, or
  `Review state: Not in review`. The prefix and value must be actual text in the
  accessibility tree; state must not depend on color, an icon, tooltip, title
  attribute, or raw enum text alone. A static SSR value needs no live-region role.
- `VOC-088-D08` — An unsaved meaning (`reviewState: null`) must render no
  `Review state:` row. It keeps the existing Save control and does not render sentence
  practice. Every saved state keeps the existing Saved/unsave control,
  `userWordId`, and sentence-practice entry. Meaning/example/usage-note content and
  ordering remain unchanged.
- `VOC-088-D09` — After either existing save or unsave mutation succeeds,
  `MeaningSaveButton` must preserve its confirmed local button/error behavior and call
  `router.refresh()` once. The refreshed server response becomes authoritative:
  saving the current DOC-05 row (`status=new`, `next_review_at=null`) shows
  `Review state: Due now` and sentence practice; unsaving removes both. A failed
  mutation must not refresh or change the prior saved state.
- `VOC-088-D10` — Deterministic repository coverage must use fixed clock
  `2026-08-24T12:00:00.000Z` and prove null, exact-equality, one-millisecond-future,
  past/future, mastered, ignored, archived, soft-deleted, and cross-user cases. It must
  also prove raw `reviewStep` and `nextReviewAt` are absent from Word Detail meanings.
- `VOC-088-D11` — Authenticated HTTP coverage must create distinct valid sessions for
  two seeded users with different active states for the same meaning, call the real
  canonical-word route with each session cookie, and prove each response contains only
  that requester's projection. The existing anonymous `401` assertion remains.
- `VOC-088-D12` — The browser mock must add the required `reviewState` property to its
  default Word Detail response (`null` when unsaved and `due` when saved) and a
  cookie-selected, GET-only fixture controlled by
  `e2e_word_detail_review_state`. Allowed values are `unsaved`, `due`, `new`,
  `learning`, `reviewing`, `mastered`, and `not-reviewing`; they map to null or the
  corresponding DTO enum. The override must not change another endpoint or mutation,
  and the existing default session state remains stateful. A separate exact cookie
  `e2e_word_detail_save_failure=1` may make only `POST /api/v1/user-words` return the
  existing stable `500` test problem before mutation; it must not affect DELETE,
  canonical-word GET, another endpoint, or a request without that cookie.
- `VOC-088-D13` — Focused Playwright coverage must assert unsaved, due/new,
  learning/reviewing, mastered, and not-in-review visible behavior at all configured
  Discover viewports, retain zero critical/serious axe findings, keyboard reachability,
  and non-color-only text, and prove the default save -> refresh -> due/sentence
  practice -> unsave -> refresh -> no-state/no-practice round trip with an isolated
  synthetic session and CSRF cookie.
- `VOC-088-D14` — The implementation is one pull request with the exact eleven-file
  allowlist in `change.yaml`. If implementation needs an API-client generator, schema,
  migration, auth/session change, scheduling behavior, new dependency, workflow,
  governance, Wrangler/infrastructure, live access, or any twelfth file, it must stop
  and return to planning rather than expand incidentally.
- `VOC-088-D15` — Issue #139 remains open through plan adoption and implementation
  work. It may close only after the implementation merges normally into `develop`,
  applicable post-merge checks pass, and the issue receives links to the exact final
  review, hosted evidence, merge SHA, and post-merge results.

## Risk, security, privacy, data, analytics, accessibility, and performance

The planned implementation is R2: a cross-component, backward-compatible API addition
with moderate coordination and contract/accessibility evidence. It exposes no new
recipient or category of learner data: the authenticated endpoint already returns the
same requester's saved flag and user-word identifier, and the new value is a minimized
projection of that same row. Requester isolation is nevertheless a mandatory security
test. No secret, raw schedule, learner content, production data, log, analytics event,
or telemetry is allowed.

No schema or migration changes. The query retains one canonical-word lookup, one
meaning query, and the existing bounded example/note queries. It adds two columns to
the existing requester-scoped join and an in-memory constant-time mapping per meaning;
no extra D1 request, N+1 query, network request, or client-side scheduling inference is
allowed. Accessibility and mutation coherence are explicit acceptance dimensions.

No current evidence triggers EHR or action-specific external authority. Risk must be
raised before implementation if a protected technical/data effect is discovered.

## Assumptions and resolved repository discrepancy

DOC-07/DOC-08 describe the client types as deriving from OpenAPI. The current base has
a generated committed OpenAPI artifact but no OpenAPI-to-client source generator;
`packages/api-client/src/index.ts` is maintained manually and `tsc` generates ignored
build declarations. This package records that repository fact, updates both maintained
contract mirrors with deterministic drift/type checks, and excludes introducing a new
generator. That broader documentation/tooling discrepancy is not silently treated as
authority to expand issue #139.

There are no material open questions in this draft. Independent plan review may reject
or amend a decision; any material amendment creates a new plan-author revision that
requires fresh exact-SHA review.
