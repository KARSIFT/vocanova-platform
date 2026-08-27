# VOC-094 — Tasks

## VOC-096 operative transition

### VOC-097 validator closure

Adopted VOC-097 corrects only the repository validator/scope gap: PR1 has a 29-path
core plus nine VOC-096 reconciliation paths, 38 authorized paths total. The legacy
held snapshot remains valid; prepared staging passes only through the complete
VOC-096 delivery validator. Production, HOLD-01/HOLD-02, ACT-03/04/05, and every
external-action boundary remain unchanged.

Phase 1 and Phase 2 are complete. Under adopted VOC-097, the remaining single-task
mapping uses the exact 29-path core / 38-authorized-path PR1 boundary
(prepared/ineligible binder), ACT-03, exact five-file PR2,
and ACT-04/05. ACT-04 uses five closed canonical records, exact raw-body digests, live
PR2/push/check proof, a one-use nonce, maximum 30-minute validity, and two
credential-free evaluations. This bounded amendment replaces the stale ACT-02-held
and static future-value clauses below without changing immutable completed history or
production holds.

## VOC-094-T00 — Activate and verify the bounded synthetic F3 staging outcome

- Requirements: `VOC-094-D00` through `VOC-094-D16` (as amended by `VOC-094-AM-01`)
- Acceptance criteria: `VOC-094-AC-00` through `VOC-094-AC-06`
- Tests: `VOC-094-TEST-00` through `VOC-094-TEST-06`
- Evidence: `VOC-094-EV-00` through `VOC-094-EV-06`
- Risk: R4
- Implementation pull-request mapping: PR1 main repository implementation plus PR2
  immediate post-ACT-03 documentation-only reconciliation, both into `develop`
- Status: adopted-AM-01-bookkeeping-effective-repository-implementation-authorized-external-actions-held

The AM-01 final bookkeeping revision, exact reviews, literal eligible decision, normal
PR #160 merge, and post-merge checks are complete. This activates repository
implementation authority only; it does not authorize an external action.

The ACT-00 inventory is complete and its read-only credential revoked: account
`0a9eda28b96d77c24dcde74f3e074d47`, Active Free Website zone `vocanova.site`, three
unrelated existing Workers, and—at inventory time—no D1/Custom Domains/routes/selected
DNS/staging collision. The separately attributable residual-scope acceptance protected
those Workers and preserved the unrelated USD 5/month Basic Load Balancing subscription.
ACT-01 then created only D1 `vocanova-staging` UUID
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556`, with zero tables, no user data or migrations,
and zero incremental cost. The sequencing incident is recorded in issue #161.

ACT-02 completed its reviewed route-free API-first/web-second baseline,
route-bearing domain triggers, version UUID readbacks, rollback rehearsal, evidence
capture, token closure, and overlay cleanup. Phase 2 then completed pinned external
Ruflo verification/sanitized coordination and independent closure.

Only in Phase 3 does a different builder use isolated main PR1 to bind the real IDs/
routes/baseline into the staging manifest, Wrangler configuration, delivery workflow/
policy/tests, and affected living documents. PR1 must say `cloudflare-staging` remains
absent, held, and planned through its exact reviews and non-author merge. Phase 4 then
performs `ACT-03` under exact scoped `VOC-085-HOLD-00` settings authority, leaving all
other settings held and dispatch still blocked. Immediately afterward, docs-only PR2
from current `develop`, under this same task/package, records the exact sanitized
pre-state/payload/rollback/post-state and secret names only. After its local/hosted
checks, different-actor exact review, non-author merge, source-head readback, and
independent review of its merged `develop` SHA, `ACT-04` may dispatch that exact SHA,
soak, and `ACT-05` may perform bounded token/partial-failure cleanup. If ACT-03/ACT-04
authority or the Phase 4 token expires during PR2, stop and require a fresh exact
authority/settings record; never silently reissue the token.

The task is not complete at either repository merge. It completes only after the exact
PR2 merged `develop` revision is independently reviewed, one manual staging delivery succeeds,
all final Cloudflare/GitHub/DNS/privacy/cost/production/ref readbacks pass, and closure
evidence is attached. It must not touch `main`, production, `HOLD-01`, `HOLD-02`,
production data, reserved production domains, paid plans, unrelated account resources,
or existing worktrees/recovery refs.
