# VOC-087 — Release and Rollback Plan

## Repository release boundary

There is no deployment or live product release in this package. Adoption is recorded,
and implementation authority became effective after the bookkeeping revision's
exact-SHA review and hosted checks, normal PR #137 merge, and applicable post-merge
checks. The one implementation PR, PR #138, merged normally into `develop` only after
its own exact-revision review and required hosted checks. `main` promotion, Cloudflare
delivery, repository/settings mutation, staging or production access, secrets,
production data, and live verification were prohibited and not performed.

`automatic_merge_allowed: true` is an examined package policy record under the current
drafting rule; it creates no executable merge, bypass, or external authority. A separate
merge actor must still confirm normal eligibility.

## Preconditions and evidence

The implementation PR recorded:

- exact base and final head SHAs plus the bounded file inventory;
- immutable plan-review history, including the initial FAIL for candidate
  `cbede7d17e0883e0871d9921aaef781dee087f45` and the later exact-candidate verdict;
- focused fixture/presentation/list/empty/accessibility results and full `pnpm validate`;
- hosted CI, Governance, Security, and path-triggered Quality results;
- different-actor exact-SHA PASS with all blockers resolved; and
- disposable repository-only rollback rehearsal and tree equality.

After merge, PR #138 recorded merge SHA `ea357ce506f42fe74c7e88f670db9ce4f848d80e`
and applicable post-merge CI/Governance/Security results at
https://github.com/KARSIFT/vocanova-platform/pull/138#issuecomment-5391130488. Quality
was pull-request-only for that path, so the exact final PR run remained the browser
qualification; no post-merge Quality run is claimed.

## Rollback

Triggers include a false total claim, missing/reordered/duplicated rows, changed empty or
auth behavior, accessibility regression, unexpected extra saved-word requests, or a
scope breach. The accountable rollback owner named in the implementation PR opens a
normal revert PR for the exact implementation change. The last-known-good reference is
the exact `develop` base of that implementation PR. No data restore, migration rollback,
deployment, cache purge, or live-system action applies.

## Closure

Plan adoption did not close issue #132. Implementation merge alone also did not close
it while applicable post-merge checks were pending. After those checks passed, issue
#132 closed at `2026-08-24T05:32:23Z` with links to the implementation PR, exact
review, hosted evidence, merge SHA, and post-merge results:
https://github.com/KARSIFT/vocanova-platform/issues/132#issuecomment-5391130633. The
final evidence remains on the same implementation PR/issue record; no ceremony-only
second repository PR was required.
