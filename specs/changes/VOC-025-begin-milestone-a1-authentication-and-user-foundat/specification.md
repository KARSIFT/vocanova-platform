# VOC-025 — Begin Milestone A1: Authentication and User Foundation: Specification

## Objective and requirement source

Deliver the DOC-12 A1 foundation: real user/identity/session persistence, email magic-link and Google OAuth authentication, server-managed lifecycle, protected web routes, API authorization, and auth abuse protection. Architecture is Go + chi/Huma, PostgreSQL + Ent/Atlas, explicit OpenAPI DTOs/generated client; Next.js never accesses PostgreSQL directly.

## Scope and non-goals

1. Add `users`, `external_identities`, sessions, and magic-link Ent schemas/versioned Atlas migrations; follow DOC-05 §6 constraints.
2. Add explicit auth/current-user DTOs, Huma routes, standard errors, committed OpenAPI and typed-client artifacts; never expose Ent models.
3. Implement email magic-link and Google OAuth flows using external provider interfaces; create/link internal identities only from verified provider data.
4. Use opaque, cryptographically random bearer values only in Secure HttpOnly cookies; persist hashes, user reference, creation/expiry/revocation metadata. Enforce 30-day non-sliding sessions, 15-minute single-use hashed links, logout, CSRF double-submit, auth rate limits, and expiry cleanup.
5. Add deny-by-default API authn/authz: `/me` is authenticated; requester-scoped private resources return 404 when inaccessible; disabled users cannot authenticate.
6. Protect current `(app)` home, discover, progress, situation, and word-detail routes; add the adopted sign-in/return/logout journey and access identity through the Go API only.

Excluded: passwords, non-Google providers, auth SaaS, account deletion, onboarding/profile/settings, P1–P4 behavior, production deployment, real secrets, and invented domain APIs.

## Risk and protected areas

Proposed R3 is not a determination. Authentication, authorization, sensitive identity data, sessions, migrations, secrets boundaries, and deployment effects are protected. A-003 requires strengthened risk-specific controls and independent verification for routine R3. A material privacy/trust/provider or product-scope decision is R4 and needs founder authority.

## Decisions, contradictions, security, and privacy

`VOC-025-D00` — **Canonical session baseline.** PostgreSQL-backed opaque hashed sessions, Secure HttpOnly cookie, 30-day lifetime, no sliding renewal; never expose provider tokens, database IDs, or raw session bears.

`VOC-025-D01` — **Canonical methods/identity.** Google OAuth and email magic link only. Links are hashed, single-use, 15-minute. `external_identities` stores provider subject; business data references Vocanova user ID only.

`VOC-025-D02` — **Authorization.** Active requester identity is passed through handler/service queries; no client-supplied user ID authorizes access. Missing/expired/revoked access fails; inaccessible private resources return 404.

`VOC-025-D03` — **Abuse/security controls.** Unsafe authenticated methods require `X-CSRF-Token`; rate limits precede costly provider work and do not enumerate accounts. Logs/errors omit tokens, credentials, magic-link values, and secrets.

`VOC-025-D04` — **Mandatory order.** `T00 → T01 → T02 → T03 → T04 → T05`; each PR is independently reviewed and splitting cannot reduce combined R3 consequence.

`VOC-025-D05` — **OPEN, founder scope decision.** “Replace every mock/placeholder source” conflicts with DOC-12’s A1→P1–P4 dependency and screens lacking approved learning endpoints. Adoption must either retain learning mocks until their milestone contracts exist, or expand scope with a complete endpoint/field/ownership/acceptance specification. No learning API is invented here.

`VOC-025-D06` — **OPEN, founder user-journey decision.** Choose login route, return destination, public landing behavior, and provider/error/privacy copy. The documents require an authenticated shell but do not settle this user-facing policy.

`VOC-025-D07` — **OPEN, adopted technical design.** Cookie name/domain/SameSite, token construction/rotation, rate-limit key/window/threshold, OAuth redirect allowlist, email sender, and staging isolation must meet D00–D03, be documented, environment-isolated, and secret-free in source. “Refresh” means validation/reissue within the fixed non-sliding policy unless a later approved decision changes DOC-06.

## Data, migrations, analytics, and accessibility

Email, verified provider metadata, and session lifecycle metadata are sensitive operational data: minimize, hash bearers, use UTC, and do not log/analytics-identify them. Migrations need forward/backward compatibility review, disposable PostgreSQL rehearsal, explicit execution outside startup, and session-safe recovery. Analytics is excluded. Auth UI requires labelled keyboard controls, visible focus, semantic errors, non-color-only state, sensible redirect focus, and mobile support.
