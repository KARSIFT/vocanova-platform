# VOC-085 — Tasks

## VOC-085-T00 — Record the public settings snapshot current as observed at 2026-08-24

- Requirements: `VOC-085-D00`, `VOC-085-D01`, `VOC-085-D07`
- Acceptance: `VOC-085-AC-00`
- Tests: `VOC-085-TEST-00`
- Evidence: `VOC-085-EV-00`
- Status: complete-exact-SHA-429aee4c5b833c3f0ae2e870f11077fbd1e06cad-merged-through-PR-127-with-final-hosted-and-post-merge-evidence

Add `docs/governance/repository-settings-current.yaml` containing the verified
read-only values, `observed_at: 2026-08-24`, `as_of: 2026-08-24`, source/API endpoint
surface, point-in-time freshness/staleness semantics, and explicit no-mutation
boundary. Record dependency/vulnerability alerts separately from Dependabot security
updates, using the read-only vulnerability-alerts and automated-security-fixes endpoint
responses. State that the network-free guard proves internal consistency only and
cannot prove live freshness. Require a distinct repository-governance/settings
specialist to review the source/API schema, availability-versus-enabled
interpretation, and dependency-alert versus security-update distinction on the exact
final revision; this evidence starts pending. Cross-check every field against issue
#119's evidence and any fresh read-only dependency-alert evidence. Preserve
`docs/operations/voc-080-transition-record.{json,md}` unchanged as historical private
state; do not query or mutate secrets, environments, Cloudflare, Sentry, DNS, servers,
or production data.

## VOC-085-T01 — Reconcile living guidance and desired-control labels

- Requirements: `VOC-085-D02`, `VOC-085-D04`, `VOC-085-D05`, `VOC-085-D06`, `VOC-085-D07`
- Acceptance: `VOC-085-AC-01`, `VOC-085-AC-02`
- Tests: `VOC-085-TEST-01`, `VOC-085-TEST-02`
- Evidence: `VOC-085-EV-01`, `VOC-085-EV-02`
- Status: complete-exact-SHA-efeb1d0b7f7e61138a2b705719a3d8e2389be342-merged-through-PR-128-with-preserved-general-and-specialist-FAILs

Update the active README, `.github` README, repository-settings guide, Cloudflare
delivery guide, and DOC-16 wording/metadata as applicable. Use “current as observed at
2026-08-24” language, link the point-in-time record, and clearly separate configured
Actions hardening, observed dependency/vulnerability alerts, absent/disabled controls,
historical VOC-080 evidence, and prospective controls held by VOC-085-HOLD-00 or the
distinct VOC-080 holds. Update the DOC-16 amendment history when the observed posture
changes. Do not rewrite historical records or activate any desired setting.

## VOC-085-T02 — Add a scoped static truthfulness guard

- Requirements: `VOC-085-D03`, `VOC-085-D04`, `VOC-085-D06`, `VOC-085-D07`
- Acceptance: `VOC-085-AC-03`
- Tests: `VOC-085-TEST-03`, `VOC-085-TEST-04`
- Evidence: `VOC-085-EV-03`
- Status: complete-exact-SHA-47293d416a7a85ecbbbee0c8f0b03608ae4d17c2-merged-through-PR-129-with-preserved-superseded-FAILs

Add a deterministic, network-free validator and narrow negative fixtures, wiring it
into the existing foundation aggregate without workflow or authority expansion. It
must validate required point-in-time/freshness fields and
reject stale active claims, current/history conflation, held-control promotion, and
settings-mutation claims while allowing explicitly labelled historical/prospective
text. It must state in its evidence that it proves internal consistency only and
cannot prove live freshness. The formal settings hold must not block repository-only
merge. No GitHub API write, merge, comment, close, dispatch, settings mutation, or
background process is permitted.

## VOC-085-T03 — Final review, rollback, hosted proof, and issue closure record

- Requirements: all
- Acceptance: `VOC-085-AC-04`
- Tests: `VOC-085-TEST-05`, `VOC-085-TEST-06`
- Evidence: `VOC-085-EV-04`
- Status: candidate-local-validation-and-reverse-order-rollback-prepared-pending-fresh-exact-review-hosted-proof-merge-post-merge-checks-and-issue-closure

Run proportional governance/risk/diff validation, exact-SHA independent general and
repository-governance/settings-specialist review, applicable hosted checks, and a
disposable reverse-order repository rollback rehearsal.
After a normal merge into `develop` and passing post-merge checks, an accountable
operator may close #119 with the prepared repository-only wording in `t03-evidence.yaml`.
Keep VOC-085-HOLD-00 and all VOC-080 holds open and distinct. Do not mutate settings,
deploy, promote `main`, or delete branches; normal isolated branches and governed PR
merges remain allowed. The exact rollback and validation record remains candidate-only
until fresh review, hosted proof, merge, and post-merge checks.
