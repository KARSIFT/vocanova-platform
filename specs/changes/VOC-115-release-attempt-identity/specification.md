# VOC-115 — Release-attempt identity specification

## Objective and authority

Issue #216 and the exact release-history specialist review of PR #215 prove a
dead-end in adopted VOC-114/VOC-106. An invalidated attempt must keep its immutable
SHA-only ref, but a retry at unchanged `develop` derives that same name and may
neither reuse nor replace it. These records are intake only. PR #215 remains draft
until this package is independently reviewed, adopted, merged, implemented, and
reviewed again.

## Canonical attempt identity and sequence

A release attempt head must have exactly this grammar:

```text
release/voc-106-<40-lowercase-hex-frozen-develop-sha>-attempt-<positive-decimal-sequence>
```

The SHA component is the complete freshly frozen `origin/develop` commit, not a
short or ambiguous display. The sequence is a positive canonical decimal integer:
`1`, `2`, ...; zero, signs, non-decimal characters, whitespace, and leading zeroes
are invalid.

Before creation, fetch remote refs and enumerate all open, closed, and merged pull
requests in the canonical repository. Combine valid sequences from:

1. every current remote head in the reserved `release/voc-106-` namespace;
2. every canonical-repository PR whose recorded head name matches the grammar,
   including PRs whose source branch was later auto-deleted; and
3. every valid append-only `voc-106-release-attempt-v1` allocation/ownership record
   attached to issue #191 or a VOC-106 release PR.

Choose one plus the numeric maximum, or 1 if the union is empty. Record the inventory,
maximum, selection, frozen main/develop SHAs and trees, actor, time, and intended name.
This repository-metadata inventory does not query repository settings.

The structured record version and required fields must be stated identically in
VOC-106's implementation/test/evidence surfaces. At minimum it binds the sequence,
head name, frozen SHAs/trees, actor, timestamp, create-ref result, and later PR number
or an explicit `pending-pr-creation` state. Lifecycle changes append a new linked
record; they do not rewrite an earlier allocation or ownership receipt. Malformed,
edited, duplicated, or conflicting records are evidence drift and stop allocation.

## Atomic creation, collision, and ownership

Create the ref with GitHub's create-ref endpoint at the exact frozen develop SHA.
That operation must be create-if-absent and must not be an update-ref request, Git
force option, or force-with-lease. Read the ref back immediately.

Any pre-existing exact name or atomic-create collision reserves the name even when
its SHA happens to match. Never adopt, update, overwrite, force, or delete it. Refresh
all allocation inputs and select a higher sequence. Because no new ref exists, a
failed allocation is not an attempt, but its collision receipt remains evidence.

A successfully created ref starts the attempt. Its immutable ownership tuple is:

- package `VOC-106`, sequence, and full head name;
- frozen develop SHA/tree and frozen main SHA/tree;
- creating actor and create-ref receipt/time; and
- draft PR number, exact head/base, and creation evidence as soon as the PR exists.

An interrupted process may continue the same attempt only when every available tuple
field and the live ref/PR readback agree. Actor transfer additionally needs a recorded
handoff. Continuation never recreates or updates the ref. Missing or conflicting
ownership evidence stops; it does not authorize adopting a coincidentally matching
foreign or stale ref.

## Invalidation, retry, and recreation

The protected refs/trees, attempt ref and tuple, PR metadata, merge base, divergence,
compare, checks, policy evidence, and reviewed revision are one binder. Any movement
closes the draft PR, records the reason, and abandons that attempt. Its ref remains at
its original SHA. A retry performs a complete new freeze and allocation. If develop
is unchanged, its full-SHA component stays the same and its sequence increases; the
new identity is collision-free without touching the abandoned ref.

Abandoned or active attempt refs are never auto-delete eligible. Existing automatic
source deletion may remove only a successfully merged short-lived release or sync
head, after exact SHA/tree/identity and a nonexecuted atomic recreate request are
recorded. Reconstruction of that completed ref is a recovery action under separate
authority, not a new attempt or name reuse. Unexpected absence or movement of an
active/abandoned ref stops release and routes governed investigation.

## Preserved release topology and evidence

The correction does not change the substantive VOC-106 topology: frozen main is the
merge base and has zero main-only commits; release head and frozen develop have exact
SHA/tree equality and no extra compare content; prospective and actual release merge
trees equal frozen develop; promotion and synchronization are separate reviewed merge-
commit PRs; and final readback proves both permanent refs, main ancestry, and zero
develop-behind count.

## Exact implementation and non-goals

After adoption, one revision of PR #215 changes exactly 25 existing paths: seven
living release surfaces, nine VOC-106 artifacts, and nine VOC-114 artifacts. All
current naming, allocation, collision, ownership, invalidation, recreation, test,
rollback, and monitoring language must agree. Existing adopted candidate/review/
approval evidence remains immutable; explicitly historical packages remain untouched.

The correction implementation creates, updates, or deletes no branch, queries or
changes no repository setting, performs no release/synchronization, and grants no
workflow dispatch, deployment, Cloudflare/DNS, resource, credential, secret, data,
migration, traffic, spending, launch, production, or learner-data authority.
