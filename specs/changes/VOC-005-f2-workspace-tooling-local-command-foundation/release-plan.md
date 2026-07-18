# VOC-005 Release Plan

## Package adoption authorization

PR #15 prepared repository implementation authority without implementing or releasing
F2. All deterministic and hosted checks, exact-SHA Claude verification with no
finding, applicable R3 controls, and the authorized merge into `develop` completed.
Codex did not approve, merge, enable auto-merge, deploy, or represent founder
approval.

The valid adoption made this package implementation authority for its unchanged scope
through active issue #14. A branch, draft PR, Claude verdict, or issue by itself
remains insufficient authority.

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

Package adoption evidence `VOC-005-EV-12` is complete: PR #15 records issue/base
verification, exact changed files, deterministic commands, hosted checks, exact
candidate `271c3e9fe0f202f468995c0af5a87c729186b746`, Claude verdict `PASS` and its
evidence, and the merge record; canonical adopted `develop` SHA is
`84e096c35bc811c276ce29dc2ecc7dd967983e4b`. EHR was not triggered; no standing
founder or technical-steward approval applied merely because this was routine R3
under active A-003.

Package adoption is not implementation completion, deployment, release, or closure.
The separate implementation PR must produce `VOC-005-EV-03` through
`VOC-005-EV-11`. No production outcome or rollback action exists for this package-only
change.
