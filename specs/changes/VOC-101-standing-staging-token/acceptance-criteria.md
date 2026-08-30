# VOC-101 — Acceptance Criteria

## VOC-101-AC-00 — Exact adoption

- Requirements: `VOC-101-D00`, `VOC-101-D06`
- Task: `VOC-101-T00`

The exact plan candidate receives Cloudflare, security/governance, and independent R4
PASS reviews from distinct non-author actors, records accountable adoption, and
authorizes only the declared repository change.

## VOC-101-AC-01 — Standing least-privilege credential

- Requirements: `VOC-101-D01`, `VOC-101-D02`
- Task: `VOC-101-T00`

Every inventoried living surface agrees that the staging token is standing and valid
until revoked. Exact account, permissions, secret placement, redaction, and broader
permission prohibitions remain unchanged.

## VOC-101-AC-02 — Revocation and replacement

- Requirements: `VOC-101-D03`
- Task: `VOC-101-T00`

Living operations guidance names every mandatory revocation trigger and the safe
replacement order. It proves that trigger-driven revocation happens first and leaves
staging disabled, while voluntary replacement may preserve the prior credential only
when no trigger exists. Failed voluntary replacement restores and verifies the prior
credential before revoking the failed replacement; failed trigger-driven replacement
removes the failed replacement and leaves staging disabled. It creates no plan, PR,
or deployment coupling.

## VOC-101-AC-03 — Delivery and production boundaries remain closed

- Requirements: `VOC-101-D04`, `VOC-101-D05`
- Task: `VOC-101-T00`

Deterministic tests reject stale credential-lifecycle claims while all VOC-100
delivery, secret-isolation, staging-safety, cost, and production-hold tests pass.
Historical packages have zero diff.

## VOC-101-AC-04 — Coherent verified implementation

- Requirements: `VOC-101-D06`, `VOC-101-D07`
- Task: `VOC-101-T00`

One implementation PR updates exactly the approved living inventory, passes local
and hosted checks, receives exact-SHA Cloudflare, security/governance, and independent
R4 PASS evidence from distinct non-author actors, and is normally merged by a separate
non-author actor without any external action. No package is required for an ordinary
dispatch or credential action; later meaningful changes remain governed.
