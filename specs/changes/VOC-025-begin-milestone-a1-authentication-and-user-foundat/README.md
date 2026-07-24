# VOC-025 — Begin Milestone A1: Authentication and User Foundation

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption, resolution of the stated open decisions, and separate implementation
authorization are required before work begins.

## Identity and lifecycle

- Package ID: `VOC-025`; canonical path: `specs/changes/VOC-025-begin-milestone-a1-authentication-and-user-foundat/`.
- Lifecycle: `draft`; all authorization fields in `change.yaml` remain unadopted.
- Proposed risk: **R3**. Auth, authorization, identity data, sessions, secrets boundaries, and database migrations are protected. This is a proposal only; the implementation-time classifier, builder, verifier, and applicable human authority govern the actual class.
- Decision owner: founder; target branch: `develop`; request source: free text.
- A-003 is active: routine R3 requires strengthened controls and exact-SHA independent verification but not standing steward/founder approval solely because it is R3. An R4 privacy, trust, provider, or material scope decision remains founder-controlled. EHR is not presumed.

## Objective and requirement source

Begin DOC-12 §5 A1: secure learner identity and server-managed sessions under personalized capability. DOC-04 §§6–10,16–18, DOC-05 §§1,6,17–18, DOC-06 §§5–7,15–17, and DOC-07 define Go/Huma, PostgreSQL/Ent/Atlas, OpenAPI, magic-link, Google OAuth, secure cookie, CSRF, authorization, and test architecture. The request adds existing `(app)` route protection, API cross-user protection, auth rate limits, and reconciliation of VOC-010–VOC-024 mock sources.

## Scope, non-goals, risk, and protected areas

Scope is a fixed multi-PR sequence for identity/session persistence; magic-link and Google OAuth; secure session creation, validation, expiry, logout/invalidation, CSRF, rate limiting, cleanup; API authentication/authorization; and an authenticated shell for home, discover, progress, and word detail. Learner-owned resources must be requester-scoped and inaccessible cross-user.

Excluded: password login, additional providers, auth SaaS, account deletion/onboarding/settings, new learning behavior, production deployment, real credentials, and invented learning APIs. `VOC-025-D05` leaves the mock-source replacement boundary open. Database/migration, identity-data, authn/authz, and credential effects require R3 controls; rollback must preserve integrity and never re-enable unsafe sessions.

## Verification, approvals, release, and closure

Every A1 PR requires Claude Code review under DOC-12, bound to the exact final SHA; identity/session/authorization findings block release. Run installed checks plus Go unit/HTTP/PostgreSQL/migration/contract/auth tests and web route/session tests as applicable. Staging validation and rollback rehearsal are required before the A1 gate can be evaluated. This draft grants no approval, merge, activation, credentials, deployment, or closure authority.
