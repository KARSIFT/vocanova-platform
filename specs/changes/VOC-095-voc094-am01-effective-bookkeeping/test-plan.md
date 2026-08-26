# VOC-095 — Test plan

## Static and deterministic checks

1. Confirm the plan PR changes only `specs/changes/VOC-095-voc094-am01-effective-bookkeeping/`.
2. Parse the package and verify exactly one task, one implementation PR, R4 risk,
   explicit `automatic_merge_allowed: true`, rollback, owners, evidence, and
   prohibited external effects.
3. Verify every required evidence SHA and URL in `change.yaml`, including the final
   candidate, Governance run `32913984893`, merge `75e5c9909fe105a9af3e6e8a3600fec27fcbd593`,
   post-merge runs, and lifecycle comment.
4. Run:

   ```bash
   bash scripts/governance/validate-governance.sh
   bash scripts/governance/classify-change-risk.sh --base origin/develop --head HEAD
   git diff --check
   ```

5. Run applicable package formatting/document checks documented by the repository;
   do not invent a passing check.

## Implementation-PR semantic tests

- Verify the VOC-094 AM-01 gate is effective and bound to the exact candidate,
  independent review, eligibility, merge, post-merge, and lifecycle evidence.
- Verify no historic FAIL/PASS/adoption evidence was deleted or reassigned.
- Search for stale pending claims in all eight VOC-094 documents and prove each is
  reconciled or explicitly justified as still pending for an independent external
  action.
- Verify ACT-02 remains held and requires a fresh corrected-SHA overlay/resource
  review, Free/$0 evidence, and exact action authority.
- Verify the ACT-01 D1 UUID is present only as preserved non-secret evidence and no
  command, credential, or external mutation is introduced.
- Verify no changed file contains secret values or expands production/public-launch
  scope.

## Required independent review

A different actor must review the exact implementation head as R4, including the
canonical field transitions, evidence URLs, historic preservation, external holds,
incident wording, and diff scope. Hosted checks and the merge-eligibility adapter
must pass on that exact head before a non-author merge.
