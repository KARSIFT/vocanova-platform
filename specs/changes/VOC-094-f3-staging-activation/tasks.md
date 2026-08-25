# VOC-094 — Tasks

## VOC-094-T00 — Activate and verify the bounded synthetic F3 staging outcome

- Requirements: `VOC-094-D00` through `VOC-094-D16`
- Acceptance criteria: `VOC-094-AC-00` through `VOC-094-AC-06`
- Tests: `VOC-094-TEST-00` through `VOC-094-TEST-06`
- Evidence: `VOC-094-EV-00` through `VOC-094-EV-06`
- Risk: R4
- Implementation pull-request mapping: PR1 main repository implementation plus PR2
  immediate post-ACT-03 documentation-only reconciliation, both into `develop`
- Status: planned-pending-adoption

After adoption and exact action authority, execute Phase 1 with a distinct ACT-00
read-only credential/session having no write permissions, then revoke it after the
account/zone/inventory and residual-permission decision. Only then issue a separate
Phase 1 write token for `ACT-01` D1/resource provisioning and `ACT-02`: from a clean
SHA, use reviewed route-free `wrangler deploy` first-creation API then web, resolve
baseline UUIDs, then reviewed route-bearing `wrangler triggers deploy` for domains,
readbacks, a post-creation versions-upload/deploy Worker-only rollback rehearsal,
evidence capture, and write-token/overlay cleanup.
Then execute Phase 2 external sanitized Ruflo verification/coordination.

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
