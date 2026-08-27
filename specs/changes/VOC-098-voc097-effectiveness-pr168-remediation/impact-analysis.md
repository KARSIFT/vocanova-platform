# VOC-098 — Impact Analysis

## Scope and impact

This is an R4 repository governance/delivery-policy correction. It neither changes
nor reads a live Cloudflare or GitHub secret/settings state. It makes completed
VOC-097 repository authority truthful and repairs four blockers in the already
authorized PR #168 implementation surfaces.

| Area                        | Effect and boundary                                                         |
| --------------------------- | --------------------------------------------------------------------------- |
| VOC-097 lifecycle           | Reconciles all nine package surfaces to exact completed PR #167 facts.      |
| Workflow expiry             | Makes deadline enforcement atomic with the first secret-bearing step.       |
| Public GitHub client        | Enforces distinct connect and whole-response deadlines.                     |
| Strict JSON/JCS             | Rejects invalid lone surrogates without changing valid JCS mappings.        |
| VOC-094/VOC-096 text tests  | Removes stale operative count claims and closes a false-positive test.      |
| PR #168                     | Resumes the same branch/PR; rejected SHA and FAIL history remain immutable. |
| Cloudflare/settings/secrets | No action; ACT-03/04/05 and VOC-085-HOLD-00 remain held.                    |
| Production/data/cost        | No effect; HOLD-01/HOLD-02, Free/$0, and Basic LB boundaries remain exact.  |

## Risks and mitigations

- `VOC-098-R00` — Lifecycle reconciliation could be mistaken for external authority.
  Mitigation: set effectiveness only for declared repository implementation and retain
  every external-action hold in all nine surfaces.
- `VOC-098-R01` — A non-atomic handoff could still permit an expired secret read.
  Mitigation: compare runner start to both integrity-bound deadlines inside the first
  secret-bearing step before referencing either secret, with exact boundary tests.
- `VOC-098-R02` — Timeout implementation could abort only headers or leave a body
  unbounded. Mitigation: separate connect timer plus one whole-response timer retained
  through bounded body consumption, tested with injected stalls.
- `VOC-098-R03` — Unicode validation could reject valid supplementary characters or
  miss object keys. Mitigation: recursive key/value validation with paired positives
  and lone-high/lone-low negatives.
- `VOC-098-R04` — Scope tests could preserve another false positive. Mitigation:
  enumerate the four known VOC-094 claims and scan both package trees for operative
  stale counts while distinguishing immutable history.
- `VOC-098-R05` — Existing work or review history could be overwritten. Mitigation:
  resume the same PR/worktree without reset/force-push and preserve every FAIL and ref.
- `VOC-098-R06` — A correction could weaken delivery/production gates. Mitigation:
  complete parity matrices, production-sentinel comparisons, three fresh specialist/
  R4 reviews, and non-author merge.

## Rollback impact

Before merge, stop while preserving PR #168. After merge, rollback is a separately
reviewed repository revert. A revert never mutates Cloudflare, D1, DNS, GitHub
environments/secrets, traffic, cost, production, or data and cannot transfer a failed
review or authorize a live action.
