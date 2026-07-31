# VOC-036 — Impact Analysis

**Draft — not adopted.**

## Security and privacy

This package introduces two new secret/config classes, per `VOC-036-D02`: a
Cloudflare API token (`AI_PROVIDER_API_KEY`'s value when `AI_PROVIDER=cloudflare`),
transmitted only via the `Authorization: Bearer` request header to
`api.cloudflare.com` (or the configured `AI_PROVIDER_BASE_URL` override), and a
Cloudflare account ID (a new `AI_PROVIDER_ACCOUNT_ID` variable) — not itself a
secret in the sense a leaked value grants API access, but required, and treated
with the same "never log" discipline as the token since it identifies which
Cloudflare account's usage/billing a request attributes to. Neither value is ever
logged (mirroring `opencode.go`'s and `gemini.go`'s existing "never log the
credential" discipline — `cloudflare.go` must not `log`/`fmt.Print*` the token,
the account ID, the request body, or the response body anywhere). A second new
network egress destination is introduced: `api.cloudflare.com` (Cloudflare's own
infrastructure), distinct from both the founder's private OpenCode Docker gateway
and Google's Gemini endpoint — this package adds a **third** external AI-provider
data processor for learner-authored sentence text, which `specification.md`'s
"Risk and protected areas" section explicitly flags (rather than resolves) as a
fact worth a fresh founder review, distinct from the per-request payload-
minimization question below.

Per DOC-09 §21, a moderation/feedback request may include only the learner
sentence, target word, and learner level (the existing
`ModerationInput`/`ProviderTask` shapes, unchanged by this package) —
`CloudflareFeedbackProvider`/`CloudflareModerationProvider` must send exactly
that structured payload and nothing else (no name, email, session ID, IP, or
account history), matching the existing boundary the OpenCode and Gemini paths
already enforce. This is a design requirement stated here for the implementer
and reviewer to verify against the actual diff, not something this drafting pass
can itself confirm before code exists.

The moderation contract's fail-closed discipline (`VOC-036-D03`) is this
package's actual security-relevant surface, mirroring `VOC-034-D04`'s and
`VOC-035-D03`'s own reasoning: Cloudflare's `response_format` parameter is a
strong hint, not a guarantee (per Cloudflare's own documentation, quoted in
`specification.md` — a schema that cannot be satisfied surfaces as a distinct
"JSON Mode couldn't be met" failure mode rather than a best-effort
non-conforming payload, and this must still be treated as a fail-closed error,
not silently retried into an assumed pass), so server-side re-validation of the
returned JSON is required, not optional.

A distinct, Cloudflare-specific risk this analysis flags: because the account ID
is a URL path component rather than a header value, a misconfiguration (an empty
or wrong `AI_PROVIDER_ACCOUNT_ID` with a real, valid token) would either 404 or —
worse, if the operator has access to more than one Cloudflare account under the
same token's permission scope — silently route requests to, and attribute usage
against, the *wrong* Cloudflare account. This is a configuration-correctness risk
for the operator to guard with a scoped API token limited to a single account
(Cloudflare's own token-permission model supports this), not a code-level guard
this package can itself enforce beyond validating the value is non-empty before
constructing the URL (`VOC-036-AC-05`'s "empty account ID falls back to mock"
rule).

## Data and migrations

No schema change, no migration, no new table or column. This package changes
only Go application code (`apps/api/business/aifeedback/`,
`apps/api/app/api/`, `apps/api/cmd/eval-live/`) and a comment/new-variable
addition in `apps/api/.env.example`. No existing persistence path changes shape;
a sentence classified/graded via Cloudflare persists through `service.go`'s
existing, unchanged transaction path exactly as an OpenCode- or Gemini-classified
sentence does today, since all three are behind the same provider-agnostic
`FeedbackProvider`/`ModerationProvider`/`SafetyClassifier` interfaces.

## Analytics and accessibility

None new. No analytics event is added, changed, or removed — `service.go`'s
existing telemetry calls (unchanged) already cover the outcome switch regardless
of which concrete provider produced the outcome; this package does not add a
"which provider served this request" telemetry dimension, the same gap
`VOC-035`'s own impact analysis already flagged and left unbuilt — now applying
to three providers instead of two, making that gap somewhat more material (an
operator with three configured providers has even less in-product visibility
into which one actually served a given request), flagged here again as a
plausible, separately-scoped future improvement, not decided or built in this
draft's scope. No accessibility surface exists in this package's scope —
`apps/api/business/aifeedback`, `apps/api/app/api`, and `apps/api/cmd/eval-live`
are server-side/CLI only, no UI or user-facing markup — evidence-backed
non-applicability, confirmed by the planned changed-file list.

## Risks, dependencies, and evidence

- `VOC-036-R00`: **Medium, flagged for follow-up, not resolved here.**
  Cloudflare's real-world latency and free-tier rate-limit behavior against
  DOC-09 §18's 8-second per-request budget and 10s total backend target, and
  against the shared 10,000-neurons/day daily pool, are genuinely unknown until
  `VOC-036-T03`'s live run measures them — this is the exact category of unknown
  that `VOC-035`'s own reported failure (per the founder's account) fell into for
  Gemini's free tier, motivating `VOC-036-D06`'s pacing mechanism as a
  compensating control this time, not a guarantee the live run will pass.
- `VOC-036-R01`: **Medium, flagged for adoption-time decision.** Cloudflare
  Workers AI's free tier carries its own terms of service and rate limits
  distinct from both the founder's paid OpenCode account and Google's Gemini free
  tier; this package does not evaluate Cloudflare's terms of service for
  compatibility with processing real (if disposable-test-only, pre-launch)
  learner-authored sentence content. Flagged as an open question for the founder
  to confirm before `VOC-036-T03`'s live run processes any content beyond
  synthetic evaluation-set sentences (`GoldenSet()`'s existing, already-reviewed
  dataset, never real learner data) — the live evaluation task itself only ever
  sends the pre-existing golden evaluation-set sentences, mirroring `VOC-032-T10`'s
  and `VOC-035-T03`'s own scope exactly.
- `VOC-036-R02`: **Medium, specific to this package.** `VOC-035`'s own reported
  live-evaluation failure (per the founder's account, not yet independently
  confirmed against that package's own `staging-evidence.md` at this package's
  `base_sha` — see `specification.md`'s flagged discrepancy) means this
  repository would, if `VOC-036-T03` also fails to produce a passing provider,
  have **zero** providers that have actually passed `VOC-032-T10`'s live
  evaluation gate despite three implemented adapters. This package's own
  existence does not resolve `EV-22`'s release-blocking status by construction —
  it only adds a third candidate. If `VOC-036-T03` also fails, that is valid,
  informative evidence to record honestly (per `VOC-036-AC-11`), and the founder
  would then be choosing among: fixing one of the two already-implemented
  providers' specific failure modes (a paid OpenCode model, or Gemini's stale-
  model/pacing issue), adding a fourth provider, or reassessing `EV-22`'s
  own thresholds/gate design — none of which this package decides or scopes.
- `VOC-036-R03`: **Low.** Three independent provider integrations
  (`opencode.go`'s, `gemini.go`'s, and `cloudflare.go`'s) now exist for the same
  two interfaces; a future prompt/schema change made to
  `task.go`/`moderation.go` (shared by all three, per `VOC-036-D01`)
  automatically applies to all three, but a provider-specific bug could exist in
  only one adapter without the others being affected — the expected, intentional
  shape of "a real, alternative provider," mitigated by `cloudflare_test.go`'s
  own dedicated coverage per `VOC-036-T00`.
- `VOC-036-R04`: **Low.** `VOC-036-D02`'s new `AI_PROVIDER_ACCOUNT_ID` variable
  is a genuinely new piece of required configuration (unlike `VOC-035`, which
  added zero new variables) — an operator switching an existing deployment to
  `AI_PROVIDER=cloudflare` must remember to set it, or `buildAIProviders` falls
  back to the mock provider per `VOC-036-AC-05` (a safe, non-crashing failure
  mode, not a silent wrong-account request) — mitigated by `.env.example`'s
  documentation (`VOC-036-T01` step 4) and by the fallback behavior itself.
- `VOC-036-DEP-00`, `VOC-036-DEP-01`: see `change.yaml`.
- `VOC-036-EV-00`: `go test ./apps/api/business/aifeedback/...` output showing
  `VOC-036-T00`'s new Cloudflare tests passing, plus every pre-existing test in
  the package passing unchanged.
- `VOC-036-EV-01`: `go test ./apps/api/app/api/... -run TestBuildAIProviders`
  output plus the `.env.example` diff showing the comment updates and the single
  new `AI_PROVIDER_ACCOUNT_ID` variable (or, if `VOC-036-D02` is resolved
  differently at adoption, whatever variable shape the adopting human instead
  approves).
- `VOC-036-EV-02`: `go test ./apps/api/cmd/eval-live/...` output showing the new
  Cloudflare-selection and request-pacing tests passing alongside the
  pre-existing `cmd/eval-live` test suite (including `VOC-035-T02`'s own Gemini
  tests) passing unchanged.
- `VOC-036-EV-03`: `git diff --name-only <base_sha>...<candidate_sha>` confirming
  the diff matches `VOC-036-AC-10`'s declared file list exactly.
- `VOC-036-EV-04`: `VOC-036-T03`'s live-Cloudflare-evaluation record in
  `staging-evidence.md`, including the pacing interval actually used.
- `VOC-036-EV-05`: exact-SHA independent Claude Code verification per PR, per
  `CLAUDE.md`.
