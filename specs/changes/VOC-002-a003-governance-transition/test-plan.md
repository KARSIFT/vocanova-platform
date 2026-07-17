# VOC-002 — Test Plan

## VOC-002-TEST-01 — Valid inactive transition

The complete pre-merge repository passes deterministic validation.

## VOC-002-TEST-02 — Frozen checksum

Changing frozen A-003 content fails validation.

## VOC-002-TEST-03 — Premature active state

Marking A-003 active without evidence fails.

## VOC-002-TEST-04 — Missing exact-revision approval

Active state without founder, steward-transition, or Claude evidence fails.

## VOC-002-TEST-05 — SHA distinction

Active state with missing, malformed, or conflated approved/adopted SHAs fails.

## VOC-002-TEST-06 — Historical appointment

Deleting or falsifying steward history fails.

## VOC-002-TEST-07 — Migration approval reuse

Active state without exhausted one-time migration status fails.

## VOC-002-TEST-08 — Routine post-activation authority

An active model lacking the no-routine-steward/no-R3-founder markers fails.

## VOC-002-TEST-09 — EHR boundary

An active model lacking exceptional-only EHR policy fails.

## VOC-002-TEST-10 — Operational false claims

RL1/RL2 technical activation, automatic merge, or autonomous production enablement
fails.

## VOC-002-TEST-11 — Excluded adoption

DOC-17 or DOC-18 repository adoption flags fail.

## VOC-002-TEST-12 — Classifier floor

VOC-002 paths establish R4 and a declaration below R4 fails.

## Expected result

All positive tests pass; every negative mutation exits nonzero with a specific error.
