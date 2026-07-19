# VOC-007 Specification

## Objective and requirement source

Founder-approved issue #25 and its approval comment `5015231469` authorize preparation
of this package only. The package is grounded on canonical `develop` commit
`857a700faebbdd6b0095f2236419ae8016cea91f`, active A-003 authority, and the exact
source hashes recorded below. Valid repository adoption is required before migration.

## Stable requirements

- **VOC-007-R01:** Re-verify live `develop`, repository instructions, issue #25,
  adopted package state, document conventions, and all current authority sources
  before implementation; stop for any material conflict or changed source snapshot.
- **VOC-007-R02:** Treat DOC-15 section 23 as the baseline stable-ID and category
  mapping, while retaining the repository-established `docs/architecture/`,
  `docs/planning/`, and `docs/decisions/` path conventions stated by DOC-16.
- **VOC-007-R03:** Preserve stable living-document identities DOC-00 through DOC-13.
  Split combined refined sources where necessary: source 01 into DOC-00/DOC-01,
  source 10 into DOC-10/DOC-11, and source 11 into DOC-12/DOC-13. Preserve every
  load-bearing section once, using cross-references rather than silent deletion.
- **VOC-007-R04:** Place DOC-00, DOC-01, and DOC-12 in `docs/product/`; DOC-02 in
  `docs/research/`; DOC-03 and DOC-08 in `docs/design/`; DOC-04 through DOC-07 and
  DOC-09 in `docs/engineering/`; DOC-10, DOC-11, and DOC-13 in `docs/operations/`,
  unless a higher-authority live convention requires a documented equivalent path.
- **VOC-007-R05:** Add required frontmatter to every living document with truthful
  `id`, `title`, `version`, `status`, `owner`, `canonical_path`, approval/review
  fields, supersession, related documents, and related decisions. Use `proposed` and
  pending/unknown dates unless exact canonical evidence supports another value.
- **VOC-007-R06:** Preserve source `00-README-and-changelog.md` as a non-authoritative
  migration evidence artifact, including the feedback-label, review-scale,
  Confidence Points, sentence-history, repository-name, governance-conflict, and
  removed-scaffolding record. Correct its stale governance resolution through an
  explicit erratum or annotation without rewriting away historical evidence.
- **VOC-007-R07:** Do not import source `12-governance-and-automation.md` as a living
  authority document or as a peer/replacement of DOC-15 through DOC-18 or A-002/A-003.
  Preserve its useful historical comparison as cited research and explicitly reject
  its stale final recommendation.
- **VOC-007-R08:** Account for historical DOC-14 in the migration manifest as
  reconciled but not canonically imported because its automation conclusions conflict
  with live governance. Link its preserved research trail to DOC-19 and the existing
  authority sources; do not silently claim DOC-14 became approved current state.
- **VOC-007-R09:** Create proposed DOC-19 at
  `docs/operations/19-governance-reconciliation-notes.md` as a plain-language guide,
  not a governance authority source. It must cross-reference rather than duplicate
  DOC-16, A-002, A-003, risk classification, and the approval matrix.
- **VOC-007-R10:** DOC-19 and every affected migrated passage must state that A-003
  is effectively active, routine R3 has no standing founder/steward approval solely
  for being R3, R4 remains founder-controlled, and EHR is exceptional-only.
- **VOC-007-R11:** Distinguish governance permission from technical activation and
  report the implementation-time values in `a003-transition-state.yaml`, including
  false RL1/RL2 activation, automatic/autonomous merge and Control Plane flags, and
  disabled production deployment/autonomous release. Do not hard-code a fact that has
  changed by implementation time.
- **VOC-007-R12:** Search all imported content for stale `founder approval`,
  `develop → main`, `merge authority`, automatic merge/deploy, steward, DOC-15/A-001,
  and release claims. Replace restated authority rules with accurate cross-references
  while preserving historical statements as explicitly labeled history.
- **VOC-007-R13:** Preserve the refined product and technical decisions identified in
  the changelog, including canonical AI feedback enums, the learner review scale and
  reset semantics, Confidence Points terminology, no standalone MVP sentence-history
  screen, and the `vocanova-platform` repository name, as proposed content requiring
  founder adoption before it becomes implementation authority.
- **VOC-007-R14:** Add `docs/migration-manifest.yaml` with source hashes, source-to-
  destination coverage, lifecycle/completeness state, conflict disposition, and
  evidence links for DOC-00 through DOC-14 and DOC-19.
- **VOC-007-R15:** Add `docs/document-graph.yaml` with unique nodes and relationships
  for the migrated documents and existing DOC-15 through DOC-18/A-002/A-003. The
  graph is a derived impact aid and never overrides semantic review or authority.
- **VOC-007-R16:** Update `docs/README.md` and every relevant existing or newly
  required category index with ID, title, status, owner, canonical path, and related
  artifacts. Do not describe proposed documents as approved or current authority.
- **VOC-007-R17:** Create missing `docs/research/`, `docs/design/`, and
  `docs/engineering/` category indexes only as required for the approved mapping; do
  not introduce a duplicate ADR, architecture, planning, or governance tree.
- **VOC-007-R18:** Do not modify any file under `docs/governance/`, DOC-15, DOC-16,
  DOC-17, DOC-18, or any A-00# amendment. If consistency appears to require such an
  edit, stop and request separate authority.
- **VOC-007-R19:** Introduce no application behavior, dependency, schema, migration,
  workflow, infrastructure, secret, production data, deployment, automatic merge,
  autonomous activation, or production release capability.
- **VOC-007-R20:** Publish implementation separately as a draft PR to `develop`, use
  explicit staging, classify the exact diff at the highest effective class, record
  acceptance evidence and rollback, obtain exact-SHA independent verification and
  R4 founder approval, and stop without merge, deployment, self-approval, or issue
  closure.

## Source snapshot

| Source | SHA-256 |
|---|---|
| `00-README-and-changelog.md` | `5e3722ea14573e8becd645b55433601f4be05c7a83d3634350d5686c68b78b22` |
| `01-product-bible-and-prd.md` | `ffafedf6bb6e1ff6c7e04f8ce67c23478592dd099a543a648d970bf5733f8009` |
| `02-market-research.md` | `6de75b467781bb90297b2a663c16be613cddd24b0efafa58cefe6de395e314c5` |
| `03-ui-ux-design.md` | `f3f37beea86bc29a5230f66731730ab28a07635546d60084e49f954e53b30ed4` |
| `04-technical-architecture.md` | `50ba0901ee5e877e98e7071c6930f809b0ebc6074858fd20e1ac7deae12403dc` |
| `05-database-design.md` | `cc2efd5b6356f41bfc9075bd58297b301e6274a708943c16369600e6f0d5d1c9` |
| `06-backend-design.md` | `f2f5dd0159cbefc96df37d9a1fd78adb34e22680fa18fe356973ec76a69d2578` |
| `07-api-contract-and-dto-design.md` | `c1b44de8d2edd02a98098b03b6839f553c594a8225e7371952751a8e19f6883e` |
| `08-web-app-design.md` | `da9154f1962e52f5046c712e581f5627122f48aec86684b24f69de1b9ee129d5` |
| `09-ai-features.md` | `57e798e3f2d259b18a1710e6c5a67a3a1c2d790133501d6aa9bf785ed7f61f74` |
| `10-development-workflow.md` | `7fdd38cb7f877051907cc68e0930ece507fe3466dab3e008795c2827eeb21aaf` |
| `11-implementation-roadmap.md` | `e4745ab74e3951004d20e6fd580c56ee7939a316bb427adbc2a9b09ae54b05a3` |
| `12-governance-and-automation.md` | `7fda3a4b20321f3c741c8fedddbe26b13ffed64064a09202ce5df0e2fb8fc2a1` |

## Compatibility and safety

The migration changes repository knowledge only. Proposed documents cannot authorize
product implementation until separately adopted as approved. Unknown dates remain
pending or unknown. Broken or ambiguous source relationships block completeness
rather than being guessed. Git remains the detailed revision history.
