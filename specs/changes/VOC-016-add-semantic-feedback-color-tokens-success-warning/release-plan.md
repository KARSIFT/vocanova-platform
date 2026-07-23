# VOC-016 — Release Plan

## Release and deployment authorization

Not applicable, and not authorized by this draft. `release.deployment` is
`prohibited` — merging the implementation to `develop` is the entire scope. A
merged package does not itself authorize any production deployment. No release
authority is claimed here; adoption and merge decisions belong to a human.

## Preconditions, monitoring, and outcome

Exact revision: the implementation PR's head commit, bound in the reviewer's
verdict per `CLAUDE.md`. Preconditions: package adopted; feedback hue values and
the `feedback`/`error` naming confirmed or replaced (`VOC-016-DEP-04`); contrast
target confirmed (`VOC-016-DEP-05`); implementation authorized against a
founder-approved implementation-ready state for `docs/design/03-ui-ux-design.md`;
CI green (lint/typecheck/build) and the `VOC-016-TEST-01` contrast check passing.
No monitoring applicable (no runtime surface). Outcome owner: founder. Because this
draft leaves `automatic_merge_allowed: false`, no automatic merge is asserted; the
merge decision (founder approval, or whatever merge-gate policy is in force at
adoption) is made by a human/CI at implementation time, not by this document.

## Rollback

Trigger: post-merge discovery of a wrong `feedback` value, an `800`/`900` step
that fails the `VOC-016-AC-01` contrast floor, an accidental change to the
`neutral`/`brand` ramps, or a broken `typecheck:packages`/`build:packages`.
Mechanism: `git revert` of the merge commit — safe and complete, nothing consumes
these exports yet. Owner: founder. Last-known-good reference: `develop` at this
package's (adoption-time) `base_sha`.

## Independent verification, human approvals, and closure

Independent verification: exact-SHA reviewer verdict, per `CLAUDE.md`, checking
each of the thirty `feedback` values individually, independently recomputing the
`VOC-016-AC-01` contrast ratios, confirming all three ramps are monotonic and
key-aligned with `neutral`, and confirming the eight pre-existing exports and the
`neutral`/`brand` values are intact. Required human approvals: founder-approved
implementation-ready state for `docs/design/03-ui-ux-design.md` at adoption
(including confirmation of the feedback hue values, naming, and contrast target),
plus the merge decision at implementation time (R1 draft proposal; under active
A-003 no standing technical-steward approval is required merely for being R3, and
this is below R3 regardless — but a human still adopts, approves the requirement,
and authorizes the merge). Do not conflate repository merge, release, and closure.
Closure: recorded against `docs/design/03-ui-ux-design.md` §10/§11 on merge, via
the same manual closure step VOC-010→VOC-015 used for `develop`-only merges.
