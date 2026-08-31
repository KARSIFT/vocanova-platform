# VOC-107 — Release Plan

## Delivery

This is a repository-only repair into `develop`, not a deployment. Merge only one
reviewed implementation PR after exact-SHA CI/local-runtime specialist and independent
R3 verification, all deterministic evidence, and a separate non-author merge action.
Do not dispatch workflows, contact Cloudflare, change settings/secrets, migrate D1,
or change traffic/DNS as part of this package.

## Post-merge evidence

Confirm the hosted CI run for the merged SHA has successful `local stack` and `ci
required` jobs, and that the diagnostic has not been masked. Attach bounded/redacted
evidence to the implementation PR. Issue #194 may be closed only after that evidence
is present; this plan itself does not close it.

## Rollback

If validation or hosted CI fails, stop and retain the failure as evidence; do not
broaden retries or timeouts in place. If a merged remediation regresses, prepare a
separate reviewed revert PR for only the proven implementation paths and matching
lock entries, run the same focused/local-stack/workspace checks, and verify hosted
required CI. No Cloudflare or production rollback is applicable.
