# VOC-094 — Impact Analysis

## Impact summary

| Area                    | Effect and boundary                                                                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public staging          | Creates two Worker Custom Domains and exposes synthetic staging health/web behavior.                                                                                                                        |
| Cloudflare account      | ACT-01 created only the empty VocaNova staging D1; fresh ACT-02 may create/update only two VocaNova Workers and use that D1. Account-wide write scope requires exact protection of three unrelated Workers. |
| GitHub settings/secrets | After PR1, ACT-03 creates only `cloudflare-staging`; immediate PR2 records sanitized settings truth and two secret names without values.                                                                    |
| CI/CD                   | Changes the held staging manifest/policy/workflow to a time-bounded authorized staging path; production remains fail closed.                                                                                |
| Data/privacy            | Remote D1 has synthetic/non-personal data only; no production import or learner content logging.                                                                                                            |
| Cost                    | Workers Free and D1 Free only, integer ceiling 0 cents for every incremental VocaNova staging action; the unrelated existing USD 5/month Basic Load Balancing subscription is preserved and not attributed. |
| Production              | No effect. Reserved domains, Workers, D1, environments, secrets, traffic, migrations, data, `main`, `HOLD-01`, and `HOLD-02` remain untouched.                                                              |
| Product/accessibility   | No new product behavior. Existing representative web smoke covers rendered HTML; no accessibility scope change.                                                                                             |
| Ruflo                   | External sanitized coordination provenance only; no tracked integration or authority.                                                                                                                       |
| Repository refs         | Only normal PR history; GitHub may auto-delete merged short-lived heads, with exact recovery evidence.                                                                                                      |

AM-01 bookkeeping is complete and repository implementation authority is effective.
Issue #161 preserves the sequencing incident: D1 `vocanova-staging` UUID
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556` exists with zero tables, no user data or
migrations, and zero incremental cost; ACT-02 stopped before every Worker/domain/DNS/
traffic/deployment action. This correction creates no external authority.

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
  Mitigation: verify Workers Free and D1 Free plus the incremental bundle/usage
  envelope, zero-cent gate, usage/CPU/D1 monitoring, stop on limit pressure/payment
  prompt, and forbid any paid Workers/D1/add-on/upgrade/overage/billing change. The
  existing unrelated Basic Load Balancing subscription is neither modified nor used to
  satisfy this gate.
- `VOC-094-R13` — The known three unrelated account Workers could be reached by a
  selected-account write token. Mitigation: ACT-01's separately attributable
  residual-scope acceptance named and protected them for only the exact D1 action; it
  does not carry forward. Fresh ACT-02 authority must again deny commands targeting or
  mutating them and permit only exact VocaNova resources; any drift stops the action.
- `VOC-094-R05` — Secrets or learner content leak to logs, comments, artifacts, or
  Ruflo. Mitigation: ACT-00 read-only auth and the separate Phase 1 write token stay
  outside both sanitized overlays; post-merge environment-scoped Phase 4 secrets use a
  third token; secret-name-only readbacks, redaction scans, synthetic data, disabled
  external features, a privacy field allowlist, and sanitized Ruflo context apply.
- `VOC-094-R10` — ACT-03 could be mistaken for broad GitHub settings authority.
  Mitigation: keep it held by `VOC-085-HOLD-00` until the exact operator/authority,
  pre-state, payload, rollback, post-state, expiry, and immediate PR2 contract passes;
  complete only after PR2 merge/readback, discharge only that environment/two-secret
  action, and leave all other settings held.
- `VOC-094-R12` — PR1 could falsely preclaim settings post-state, or ACT-03 could leave
  settings and living documentation inconsistent. Mitigation: PR1 records the
  environment absent/held/planned; ACT-03 occurs only after PR1; dispatch stays held
  while immediate docs-only PR2 records exact sanitized pre-state/payload/rollback/
  post-state and secret names, passes fresh checks/review/non-author merge, and supplies
  the exact independently reviewed dispatch SHA. If ACT-03/ACT-04 authority or the
  Phase 4 token expires during PR2, stop and require a fresh exact settings record with
  no silent reissue. The hard
  truth boundary justifies an extra branch/PR, hosted/local checks, exact reviews,
  merge/source-head evidence, elapsed time, coordination, context, and bookkeeping.
- `VOC-094-R11` — Exact-SHA review without successful current checks could still send
  unchecked code/config to live staging. Mitigation: each new ACT-02 write binds the clean corrected SHA to
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

- `VOC-094-DEP-00` — adopted exact plan and effective AM-01 repository implementation
  authority, bound to final candidate `aad884a6`, eligible run `32913984893`, merge
  `75e5c990`, and successful post-merge checks.
- `VOC-094-DEP-01` — completed read-only account/zone/plan/inventory/collision facts,
  revoked credential, completed ACT-01 residual-scope decision, and no continuing
  authority for ACT-02.
- `VOC-094-DEP-02` — preserved real D1 UUID; baseline API/web version UUIDs remain
  pending fresh ACT-02.
- `VOC-094-EV-00` — package shape, adoption, roles, exact-SHA reviews, both
  implementation merges/source-head evidence, and the PR1 → ACT-03 → PR2 boundary.
- `VOC-094-EV-01` — Phase 1 account/zone/plan/permission inventory, residual-scope
  decision, ACT-00 read-only credential no-write/scope/expiry/no-disclosure evidence,
  its revocation, exact-SHA hosted/local check binders, and no-premature-write proof.
- `VOC-094-EV-02` — exact Cloudflare resources/bindings/domains/D1/privacy/no-
  production readbacks.
- `VOC-094-EV-03` — route-free first-creation deploys, baseline UUIDs, route-bearing
  trigger attachment, migration/smoke, post-creation rollback probe, and forward-
  correction evidence.
- `VOC-094-EV-04` — post-PR1 GitHub environment/two-secret-name evidence, distinct
  third-token scope/expiry, scoped `VOC-085-HOLD-00` authority/pre/post/rollback,
  reviewed/merged PR2 reconciliation, exact PR2-merge dispatch SHA, ordinary dispatch,
  exact promotions, smoke/soak, usage, and logs.
- `VOC-094-EV-05` — Phase 1 overlay/credential cleanup, Phase 2 Ruflo verification/
  removal, Phase 4 token expiry/revocation, partial-state cleanup, and living-doc
  reconciliation.
- `VOC-094-EV-06` — local/hosted validation, independent reviews, both merges and
  source-head lifecycles, exact PR2 post-merge review, final external readbacks, and
  closure.

## Rollback impact

Before promotion, failure leaves traffic unchanged and partial resources are handled
only under the exact cleanup authority. After a newer version is promoted, roll both
Workers back to the real baseline UUIDs and verify 100% traffic, Custom Domains, and
smoke; baseline establishment alone does not prove rollback. Do not roll back D1; use
the reviewed forward correction. A repository regression uses a normal reviewed revert PR
to `develop`; no force push/reset is permitted. GitHub environment or staging-resource
removal is a new exact external action, not an implicit repository revert.
