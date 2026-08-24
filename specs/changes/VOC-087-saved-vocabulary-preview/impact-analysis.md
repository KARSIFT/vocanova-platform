# VOC-087 — Impact Analysis

## Consequence and affected surfaces

The learner-visible saved-vocabulary summary becomes truthful about its bounded data:
it describes a recent preview instead of an exact total. The existing list remains
useful, but the UI no longer under-reports learners who have more than 10 saved words.

| Area                           | Status       | Evidence or required work                                                                  |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------ |
| Product scope and UX           | Affected     | Localized copy/presentation correction on Progress only.                                   |
| Frontend and accessibility     | Affected     | Progress markup plus existing Playwright fixture/spec; semantic and axe coverage required. |
| Backend and API contracts      | Not affected | Existing `items`/optional `nextCursor` response and `limit: 10` call are preserved.        |
| Database and migrations        | Not affected | No schema, query, persistence, or migration change.                                        |
| Authentication/authorization   | Not affected | Existing server-client and auth redirect path are preserved.                               |
| Privacy, security, and secrets | Not affected | Synthetic fixtures only; no new collection, logging, secret, or live access.               |
| Analytics/telemetry            | Not affected | No event or measurement change.                                                            |
| AI/provider behavior           | Not affected | No AI surface.                                                                             |
| Infrastructure/deployment      | Not affected | Repository-only merge; no workflow/config/live mutation.                                   |
| Testing                        | Affected     | Existing deterministic Progress Playwright coverage is extended.                           |
| Documentation/operations       | Not affected | No living behavior document or runbook requires a change for this copy correction.         |

## Risks and mitigations

- `VOC-087-R00` — Copy still looks like a total. Mitigation: fixed preview wording and
  an automated negative assertion against `10 words saved` with a continuation cursor.
- `VOC-087-R01` — The fix hides or reorders words. Mitigation: assert 10 distinct rows,
  definitions, exactly-once rendering, and response order.
- `VOC-087-R02` — A test passes without proving truncation. Mitigation: the browser test
  sets exact cookie `e2e_saved_words_fixture=truncated-page`, reads the selected mock
  response through browser-context-associated `page.request`, asserts the full stable
  10-row/cursor contract, then proves Next SSR received the same cookie by rendering the
  same rows. Cookie scope and existing server-side forwarding are explicit; `page.route`
  is not treated as evidence for a server-side fetch.
- `VOC-087-R03` — Existing empty/accessibility/auth behavior regresses. Mitigation:
  explicit empty-state assertion, existing Progress accessibility checks, full Quality
  suite, and structural review that auth handling is unchanged.
- `VOC-087-R04` — Scope grows into a total-count API or all-page fetch. Mitigation:
  explicit exclusions, one-request invariant, file allowlist, and escalation before any
  cross-contract change.

## Dependencies and evidence

- `VOC-087-DEP-00`: the current API client exposes no authoritative saved-word total.
- `VOC-087-DEP-01`: adoption authorized implementation and became effective after PR
  #137 merged as `61894b46705d0383028e2829903815477ea82939` and post-merge checks
  passed:
  https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903.
- `VOC-087-EV-00`: focused fixture/preview regression output and exact diff.
- `VOC-087-EV-01`: rendered list count/order assertions.
- `VOC-087-EV-02`: empty-state, accessibility, auth-preservation, and Quality evidence.
- `VOC-087-EV-03`: local validation, hosted CI/Governance/Security/Quality, exact-SHA
  review, rollback rehearsal, merge, post-merge checks, and issue-closure link were
  recorded on PR #138 and issue #132:
  https://github.com/KARSIFT/vocanova-platform/pull/138#issuecomment-5391130488 and
  https://github.com/KARSIFT/vocanova-platform/issues/132#issuecomment-5391130633.

The initial exact plan candidate
`cbede7d17e0883e0871d9921aaef781dee087f45` received a preserved independent FAIL at
PR #137 comment `5390811909`. Amended exact candidate
`eea8d41447a9dc88125df546d62bd851bd4ad496` received final PASS at comment
`5390880861`, fully resolving the blocker. The prior FAIL remains immutable historical
evidence and is not approval. The adoption-bookkeeping revision later received its own
exact-SHA review, PR #137 merged, and its post-merge evidence was recorded at comment
`5390981903`, including the preserved merge-sequencing incident audit.

## Rollback impact

Rollback is a repository-only revert of the one implementation commit/PR. It restores
the misleading count presentation but requires no data recovery, migration reversal,
cache purge, Cloudflare action, or deployment. A failure to render the list, preserve
order, retain the empty state, or pass accessibility checks is an immediate rollback
trigger.
