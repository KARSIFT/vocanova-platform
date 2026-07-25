# VOC-025 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft is adopted, D05/D06 are resolved, the current `develop` base/repository commands are recorded, F3 readiness is evidenced, and applicable provider setup is approved. Auth, sessions, migrations, sensitive data, credentials, and any infrastructure effects are R3 protected. Preserve existing compatible work; no secret or provider configuration enters source control.

## File reconciliation and implementation sequence

First inventory the actual scaffold and all VOC-010–VOC-024 mocks; classify each target as preserve, compatible extension, replacement under adopted contract, or separately proposed. Execute T00 through T05 in order. Keep domain logic independent of Huma/chi/provider SDKs; use interfaces only at true email/OAuth/clock boundaries. Commit generated OpenAPI/client artifacts with their source changes. Do not wire frontend mocks until D05 explicitly permits the matching approved contract.

## Validation and independent verification

Run all installed relevant commands discovered at implementation time, including root workspace validation, Go format/vet/test/build, web lint/typecheck/build/format, migration/integration, contract/OpenAPI/client drift, dependency/secret, and security tests. Claude Code independently reviews each exact final SHA for scope, classifier floor, migration safety, session/token/cookie/CSRF/rate-limit behavior, authorization, secrets/logging, accessibility, staging/rollback evidence, and implementer separation. Missing provider/staging/tooling evidence remains a blocker/limitation, never a pass.

## Deployment and rollback

This draft authorizes no deployment. Future staging rollout is ordered: migration under the approved procedure, deploy, health/smoke checks, fake/test identity auth methods, session/authorization/abuse validation, monitoring, then rollback rehearsal. Trigger rollback on auth bypass, cross-user access, leaked bearer/secret, migration integrity fault, excessive auth failures, or failed health checks. Roll back/recover under the approved procedure, invalidate unsafe sessions, validate integrity, and record last-known-good revision; production activation remains separately governed.
