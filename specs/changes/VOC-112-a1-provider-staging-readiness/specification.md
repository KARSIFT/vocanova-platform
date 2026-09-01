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

Implement a Worker-compatible `OAuthProvider` adapter using injected `fetch` and a
bounded timeout. It obtains the client ID/secret only from typed runtime inputs,
constructs a Google authorization URL with the approved callback and least necessary
`openid email profile` scope, exchanges the authorization code at an HTTPS token
endpoint, and retrieves identity from an HTTPS user-info endpoint. Endpoint overrides
are allowed only as constructor-level test injection; live configuration uses fixed
Google HTTPS endpoints.

Strictly validate HTTP status, content type/JSON shape, `sub`, normalized email,
`email_verified`, and bounded display/avatar fields. The adapter returns only the
existing `OAuthIdentity` fields. Provider access/refresh/ID tokens, code, client secret,
state bearer, and raw response are ephemeral and must never reach D1, logs, errors,
responses, telemetry, snapshots, or evidence. The existing service remains responsible
for stored state consumption, cookie comparison, verified-email enforcement,
identity-link transactionality, disabled-user rejection, and session issuance.

### VOC-112-D02 — Transactional email boundary

Use the existing provider-neutral `HttpEmailSender` shape rather than select an email
vendor in code. Harden it where tests identify gaps: HTTPS outside explicit local test
injection, validated endpoint/sender, bearer authentication from runtime input,
bounded body and timeout, 2xx-only success, response cancellation, and generic failure
without credential or magic-link disclosure. Magic-link/account service content and
enumeration-resistant public responses remain unchanged. CI supplies fake fetch and
synthetic addresses only.

Vendor selection, provider-specific payload changes, account/domain/sender setup,
contract, and spend are later accountable decisions. If the chosen provider cannot
satisfy the adopted HTTP contract, a new governed package must change that contract;
the implementer may not silently specialize it.

### VOC-112-D03 — Fail-closed dependency construction

Create one identity dependency factory used by the default app. Feature switches off
means no credential is required and no provider network call is possible. When a
switch is on, the complete corresponding provider configuration must validate before
that provider can be used. Missing/partial/malformed values yield a privacy-safe
unavailable response and no session/provider call; live modes never substitute a fake
sender or OAuth identity. Provider construction must not make `/healthz` or unrelated
disabled capabilities disclose configuration or credentials.

Staging and production switches remain `false` in committed `wrangler.jsonc`.
Production sentinels, routes, D1 binding, service binding, and holds remain unchanged.
Local behavior may remain credential-free; any local real-provider use must require an
untracked developer-only secret source and is not acceptance evidence.

### VOC-112-D04 — Binding and secret boundary

The runtime interface uses these exact names and no aliases:

- non-secret configuration: `EMAIL_PROVIDER_URL`, `EMAIL_FROM`,
  `EMAIL_PROVIDER_TIMEOUT_MS`, and `GOOGLE_OAUTH_CLIENT_ID`;
- secret bindings: `EMAIL_PROVIDER_API_KEY` and `GOOGLE_OAUTH_CLIENT_SECRET`; and
- existing configuration reused unchanged: `OAUTH_REDIRECT_URI`,
  `MAGIC_LINK_ENABLED`, and `GOOGLE_OAUTH_ENABLED`.

Non-secret defaults may be committed only when they do not select/purchase a provider
or enable a feature. Secret values never enter Wrangler config, git, generated types,
fixtures, GitHub comments, or artifacts. Generate committed Worker types only from
the committed Wrangler surface; represent externally installed secret bindings through
the minimum checked source interface rather than fabricating secret values in config.
The generated type staleness check must pass.

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

### VOC-112-D07 through D09 — Delivery, review, and prohibitions

One adopted repository implementation PR contains adapters, factory/config/types,
tests, runbook, directly affected documentation, and deterministic generated outputs.
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
