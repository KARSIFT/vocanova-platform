# VOC-037-EV-04 — Production monitoring/alerting evidence (T04)

## Standing at this revision

**Correction to this section's earlier text:** it previously claimed the
in-repo/external split below "matches `VOC-037-TEST-04`." That was wrong
and is struck. `VOC-037-TEST-04`'s own preconditions require Sentry AND
Better Stack/UptimeRobot already configured, and its expected result
requires both a Sentry event AND an uptime alert actually observed within
a bounded time - there is no "repo scaffolding first, external verification
later" split authorized anywhere in `test-plan.md`. `VOC-037-AC-04` and
`VOC-037-TEST-04` are simply **not satisfied** at this revision, full stop -
not partially satisfied, not on an authorized split. The in-repo
deliverables below are real, correct, and necessary preconditions for
AC-04, but they do not themselves satisfy it.

- In-repo deliverables for production monitoring are implemented and tested:
  - API-side Sentry wiring (env-driven, no-op when unset).
  - `sentryhttp` middleware wrapping the real HTTP handler, so real
    request errors/panics reach Sentry - not just the deliberate test
    endpoint below (fixes a reviewed Medium finding: the original
    revision only ever called `sentry.CaptureMessage` from the manual
    test route, so "error monitoring active" wasn't actually true for
    real traffic).
  - Authenticated, production-only Sentry test-event endpoint, gated on
    both a non-empty token AND `environment == "production"` (fixes a
    reviewed Medium finding: the original gate was token-only, so a
    non-production tier with the token set would also expose the route).
    Returns `502` rather than a false `200` if Sentry doesn't return an
    event ID (fixes a reviewed Low finding).
  - Production deploy workflow secret sync for monitoring credentials,
    which now skips cleanly (rather than hard-failing every future
    deploy, including unrelated ones like T03) while
    `PRODUCTION_SENTRY_DSN`/`PRODUCTION_MONITORING_TEST_TOKEN` don't exist
    yet, but still fails closed on a half-configured pair (fixes a
    reviewed Medium finding).
- External, founder-facing proof still requires one live production rehearsal:
  - deliberate Sentry test event observed in the production Sentry project;
  - deliberate uptime-check failure observed in Better Stack/UptimeRobot.
- **No uptime-monitor configuration exists yet** (flagged as a reviewed
  High finding) because it requires an external Better Stack/UptimeRobot
  account this task has no access to create. Recorded as an outstanding
  founder step below, not silently treated as done.
- **Known, accepted limitation:** `deploy-production.yml`'s monitoring
  secret sync skips cleanly while `PRODUCTION_SENTRY_DSN`/
  `PRODUCTION_MONITORING_TEST_TOKEN` are unset, so deploys stay green while
  monitoring remains unconfigured (flagged as a reviewed Medium finding).
  This is intentional - hard-failing every deploy (including unrelated
  ones) until external accounts exist would just trade one blocking
  problem for another - but it means a green deploy is explicitly **not**
  evidence that AC-04 is satisfied. `VOC-037-T05` (the R2 go/no-go gate)
  must check AC-04's real status directly, not infer it from deploy
  success.

## Repository deliverables implemented in T04

| Deliverable | Location | Verification |
| --- | --- | --- |
| Sentry runtime config fields | `apps/api/app/api/production.go` (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`) | `go test ./...` in `apps/api` |
| Deliberate test-event endpoint | `POST /ops/monitoring/sentry-test` in `apps/api/app/api/production.go` | `TestRegisterMonitoringSentryTest_AuthBehavior` |
| Monitoring test token gating | `MONITORING_TEST_TOKEN` in `apps/api/app/api/production.go` | `TestRegisterMonitoringSentryTest_AuthBehavior` |
| Production deploy secret sync | `.github/workflows/deploy-production.yml` (`PRODUCTION_SENTRY_DSN`, `PRODUCTION_MONITORING_TEST_TOKEN`) | workflow file inspection |
| API env schema docs | `apps/api/.env.example` monitoring section | file inspection |

## Deterministic checks run

```bash
cd apps/api
go test ./...
```

Observed result: PASS for all packages, including `app/api` and `cmd/api`.

## Founder-run live verification required to close AC-04

1. Confirm production GitHub environment contains:
   - `PRODUCTION_SENTRY_DSN`
   - `PRODUCTION_MONITORING_TEST_TOKEN`
2. Run `deploy-production` once so `api.env` receives:
   - `SENTRY_DSN`
   - `SENTRY_ENVIRONMENT=production`
   - `SENTRY_RELEASE=sha-<deployed-sha>`
   - `MONITORING_TEST_TOKEN`
3. Trigger a deliberate production test event:
   - `curl -X POST "https://api-production.<founder-domain>:8443/ops/monitoring/sentry-test" -H "Authorization: Bearer <PRODUCTION_MONITORING_TEST_TOKEN>"`
4. Confirm the event appears in the production Sentry project (include event ID from API response).
5. Trigger a bounded uptime failure rehearsal for production (for example, short maintenance window that forces the monitored health endpoint non-2xx), then confirm Better Stack/UptimeRobot alerts the founder.
6. Record timestamps, screenshots/links, and alert receiver details; then mark `VOC-037-AC-04` satisfied.

## Notes

- This task adds monitoring instrumentation and safe test hooks only; it does not change launch authority or go/no-go gates (`VOC-037-T05` remains the founder gate).
- The monitoring test endpoint is not registered unless `MONITORING_TEST_TOKEN` is set.
