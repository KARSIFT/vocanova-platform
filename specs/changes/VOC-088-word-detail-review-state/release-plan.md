# VOC-088 — Release and Rollback Plan

## Repository boundary and authorization

Adoption is recorded, but implementation authority becomes effective only after this
bookkeeping revision's exact-SHA review and hosted checks, normal PR #142 merge, and
applicable post-merge checks. The later one implementation pull request may change the
declared repository paths and target `develop`. It may merge normally only after its
own deterministic evidence, different-actor exact-SHA PASS, no unresolved blocker,
hosted eligibility, and separate non-author merge audit.

`automatic_merge_allowed: true` is an examined package-policy record. No current
workflow uses it to merge, and it bypasses no risk, check, review, evidence, EHR, or
action-specific boundary. `main` promotion, Cloudflare preview/staging/production,
deployment, DNS, repository settings, secrets, production data, live access, spending,
and launch remain prohibited.

## Preconditions and evidence

Before implementation merge, record on the same pull request:

- exact adopted base, final head SHA, and eleven-file inventory;
- fixed-clock mapping, minimized DTO, soft-delete, real-session isolation, and anonymous
  denial results;
- generated OpenAPI diff/check, runtime schema assertion, retired contract check,
  API-client build/test/declaration evidence;
- direct mock contract, SSR copy/content/accessibility, and stateful save/unsave/
  sentence-practice/failure results;
- full `pnpm validate`, `pnpm ci:worker-api`, `pnpm ci:web`, governance, format, and
  diff-check results;
- disposable repository-only rollback rehearsal and tree equality;
- different-actor exact-SHA review with every blocker resolved; and
- hosted CI, Governance, Security, and path-triggered Quality results.

After normal merge, attach the merge SHA and applicable post-merge CI/Governance/
Security results. Quality is pull-request path-triggered at drafting time; do not
invent a post-merge Quality run if none exists.

## Monitoring and outcome

There is no live monitoring or environment verification in this package. Repository
outcome is passing contract/repository/browser evidence on the exact implementation
revision and applicable post-merge checks. A future separately authorized release may
observe live behavior through its own held delivery/monitoring contract; this package
does not claim or create that capability.

## Rollback

Rollback triggers are requester-state leakage, wrong due boundary, terminal/inactive
state misclassification, raw schedule exposure, OpenAPI/client drift, missing or stale
review-state/practice behavior after mutation, accessibility regression, added query/
request fan-out, or any scope violation.

The accountable rollback owner named on the implementation PR opens a normal revert PR
for the exact implementation revision. The last-known-good reference is the exact
`develop` base of that PR. Re-run the focused Worker/client/browser checks and applicable
repository validation on the revert. No D1 restore, migration rollback, data repair,
cache purge, Cloudflare action, secret, or deployment applies.

## Closure

Plan adoption does not close issue #139. Implementation merge alone also does not close
it while applicable post-merge checks are pending. After they pass, an accountable
operator may close the issue with links to the implementation PR, exact final review,
hosted evidence, merge SHA, and post-merge results. Evidence belongs on that PR/issue;
no ceremony-only follow-up repository PR is planned.
