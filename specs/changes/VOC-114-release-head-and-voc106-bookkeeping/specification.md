# VOC-114 — Release-head and VOC-106 bookkeeping correction: Specification

## Objective and requirement source

Issue #213 reports that adopted VOC-106 cannot safely execute its stated
`develop`-headed release PR while the recorded hosted setting automatically deletes a
merged PR's source branch. `VOC-114-D00` through `D10` correct that contradiction
without changing the setting or broadening release authority.

## Exact corrected release topology

After adoption, the implementation makes current policy require:

```text
frozen origin/main (merge base; zero main-only commits)
        │
frozen origin/develop SHA and tree
        │ exact protected full-SHA attempt (same SHA and tree)
        ▼
claim-* → <full-sha>-attempt-* → submit-* ── reviewed PR ──► main
        resulting merge tree equals frozen develop/head tree
        protected release refs remain immutable

current develop ── short-lived sync head containing current main ──► develop
```

The release head is a ref-only exact copy, not an authored release commit. Frozen
`main` must be the merge base of frozen `main` and `develop`, with zero main-only
commits; diverged main fails closed. The prospective and actual release merge tree
must equal both the frozen develop tree and release-head tree.

Current `develop` and `main`, the short-lived head, their trees, merge base, compare,
PR metadata, checks, and reviews form one invalidation domain. A head/PR is an
immutable attempt: drift closes and abandons it without deleting or rewriting its ref.
A new attempt first checks its SHA-derived name is absent. A collision stops unless
the ref is proved the untouched head of that same attempt; a different PR/actor head
is never force-mutated, adopted, overwritten, or deleted.

## Scope and contradictions

One implementation PR changes the seven living governance/contribution guides and all
nine adopted VOC-106 artifacts. `.github/README.md` gains the same immutable-attempt,
ancestry/tree, collision/abandonment, and short-lived-only deletion semantics. The
package corrects stale adoption/task fields without
altering the already-recorded approved SHA, reviewers, approvals, authority source,
or two-PR protected-history delivery shape. Archived text and earlier immutable
packages remain historical evidence.

No repository setting is read or changed. No branch is deleted manually. No release,
sync, dispatch, deployment, or live-system action belongs to the correction PR.

## Risk, security, privacy, and authority

R4 is the highest applicable class because wrong release-head guidance can delete a
permanent canonical ref and the implementation edits DOC-15, DOC-16, AGENTS, and an
adopted release package. Exact specialist and independent R4 reviews are mandatory.
Risk does not supply approval or merge authority; a separate non-author merges only
after exact adoption and evidence. No credentials, personal data, production data,
Cloudflare, DNS, migration, spending, or launch surface is accessed.

## Data, analytics, accessibility, and migrations

Not applicable. The change is repository policy and bookkeeping only and has no
application behavior, user interface, analytics, database, or live migration effect.

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
