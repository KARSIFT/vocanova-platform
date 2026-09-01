# VOC-106 — Implementation Plan

## Preconditions and protected areas

The package is independently reviewed, adopted, and effective after VOC-114's
reviewed correction. A different release preparer fetches `origin/main` and
`origin/develop` without changing either ref. It records current SHAs, tree IDs,
merge-base, `git rev-list --left-right --count`, aggregate compare, and required
check/workflow boundaries. Frozen `main` must be the merge base and main-only count
must be zero. This is the release freeze; the initial plan observation is insufficient.

Before creating anything, derive
`release/voc-106-<frozen-develop-short-sha>` and prove that exact name is absent. An
existing name stops unless it is proved the untouched head of this same attempt; do
not adopt, overwrite, force-update, or delete another PR/actor ref. Create the release
head as a ref-only alias of the exact frozen develop SHA. Prove its SHA/tree equality,
zero extra commits, and no aggregate-compare commit/tree beyond frozen develop.
No plan or implementation actor reviews or merges their own revision.

## Ordered repository-history delivery

1. Open the separately reviewed PR from the exact immutable release alias into `main`,
   naming VOC-106 and binding all evidence to its exact head/base. Synthesize the
   prospective merge without moving refs and require its tree to equal frozen
   develop/head. Use only merge-commit method.
2. If either frozen ref, tree, merge-base, divergence, compare, PR head/base/metadata,
   required check, review, or policy surface changes, close and abandon the draft PR
   and ref without deleting or rewriting it. Return to a fresh fetch/freeze, fresh
   collision-free name/PR, and complete fresh evidence.
3. A distinct R4 reviewer and git-history specialist review the exact candidate;
   resolve blockers. A separate authorized non-author actor audits evidence and merges.
4. Read back the release merge SHA and current refs; require the actual merge tree to
   equal the frozen develop/head tree and permanent `develop` and `main` to remain.
   From current `develop`, create a
   short-lived `sync/voc-106-main-to-develop-<suffix>` branch, merge current `main`
   into it, and record its exact tip. Do not use `main` as the PR head.
5. Freshly validate/check/review that synchronization PR. Drift after this second
   freeze again invalidates its evidence. A separate authorized non-author actor
   merge-commits it into `develop`.
6. Read back refs. Record `git merge-base --is-ancestor origin/main origin/develop`
   success and `git rev-list --right-only --count origin/develop...origin/main` = 0.
   If GitHub deleted the merged short-lived head automatically, record its SHA and
   nonexecuted `git push origin <sha>:refs/heads/<branch>` recreation command. The
   existing setting may automatically delete only the successfully merged release
   and synchronization heads, never either permanent branch.

## Validation and independent verification

For this plan, run governance validation, risk classification, and whitespace checks.
For each later exact PR, rerun applicable local/hosted checks, review the frozen
compare and workflow boundary, and retain the actual command/output URLs. Do not
report a check from #190, a different SHA, or an earlier package as current evidence.

## Rollback

Use a reviewed revert PR for the exact release or synchronization merge commit.
Never use reset, force-push of an attempt, permanent, or foreign ref, manual branch
deletion, settings query/mutation, or an undocumented workaround. Repository rollback
grants no Cloudflare or production rollback.
