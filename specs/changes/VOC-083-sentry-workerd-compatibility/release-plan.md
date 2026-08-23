# VOC-083 — Release and Rollback Plan

## Repository delivery and authority

This draft grants no implementation authority. The reviews of
`682b33ec1a126e8924395f7d7f7eb26191f2a57a` (comment 5385262973) and
`07772a00f753e614d3fd7a51539cabe4f0da1393` (comment 5385292757) both failed; this
revision needs a fresh exact-SHA review before adoption. After adoption, T00 may gather
evidence and run bounded disposable local candidate probes in isolated worktrees, but
it lands only a provisional decision. T01 applies that choice and T02 alone qualifies
the canonical bundle/workerd/reporting result. T02 failure returns through updated
T00/T01 and fresh exact-SHA review; it never silently selects or ships another option.
Subsequent work is reversible repository-only commits and different-role review. Merging
a revision does not deploy a Worker, contact Sentry, upload source maps, query an
account, provision a resource, or complete any VOC-080 hold. The existing four workflows
remain deterministic evidence only.

## Preconditions, monitoring, and outcome

Before implementation review passes, the final revision must show the candidate matrix,
same-job fresh complete generated-artifact manifest/scan, no unexpected workerd
diagnostics, reporting-equivalence test, frozen dependency/lockfile evidence, audit
where applicable, and docs inventory. The runtime keeps error reporting/privacy
controls; local test transport and logs are not a claim that an event reached a hosted
Sentry project. There is no staging, production, or live monitoring outcome to record.

## Rollback

Rollback triggers include any prohibited Wasm call in the generated bundle, unexpected
unhandled rejection/error output, loss of required capture, leaked sensitive data,
source-map/credential regression, unsafe dependency result, or failed exact-SHA review.
Revert the selected task commits in reverse order, restore the recorded predecessor
lockfile/configuration, and rerun the corresponding local bundle/workerd checks. This
rollback changes repository history only and must not represent a Sentry configuration
or Cloudflare deployment rollback.

## Independent verification and closure

Closure requires AC-00 through AC-05, EV-00 through EV-06, all applicable deterministic
checks, a different-role Cloudflare/Workers/Sentry specialist verdict bound to the exact
final SHA, resolved blocking findings, and repository rollback evidence. The closure
record must preserve that no Sentry API/live query, source-map upload, Cloudflare action,
or inherited VOC-080 hold completion occurred.
