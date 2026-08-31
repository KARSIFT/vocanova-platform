# VOC-109 — Release Plan

## Release and deployment authorization

This is a repository-only foundation-policy correction into `develop`; it has no
release, staging, or production deployment. Merging a reviewed implementation PR does
not dispatch a workflow, call Cloudflare, migrate D1, change traffic, or implement
VOC-105.

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
