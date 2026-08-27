# VOC-097 — Test Plan

## VOC-097-TEST-00 — Package and exact path shape

Verify the plan PR changes only the nine VOC-097 package files. For implementation,
verify the original 27-path VOC-096 core plus exactly two omitted validator paths
equals 29; the nine VOC-096 reconciliation files produce exactly 38 authorized paths;
all nine VOC-094 surfaces remain in the core; and no 39th path exists. Record a
byte-identical generated-type result as validated/authorized, not as an invented diff.
Evidence: `VOC-097-EV-00`.

## VOC-097-TEST-01 — Held and prepared positive states

The immutable held-state fixture passes. The exact repository-positive prepared state
passes only with complete delivery-policy validation, exact Wrangler configs, closed
runtime contract, prepared tuple, all binders/digests, resources, baselines, privacy,
Free/$0, unchanged Basic Load Balancing, production holds, and dispatch-ineligible
result. Evidence: `VOC-097-EV-01`.

## VOC-097-TEST-02 — Prepared-state fail-closed matrix

Reject top/staging state mismatch; `authorized`, active, or unknown state; missing
prepared runtime binder; malformed body/envelope contract; tuple, shared-definition,
schema, manifest, workflow, policy, or digest drift; wrong resources/baselines/probes;
nonzero cost; paid plan; and prepared state made dispatch-eligible without the live
five-record binder. Evidence: `VOC-097-EV-02`.

## VOC-097-TEST-03 — Authority and production negatives

Reject a generic issue/PR URL where a dedicated canonical comment is required; a body
that self-asserts its own URL, digest, publisher, `created_at`, `updated_at`, or issuance
time; URL/ID mismatch; weakened publisher/actor separation; production state other
than held; any production sentinel drift; and release of `VOC-080-HOLD-01` or
`VOC-080-HOLD-02`. Evidence: `VOC-097-EV-03`.

## VOC-097-TEST-04 — Canonical text and history

Search all nine VOC-096 and nine VOC-094 package files. Reject a surviving operative
27-path claim, a path list lacking either validator, a count other than 29 core/38
total, deleted or reassigned historical review/adoption evidence, a reopened Phase 1
action, or newly claimed ACT-03/04/05 authority. Evidence: `VOC-097-EV-04`.

## VOC-097-TEST-05 — Full validation and independent review

Run, at minimum:

```bash
node --test scripts/foundation/voc080-final-evidence-policy.test.mjs
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
applicable hosted checks; separate exact-SHA Cloudflare, security/settings, and
independent R4 PASS; non-author merge; post-merge/source-head evidence; preserved
worktrees/refs; and proof of no external action. Evidence: `VOC-097-EV-05`.

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
