# VOC-098 — Test Plan

## VOC-098-TEST-00 — Plan and implementation path shape

Verify this plan PR changes only its nine package files. For implementation, verify
the exact prior 38-path union plus nine VOC-097 files equals 47 authorized paths; the
fresh PR #168 diff has 46 paths because only the recorded web generated type is
byte-identical; and no 48th path exists. Evidence: `VOC-098-EV-00`.

## VOC-098-TEST-01 — Exact PR #167 lifecycle reconciliation

Across all nine VOC-097 surfaces, require the bookkeeping head/review, literal
eligible result, merge SHA, three post-merge runs, and lifecycle comment from D02.
Reject pending review/binder/merge/post-merge blockers, `authority_effective: false`,
draft task status, rewritten candidate/adoption history, or any external-action grant.
Evidence: `VOC-098-EV-01`.

## VOC-098-TEST-02 — Atomic first-secret deadline

Exercise workflow/policy fixtures where the credential-free verification succeeds but
the first-secret step begins before, exactly at, and after each ACT-04/token deadline.
Only strict-before-both passes. Prove the comparison occurs before the first secret
reference and that the non-secret deadline handoff is bound to the same live result.
Evidence: `VOC-098-EV-02`.

## VOC-098-TEST-03 — Connect and whole-response deadlines

With injected HTTP/fetch behavior, prove a connection stalled beyond 5 seconds aborts
before the 15-second deadline and a body stalled after headers aborts by 15 seconds.
Verify timer cleanup on success/failure, response-size enforcement, no retry, and no
live-to-fixture fallback. Evidence: `VOC-098-EV-03`.

## VOC-098-TEST-04 — Strict Unicode/JCS

Reject lone high and lone low surrogates in keys and values, including nested arrays/
objects. Accept valid surrogate pairs/supplementary code points and preserve all eight
two-runtime binder digests for the unchanged committed mappings. Evidence:
`VOC-098-EV-04`.

## VOC-098-TEST-05 — Scope text, existing gates, and rejected-SHA history

Require all four named VOC-094 operative claims to state 29-core/38-total; scan both
VOC-094 and VOC-096 for stale operative 27-path instructions; preserve explicitly
historical counts. Re-run prepared/legacy positives and every current runtime-binder,
resource, cost, secret, replay, expiry, production, and hold negative. Verify the three
FAIL comments remain bound only to rejected SHA `cde0f665...`. Evidence:
`VOC-098-EV-05`.

## VOC-098-TEST-06 — Full validation and exact review

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
applicable hosted checks; fresh separate Cloudflare, security/settings, and independent
R4 exact-SHA PASS reviews; genuine eligibility; non-author merge; post-merge/source-
head evidence; preserved worktrees/refs; and proof of no external action. Evidence:
`VOC-098-EV-06`.

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
