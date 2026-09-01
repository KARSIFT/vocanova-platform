# VOC-106 — Release Plan

## Authorization and exact freeze

Adopting this package authorizes neither a merge nor a live action by itself. The
release preparer must create a fresh current freeze after adoption. Record frozen
main/develop refs and trees, main-as-merge-base, zero main-only, aggregate compare,
applicable checks, reviewers, and R4 evidence. Derive
`release/voc-106-<frozen-develop-short-sha>`, prove collision-free ownership, create
it as the exact frozen develop SHA/tree without an authored commit, and prove no extra
head or compare content. The former #190 checks (including the Governance
failure caused by missing package traceability) are diagnosis only, never transferable
release evidence.

The promotion has one action-specific authority: an accountable separate non-author
merge actor may merge the exact reviewed short-lived-head PR into `main` by merge
commit after its prospective tree equals frozen develop/head and all evidence is
current. Ref, PR, topology, tree, compare, check, policy, or review movement closes
and abandons the immutable attempt without ref deletion/mutation; a new freshly frozen
collision-free name/PR gets all-new evidence. Permanent develop is never the head.

## Post-promotion synchronization

Immediately after the release readback, create the short-lived synchronization branch
from current `develop`, merge current `main` into it, and prepare the independently
reviewed PR into `develop`. It has a separate fresh freeze because the release result
is now a new protected ref. The separate non-author merger must merge-commit it.

On completion, record the release-head name/SHA/tree, actual release merge SHA/tree
equality, synchronization source-tip SHA/tree and merge SHA, final refs, exact
reviewer and merger evidence, required-check evidence,
`main`-ancestor-of-`develop` proof, and zero-behind result. Existing automatic source
deletion may remove only each successfully merged short-lived release/sync head;
record its nonexecuted recreation command. Permanent `develop` and `main` must remain.

## Rollback and closure

Before merge, close the affected PR. After either merge, a distinct actor prepares a
reviewed revert PR for the identifiable merge commit and reruns applicable checks.
Never reset/force-push an attempt, permanent, or foreign ref; query/mutate settings;
or manually delete a branch as a shortcut. Close #191 only after all final readbacks
and evidence are attached.

No step dispatches a workflow or deploys; no Cloudflare, DNS, secret, data, D1,
traffic, spend, or launch authority is granted.
