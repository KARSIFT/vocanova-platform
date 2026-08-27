# VOC-099 — Specification

## Objective and exact baseline

Correct issue #171 at exact `develop` base
`10e9acf540b9af5ed85cc59a0e053900aec3c359` without discarding or replacing the
preserved Phase-3 implementation. PR #170 completed exact bookkeeping review,
genuine eligibility, normal non-author merge, and successful post-merge checks for
VOC-098, but the merged package still records those events as pending and its
repository authority as ineffective. PR #168 remains open and unmerged at rejected
SHA `cde0f665031a212b51a45af541a4ebaff23e8f7a`.

## Requirements

- `VOC-099-D00` — Issue #171, prior issues, lifecycle comments, and rejected PR #168
  reviews grant nothing by themselves. Exact candidate `10a9a822...` received all
  three required different-actor PASS reviews and accountable `VOC-099-ADOPT-01`.
  This bookkeeping records `status: adopted` and `implementation.authorized: true`.
  Fresh different-actor bookkeeping review, genuine eligibility, and normal
  non-author merge remain required process and evidence, not a later authority gate.
- `VOC-099-D01` — Do not encode another self-staling authority gate. The adopted
  package must omit an `authority_effective: false` field and must not say repository
  implementation remains draft, pending a future plan, or dependent on a later
  self-referential bookkeeping correction. Once the adopted package is on `develop`,
  its declared repository-only authority is usable. Exact review, eligibility,
  non-author merge, and post-merge checks remain mandatory evidence and process.
- `VOC-099-D02` — Reconcile all nine VOC-098 package files to the immutable PR #170
  lifecycle facts: reviewed bookkeeping head
  `6545cbb968a03a7630ccd63de3023c6e6da23ccd`, bookkeeping review comment
  `5444345026`, Governance run `33109750265` with literal `eligible: true` and
  `reasons: []`, normal merge SHA
  `10e9acf540b9af5ed85cc59a0e053900aec3c359`, successful post-merge CI
  `33109968598`, Security `33109968586`, Governance `33109968546`, and lifecycle
  readback comment `5444428909`. Make repository implementation authority and task
  status truthful while preserving candidate/adoption history and external holds.
- `VOC-099-D03` — Expand the preserved PR #168 authorized union from exactly 47 to
  exactly 56 paths by adding only the nine VOC-098 package files. The corrected PR is
  expected to have 55 actual diffs because the authorized web generated-type file
  remains byte-identical. A 57th path, a missing required path, or a fabricated
  generated diff stops for new package review.
- `VOC-099-D04` — Retain VOC-098's full authorization to reconcile all nine VOC-097
  surfaces with PR #167 facts and resolve the four rejected-PR findings: atomic
  ACT-04/token expiry enforcement before the first secret read; a real five-second
  connection and fifteen-second whole-response timeout; recursive lone-surrogate
  rejection with valid-pair tests; and removal/testing of stale operative VOC-094
  27-path claims.
- `VOC-099-D05` — Preserve rejected SHA `cde0f665...` and comments `5443876203`,
  `5443893558`, and `5443923705` as immutable FAIL evidence. No review, approval,
  eligibility, adoption, merge, or authority transfers. A fresh corrected candidate
  requires complete checks and three fresh exact-SHA reviews.
- `VOC-099-D06` — Preserve every prepared-binder, exact SHA/ref/URL/ID/run/suite/job,
  replay, request-budget, expiry, resource, baseline, schema, migration, smoke,
  generated-type, Wrangler dry-run, Free/$0, unchanged Basic Load Balancing, secret,
  rollback, production-sentinel, and hold gate from VOC-094 through VOC-098.
- `VOC-099-D07` — Run the complete PR #168 validation matrix on the fresh candidate,
  including all VOC-098 boundary tests, full workspace/foundation/delivery/local-stack
  validation, both generated-type checks, all four Wrangler dry runs, governance/risk/
  diff checks, secret scans, hosted checks, and production-sentinel comparisons.
- `VOC-099-D08` — Obtain separate fresh exact-SHA Cloudflare/Wrangler,
  security/settings, and independent R4 PASS reviews with zero blockers. A reviewer
  that edits becomes builder. Only a distinct non-author actor may merge after
  genuine eligibility; post-merge/source-head/ref evidence is required.
- `VOC-099-D09` — Resume only the existing PR #168 branch
  `impl/voc-094-f3-staging-activation-pr1` and worktree
  `/tmp/vocanova-voc094-pr1`. Preserve its commits, open PR, dirty VOC-090 worktree,
  every worktree, branch, recovery ref, rejected-SHA history, and recreation evidence.
  Do not reset, recreate, discard, force-push, or delete them.
- `VOC-099-D10` — Authorize repository correction only. Settings, environments,
  secrets, credentials, Cloudflare, DNS, D1, dispatch, deployment, migration,
  promotion, rollback, traffic, spending, production, data, launch, and `main`
  actions remain prohibited and held.

## Exact scope and exclusions

The authoritative 56-path implementation inventory is in `change.yaml`: VOC-098's
47 paths plus exactly the nine VOC-098 package files. This one task stays in the same
PR #168 because the effectiveness reconciliation and existing corrections are one
indivisible repository authority/delivery-policy boundary. No product behavior, new
dependency, resource recreation, token creation, external read/write, branch deletion,
or broad documentation cleanup is in scope.
