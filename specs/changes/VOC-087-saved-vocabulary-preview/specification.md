# VOC-087 — Truthful saved-vocabulary preview on Progress: Specification

## Objective and requirement source

Correct the misleading saved-vocabulary summary reported by GitHub issue #132. At the
drafting base, Progress requests `listSavedWords({ limit: 10 })`; the response is
cursor-paginated and has no total count; and the page renders `savedWords.length` as
`N word(s) saved`. For learners with more than 10 saved words, the resulting
`10 words saved` claim under-reports their vocabulary and appears authoritative.

Issue #132 authorized planning only. Exact candidate
`eea8d41447a9dc88125df546d62bd851bd4ad496` has since received independent PASS and the
accountable adoption decision. Implementation authorization is recorded by the adopted
package but becomes effective only after the bookkeeping revision receives its own
exact-SHA review and hosted evidence, PR #137 normally merges into `develop`, and
applicable post-merge checks pass.

## Scope and non-goals

In scope:

- Make the non-empty Progress section explicitly a preview of recently saved
  vocabulary, bounded to the already-requested maximum of 10 items.
- Remove every presentation path that treats the returned page length as an
  authoritative saved-vocabulary total.
- Preserve the existing saved-word rows, API response order, empty state, semantic
  section/list structure, and authentication redirect behavior.
- Extend the existing deterministic Playwright mock and Progress spec with a response
  containing exactly 10 distinct ordered items and a non-empty continuation cursor.

Out of scope:

- Adding a total-count field, changing an API/client/repository contract, or changing
  database/schema behavior.
- Fetching all pages, following `nextCursor`, adding pagination controls, or changing
  the existing one-request `limit: 10` boundary.
- Reordering, deduplicating, filtering, or otherwise transforming saved words.
- Redesigning Progress or Home, changing another Progress statistic, or introducing a
  component/test framework.
- Authentication, authorization, analytics, telemetry, deployment, Cloudflare,
  repository settings, secrets, production data, live access, `main` promotion, or
  issue closure before implementation merge and post-merge checks.

## Requirements and decisions

- `VOC-087-D00` — For a non-empty response, the section heading must be
  `Recently saved vocabulary` and its supporting text must be
  `A preview of up to 10 recently saved words.` This copy is intentionally independent
  of `items.length` and `nextCursor` because neither is an authoritative total.
- `VOC-087-D01` — The page must not render `items.length` as a saved-word total or use
  any equivalent claim such as `N words saved`, including when the response has fewer
  than 10 items or omits a continuation cursor.
- `VOC-087-D02` — Every returned item, up to the existing request limit, must remain in
  the rendered list exactly once and in response order. The UI must not fetch another
  page or imply that the preview is the complete collection.
- `VOC-087-D03` — An empty response must keep the existing empty-state message:
  `No saved words yet. Save words from a journey to track your vocabulary here.` No
  preview-supporting copy is required when there are no items.
- `VOC-087-D04` — The existing server API client, `limit: 10` request, API/schema,
  saved-word repository ordering, `requireAuthRedirect(error, "/progress")` behavior,
  and return path must remain unchanged.
- `VOC-087-D05` — The section must retain an accessible heading association and native
  list semantics; the Progress page must continue to pass the existing critical/serious
  axe, keyboard-reachability, and non-color-only assertions at all configured Quality
  viewports.
- `VOC-087-D06` — The regression fixture must expose exactly 10 distinct ordered saved
  items defined in the deterministic fixture contract below and the exact non-empty
  `nextCursor` `e2e-saved-words-after-10`. The override is selected only when cookie
  `e2e_saved_words_fixture=truncated-page` is present on
  `GET /api/v1/user-words`; it must not affect POST, DELETE, another endpoint, or the
  default stateful saved-word response. The test must assert the direct fixture
  contract, rendered preview copy, absence of `10 words saved`, the same 10 rendered
  rows in order, and the default empty state.
- `VOC-087-D07` — One implementation PR owns code, tests, validation, exact-revision
  review, hosted evidence, rollback evidence, merge, and its final PR evidence comment.
  Issue #132 closes only after that merge and applicable post-merge checks pass; no
  ceremony-only follow-up code or package-evidence PR is required.
- `VOC-087-D08` — The fixture test must establish the whole SSR selection chain without
  changing `api-server.ts` or `playwright.config.ts`: use
  `page.context().addCookies` with the exact cookie name/value and `url: baseURL` before
  any fixture request; use browser-context-associated `page.request.get` against
  `http://127.0.0.1:${Number(process.env.MOCK_API_PORT ?? 8080)}/api/v1/user-words?limit=10`;
  then call `page.goto("/progress")`. Cookies are scoped by host and path, not port, so
  the cookie established for configured web `baseURL` on `127.0.0.1` is also sent by
  `page.request` to the mock on `127.0.0.1`. Navigation sends the same cookie to Next;
  existing `createServerApiClient` reads the incoming `Cookie` header and copies it to
  the server-to-server mock API fetch, selecting the identical fixture during SSR.
  `page.route` and browser request events are not proof of that server-side fetch.

## Deterministic truncated-page fixture contract

The selected response is exactly `{ items, nextCursor: "e2e-saved-words-after-10" }`.
Each row has `partOfSpeech: "noun"`, `status: "saved"`, `source: "journey"`, and
`saved: true`. `wordSlug` equals `wordText`. Stable row-specific values, in required
response/render order, are:

| #   | `userWordId`               | `meaningId`              | `wordId`              | `wordText`    | `shortDefinition`                               | `addedAt`                  |
| --- | -------------------------- | ------------------------ | --------------------- | ------------- | ----------------------------------------------- | -------------------------- |
| 01  | `e2e-preview-user-word-01` | `e2e-preview-meaning-01` | `e2e-preview-word-01` | `arrival`     | `the act of reaching a place`                   | `2026-01-10T00:00:00.000Z` |
| 02  | `e2e-preview-user-word-02` | `e2e-preview-meaning-02` | `e2e-preview-word-02` | `baggage`     | `bags carried while travelling`                 | `2026-01-09T00:00:00.000Z` |
| 03  | `e2e-preview-user-word-03` | `e2e-preview-meaning-03` | `e2e-preview-word-03` | `counter`     | `a long flat surface for service`               | `2026-01-08T00:00:00.000Z` |
| 04  | `e2e-preview-user-word-04` | `e2e-preview-meaning-04` | `e2e-preview-word-04` | `departure`   | `the act of leaving a place`                    | `2026-01-07T00:00:00.000Z` |
| 05  | `e2e-preview-user-word-05` | `e2e-preview-meaning-05` | `e2e-preview-word-05` | `gate`        | `the place where passengers board`              | `2026-01-06T00:00:00.000Z` |
| 06  | `e2e-preview-user-word-06` | `e2e-preview-meaning-06` | `e2e-preview-word-06` | `luggage`     | `bags used for travelling`                      | `2026-01-05T00:00:00.000Z` |
| 07  | `e2e-preview-user-word-07` | `e2e-preview-meaning-07` | `e2e-preview-word-07` | `passport`    | `an official document for international travel` | `2026-01-04T00:00:00.000Z` |
| 08  | `e2e-preview-user-word-08` | `e2e-preview-meaning-08` | `e2e-preview-word-08` | `queue`       | `a line of people waiting`                      | `2026-01-03T00:00:00.000Z` |
| 09  | `e2e-preview-user-word-09` | `e2e-preview-meaning-09` | `e2e-preview-word-09` | `reservation` | `an arrangement to keep a place`                | `2026-01-02T00:00:00.000Z` |
| 10  | `e2e-preview-user-word-10` | `e2e-preview-meaning-10` | `e2e-preview-word-10` | `terminal`    | `an airport building for passengers`            | `2026-01-01T00:00:00.000Z` |

## Risk and protected areas

The planned implementation is R1: a small, backward-compatible, independently
reversible presentation correction with a narrow learner-facing blast radius. The
implementation paths have an R1 classifier floor and do not touch a protected area.
The plan-package-only diff is path-classified R0, which does not reduce the planned
behavioral risk.

Escalation is mandatory before implementation if the solution requires an API/schema
change, authentication or privacy behavior, shared contract change, new dependency,
workflow/governance edit, infrastructure or deployment action, or a broader product
decision.

## Security, privacy, data, analytics, accessibility, and performance

Authentication and existing personal-data access remain unchanged. The test fixture
uses synthetic `.test`-quality data only. No secret, learner record, production data,
new log, analytics event, or telemetry is allowed. There is no migration or persistence
effect. Accessibility is an explicit regression dimension under `VOC-087-D05`.
Performance remains bounded to the existing single request for at most 10 items; the
implementation must not introduce another request or cursor traversal.

## Review and authority

The plan and implementation each require a different, attributable non-author reviewer
bound to the exact reviewed SHA. The author may not review, approve, or merge their own
revision. R1 supplies no founder or standing technical-steward approval requirement.
No EHR trigger or action-specific external authority applies to this repository-only
scope.
