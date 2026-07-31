# VOC-036 — Mock Disposition Inventory

**Draft — not adopted.**

## Scope and authority

This document is drafted before adoption/implementation, per this repository's
own package template convention (mirroring `VOC-030`/`VOC-031`/`VOC-032`/
`VOC-033`/`VOC-034`/`VOC-035`, each of which carries this file even though it is
not part of the base template in `specs/templates/change-package/`).

## Draft-time assessment (2026-07-31, by direct repository inspection)

This package's product-code additions introduce no new mock, fake, or stub in
production code — it adds a third real provider implementation
(`CloudflareFeedbackProvider`/`CloudflareModerationProvider`), calling the
actual Cloudflare Workers AI REST API, alongside the already-real
`OpenCodeFeedbackProvider`/`OpenCodeModerationProvider` and
`GeminiFeedbackProvider`/`GeminiModerationProvider`. The existing
`aifeedback.MockProvider` (`aifeedback.go`, unchanged) continues to serve its
existing, appropriate role: the fallback in `production.go`'s `buildAIProviders`
when no real-provider condition is met (now including the new "Cloudflare
selected but the token or account ID is missing" case, per `VOC-036-AC-05`),
and the deterministic provider used by CI/local tests that don't need a real
HTTP round trip. This package does not add a new use of `MockProvider` anywhere
it wasn't already used, and does not remove `MockProvider`'s existing role.

Test-only fakes this package plans to add, confined to `_test.go` files (never
reachable from production code):

- `apps/api/business/aifeedback/cloudflare_test.go` (`VOC-036-T00`): a fake
  `httptest.Server` standing in for `api.cloudflare.com`, mirroring the
  pre-existing `opencode_test.go`/`gemini_test.go`/`moderation_test.go` pattern
  exactly — same convention, new file, no duplication of test intent
  (Cloudflare's request/response envelope shape differs from both existing
  providers').
- `apps/api/cmd/eval-live/main_test.go` (extended, per `VOC-035-T02`'s existing
  file — `VOC-036-T02`): a fake `newCloudflareProvider` package-variable
  override, mirroring the existing `newProvider`/`newGeminiProvider` test seams
  `cmd/eval-live/main.go` already establishes.

`grep -rni "mock\|fake\|stub" apps/api/business/aifeedback/ apps/api/app/api/
apps/api/cmd/eval-live/` against the pre-existing tree at `base_sha` returns
only pre-existing, already-accounted-for matches (`aifeedback.MockProvider`
itself, `aifeedback.NewMemoryRepository`/`NewMemoryIdempotencyStore` test
fakes, `_test.go` helper names like `alwaysBlockedProvider`/`errorProvider` in
`safety_test.go`, and `gemini_test.go`'s own fake-server helpers) — none of
which this package touches or duplicates the intent of. This assessment is
drafted before any implementation code exists and should be re-confirmed
against the actual diff at each PR's review, per this repository's usual
practice.
