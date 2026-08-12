# VOC-073 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package is adopted (`status: adopted`,
`implementation.authorized: true`) and each task is dispatched through the normal
implement.yml loop.

Protected / elevated paths:

- `apps/web/src/app/auth/magic/**` — path floor **R3** if T02 edits components.
  Changes must be accessibility-only.
- `apps/web/src/app/(app)/settings/account/**` — authenticated app route; mock API
  fixture already supports `/api/v1/me` for auth gate.
- `axe-helper.ts` — do not change WCAG tag set or impact filter without separate
  approval.
- Governance docs, workflows, migrations, infra — out of scope.

Active authority: A-003. Routine R2 does not require standing technical-steward
approval merely for risk class. Independent verification required per task PR.

## File reconciliation and implementation sequence

| Target | Current state (drafting time) | Action |
| ------ | ----------------------------- | ------ |
| `signin-accessibility.spec.ts` | Does not exist | Create (T00) |
| `landing-accessibility.spec.ts` | Does not exist | Create (T01) |
| `auth-magic-accessibility.spec.ts` | Does not exist | Create (T02) |
| `settings-account-accessibility.spec.ts` | Does not exist | Create by extraction (T03) |
| `settings-accessibility.spec.ts` | Contains `/settings` + `/settings/account` tests | Remove account test if DEP-00 adopted (T03) |
| `apps/web/tests/e2e/README.md` | Matrix omits three routes; account bundled under settings | Update (T03) |
| `apps/web/src/app/signin/**` | Unscanned | Fix only if T00 finds violations |
| `apps/web/src/app/page.tsx` | Placeholder | Fix only if T01 finds violations |
| `apps/web/src/app/auth/magic/**` | Unscanned | Fix only if T02 finds violations |
| `apps/web/src/app/(app)/settings/account/**` | Already passes embedded test | Fix only if T03 finds new violations |

Ordered task sequence: `T00 → T01 → T02 → T03` (parallel dispatch allowed after
adoption).

Implementation pattern per task:

1. Add or extract the spec file following an existing T07b spec as template
   (`onboarding-accessibility.spec.ts` for public routes;
   `settings-accessibility.spec.ts` for authenticated routes).
2. Build production bundle; run the spec locally.
3. Fix real axe/keyboard/non-color failures on the target page only.
4. Open PR with task ID, acceptance-criteria references, and `test:e2e` output.

Reversibility: revert the task PR to remove the spec and any page fixes. No migration
rollback required.

## Validation and independent verification

Per task:

```bash
bash scripts/governance/classify-change-risk.sh --files-from <(git diff --name-only <base>...<head>)
git diff --check
pnpm run build:packages
pnpm --filter @vocanova/web build
CI=1 pnpm --filter @vocanova/web exec playwright test <task-spec-file>.spec.ts
```

After all tasks merge:

```bash
CI=1 pnpm --filter @vocanova/web test:e2e
```

Independent verifier (CLAUDE.md):

1. Read adopted specification, acceptance criteria, declared risk, path floor, and diff.
2. Confirm scope traceability from issue #536 through tests.
3. Run or inspect CI `accessibility` workflow on the exact reviewed SHA.
4. Re-run path classifier; raise risk if fixes exceed a11y remediation.
5. Report `PASS`, `PASS WITH NON-BLOCKING FINDINGS`, or `FAIL` with file/line evidence.

Codex/implementer must not approve or merge its own work.

## Deployment and rollback

Authorization: task PRs merge into `develop` through normal merge-gate + independent
review. Auto-release to `main` and auto-deploy follow the standing 2026-08-08
delegation once the full task roster closes — this package does not add a separate
deploy step.

Rollback trigger: new accessibility regressions or user-reported a11y breakage on
the four routes after release.

Rollback mechanism: revert the offending task PR(s) on `develop` (or hotfix revert on
`main` per incident response). No data rollback.

Owner: unassigned until task dispatch.

Last-known-good reference: commit on `main` immediately before the first VOC-073 task
PR merges.
