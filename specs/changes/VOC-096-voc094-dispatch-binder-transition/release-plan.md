# VOC-096 — Release and Rollback Plan

## Adoption and repository release

This draft grants no implementation or external-action authority. After independent
plan reviews and an accountable decision, adoption bookkeeping must bind the exact
candidate SHA before a non-author plan merge. Implementation remains two PRs into
`develop`; neither merge deploys or changes GitHub/Cloudflare settings. Both source
heads and all existing worktrees/recovery refs remain recoverable while open.

PR1's bounded amendment makes all nine VOC-094 package surfaces agree with the
corrected transition while preserving immutable history; it is repository-ready but
dispatch-ineligible. Its exact 27-file scope also regenerates both locked-Wrangler
type contracts and binds the complete prepared Cloudflare tuple. ACT-03 and PR2 retain
VOC-094's truthful settings boundary. PR2
is documentation-only and its merge SHA becomes the
sole possible ACT-04 revision only after the strict ACT-03 record, fetched merged-PR2
exact-review record, authority, and binder-review records pass. ACT-03 itself is valid
only after its separately fetched strict VOC-085 settings-authority record passes and
its operator/scope/payload/deadline exactly match. There is no `develop`
to `main` release in this package.

## External activation boundary

VOC-096 adoption, PR1, and PR2 authorize none of the following:

- creating/reconciling `cloudflare-staging` or setting its secrets;
- issuing, entering, reading, reusing, or revoking a Cloudflare token;
- dispatching a workflow;
- applying a migration, uploading/promoting/rolling back a Worker, or changing traffic;
- changing DNS, cost, production, or learner data.

Those effects remain exclusively under effective VOC-094-ACT-03/04/05 records. The
runtime binder validates an authority; it does not create one.

All five canonical records must match the committed unauthenticated GitHub publisher
login/numeric ID/type/site-admin/`CONTRIBUTOR` association and exact API issue URL.
An authenticated client's `MEMBER` observation is not substituted. This authenticates the relay account only. Distinct
governance actors remain separately attributable through the exact nested provenance
shape and independent review. The merged-PR2 review is created after merge; authority
follows it. Each URL, digest, timestamp, and publisher is a fetched envelope fact, not
a same-body self-reference. The authority body has no `issued_at`; immutable API
`created_at` is the sole issuance time, and exhaustively `created_at < actual expires_at
<= min(created_at + 30 minutes, effective token expiry)` with no unused maximum-window
buffer. Binder review follows, and current-run creation plus both live checks and the
first secret-bearing step remain strictly before the earlier ACT-04/effective Phase-4
token expiry. PR2 merge is also before settings-authority and token expiry.
Required hosted checks are selected only from the PR2-merge-to-review-envelope window;
current-dispatch checks on that same SHA cannot replace the reviewed projection. Each
selection must additionally map to its exact first-attempt successful `push` workflow
run/name/path/ID/head/branch/check suite; a same-name workflow dispatch is invalid.
Both workflow-run URL suffixes and the details-URL run suffix must parse as the same
safe normalized run ID, while the details-URL job suffix equals `check_run_id` and the
check/workflow suite IDs are equal. Canonical mismatches block before secrets.

## Rollback

- Before ACT-03, revert PR1 through a normal reviewed PR; no external rollback exists.
- After ACT-03 but before dispatch, keep dispatch blocked, revoke the token if required
  by its action record, and use a governed documentation correction for any setting
  rollback truth. Never pretend a repository revert removed a secret.
- After dispatch starts, preserve the immutable run record and use VOC-094's exact
  Worker rollback/outcome path. D1 remains forward-only unless a separately authorized
  recovery action exists.
- A consumed, failed, expired, or edited binder is never repaired or reused. A new
  ACT-04 record/review may be issued only under unchanged authority and current drift
  checks. If the Phase-4 token expires while PR2 is open, stop and obtain a fresh exact
  VOC-085 authority plus replacement ACT-03 before merge and before replacing only the
  API-token secret. After PR2 merge, stop for a newly governed correction. No silent
  credential reissue or other settings change is permitted.
- A missing/edited/reordered ACT-03 or merged-PR2-review record, publisher mismatch,
  actor-provenance collision, wrong tuple identifier/hash, probe-as-baseline selection,
  stale generated type, or timestamp equality/skew blocks dispatch and returns to the
  governed correction path; it is never bypassed by editing PR2 or weakening a gate.
- Revert repository logic only through a separately reviewed PR. Never force-push or
  weaken the prior gate.

## Closure

Close issue #164 only after both implementation PRs are normally merged with exact
reviews and post-merge evidence proves the fixed point is removed while all legacy
gates remain. Issue #158 remains canonical and open until full F3 staging activation,
smoke/rollback, exact-zero-cost, production-hold, and token-revocation evidence is
complete.
