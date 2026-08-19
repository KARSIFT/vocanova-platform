# Unapproved Change-Package Template

This directory is a reusable placeholder, not an approved package and not
implementation authority. Replace every `VOC-000`, `REPLACE`, `TBD`, and `unknown`
value only from an approved requirement source.

## Identity and lifecycle

Record the package ID, title, canonical path, lifecycle state, risk, owner, approval
evidence, target branch, and linked GitHub issue.

## Objective and requirement source

State the approved objective and canonical documents or decisions that authorize it.

## Scope, non-goals, risk, and protected areas

Define bounded scope, explicit exclusions, protected paths, production effect, and
the highest applicable R0–R4 class. Record the active governance model, any EHR
trigger, and whether accountable authority arises from a specific external action;
risk class and ownership routing do not create permanent personal approval.

## Verification, approvals, release, and closure

Link deterministic evidence, exact-SHA independent verification, action-specific
approvals, deployment/rollback controls, hosted activation, and closure evidence.

## `automatic_merge_allowed` drafting

Set `automatic_merge_allowed` in `change.yaml` per the drafting rule in
`AGENTS.md` (subsection "Drafting `automatic_merge_allowed` in `change.yaml`")
before the plan PR is reviewed. The template literal is `true` for R0–R4. A package
may set `false` only when it also adds a non-placeholder top-level
`automatic_merge_hold_reason` describing the specific package-local hold; risk class
alone is not a reason. VOC-079's adopted pre-transition `false` is the sole transition
exception and is not an example for later packages. Earlier packages remain historical
records, while validation applies the new drafting rule to VOC-080 and later packages.
The field remains policy metadata consumed by the Governance workflow's read-only
eligibility report; no current workflow performs a merge.

The executable R0–R4 example matrix is
[`examples/automatic-merge-drafting.json`](examples/automatic-merge-drafting.json).
