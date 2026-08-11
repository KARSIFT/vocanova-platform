# VOC-067 — Release Plan

## Release and deployment authorization

This package does **not** authorize production deployment by being merged as
a draft or even by being adopted alone. Adoption authorizes implementation
PRs only. Each task PR still requires independent verification against the
exact revision. Under active A-003 and this repository's 2026-08-08 founder
delegation (see `AGENTS.md`), merged tasks on `develop` can auto-promote to
`main` and trigger `deploy-production.yml` once the package task roster
closes — **unless** the adopting human records a temporary hold for the
shared-edge cutover window (recommended for T02–T05). Founder comment-based
promotion retry remains available if auto-promotion fails.

Proposed risk is **R4** (draft): revising `VOC-037-D00`'s edge isolation.
Founder acceptance of `VOC-067-DEP-02` is required for the shared-nginx path.
Routine R3 path-floor work does not by itself recreate standing
technical-steward approval under A-003.

## Preconditions, monitoring, and outcome

Preconditions:

- Package adopted with DEP-00–02 resolved (DEP-03 owner named).
- T01 HEALTHCHECK fix preferably live before cutover so edge health signals
  are trustworthy.
- For shared path: T02/T03 on host; origin `:443` Host routing proven before
  Cloudflare remap removal.
- Monitoring: existing Sentry / uptime checks (VOC-037-T04) for both tiers;
  watch both staging and production hostnames during cutover — shared edge
  means one bad reload can page both.

Outcome owner: named in T00/T05 evidence (unassigned at drafting). Success =
`VOC-067-AC-06` (shared path) or `VOC-067-AC-07` (alternate) plus AC-01, with
linked evidence.

## Rollback

Trigger: either tier 5xx/unreachable on `:443` after remap removal; shared
nginx crash loop; OAuth/CORS failure after `:8443` stripping; secrets-boundary
regression.

Mechanism (shared path):

1. Restore Cloudflare production origin-port override to `:8443` if dual
   publish or prior production nginx on `:8443` is still available; else
2. Redeploy last-known-good shared-edge / compose / workflow digests;
3. If necessary, temporarily re-split to dual nginx using pre-T02 compose
   revisions.

Validation: external curls to both tiers succeed; HEALTHCHECK healthy;
OAuth start OPTIONS (or equivalent) not CORS-blocked. Accountable owner:
T05 evidence. Last-known-good reference: pre-cutover dual-nginx + remap
configuration that returned `200` on origin `:8443` during the 2026-08-11
investigation.

## Independent verification, human approvals, and closure

Independent verifier (per `CLAUDE.md`) must:

- Bind the exact reviewed commit SHA for each task.
- Confirm the change matches this specification and acceptance criteria.
- Run/inspect applicable deterministic checks; never treat missing Cloudflare
  / SSH / production access as a pass.
- Escalate if semantic risk exceeds the declared class.
- Verify Codex did not approve or merge its own implementation.
- Identify active authority model (`a003-active`) and report every still-
  required R3/R4/EHR/adoption/activation gate — especially founder
  acceptance of the `VOC-037-D00` supersession if shared nginx shipped.

Closure requires acceptance-criteria results recorded with evidence, not
merely merged PRs or a successful production deploy. Repository merge,
release to `main`, production deploy, Cloudflare activation, and package
closure are distinct events and must not be conflated.
