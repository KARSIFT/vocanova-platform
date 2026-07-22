# Test Plan

## VOC-003-TEST-01 — Canonical validation

Run the full governance unit suite and repository validator. Expected result: pass.

## VOC-003-TEST-02 — Lifecycle evidence failures

Mutations that remove either SHA, conflate them, remove approval/adoption/activation
evidence, or mark post-merge validation incomplete fail.

## VOC-003-TEST-03 — Authority regressions

Mutations that restore pre-A-003 authority, make migration approval reusable, restore
routine steward/founder R3 approval, or make EHR routine fail.

## VOC-003-TEST-04 — Historical integrity

Deleting or falsifying the original appointment markers fails.

## VOC-003-TEST-05 — Operational false activation

Named mutations for automatic/autonomous merge, RL1, RL2, production deployment,
autonomous production release, DOC-17, and DOC-18 fail.

## VOC-003-TEST-06 — Frozen body

A substantive A-003 body modification fails checksum validation.

## VOC-003-TEST-07 — Risk and syntax

Shell syntax checks pass; the classifier detects and accepts declared R4; diff check
is clean.
