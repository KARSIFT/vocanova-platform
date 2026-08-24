# VOC-088 — Impact Analysis

## Consequence and affected surfaces

The existing authenticated Word Detail response becomes capable of representing the
backend-authoritative review state it already owns. The web then satisfies DOC-03
without exposing internal scheduling detail or inferring state from a raw step.

| Area                                 | Status                        | Evidence or required work                                                                                  |
| ------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Product scope and UX                 | Affected                      | Implements already-approved DOC-03 section 6 behavior with exact copy; no new flow.                        |
| Worker domain/repository             | Affected                      | Adds a minimized projection from the existing requester-scoped D1 join and one injected clock.             |
| API schema/OpenAPI                   | Affected                      | Backward-compatible required-nullable nested response property; regenerate the committed artifact.         |
| API client                           | Affected                      | Mirror the enum/property in maintained source, compile generated declarations, and test consumption.       |
| Frontend/SSR                         | Affected                      | Render exact text per meaning and refresh after confirmed save/unsave.                                     |
| Accessibility                        | Affected                      | Text-labelled, non-color-only state plus existing axe/keyboard coverage at all configured viewports.       |
| Database/schema/migrations           | Not affected                  | Reads existing `status`, `next_review_at`, and `deleted_at`; no DDL, seed, migration, or write change.     |
| Scheduling/review sessions           | Not affected                  | Existing due predicate and transitions are reused, not changed; no Word Detail review action.              |
| Authentication/authorization         | Not affected but verified     | Same authenticated route and `uw.user_id = requester` join; real-session isolation tests are mandatory.    |
| Privacy/personal data                | Minimally affected projection | Same requester/same row, reduced six-state projection, no new recipient/raw schedule/log/retention effect. |
| Save/unsave/sentence practice        | Affected regression surface   | Mutation contracts stay unchanged; server refresh keeps derived state/practice coherent.                   |
| Analytics/telemetry                  | Not affected                  | No event, log field, metric, or tracking change.                                                           |
| AI/provider behavior                 | Not affected                  | Sentence feedback provider and payload remain untouched.                                                   |
| Performance                          | Minimally affected            | Two selected columns and constant mapping; no added D1/network request or client calculation.              |
| Infrastructure/Cloudflare/deployment | Not affected                  | No binding/config/workflow/resource/live action; repository-only implementation PR.                        |
| Documentation/governance             | Not affected                  | Implements existing DOC-03/DOC-05 meaning; no living-doc or policy change.                                 |

## Risks and mitigations

- `VOC-088-R00` — Due boundary drifts from DOC-05. Mitigation: one captured injected
  UTC clock, explicit `<=` equality, null/past/exact/+1 ms cases, and reuse of the due
  queue's canonical status set.
- `VOC-088-R01` — Due incorrectly overrides a terminal/inactive status. Mitigation:
  due precedence is restricted to `new`, `learning`, and `reviewing`; mastered and
  ignored/archived cases are explicit.
- `VOC-088-R02` — Another learner's state leaks through the content join. Mitigation:
  preserve the bound requester predicate and soft-delete predicate; test two real
  sessions with conflicting states/IDs for the same meaning.
- `VOC-088-R03` — Worker/OpenAPI/client shapes diverge. Mitigation: one named union,
  runtime OpenAPI shape assertion, regenerated artifact check, contract drift check,
  API-client compile/test, and exact-diff review.
- `VOC-088-R04` — The UI exposes raw enum/step or relies on color. Mitigation: fixed
  copy table, no raw schedule fields, actual text prefix/value, axe, keyboard, and
  non-color-only assertions.
- `VOC-088-R05` — Save/unsave leaves stale SSR state or sentence-practice visibility.
  Mitigation: refresh exactly after confirmed mutations and exercise the full stateful
  round trip; never refresh on failure.
- `VOC-088-R06` — A broad mock override makes unrelated browser tests pass falsely.
  Mitigation: one named cookie, exact allowed values, canonical-word GET only, default
  stateful behavior unchanged, and direct/SSR fixture assertions.
- `VOC-088-R07` — Scope grows into generator/tooling, schema, scheduling, or auth work.
  Mitigation: eleven-file allowlist, explicit stops, one PR, and mandatory replanning
  before any twelfth path/protected effect.
- `VOC-088-R08` — Required nested field surprises a client. Mitigation: JSON addition
  is backward compatible for existing readers, every response contains a stable value,
  TypeScript/web consumers update atomically, and contract tests run before merge.

## Dependencies and evidence

- `VOC-088-DEP-00`: approved DOC-03/DOC-05 behavior and current DOC-06/07/08 runtime
  boundaries.
- `VOC-088-DEP-01`: verified reduced DTO/query/UI at exact drafting base.
- `VOC-088-DEP-02`: independent plan review and accountable adoption; pending.
- `VOC-088-EV-00`: fixed-clock exhaustive repository mapping output and exact diff.
- `VOC-088-EV-01`: real-session authenticated isolation and anonymous denial output.
- `VOC-088-EV-02`: OpenAPI generation/check, schema assertion, contract check,
  API-client compile/test, and artifact diff.
- `VOC-088-EV-03`: cookie-fixture SSR copy/list/content/accessibility results.
- `VOC-088-EV-04`: stateful save/refresh/practice/unsave/failure regression output.
- `VOC-088-EV-05`: full validation, exact file inventory, rollback rehearsal,
  different-actor exact-SHA review, hosted checks, merge, post-merge, and issue link.

## Risk classification and protected areas

R2 is the highest identified class: the implementation is a cross-component API
addition with contract, D1 integration, security-isolation, and accessibility evidence.
No protected path or semantic R3 effect is planned. The response remains authenticated
and returns a minimized projection only to the row owner; it does not redesign access
control or sensitive-data handling. If implementation changes a recipient, raw data
exposure, auth policy, schema/migration, infrastructure, workflow, or another protected
effect, work stops and risk is reclassified before edits continue.

R2 does not create founder or standing technical-steward approval. It does require
proportionate deterministic evidence and different-actor exact-revision review. No EHR
or action-specific external authority is currently triggered.

## Rollback impact

Rollback is a normal repository revert of the single implementation PR to its exact
pre-implementation `develop` base. It restores the reduced Word Detail response/UI but
does not require a database restore, migration reversal, data repair, cache purge,
Cloudflare action, secret, or deployment. Trigger on requester-isolation failure,
wrong boundary/state copy, missing/stale save/practice behavior, contract drift,
accessibility regression, performance/query expansion, or any scope breach.
