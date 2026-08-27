# VOC-098 — Specification

## Objective and exact baseline

Correct issue #169 without discarding or replacing the preserved Phase-3
implementation. At exact `develop` base
`45590a0673937f4a9464b57393e026871678b3d4`, VOC-097 still says its repository
implementation authority is ineffective and pending review/eligibility/merge even
though PR #167 completed those events. PR #168 remains open and unmerged at rejected
SHA `cde0f665031a212b51a45af541a4ebaff23e8f7a`; its three independent FAIL reviews
found four correctable defects inside the existing authorized paths plus the
out-of-scope VOC-097 lifecycle defect.

## Requirements

- `VOC-098-D00` — Treat issue #169 and all PR #168 FAIL comments as bug/review
  evidence only. Implementation resumes only after this exact package receives
  independent review, accountable adoption, truthful bookkeeping, genuine
  eligibility, normal non-author plan merge, and applicable post-merge checks.
- `VOC-098-D01` — Resume the same PR #168 branch
  `impl/voc-094-f3-staging-activation-pr1` and worktree
  `/tmp/vocanova-voc094-pr1`. Preserve its commits, open PR, dirty VOC-090 worktree,
  every other worktree, branch, recovery ref, and source-head recreation evidence.
  Do not reset, recreate, discard, force-push, or delete them.
- `VOC-098-D02` — Reconcile all nine VOC-097 package files with the immutable PR #167
  lifecycle facts: reviewed bookkeeping head
  `814c31deb893c5c72b80f3075c0905fc8ba8c9c5`, exact bookkeeping review comment
  `5443475414`, Governance run `33103467324` with literal `eligible: true` and
  `reasons: []`, normal merge SHA
  `45590a0673937f4a9464b57393e026871678b3d4`, successful post-merge CI
  `33103648900`, Security `33103648876`, Governance `33103648935`, and lifecycle
  readback comment `5443938338`. Set repository implementation authority/effectiveness
  and task status truthfully while preserving immutable candidate/adoption history.
- `VOC-098-D03` — Expand the preserved PR #168 authorized union from exactly 38 to
  exactly 47 paths by adding only the nine VOC-097 package files. The corrected PR is
  expected to have 46 actual diffs because the authorized web generated-type file is
  byte-identical. A 48th path, a missing required path, or a fabricated generated diff
  stops for new package review.
- `VOC-098-D04` — Resolve the first-secret-step deadline blocker inside the already
  authorized workflow/policy/test surfaces. The first secret-bearing step must capture
  runner UTC and compare it with both the validated ACT-04 authority expiry and the
  effective Phase-4 token expiry before its first secret read. Equality or lateness at
  either deadline fails closed. The handoff of non-secret validated deadlines must be
  integrity-bound to the same live verification and cannot expose a credential.
- `VOC-098-D05` — Implement the closed live HTTP contract as an independently enforced
  5-second connection deadline and a 15-second deadline covering the complete response
  body, not only response headers. Clear timers only after the bounded body is fully
  consumed or the request fails. Add deterministic delayed-connect and stalled-body
  negatives; no retry or fixture fallback is introduced.
- `VOC-098-D06` — Reject unpaired high or low UTF-16 surrogates recursively in strict
  JSON/JCS object keys and string values before canonicalization. Preserve valid
  supplementary-code-point pairs. Add key/value lone-high/lone-low negatives and valid
  pair positives in the already authorized delivery-policy tests.
- `VOC-098-D07` — Reconcile the four stale operative VOC-094 exact-27-file PR1 claims
  identified by exact R4 review in `acceptance-criteria.md`,
  `implementation-plan.md`, `tasks.md`, and `release-plan.md` to the adopted
  29-core/38-total VOC-097 state. Preserve explicitly historical 27-path evidence.
  Repair the final-evidence package-text test so stale operative claims in both
  VOC-094 and VOC-096 fail; it must not merely find some corrected text and false-pass.
- `VOC-098-D08` — Preserve rejected SHA
  `cde0f665031a212b51a45af541a4ebaff23e8f7a` and review comments `5443876203`,
  `5443893558`, and `5443923705` as immutable FAIL history. No review, approval,
  eligibility, adoption, implementation, merge, or external-action authority
  transfers to a changed SHA. The corrected head requires all three fresh reviews.
- `VOC-098-D09` — Preserve every existing VOC-094/VOC-096/VOC-097 fail-closed gate:
  prepared-but-dispatch-ineligible state; closed five-record/eight-binder contract;
  exact SHA/ref/URL/ID/run/suite/job equality; replay and request budgets; expiry;
  resource/baseline/probe/schema/migration/smoke equality; locked Wrangler types and
  dry runs; Free plans and exact incremental cost `0`; unchanged Basic Load
  Balancing; secret isolation; production sentinels; and HOLD-01/HOLD-02.
- `VOC-098-D10` — Run complete PR #168 validation on the fresh corrected SHA,
  including workflow-directed boundary tests, HTTP timeout tests, strict Unicode/JCS
  tests, both package-text scans, final-evidence/delivery policy suites, full workspace
  and foundation/delivery/local-stack checks, both generated-type checks, all four
  staging/production Wrangler dry runs, governance/risk/diff checks, secret scans,
  hosted checks, and production-sentinel comparisons.
- `VOC-098-D11` — Obtain separate fresh exact-SHA Cloudflare/Wrangler,
  security/settings, and independent R4 PASS reviews with zero blockers. A reviewer
  that edits becomes builder. Only a distinct non-author actor may merge after genuine
  eligibility. Record post-merge checks and source-head recovery without deleting any
  worktree/ref.
- `VOC-098-D12` — This package authorizes repository correction only. It creates no
  settings, environment, secret, credential, Cloudflare, DNS, D1, dispatch,
  deployment, migration, promotion, rollback, traffic, spend, production, data,
  launch, or `main` authority. All live and production holds remain unchanged.

## Exact scope and exclusions

The authoritative 47-path inventory is in `change.yaml`: VOC-097's existing 38-path
union plus exactly the nine VOC-097 package files. No product behavior, new dependency,
resource recreation, token creation, external read/write, branch deletion, or broad
documentation cleanup is in scope.

## VOC-099 completed PR #170 lifecycle reconciliation

The operative VOC-098 plan lifecycle is complete: reviewed bookkeeping head
`6545cbb968a03a7630ccd63de3023c6e6da23ccd`, exact review comment `5444345026`,
Governance run `33109750265` with literal `eligible: true` and `reasons: []`, normal
non-author merge `10e9acf540b9af5ed85cc59a0e053900aec3c359`, successful post-merge CI
`33109968598`, Security `33109968586`, Governance `33109968546`, and lifecycle
readback comment `5444428909`. The adopted repository-only PR #168 authority is
usable without another self-effectiveness plan. Rejected SHA
`cde0f665031a212b51a45af541a4ebaff23e8f7a` and its three FAIL reviews remain
immutable and non-transferable. ACT-03/04/05, VOC-085-HOLD-00, VOC-080-HOLD-01,
VOC-080-HOLD-02, and every external action remain held; fresh exact-SHA checks/reviews
and non-author merge remain required for PR #168.
