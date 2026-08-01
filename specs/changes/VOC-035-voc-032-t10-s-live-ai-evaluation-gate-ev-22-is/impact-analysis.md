# VOC-035 — Impact Analysis

**Draft — not adopted.**

## Security and privacy

This package introduces one new secret class: a Gemini API key
(`AI_PROVIDER_API_KEY`'s value when `AI_PROVIDER=gemini`), transmitted only
via the `x-goog-api-key` request header to `generativelanguage.googleapis.com`
(or the configured `AI_PROVIDER_BASE_URL` override), never logged (mirroring
`OpenCodeFeedbackProvider`'s existing "never log the credential" discipline —
`gemini.go` must not `log`/`fmt.Print*` the key, the request body, or the
response body anywhere, matching `opencode.go`'s existing convention
confirmed by reading it in full at `base_sha`). A new network egress
destination is introduced: `generativelanguage.googleapis.com` (Google's own
infrastructure), distinct from the founder's own private OpenCode Docker
gateway — this is a genuinely new external dependency this package adds, not
a reuse of an existing egress path; it should be reviewed at adoption as part
of confirming the R3 proposal (a new third-party data processor for
learner-authored sentence text is itself a privacy-relevant fact, distinct
from the DOC-09 §21 payload-minimization question below).

Per DOC-09 §21, a moderation/feedback request may include only the learner
sentence, target word, and learner level (the existing
`ModerationInput`/`ProviderTask` shapes, unchanged by this package) — this
package's `GeminiFeedbackProvider`/`GeminiModerationProvider` must send
exactly that structured payload and nothing else (no name, email, session ID,
IP, or account history), matching the existing boundary the OpenCode path
already enforces. This is a design requirement stated here for the
implementer and reviewer to verify against the actual diff, not something
this drafting pass can itself confirm before code exists.

The moderation contract's fail-closed discipline (`VOC-035-D03`) is this
package's actual security-relevant surface, mirroring `VOC-034-D04`'s own
reasoning: Gemini's `responseSchema` parameter is a strong hint, not a
guarantee (per Google's own documentation, quoted in `specification.md`), so
server-side re-validation of the returned JSON is required, not optional —
an implementation that trusted `responseSchema` alone without re-parsing
would reintroduce the exact "trust an unvalidated provider output" class of
risk `VOC-034` was adopted specifically to close on the OpenCode side.

## Data and migrations

No schema change, no migration, no new table or column. This package changes
only Go application code (`apps/api/business/aifeedback/`,
`apps/api/app/api/`, `apps/api/cmd/eval-live/`) and a comment/possible new
line in `apps/api/.env.example`. No existing persistence path changes shape;
a sentence classified/graded via Gemini persists through `service.go`'s
existing, unchanged transaction path exactly as an OpenCode-classified
sentence does today, since both are behind the same provider-agnostic
`FeedbackProvider`/`ModerationProvider`/`SafetyClassifier` interfaces.

## Analytics and accessibility

None new. No analytics event is added, changed, or removed —
`service.go`'s existing telemetry calls (unchanged) already cover the
outcome switch regardless of which concrete provider produced the outcome;
this package does not add a "which provider served this request" telemetry
dimension, which is flagged here as a plausible, separately-scoped future
improvement (an operator who enables Gemini would currently have no
in-product telemetry distinguishing Gemini-served from OpenCode-served
feedback, only the deploy-time `AI_PROVIDER` configuration value itself) —
not decided or built in this draft's scope. No accessibility surface exists
in this package's scope — `apps/api/business/aifeedback`, `apps/api/app/api`,
and `apps/api/cmd/eval-live` are server-side/CLI only, no UI or user-facing
markup — evidence-backed non-applicability, confirmed by the planned
changed-file list.

## Risks, dependencies, and evidence

- `VOC-035-R00`: **Medium, flagged for follow-up, not resolved here.**
  Gemini's real-world latency and free-tier rate-limit behavior against
  DOC-09 §18's 8-second per-request budget and 10s total backend target are
  genuinely unknown until `VOC-035-T03`'s live run measures them — unlike
  OpenCode, where a paid/dedicated account's characteristics were at least
  partially known before `VOC-034` shipped. `VOC-035-D04` proposes the same
  retry-budget split OpenCode uses as a starting assumption, explicitly
  flagged as unconfirmed. If the live run shows the free tier cannot
  reliably meet the budget, that is itself a valid, informative outcome to
  record (mirroring the exact situation that motivated this package for
  OpenCode) — not a reason to silently loosen the budget or the test.
- `VOC-035-R01`: **Medium, flagged for adoption-time decision.** Google's
  Gemini free tier carries its own rate limits and terms of service distinct
  from the founder's paid OpenCode account; this package does not evaluate
  Gemini's terms of service for compatibility with processing real (if
  disposable-test-only, pre-launch) learner-authored sentence content.
  Flagged as an open question for the founder to confirm before
  `VOC-035-T03`'s live run processes any content beyond synthetic
  evaluation-set sentences (`GoldenSet()`'s existing, already-reviewed
  dataset, not real learner data) — the live evaluation task itself only
  ever sends the pre-existing golden evaluation-set sentences, never real
  user data, mirroring `VOC-032-T10`'s own OpenCode live run's scope exactly.
- `VOC-035-R02`: **Low.** Two independent provider integrations
  (`opencode.go`'s and `gemini.go`'s) now exist for the same two interfaces;
  a future prompt/schema change made to `task.go`/`moderation.go` (shared by
  both, per `VOC-035-D01`) automatically applies to both, but a
  provider-specific bug (e.g. a Gemini response-parsing edge case) could
  exist in only one adapter without the other being affected — this is the
  expected, intentional shape of "a real, alternative provider" rather than
  a defect; mitigated by `gemini_test.go`'s own dedicated coverage per
  `VOC-035-T00`.
- `VOC-035-R03`: **Low.** `VOC-035-D02`'s reuse of `AI_PROVIDER_BASE_URL` for
  a Gemini-specific meaning (ignored unless explicitly set, defaulting to
  Google's fixed endpoint) could confuse an operator who customized that
  variable for OpenCode and then switches `AI_PROVIDER` to `gemini` without
  resetting it, silently sending Gemini-shaped requests to their OpenCode
  host (which would simply fail with a connection or 404 error, not silently
  succeed against the wrong host, since the two APIs' paths and auth headers
  differ entirely) — mitigated by `.env.example`'s documentation of this
  exact case (`VOC-035-T01` step 4) and flagged for the adopting human to
  decide whether a stricter, separately-named variable is preferred instead
  (`VOC-035-D02`'s own open question).
- `VOC-035-DEP-00`, `VOC-035-DEP-01`: see `change.yaml`.
- `VOC-035-EV-00`: `go test ./apps/api/business/aifeedback/...` output
  showing `VOC-035-T00`'s new Gemini tests passing, plus every pre-existing
  test in the package passing unchanged.
- `VOC-035-EV-01`: `go test ./apps/api/app/api/... -run TestBuildAIProviders`
  output plus the `.env.example` diff showing comment/documentation-only
  changes (or, if `VOC-035-D02` is resolved toward a new variable at
  adoption, that single new variable's addition).
- `VOC-035-EV-02`: `go test ./apps/api/cmd/eval-live/...` output showing the
  new provider-selection tests passing alongside the pre-existing
  `cmd/eval-live` test suite, if any, passing unchanged.
- `VOC-035-EV-03`: `git diff --name-only <base_sha>...<candidate_sha>`
  confirming the diff matches `VOC-035-AC-09`'s declared file list exactly.
- `VOC-035-EV-04`: `VOC-035-T03`'s live-Gemini-evaluation record in
  `staging-evidence.md`.
- `VOC-035-EV-05`: exact-SHA independent Claude Code verification per PR,
  per `CLAUDE.md`.
