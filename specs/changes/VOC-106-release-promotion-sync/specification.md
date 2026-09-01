# VOC-106 — Release-promotion and synchronization specification

## Objective and requirement source

`VOC-106-D00` through `D06` in [change.yaml](change.yaml) implement issue #191 under
DOC-16's protected-branch rules. The outcome is a current, evidence-bound canonical
release on `main` plus completed `develop` history synchronization—not a deployment.

## Scope and non-goals

The release preparer freshly freezes current `origin/main` and `origin/develop`, then
opens a `main`-targeted PR from the deterministic claim/full-SHA-attempt/submit-marker
identity. The protected attempt is an exact ref-only copy of frozen develop SHA/tree.
Frozen `main` is the merge base, main-only count
is zero, the aggregate compare has no extra commit/tree, and the prospective and
actual release merge tree equal frozen develop/head. Permanent `develop` is never the
PR head.

Claim, attempt, submit marker, and draft PR are one immutable identity. Exact same-
target requests coalesce. Only verified submit `201` authorizes one POST; marker-plus-
zero is `submit-outcome-unknown`. Post-claim drift is irrecoverable, cardinality is
resolved before terminal state, and protected refs are never mutated or deleted.

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

## VOC-115 durable release-attempt contract

This is the operative prospective procedure; every conflicting SHA-only, generic
collision, blanket abandonment/retry, and release-attempt auto-deletion instruction
above is retained only as superseded history. Adopted VOC-115 uses deterministic
`release/voc-106-claim-*`, a full-SHA attempt ref, and allocation-bound
`release/voc-106-submit-*`. Exact same-target atomic requests coalesce; foreign,
malformed, or post-claim stale topology stops. Only the exact invocation verifying the
submit-marker `201` may send one canonical no-retry/no-redirect PR POST. Every other
observer/response and marker-plus-zero is `submit-outcome-unknown`, never retry.

The separately authorized held active no-bypass three-pattern ruleset plus exhaustive
numeric-max history equality is a prerequisite. Lossless exact page/object/command/
scan/pass schemas, dual-source refs, two stable passes, null-provenance stops, and
cardinality-first cleanup apply. Claim, attempt, and submit refs remain immutable and
never deletion eligible; same-`develop` retry requires a deterministic closed/conflict
frontier and fresh distinct identity. `VOC-080-HOLD-01` and every settings/ref/release/
deployment/live hold remains. Approved SHA/review/adoption evidence is unchanged.
