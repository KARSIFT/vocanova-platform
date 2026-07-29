# VOC-032 — Begin Milestone R1: Staging Readiness

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption, resolution of the stated open decisions, founder-provisioned
credentials, and separate implementation authorization are required before
work begins. No authorization, approval, activation, deployment, or closure
field is set by this draft.

## Identity and lifecycle

- Package ID: `VOC-032`; canonical path:
  `specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/`.
- Lifecycle: `draft`; every authorization field in `change.yaml` remains at
  its unadopted default (`approval_status: not-approved`,
  `implementation_authorized: false`, `automatic_merge_allowed: false`,
  `production_impact: unknown`, `repository_adoption_status: not-adopted`).
- Proposed risk: **R3** (proposal only — not a determination), matching
  `docs/governance/change-risk-classification.md`'s R3 row ("production
  infrastructure... CI/CD... secrets") and the path-based floor
  `scripts/governance/classify-change-risk.sh` computes for every changed
  path (`.github/workflows/*`, `*/migrations/*`, `infra/*`,
  `*/auth/*`-adjacent — all R3; nothing in scope matches the classifier's R4
  list). This is nonetheless the first package to reach a real,
  internet-reachable server, a real DNS zone, and named GitHub Actions
  secrets beyond the built-in token — see specification.md's "Risk and
  protected areas" for why that consequence is flagged rather than silently
  absorbed into "routine R3."
- Decision owner: founder; target branch: `develop`; request source: free
  text (a request to begin DOC-12 §5 R1, which also records the founder's
  own decision on this milestone's deploy shape and confirms a real,
  already-provisioned staging server and domain — see specification.md
  `VOC-032-D01`).
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3. This package's deploy target is staging, not production,
  so it does not implicate the still-disabled production/RL1/RL2 gate
  (`docs/governance/a003-transition-state.yaml`:
  `production_deployment: disabled`, `rl1_technical_activation: false`,
  `rl2_technical_activation: false`). EHR is not presumed.

## Objective and requirement source

Begin DOC-12 §5 R1: validate the release candidate under real,
production-like staging conditions, with no new product scope beyond fixes
for release-blocking defects, gated on staging stability, no unresolved
critical/high blocker, all required tests passing, a rehearsed migration and
rollback, passing AI evaluation thresholds, and founder-completed staging
acceptance, after which scope is frozen. R1 depends on scope-complete P5
(VOC-031, adopted) — but P5's own gate, and every P1–P5 gate before it, has
never had live staging evidence because DOC-12 §3's F3 "Staging Foundation"
milestone has never been built. This package is the first to build a real
staging environment at all: it stands up a database-backed API server where
today only a two-line stub exists, containerizes both applications, wires a
reverse proxy and TLS in front of them, automates deploy-on-merge, wires an
AI-evaluation pass/fail gate, and actually executes a migration-and-rollback
rehearsal against the real, founder-provisioned server — rather than
documenting a rehearsal that never runs, the pattern every prior milestone's
`staging-evidence.md` has been forced into by the missing F3 environment.

## Scope, non-goals, risk, and protected areas

Scope is the fixed sixteen-task sequence in `tasks.md` (`T00`–`T11`, `T13`–
`T15`, then `T12` last): a real DB-backed API server (`T00`); `.env.example`
(`T01`); Dockerfiles for `apps/api` and `apps/web` (`T02`–`T03`);
`docker-compose.yml` wiring `web`+`api`+`postgres`+`nginx` (`T04`); an nginx
reverse-proxy config with Cloudflare-aware TLS (`T05`); Atlas migration
tooling (`T06`); a CI/CD staging-deploy workflow triggered on push to
`develop` (`T07`); an AI-evaluation-threshold CI gate (`T08`); a
migration-and-rollback rehearsal actually run once against the real staging
target (`T09`); one live-provider AI evaluation pass (`T10`); an
`infra/README.md` update (`T11`); amending DOC-11 §1's target-infrastructure
baseline to this package's real shape (`T13`); a real transactional email
sender (`T14`); a real Google OAuth provider (`T15`); and
evidence/mock-inventory/staging-evidence/gate-readiness (`T12`, last).

**Resolved at adoption (2026-07-28, founder-gate delegation)**, superseding
this section's original draft-time framing: `VOC-032-D02` (DOC-11
contradiction) decided in favor of amending DOC-11 now — self-hosted Docker
Compose + nginx is the real production direction, not a staging-only
interim shape (`T13`). `VOC-032-D04` (F3/R1 scope-folding) confirmed as
drafted — no separate F3 package. `VOC-032-D10` (email/OAuth gap) decided in
favor of folding into this package's scope rather than accepting the
limitation (`T14`/`T15`). See `change.yaml`'s `dependencies` for the exact
resolution text and the new `VOC-032-DEP-07` (provider-account credentials,
not yet provisioned) this created.

Excluded: any new learner-facing product feature; production deployment or
RL1/RL2 activation.

Protected: `apps/api/migrations`, `apps/api/ent/schema` (no schema change,
but new tooling that executes them); `apps/api/business/auth`'s existing
token/session/rate-limit primitives (reused unmodified by the real server
wiring); `.github/workflows/*` (first-ever deploy automation and first-ever
named GitHub Actions secrets); and the real staging host/DNS zone this
package's `T09` rehearsal touches directly. Rollback must never automate a
production-style irreversible action against the real staging database
without first taking a disposable copy, per `apps/api/migrations/README.md`'s
existing rule.

## Verification, approvals, release, and closure

Every PR in this package requires Claude Code review bound to the exact
final SHA; authorization, secrets-handling, migration/rollback-safety, and
deploy-automation findings block release. Run installed commands
(`scripts/governance/validate-governance.sh`,
`scripts/governance/classify-change-risk.sh`, Go
format/vet/test/build, web lint/typecheck/build, the deterministic AI-
evaluation gate this package adds) plus, once the founder-provisioned
credentials and DNS exist (`VOC-032-DEP-00`/`DEP-01`/`DEP-03`), the live
migration-and-rollback rehearsal and live AI-evaluation pass this package's
own gate requires, plus (once `VOC-032-DEP-07` is resolved) one live email
delivery and one live Google OAuth exchange. Adopted 2026-07-28
(founder-gate delegation): `implementation_authorized`/`automatic_merge_allowed`
are `true` in `change.yaml`; `VOC-032-D02`/`D04`/`D10` are resolved per the
section above. `VOC-032-DEP-00`/`DEP-01`/`DEP-03`/`DEP-07` remain open and
block only the specific live-evidence steps they name, not routine
development.
