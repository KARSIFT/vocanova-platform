# VOC-002 — Implementation Plan

## File reconciliation and implementation sequence

1. Copy the checksum-identified frozen A-003 source verbatim to its canonical path.
2. Add the machine-readable pre-merge transition-state record and nine-file package.
3. Add conditional transition notices to DOC-16/A-002 and reconcile current authority
   matrices, appointment history, repository settings, indexes, instructions,
   templates, and protected metadata.
4. Extend validators to understand both inactive and legitimately active lifecycle
   states, preserve VOC-001 invariants, and fail closed.
5. Add positive and negative unit tests, then run every required local check.
6. Prepare a draft PR with exact final head SHA and pending external approvals.

## Lifecycle implementation

The adoption revision contains null adopted-state fields. After merge, record both
the approved PR head SHA and resulting adopted `develop` SHA, validate that adopted
state, and record activation evidence. A later bounded synchronization PR updates
canonical lifecycle facts without changing sections 1–25 of frozen A-003.

## Deployment and rollback

No deployment occurs. Revert the adoption commit before dependent work if validation
or approval is invalidated. Never delete historical evidence during rollback.

## Stopping rule

Stop after the draft PR is prepared. Do not merge, activate A-003, adopt DOC-17 or
DOC-18, or begin Control Plane work.
