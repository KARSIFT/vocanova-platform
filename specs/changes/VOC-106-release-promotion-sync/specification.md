# VOC-106 — Release-promotion and synchronization specification

## Objective and requirement source

`VOC-106-D00` through `D06` in [change.yaml](change.yaml) implement issue #191 under
DOC-16's protected-branch rules. The outcome is a current, evidence-bound canonical
release on `main` plus completed `develop` history synchronization—not a deployment.

## Scope and non-goals

The release preparer opens a `develop` → `main` PR from a newly frozen current
source/base. After its merge, a synchronization preparer creates a short-lived branch
from current `develop`, merges current `main` into that branch, and opens its PR to
`develop`; that PR uses a merge commit. Both PRs carry exact evidence and a different
non-author review and merge actor.

Excluded: authored product or workflow changes, repository settings, permanent-ref
deletion, deployment/dispatch, Cloudflare/DNS, secrets, production or learner data,
D1 migration, traffic, spending, and launch. A permanent-`develop` deletion risk is
a stop condition, not implied authority to alter settings.

## Risk and protected areas

R4 is required by the protected canonical-history action and the highest inherited
release risk. Protected areas are the integrated release tree, `main`, `develop`,
release governance, settings boundary, and held Cloudflare/production surfaces.
EHR is inactive, but an unresolved destructive-history ambiguity, failed exact check,
or conflicting critical conclusion triggers the existing EHR process.

## Decisions, security, and privacy

Each exact candidate needs an attributable different-actor reviewer. A reviewer who
edits becomes the builder of a new SHA and needs fresh checks/review. The separate
merger audits the exact evidence but does not replace action-specific authority.
GitHub Actions remains read-only evidence; no credential or live action is invoked.

## Data, migrations, analytics, and accessibility

None: this package moves only Git history. It must not claim staging success or a
production outcome from repository promotion; any earlier staging run is historical
source evidence only.
