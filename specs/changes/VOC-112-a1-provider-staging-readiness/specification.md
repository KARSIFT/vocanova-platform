# VOC-112 — Specification

## Objective and current-state finding

Complete the repository-side A1 provider boundary on the current
Next.js/OpenNext + Hono Worker + D1 architecture without reimplementing the identity
foundation and without activating any live system.

The approved product outcome is DOC-12's A1 gate: Google OAuth and email magic-link
authentication, durable sessions through normal navigation, denied unauthenticated and
cross-user access, effective logout, and critical security checks. Issue #189 asks for
the distinct implementation intake after F3. It is intake only.

Current `develop` already contains:

- D1 users, external identities, sessions, magic links, OAuth state, rate limits,
  onboarding, settings, email change, and account-deletion persistence;
- Hono routes and service rules for hashed/single-use tokens, OAuth state, secure
  cookies, CSRF, expiry/revocation, requester authorization, and logout;
- API client and accessible sign-in, magic-link, onboarding, protected-shell, and
  account UI; and
- deterministic workerd, migration, authorization, cross-user, contract, browser,
  and accessibility coverage.

The default Worker nevertheless injects an unavailable email sender and `null` OAuth
provider. `HttpEmailSender` exists but is not runtime-wired; no active TypeScript
Google provider exists. Committed staging and production feature switches are off.
Therefore repository parity is not evidence that both supported methods work in
staging.

## Decisions

### VOC-112-D00 — Extend; do not rebuild

Preserve VOC-025/VOC-080 behavior and D1 schema. Retired Go/PostgreSQL/server assets
and historical packages are evidence, not current implementation targets. No P1+
learning behavior, new auth method, password login, auth SaaS, schema migration,
public endpoint, account-policy change, or session-renewal change is in scope.

### VOC-112-D01 — Google adapter contract

Implement a Worker-compatible `OAuthProvider` adapter using injected `fetch` and an
exact mandatory 8,000-ms timeout. Production code uses these literal endpoints, with
no runtime override:

- authorization: `https://accounts.google.com/o/oauth2/v2/auth`;
- token: `https://oauth2.googleapis.com/token`; and
- user info: `https://openidconnect.googleapis.com/v1/userinfo`.

The authorization URL is a browser `GET` with exactly `client_id`, `redirect_uri`,
`response_type=code`, `scope=openid email profile`, and `state`; it adds no `prompt`,
offline-access, or extra-scope parameter. Token exchange is `POST` with
`redirect: "error"`, `Accept: application/json`,
`Content-Type: application/x-www-form-urlencoded`, and exactly `code`, `client_id`,
`client_secret`, `redirect_uri`, and `grant_type=authorization_code` in the form body.
User-info retrieval is `GET` with `redirect: "error"`, `Accept: application/json`,
and `Authorization: Bearer <access token>`, with no query token, cookie, or request
body. Endpoint injection is allowed only as an explicit constructor test seam using
`*.example.test`; the same no-credentials/query/fragment and no-redirect policy applies.

The token response ceiling is exactly 16,384 decoded body bytes and the user-info
response ceiling is exactly 65,536 decoded body bytes. One shared bounded-reader must:

1. acquire the body reader before validation enters a single `try`/`finally` cleanup
   region;
2. parse a present `Content-Length` only with `^(0|[1-9][0-9]*)$` and reject a
   malformed or over-ceiling declaration before reading or JSON parsing;
3. sum decoded `Uint8Array` chunk byte lengths, stopping
   before retaining more than the ceiling even when length is missing, dishonest, or
   transfer is chunked;
4. reject the first byte beyond the ceiling before JSON parsing; and
5. in one `finally`, invoke `reader.cancel()` (suppressing only cancellation-cleanup
   failure) and `reader.releaseLock()` on success, non-2xx, content-type/JSON/shape/read
   error, timeout/abort, redirect rejection, declared oversize, and streamed oversize.
   A null body is a bounded failure with no reader to dispose.

The abort timer is cleared in `finally`. Non-2xx/redirect bodies are never parsed for
provider detail; when a response exists they are disposed and become one generic
provider failure. If fetch rejects before yielding a response (including native
`redirect: "error"` rejection), no body exists and only abort/timer cleanup applies.
Both endpoints accept media type `application/json` case-insensitively with optional
parameters and reject every other media type. The token JSON object accepts exactly
required `access_token` (1–8,192 UTF-8 bytes) and
`token_type` (ASCII case-insensitive `Bearer`), plus optional `expires_in` (integer
1–86,400), `scope` (0–2,048 UTF-8 bytes), and `id_token` (1–12,288 UTF-8 bytes).
Unknown fields—including `refresh_token`—or wrong types fail; only `access_token` is
used for the immediately following user-info request and all token fields are discarded.

Strictly validate the user-info object. Consume only `sub` (1–255 UTF-8 bytes),
normalized email (3–254 bytes), `email_verified` exactly `true`, optional `name` (at
most 80 Unicode scalar values and 320 UTF-8 bytes; missing becomes empty), and optional
`picture`; bounded unknown Google claims are ignored and never persisted. Wrong types
or overbounds fail. An avatar is retained only when its UTF-8 representation is at
most 2,048 bytes and it
parses as HTTPS with no username, password, query, fragment, or non-default port and a
hostname equal to `googleusercontent.com` or ending in `.googleusercontent.com`;
otherwise return the existing empty avatar value rather than fail authentication. The
adapter returns only existing `OAuthIdentity` fields. Provider access/refresh/ID tokens,
code, client secret, state bearer, and raw response are ephemeral and never reach D1,
logs, errors, responses, telemetry, snapshots, or evidence. The existing service owns
stored-state consumption, cookie comparison, verified-email enforcement, transactional
linking, disabled-user rejection, and session issuance.

### VOC-112-D02 — Transactional email boundary

Use the existing provider-neutral `HttpEmailSender` shape rather than select an email
vendor in code. Its endpoint must be HTTPS, have a nonempty hostname, default port,
be at most 2,048 UTF-8 bytes, and have no username, password, query, or fragment. Its
sender and recipient are single 3–254-byte ASCII mailboxes without whitespace/control/
CR/LF; subject is 1–160 UTF-8 bytes with no control/CR/LF; text is 1–8,192 UTF-8 bytes;
and the serialized JSON request is at most 16,384 UTF-8 bytes before fetch. Its API key
is a required 1–4,096-byte control-free runtime secret. It uses the exact mandatory
8,000-ms timeout,
`redirect: "error"`, bounded request fields, 2xx-only success, and response-body
cancellation on every success/non-2xx/redirect path. Provider failures are generic and
never disclose credential or magic-link payload. Fake-transport tests prove that a 3xx
cannot forward the bearer, recipient, subject, or magic-link body to another origin.
Magic-link/account content and enumeration-resistant public responses remain unchanged.
CI supplies fake fetch and synthetic addresses only.

`HttpEmailSender` remains independently constructible for injected fake-transport
tests. Its constructor may accept an explicit integer timeout from 100 through 10,000
ms and may retain 8,000 ms as its direct-constructor default. Existing
`ai-email-observability-parity.test.ts` may keep its synthetic 100-ms timeout so the
test is fast and bounded, but must replace `Vocanova <noreply@example.test>` with exact
`noreply@example.test` and update the asserted payload while preserving HTTPS,
authorization, no-retry, provider-body redaction, and observability/parity intent.
Production is different: `provider-factory.ts` is the sole default-app construction
path, must require `AUTH_PROVIDER_TIMEOUT_MS` exactly `"8000"`, explicitly pass 8,000,
and must never obtain production behavior from the constructor default.

Vendor selection, provider-specific payload changes, account/domain/sender setup,
contract, and spend are later accountable decisions. If the chosen provider cannot
satisfy the adopted HTTP contract, a new governed package must change that contract;
the implementer may not silently specialize it.

### VOC-112-D03 — Fail-closed dependency construction

Create one identity dependency factory used by the default app. The required matrix is
literal:

| Capability       | Switch off                                                                                                                            | Switch on                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Magic link/email | `EMAIL_PROVIDER_URL`, `EMAIL_FROM`, and `EMAIL_PROVIDER_API_KEY` are ignored and may be absent/empty/malformed; no email network call | all three must pass D02; `AUTH_PROVIDER_TIMEOUT_MS` must be integer string `8000`; otherwise only email is unavailable                                                                                                                                                                                                                                                                                                            |
| Google OAuth     | `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are ignored and may be absent/empty/malformed; no Google call               | both must be nonempty, control-free strings at most 512 UTF-8 bytes; `OAUTH_REDIRECT_URI` must exactly equal the committed callback for the active environment (`http://127.0.0.1:8080/api/v1/auth/oauth/google/callback`, `https://api-stag.vocanova.site/api/v1/auth/oauth/google/callback`, or the held production sentinel), with no credentials/query/fragment; timeout must be `8000`; otherwise only Google is unavailable |

There is no runtime timeout default: the committed `AUTH_PROVIDER_TIMEOUT_MS="8000"`
is mandatory whenever either switch is enabled. Complete email + disabled/malformed
Google must leave email working; complete Google + disabled/malformed email must leave
Google working; with both enabled, one malformed capability fails independently while
the complete one still works. No invalid capability falls back to a fake, issues a
session, or contacts a network. `/healthz` and unrelated disabled capabilities disclose
no configuration or credential detail.

Staging and production switches remain `false` in committed `wrangler.jsonc`.
Production sentinels, routes, D1 binding, service binding, and holds remain unchanged.
Local behavior may remain credential-free; any local real-provider use must require an
untracked developer-only secret source and is not acceptance evidence.

### VOC-112-D04 — Binding and secret boundary

The runtime interface uses these exact names and no aliases:

- non-secret configuration: `EMAIL_PROVIDER_URL`, `EMAIL_FROM`,
  `AUTH_PROVIDER_TIMEOUT_MS`, and `GOOGLE_OAUTH_CLIENT_ID`;
- secret bindings: `EMAIL_PROVIDER_API_KEY` and `GOOGLE_OAUTH_CLIENT_SECRET`; and
- existing configuration reused unchanged: `OAUTH_REDIRECT_URI`,
  `MAGIC_LINK_ENABLED`, and `GOOGLE_OAUTH_ENABLED`.

Every local, staging, and production API Worker `vars` object receives literal `""`
for `EMAIL_PROVIDER_URL`, `EMAIL_FROM`, and `GOOGLE_OAUTH_CLIENT_ID`, plus literal
`"8000"` for `AUTH_PROVIDER_TIMEOUT_MS`. These disabled sentinels do not select a
provider or enable a feature. Add the same literals to
`EXPECTED_WRANGLER_ROOTS.api.vars` and each environment-specific `expectedApi.vars`
map in `scripts/foundation/cloudflare-delivery-policy.mjs`; focused tests mutate every
new key in root/staging/production maps and require exact-map failure. No other delivery
policy behavior changes.

Secret values never enter Wrangler config, git, generated types, fixtures, comments,
or artifacts. Generate `worker-configuration.d.ts` only from committed Wrangler config;
represent the two externally installed secret bindings through the minimum checked
interface in `provider-factory.ts`, never fabricated config values. Type staleness passes.

This package does not change the `cloudflare-staging` GitHub environment, whose two
Actions secret names remain only `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN`. Provider runtime secrets are a separate future Worker/settings
action, not an implicit addition to that GitHub Actions interface. The Cloudflare
delivery policy remains fail closed on unknown config.

### VOC-112-D05 — End-to-end behavior and security

Do not change the public API shape. Preserve both auth flows, exact allowed return
destinations, OAuth state cookie + stored-state one-use checks, session/CSRF cookies,
30-day non-sliding session lifetime, logout revocation, onboarding routing, and
requester-scoped API rules. Prove failure for malformed/provider-error/unverified
OAuth identity, link/state replay and expiry, disabled account, absent/mismatched CSRF,
unauthenticated access, guessed IDs, and cross-user idempotency/resource access.

Errors must remain accessible, actionable, enumeration resistant, and free of secret
details. Authentication failures and provider outages do not fall through to an
authenticated shell or create partial identities/sessions.

### VOC-112-D06 — Staging acceptance remains pending

Add `docs/operations/a1-staging-acceptance.md` as a sanitized pending template. It
must define exact-SHA/attempt binding and procedures for:

1. one real magic-link request, receipt, single consume, replay denial, and redacted
   logs using a disposable non-production inbox;
2. one real Google start/callback with a disposable non-production Google identity,
   plus mismatched/replayed-state denial;
3. session navigation, onboarding routing, logout and old-cookie denial;
4. unauthenticated, two-user cross-access, CSRF, disabled-user, and abuse-limit checks;
5. independent disabling of each provider switch without bypass/fake fallback;
6. exact Worker rollback and forward-only D1 integrity (no schema change expected).

Every result is `pending-separate-authority` in the implementation PR. A later action
record must identify provider accounts, credential installation, test identities,
dispatch/deployment authority, evidence minimization, rollback, and expiry. Only after
real evidence passes may another governed change mark A1 complete-effective.

Index the runbook from `docs/operations/README.md`. Add
`scripts/foundation/a1-staging-acceptance-policy.mjs` plus its `.test.mjs` suite. The
network-free policy validates exact pending status, SHA/attempt/provider/auth/abuse/
redaction/kill-switch/rollback fields, later-authority and HOLD-01/HOLD-02 boundaries,
and rejects completion claims, live results, secrets/personal data, missing steps, or
an unindexed runbook. The root foundation wildcard executes the test; no package-script
change is allowed.

### VOC-112-D07 through D09 — Delivery, review, and prohibitions

One adopted repository implementation PR changes exactly these sixteen paths:

1. `apps/api-worker/src/app.ts`
2. `apps/api-worker/src/identity/http-email-sender.ts`
3. `apps/api-worker/src/identity/google-oauth-provider.ts`
4. `apps/api-worker/src/identity/provider-factory.ts`
5. `apps/api-worker/test/ai-email-observability-parity.test.ts`
6. `apps/api-worker/test/identity-provider-adapters.test.ts`
7. `apps/api-worker/test/identity-parity.test.ts`
8. `apps/api-worker/worker-configuration.d.ts`
9. `apps/api-worker/wrangler.jsonc`
10. `docs/development.md`
11. `docs/operations/README.md`
12. `docs/operations/a1-staging-acceptance.md`
13. `scripts/foundation/a1-staging-acceptance-policy.mjs`
14. `scripts/foundation/a1-staging-acceptance-policy.test.mjs`
15. `scripts/foundation/cloudflare-delivery-policy.mjs`
16. `scripts/foundation/cloudflare-delivery-policy.test.mjs`

No web file, OpenAPI/client artifact, schema/migration, package/workflow/manifest,
package script, package-lock, or other generated/documentation path may change.
The exact implementation requires a security/authorization specialist and a separate
independent R3 verifier. Complete installed checks and a disposable full-diff reverse
rehearsal must pass before a separate non-author merge actor acts.

No actor under this package may select or purchase providers, create accounts/OAuth
clients, verify domains, create/install/read/rotate credentials, change GitHub or
Cloudflare settings, enable staging/production switches, dispatch/deploy, migrate D1,
alter DNS/traffic, use production or learner data, or launch. No R3 label, plan merge,
review, or GitHub eligibility output supplies that authority.

## Risk, privacy, data, and accessibility

R3 is the highest consequence: authentication/authorization, personal identity,
secrets interfaces, and protected Worker configuration change. The product methods and
user-trust policy are already canonical; no material new direction or live action is
decided, so this package does not invoke R4. No schema/data migration, analytics, AI,
audio, billing, or production action occurs. Synthetic tests must prove accessibility
and privacy behavior without real credentials or personal data.

## Assumptions and resolved boundaries

- F3 completion in VOC-105 is a hard prerequisite to implementation, not something
  this package infers from the prior successful delivery alone.
- Provider-neutral HTTP email is the current repository contract; choosing a vendor is
  explicitly deferred rather than left to the implementer.
- Live staging activation/evidence is explicitly deferred rather than falsely bundled
  into a repository-only PR.
- No material open question remains for repository implementation. A later provider
  action cannot start until its vendor/account/spend/credential decisions and authority
  are independently recorded.
