# VOC-106 — Release Plan

## Authorization and exact freeze

Adopting this package authorizes neither a merge nor a live action by itself. The
release preparer must create a fresh current freeze after adoption. Record base and
source refs, trees, merge base, divergence, compare, applicable checks, reviewers,
and R4 evidence on the release PR. The former #190 checks (including the Governance
failure caused by missing package traceability) are diagnosis only, never transferable
release evidence.

The promotion has one action-specific authority: an accountable separate non-author
merge actor may merge the exact reviewed `develop` → `main` PR by merge commit after
all evidence is current and permanent-branch safety is established without a settings
change. Ref or evidence movement invalidates that authority for the candidate.

## Post-promotion synchronization

Immediately after the release readback, create the short-lived synchronization branch
from current `develop`, merge current `main` into it, and prepare the independently
reviewed PR into `develop`. It has a separate fresh freeze because the release result
is now a new protected ref. The separate non-author merger must merge-commit it.

On completion, record the release merge SHA, synchronization source-tip SHA and merge
SHA, final refs, exact reviewer and merger evidence, required-check evidence,
`main`-ancestor-of-`develop` proof, and zero-behind result. Existing automatic source
deletion may remove only the short-lived sync head; record its recreation command.

## Rollback and closure

Before merge, close the affected PR. After either merge, a distinct actor prepares a
reviewed revert PR for the identifiable merge commit and reruns applicable checks.
Never reset/force-push, delete a permanent branch, or use a setting mutation as a
shortcut. Close #191 only after all final readbacks and evidence are attached.

No step dispatches a workflow or deploys; no Cloudflare, DNS, secret, data, D1,
traffic, spend, or launch authority is granted.
