# VOC-073 — Release Plan

## Release and deployment authorization

A merged plan PR for this package does not authorize production deployment.
Implementation authority begins only after adoption (`implementation.authorized: true`)
and applies per task PR, not to this draft.

Once all four tasks close, the repository's standing auto-release path
(`karsift-ai-infra` `release.yml` with `auto_release_enabled: "true"`) may promote
`develop` → `main` and trigger `deploy-production.yml` without a separate founder
approval comment, provided CI and independent review passed on every task PR.

## Preconditions, monitoring, and outcome

| Gate | Requirement |
| ---- | ----------- |
| Adoption | Package `status: adopted`; open questions resolved or waived |
| Implementation | All four task issues closed with merged PRs |
| CI | `accessibility` workflow green on final `develop` tip |
| Independent verification | PASS (or PASS WITH NON-BLOCKING FINDINGS + valid waivers) on each task SHA |
| Risk | Declared R2; path floor R3 respected for auth/magic edits |

Monitoring after release:

- `accessibility` workflow pass/fail trend on subsequent PRs touching `apps/web`.
- Optional: spot-check `/signin`, `/`, `/auth/magic`, `/settings/account` with keyboard
  navigation or a screen reader — not a blocking gate; automation is the acceptance bar.

Outcome owner: unassigned until adoption.

Exact revision: record the `main` SHA after auto-promotion succeeds.

## Rollback

| Item | Detail |
| ---- | ------ |
| Trigger | New critical/serious axe failures in CI; or production a11y regression on the four routes |
| Mechanism | Revert the task PR(s) that introduced the regression |
| Owner | Unassigned until incident |
| Validation | `CI=1 pnpm --filter @vocanova/web test:e2e` green on revert revision |
| Last-known-good | `main` SHA before first VOC-073 task merge |

No migration rollback. No feature-flag toggle exists for accessibility specs — revert
is the recovery path.

## Independent verification, human approvals, and closure

Closure evidence (package roster complete):

1. All task issues (`VOC-073-T00` … `VOC-073-T03`) closed.
2. `apps/web/tests/e2e/` contains four new dedicated spec files; README matrix updated.
3. `accessibility` CI green on `develop` tip.
4. Independent verifier reports bound to exact SHAs per CLAUDE.md.
5. Auto-promotion PR (if triggered) merges; release-approval issue self-closes per
   standing auto-release configuration.

Approvals still required at drafting time:

- **Adoption** — founder/steward review of this draft package (not yet granted).
- **Routine R2** — no standing founder approval merely for risk class under A-003.
- **R4 / EHR** — not anticipated.
- **Path-floor R3** — if auth/magic fixes are substantive, independent verifier
  confirms they remain a11y-only; no separate steward gate solely for R3 under A-003.

Do not conflate: plan PR merge ≠ adoption; task PR merge ≠ package closure;
`develop` merge ≠ production outcome until auto-release completes.
