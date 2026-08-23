# VOC-080 — Cloudflare-native runtime, evidence-driven CI/CD, and external Ruflo orchestration

Status: repository implementation complete through T12. The exact plan candidate was
adopted through PR #86, and T00-T12 were independently reviewed, merged, and recorded in
the VOC-084 closure inventory. The final implementation head is
`3d6699c5eb378b9a00679d61a5c28b6b7e27c32c`, merged by PR #100 as
`a05ab5c60534f36d1b89d9b9d32296469e9942bf`.

VOC-080 replaces the old server-hosting direction with a staged Cloudflare-native
architecture and defines Ruflo as an external development orchestrator. GitHub remains
the canonical evidence and deterministic-check layer. The package deliberately separates
repository implementation authority from live Cloudflare, DNS, spend, secret, data, and
production activation authority.

The migration was completed in order: CI/CD clarity first, then Cloudflare web compatibility,
API and D1 parity, synthetic data migration, deployment controls, and only then retirement of
the old server assets. AC-00 through AC-11 and the task-level hosted, review, rollback, and
post-merge evidence are complete for repository purposes. The closure inventory preserves
earlier failed or blocked candidate evidence; those records are not approvals.

Repository completion is not external activation. `VOC-080-HOLD-00` remains held for
Cloudflare staging resources and secrets, `VOC-080-HOLD-01` remains held for production
deployment/routing/D1 migration, and `VOC-080-HOLD-02` remains held for production learner
data. This package does not claim deployment, activation, release, production migration, or
live verification.

Primary intake: [GitHub issue #85](https://github.com/KARSIFT/vocanova-platform/issues/85).
