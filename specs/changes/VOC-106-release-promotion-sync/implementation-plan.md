# VOC-106 — Implementation Plan

## Preconditions and protected areas

Do nothing until this package is independently reviewed, adopted, and normally merged
to `develop`. A different release preparer then fetches `origin/main` and
`origin/develop` without changing either ref. It records current SHAs, tree IDs,
merge-base, `git rev-list --left-right --count`, aggregate compare, and required
check/workflow boundaries. This is the release freeze; the initial plan observation
is insufficient.

The preparer verifies that a release PR will not delete permanent `develop` and makes
no repository-settings mutation. If this cannot be proven, stop and record the
blocker. No plan or implementation actor merges their own revision.

## Ordered repository-history delivery

1. Open the separately reviewed `develop` → `main` release PR naming VOC-106 and
   binding all evidence to its exact source/base. Use only merge-commit method.
2. If either frozen ref, tree, merge-base, PR head/base, required check, review, or
   policy surface changes, invalidate the binder and return to a fresh fetch/freeze.
3. A distinct R4 reviewer and git-history specialist review the exact candidate;
   resolve blockers. A separate authorized non-author actor audits evidence and merges.
4. Read back the release merge SHA and current refs. From current `develop`, create a
   short-lived `sync/voc-106-main-to-develop-<suffix>` branch, merge current `main`
   into it, and record its exact tip. Do not use `main` as the PR head.
5. Freshly validate/check/review that synchronization PR. Drift after this second
   freeze again invalidates its evidence. A separate authorized non-author actor
   merge-commits it into `develop`.
6. Read back refs. Record `git merge-base --is-ancestor origin/main origin/develop`
   success and `git rev-list --right-only --count origin/develop...origin/main` = 0.
   If GitHub deleted the merged short-lived head automatically, record its SHA and
   `git push origin <sha>:refs/heads/<branch>` recreation command.

## Validation and independent verification

For this plan, run governance validation, risk classification, and whitespace checks.
For each later exact PR, rerun applicable local/hosted checks, review the frozen
compare and workflow boundary, and retain the actual command/output URLs. Do not
report a check from #190, a different SHA, or an earlier package as current evidence.

## Rollback

Use a reviewed revert PR for the exact release or synchronization merge commit.
Never use reset, force-push, manual permanent-branch deletion, or an undocumented
settings change. Repository rollback grants no Cloudflare or production rollback.
