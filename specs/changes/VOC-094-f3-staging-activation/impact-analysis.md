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
  D1 in the selected account. Mitigation: ACT-00 uses a distinct credential/session
  with read-only permissions and no writes; revoke it after inventory/residual decision
  and only then issue a separate short-lived Phase 1 write token. Fail closed if
  production exists without exact residual acceptance; apply command/name allowlists,
  short expiry, post-action readback, and specialist review.
- `VOC-094-R01` — Custom Domain bootstrap could collide with existing DNS, domain,
  route, or Worker ownership. Mitigation: exact DNS/Cloudflare domain collision
  readbacks; use `custom_domain: true`; stop on any existing CNAME or ownership
  mismatch; authorize only the two staging hostnames and no DNS write.
- `VOC-094-R02` — The first deployment has no real rollback UUIDs. Mitigation:
  locked `wrangler deploy` is a narrowly reviewed route-free first-creation exception
  for API then web because `versions upload` rejects nonexistent scripts. Resolve both
  baseline UUIDs before a separately reviewed `triggers deploy` attaches domains. A
  live rehearsal uses `versions upload` only after scripts exist and promotes a newer
  reviewed probe before rollback; baseline deployment alone is not rehearsal evidence.
- `VOC-094-R03` — Worker rollback leaves a migrated D1 schema/data state. Mitigation:
  forward-only expand-compatible migrations, compatibility checks against baseline
  and new Workers, and reviewed forward correction; no automatic Time Travel restore.
- `VOC-094-R04` — Free limits could fail staging or prompt unauthorized spend.
  Mitigation: verify Free plan and bundle/usage envelope, zero-cent gate, usage/CPU/D1
  monitoring, stop on limit pressure, and forbid plan/billing/add-on change.
- `VOC-094-R05` — Secrets or learner content leak to logs, comments, artifacts, or
  Ruflo. Mitigation: ACT-00 read-only auth and the separate Phase 1 write token stay
  outside both sanitized overlays; post-merge environment-scoped Phase 4 secrets use a
  third token; secret-name-only readbacks, redaction scans, synthetic data, disabled
  external features, a privacy field allowlist, and sanitized Ruflo context apply.
- `VOC-094-R10` — ACT-03 could be mistaken for broad GitHub settings authority.
  Mitigation: keep it held by `VOC-085-HOLD-00` until the exact operator/authority,
  pre-state, payload, rollback, immediate docs, post-state, and expiry contract passes;
  discharge only that environment/two-secret action and leave all other settings held.
- `VOC-094-R11` — Exact-SHA review without successful current checks could still send
  unchecked code/config to live staging. Mitigation: ACT-01/02 bind the clean SHA to
  successful applicable hosted and local checks and bind the manifest/overlay hashes
  to credential-free local/schema/dry runs plus exact review; any result or dependency/
  lock/workflow drift expires authority and revokes the token before mutation.
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
  decision, ACT-00 read-only credential no-write/scope/expiry/no-disclosure evidence,
  its revocation, exact-SHA hosted/local check binders, and no-premature-write proof.
- `VOC-094-EV-02` — exact Cloudflare resources/bindings/domains/D1/privacy/no-
  production readbacks.
- `VOC-094-EV-03` — route-free first-creation deploys, baseline UUIDs, route-bearing
  trigger attachment, migration/smoke, post-creation rollback probe, and forward-
  correction evidence.
- `VOC-094-EV-04` — post-merge GitHub environment/two-secret-name evidence, distinct
  third-token scope/expiry, scoped `VOC-085-HOLD-00` authority/pre/post/rollback/docs
  evidence, ordinary dispatch, exact promotions, smoke/soak, usage, and logs.
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
