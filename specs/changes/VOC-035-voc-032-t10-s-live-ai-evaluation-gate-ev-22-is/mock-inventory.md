# VOC-035 — Mock Disposition Inventory

**Draft — not adopted.**

## Scope and authority

This document is drafted before adoption/implementation, per this
repository's own package template convention (mirroring `VOC-030`/`VOC-031`/
`VOC-032`/`VOC-033`/`VOC-034`, each of which carries this file even though it
is not part of the base template in `specs/templates/change-package/`).

## Draft-time assessment (2026-07-31, by direct repository inspection)

This package's product-code additions introduce no new mock, fake, or stub in
production code — it adds a second real provider implementation
(`GeminiFeedbackProvider`/`GeminiModerationProvider`), calling the actual
Gemini `generateContent` HTTP API, alongside the already-real
`OpenCodeFeedbackProvider`/`OpenCodeModerationProvider`. The existing
`aifeedback.MockProvider` (`aifeedback.go`, unchanged) continues to serve its
existing, appropriate role: the fallback in `production.go`'s
`buildAIProviders` when neither the OpenCode nor the Gemini condition is met,
and the deterministic provider used by CI/local tests that don't need a real
HTTP round trip. This package does not add a new use of `MockProvider`
anywhere it wasn't already used, and does not remove `MockProvider`'s
existing role.

Test-only fakes this package plans to add, confined to `_test.go` files
(never reachable from production code):

- `apps/api/business/aifeedback/gemini_test.go` (`VOC-035-T00`): a fake
  `httptest.Server` standing in for `generativelanguage.googleapis.com`,
  mirroring the pre-existing `opencode_test.go`/`moderation_test.go` pattern
  exactly — same convention, new file, no duplication of test intent
  (Gemini's request/response shape differs from OpenCode's).
- `apps/api/cmd/eval-live/main_test.go` (new, or extended if an equivalent
  file already exists — `VOC-035-T02`): a fake `newGeminiProvider`
  package-variable override, mirroring the existing `newProvider` test seam
  `cmd/eval-live/main.go` already establishes for OpenCode.

`grep -rni "mock\|fake\|stub" apps/api/business/aifeedback/ apps/api/app/api/
apps/api/cmd/eval-live/` against the pre-existing tree at `base_sha` returns
only pre-existing, already-accounted-for matches (`aifeedback.MockProvider`
itself, `aifeedback.NewMemoryRepository`/`NewMemoryIdempotencyStore` test
fakes, and `_test.go` helper names like `alwaysBlockedProvider`/
`errorProvider` in `safety_test.go`) — none of which this package touches or
duplicates the intent of. This assessment is drafted before any
implementation code exists and should be re-confirmed against the actual
diff at each PR's review, per this repository's usual practice.
