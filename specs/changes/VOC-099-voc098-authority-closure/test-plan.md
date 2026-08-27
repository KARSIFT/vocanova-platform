# VOC-099 — Test Plan

## VOC-099-TEST-00 — Plan and implementation path shape

Verify this plan PR changes only its nine package files. For implementation, verify
the exact VOC-098 47-path union plus nine VOC-098 files equals 56 authorized paths;
the fresh PR #168 diff has 55 paths because only the recorded web generated type is
byte-identical; and no 57th path exists. Evidence: `VOC-099-EV-00`.

## VOC-099-TEST-01 — Non-recursive adoption contract

For the reviewed candidate, require draft/pending authority. For final pre-merge
bookkeeping, require the exact approved candidate and review/adoption evidence,
`status: adopted`, and `implementation.authorized: true`; reject
`authority_effective: false`, adopted-but-draft task/status text, future plan or
post-merge self-repair conditions, and any external-action grant. Evidence:
`VOC-099-EV-01`.

## VOC-099-TEST-02 — Exact PR #170 lifecycle reconciliation

Across all nine VOC-098 surfaces, require the bookkeeping head/review, literal
eligible result, merge SHA, three post-merge runs, and lifecycle comment from D02.
Reject pending review/binder/merge/post-merge blockers, false authority-effective
claims, draft task status, rewritten candidate/adoption history, or external-action
authority. Evidence: `VOC-099-EV-02`.

## VOC-099-TEST-03 — Retained VOC-098 corrections and gates

Re-run all VOC-098 tests for atomic secret-step expiry, distinct connect/whole-body
timeouts, strict Unicode/JCS, VOC-097 lifecycle reconciliation, VOC-094/VOC-096 scope
text, prepared/legacy composition, runtime binders, resources, cost, secrets, replay,
expiry, rollback, production, and holds. Verify the three FAIL comments bind only to
rejected SHA `cde0f665...`. Evidence: `VOC-099-EV-03`.

## VOC-099-TEST-04 — Full validation and exact review

Run, at minimum:

```bash
node --test scripts/foundation/cloudflare-delivery-policy.test.mjs scripts/foundation/voc080-final-evidence-policy.test.mjs
pnpm validate
pnpm run ci:foundation
pnpm run ci:delivery
pnpm run ci:local-stack
pnpm --dir apps/api-worker run types:check
pnpm --dir apps/web run cloudflare:typecheck
pnpm --filter @vocanova/api-worker run dry-run:staging
pnpm --filter @vocanova/api-worker run dry-run:production
pnpm --filter @vocanova/web run cloudflare:dry-run:staging
pnpm --filter @vocanova/web run cloudflare:dry-run:production
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base <fresh-origin-develop> --head HEAD
git diff --check <fresh-origin-develop> HEAD
```

Use committed scripts and `docs/development.md` for current exact commands. Require
applicable hosted checks and production-sentinel comparisons. Evidence:
`VOC-099-EV-04`.

## VOC-099-TEST-05 — Fresh actors and no external effect

Require fresh separate Cloudflare/Wrangler, security/settings, and independent R4
exact-SHA PASS reviews, genuine eligibility, non-author merge, post-merge/source-head
evidence, preserved worktrees/refs, and proof that no Cloudflare, settings, credential,
secret, dispatch, production, cost, data, or launch action occurred. Evidence:
`VOC-099-EV-05`.
