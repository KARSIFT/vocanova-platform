# VOC-083 — Release and Rollback Plan

## Repository delivery and authority

This draft grants no implementation authority. After independent plan review and
adoption, implementation is delivered as reversible repository-only task commits and
different-role exact-SHA review. Merging a revision does not deploy a Worker, contact
Sentry, upload source maps, query an account, provision a resource, or complete any
VOC-080 hold. The existing four workflows remain deterministic evidence only.

## Preconditions, monitoring, and outcome

Before implementation review passes, the final revision must show the candidate matrix,
generated bundle scan, no unexpected workerd diagnostics, reporting-equivalence test,
frozen dependency/lockfile evidence, audit where applicable, and docs inventory. The
runtime keeps error reporting/privacy controls; local test transport and logs are not a
claim that an event reached a hosted Sentry project. There is no staging, production,
or live monitoring outcome to record.

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
