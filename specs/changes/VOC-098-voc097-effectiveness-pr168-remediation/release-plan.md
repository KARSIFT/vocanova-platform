# VOC-098 — Release and Rollback Plan

## Repository-only delivery

VOC-098 has no deployment or external release. After adoption/effectiveness, it
resumes the same open PR #168, adds the nine VOC-097 lifecycle surfaces, and resolves
the four already-authorized exact-review blockers. The fresh corrected head targets
`develop`, receives full checks and three fresh exact-SHA reviews, and is merged only
by a different non-author actor after genuine eligibility. Merge changes repository
history only.

Rejected SHA `cde0f665031a212b51a45af541a4ebaff23e8f7a` and FAIL comments
`5443876203`, `5443893558`, and `5443923705` remain immutable and grant nothing.
VOC-094-ACT-03/04/05, VOC-085-HOLD-00, and all Cloudflare/GitHub credential and
dispatch actions remain separate. No Phase-4 token is requested or created here.

## Rollback

Before merge, preserve the PR/worktree and issue a governed correction if needed.
After merge, use a separately reviewed repository revert if the correction is wrong.
Never restore old behavior by weakening another gate. Repository rollback cannot
change Cloudflare, D1, DNS, GitHub environments/secrets, traffic, production, cost, or
data and cannot authorize an external action.

## Closure

Issue #169 closes only after the fresh PR #168 head passes complete validation, all
three fresh reviews, normal non-author merge, and post-merge/source-head evidence.
Issues #164 and #166 close only when their complete implementation evidence is
satisfied. Issue #158 remains open until the full F3 dispatch/soak/cleanup and final
Phase-4 token revocation criteria are complete.

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
