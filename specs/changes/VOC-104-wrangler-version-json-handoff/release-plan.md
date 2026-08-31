# VOC-104 — Release Plan

## Repository delivery

After this package is independently reviewed, adopted, and merged to `develop`, a
different builder prepares one three-file implementation PR into `develop`. The exact
implementation SHA must pass deterministic and hosted checks, receive
Cloudflare/CI-security specialist review and separate independent R3 verification
from non-author actors, resolve every blocker, and be merged by a separate non-author
actor.

Merging the implementation changes repository workflow behavior only. It does not
dispatch the workflow, enter an environment, read or write a secret, call Cloudflare,
run D1 migration, upload or promote a Worker, change traffic or DNS, spend, access
learner or production data, or launch.

## Existing partial state and later operational validation

The observed staging migrations and unpromoted immutable versions may remain. Their
exact IDs are not repository evidence and are never inputs to the repair. A future
run uses the current serving deployments as rollback targets and fresh exact
SHA/run/attempt tags, so it neither infers nor promotes an old unpromoted version.

Operational closure requires a later staging dispatch under the existing separate
authority and review controls. It must either record exact promotion plus bounded
smoke success, or demonstrate that a repaired list/resolve failure stopped before
promotion with traffic unchanged. If promotion starts and later fails, the existing
dual-Worker rollback evidence is required instead. VOC-104 does not authorize or
perform that dispatch.

## Rollback

Before merge, close the PR. After merge, the implementation owner prepares a
separately reviewed revert of the three implementation files to their last-known-good
pre-implementation versions, reruns the same checks, and merges normally. Repository
revert does not delete immutable versions, reverse D1 migrations, or authorize a live
action.

## Closure evidence

Record the adopted plan SHA, implementation SHA, local and hosted deterministic
results, exact-SHA specialist and independent R3 verdicts, blocking-finding
disposition, different-actor merge evidence, post-merge repository validation, and
the later sanitized staging outcome. Close issue #186 only after that operational
outcome; do not claim live staging success from repository tests.
