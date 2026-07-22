# DOC-00–DOC-12 Adoption Reconciliation Record

Status: **Non-authoritative adoption evidence**

This record explains the semantic corrections made by VOC-008 before DOC-00 through DOC-12 were
adopted together. It supports traceability but does not replace the adopted documents, the
[VOC-008 package](../../specs/changes/VOC-008-doc-00-doc-12-canonical-adoption/), or canonical
governance. The original VOC-007 source hashes and migration history remain unchanged in
[`docs/migration-manifest.yaml`](../migration-manifest.yaml).

## Registered corrections

| ID | Affected documents | Resolution | Rationale |
|---|---|---|---|
| VOC-008-C01 | DOC-04, DOC-06, DOC-08, DOC-10 | Normative repository paths are `apps/web` and `apps/api`; the Go module, Ent schemas, migrations, and OpenAPI artifact live below `apps/api`. | Matches the live monorepo and removes three incompatible layouts. |
| VOC-008-C02 | DOC-00, DOC-01, DOC-03–DOC-07, DOC-09, DOC-12 | Every Markdown path and numbered-section citation was checked; stale section numbers were repaired. | Prevents future packages from following the right document to the wrong rule. |
| VOC-008-C03 | DOC-04, DOC-06, DOC-07 | Authentication is provider-neutral Google OAuth plus email magic-link delivery with PostgreSQL-backed sessions. | Specifies behavior and trust boundaries without selecting or purchasing an auth vendor. |
| VOC-008-C04 | DOC-00, DOC-03, DOC-05–DOC-08 | Review `result` and `rating` are distinct. Objective incorrect answers record Again; objective correct answers allow Hard/Good/Easy; self-check derives result from rating. Again steps back (floor 0), two consecutive incorrect/Again attempts reset to 0, Hard stays, and Good/Easy advance (cap 7). | Makes UX, persistence, API, and scheduling rules implement the same state transition. |
| VOC-008-C05 | DOC-05–DOC-07, DOC-09 | Idempotency uniqueness is `(user_id, scope, key)`, with request-fingerprint validation and isolated cross-user reuse. | Prevents one learner's key or cached response from affecting another learner. |
| VOC-008-C06 | DOC-00, DOC-05–DOC-07 | A daily mission snapshot persists its review target/counter and policy version; optional new-word and sentence-practice targets/counters are representable but do not block core completion unless a later versioned policy says so. | Aligns the product's optional goals with the database and API contract. |
| VOC-008-C07 | DOC-05, DOC-07, DOC-09 | Operational attempt states, public processing states, and learning-result states remain separate; mission completion occurs only after successful persistence. | Avoids collapsing three state machines or claiming completion after a failed write. |
| VOC-008-C08 | DOC-05–DOC-07, DOC-09 | Account deletion immediately deactivates the account and revokes sessions, then performs a staged, retryable, verified purge/anonymization. Learner-linked content is deleted or irreversibly anonymized; only unlinkable de-identified aggregates may remain. Legal review is required before production. | Establishes a privacy-safe product/technical baseline without pretending this document supplies legal approval. |
| VOC-008-C09 | DOC-04, DOC-06, DOC-07, DOC-10 | Huma's generated OpenAPI 3.1 artifact is committed at `apps/api/openapi/vocanova.openapi.json` for client generation and drift checks. | Preserves the later, more specific contract decision. |
| VOC-008-C10 | DOC-11 | DOC-11's vendor and infrastructure table is a target only; it grants no procurement, spend, provisioning, deployment, release, or launch authority. | Separates design adoption from external effects and founder-controlled decisions. |
| VOC-008-C11 | DOC-10, DOC-12 | The roadmap acknowledges the existing workspace, Next.js scaffold, and Go skeleton while stating that the F2 gate has not passed. | Makes current-state prose truthful without treating partial scaffolding as milestone acceptance. |

All eleven dispositions are consequential parts of the atomic baseline and therefore require the
same exact-revision founder R4 approval as the adoption candidate; none is independent runtime,
legal, procurement, deployment, or release authorization.

## Semantic review matrix

| Topic | Compared documents | Adopted source of detail |
|---|---|---|
| Product audience, outcome, scope, exclusions | DOC-00, DOC-01, DOC-02, DOC-12 | DOC-00/01 define product scope; DOC-12 sequences it. |
| Screens, navigation, accessibility | DOC-01, DOC-03, DOC-08 | DOC-03 defines experience behavior; DOC-08 defines web implementation boundaries. |
| Authentication, sessions, ownership | DOC-01, DOC-04, DOC-05, DOC-06, DOC-07 | DOC-06/07 define the server-session and API boundary; DOC-05 persists it. |
| Vocabulary, journey, save state | DOC-00, DOC-03, DOC-05–DOC-08 | DOC-05 is the data model; DOC-06/07 own behavior/contracts. |
| Review scheduling | DOC-00, DOC-03–DOC-08 | DOC-05 §9 is the exact state model; DOC-06/07 implement and expose it. |
| Daily missions, points, streaks | DOC-00, DOC-03–DOC-08 | DOC-05 defines persistence; DOC-06 owns transitions. |
| AI feedback, safety, privacy, trust | DOC-00, DOC-01, DOC-03–DOC-09 | DOC-09 is the detailed AI authority; other documents reference its contract. |
| Account deletion and retention | DOC-03, DOC-05–DOC-07, DOC-09 | DOC-05/06 define staged data lifecycle; DOC-07 exposes it; DOC-09 governs AI content. |
| Repository and OpenAPI layout | DOC-04, DOC-06–DOC-08, DOC-10 | `apps/web`, `apps/api`, and the committed generated contract are canonical. |
| Engineering workflow and authority | DOC-04, DOC-06, DOC-10–DOC-12 | DOC-10/11 cross-reference live governance rather than redefining it. |
| Infrastructure and release target | DOC-04, DOC-10, DOC-11, DOC-12 | DOC-11 is target design only; governance controls external action. |
| Milestone dependencies/current state | DOC-01, DOC-10, DOC-12 | DOC-12 defines sequencing and gates; partial F2 scaffolding is not acceptance. |

## Additional review corrections

The full semantic pass also repaired stale references to the Confidence Point ledger, review model,
onboarding profile, journey ordering, sentence persistence, AI UX states, AI timeout policy, and
roadmap exclusions. DOC-13 and DOC-19 remain proposed; DOC-14 remains not adopted. No application,
schema, dependency, workflow, governance, infrastructure, deployment, or production state changed.

## Authority boundary

Adoption makes DOC-00 through DOC-12 authoritative product and technical inputs. It does not itself
authorize application implementation: each implementation change still needs its own bounded,
approved `VOC-###` package. Merge, release, EHR, and activation authority remains exclusively in
the live governance sources indexed by [`docs/governance/README.md`](../governance/README.md).
