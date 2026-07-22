# VOC-015 — Release Plan

## Release and deployment authorization

Not applicable, and not authorized by this draft. `release.deployment` is
`prohibited` — merging the implementation to `develop` is the entire scope. A
merged package does not itself authorize any production deployment. No release
authority is claimed here; adoption and merge decisions belong to a human.

## Preconditions, monitoring, and outcome

Exact revision: the implementation PR's head commit, bound in the reviewer's
verdict per `CLAUDE.md`. Preconditions: package adopted, brand hue values
confirmed or replaced (`VOC-015-DEP-04`), implementation authorized against a
founder-approved implementation-ready state for issue #15, CI green
(lint/typecheck/build). No monitoring applicable (no runtime surface). Outcome
owner: founder (m-e-h-r-d-a-a-d). Because this draft leaves
`automatic_merge_allowed: false`, no automatic merge is asserted; the merge
decision (founder approval, or whatever merge-gate policy is in force at
adoption) is made by a human/CI at implementation time, not by this document.

## Rollback

Trigger: post-merge discovery of a wrong `brand` value, an accidental change to
the `neutral` ramp, or a broken `typecheck:packages`/`build:packages`.
Mechanism: `git revert` of the merge commit — safe and complete, nothing
consumes these exports yet. Owner: founder. Last-known-good reference: `develop`
at this package's (adoption-time) `base_sha`.

## Independent verification, human approvals, and closure

Independent verification: exact-SHA reviewer verdict, per `CLAUDE.md`, checking
each of the twenty `brand` values individually, confirming both ramps are
monotonic and key-aligned with `neutral`, and confirming the seven pre-existing
exports and the `neutral` ramp are intact. Required human approvals:
founder-approved implementation-ready state for issue #15 at adoption
(including confirmation of the brand hue values), plus the merge decision at
implementation time (R1 draft proposal; under active A-003 no standing
technical-steward approval is required merely for being R3, and this is below R3
regardless — but a human still adopts, approves the requirement, and authorizes
the merge). Do not conflate repository merge, release, and closure. Closure: the
originating issue #15 closes on merge (or, for a `develop`-only merge, via the
same manual closure step VOC-010→VOC-014 used).
