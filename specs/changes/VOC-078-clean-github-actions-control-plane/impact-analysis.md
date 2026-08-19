# VOC-078 — Impact Analysis

## Security and authority

The package reduces workflow write authority and removes AI/API credentials from the normal PR
path. The principal risk is governance regression: without GitHub private-repository branch
protection, written human-review policy is not a technical merge barrier. Documentation must say
this plainly. A future GitHub plan upgrade or narrowly scoped GitHub App may restore technical
enforcement under a separate package.

## Production and operations

Existing production services continue running. What stops is repository-driven future change:
automatic package release, promotion to `main`, staging deployment, production deployment,
server-health polling, Cloudflare mutation, and scheduled Sentry issue creation.

This is intentional because the destination server architecture is unsettled. Operational staff
must not interpret the absence of a deploy workflow as authorization to run undocumented manual
production changes.

## Application, data, privacy, and accessibility

No application, database, migration, user-data, privacy-policy, or analytics changes. Existing
accessibility and performance checks are preserved. Runtime infrastructure stays as-is.

## Risks

- `VOC-078-R00`: accidental loss of a deterministic safety check during consolidation.
  Mitigation: parity matrix and negative tests before deleting old workflows.
- `VOC-078-R01`: documentation claims enforcement that GitHub Free cannot provide.
  Mitigation: explicit non-enforcement language and independent verification.
- `VOC-078-R02`: deleting deploy workflows is mistaken for stopping production.
  Mitigation: docs distinguish running services from future deployment automation.
- `VOC-078-R03`: an oversized single diff is hard to review or roll back.
  Mitigation: additive CI first, then bounded deletion/reconciliation tasks.
- `VOC-078-R04`: third-party security action introduces supply-chain risk.
  Mitigation: immutable SHA pin, minimal permissions, documented provenance, deterministic local
  fallback where practical.
- `VOC-078-R05`: existing `main` continues running stale scheduled workflows until release.
  Mitigation: package release plan records this exposure; no direct push or premature production
  promotion is authorized.

## Dependencies and evidence

- `VOC-078-DEP-00`: explicit adoption of deployment-automation suspension.
- `VOC-078-DEP-01`: truthful handling of unavailable GitHub branch enforcement.
- `VOC-078-DEP-02`: separate future hosting/deployment package.
- `VOC-078-EV-00` through `VOC-078-EV-07`: task evidence defined in the test and task plans.
