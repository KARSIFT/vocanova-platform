# VOC-101 — Test Plan

## VOC-101-TEST-00 — Adoption and delivery shape

- Covers: `VOC-101-AC-00`
- Procedure: run governance validation; inspect exact-candidate review and adoption
  bookkeeping, task mappings, path inventory, authority holds, and merge evidence.
- Expected: one task and one implementation PR; exact-SHA Cloudflare,
  security/governance, and independent R4 PASS evidence from distinct non-author
  actors; accountable adoption; no self-effectiveness; and every external action held.
- Evidence: `VOC-101-EV-00`

## VOC-101-TEST-01 — Standing least-privilege credential

- Covers: `VOC-101-AC-01`
- Procedure: scan every inventoried living file and run delivery-policy fixtures for
  the standing valid-until-revoked contract, exact account and permissions,
  environment-only secret names, broader-scope absence, and redaction. Constrain the
  scan to the Cloudflare staging token so unrelated application and session terms are
  unchanged.
- Expected: every living claim agrees; contradictory staging-token lifecycle language
  fails; account `0a9eda28b96d77c24dcde74f3e074d47`, exactly `Workers Scripts Edit`
  and `D1 Edit`, and environment-only placement remain invariant; no value is logged.
- Evidence: `VOC-101-EV-01`

## VOC-101-TEST-02 — Revocation, replacement, and failure containment

- Covers: `VOC-101-AC-02`
- Procedure: exercise fixtures for each mandatory trigger, voluntary replacement,
  failed voluntary replacement, failed trigger-driven replacement, and unconfirmed
  revocation. Assert operation order, environment-secret state, approval rejection,
  in-flight run cancellation, incident recording, inactive-token verification without
  logging, protected no-write checking, and staging-resumption conditions.
- Expected: mandatory triggers revoke first; only voluntary replacement with no
  trigger retains the prior credential; failure restores the verified prior credential
  only in that voluntary case; failed replacements are revoked and removed. Any
  unconfirmed revocation removes the environment API-token secret, stops staging,
  records an incident, and blocks resumption until the affected token is verified
  inactive and a valid credential passes the protected check.
- Evidence: `VOC-101-EV-02`

## VOC-101-TEST-03 — Preserved delivery and production boundaries

- Covers: `VOC-101-AC-03`
- Procedure: run the complete delivery-policy and foundation suites; compare the
  exact VOC-100 staging actor/event/SHA/attempt, approval-history-first secret
  isolation, resource, D1/Worker, synthetic-data, Free/$0, rollback, production-hold,
  and historical-package sentinels.
- Expected: all preserved controls pass, every broadened permission or action fails,
  all historical packages have zero diff, and plan/implementation perform no external
  action.
- Evidence: `VOC-101-EV-03`

## VOC-101-TEST-04 — Exact revision and anti-loop boundary

- Covers: `VOC-101-AC-04`
- Procedure: run applicable local and hosted checks, inventory the ten implementation
  paths, obtain exact-SHA Cloudflare, security/governance, and independent R4 reviews,
  and inspect D07 plus operations guidance.
- Expected: one coherent implementation PR passes all checks and distinct-actor
  reviews; a separate non-author actor can normally merge it. Ordinary dispatch,
  revocation, and replacement under the stable policy require neither package nor PR;
  later meaningful policy or behavior changes retain governed intake and adoption.
- Evidence: `VOC-101-EV-04`

## Commands

- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `git diff --check`

## Evidence definitions

- `VOC-101-EV-00`: exact plan reviews, accountable adoption, adopted bookkeeping,
  hosted checks, merge eligibility, and normal different-actor plan merge.
- `VOC-101-EV-01`: implementation diff and deterministic scan proving the standing
  least-privilege contract across all ten living files without secret disclosure.
- `VOC-101-EV-02`: positive and negative revocation/replacement fixtures, including
  failed and unconfirmed revocation containment and staging-resumption denial.
- `VOC-101-EV-03`: complete retained delivery/foundation results, production holds,
  external-action absence, and historical-package zero-diff proof.
- `VOC-101-EV-04`: exact implementation diff, local/hosted checks, specialist and
  independent R4 reviews, and normal different-actor merge evidence.

## External evidence boundary

Plan and repository implementation run no live settings, secret, Cloudflare, or
deployment check. A later separately authorized action records only sanitized
settings and credential status; no secret value enters evidence.
