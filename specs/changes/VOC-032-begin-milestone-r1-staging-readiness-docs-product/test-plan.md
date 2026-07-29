# VOC-032 — Test Plan

No test, fixture, compose file, Dockerfile, nginx config, or evidence may
contain a real secret, real credential, production URL, or real learner data.
Discover installed commands at the adopted base; a missing SSH credential,
Cloudflare certificate, AI-provider credential, or other founder-provisioned
dependency (`VOC-032-DEP-00`/`DEP-01`/`DEP-03`) is never reported as a pass —
it is a recorded limitation or blocker, exactly as `T05`/`T07`/`T09`/`T10`'s
own task descriptions state.

## VOC-032-TEST-00 — Server refuses to serve without a reachable database
- Covers: `VOC-032-AC-00`; Preconditions: `T00`.
- Procedure: start the server with an unreachable `DATABASE_URL`.
- Expected result: the server fails fast (does not silently serve traffic
  against a broken connection) and logs a clear startup error. Evidence:
  `VOC-032-EV-00`.

## VOC-032-TEST-01 — Real routes are backed by real Postgres, not mocks
- Covers: `VOC-032-AC-00`; Preconditions: `T00`, disposable PostgreSQL.
- Procedure: start the production-wiring server against a disposable
  Postgres instance seeded via `cmd/seed`; call a handful of existing
  contract routes (e.g. discover, save word, get settings) as an
  authenticated test user.
- Expected result: responses reflect real database state, not the fixed
  in-memory data `NewContractAPI()` uses for OpenAPI generation. Evidence:
  `VOC-032-EV-01`.

## VOC-032-TEST-02 — `/healthz` reflects live database state
- Covers: `VOC-032-AC-00`; Preconditions: `T00`.
- Procedure: call `/healthz` with the database reachable, then with it
  stopped.
- Expected result: 200 while reachable, non-200 while unreachable. Evidence:
  `VOC-032-EV-02`.

## VOC-032-TEST-03 — Kill switches actually disable their feature
- Covers: `VOC-032-AC-00`; Preconditions: `T00`.
- Procedure: set `AI_FEATURES_ENABLED=false` and call an AI-feedback route;
  set `NEW_USER_SIGNUP_ENABLED=false` and attempt signup.
- Expected result: each disabled feature responds with a stable,
  documented non-crash response (not a 500), and non-AI routes remain
  unaffected by `AI_FEATURES_ENABLED=false`. Evidence: `VOC-032-EV-03`.

## VOC-032-TEST-04 — Graceful shutdown
- Covers: `VOC-032-AC-00`; Preconditions: `T00`.
- Procedure: send `SIGTERM` mid-request.
- Expected result: in-flight requests complete before the process exits; no
  connection is abruptly dropped. Evidence: `VOC-032-EV-04`.

## VOC-032-TEST-05 — `.env.example` completeness
- Covers: `VOC-032-AC-01`; Preconditions: `T01`.
- Procedure: diff every environment variable actually read by `T00`'s config
  loader and `apps/web/src/lib/env.ts` against both `.env.example` files.
- Expected result: no variable is read without a documented placeholder
  entry. Evidence: `VOC-032-EV-05`.

## VOC-032-TEST-06 — `apps/api` image builds
- Covers: `VOC-032-AC-02`; Preconditions: `T02`.
- Procedure: `docker build -f apps/api/Dockerfile .`
- Expected result: builds successfully; final image runs as non-root.
  Evidence: `VOC-032-EV-06`.

## VOC-032-TEST-07 — `apps/api` container serves and reports healthy
- Covers: `VOC-032-AC-02`; Preconditions: `T02`, `T06`, disposable Postgres.
- Procedure: run the built image against a disposable, migrated Postgres.
- Expected result: `/healthz` reports healthy within a bounded startup time.
  Evidence: `VOC-032-EV-07`.

## VOC-032-TEST-08 — `apps/web` image builds
- Covers: `VOC-032-AC-03`; Preconditions: `T03`.
- Procedure: `docker build -f apps/web/Dockerfile .`
- Expected result: builds successfully using the standalone Next.js output;
  final image runs as non-root. Evidence: `VOC-032-EV-08`.

## VOC-032-TEST-09 — `apps/web` container serves
- Covers: `VOC-032-AC-03`; Preconditions: `T03`.
- Procedure: run the built image and request the root route.
- Expected result: the app renders. Evidence: `VOC-032-EV-09`.

## VOC-032-TEST-10 — Compose config validates
- Covers: `VOC-032-AC-04`; Preconditions: `T04`.
- Procedure: `docker compose config`.
- Expected result: no error; no literal secret value present in the
  rendered config. Evidence: `VOC-032-EV-10`.

## VOC-032-TEST-11 — Full local compose stack comes up healthy
- Covers: `VOC-032-AC-04`; Preconditions: `T04`, `T02`, `T03`, `T06`.
- Procedure: `docker compose up` locally with a disposable `.env`.
- Expected result: `postgres` reports healthy, then `api` and `web` report
  healthy; only `nginx` publishes a host port. Evidence: `VOC-032-EV-11`.

## VOC-032-TEST-12 — nginx config syntax and routing
- Covers: `VOC-032-AC-05`; Preconditions: `T05`.
- Procedure: `nginx -t`; send requests with `Host: staging.vocanova.site` and
  `Host: api-staging.vocanova.site` against the local compose stack (with a
  self-signed certificate substituted for the real Cloudflare origin
  certificate, which does not exist in this environment).
- Expected result: config validates; each Host header routes to the correct
  upstream service. Evidence: `VOC-032-EV-12`.

## VOC-032-TEST-13 — Real-IP restoration is scoped, not open
- Covers: `VOC-032-AC-05`; Preconditions: `T05`.
- Procedure: inspect the rendered nginx config's `set_real_ip_from`
  directives.
- Expected result: scoped to Cloudflare's published IP ranges, never
  `0.0.0.0/0`. Evidence: `VOC-032-EV-13`.

## VOC-032-TEST-14 — Atlas applies the full migration set
- Covers: `VOC-032-AC-06`; Preconditions: `T06`, disposable PostgreSQL.
- Procedure: run the `T06` apply command against a fresh disposable
  Postgres.
- Expected result: every migration applies in order with no error; the
  resulting schema matches what `migration_test.go`'s existing string
  assertions expect. Evidence: `VOC-032-EV-14`.

## VOC-032-TEST-15 — Re-apply is a no-op; down-files are not auto-discovered
- Covers: `VOC-032-AC-06`, `VOC-032-D08`; Preconditions: `T06`.
- Procedure: run the apply command twice in a row; separately, confirm the
  apply command's own file-discovery does not pick up any `.down.sql.example`
  file.
- Expected result: second run makes no schema change; down-files remain
  unexecuted by the forward path. Evidence: `VOC-032-EV-15`.

## VOC-032-TEST-16 — Deploy workflow YAML validity and build/push steps
- Covers: `VOC-032-AC-07`; Preconditions: `T07`.
- Procedure: lint the workflow YAML; push to a disposable test branch
  configured to trigger only the build/tag/push-to-GHCR steps.
- Expected result: valid YAML; both images build and push successfully.
  Evidence: `VOC-032-EV-16`.

## VOC-032-TEST-17 — Deploy workflow fails closed on a bad health check
- Covers: `VOC-032-AC-07`; Preconditions: `T07`.
- Procedure: inspect/exercise the health-check step's failure branch (e.g.
  by pointing it at a deliberately-unhealthy endpoint in a controlled test).
- Expected result: the workflow run fails; the step sequence does not tear
  down already-running containers before confirming the new ones are
  healthy. Evidence: `VOC-032-EV-17`. Live SSH execution against the real
  server is recorded as blocked by `VOC-032-DEP-00`, not asserted as passing.

## VOC-032-TEST-18 — Golden-set evaluation passes at the mock provider
- Covers: `VOC-032-AC-08`; Preconditions: `T08`.
- Procedure: run the evaluation-gate command.
- Expected result: every DOC-09 §23 threshold is met against
  `NewMockProvider()`; exit code 0. Evidence: `VOC-032-EV-18`.

## VOC-032-TEST-19 — Gate fails when a threshold is violated
- Covers: `VOC-032-AC-08`; Preconditions: `T08`.
- Procedure: run the gate against a deliberately-degraded fixture provider
  that violates one threshold (e.g. induces a zero-tolerance category
  failure).
- Expected result: non-zero exit; the specific violated threshold is
  reported. Evidence: `VOC-032-EV-19`.

## VOC-032-TEST-20 — Gate is wired as a required CI check
- Covers: `VOC-032-AC-08`; Preconditions: `T08`.
- Procedure: inspect the workflow configuration.
- Expected result: the gate runs on every relevant PR and its failure blocks
  merge. Evidence: `VOC-032-EV-20`.

## VOC-032-TEST-21 — Live migration and rollback rehearsal
- Covers: `VOC-032-AC-09`; Preconditions: `T09`, real staging server reachable
  (`VOC-032-DEP-00`/`DEP-01` resolved).
- Procedure: per `T09`'s described procedure — apply, exercise, snapshot,
  roll back on the disposable copy, verify, re-apply forward.
- Expected result: rollback restores a consistent prior schema on the
  disposable copy; forward re-application succeeds with no unintended data
  loss; every command/timestamp/outcome recorded in `staging-evidence.md`.
  Evidence: `VOC-032-EV-21`. Recorded as blocked, not passing, until the
  real server and credentials exist.

## VOC-032-TEST-22 — Live-provider AI evaluation pass
- Covers: `VOC-032-AC-10`; Preconditions: `T10`, staging AI-provider
  credentials resolved (`VOC-032-DEP-03`).
- Procedure: run the evaluation harness against the real provider once,
  within the pre-agreed cost ceiling.
- Expected result: scores recorded against every DOC-09 §23 threshold; any
  miss recorded as a release-blocking finding. Evidence: `VOC-032-EV-22`.
  Recorded as blocked, not passing, until credentials exist.

## VOC-032-TEST-23 — `infra/README.md` accuracy
- Covers: `VOC-032-AC-11`; Preconditions: `T02`–`T09` merged.
- Procedure: compare `infra/README.md`'s description against the actual
  files/paths this package produced.
- Expected result: no drift; the `VOC-032-D02` DOC-11-contradiction caveat is
  present. Evidence: `VOC-032-EV-23`.

## VOC-032-TEST-25 — DOC-11 §1 amendment accuracy
- Covers: `VOC-032-AC-13`; Preconditions: `T00`–`T09` merged.
- Procedure: compare DOC-11 §1's amended target-infrastructure table against
  the actual docker-compose/nginx shape `T00`–`T09` built.
- Expected result: no drift; the superseded Render/Cloudflare-Workers row set
  is annotated as superseded, not deleted; the amendment names VOC-032 and
  the founder as approving owner. Evidence: `VOC-032-EV-26`.

## VOC-032-TEST-26 — Real email sender: request construction
- Covers: `VOC-032-AC-14`; Preconditions: `T14`.
- Procedure: unit test the real `Sender` against a fake HTTP transport with a
  representative magic-link message.
- Expected result: correct recipient, subject, and both text/HTML bodies are
  sent; no real network call occurs in this test. Evidence: `VOC-032-EV-27`.

## VOC-032-TEST-27 — Real email sender: one live staging delivery
- Covers: `VOC-032-AC-14`; Preconditions: `T14`, `VOC-032-DEP-07` resolved.
- Procedure: trigger one real magic-link send to a founder-controlled test
  inbox in staging.
- Expected result: the email is actually received; the send is recorded in
  `staging-evidence.md`. Recorded as blocked, not passing, until the
  provider credential exists. Evidence: `VOC-032-EV-28`.

## VOC-032-TEST-28 — Real Google OAuth provider: token/userinfo handling
- Covers: `VOC-032-AC-15`; Preconditions: `T15`.
- Procedure: unit test the real `OAuthProvider` against a fake HTTP transport
  covering a successful exchange and a failure response from Google.
- Expected result: correct request construction and response parsing in both
  cases; no real call to Google occurs in this test. Evidence:
  `VOC-032-EV-29`.

## VOC-032-TEST-29 — Real Google OAuth provider: one live staging exchange
- Covers: `VOC-032-AC-15`; Preconditions: `T15`, `VOC-032-DEP-07` resolved.
- Procedure: perform one real sign-in against Google's actual OAuth flow in
  staging.
- Expected result: the exchange succeeds and returns a real identity; the
  attempt is recorded in `staging-evidence.md`. Recorded as blocked, not
  passing, until the Google Cloud OAuth client exists. Evidence:
  `VOC-032-EV-30`.

## VOC-032-TEST-24 — Full installed suite passes at the final SHA
- Covers: `VOC-032-AC-12`; Preconditions: `T00`–`T12`, `T13`–`T15`.
- Procedure: run every installed command discovered at the adopted base
  (Go format/vet/test/build, web lint/typecheck/build, `T08`'s evaluation
  gate, `scripts/governance/*`) at the exact final SHA.
- Expected result: all pass; any check that cannot run in this environment
  (live SSH deploy, live TLS, live AI-provider pass, live email/OAuth
  exchange) is listed as a recorded limitation, never reported as passing.
  Evidence: `VOC-032-EV-24`, `VOC-032-EV-25`.
