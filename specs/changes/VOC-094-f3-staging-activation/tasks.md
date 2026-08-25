# VOC-094 — Tasks

## VOC-094-T00 — Activate and verify the bounded synthetic F3 staging outcome

- Requirements: `VOC-094-D00` through `VOC-094-D16`
- Acceptance criteria: `VOC-094-AC-00` through `VOC-094-AC-06`
- Tests: `VOC-094-TEST-00` through `VOC-094-TEST-06`
- Evidence: `VOC-094-EV-00` through `VOC-094-EV-06`
- Risk: R4
- Implementation pull-request mapping: one future implementation PR into `develop`
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

Only in Phase 3 does a different builder use one isolated short-lived implementation
worktree/PR to bind the real IDs/routes/baseline into the staging manifest, Wrangler
configuration, delivery workflow/policy/tests, and every affected living document.
After exact reviews and non-author merge, Phase 4 performs `ACT-03` under the exact
scoped `VOC-085-HOLD-00` GitHub environment/third-token/two-secret settings authority,
leaving all other settings held, then exact merged-`develop` review, `ACT-04` ordinary
dispatch/soak, and `ACT-05` bounded token/partial-failure cleanup.

The task is not complete at repository merge. It completes only after the exact merged
`develop` revision is independently reviewed, one manual staging delivery succeeds,
all final Cloudflare/GitHub/DNS/privacy/cost/production/ref readbacks pass, and closure
evidence is attached. It must not touch `main`, production, `HOLD-01`, `HOLD-02`,
production data, reserved production domains, paid plans, unrelated account resources,
or existing worktrees/recovery refs.
