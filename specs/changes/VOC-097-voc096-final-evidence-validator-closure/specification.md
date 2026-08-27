# VOC-097 — Specification

## Objective and baseline

Repair issue #166 without discarding or broadening the completed VOC-096 PR1 work.
At exact base `8b902830e25583b1dbb1190708c3b777a28ec635`, the legacy
`voc080-final-evidence-policy.mjs` rejects every manifest whose top-level and staging
states are not `held`. The adopted VOC-096 implementation requires both to become
`prepared` while remaining dispatch-ineligible through the complete closed runtime-
binder contract. The preserved builder worktree contains only the original reviewed
scope and has no implementation commit, push, or PR.

## Requirements

- `VOC-097-D00` — Treat issue #166 as a bug report only. Implementation begins only
  after this exact package is independently reviewed, adopted, and made effective
  through normal bookkeeping, eligibility, non-author merge, and post-merge checks.
- `VOC-097-D01` — Resume the same preserved VOC-096 PR1 branch/worktree. Do not reset,
  recreate, discard, or overwrite its uncommitted work. Preserve the dirty VOC-090
  worktree and every branch, worktree, and recovery ref.
- `VOC-097-D02` — Expand the VOC-096 PR1 core authorized path set from 27 to exactly
  29 by adding only the legacy final-evidence policy and its paired test. Reconcile
  all nine VOC-096 package files in the same implementation PR because each contains
  an operative 27-path scope/count claim. Reconcile the nine already-in-scope VOC-094
  surfaces consistently. The exact total authorized path set is 38; a 39th path or an
  omitted required reconciliation stops for new package review.
- `VOC-097-D03` — Preserve the legacy held-state transition evidence as immutable
  history. The final-evidence validator accepts the historical `held`/`held` delivery
  state, or the new `prepared`/`prepared` staging-only state, but rejects every other
  top-level/staging combination.
- `VOC-097-D04` — A `prepared` result is valid only when the complete current
  Cloudflare delivery-policy validator passes for the exact repository manifest,
  Wrangler configs, closed VOC-096 runtime-record contract, prepared tuple, schema
  bundle, all eight binders, exact resource/baseline/cost/privacy invariants, and
  dispatch-ineligible state. Reuse the repository-owned validator or an equivalently
  exact exported predicate; do not duplicate a partial allowlist that can drift.
- `VOC-097-D05` — Keep production delivery state exactly `held`; keep every production
  sentinel and `VOC-080-HOLD-01`/`VOC-080-HOLD-02` unchanged. The historical
  transition record's action holds remain historical held evidence. A prepared staging
  state does not rewrite that record or release a production/data hold.
- `VOC-097-D06` — Reject top-level or staging `authorized`, `active`, or any unknown
  state in committed repository validation. `prepared` is never standing dispatch
  authority; absence of the later live five-record binder keeps delivery ineligible.
- `VOC-097-D07` — Add deterministic positive coverage for the exact repository and
  legacy held fixture, and negatives for malformed/mismatched prepared state; missing
  runtime binder; prepared tuple, schema, manifest, or digest drift; production
  activation/sentinel drift; HOLD-01/HOLD-02 weakening; generic evidence URLs;
  self-asserted authority/envelope facts; and any path that makes prepared state
  dispatch-eligible without the live binder.
- `VOC-097-D08` — Preserve all VOC-096 fixed-point repairs, closed schemas, replay,
  expiry, URL/ID equality, two-runtime JCS, request-budget, exact-SHA, Free/$0,
  unchanged Basic Load Balancing, secret isolation, and rollback gates. Never weaken a
  current delivery gate merely to make final-evidence validation pass.
- `VOC-097-D09` — Run complete VOC-096 PR1 validation, including the formerly failing
  final-evidence suite, full workspace/foundation/delivery checks, locked Wrangler type
  checks and staging/production dry runs, governance/risk/diff checks, secret scans,
  and production-sentinel comparisons. Obtain separate exact-SHA Cloudflare,
  security/settings, and independent R4 PASS reviews before a non-author merge.
- `VOC-097-D10` — This package authorizes repository work only. It creates no
  Cloudflare/GitHub settings/secret/credential/dispatch/deployment/migration/traffic/
  cost/production/data/launch authority. VOC-094-ACT-03/04/05 and VOC-085-HOLD-00
  remain separately held.

## Exact scope

The authoritative 38-path inventory is in `change.yaml`. The 29-path core equals the
adopted VOC-096 PR1 list plus exactly the two omitted VOC-080 validator paths. The
nine additional paths are only the VOC-096 package reconciliation surfaces. A tracked
generated type may remain byte-identical after locked regeneration; its presence in
the authorized core still requires recorded regeneration/check evidence.

## Exclusions

No resource recreation, redeployment, migration, promotion, rollback, deletion,
Cloudflare API call, settings mutation, secret entry, token creation, workflow
dispatch, production change, paid capability, public launch, `main` promotion, or
branch/worktree/ref deletion is in scope.
