# VOC-109 — Release Plan

## Release and deployment authorization

This is a repository-only foundation-policy correction into `develop`; it has no
release, staging, or production deployment. Merging a reviewed implementation PR does
not dispatch a workflow, call Cloudflare, migrate D1, change traffic, or implement
VOC-105.

## Bounded observation contract

The accountable VOC-109 repository change owner recorded at adoption owns observation
from implementation merge through the first real VOC-105 integration candidate. The
owner records its exact `ci:f3-evidence` declaration as
`node scripts/foundation/voc105-f3-evidence-policy.mjs`, its sole
`pnpm run ci:f3-evidence` segment, and the focused validator, `ci:foundation`, and
hosted required-check results. The command identifier and target basename are
independently canonical and need not be identical.

The monitored signal is acceptance of that exact real fixture while the existing
chain and F2 protections remain green. Exact-fixture rejection,
malformed/collision/bypass acceptance, or an F2/foundation regression stops VOC-105
merge and VOC-109 closure and requires linked failure evidence plus separately
governed remediation or the dependency-ordered revert below. If VOC-105 is formally
abandoned or superseded before integration, the observation window ends only with
that governed disposition record.

## Preconditions and outcome

Before merge, require the exact two-file implementation diff, focused and full
deterministic checks, exact-SHA foundation-policy/CI-integrity specialist review,
separate independent cross-model R3 PASS, zero unresolved blockers, and a separate
non-author merge actor. Post-merge validation must prove the current chain still
passes and the synthetic declared VOC-105 extension is accepted. Only then may issue
#198 close and a different builder resume VOC-105.

## Rollback

If a baseline command can be omitted, duplicated, reordered, aliased, or bypassed, or
if an undeclared/misplaced extension passes, stop and prepare a separately reviewed
revert PR. Before any downstream extension merges, revert the two VOC-109 files
directly. After a downstream extension merges, revert the downstream change first and
then VOC-109 so no intermediate tree knowingly breaks `ci:foundation`.

## Independent verification and closure

Record plan and implementation actor identities, exact SHAs, cross-model provenance,
verdicts, findings and resolutions, hosted results, merge evidence, and post-merge
readback. Model provenance is defense in depth, not authority. Risk class creates no
personal approval gate, and no repository evidence grants an external action.
