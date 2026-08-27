# VOC-096 — Repair the VOC-094 dispatch-binder transition

Status: draft, pending independent plan review and adoption.

Issue [#164](https://github.com/KARSIFT/vocanova-platform/issues/164) records a
blocking governance bug in adopted VOC-094. PR1 must be dispatch-ineligible, ACT-03
must happen after PR1, PR2 must remain documentation-only, and the exact merged PR2
SHA must be the sole dispatch revision. The current executable gate nevertheless
requires the future ACT-04 evidence URL and expiry to be committed in that same SHA.
No permitted step can create those values without either preclaiming future evidence,
making PR2 executable, or weakening the fail-closed gate.

This package supplies the missing state transition without changing VOC-094's two-PR
shape:

1. PR1 commits real staging resources and baselines plus a **prepared**, never
   standing-authorized, runtime-binder contract.
2. ACT-03 occurs only after PR1. PR2 changes exactly the five declared settings
   documents and remains incapable of changing delivery eligibility.
3. After PR2 merges and its exact merge SHA is independently reviewed, the accountable
   actor publishes one strict ACT-04 authority record on canonical issue #158. A
   different non-author reviewer then publishes a strict binder-review record.
4. The credential-free delivery gate retrieves those exact records and GitHub PR/run
   metadata, verifies their bodies, hashes, actors, order, PR2 merge/file boundary,
   exact dispatch SHA/ref, manifest/workflow/policy hashes, staging resources and
   baselines, zero-cost/Free-plan state, production holds, expiry, and one-use nonce.
   Missing, edited, stale, replayed, unreachable, or mismatched evidence blocks before
   an environment job or Cloudflare secret is reached.

The plan PR adds exactly the nine files in this directory. It edits no adopted
VOC-094 file, executable surface, configuration, or living documentation. It
authorizes no Cloudflare mutation, GitHub setting/secret change, workflow dispatch,
deployment, production action, credential creation, or secret disclosure.

`automatic_merge_allowed: true` has been explicitly examined. It is read-only package
metadata; no workflow merges this or a later PR.
