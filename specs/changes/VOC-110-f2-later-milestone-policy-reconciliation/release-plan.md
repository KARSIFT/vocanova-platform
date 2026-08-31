# VOC-110 — Release Plan

## Release and deployment authorization

VOC-110 is a repository-only foundation-policy correction into `develop`. It has no
release, staging, or production deployment. Merging a reviewed implementation PR does
not dispatch a workflow, call Cloudflare, change settings/secrets, migrate D1, change
traffic/DNS, access data, implement VOC-105, or alter any live system.

## Preconditions and repository outcome

Before merge, require the exact two-file implementation diff, focused and full
deterministic checks, exact-SHA foundation-policy/CI-integrity specialist review,
separate independent cross-model R3 PASS, zero unresolved blockers, truthful merge
eligibility, and a separate non-author merge actor. Post-merge validation must prove
the current pre-VOC-105 tree passes, the exact synthetic VOC-105 profile passes, and
all immutable F2 and VOC-109 regressions remain fail closed. Only then may issue #203
close and a different builder refresh VOC-105.

## Bounded observation contract

The accountable VOC-110 repository change owner recorded at adoption owns observation
from implementation merge through the first refreshed real VOC-105 candidate. The
owner records focused VOC-081 and VOC-105 validator/test results, `ci:foundation`,
hosted required checks, exact profile acceptance, and continued immutable-F2/negative-
profile/extension protection.

The failure trigger is rejection of the exact VOC-105 profile, acceptance of a hybrid
or false profile, immutable F2 regression, or VOC-109 extension regression. The owner
stops VOC-105 merge and VOC-110 closure, records linked evidence, and routes a
separately governed correction or rollback. If VOC-105 is formally abandoned or
superseded before refresh, only that governed disposition ends the window.

## Rollback

Before implementation merge, close the PR for zero effect. After merge but before
VOC-105 lands, revert VOC-110's two files through a separately reviewed PR. If VOC-105
has landed, revert VOC-105 first and VOC-110 second so the active tree never knowingly
violates the validator's accepted profile.

## Independent verification and closure

Record plan and implementation actor identities, exact SHAs, cross-model provenance,
verdicts, findings/resolutions, hosted results, merge evidence, post-merge readback,
and bounded observation. Model provenance is defense in depth, not authority. Risk
class creates no personal approval gate, and repository evidence grants no external
action.
