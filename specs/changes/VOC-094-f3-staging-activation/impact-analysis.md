# VOC-094 — Impact Analysis

## Impact summary

| Area                    | Effect and boundary                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Public staging          | Creates two Worker Custom Domains and exposes synthetic staging health/web behavior.                                                           |
| Cloudflare account      | Creates/updates two Workers and one D1; write permissions are account-wide within the selected account.                                        |
| GitHub settings/secrets | Creates only `cloudflare-staging`; records two secret names without values.                                                                    |
| CI/CD                   | Changes the held staging manifest/policy/workflow to a time-bounded authorized staging path; production remains fail closed.                   |
| Data/privacy            | Remote D1 has synthetic/non-personal data only; no production import or learner content logging.                                               |
| Cost                    | Workers Free only, integer ceiling 0 cents; no Paid activation, overage, or add-on authority.                                                  |
| Production              | No effect. Reserved domains, Workers, D1, environments, secrets, traffic, migrations, data, `main`, `HOLD-01`, and `HOLD-02` remain untouched. |
| Product/accessibility   | No new product behavior. Existing representative web smoke covers rendered HTML; no accessibility scope change.                                |
| Ruflo                   | External sanitized coordination provenance only; no tracked integration or authority.                                                          |
| Repository refs         | Only normal PR history; GitHub may auto-delete merged short-lived heads, with exact recovery evidence.                                         |

## Risks and mitigations

- `VOC-094-R00` — An account-scoped token can mutate unrelated/production Workers or
  D1 in the selected account. Mitigation: complete read-only inventory before token
  issuance; fail closed if production exists unless exact residual acceptance is
  recorded; command/name allowlists, short expiry, post-action readback, and specialist
  review.
- `VOC-094-R01` — Custom Domain bootstrap could collide with existing DNS, domain,
  route, or Worker ownership. Mitigation: exact DNS/Cloudflare domain collision
  readbacks; use `custom_domain: true`; stop on any existing CNAME or ownership
  mismatch; authorize only the two staging hostnames and no DNS write.
- `VOC-094-R02` — The first deployment has no real rollback UUIDs. Mitigation:
  separate reviewed clean-SHA/disposable-overlay API-first/web-second baseline action,
  smoke/readback and immutable UUID binder before Phase 3. A live rehearsal additionally
  promotes a newer reviewed probe/equivalent transition before rolling traffic back to
  baseline; baseline deployment alone is not rehearsal evidence.
- `VOC-094-R03` — Worker rollback leaves a migrated D1 schema/data state. Mitigation:
  forward-only expand-compatible migrations, compatibility checks against baseline
  and new Workers, and reviewed forward correction; no automatic Time Travel restore.
- `VOC-094-R04` — Free limits could fail staging or prompt unauthorized spend.
  Mitigation: verify Free plan and bundle/usage envelope, zero-cent gate, usage/CPU/D1
  monitoring, stop on limit pressure, and forbid plan/billing/add-on change.
- `VOC-094-R05` — Secrets or learner content leak to logs, comments, artifacts, or
  Ruflo. Mitigation: secure local/interactive Phase 1 auth outside the sanitized
  overlay, post-merge environment-scoped Phase 4 secrets, secret-name-only readbacks,
  redaction scans, synthetic data, disabled external features, privacy field allowlist,
  and sanitized disposable Ruflo context.
- `VOC-094-R06` — Staging activation accidentally releases production holds or edits
  reserved production names/config. Mitigation: production hash/sentinel readbacks and
  negative fixtures across manifest, Wrangler, workflow, policy, docs, Cloudflare,
  GitHub, and DNS.
- `VOC-094-R07` — A stale action record, manifest, baseline, account/zone, or SHA is
  reused. Mitigation: separate action IDs, exact binders, explicit expiries/drift
  conditions, one-dispatch scope, and fresh checks after any material change.
- `VOC-094-R08` — Cleanup deletes evidence or successful resources broadly.
  Mitigation: pre-authorized exact-ID cleanup only, reverse-order readbacks, synthetic-
  only proof before D1 deletion, successful staging preservation, and no inferred
  failure authority.
- `VOC-094-R09` — Automatic merged-head deletion is confused with manual cleanup.
  Mitigation: exact pre-merge tip, post-merge readback, recreate command, no manual or
  permanent ref/worktree deletion, and preservation inventory while PRs are open.

## Dependencies and evidence

- `VOC-094-DEP-00` — adopted exact plan and effective implementation authority.
- `VOC-094-DEP-01` — live read-only account/zone/plan/inventory/collision facts.
- `VOC-094-DEP-02` — real D1 and baseline version UUID binders.
- `VOC-094-EV-00` — package shape, adoption, roles, exact-SHA reviews, merge/source-
  head evidence.
- `VOC-094-EV-01` — Phase 1 account/zone/plan/permission inventory, residual-scope
  decision, local credential scope/expiry/no-disclosure, and no-premature-write proof.
- `VOC-094-EV-02` — exact Cloudflare resources/bindings/domains/D1/privacy/no-
  production readbacks.
- `VOC-094-EV-03` — migration, baseline UUID, smoke, rollback, and forward-correction
  rehearsal evidence.
- `VOC-094-EV-04` — post-merge GitHub environment/two-secret-name evidence, distinct
  Phase 4 token scope/expiry, ordinary dispatch, exact promotions, smoke/soak, usage,
  and logs.
- `VOC-094-EV-05` — Phase 1 overlay/credential cleanup, Phase 2 Ruflo verification/
  removal, Phase 4 token expiry/revocation, partial-state cleanup, and living-doc
  reconciliation.
- `VOC-094-EV-06` — local/hosted validation, independent reviews, merge, post-merge,
  final external readbacks, and closure.

## Rollback impact

Before promotion, failure leaves traffic unchanged and partial resources are handled
only under the exact cleanup authority. After a newer version is promoted, roll both
Workers back to the real baseline UUIDs and verify 100% traffic, Custom Domains, and
smoke; baseline establishment alone does not prove rollback. Do not roll back D1; use
the reviewed forward correction. A repository regression uses a normal reviewed revert PR
to `develop`; no force push/reset is permitted. GitHub environment or staging-resource
removal is a new exact external action, not an implicit repository revert.
