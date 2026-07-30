# VOC-034 — Wire a Real Moderation Provider into Production AI Feedback: Specification

**Draft — not adopted. Nothing in this document authorizes implementation.**

## Objective and requirement source

Restore real AI-feedback generation on the production `POST /api/v1/sentence-feedback`
route. Today it is 100% fail-closed for ordinary content: every sentence that does not
match a deterministic local weapon/self-harm pattern returns the business error
`SAFETY_MODERATION_UNAVAILABLE`, and the real feedback provider is never called.

Requirement authority: GitHub issue
[#216](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/216), opened
2026-07-30 after a founder/operator staging exercise. The issue's own live evidence
(2026-07-30T20:26:55Z): a direct request through the private staging OpenCode server
succeeded with `opencode-go/hy3` and returned structured JSON; staging was then
correctly configured (`AI_PROVIDER=opencode`, a private Docker-gateway base URL, a
non-empty bearer, `AI_PROVIDER_MODEL=opencode-go/hy3`, `AI_FEATURES_ENABLED=true`); a
disposable non-production identity successfully saved a word and completed a review,
then the real API's `POST /api/v1/sentence-feedback` returned HTTP 200 with the
business error `SAFETY_MODERATION_UNAVAILABLE`, and no `learner_sentences` or
`ai_feedback_attempts` row was created. Blocks
`KARSIFT/vocanova-platform-sandbox#185` (VOC-032-T09) per the issue's "Relationship"
section; distinct from VOC-032-T10's live threshold evaluation, which exercises the
provider adapter directly rather than the product route this package fixes.

### Root cause (confirmed by direct inspection at `base_sha`)

`apps/api/app/api/production.go:426-451`'s `NewProductionAPI` constructs the
production `aifeedback.Service` and passes a literal `nil` as the third argument
(`safety SafetyClassifier`) to `aifeedback.NewService`:

```go
aifeedbackSvc := aifeedback.NewService(
    aifeedback.NewPostgreSQLRepository(db, clk),
    aiProvider,
    nil,   // <-- safety SafetyClassifier
    nil,
    learningIdem,
    ...
)
```

`apps/api/business/aifeedback/service.go:86-88`'s `NewService` replaces a `nil`
`safety` argument with:

```go
safety = NewCompositeSafetyClassifier(NewDefaultLocalAbuseChecker(), nil)
```

`apps/api/business/aifeedback/safety.go:142-149`'s
`CompositeSafetyClassifier.Classify` runs the deterministic local abuse checker
first; for any sentence that does not match a local pattern, it checks whether a
provider is configured:

```go
if c.provider == nil {
    return &SafetyResult{Outcome: SafetyModerationUnavailable, Reason: "no moderation provider configured"}, nil
}
```

There is no `nil` provider anywhere in this chain by accident of missing
configuration — `apps/api/business/aifeedback/opencode.go`'s
`OpenCodeFeedbackProvider` (the real production adapter already used for feedback
generation, confirmed at `opencode.go:384`: `var _ FeedbackProvider = (*OpenCodeFeedbackProvider)(nil)`)
implements `FeedbackProvider` only. `apps/api/business/aifeedback/aifeedback.go:180-184`'s
`ModerationProvider` is a distinct, narrower interface
(`Classify(ctx, ModerationInput) (*ModerationResult, error)`), and nothing in the
repository implements it against the real OpenCode API. `production.go` has no
`AI_PROVIDER_MODERATION_*`-style env var to read even if it wanted to build one. This
is a pure code-wiring defect: **no staging environment variable can fix it**, matching
the issue's own conclusion.

## Scope and non-goals

In scope:

1. A new `OpenCodeModerationProvider` in `apps/api/business/aifeedback/` implementing
   `ModerationProvider` against the same real `opencode serve` session/message HTTP
   API `OpenCodeFeedbackProvider` already uses, with its own strict, injection-resistant
   system/developer prompt and output schema (`VOC-034-D04`).
2. Wiring that provider into `apps/api/app/api/production.go`'s production
   `CompositeSafetyClassifier`, replacing the literal `nil` at the exact call site
   above, via a new `buildAIProviders` helper that mirrors this file's existing
   `buildEmailSender`/`buildOAuthProvider` fallback-logging pattern (`VOC-034-D00`).
3. A shared, behavior-preserving internal HTTP-transport extraction inside
   `opencode.go` so the new moderation provider does not duplicate
   `OpenCodeFeedbackProvider`'s session-creation, retry, and error-mapping logic
   (`VOC-034-D01`).
4. Deterministic unit tests for every outcome mapping (allowed, allowed_sensitive,
   blocked, self_harm_intervention) and every fail-closed path (timeout, auth
   failure, malformed output, unrecognized/unknown outcome, provider refusal).
5. A production-wiring regression test proving an ordinary safe sentence clears
   moderation and reaches the real feedback-provider seam through the same
   construction path `NewProductionAPI` uses, at the same HTTP route the defect
   manifested on (`VOC-034-D06`).
6. A minimal, accuracy-only `.env.example` comment update noting the existing
   `AI_PROVIDER_*` variables are now read for moderation as well as feedback
   (`VOC-034-D05`) — no new environment variable.
7. A post-merge live-staging-verification task and evidence document, required to
   actually unblock VOC-032-T09 (the issue's own requirement item 8).

Explicitly out of scope (non-goals):

- Any change to `apps/api/business/aifeedback/service.go`'s orchestration logic.
  `service.go:205-248`'s safety-classification step, outcome switch, and telemetry
  calls are already correct and require no change — confirmed by direct reading at
  `base_sha`; the defect is upstream of this code, in how `production.go` constructs
  the classifier it's handed. This package's diff must not touch `service.go`.
- Any change to `apps/api/business/aifeedback/safety.go`'s
  `CompositeSafetyClassifier`/`DefaultLocalAbuseChecker` logic. Both are already
  correct (local checks run first, provider errors already map to
  `SafetyModerationUnavailable`, a `nil` provider already fails closed rather than
  defaulting to allowed) — this package supplies the missing provider, it does not
  change how the classifier uses one.
- Any new environment variable, new kill switch, or new `ServiceConfig` field. The
  moderation provider reuses the existing `AI_PROVIDER_BASE_URL` /
  `AI_PROVIDER_API_KEY` / `AI_PROVIDER_MODEL` / `AI_PROVIDER_TIMEOUT` configuration
  already read for feedback (`VOC-034-D02`).
- A distinct, independently-configurable moderation model or timeout. Flagged as an
  open question for a future package if ever needed — not decided here either way
  beyond "not built in this scope."
- Any change to the public API contract, DTOs, or error codes.
  `ErrorCodeSafetyModerationUnavailable` (`SAFETY_MODERATION_UNAVAILABLE`) keeps its
  existing meaning and continues to fire correctly for a genuine provider outage —
  this package makes the *ordinary* case reach the real provider instead of always
  hitting the fail-closed path; it does not remove the fail-closed path itself.
- Any full `NewProductionAPI` + real-Postgres (sqlmock) end-to-end HTTP test. See
  `VOC-034-D06` for the chosen, smaller-diff test level and the explicit trade-off
  this leaves open for review.
- Reconciling the combined moderation+feedback latency budget against DOC-09 §18's
  10s total backend target. Flagged as `VOC-034-R00`, deferred to VOC-032-T10's own
  live threshold evaluation, which is explicitly a separate task per the issue's
  "Relationship" section.
- Any live staging deployment performed by this planning pass, and any change to
  `.github/workflows/*`. `VOC-034-T03`'s live verification runs after this package's
  own code merges and the existing `deploy-staging` pipeline (already proven working
  per VOC-032-T09's partial rehearsal evidence) redeploys it.

## Risk and protected areas

`docs/governance/change-risk-classification.md`'s R3 row explicitly names
**"AI-provider controls"** as one of its defining criteria, independent of path
matching. This package adds a new production adapter that calls a real external
LLM provider with learner-authored content and makes a safety/moderation decision
that gates whether that content ever reaches a paid model call and whether the
resulting output is shown to a learner — this is squarely an AI-provider-controls
and safety-consequence change, proposed as **R3** on semantic grounds regardless of
which exact files end up in the diff.

Path-based floor, confirmed directly against this package's anticipated file set
using `scripts/governance/classify-change-risk.sh --files-from` at draft time
(2026-07-30):

```
R1  apps/api/business/aifeedback/safety.go        (unchanged by this package — listed only if touched)
R1  apps/api/business/aifeedback/opencode.go
R1  apps/api/business/aifeedback/moderation.go     (new)
R1  apps/api/business/aifeedback/moderation_test.go (new)
R1  apps/api/business/aifeedback/opencode_test.go
R1  apps/api/app/api/production.go
R1  apps/api/app/api/production_test.go
R1  apps/api/app/api/aifeedback_test.go
R3  apps/api/.env.example
Detected path-based risk floor: R3
Paths establishing the floor:
  - apps/api/.env.example
```

None of the `.go` files this package touches match this repository's R3 glob list
(`*/auth/*`, `*/payments/*`, `*/migrations/*`, `packages/ai/*`, etc. — `aifeedback`
is not a path-matched name); the automated floor reaches R3 only because `VOC-034-D05`
touches `apps/api/.env.example` (which matches the classifier's `*/.env.*` rule).
Per this repository's own `CLAUDE.md` ("raise the class when path rules miss a
protected or R4 consequence"), this package proposes R3 on the semantic AI-provider/
safety-consequence grounds above, not merely because of the `.env.example` coincidence
— if a future revision of this package ended up not touching `.env.example` for any
reason, the risk proposal would remain R3 unchanged. Nothing in scope touches an R4
path (`CODEOWNERS`, `.github/workflows/governance-policy.yml`,
`scripts/governance/*`, `docs/governance/amendments/*`, etc.) or an R4 consequence (no
pricing, legal, or public-launch decision). This is a proposal for a human to review
at adoption time, not a determination — the repository's own path-based floor and a
human's own judgment govern the implemented tasks, not this proposal.

Protected areas touched: `apps/api/business/aifeedback/*` (new provider file, new
test file, a behavior-preserving internal refactor of the existing
`opencode.go`/`opencode_test.go`), `apps/api/app/api/production.go` and
`production_test.go` (new helper, new tests), `apps/api/app/api/aifeedback_test.go`
(new regression test), `apps/api/.env.example` (comment-only). Active governance
model: A-003 (routine R3, strengthened controls, independent verification — see
`CLAUDE.md`). No EHR trigger; no R4 consequence in scope.

## Decisions

`VOC-034-D00` — **Resolved.** Fix the wiring defect by extracting a new
`buildAIProviders(cfg ProductionConfig) (aifeedback.FeedbackProvider, aifeedback.SafetyClassifier)`
helper in `production.go`, mirroring the existing `buildEmailSender`/
`buildOAuthProvider` fallback-logging pattern (T14/T15's own established convention
in this same file). It replaces today's inline `aiProvider := ...` block and the
literal `nil` passed as `safety`. When `cfg.APIProvider == string(aifeedback.ProviderOpenCode)`
and `cfg.APIKey != ""`, it returns a real `OpenCodeFeedbackProvider` and a
`CompositeSafetyClassifier` wrapping a real `OpenCodeModerationProvider`; otherwise it
returns `aifeedback.NewMockProvider()` for both roles (the mock already implements
both `FeedbackProvider` and `ModerationProvider` — see `aifeedback.go:186-250`),
preserving today's existing non-opencode/no-key fallback behavior exactly. This is the
smallest change that removes the `nil` at its source rather than patching around it,
and it makes the exact wiring decision independently unit-testable (`VOC-034-AC-01`),
matching this file's own established test pattern (`TestBuildOAuthProvider_*`).

`VOC-034-D01` — **Resolved.** Extract a small unexported `openCodeTransport` type in
`opencode.go` (session creation, the retry loop, and the network/HTTP-status error
mapping `OpenCodeFeedbackProvider` already has) so `OpenCodeModerationProvider` reuses
identical fail-closed transport behavior rather than an independently-maintained copy
that could drift (a correctness risk in its own right for a safety-relevant timeout/
auth mapping). This is a behavior-preserving extraction: `OpenCodeFeedbackProvider`'s
public constructor and `GenerateFeedback` method keep their existing signatures and
behavior exactly; `opencode_test.go`'s existing tests are required to keep passing
**unchanged** (`VOC-034-AC-00`) as the regression proof that the extraction did not
alter feedback-path behavior.

`VOC-034-D02` — **Resolved.** The moderation provider reuses the same
`OpenCodeConfig` (`BaseURL`/`APIKey`/`Model`/`Timeout`) already read from
`AI_PROVIDER_BASE_URL`/`AI_PROVIDER_API_KEY`/`AI_PROVIDER_MODEL`/`AI_PROVIDER_TIMEOUT`
for feedback generation, rather than introducing a second provider slot. Rationale:
the issue's own live evidence used exactly one provisioned model
(`opencode-go/hy3`) successfully for structured JSON output; a second,
independently-configured moderation model/credential is not required to fix the
defect and would expand this package's scope and the number of secrets an operator
must provision. Flagged explicitly as an open question, not silently foreclosed: a
future package may introduce an independently-configurable moderation model if
evaluation ever shows the single shared model underperforms at one of the two tasks.

`VOC-034-D03` — **Resolved.** The moderation call is configured with `MaxRetries: 0`
(no transport retry), unlike the feedback call's existing `MaxRetries: 1`. Rationale:
`service.go:205` already calls `s.safety.Classify` (which may now reach the real
provider) strictly *before* the feedback-provider call later in the same request —
this package is what first makes that a real, sequential, two-network-call path in
production (previously moderation always failed closed instantly, so the combined
real-latency case was never exercised). Setting the moderation call's own retry
budget to zero bounds one of the two variables in that now-real combined latency
without touching the feedback call's existing, separately-evaluated retry behavior.
The full latency-budget question against DOC-09 §18's 10s total backend target is
explicitly **not** resolved here — flagged as `VOC-034-R00` and deferred to
VOC-032-T10's live threshold evaluation, a distinct task per the issue's own
"Relationship" section.

`VOC-034-D04` — **Resolved.** The moderation output schema strictly enumerates
exactly four values the model may return: `allowed`, `allowed_sensitive`, `blocked`,
`self_harm_intervention` (`aifeedback.go`'s existing `Safety*` constants, minus
`SafetyModerationUnavailable`, which is deliberately never offered to the model as a
value it can self-report). `OpenCodeModerationProvider.Classify` normalizes
(trim + lowercase) and matches the returned `outcome` field against exactly these
four values; anything else — an empty value, a misspelling, or the model attempting
to self-report `moderation_unavailable` — is treated as an unrecognized/malformed
outcome and returned as a **non-nil error**, never as a `ModerationResult` with an
untrusted value. `CompositeSafetyClassifier.Classify` (unchanged, `safety.go:151-154`)
already maps any non-nil provider error to `SafetyModerationUnavailable`, so this
composes correctly with existing code: an ordinary sentence that receives a
well-formed `allowed`/`allowed_sensitive` response proceeds; anything else fails
closed. The prompt (system + developer, per DOC-09 §14's three-layer architecture)
instructs the model that the learner sentence is untrusted data to classify, never
instructions to follow, and that it must return only the JSON object — mirroring
`task.go`'s existing `systemPrompt()`/`developerPrompt()` injection-resistance
pattern for the feedback provider.

`VOC-034-D05` — **Resolved.** Update the existing `.env.example` comments above
`AI_PROVIDER_API_KEY`, `AI_PROVIDER_BASE_URL`, and `AI_PROVIDER_MODEL` (currently
worded as if only feedback generation reads them) to state they are now also read for
content moderation. Text-only accuracy fix; no new variable, no new default, no
behavior change from this edit alone.

`VOC-034-D06` — **Flagged, not silently resolved either way; recorded here for the
adopting human to weigh.** The production-wiring regression test required by the
issue's item 6 is implemented at two levels, not as a single full
`NewProductionAPI`-plus-real-Postgres HTTP test:

1. A `production_test.go` unit test (`VOC-034-AC-01`) asserting `buildAIProviders`
   itself returns the real `*OpenCodeModerationProvider`/`*OpenCodeFeedbackProvider`
   types (via type assertion) when `cfg.APIProvider == "opencode"` and `cfg.APIKey`
   is set — proving the exact call site that broke is fixed, mirroring
   `TestBuildOAuthProvider_BuildsGoogleProviderWhenFullyConfigured`'s existing
   pattern in the same file.
2. A route-level regression test in `aifeedback_test.go` (`VOC-034-AC-06`) that wires
   an `aifeedback.Service` through `aifeedback.NewMemoryRepository` (the existing
   in-memory fake this file already uses) and a fake `httptest.Server` standing in
   for `opencode serve`'s session/message endpoints, using the *same*
   `buildAIProviders`-style construction (real `OpenCodeModerationProvider` +
   `CompositeSafetyClassifier`, not `MockProvider`) pointed at the fake server, then
   exercises the real HTTP route (`POST /api/v1/sentence-feedback`) for an ordinary
   safe sentence and asserts both the moderation and feedback endpoints on the fake
   server were actually invoked and the response is not
   `SAFETY_MODERATION_UNAVAILABLE`.

This proves the wiring defect is fixed without a full sqlmock-backed
`NewProductionAPI` HTTP test, which would require stubbing every downstream Postgres
query the full production route touches (accounts, learning, reviews, gamification,
missions) for a single AI-feedback-focused regression — a disproportionate diff for
this package's narrow scope. This trade-off is explicitly flagged, not asserted as
obviously correct: an adopting human may instead require the heavier full-stack test,
in which case this decision is reopened at adoption, not silently overridden here.
