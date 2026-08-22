# VOC-080 — Test Plan

## VOC-080-TEST-00 — Plan, ADR, document, and source-inventory consistency

- Covers: `VOC-080-AC-00`, `VOC-080-AC-09`
- Procedure: run governance validation, risk classification, doc-link/index checks, exact four-workflow
  inventory, old-host reference classification, source-link verification, and independent semantic
  review of both ADRs and every active affected document.
- Expected: one Cloudflare direction, one Ruflo permission envelope, historical records preserved, no
  premature live-authority claim, no placeholder or contradiction.
- Evidence: `VOC-080-EV-00`.

## VOC-080-TEST-01 — Workflow policy and local/hosted CI contract

- Covers: `VOC-080-AC-01`
- Procedure: test workflow YAML parsing, action SHA pins, permissions, checkout credentials, triggers,
  concurrency, timeouts, secret references, untrusted-input handling, stable check names, local command
  parity, cache fallbacks, aggregate result, synthetic failed subsystem, and hosted PR/push runs.
- Expected: fail-closed, least-privilege, diagnostic CI without skipped evidence.
- Evidence: `VOC-080-EV-01`.

## VOC-080-TEST-02 — Repository settings and fork/PR permission boundary

- Covers: `VOC-080-AC-01`, `VOC-080-AC-02`
- Procedure: read settings before/after; apply only supported approved settings; verify default read token,
  action policy, merge methods, environment-secret isolation, and explicit branch-protection/ruleset
  unavailability; exercise synthetic fork/pull-request contexts with no deploy secrets.
- Expected: settings and docs match exactly; unsupported controls are pending, not claimed.
- Evidence: `VOC-080-EV-02`.

## VOC-080-TEST-03 — OpenNext workerd compatibility and limits

- Covers: `VOC-080-AC-03`
- Procedure: frozen install; lint/type/unit/middleware; OpenNext build; Wrangler types/dry run; workerd
  requests for static, SSR, RSC, middleware, auth redirect, API forwarding, error/Sentry-disabled paths;
  accessibility/Lighthouse; bundle compressed-size and startup measurement; negative unsupported-global,
  unbounded-buffer, and floating-promise scans.
- Expected: behavior passes in workerd and stays inside the recorded target limits.
- Evidence: `VOC-080-EV-03`.

## VOC-080-TEST-04 — Worker API/D1 foundation and contract drift

- Covers: `VOC-080-AC-04`
- Procedure: generated Wrangler bindings, lint/typecheck/unit/workerd tests, D1 local migrations up from
  empty and repeated state, prepared-statement negative tests, error/log redaction, health/config/CORS,
  generated OpenAPI deterministic diff, and api-client compatibility.
- Expected: typed Worker foundation with no contract drift or unsafe binding/query pattern.
- Evidence: `VOC-080-EV-04`.

## VOC-080-TEST-05 — Identity and account parity

- Covers: `VOC-080-AC-05`
- Procedure: table-driven Go/reference versus Worker fixtures for OAuth, magic links, sessions, cookie
  flags, expiry/revocation/replay, account/settings/onboarding/email/deletion, rate/kill switches,
  unauthorized/cross-user access, D1 atomic batches, and failure injection.
- Expected: same public behavior and no auth/data-isolation regression.
- Evidence: `VOC-080-EV-05`.

## VOC-080-TEST-06 — Content, learning, and review parity

- Covers: `VOC-080-AC-05`
- Procedure: compare discovery/detail/save/unsave, cursors/order, due queues, rating transitions,
  scheduling timestamps, attempts, duplicate/idempotent writes, unauthorized/cross-user access, batch
  rollback, and read-after-write behavior.
- Expected: deterministic domain and contract parity.
- Evidence: `VOC-080-EV-06`.

## VOC-080-TEST-07 — Mission, progress, ledger, and streak parity

- Covers: `VOC-080-AC-05`
- Procedure: timezone/local-day matrices, snapshot stability, settings-next-day behavior, point ledger,
  duplicate rewards, mission completion, streak/grace transitions, concurrent/failure paths, and domain
  reconciliation against reference fixtures.
- Expected: no false progress, double award, or temporal drift.
- Evidence: `VOC-080-EV-07`.

## VOC-080-TEST-08 — AI, email, safety, cost, and observability

- Covers: `VOC-080-AC-06`
- Procedure: mock provider success/malformed/timeout/retry, structured validation, safety/moderation,
  injection fixtures, sentence-before-call ordering, kill switches, rate/cost caps, email mock behavior,
  `waitUntil` completion, structured log redaction, and no paid/live provider in CI.
- Expected: bounded, privacy-safe parity and graceful provider failure.
- Evidence: `VOC-080-EV-08`.

## VOC-080-TEST-09 — Synthetic conversion and reconciliation

- Covers: `VOC-080-AC-07`
- Procedure: convert fixtures containing every table/type/relationship and adversarial precision,
  timestamp, JSON, null, duplicate, ordering, partial-import, retry, and redaction case; import into fresh
  local D1; rerun; compare counts/checksums/foreign keys/domain aggregates; rehearse forward correction.
- Expected: deterministic, idempotent, resumable, privacy-safe migration with exact reconciliation.
- Evidence: `VOC-080-EV-09`.

## VOC-080-TEST-10 — Deployment state machine without unauthorized mutation

- Covers: `VOC-080-AC-08`
- Procedure: static policy tests plus mocked Wrangler/GitHub event fixtures for PR, develop, main,
  manual activation, missing/stale SHA, missing secret, failed migration/build/smoke, cancellation,
  environment mix-up, rollback, and cost limit. Run real credential-free dry runs. Live proof occurs
  only if the corresponding hold is separately completed.
- Expected: exact-version, ordered, isolated, fail-closed behavior; no PR credential exposure.
- Evidence: `VOC-080-EV-10`.

## VOC-080-TEST-11 — Ruflo authority and old-runtime retirement guards

- Covers: `VOC-080-AC-00`, `VOC-080-AC-09`, `VOC-080-AC-10`
- Procedure: synthetic Ruflo rehearsal and negative fixtures for AGENTS overwrite, tracked launcher,
  issue/comment trigger, auto merge/close, Cloudflare command/token, production data, secrets, spend, and
  deployment; final scans for active Go/PostgreSQL/Docker/Nginx/server docs after parity; rollback T11.
- Expected: external coordination works while authority violations fail; final active tree is Cloudflare-
  native and historical evidence remains.
- Evidence: `VOC-080-EV-11`.

## VOC-080-TEST-12 — Full hosted, exact-SHA, and rollback proof

- Covers: `VOC-080-AC-11`
- Procedure: all available root/governance/web/Worker/D1/contract/migration/security/quality checks;
  `git diff --check`; hosted four-workflow graph; exact-SHA specialist reviews; reverse-order rollback in
  disposable worktrees; source/settings/live-activation inventory; visual architecture validation.
- Expected: all required evidence passes; unavailable/live-held checks are disclosed; no fabricated
  enforcement or mutation.
- Evidence: `VOC-080-EV-12`.
