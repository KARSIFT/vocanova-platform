# VOC-097 — Tasks

## VOC-097-T00 — Close the final-evidence compatibility gap in preserved VOC-096 PR1

- Requirements: `VOC-097-D00` through `VOC-097-D10`
- Acceptance criteria: `VOC-097-AC-00` through `VOC-097-AC-05`
- Tests: `VOC-097-TEST-00` through `VOC-097-TEST-05`
- Evidence: `VOC-097-EV-00` through `VOC-097-EV-05`
- Risk: R4
- Implementation mapping: the single preserved VOC-096 PR1, corrected 29-path core
  plus nine VOC-096 package reconciliation paths, 38 authorized paths total
- Status: adopted; repository-only PR #168 implementation authority effective after
  completed PR #167 review, eligibility, non-author merge, and post-merge evidence

This is one task because validator compatibility, exact scope reconciliation,
production holds, negative tests, and the existing prepared-binder implementation are
one indivisible authorization boundary. It performs no external action.

## VOC-098 completed PR #167 lifecycle reconciliation

The operative VOC-097 plan lifecycle is complete: reviewed bookkeeping head
`814c31deb893c5c72b80f3075c0905fc8ba8c9c5`, exact review comment `5443475414`,
Governance run `33103467324` with literal `eligible: true` and `reasons: []`, normal
non-author merge `45590a0673937f4a9464b57393e026871678b3d4`, successful post-merge CI
`33103648900`, Security `33103648876`, Governance `33103648935`, and lifecycle
readback comment `5443938338`. Repository implementation authority is effective only
for the declared PR #168 correction. Rejected SHA `cde0f665031a212b51a45af541a4ebaff23e8f7a`
and its three FAIL reviews remain immutable and non-transferable. ACT-03/04/05,
VOC-085-HOLD-00, VOC-080-HOLD-01, VOC-080-HOLD-02, and every external action remain
held; fresh exact-SHA checks/reviews and non-author merge remain required for PR #168.
