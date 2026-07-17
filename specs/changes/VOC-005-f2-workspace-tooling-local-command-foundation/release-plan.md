# VOC-005 Release Plan

## Package adoption authorization

This PR prepares repository implementation authority; it does not implement or release
F2. Package adoption requires all deterministic and hosted checks, exact-SHA Claude
verification with no blocking finding, all applicable R3 controls, and an authorized
merge into `develop`. Codex must not approve, merge, enable auto-merge, deploy, or
represent founder approval.

The package becomes implementation authority only after valid adoption on canonical
`develop`. A branch, draft PR, Claude verdict, or issue by itself is insufficient.

## Implementation integration

After adoption, implementation occurs on a new short-lived branch and separate draft
PR. The actual implementation diff determines effective risk. Expected protected
paths make R3 the anticipated floor, but any higher path, semantic, security, verifier,
or authority assessment controls. Active A-003 requires strengthened applicable
controls and independent verification for routine R3 without standing steward or
founder approval merely because it is R3. R4 remains founder-controlled.

No implementation merge is performed as part of VOC-005 package adoption. Automatic
merge, deployment, staging, production release, RL1/RL2, and autonomous release remain
disabled.

## Rollback

Before package merge, rollback is closure of the draft PR and retention of issue
history. After package merge but before implementation, revert the VOC-005 package
adoption commit through a separately governed PR, return lifecycle to blocked or
superseded, and do not begin implementation. After a later implementation merge,
revert that implementation squash commit through its governed rollback path.

Rollback triggers include a material contradiction with issue #14, invalid package
traceability, incorrect risk/authority claim, missing required package file, blocking
independent finding, unauthorized architecture choice, or scope expansion.

## Evidence and closure

Package adoption evidence is `VOC-005-EV-12`: issue/base verification, exact changed
files, deterministic commands, hosted checks, exact candidate SHA, Claude verdict,
PR merge record, and adopted `develop` SHA. EHR is not triggered; no standing founder
or technical-steward approval applies merely because this is routine R3 under active
A-003.

Package adoption is not implementation completion, deployment, release, or closure.
The separate implementation PR must produce `VOC-005-EV-03` through
`VOC-005-EV-11`. No production outcome or rollback action exists for this package-only
change.
