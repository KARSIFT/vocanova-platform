# VOC-034 — Mock Disposition Inventory

## Scope and authority

This document is drafted before adoption/implementation, per this repository's own
package template convention (mirroring `VOC-030`/`VOC-031`/`VOC-032`/`VOC-033`, which
each carry this file even though it is not part of the base template in
`specs/templates/change-package/`).

## Draft-time confirmation (2026-07-30, by direct repository inspection)

This package's product-code additions introduce no new mock, fake, or stub — quite
the opposite: it replaces a `nil` moderation provider (which today makes every
ordinary sentence fail closed) with a real `OpenCodeModerationProvider` that calls
the actual `opencode serve` HTTP API, exactly mirroring the already-real
`OpenCodeFeedbackProvider`. The existing `aifeedback.MockProvider`
(`aifeedback.go:186-250`) is unchanged and continues to serve its existing,
appropriate role: the non-opencode/no-key fallback in `production.go`'s
`buildAIProviders` (`VOC-034-T01`), and the deterministic provider used by CI/local
tests that don't need a real HTTP round trip. This package does not add a new use of
`MockProvider` anywhere it wasn't already used, and does not remove
`MockProvider`'s existing role.

Test-only fakes added by this package, all confined to `_test.go` files (never
reachable from production code):

- `apps/api/business/aifeedback/moderation_test.go` (`VOC-034-T00`): a fake
  `opencode serve` `httptest.Server`, mirroring the pre-existing
  `opencode_test.go::newOpenCodeTestServer` pattern exactly — same convention, new
  file, no duplication of test intent (feedback vs. moderation response shapes
  differ).
- `apps/api/app/api/aifeedback_test.go` (`VOC-034-T02`): a second fake
  `httptest.Server` combining moderation- and feedback-flavored responses for the
  route-level regression test, again mirroring the same established convention.

`grep -rni "mock\|fake\|stub" apps/api/business/aifeedback/ apps/api/app/api/`
against the pre-existing tree at `base_sha` returns only pre-existing,
already-accounted-for matches (`aifeedback.MockProvider` itself,
`aifeedback.NewMemoryRepository`/`NewMemoryIdempotencyStore` test fakes, and
`_test.go` helper names like `alwaysBlockedProvider`/`errorProvider` in
`safety_test.go`) — none of which this package touches or duplicates the intent of.
