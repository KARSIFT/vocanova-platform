# VOC-086 — Specification

## Objective and requirement source

Correct the active repository/local F2 status contradiction reported by issue #131.
The source of truth is the exact VOC-081/VOC-084 integration evidence, not inference
from code presence or chat.

## Requirements and decisions

- `VOC-086-D00`: Repository/local F2 is complete and effective from PR #108's normal
  merge and passing post-merge evidence.
- `VOC-086-D01`: Candidate-era statements remain identifiable historical evidence;
  active fields and summaries must not continue to call the satisfied gate pending.
- `VOC-086-D02`: Reconcile `docs/README.md`, `docs/operations/README.md`,
  `docs/operations/voc-081-f2-evidence.{md,json}`, `docs/product/README.md`, and
  `docs/product/12-mvp-implementation-plan.md` as one atomic truth change.
- `VOC-086-D03`: Update
  `scripts/foundation/voc081-f2-evidence-policy.{mjs,test.mjs}` with the living
  record and add fail-closed checks for every designated active surface.
- `VOC-086-D04`: Completion means repository/local F2 only. F3, staging, A1/P1-P5
  acceptance, production, deployment, and live verification remain unclaimed.
- `VOC-086-D05`: Preserve all three VOC-080 holds; package adoption and R4 evidence
  grant no external-effect authority.
- `VOC-086-D06`: Every implementation revision requires a different non-author exact-
  SHA reviewer; R4 tasks also require a distinct canonical-evidence specialist verdict.
- `VOC-086-D07`: Issue #131 closes only after final merge and passing post-merge checks.

## Scope and non-goals

In scope are the six living documentation/evidence surfaces, the existing VOC-081
final-evidence validator and focused fixtures, foundation aggregation if required, and
the VOC-086 final record. No product/runtime/API/schema/workflow behavior, repository
setting, Cloudflare resource, environment, secret, live data, deployment, or `main`
promotion is in scope; no source branch may be deleted.

## Risk and protected areas

Semantic risk is R4 because milestone status controls downstream eligibility. The
validator implementation has an R3 integrity effect. Protected documentation includes
DOC-12 and canonical completion evidence. False completion and false continued-pending
states are both blocking findings.

## Security, privacy, data, analytics, and accessibility

There is no learner-data read or write, migration, analytics, UI, or accessibility
effect. Evidence must contain only public repository identifiers. Secrets, personal
data, production data, and live APIs are prohibited. Normal isolated task branches and
reviewed merges may change repository history; source-branch deletion and `main`
promotion remain prohibited.
