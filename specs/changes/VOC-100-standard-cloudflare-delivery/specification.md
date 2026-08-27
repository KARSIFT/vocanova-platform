# VOC-100 — Standard Cloudflare Environment Delivery: Specification

## Objective and requirement source

Issue [#173](https://github.com/KARSIFT/vocanova-platform/issues/173) records that
the custom five-record binder is an operational defect: it duplicates GitHub review
and check evidence, couples credential expiry to bookkeeping, and has already caused
multiple corrective packages without producing a staging dispatch.

This draft defines one prospective supersession. It does not rewrite VOC-094 through
VOC-099; those remain historical evidence. Where their still-future delivery
instructions conflict with an adopted VOC-100, VOC-100 controls.

## Scope and non-goals

The implementation changes the living GitHub Actions workflow, delivery policy and
tests, delivery manifest state, settings truth, and operations/governance guidance.
It retains the PR-168 resource and rollout design but removes the custom comment
binder and its supporting inputs/checks.

It does not change application behavior, D1 schema, Worker names, domains, account,
zone, Free/$0 ceiling, synthetic-only staging rule, production configuration, or
learner-data boundary. It does not create a repository-level Cloudflare secret.

## Decisions

### VOC-100-D00 — Standard controls replace duplicated controls

Code safety remains protected by protected branches, required checks, exact-revision
review of changes, and non-author merge. Deployment safety moves to manual dispatch,
branch checks, deterministic manifest checks, and GitHub environments. The workflow
does not reconstruct GitHub evidence through issue-comment JSON.

### VOC-100-D01 — Staging and production are separate credential domains

`cloudflare-staging` is restricted to `develop` and contains exactly the account-ID
and staging-token environment secrets. `cloudflare-production` is restricted to
`main`, uses a different future token, and remains absent or disabled and held. A
staging credential is never copied to production.

### VOC-100-D02 — Rotation is independent of dispatch

The staging token may serve multiple manual staging deployments. It has only Workers
Scripts Edit and D1 Edit for account
`0a9eda28b96d77c24dcde74f3e074d47`. It is rotated at most every 90 days and on
exposure/operator/scope change by replacing the GitHub environment secret first,
verifying its scope without printing it, and revoking the old token. Ordinary
dispatches do not create or renew tokens.

### VOC-100-D03 — The event SHA is the deployment SHA

For staging, the workflow accepts only `workflow_dispatch` on `develop`; `github.sha`
is the immutable deployment revision. Validation jobs in the same run must pass
before the environment job begins. The operator supplies only the target and exact
confirmation. Current deployment IDs are queried immediately before mutation and
used as Worker rollback targets.

### VOC-100-D04 — One-time settings truth stays in one PR

After repository implementation is drafted but before its final reviews, a separately
authorized operator creates/reconciles the staging environment, branch policy, and
two secret names. The builder adds sanitized readback to the same implementation PR,
then the complete SHA receives fresh reviews. This avoids both false preclaims and a
second documentation PR. Settings drift later is handled as a settings incident, not
as routine deployment paperwork.

## Security, privacy, and action authority

Environment secrets are narrower than repository secrets because only jobs that
reference the environment can access them after its rules pass. Credentials are
scoped at the individual step level where possible, never echoed, and absent from PR
runs. Account-wide Workers/D1 permissions still create residual risk to unrelated
resources in that account; exact manifest/resource checks, separate production
credentials, and immediate revocation mitigate but cannot eliminate that Cloudflare
permission-model limitation.

Package adoption authorizes repository implementation only. Settings/secret entry
and first staging dispatch each require separate exact authority naming the actor,
scope, pre-state, action, rollback, and completion. Production remains prohibited.

## Data, migrations, analytics, and accessibility

Staging contains synthetic/non-personal data only. Existing compatible ordered D1
migrations remain forward-only; a Worker rollback does not roll back D1. No analytics
or application accessibility behavior changes. Delivery logs must exclude learner
text, cookies, authorization headers, secrets, magic links, and prompt/response data.
