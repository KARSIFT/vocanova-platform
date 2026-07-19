# VocaNova Documentation Migration Notes and Reconciliation Changelog

Status: **Non-authoritative migration evidence**

These notes preserve the complete refined-source reconciliation record used by VOC-007. They are
evidence, not a living product or governance authority document.

> **Governance erratum:** The preserved source below concluded that DOC-15/A-001 established
> immediate all-risk automatic merge and a single founder release approval. That conclusion was
> produced without the approved A-002 and effectively active A-003 record and is not adopted here.
> Current authority comes from DOC-16, A-002, A-003, the risk classification, and approval matrix;
> technical activation remains separate and automatic/autonomous merge and production deployment
> remain disabled. See [DOC-19](../operations/19-governance-reconciliation-notes.md).

---

# Vocanova Final Docs — Index and Reconciliation Changelog

## What this folder is

This folder is a **refined, deduplicated rewrite** of everything in `vocanova-docs/` (19 source
documents, some with PDF/DOCX duplicates). It is not a mechanical copy. Each document below was
rewritten to:

- remove chat-session scaffolding ("next document," "next chat starter prompt" — these were
  artifacts of how the docs were originally produced turn-by-turn with ChatGPT, not real content);
- resolve places where later documents silently changed earlier decisions without saying so
  (naming drift, rating-scale drift, governance-model drift — see the changelog below);
- pull real content out of documents that were empty stubs pointing at a PDF/DOCX (this happened at
  least once — see UI/UX below — so every doc was checked for this pattern, not just the one where
  it was obvious);
- keep everything that is still load-bearing (full DB schemas, API contracts, AI prompt rules) —
  refinement means resolving contradictions and cutting cruft, not shortening specs until they stop
  being useful as implementation references.

Nothing here is a new product decision. Where two source documents disagreed, this changelog says
so explicitly and states which version was kept and why, so you can overrule it.

## File map

| File | Replaces |
|---|---|
| `01-product-bible-and-prd.md` | `00-Vocanova_Product_Bible_v1.0.md`, `01-Vocanova_MVP-PRD-v1.0.md` |
| `02-market-research.md` | `02-Vocanova_Market_Research_v1.0.md` |
| `03-ui-ux-design.md` | `03-Vocanova_UI_UX_Design_v1.0.md` (stub) + `.pdf` (real content) |
| `04-technical-architecture.md` | `04-Vocanova_Technical_Architecture_v1.0.md` |
| `05-database-design.md` | `05-Vocanova_Database-Design_v1.0.md` |
| `06-backend-design.md` | `06-Vocanova_Backend_Design_v1.0.md` |
| `07-api-contract-and-dto-design.md` | `07-Vocanova_API_Contract_and_DTO_Design_v1.0.md` |
| `08-web-app-design.md` | `08-Vocanova_Web_App_Design_v1.0.md` |
| `09-ai-features.md` | `09-Vocanova_AI_Features_v1.0.md` |
| `10-development-workflow.md` | `10-Voconova_Development_Workflow_v1.0.md`, `11-Voconova_DevOps_and_CI-CD_Plan_v1.0.md` |
| `11-implementation-roadmap.md` | `12-Voconova_MVP_Implementation_Plan_v1.0.md`, `13-Voconova_F1_Repository_Foundation_v1.0.md` |
| `12-governance-and-automation.md` | `14-...AI_Development_Automation_Architecture.md`, `15-ai-native-...-operating-model.md`, `A-003-...md`, `DOC-17-...md`, `DOC-18-...md` |

`00-README-and-changelog.md` (this file) has no source-document equivalent — it's new, and it's the
one you should read first.

---

## Conflicts found and how they were resolved

### 1. AI feedback label conflict

- Doc 01 (PRD): "Great! / Almost! / Try again"
- Doc 03 PDF (UI/UX): "Good / Almost / Needs work"
- Doc 04 (Technical Architecture): "Good / Almost / Needs work / Explanation / Improved sentence"
- **Doc 09 (AI Features, the most detailed and most recent of the four)**: `correct` /
  `needs_improvement` / `incorrect` as the three canonical *internal* statuses, with
  learner-facing copy ("Great use of this word!", "Almost right!", "Good try—let's fix one thing.")
  treated as presentation strings over those statuses, not the statuses themselves.

**Resolution:** Doc 09's three-status model (`correct` / `needs_improvement` / `incorrect`) is used
everywhere in the refined docs as the canonical internal contract. Doc 01/03/04's phrasing survives
only as example UI copy, not as the data model. This matters concretely for `05-database-design.md`
and `07-api-contract-and-dto-design.md`, which reference this enum.

### 2. Review rating and scheduling conflict

- Doc 04: "Hard / Good / Easy ratings" + "failure rollback"
- Doc 05 (Database Design): `result` enum is `correct` / `incorrect` / `skipped`; separate
  `review_step` integer 0–7; two consecutive incorrect answers reset `review_step` to **0**
- Doc 06 (Backend Design): ratings are "forgot / hard / remembered / easy" (four-way)
- Doc 07 (API Contract): ratings implied as correct/incorrect; reset goes to step **1**, not 0
- Doc 08 (Web App Design): ratings are "Again / Hard / Good / Easy" (Anki-style four-way)

**Resolution:** This is the messiest drift in the whole corpus — four different rating vocabularies
and two different reset targets (0 vs. 1) for the same mechanic. Doc 05 is kept as authoritative for
the **data model** (`review_step` is an integer column with `check (review_step between 0 and 7)`,
reset-on-double-failure goes to **0**, because that's what's actually enforced by a committed
constraint, not prose). For the **learner-facing rating scale**, doc 08's "Again / Hard / Good /
Easy" is kept as canonical because it's the most recent web-design decision and maps cleanly onto
"move back a step / same step / move forward one step / move forward two steps" without needing a
new backend concept. Doc 06's four-way "forgot/hard/remembered/easy" is treated as an earlier draft
of the same idea and is not used verbatim anywhere in the refined docs — flag this explicitly if you
want the backend copy to use those words instead.

### 3. Confidence Points origin

Doc 00 (Product Bible) and doc 01 (PRD) do not use the term "Confidence Points" — they describe
gamification only in general terms. Doc 02 (Market Research) is the first document to use
"Confidence Points" by name, and every document after it (04 onward) uses the term as settled
vocabulary. This isn't a contradiction, just an origin point worth recording: **doc 02 is where
"Confidence Points" became the product's name for its point system.** The refined `01-product-bible-and-prd.md`
uses the term from the start, since it's now settled, rather than reproducing doc 00/01's vaguer
placeholder language.

### 4. Sentence history screen conflict

- Doc 01 (PRD) describes a "Sentence History Page" as a required MVP screen.
- Doc 03 PDF (UI/UX, later and more detailed) explicitly states AI feedback/sentence history is
  **stored in the backend but should NOT have a separate history UI screen in MVP** — sentence
  practice is a reusable component surfaced from Home/Word Detail/Review Completion, not a
  standalone page.
- Doc 08 (Web App Design, later still) lists MVP routes and **does not include** a sentence-history
  route, which is consistent with doc 03's later position.

**Resolution:** No dedicated sentence-history screen in MVP. This is doc 01 being superseded by
doc 03 and doc 08, not a case where both can be kept. The refined PRD (`01-product-bible-and-prd.md`)
removes the "Sentence History Page" as an MVP requirement and notes it as a post-MVP candidate
(consistent with doc 09 §58's post-MVP list, which includes "sentence-history insights").

### 5. Repository name conflict

- Doc 10 (Development Workflow) calls the repo `vocanova` (private monorepo).
- Doc 13 (F1 Repository Foundation) calls it `vocanova-platform`.
- Doc 15 (AI-Native Operating Model, the most recent and most authoritative of the three) also uses
  `KARSIFT/vocanova-platform`.

**Resolution:** `vocanova-platform` is correct — it also matches the actual GitHub repository. Doc
10's `vocanova` was an earlier working name.

### 6. Governance / merge-authority model — the biggest reconciliation, now decided

This is the one that most needed a founder decision, so it gets full treatment in
`12-governance-and-automation.md` rather than a one-line note here. Summary of what changed release
over release:

- **Doc 14** (earliest, KARSIFT-org-wide automation vision): normal implementation PRs into
  `develop` auto-merge on Claude's approval alone — **no founder approval required** for routine
  work.
- **Doc 10** (Development Workflow, per-repo): the founder is **always** the final merge authority,
  for every PR, no exceptions stated.
- **DOC-17 / DOC-18 / A-003** (the architecture and roadmap documents, read in an earlier session):
  describe a much more conservative, evidence-gated rollout — Technical Activation Levels 0–7,
  starting from full founder-approval and only unlocking R0–R2 auto-merge after proven reliability.
  This is the model the previously-built `KARSIFT/vocanova-ai-infra` automation assumed (permanent
  "shadow mode": nothing auto-merges until the founder explicitly flips a switch, and even then it's
  all-or-nothing across risk classes today).
- **DOC-15** (dated 2026-07-13 — the newest document in the corpus, six days before this rewrite,
  and the only one that explicitly says it "supersedes" conflicting statements in earlier docs):
  reintroduces **Amendment A-001 — Development Merge Authority**. Under A-001, Claude-approved
  automatic merging into `develop` — for every risk class, including high-risk — is **the initial
  operating rule**, not a level you earn later. The founder's approval is required only for
  `develop → main` and for production publication. DOC-15 explicitly lists "any requirement for
  founder approval before merging into develop" and "any ten-pull-request waiting period before
  enabling auto-merge" as **superseded statements**.

**This was a real, unresolved contradiction, not drift language could quietly fix** — DOC-15's own
`related_documents` frontmatter lists only DOC-00 through DOC-14, never mentioning DOC-16/17/18 or
A-003, so it was unclear whether DOC-15 meant to override the Activation-Levels model or simply
wasn't reconciled with it. `12-governance-and-automation.md` laid out both positions side by side and
this was put to the founder directly rather than inferred.

**Decided (two parts):**

1. DOC-15 / Amendment A-001. Claude-approved automatic merging into `develop` — for every risk
   class — is the operating rule from day one; the Activation-Levels model is not adopted.
2. **Production publication is not a second approval step.** Every source document, including
   DOC-15, models the release path as two founder approvals (`develop → main`, then separately
   publish `main` to production). This project uses one: approving the `develop → main` release PR
   *is* the production decision — merging it triggers production deployment automatically, gated
   only by its own deterministic checks (migrations, health checks, smoke tests), not by a second
   founder comment.

This means `vocanova-ai-infra`'s `merge-gate.yml` needs to switch from permanent shadow-mode to real
auto-merge for `develop`, and the production-deploy workflow needs its manual-approval step removed
in favor of automatic promotion after `main` checks pass — see `12-governance-and-automation.md`
§5–6 for the exact scope of both changes.

### 7. Dropped as non-canonical meta-cruft (not a conflict, just noise)

Removed entirely from the refined docs, present in the originals only as ChatGPT-conversation
scaffolding:

- doc 01's trailing "Next Chat Starter Prompt" and "Correct Planning Roadmap" sections;
- doc 02's trailing "Next Document" pointer;
- doc 03's entire `.md` body, which is a 20-line stub reading "the complete approved version was
  finalized in the previous ChatGPT response and should be used as source of truth" — i.e., an
  explicit admission that the real content lives only in the PDF. All of doc 03's actual content in
  this rewrite comes from the 71-page PDF.

## Documents intentionally left thin here

`05-database-design.md`, `07-api-contract-and-dto-design.md`, and `09-ai-features.md` (AI behavior
rules, prompt architecture, safety, evaluation thresholds) were already internally consistent,
detailed, and current in the source corpus — they aren't where the drift lives. They're reproduced
here close to verbatim, reformatted only to fix the conflicts above (labels, rating scale) and to
drop redundant restatements of decisions already settled in `01-product-bible-and-prd.md`.
