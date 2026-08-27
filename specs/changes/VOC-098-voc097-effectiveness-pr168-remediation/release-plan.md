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
