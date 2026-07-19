# VOC-008 Specification

## Objective and requirement source

Founder-approved issue #29 and comment `5017746234` authorize preparation of this
package only. The package is grounded on canonical `develop` commit
`d04e3d1a95b069612414667a8f74a01af7ef271f`, the VOC-007 migration evidence, and
active A-003 authority. Valid package adoption is required before any document
lifecycle or substantive correction is implemented.

## Stable requirements

- **VOC-008-R01:** Re-verify live `develop`, issue #29 and its scope approval,
  repository instructions, current package index, applicable document conventions,
  the VOC-007 migration trail, and live governance before implementation.
- **VOC-008-R02:** Treat the 13 document files and SHA-256 values in the snapshot below
  as the review baseline. Any later content change must be explicit, traced to a
  documented reconciliation item, and included in exact-revision approval.
- **VOC-008-R03:** Review DOC-00 through DOC-12 as one coherent baseline covering
  product scope, market premise, UX, architecture, database, backend, API/DTO, web,
  AI behavior, development workflow, DevOps, and delivery sequence.
- **VOC-008-R04:** Resolve every adoption-blocking contradiction, ambiguous precedence,
  broken link/section reference, or conflict with higher-authority current state. Do
  not silently choose a material privacy, security, product, infrastructure, or
  learner-data rule; record the resolution and rationale for founder review.
- **VOC-008-R05:** At minimum, disposition the known review points in the contradiction
  register below. The register is a floor, not proof that semantic review is complete.
- **VOC-008-R06:** Preserve the stable identities, canonical paths, document types,
  owners, source provenance, and substantive scope of DOC-00 through DOC-12 unless an
  explicit reviewed correction requires otherwise.
- **VOC-008-R07:** After all blocking review points are resolved, change each in-scope
  document to `status: approved`, record one verified approval timestamp, update
  `last_reviewed_at`, set `adoption_change: VOC-008`, and remove the obsolete proposed
  lifecycle notice. Do not claim approval before the exact adoption revision receives
  its required evidence.
- **VOC-008-R08:** Keep DOC-13 and DOC-19 `proposed`; keep historical DOC-14
  `not-adopted`; do not imply that this adoption promotes any of them.
- **VOC-008-R09:** Update `docs/README.md`, all affected category indexes,
  `docs/document-graph.yaml`, and `docs/migration-manifest.yaml` so status, path,
  ownership, relationships, adoption evidence, and completeness agree.
- **VOC-008-R10:** Preserve the VOC-007 migration/source-hash evidence. Adoption adds a
  lifecycle record; it must not rewrite the frozen-source history or conceal any
  content correction made after migration.
- **VOC-008-R11:** Current authority statements must defer to DOC-16, A-002, A-003,
  risk classification, approval matrix, and live transition state. DOC-10/11 may
  describe engineering mechanics but cannot create merge, release, or approval rules.
- **VOC-008-R12:** Do not modify any file under `docs/governance/`, DOC-15, DOC-16,
  DOC-17, DOC-18, or any A-00# amendment. Stop and request separate authority if
  consistency appears to require such an edit.
- **VOC-008-R13:** Introduce no application behavior, dependency, schema, migration,
  workflow, infrastructure provisioning, secret, learner/production data processing,
  deployment, automatic merge, autonomous activation, or production release.
- **VOC-008-R14:** Adoption makes the reviewed documents authoritative inputs for
  future bounded packages only. It does not authorize the application rebuild, spend,
  vendor account creation, provider selection, deployment, launch, or production use.
- **VOC-008-R15:** Validate frontmatter, statuses, approval timestamps, links, section
  targets, document graph, migration manifest, indexes, YAML, exact file scope,
  governance claims, and absence of false activation using every installed applicable
  check without weakening controls or inventing unavailable passing results.
- **VOC-008-R16:** Classify both package adoption and later document adoption R4 and
  bind independent Claude Code verification and founder approval to each exact final
  revision independently. No prior approval is reusable.
- **VOC-008-R17:** Publish package preparation and later adoption as separate draft PRs
  to `develop`; Codex must not self-approve or merge either PR, and an authorized human
  must merge while automatic/autonomous merge remains disabled.
- **VOC-008-R18:** Keep issue #29 open after package adoption. Close it only after the
  document-adoption merge and truthful lifecycle evidence synchronization are complete.
- **VOC-008-R19:** Rollback is a separately governed repository revert that restores
  the prior document content/statuses and all derived metadata consistently without
  rewriting the audit trail.

## Review-baseline snapshot

| ID | Canonical path | SHA-256 at grounded base |
|---|---|---|
| DOC-00 | `docs/product/00-product-bible.md` | `69d3bfea422db9130e99066c01b8481ed23650c821efb21cb181551ca3edb4be` |
| DOC-01 | `docs/product/01-mvp-prd.md` | `63f9e8b616d83c299ce9d671a834b45d60611d19b91a1f75c9f87248d043f546` |
| DOC-02 | `docs/research/02-market-research.md` | `9febf0dcd98b53f06dc5371808b2f84ca07e1b1fbbe15cf4209cc78aa9d3af46` |
| DOC-03 | `docs/design/03-ui-ux-design.md` | `c3fb381674338a7d68851be83fe6c144301cfc8aacbd1bb70c5d53f26cb37013` |
| DOC-04 | `docs/engineering/04-technical-architecture.md` | `b38ab311a4953206f9ad38a76c8aed27d1a1e02fc72d1c2406c07681ae8eea4d` |
| DOC-05 | `docs/engineering/05-database-design.md` | `114fdd1594331701baece2a3d71fa6cd631ab67db30c502fbecacd6f4563187b` |
| DOC-06 | `docs/engineering/06-backend-design.md` | `6bd94587cbef421cb181920a761479ece128dfccaac88603dc0515013c31e2e7` |
| DOC-07 | `docs/engineering/07-api-contract-and-dto-design.md` | `8f55e6311d8e05aca47d064bf6ecb79a0e28de6f327203a1c42244306daa5f75` |
| DOC-08 | `docs/design/08-web-app-design.md` | `c7e77d38407a6ccb3947bddfc590ebddbfa12c55eee7f8d913176c787e19cc9b` |
| DOC-09 | `docs/engineering/09-ai-features.md` | `9b764c3068b769c4d1dcb476901641e87e810f46c651914a0dde1c8691e36ab8` |
| DOC-10 | `docs/operations/10-development-workflow.md` | `2cb085d70777c0eec6cd92a1d117b1bd8a18620814f4f4c019c677db46962e9d` |
| DOC-11 | `docs/operations/11-devops-and-ci-cd.md` | `161b3c1a9966d332c7b0c17096d78755e24b65cf31e8f1b401867807560eb2f0` |
| DOC-12 | `docs/product/12-mvp-implementation-plan.md` | `20256365bf95240fa83bcc8cfb53a7793638ca6908c80395c26657eb4f0516ef` |

## Known contradiction and correction register

- **VOC-008-C01 — Repository layout:** DOC-04 and the live repository use `apps/web`
  and `apps/api`; DOC-06 uses `backend/`; DOC-10 shows `services/api/`; DOC-08 says
  `/web` or `apps/web`. Normalize normative paths to the live monorepo without
  erasing historical migration evidence.
- **VOC-008-C02 — Broken section references:** verify and repair every section-target
  citation, including DOC-01's DOC-12 `§21`, DOC-04's DOC-06 `§11` and DOC-09 `§56`,
  DOC-06's DOC-09 `§28`, and DOC-12's DOC-01 `§8` references.
- **VOC-008-C03 — Authentication boundary:** reconcile DOC-04's ambiguous
  “Clerk-family auth” label with DOC-06/07's Google OAuth, email magic link,
  PostgreSQL-backed server-session design. Adoption must not accidentally select or
  purchase an unreviewed vendor.
- **VOC-008-C04 — Review semantics:** make answer correctness, learner difficulty
  rating, `review_step` transitions, initial step, and two-consecutive-incorrect reset
  behavior consistent across DOC-00, DOC-03, DOC-05, DOC-06, DOC-07, and DOC-08.
- **VOC-008-C05 — Idempotency scope:** reconcile DOC-05's global `(scope, key)`
  uniqueness with DOC-06's “key + user scope” wording and DOC-07's public header
  contract; preserve cross-user isolation and deterministic replay semantics.
- **VOC-008-C06 — Daily mission persistence:** reconcile the product's optional
  new-word/sentence targets with DOC-05's snapshot columns and DOC-06/07's mission
  description so the database can represent every authoritative target explicitly.
- **VOC-008-C07 — AI lifecycle vocabulary:** align operational attempt statuses,
  public processing statuses, learning-result statuses, mission-completion timing,
  and retry behavior across DOC-05, DOC-07, and DOC-09 without collapsing distinct
  state machines.
- **VOC-008-C08 — Account deletion and retention:** resolve DOC-05's anonymized
  retained learning/mission history, DOC-07's immediate anonymization language, and
  DOC-09's deletion of relevant mission/AI records. Record a privacy-safe rule; do not
  infer legal obligations or approve production retention merely through wording.
- **VOC-008-C09 — OpenAPI artifact:** retain the later specific decision that a
  generated artifact is committed for code generation and drift detection, and remove
  high-level ambiguity that could be read as prohibiting it.
- **VOC-008-C10 — Infrastructure commitment:** distinguish the DOC-11 target baseline
  from actual vendor procurement, spend, production activation, and launch authority;
  adoption alone authorizes none of those actions.
- **VOC-008-C11 — Current-state wording:** reconcile future-plan language with the
  already implemented workspace, Next.js scaffold, and Go skeleton without claiming
  incomplete F2/F3 gates have passed.

## Explicitly out of scope

DOC-13, DOC-14, DOC-19 approval; protected governance edits; DOC-15 through DOC-18
edits; application implementation; vendor procurement; infrastructure changes;
secrets; schemas or migrations; GitHub workflow changes; Control Plane work; RL1/RL2
activation; automatic/autonomous merge; staging/production deployment; launch; and
VOC-006/VOC-007 lifecycle cleanup are excluded.

## Data, migrations, analytics, and accessibility

This package and later document adoption process no learner or production data and
change no runtime schema, analytics, UI, or accessibility behavior. The adoption
review must still evaluate the proposed data, privacy, analytics, AI-trust, and WCAG
requirements because they constrain future packages.
