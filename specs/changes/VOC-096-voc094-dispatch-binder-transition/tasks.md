# VOC-096 — Tasks

## VOC-096-T00 — Implement the fail-closed post-PR2 runtime binder

- Requirements: `VOC-096-D00` through `VOC-096-D13`, `VOC-096-D13A`, and
  `VOC-096-D14` through `VOC-096-D15`
- Acceptance criteria: `VOC-096-AC-00` through `VOC-096-AC-05`
- Tests: `VOC-096-TEST-00` through `VOC-096-TEST-07`
- Evidence: `VOC-096-EV-00` through `VOC-096-EV-07`
- Risk: R4
- Implementation mapping: PR1 exact 27-file VOC-094 reconciliation, generated-type
  refresh, and prepared-binder implementation; ACT-03; PR2 exact five-file
  documentation-only settings reconciliation; distinct post-merge exact-PR2 review,
  ACT-04 authority, and different-actor binder review; one ACT-04 dispatch; ACT-05
  cleanup
- Status: planned-pending-adoption

This remains one task because the prepared state, live binder, PR2 truth boundary,
replay defense, unchanged delivery gates, reviews, and rollback form one authorization
outcome. The two PRs are retained only for the already-adopted external-settings/truth
boundary; component count or implementation convenience does not justify another
task or PR.

PR1 binds the complete `prepared_staging_tuple`, preserves distinct original-execution
and final-readback closure hashes, and regenerates/checks both locked-Wrangler Worker
type files. The live transition fetches five strict records: the distinct VOC-085
settings authority, ACT-03, merged-PR2 exact review, ACT-04 authority, and binder
review. Each must match the committed unauthenticated GitHub API
publisher trust root, while separately attributable actor/provenance records—not the
shared publisher—carry governance independence. The closed body schemas are separate
from fetched API-envelope metadata and forbid self URL/hash/timestamp fields. Server
time is ordered exactly from settings authority/ACT-03/PR2 merge through review/
authority/binder/current run;
authority API `created_at` alone is issuance, body `expires_at` is later by at most 30
minutes and no later than effective token expiry. PR2, both live checks, and first
secret-bearing step also precede the applicable token/settings deadline. The bounded
`filter=all` check-runs projection is cutoff at the review envelope so dispatch-created
checks cannot replace recorded evidence. A second bounded push-workflow-runs projection
proves exact event/name/path/ID/head/branch/check-suite provenance and rejects same-name
manual dispatches. The exhaustive expiry rule is `created_at < actual expires_at <=
min(created_at + 30 minutes, effective token expiry)`; all eight binders are deterministic.

VOC-096 authorizes zero external actions. The three remaining actions are the existing
VOC-094-ACT-03, ACT-04, and ACT-05, each still requiring its own accountable actor and
effective action record.
