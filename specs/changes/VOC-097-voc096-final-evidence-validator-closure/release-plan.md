# VOC-097 — Release and Rollback Plan

## Repository-only delivery

VOC-097 has no deployment or external release. After adoption, it resumes the
preserved VOC-096 PR1 and expands only its reviewed repository scope. The resulting
single implementation PR targets `develop`, passes complete exact-revision checks and
specialist reviews, and is merged only by a non-author actor. A merge changes
repository history only.

VOC-094-ACT-03/04/05, VOC-085-HOLD-00, and all Cloudflare/GitHub credential and
dispatch actions remain separate. `VOC-080-HOLD-01` and `HOLD-02` remain held. No
Phase-4 token is requested or created during this correction.

## Rollback

Before merge, abandon only through a non-destructive governed correction while
preserving the worktree. After merge, use a separately reviewed revert PR if the
validator transition is wrong. Never restore the old behavior by weakening another
delivery gate. Repository rollback does not mutate Cloudflare, D1, DNS, GitHub
environments/secrets, traffic, production, or cost.

## Closure

Issue #166 closes only after the implementation revision passes the formerly failing
suite, full local/hosted validation, three independent exact-SHA reviews, normal
non-author merge, and post-merge evidence. Issue #164 remains open until the complete
VOC-096 correction/PR2 evidence is finished. Issue #158 remains open until all F3
criteria, staging dispatch/soak, and final Phase-4 token revocation are complete.

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
