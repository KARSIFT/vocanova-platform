# VOC-112 — Release and Rollback Plan

## Repository delivery only

After reviewed adoption and the VOC-105/F3 prerequisite, a different builder prepares
one implementation PR into `develop`. It passes deterministic checks, exact-SHA
security/authorization specialist review, independent R3 verification, and read-only
eligibility reporting before a separate non-author merge. Merge changes repository
history only. It does not enable a provider or deploy.

## Dormant configuration and observation

Committed staging and production magic-link/Google switches remain disabled. Provider
credentials remain absent. Repository observation consists of post-merge CI/security/
governance checks and readback that the default adapters, held switches, binding types,
public contract, schema, and pending runbook match the reviewed SHA. The outcome may be
described as `A1 provider-ready in repository`, not `A1 complete-effective`.

## Repository rollback

Before merge, close the PR. After merge, use a separately reviewed revert PR against
the exact implementation merge. Trigger on authorization bypass, credential leakage,
provider call while disabled/incomplete, identity-link/session corruption, cross-user
access, contract/schema drift, or failed required checks. Revert removes only the
repository delta; no D1 down migration or external action is needed because no schema
or live state changed.

## Later staging action (not authorized)

A separate accountable record must precede any provider or staging action. It must
name the chosen provider/vendor and contract/spend authority; Google OAuth client and
redirect allowlist; email sender/domain/inbox; exact credential binding names and
installation actor; synthetic identities and privacy/retention; enabled switches;
exact SHA and standard staging dispatch authority; monitoring; disable/remove/previous-
Worker rollback; session handling; completion/expiry; and HOLD-01/HOLD-02 boundaries.

The live acceptance procedure then must prove both methods, navigation, logout,
unauthorized/cross-user/CSRF/abuse rejection, redaction, independent kill switches,
and rollback. Results must be sanitized and separately reviewed. Failure keeps A1
pending and disables the affected provider; it never authorizes production.

## Milestone closure

VOC-112 repository implementation alone cannot close the DOC-12 A1 gate. A later
governed evidence reconciliation may mark A1 complete-effective only after exact live
staging evidence and all required reviews/authorities pass. Production traffic/D1 and
production learner data remain held under VOC-080-HOLD-01/HOLD-02, and public launch
remains separate.
