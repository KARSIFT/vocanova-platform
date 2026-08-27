# VOC-094 — Acceptance Criteria

## VOC-096 operative transition

### VOC-097 validator closure

Adopted VOC-097 corrects only the repository validator/scope gap: PR1 has a 29-path
core plus nine VOC-096 reconciliation paths, 38 authorized paths total. The legacy
held snapshot remains valid; prepared staging passes only through the complete
VOC-096 delivery validator. Production, HOLD-01/HOLD-02, ACT-03/04/05, and every
external-action boundary remain unchanged.

Phase 1 and Phase 2 are complete canonical evidence, not pending acceptance work.
Phase 1 binds activation revision `0d5ccc1231edb0e652d5c883cb214b85bcc9635e`,
seven schema-only migrations, zero application rows, 100% traffic on API/web rollback
baselines, 0% on all three probes, active staging Custom Domains, Free Workers/D1, and
exactly $0 incremental cost. VOC-096 makes the remaining acceptance path: exact
27-file PR1 with a prepared/ineligible runtime binder; ACT-03; exact five-file PR2;
then a five-record, digest-bound, one-use, maximum-30-minute ACT-04 binder evaluated
twice without credentials. These corrections supersede contradictory pending/static
future-value clauses below; historical adoption and action evidence remain preserved.

AM-01 repository bookkeeping is complete and effective: exact final revision
`aad884a6d53c5e0f13b94f8042774b14a07015af`, independent/specialist PASS evidence,
Governance `eligible: true` with `reasons: []`, normal PR #160 merge
`75e5c9909fe105a9af3e6e8a3600fec27fcbd593`, and successful post-merge checks are
bound in `change.yaml`. The results below remain pending for the F3 staging outcome,
not for AM-01 adoption. External actions remain independently held.

## VOC-094-AC-00 — Package, review, and authority remain exact and separated

- Requirements: `VOC-094-D00`, `D15`, `D16`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-00`, `TEST-06`
- Evidence: `VOC-094-EV-00`, `EV-06`
- Result: Phase-1 portion complete; Phase-3/4 evidence pending

One adopted package, one task, and two implementation PRs show exact-SHA builder,
specialist, independent-reviewer, merge-actor, and action-operator separation with no
unresolved blocker. PR1 is the main repository implementation; PR2 is the immediate
post-ACT-03 documentation-only reconciliation. `automatic_merge_allowed: true`
performs no merge. Plan, PR1, and PR2 source-head lifecycle evidence is complete, while every existing
worktree/recovery ref remains preserved and no manual branch/worktree deletion occurs.

## VOC-094-AC-01 — Phase 1 account, zone, permissions, and Free plan fail closed

- Requirements: `VOC-094-D02`, `D04`, `D05`, `D06`, `D07`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-01`
- Evidence: `VOC-094-EV-01`
- Result: complete — canonical Phase-1 closure on issue #158

Readback binds account `0a9eda28b96d77c24dcde74f3e074d47`, Active Free Website zone
`vocanova.site` (`63286d93b5f32925ac7366b4e97908be`), its three existing Workers, and
the inventory-time absence of D1/Workers Custom Domain/Workers route/selected DNS
record/staging collision. ACT-01 subsequently created only D1 `vocanova-staging` UUID
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556`; ACT-02 subsequently applied seven reviewed
schema-only migrations while preserving zero application rows. The
unrelated existing USD 5/month Basic Load Balancing subscription is preserved unchanged
and excluded from VocaNova attribution. Workers Free and D1 Free with USD 0 incremental
VocaNova staging cost are verified; any paid Workers/D1 feature, add-on, upgrade,
overage, billing change, or paid provider blocks action. ACT-01's time-bounded
residual-scope acceptance protected the existing Workers and allowed only its exact
D1 action; it grants no continuing authority. No further mutation is possible until
a fresh exact action record passes.
A clean exact reviewed repository SHA has successful applicable hosted CI, Governance,
Quality, and Security and local validation/credential-free dry runs; failed,
unchecked, stale, or drifted evidence blocks writes.
A distinct ACT-00 local/interactive short-lived read-only credential/session had no
write permissions, is never disclosed or stored in an overlay, and is revoked/expired
after inventory and the residual-scope decision. Only then was a separate Phase 1 write
token issued; its existence cannot substitute for fresh ACT-02 authority. No GitHub
environment or secret exists yet because of this package.

## VOC-094-AC-02 — Exact staging resources and privacy controls read back correctly

- Requirements: `VOC-094-D01`, `D03`, `D11`, `D13`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-02`
- Evidence: `VOC-094-EV-02`
- Result: complete — canonical Phase-1 closure on issue #158

Cloudflare readbacks prove only the two named staging Workers, `vocanova-staging` with
a real UUID, requested `eeur` location hint, no jurisdiction, and recorded actual
placement/served region, plus service binding `API` and Custom Domains
`api-stag.vocanova.site` and `stag.vocanova.site` configured with
`custom_domain: true`. A documented actual placement different from the requested
hint does not fail acceptance. Synthetic-only and feature-disable config plus privacy-
safe observability pass. Production sentinels/resources, reserved names, `HOLD-01`,
and `HOLD-02` remain unchanged.

## VOC-094-AC-03 — A real reviewed rollback baseline precedes ordinary delivery

- Requirements: `VOC-094-D08`, `D10`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-03`
- Evidence: `VOC-094-EV-03`
- Result: complete — canonical Phase-1 closure on issue #158

Separate Phase 1 action evidence binds a clean exact reviewed repository SHA and the
hash of a sanitized untracked disposable external Wrangler overlay containing only
reviewed non-secret real bindings/vars. The resource manifest and both overlay hashes
pass exact review and credential-free local/schema/dry-run checks. After migrations, a hashed/reviewed route-free
overlay uses locked `wrangler deploy` as the narrow first-creation exception for API,
then web bound to the existing API, and resolves both baseline UUIDs; `versions upload`
is not used while either script is nonexistent. Only then does a separately hashed/
reviewed route-bearing overlay use locked `wrangler triggers deploy` to attach the two
domains and read back ownership/certificates/DNS before smoke. No public route exists
earlier. A claimed rollback rehearsal uses `versions upload` only after scripts exist,
promotes a newer reviewed probe/candidate with exact `versions deploy`, then returns
both Workers to baseline and proves unchanged D1. The overlays and Phase 1 write token
are removed only after evidence capture.

## VOC-094-AC-04 — One exact ordinary staging dispatch and soak succeed

- Requirements: `VOC-094-D09`, `D10`, `D11`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-04`
- Evidence: `VOC-094-EV-04`
- Result: pending

PR1 merges while truthfully documenting `cloudflare-staging` as absent, held, and
planned. Only afterward ACT-03 creates/reconciles exactly that environment and the two
named secrets backed by a third distinct Phase 4 short-lived token, with no disclosed
value, variable, or production mutation. Its exact `VOC-085-HOLD-00` record contains
operator/authority, pre-state, payload, rollback, post-state, expiry, and the immediate
PR2 documentation-only reconciliation from current `develop`. PR2 records exact
sanitized pre-state/payload/rollback/post-state and secret names only, passes exact
checks/review, and is non-author merged and read back. ACT-03 completes only then,
discharges only this scoped action, and leaves every other settings action held. If
ACT-03/ACT-04 authority or the token expires while PR2 is open, work stops until a
fresh exact authority/settings record exists; no token is silently reissued. One
manual staging-only dispatch on the exact independently reviewed PR2 merged `develop` SHA
passes authority/expiry/zero-cost/baseline gates, ordered migrations, immutable
uploads, unique UUID resolution, 100% promotion, API/config/contract/web smoke,
resource/version/domain readback, and bounded soak. Logs contain no prohibited data;
the run and any failure history remain immutable evidence.

## VOC-094-AC-05 — Ruflo, cleanup, docs, and final state stay bounded

- Requirements: `VOC-094-D12`, `D14`, `D16`
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-05`, `TEST-06`
- Evidence: `VOC-094-EV-05`, `EV-06`
- Result: pending

After Phase 1, pinned Ruflo is reverified externally in Phase 2 using sanitized
context, performs no privileged action, and leaves no disposable process/state. Phase
3 binds real readbacks in reviewed/merged PR1 while recording settings as absent/
held/planned; Phase 4 ACT-03 is followed immediately by reviewed/merged docs-only PR2.
The ACT-00 read-only
credential, Phase 1 write token, and distinct Phase 4 token are expired/revoked in
their own windows; successful staging resources remain unless separately
authorized cleanup applies; failed partial resources are handled only by exact-ID
cleanup authority. All living delivery/settings/governance documents match the
observed staging state and preserve production exclusions.

## VOC-094-AC-06 — Validation and exact post-merge evidence close the outcome

- Requirements: all
- Task: `VOC-094-T00`
- Tests: `VOC-094-TEST-06`
- Evidence: `VOC-094-EV-06`
- Result: pending

All declared local/hosted checks, exact-SHA specialist and independent verdicts,
non-author merges, both implementation source-head readback/recreation records,
independent review of the exact PR2 merged `develop` SHA, external action records,
successful dispatch, and final Cloudflare/
GitHub/no-production readbacks are attached before issue #158 closes.
