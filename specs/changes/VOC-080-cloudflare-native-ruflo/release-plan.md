# VOC-080 — Release Plan

## Release and deployment authorization

Plan adoption authorizes only the bounded repository tasks. Merging an implementation PR changes
repository history; it is not Cloudflare provisioning, deployment, DNS routing, spending, production
data access, or launch authority. The three action-specific holds in `change.yaml` govern those
effects. R4 itself creates no founder or standing-steward approval requirement.

Repository tasks release to `develop` through independently reviewed stacked PRs. A separately
reviewed promotion PR moves the complete, verified repository state from `develop` to `main`.
No implementer merges its own plan or implementation revision.

## Preconditions, staging, production, monitoring, and outcome

Before staging activation: adopted resource manifest, separate names/bindings, cost envelope,
least-privilege token, environment isolation, exact-SHA checks/review, local D1/workerd proof, migration
compatibility, smoke plan, and `HOLD-00` evidence.

Before production activation: complete contract/domain/data parity, synthetic conversion rehearsal,
successful staging deployment and soak, production D1 backup/Time Travel readiness, expand-compatible
migrations, exact version IDs, rollback version, observability/alerting, cost caps, secrets/privacy/
legal prerequisites, applicable launch authority, and `HOLD-01`. Production data additionally requires
`HOLD-02`.

Staging and production evidence records revision, Worker version IDs, D1 database/migration state,
routes, checks, smoke/E2E result, start/end time, operator role, authorization link, and outcome. It
contains no token, cookie, secret, learner content, or personal data.

## Rollback

Web/API code rollback promotes the last known-good Worker versions. Expand-compatible schema remains
valid for both versions. Data rollback is forward correction by default; Time Travel restore is a
separate destructive production action requiring explicit authority and reconciliation. Failed smoke
tests stop promotion or return traffic to the prior version. Production deployment is not cancelled
automatically after migration begins.

Repository task rollback uses ordinary reverts in reverse task order in a disposable worktree. T11
restores source assets only and makes no live-server claim. Ruflo rollback removes the external MCP/
plugin/user configuration and its non-sensitive memory without touching GitHub evidence.

## Independent verification, approvals, and closure

Every task receives a different-role exact-SHA verdict. R4 evidence includes decisions, impact,
contingency, applicable Cloudflare/security/data/CI specialists, deterministic results, and resolved
blocking findings. Reviewers use completed evidence and do not duplicate long suites.

Package closure requires AC-00 through AC-11 and EV-00 through EV-12. Repository migration may close
while live activation remains explicitly held, but the closure record must state that staging or
production is not deployed. Conversely, a live deployment cannot close missing repository parity.
