# VOC-037-EV-03 — Kill switches and rollback verification against production (T03)

## Scope and why this is founder-gate-delegate-authored

The implementer role correctly refused this task (recorded on issue #263):
`VOC-037-TEST-03` requires live toggling of production kill switches and a
real redeploy rehearsal, which no implementer sandbox has access to perform.
This evidence was produced directly by the founder-gate delegate against the
real production target (`130.185.123.152`), the same pattern used for
`VOC-037-T06`'s evidence and VOC-032-T09/T10 in R1.

## Standing of `VOC-037-AC-03`

**Partially satisfied.** All four kill switches were verified live to
produce a genuinely different, documented behavior when toggled. The
redeploy mechanism was exercised successfully. One genuine, previously
undiscovered bug was found and is recorded below rather than hidden -
Google OAuth cannot currently complete an authenticated sign-in end-to-end
in either staging or production, for reasons unrelated to any kill switch.

## Kill switch verification (2026-08-01, live against production)

### `EMAIL_MAGIC_LINK_ENABLED`

| State | Request | Result |
| --- | --- | --- |
| `false` (baseline) | `POST /api/v1/auth/magic-links {"email":"..."}` | `503` "Magic link sign-in is disabled" |
| `true` | same request | `204` (request accepted) |

Toggle verified to produce the documented behavior change. Full delivery
(does the learner actually receive the email) is separately blocked on real
outbound email-provider credentials (production-tier equivalent of
`VOC-032-DEP-07`, still open) - `email.Fake` is wired in either state until
those exist, so this verifies the kill-switch gate, not delivery.

### `GOOGLE_OAUTH_ENABLED`

| State | Request | Result |
| --- | --- | --- |
| `false` (baseline) | `POST /api/v1/auth/oauth/google/start` | `503` "Google OAuth sign-in is disabled" |
| `true` | same request | `200`, real `state` token issued, `Set-Cookie: vocanova_oauth_state=...` |
| `false` | `GET /api/v1/auth/oauth/google/callback?code=x&state=y` | `503` |

Toggle verified to produce the documented behavior change on both the start
and callback endpoints.

**Bug found while attempting a full round-trip (not a kill-switch defect):**
`app/api/production.go` wires the OAuth CSRF-state cookie's `Domain` to
`cfg.SessionDomain` (`SESSION_COOKIE_DOMAIN`, e.g. `production.vocanova.site`
- the **web** app's hostname). But `OAuthStart`/`OAuthCallback` are served
from the **API** host (`api-production.vocanova.site`), a sibling subdomain,
not a child of the web hostname. A cookie scoped to `production.vocanova.site`
is never sent by a real browser back to `api-production.vocanova.site`, so
the callback always fails with "invalid or expired oauth state" for any
real client, regardless of the kill switch or real Google credentials. This
was only discoverable by attempting a genuine live round-trip (verified
directly: `curl -i` on `Start` shows `Set-Cookie: ...Domain=production.vocanova.site`;
the callback correctly rejects a request that can't present that cookie).

This is a **pre-existing defect** in T14/T15's original wiring, not
introduced by T03/T06 - staging has the identical `staging.vocanova.site` /
`api-staging.vocanova.site` sibling-subdomain split, so the same bug exists
there. It was never caught because no prior task attempted a full live
OAuth round-trip (all prior evidence was blocked on `VOC-032-DEP-07`'s real
Google credentials before reaching this cookie-domain step). **Not fixed by
this task** - flagged as a concrete, diagnosed follow-up: the OAuth state
cookie should not reuse `SESSION_COOKIE_DOMAIN`; it only needs to round-trip
between the API host's own start/callback endpoints, so it should be
host-only (no explicit `Domain`, or the API's own hostname).

### `NEW_USER_SIGNUP_ENABLED`

Gated inside `ConsumeMagicLink`/OAuth-callback for a never-before-seen
identity only (`auth/killswitches.go`). Completing a full sign-in to reach
this code path requires either real magic-link delivery or a working OAuth
round-trip - both are currently blocked (email: real provider credentials
don't exist yet; OAuth: the cookie-domain bug above). Verified instead by:

- Code citation confirming the gate exists and is wired
  (`auth/killswitches.go`'s `NewSignupsEnabled` / `ErrSignupsDisabled`).
- The production startup log line reflecting the live env value, toggled
  and re-observed: `signups=off` at every point in this rehearsal (the
  founder-decided safe default; never toggled `true` in production, since
  doing so with no way to complete a full sign-in would not have produced
  additional evidence).

**Not independently HTTP-verified end-to-end** - recorded honestly as a
partial result, not a fabricated pass, per this session's evidence
standard.

### `AI_FEATURES_ENABLED`

| State | Startup log |
| --- | --- |
| `true` (baseline) | `api: listening on :8080 (env=production, ai=on, magic=off, oauth=off, signups=off)` |
| `false` | `api: listening on :8080 (env=production, ai=off, magic=off, oauth=off, signups=off)` |
| `true` (restored) | `ai=on` confirmed again |

Toggle verified via the documented startup-log signal
(`cmd/api/main.go`'s `boolFlag` line) and code citation
(`aifeedback.NewDisabledGate()` vs `AlwaysEnabledGate()` in
`app/api/production.go`). HTTP-level verification via
`/api/v1/sentence-feedback` requires an authenticated learner session,
which is blocked by the same email/OAuth limitations above - not
independently HTTP-verified end-to-end, recorded honestly.

## Rollback-by-redeploy rehearsal (2026-08-01)

This is the **first** successful production deploy, so there is no
distinct prior-version artifact to roll back to yet. The redeploy
*mechanism* itself (DOC-11 §3: "redeploy previous known-good artifact") was
exercised in full instead:

1. Recorded the running image digest:
   `ghcr.io/karsift/vocanova-api@sha256:cc88b4e4403d897372777a3c9c75be5cc3dc0fb4be67b9949f144f238aa04aba`
2. Ran a full `docker compose pull` + `up -d --force-recreate` for all four
   services (`postgres`, `api`, `web`, `nginx`) against the same
   `sha-fd5d1f7` tag - the only artifact that exists at this point in the
   project's life.
3. `pull` itself reported `denied` in this manual SSH session because I was
   not logged into `ghcr.io` interactively (the real `deploy-production`
   workflow authenticates before pulling and does not have this problem -
   confirmed by the real deploy run, PR #273's evidence). Compose fell back
   to the already-present local images and proceeded.
4. All four containers recreated and reported healthy.
5. Both public endpoints re-verified immediately after:
   `https://production.vocanova.site:8443/` → `200`;
   `https://api-production.vocanova.site:8443/healthz` → `200`,
   `{"status":"ok","database":"ok"}`.

**Disclosed limitation:** this proves the redeploy/recreate/health-check
mechanism works end-to-end, and that a fresh `docker compose pull` failing
does not corrupt the running deployment (compose safely falls back rather
than tearing down first) - but it does not prove a genuine two-different-
versions rollback, since only one version has ever been deployed to
production. That fuller test becomes possible once a second real
production deploy exists.

## Production state restored after rehearsal

`AI_FEATURES_ENABLED=true`, `EMAIL_MAGIC_LINK_ENABLED=false`,
`GOOGLE_OAUTH_ENABLED=false`, `NEW_USER_SIGNUP_ENABLED=false` - the
founder-decided safe launch defaults established when `VOC-037-T06` first
deployed. Verified via the startup log and a final health check
(`{"status":"ok","database":"ok"}`) after this evidence was compiled.

## Follow-ups this task surfaced (not fixed here)

1. **OAuth state cookie domain bug** (above) - blocks Google sign-in from
   ever completing, in staging and production, independent of real
   credentials. Concrete, diagnosed fix identified but not applied in this
   task (out of T03's scope; T03 verifies switches and rollback, not new
   defect fixes).
2. `NEW_USER_SIGNUP_ENABLED` and the HTTP-level half of
   `AI_FEATURES_ENABLED` remain unverified end-to-end pending (1) and real
   email-provider credentials.
