# VOC-092 — Repository Finalization

Status: draft for independent exact-revision review and adoption. GitHub issue
[#151](https://github.com/KARSIFT/vocanova-platform/issues/151) is the requirement
source and grants planning authority only.

This package defines one coherent repository-finalization outcome and one
minimum-sufficient task. It enables automatic deletion of merged branches, reconciles
every living settings description and its truthfulness guard, promotes the complete
verified `develop` tree to `main` through the separately reviewed release pull request
required by DOC-16, and removes only branches and worktrees proven merged, clean,
recoverable, inactive, and disposable.

The settings/documentation implementation is one pull request into `develop`. The
additional `develop`-to-`main` pull request is a mandatory release/promotion boundary,
not an extra implementation task. Remote deletion uses a fresh exact manifest attached
to canonical GitHub evidence. Local cleanup fails closed for dirty or unique work.

All current-setting dates and timestamps come from the actual execution-time UTC API
evidence. The operator request occurred on 2026-08-25 in Asia/Tehran while its GitHub
record is dated 2026-08-24 UTC; the package records both and does not future-date the
canonical observation.

The one-field settings mutation is held by `VOC-085-HOLD-00` until the accountable
repository owner/operator's exact action direction, adopted plan, timestamped pre-state,
payload, rollback owner, immediate follow-up, and post-state read-back are all recorded.
Package adoption and review do not replace this separate action authority.

The drafting audit found 52 non-permanent remote branches, all previously mapped to
merged pull requests; 54 auxiliary local worktrees; a dirty VOC-090 worktree with 19
staged tracked changes; and a backup branch whose tip is not reachable from current
`develop` or `main`. The dirty worktree and unique backup branch are explicitly
excluded from deletion unless later separately reviewed evidence demonstrates that no
unique work would be lost.

Risk is R4 because the outcome includes a protected release boundary, a GitHub
repository-setting mutation, and destructive branch/ref cleanup. Complete decision,
impact, contingency, specialist, deterministic, exact-revision independent-review,
and action-specific authority evidence is required. The R4 label creates no standing
founder or technical-steward gate.

`automatic_merge_allowed: true` was explicitly examined. It is read-only package
policy metadata; no current workflow performs a merge. This package authorizes no
deployment, Cloudflare, DNS, secret, production-data, traffic, spending, or public
launch action.
