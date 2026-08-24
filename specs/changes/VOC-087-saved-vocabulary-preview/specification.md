# VOC-087 — Truthful saved-vocabulary preview on Progress: Specification

## Objective and requirement source

Correct the misleading saved-vocabulary summary reported by GitHub issue #132. At the
drafting base, Progress requests `listSavedWords({ limit: 10 })`; the response is
cursor-paginated and has no total count; and the page renders `savedWords.length` as
`N word(s) saved`. For learners with more than 10 saved words, the resulting
`10 words saved` claim under-reports their vocabulary and appears authoritative.

Issue #132 authorizes planning only. Implementation begins only after this package has
an exact-revision independent PASS, complete adoption bookkeeping, and a reviewed merge
into `develop`.

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
  items and a non-empty `nextCursor`. The test must assert that fixture contract, the
  rendered preview copy, the absence of `10 words saved`, the 10 rendered rows in
  order, and the default empty state.
- `VOC-087-D07` — One implementation PR owns code, tests, validation, exact-revision
  review, hosted evidence, rollback evidence, merge, and its final PR evidence comment.
  Issue #132 closes only after that merge and applicable post-merge checks pass; no
  ceremony-only follow-up code or package-evidence PR is required.

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
