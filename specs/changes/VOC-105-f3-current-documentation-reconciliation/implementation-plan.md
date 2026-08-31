# VOC-105 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this package is independently reviewed, adopted, and present on
`develop`. Use one isolated short-lived branch/worktree, one task, and one coherent
implementation PR into `develop`. No settings, secret, Cloudflare, dispatch,
deployment, data, DNS, spending, or launch action is authorized.

## Exact file reconciliation

| Path                                                              | Classification               | Planned reconciliation                                                                                                                                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/README.md`                                                  | present-needs-reconciliation | Point active F3 status to the VOC-105 record; preserve F2, A1+, production, and hold boundaries.                                                                   |
| `docs/product/README.md`                                          | present-needs-reconciliation | Replace stale unresolved F3 sentence with evidence-bound complete-effective wording and A1+ exclusions.                                                            |
| `docs/product/12-mvp-implementation-plan.md`                      | present-needs-reconciliation | Update active amendment, roadmap status paragraph, and dependency language; keep DOC-12 gate unchanged and explicitly distinguish delivery run from gate evidence. |
| `docs/operations/README.md`                                       | present-needs-reconciliation | Add active VOC-105 F3 record and mark F3 complete-effective while retaining held production.                                                                       |
| `docs/operations/voc-081-f2-evidence.md`                          | present-needs-reconciliation | Preserve F2 scope and historical no-live evidence while linking current F3 status to VOC-105.                                                                      |
| `docs/operations/voc-081-f2-evidence.json`                        | present-needs-reconciliation | Reconcile only the current milestone-state pointer; retain immutable F2 evidence and external-effects facts.                                                       |
| `docs/operations/cloudflare-delivery.md`                          | present-needs-reconciliation | Append sanitized successful delivery outcome (SHA/run/attempt and step statuses) and link VOC-105; preserve settings snapshot, instructions, and holds.            |
| `docs/operations/voc-105-f3-evidence.md`                          | new                          | Add human-readable current F3 acceptance boundary, exact evidence chain, delivery event, exclusions, and historical notes.                                         |
| `docs/operations/voc-105-f3-evidence.json`                        | new                          | Add machine-readable gate/evidence record with no secrets or immutable Worker IDs.                                                                                 |
| `scripts/foundation/voc105-f3-evidence-policy.mjs`                | new                          | Validate the record, evidence chain, redaction, active surfaces, and current/later-gate boundaries network-free.                                                   |
| `scripts/foundation/voc105-f3-evidence-policy.test.mjs`           | new                          | Add positive and one-invariant-at-a-time negative fixtures.                                                                                                        |
| `package.json`                                                    | present-needs-reconciliation | Add `ci:f3-evidence` and include exactly once in `ci:foundation`.                                                                                                  |
| `specs/changes/VOC-105-f3-current-documentation-reconciliation/*` | new                          | Record this plan only; no unrelated package changes.                                                                                                               |

VOC-094–VOC-104 packages, application/runtime code, manifests, workflows, generated
artifacts, settings records, and credentials are present-compatible or protected and
must remain unchanged.

## Ordered implementation

1. Freeze the exact allowed-path inventory from the adopted package and independently
   verify the immutable evidence links and public identifiers.
2. Author the structured F3 record with separate `milestone_gate` and
   `delivery_event` objects. Bind F2, Phase 1/2, settings, and run evidence; retain
   A1+, production, launch, data, and HOLD-01/02 exclusions.
3. Add the readable F3 record and reconcile the seven active documentation surfaces,
   labeling prior unresolved statements as historical where needed.
4. Implement the validator and fixtures. Require exact run/job/step statuses, resource/
   observability/rollback proof, settings proof, dependency chain, redaction, and
   prohibited-claim checks. Add one foundation command segment.
5. Run focused checks, foundation/workspace/governance checks, and diff/path audits.
   Revert-rehearse in a disposable worktree and compare the exact pre-change tree.
6. Obtain fresh exact-SHA documentation/milestone specialist and independent R4 review;
   resolve all findings with fresh checks, then use a separate non-author merge actor.

## Validation and review

The implementation builder must report exact file inventory, command outputs, and no-live
attestation. Reviewers receive completed evidence and do not duplicate long-running
suites without a concrete need. Any evidence contradiction stops implementation and
becomes a separate issue/package; it is never silently resolved in prose.

## Rollback

Before merge, close the PR for zero external effect. After merge, prepare a separately
reviewed revert PR restoring the exact pre-change files and `ci:foundation` chain.
Repository revert does not reverse migrations, delete resources, change settings, revoke
secrets, or roll back traffic.
