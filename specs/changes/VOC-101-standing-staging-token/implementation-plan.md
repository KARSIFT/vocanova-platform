# VOC-101 — Implementation Plan

## Delivery shape

One task maps to one coherent implementation PR into `develop`.

## Steps

1. Update `.github/README.md`, `.github/workflows/ci.yml`, the two governance/settings
   documents, and the four operations documents in the exact `affected_areas` list.
2. Replace future staging-token lifecycle language with the standing,
   operator-revoked contract and mandatory revocation triggers.
3. Extend `cloudflare-delivery-policy.mjs` and its tests to validate the complete
   living-document contract, fail-closed unconfirmed-revocation response, and
   rejection of stale or contradictory claims.
4. Prove the exact account, two permissions, environment-only secret boundary,
   staging controls, and production holds remain unchanged.
5. Run governance validation, R4 classification, delivery/foundation tests,
   `pnpm validate`, and `git diff --check` as applicable.
6. Obtain fresh exact-SHA Cloudflare, security/governance, and independent R4 PASS
   evidence from distinct non-author actors, then use a separate non-author merge
   actor.

## Path boundary

Only the ten living files listed in `change.yaml` may change. Package files are plan
history and are not edited by implementation. Any newly discovered living surface is
a blocking inventory correction before implementation merge.
