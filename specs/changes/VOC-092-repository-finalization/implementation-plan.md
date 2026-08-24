# VOC-092 — Implementation Plan

## Preconditions and delivery shape

Do not mutate settings, merge, promote, delete, or close issue #151 until the exact
package candidate passes different-actor R4/repository-operations review, receives an
accountable adoption decision, has complete adoption bookkeeping independently
reviewed, normally merges, and passes applicable post-merge checks.

The largest safe coherent delivery unit is one package, one minimum-sufficient task,
and one settings/documentation implementation PR into `develop`. The separate release
PR is mandatory under DOC-16 because it changes the protected `main` history. Both
share one task/evidence record; no component split is permitted.

## One-task execution sequence

1. Re-fetch GitHub and Git state. Confirm the adopted base, no unexpected open PR or
   issue, and the exact live settings pre-state. Stop on scope-changing drift.
2. Record completion evidence for every `VOC-085-HOLD-00` prerequisite: accountable
   settings operator and decision owner, exact action authority/expiry, timestamped
   pre-state, one-field payload, rollback owner/payload, and immediate docs plan. Then,
   under `VOC-092-AUTH-SETTINGS-00`, send only the API payload setting
   `delete_branch_on_merge` to `true`, read it back, and retain the inverse payload.
3. From the adopted `develop` revision in one isolated implementation worktree, update
   every declared living settings surface and the existing VOC-085 truthfulness guard
   and tests with the fresh date, source, value, mutation evidence boundary, staleness
   rule, and specialist-review status. Do not rewrite immutable VOC-080 historical
   snapshots or change workflows/eligibility/classification behavior.
4. Run YAML parsing/foundation settings tests where installed, governance validation,
   changed-path classification, formatting, diff whitespace, and exact path checks.
   Rehearse the docs rollback in a disposable worktree.
5. Open one implementation PR into `develop`. Record complete R4 and action-authority
   evidence. Obtain a different non-author exact-SHA general/R4 verdict and a different
   non-author repository-settings specialist verdict. Resolve every blocker with a new
   SHA and fresh review. A non-author actor merges only after genuine eligibility.
6. After post-merge checks, freeze exact `origin/develop` and `origin/main`. Verify the
   intended aggregate diff, inspect workflows for no automatic deployment effect, and
   open a `develop`-to-`main` release PR. If `develop` moves, refresh all exact evidence.
7. Obtain different non-author exact-SHA release review and hosted checks. Merge with a
   merge commit through a non-author actor. Re-fetch and prove `main` and `develop`
   trees equal; record the merge SHA and post-merge checks.
8. Enumerate every local worktree/branch fresh. For each exact auxiliary path, record
   path, branch, HEAD, clean porcelain status, active-process/ownership result,
   upstream/PR state, unique-commit result, and recovery SHA. Remove only clean,
   stopped, disposable worktrees normally, then remove corresponding merged branches
   with non-force `git branch -d`. Preserve every dirty/unique exception.
9. Enumerate every remote branch and PR relationship fresh after local cleanup. Attach the exact cleanup
   manifest to canonical GitHub evidence before deletion. Exclude `main`, `develop`,
   any protected/default/worktree-attached/open-PR/ambiguous/unrecoverable ref, and then
   delete each authorized ref by its exact validated name. A non-ancestor squash-merge
   candidate requires exact merged-PR evidence; ancestry is not assumed. Read back the
   remote branch set.
10. Re-audit settings, PRs, issues, remote refs, local refs/worktrees, tree equality,
    checks, and deployment boundary. Attach recovery instructions and close issue #151
    only when every acceptance criterion is satisfied.

## Validation and independent verification

Run at minimum:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base <adopted-base> --head HEAD
git diff --check <adopted-base> HEAD
```

Also run the installed repository-settings truthfulness/foundation tests discovered
from committed scripts, parse the changed YAML, inspect the exact changed-path list,
and use hosted CI/Governance/Security evidence. Quality is only applicable if the
actual path filter says so. Independent review binds to exact SHAs and never edits the
reviewed revision.

## Rollback

Use the inverse settings payload, recreate any deleted branch with its recorded SHA,
and use normal reviewed revert PRs for repository content or the main merge commit.
Never reset/force-push permanent branches and never force-remove dirty local state.
