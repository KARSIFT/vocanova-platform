# VOC-032 — Mock Disposition Inventory

## Scope and authority

This document is drafted before adoption/implementation, per this
repository's own package template. It is updated at `T12` implementation
time to record the actual post-`T00`–`T11` state.

## Draft-time confirmation (2026-07-28, by direct repository inspection)

This package is infrastructure-only and introduces no learner-facing product
mock. `NewContractAPI()`'s existing in-memory/mock service wiring
(`apps/api/app/api/openapi.go`) is explicitly preserved unchanged — it exists
to let OpenAPI generation and future contract work run without a database,
and this package adds a *parallel*, real-service production-wiring path
(`T00`) rather than replacing or retiring it. It is therefore not a mock this
package needs to decommission.

The one thing genuinely mock-like this package introduces on purpose, and
retires nowhere: `T08`'s AI-evaluation-threshold CI gate deliberately runs
against `aifeedback.NewMockProvider()`, not the real provider, matching
DOC-12 §9's own rule that "normal CI never depends on a paid provider." This
is not a leftover implementation shortcut to be cleaned up later — it is the
correct, permanent shape of that gate. The real provider is exercised
separately and only once, in `T10`'s live-provider evaluation pass, which is
explicitly staging-only and never part of routine CI.

## Non-applicability statement

No `MOCK_*` frontend constant, no placeholder API response, and no stubbed
business-logic path is added by `T00`–`T11`. `T12` re-confirms (by re-running
`grep -rn "MOCK_" apps/web/src` and a broader case-insensitive `grep -rni
"mock"` at the implementation base SHA) that this package leaves that
zero-legacy-mock state — established by `VOC-030-T05`/`VOC-031` — unchanged,
and extends `scripts/foundation/mock-inventory.mjs`'s allow lists only if the
new `apps/api/cmd/api` production-wiring path or `T08`'s evaluation-gate
command introduces any name that tool's existing checks would otherwise flag.

## Expected new real files/tools (added by `T00`–`T11`)

| Area | New addition | VOC source |
| --- | --- | --- |
| API entrypoint | Real production wiring in `apps/api/cmd/api/main.go` | T00 |
| Config | `apps/api/.env.example`, `apps/web/.env.example` | T01 |
| Container | `apps/api/Dockerfile` | T02 |
| Container | `apps/web/Dockerfile`, `apps/web/next.config.ts` | T03 |
| Orchestration | `docker-compose.yml` | T04 |
| Reverse proxy | nginx configuration (Cloudflare-aware TLS) | T05 |
| Migration tooling | `apps/api/atlas.hcl`, `apps/api/scripts/migrate.sh` | T06 |
| CI/CD | `.github/workflows/deploy-staging.yml` (or equivalent name) | T07 |
| AI evaluation | Evaluation-gate command wired into CI | T08 |
| Documentation | `infra/README.md` (rewritten) | T11 |
| Documentation | DOC-11 §1 amended target-infrastructure table | T13 |
| Email | Real `email.Sender` implementation, alongside `email.Fake{}` (kept) | T14 |
| Auth | Real `auth.OAuthProvider` implementation, alongside `NewFakeOAuthProvider` (kept) | T15 |

`T14`/`T15` add real, non-mock provider implementations behind existing
`email.Sender`/`auth.OAuthProvider` interfaces — the fakes are kept (tests
keep using them), not retired, so this does not change the "no product mock
retired or introduced" disposition above.
