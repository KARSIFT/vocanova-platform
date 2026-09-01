# VOC-106 — Release-promotion and synchronization specification

## Objective and requirement source

`VOC-106-D00` through `D06` in [change.yaml](change.yaml) implement issue #191 under
DOC-16's protected-branch rules. The outcome is a current, evidence-bound canonical
release on `main` plus completed `develop` history synchronization—not a deployment.

## Scope and non-goals

The release preparer freshly freezes current `origin/main` and `origin/develop`, then
opens a `main`-targeted PR from
`release/voc-106-<frozen-develop-short-sha>`. The short-lived head is a ref-only exact
copy of the frozen develop SHA/tree. Frozen `main` is the merge base, main-only count
is zero, the aggregate compare has no extra commit/tree, and the prospective and
actual release merge tree equal frozen develop/head. Permanent `develop` is never the
PR head.

The release ref and draft PR are one immutable attempt. Any ref, PR metadata,
topology, tree, compare, check, policy-evidence, or reviewed-revision drift closes and
abandons that attempt without deleting or rewriting its ref. A new freshly frozen
attempt requires a collision-free SHA-derived name and fresh evidence; an existing
name fails closed unless proved the untouched head of that same attempt. No foreign
PR/ref is adopted, overwritten, force-updated, or deleted.

After release, a synchronization preparer creates a short-lived branch from current
`develop`, merges current `main` into that branch, and opens its PR to `develop`; that
PR also uses a merge commit. Both PRs carry exact evidence, a different non-author
reviewer, and a separate authorized non-author merger.

Excluded: authored product or workflow changes, repository-settings query or
mutation, manual or permanent-ref deletion, deployment/dispatch, Cloudflare/DNS,
secrets, production or learner data,
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
