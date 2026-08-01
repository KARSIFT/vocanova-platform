# VOC-037-EV-04 — Production monitoring/alerting evidence (T04)

## Standing at this revision

`VOC-037-AC-04` is **partially satisfied in-repo** and **pending founder-run external verification**.

- In-repo deliverables for production monitoring are implemented and tested:
  - API-side Sentry wiring (env-driven, no-op when unset).
  - Authenticated production-only Sentry test-event endpoint.
  - Production deploy workflow secret sync for monitoring credentials.
- External, founder-facing proof still requires one live production rehearsal:
  - deliberate Sentry test event observed in the production Sentry project;
  - deliberate uptime-check failure observed in Better Stack/UptimeRobot.

This split matches `VOC-037-TEST-04`: external monitoring systems are not configurable from repository-only access.

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
