# VOC-087 — Release and Rollback Plan

## Repository release boundary

There is no deployment or live product release in this package. After adoption, the one
implementation PR may merge normally into `develop` only after exact-revision review and
required hosted checks. `main` promotion, Cloudflare delivery, repository/settings
mutation, staging or production access, secrets, production data, and live verification
are prohibited.

`automatic_merge_allowed: true` is an examined package policy record under the current
drafting rule; it creates no executable merge, bypass, or external authority. A separate
merge actor must still confirm normal eligibility.

## Preconditions and evidence

Before implementation merge, record on the same PR:

- exact base and final head SHAs plus the bounded file inventory;
- immutable plan-review history, including the initial FAIL for candidate
  `cbede7d17e0883e0871d9921aaef781dee087f45` and the later exact-candidate verdict;
- focused fixture/presentation/list/empty/accessibility results and full `pnpm validate`;
- hosted CI, Governance, Security, and path-triggered Quality results;
- different-actor exact-SHA PASS with all blockers resolved; and
- disposable repository-only rollback rehearsal and tree equality.

After merge, attach the merge SHA and applicable post-merge CI/Governance/Security
results to the implementation PR. Quality is pull-request-only at drafting time, so its
exact final PR run is the browser qualification; do not claim a post-merge Quality run
unless the workflow is changed by separately authorized work.

## Rollback

Triggers include a false total claim, missing/reordered/duplicated rows, changed empty or
auth behavior, accessibility regression, unexpected extra saved-word requests, or a
scope breach. The accountable rollback owner named in the implementation PR opens a
normal revert PR for the exact implementation change. The last-known-good reference is
the exact `develop` base of that implementation PR. No data restore, migration rollback,
deployment, cache purge, or live-system action applies.

## Closure

Plan adoption does not close issue #132. Implementation merge alone also does not close
it while applicable post-merge checks are pending. After those checks pass, an
accountable operator may close the issue with links to the implementation PR, exact
review, hosted evidence, merge SHA, and post-merge results. The final evidence belongs
on the same implementation PR/issue record; no ceremony-only second repository PR is
required.
