# VOC-081 Release and Rollback Plan

## Repository delivery

VOC-081 is delivered as small stacked draft PRs T00-T04 on the exact VOC-080-T12 base.
Each task receives proportional validation, a different-role exact-SHA verdict, hosted
path-applicable proof, and an independent reverse commit. The builder never pushes to,
approves, or merges `develop`/`main`.

The plan PR itself must be independently reviewed and adopted with complete metadata
before T00 starts. No chat direction or issue alone authorizes implementation.

## Activation

There is no live release. After integration, contributors may run local-only commands.
F2 repository/local acceptance becomes effective only when the final evidence revision
is merged into the integration history and revalidated. F3 is a future package/action:
VOC-080-HOLD-00 still governs all Cloudflare staging resources, credentials, cost, and
deployment. HOLD-01 and HOLD-02 remain unchanged.

## Rollback triggers

- any command can select remote/staging/production state;
- migration replay, persistence, or isolation fails;
- browser and service-binding paths reach inconsistent API revisions;
- a child survives shutdown, a port silently changes, or CI hangs;
- development creates nested agent instructions or unexpected tracked changes;
- required CI aggregation can pass without local-stack evidence;
- secrets/personal data appear; or
- docs claim an unperformed F3/A1/production outcome.

## Repository rollback

Revert tasks in reverse order and validate each exact predecessor tree. This removes
commands/policy/docs only. Ignored local D1 state is not automatically deleted; a user
may archive it or remove only the documented explicit state directory. Never use a broad
home/workspace recursive deletion. No rollback step contacts Cloudflare or restores a
live system.

## Closure evidence

Package closure requires AC-00 through AC-07 and EV-00 through EV-06, exact-SHA
independent review, final hosted four-workflow proof, and reverse rollback. Closure must
say F3/A1 and inherited holds remain open. No deployment URL is expected.
