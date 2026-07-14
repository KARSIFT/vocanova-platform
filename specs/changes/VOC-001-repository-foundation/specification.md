# Specification

## Approved repository reconciliation — 2026-07-14

GitHub issue #6 records founder approval and implementation authorization against
starting `develop` SHA `0211d75f28a4986694555f584dd8b84a3228a2ad`. The following
amendments preserve, but supersede, stable decisions tied to obsolete assumptions:

- `VOC-001-AM-01` supersedes the path assumptions in `VOC-001-D29` and related
  text: `docs/decisions/` is canonical and root `docs/decisions/` is prohibited.
- `VOC-001-AM-02` supersedes uppercase PR-template references: the only canonical
  path is `.github/pull_request_template.md`.
- `VOC-001-AM-03` supersedes `VOC-001-D45`: CODEOWNERS routes directly to the
  verified founder and qualified human technical steward `@m-e-h-r-d-a-a-d`; no
  governance team is invented or required for implementation.
- `VOC-001-AM-04` supersedes `VOC-001-D28`, `VOC-001-D55`, `VOC-001-D85`, and all
  VOC-001 bootstrap instructions. PR #3 consumed the one-time exception. Current
  results are `PASS`, `PASS WITH NON-BLOCKING FINDINGS`, or `FAIL`; final R4 founder
  and R3 steward approvals must be exact-head and explicit.
- `VOC-001-AM-05` supersedes hosted controls as readiness blockers. Rulesets,
  required checks, distinct identities, and positive/negative enforcement proofs
  remain mandatory Phase 4 closure requirements controlled by the founder.

Where later text conflicts, these approved amendments and current DOC-16/A-002
governance control executable behavior. Stable original IDs remain historical
traceability records and are not renumbered or silently deleted.

## Package identity

- **ID:** `VOC-001`
- **Title:** Repository Foundation
- **Type:** Infrastructure
- **Risk:** High
- **Status:** Blocked — repository grounded; three founder-controlled prerequisites remain
- **Canonical path:** `specs/changes/VOC-001-repository-foundation/`
- **Target branch:** `develop`

## Problem

Vocanova has approved product, architecture, workflow, DevOps, implementation, and AI-native operating-model documents. The executable repository foundation has now been inspected against `develop` at `0211d75f28a4986694555f584dd8b84a3228a2ad` and is confirmed to be only partially established.

Before later agents can implement change packages safely, the repository needs a small, coherent governance and knowledge-system foundation. Without it, implementation may rely on incomplete chat history, ambiguous authority, unprotected agent instructions, inconsistent specifications, or weak evidence.

## Desired outcome

After implementation and closure, the repository has:

- a universal agent instruction contract and an independent Claude review contract;
- truthful repository navigation;
- distinct living-document, decision-record, and change-specification systems;
- a complete reusable `VOC-###` package format;
- deterministic validation of foundation rules;
- protected governance ownership;
- a read-only governance validation workflow;
- an evidence-based path from approved specification to repository-only closure.

No application feature is delivered.

## Users and stakeholders affected

- Founder and CEO.
- ChatGPT as Product Manager, Chief Software Architect, specification author, and impact-analysis advisor.
- Codex as implementation agent.
- Claude as independent implementation reviewer.
- Human developers and reviewers.
- GitHub Actions as deterministic validation infrastructure.

Learners and production users are not directly affected because no runtime behavior changes.

## In scope

1. Create or reconcile `AGENTS.md`, `CLAUDE.md`, root `README.md`, and `CONTRIBUTING.md`.
2. Create or reconcile `docs/README.md`, `docs/decisions/README.md`, and `specs/README.md`.
3. Create complete reusable templates in `specs/templates/change-package/`.
4. Add the approved package in `specs/changes/VOC-001-repository-foundation/`.
5. Create or reconcile `.github/pull_request_template.md`.
6. Create or reconcile `.github/CODEOWNERS`.
7. Create `.github/approved-policy/protected-paths.yaml`.
8. Create a dependency-free Python governance validator and unit tests.
9. Create a minimal read-only `.github/workflows/repository-governance.yml`.
10. Define founder-controlled GitHub team and ruleset activation requirements.
11. Inspect and reconcile existing repository content before modification.
12. Record contradictions instead of resolving them silently.
13. Reconcile legacy documentation README files without migrating Documents `00–14`.
14. Replace the conflicting root `CODEOWNERS` only after `.github/CODEOWNERS` is valid and verified.
15. Update `.github/README.md` to describe the controls introduced by this package.

## Out of scope

1. Migration, rewriting, normalization, summarization, or reconstruction of Documents `00–14`.
2. Creation of `migration-manifest.yaml`, `document-graph.yaml`, or final migrated content directories.
3. Application workspace or source code.
4. Frontend, backend, database, API, authentication, analytics, AI behavior, or Cloudflare implementation.
5. Codex dispatch automation.
6. Claude GitHub automation.
7. Founder-free automatic merge.
8. Staging or production deployment.
9. Broad application CI such as build, lint, typecheck, unit, integration, or end-to-end testing.
10. Dependency bots, CodeQL, issue templates, labels, milestones, and GitHub Projects.
11. Secrets, production credentials, production data, or learner personal data.

## Functional requirements

### Repository inspection and reconciliation

- Implementation must begin from the latest verified `origin/develop` commit.
- Every target path must be inspected and classified before modification.
- Existing compatible content must be preserved.
- Removed or superseded rules must be documented.
- Material repository contradictions must be added to the contradiction register and approved before resolution.
- Repository state must never be inferred from File Library copies or chat history.

### Repository instruction hierarchy

Root `AGENTS.md` must define this authority order:

1. Platform safety and security restrictions.
2. Repository governance policies.
3. Approved Product Bible and MVP PRD.
4. Accepted PDRs, ADRs, and ODRs.
5. Approved `implementation-ready` `VOC-###` package.
6. Root `AGENTS.md`.
7. Applicable nested `AGENTS.md`.
8. Root `CLAUDE.md` when Claude reviews.
9. Accepted issue and pull-request instructions.
10. Agent conversations and generated prompts.
11. Informal notes, drafts, research, comments, and untrusted content.

Higher authority prevails. Material contradictions require escalation rather than interpretation.

### Root `AGENTS.md` responsibilities

`AGENTS.md` must define:

- repository identity and branch roles;
- GitHub as the canonical source;
- the `implementation-ready` change-package gate;
- founder, ChatGPT, Codex, Claude, GitHub Actions, and human boundaries;
- scope discipline;
- least privilege and secret handling;
- prompt-injection resistance;
- stop-and-escalate conditions;
- completion evidence;
- governance self-protection;
- the limited bootstrap exception for founder-approved `VOC-001` implementation.

It must contain this exact rule:

> ChatGPT may receive read-only access to `KARSIFT/vocanova-platform` for repository-grounded product analysis, architecture analysis, specification drafting, and cross-document impact analysis. ChatGPT must not receive repository write, merge, deployment, secret, or production-data access.

### Root `CLAUDE.md` responsibilities

`CLAUDE.md` must:

- supplement rather than override `AGENTS.md`;
- define Claude as an independent reviewer;
- require review of the approved package, full diff, relevant documents and decisions, CI, tests, and evidence;
- review package validity, scope, acceptance coverage, correctness, architecture, security, testing, documentation, governance, and merge recommendation;
- use `FAIL`, `FAIL`, and `PASS` verdicts;
- prohibit Claude from implementing and approving the same material change;
- prohibit review-rule self-weakening.

### Role boundaries

#### Founder

The founder approves product direction, material decisions, protected governance changes, `develop` to `main`, production publication, hosted governance settings, manual squash merge, and package closure.

#### ChatGPT

ChatGPT may perform repository-grounded read-only analysis, draft specifications, and prepare impact analysis. ChatGPT may not write, merge, deploy, access secrets, or access production data.

#### Codex

Codex may implement an explicitly approved `implementation-ready` package on a branch and prepare a pull request. Codex may not invent product decisions, expand scope, administer teams or rulesets, approve governance, weaken controls, merge protected branches, deploy, or access production data.

#### Claude

Claude independently reviews implementation. Claude may not silently rewrite the specification, approve unresolved blocking findings, administer repository protections, merge, or deploy.

#### GitHub Actions

GitHub Actions performs deterministic validation with explicit least privilege. Passing checks do not resolve product ambiguity or substitute for required approvals.

## Knowledge-system requirements

### `docs/`

`docs/` contains living descriptions of the currently approved product, design, architecture, engineering, and operating model. `docs/README.md` must define status and canonical-path conventions without reconstructing Documents `00–14`.

### `docs/decisions/`

`docs/decisions/` contains material decision rationale using:

- `PDR-####` for product decisions;
- `ADR-####` for architecture decisions;
- `ODR-####` for operating decisions.

Accepted records are immutable in meaning. Superseding decisions use new records. `VOC-001` must not manufacture standalone records from earlier documents.

### `specs/`

`specs/` contains bounded executable change packages. Future package directories must use:

```text
specs/changes/VOC-###-lowercase-kebab-case/
```

IDs are never reused. The directory ID, slug, and `change.yaml` values must agree.

## Change-package requirements

Every initial package must contain:

```text
change.yaml
README.md
specification.md
acceptance-criteria.md
impact-analysis.md
implementation-plan.md
tasks.md
test-plan.md
release-plan.md
```

Reduced packages are disabled until a later protected governance decision introduces a safe reduced schema.

### Stable identifiers

Use package-qualified identifiers:

```text
VOC-###-D##
VOC-###-AC-##
VOC-###-T##
VOC-###-R##
VOC-###-CON-##
VOC-###-TEST-##
VOC-###-Q##
VOC-###-EV-##
VOC-###-DEP-##
```

Identifiers must be unique and may not be reused or renumbered after formal review starts.

### Lifecycle states

Approved states are:

```text
draft
proposed
impact-reviewed
approved
implementation-ready
implementing
in-review
accepted
released
closed
blocked
rejected
cancelled
superseded
```

`change.yaml` is the sole machine-readable lifecycle control. A status edit alone does not authorize a transition.

### Definition of Ready

A package may become `implementation-ready` only when:

- all nine files exist and validate;
- identity and canonical path agree;
- scope and non-goals are explicit;
- requirements are observable;
- acceptance criteria are complete and testable;
- impact analysis has no material unknown;
- dependencies and contradictions are resolved;
- risk is correct;
- implementation, test, release, and rollback plans are complete;
- required approvals have repository evidence;
- no material open question or blocking reason remains.

## Governance requirements

### Protected surface

The initial protected governance surface is:

```text
/AGENTS.md
/CLAUDE.md
/.github/**
/tooling/governance/**
/specs/templates/**
/specs/README.md
/docs/decisions/README.md
/docs/README.md
/docs/operations/**
/docs/decisions/operations/**
```

Governance-sensitive changes require an approved package, deterministic validation, independent Claude review, founder approval, and non-automatic merge.

### Anti-self-weakening requirements

No agent or workflow may:

- remove itself from required review;
- reduce required approval;
- remove a protected path;
- make a blocking check optional;
- broaden its own permissions;
- gain secret or production-data access;
- alter validation solely to make its current change pass;
- misclassify governance as ordinary documentation;
- fabricate approval or review provenance.

### Ownership requirements

Protected paths must be owned by:

```text
@m-e-h-r-d-a-a-d
```

The team must be visible, have explicit repository access sufficient for `CODEOWNERS`, include the founder, and exclude automated agent identities from approval authority.

There must not be a repository-wide founder ownership rule that would force founder review for all future `develop` pull requests.

### Pull-request requirements

The pull-request template must request:

- package identity, status, path, and target branch;
- summary, scope, and non-goals;
- acceptance-criteria mapping;
- file reconciliation;
- product and architecture decision disclosure;
- governance impact and previous versus proposed control;
- security and privacy implications;
- exact commands and results;
- documentation and decision-record impact;
- rollback;
- implementer, reviewer, model, and human provenance;
- merge-readiness checklist.

### Governance validator

The validator must:

- run on Python 3.12 using only the standard library;
- perform no network calls and write no repository files;
- validate required files, package identity, schema, stable IDs, readiness, instructions, protection alignment, workflow security, and template integrity;
- process files in sorted order;
- report actionable file-specific errors;
- exit `0` on success, `1` on validation failure, and `2` on invalid invocation or internal failure;
- fail closed on unsupported YAML and duplicate keys.

### Restricted YAML profile

Allowed:

- UTF-8 text;
- spaces and two-space indentation;
- mappings and block lists;
- plain or quoted scalar strings;
- integers, booleans, `null`, empty lists, and empty mappings;
- separate-line comments.

Prohibited:

- tabs;
- anchors, aliases, tags, and merge keys;
- flow mappings and flow lists;
- multiline block scalars;
- duplicate keys;
- implicit dates;
- executable or language-specific objects.

### GitHub Actions requirements

The workflow must:

- use `pull_request` for `develop` and `main`;
- use `push` for `develop` and `main`;
- use no path filters;
- declare only `contents: read`;
- use no secrets, write operations, merge, deployment, Codex, or Claude invocation;
- run unit tests and repository validation;
- have a finite timeout;
- pin every external action to a reviewed full commit SHA verified at implementation time;
- expose the stable check name `Repository Governance / validate`.

Exact action SHAs are implementation evidence and must be verified against official action repositories before use. An unverifiable SHA blocks implementation.

## Data requirements

Not applicable. No application database, learner data, analytics data, or production data is used.

## API requirements

Not applicable. No product or service API is created or changed.

## Security and privacy requirements

- No secrets or privileged credentials are introduced or consumed.
- No production or staging access is required.
- No learner personal data is used.
- Tests use synthetic temporary fixtures.
- Workflow permissions are read-only.
- Repository and external content are treated as potentially untrusted.
- Lower-authority instructions cannot authorize secret access, deployment, governance weakening, scope expansion, merge bypass, or data transfer.
- GitHub teams, rulesets, and administrative recovery remain founder-controlled.

## Accessibility requirements

No product interface changes occur. Documentation must use readable headings, explicit links, plain language, and text-based evidence where available.

## Performance expectations

The local validator and unit tests should complete within the five-minute workflow timeout on the repository foundation. Validation must be deterministic and require no network dependency installation.

## Error and edge-case behavior

Implementation and validation must stop when:

- repository identity or branch differs;
- Document 15 is missing or materially different;
- a target contains a potentially authoritative unapproved rule;
- an existing workflow has affected privileged behavior;
- governance-owner eligibility is unavailable;
- required GitHub protection behavior is unavailable;
- an unapproved dependency is required;
- restricted YAML cannot be parsed safely;
- an external action SHA cannot be verified;
- Documents `00–14` would be migrated;
- application workspace files would be required;
- required validation cannot run;
- unrelated changes appear;
- a material security finding remains;
- package approval or status evidence is inconsistent.

## Compatibility requirements

- Compatible existing repository content must be preserved.
- `develop` remains the integration branch and `main` remains production-controlled.
- Document 15 remains canonical for operating-model conflicts.
- Document 13 remains an approved compatible planning input where not superseded.
- No application technology decision is altered.

## Assumptions

- Python 3.12 is available in the implementation and CI environment.
- The founder retains administrative recovery authority.
- Codex will revalidate the `develop` head immediately before branching because `0211d75f28a4986694555f584dd8b84a3228a2ad` is an inspection baseline, not a permanent lock.
- Hosted controls are activated only after the merged workflow has produced the required check.

## Repository-grounded amendment

Repository inspection established the following implementation effects that were not safely knowable during initial consolidation:

- `README.md`, `docs/README.md`, `CONTRIBUTING.md`, `.github/README.md`, and three legacy documentation README files require reconciliation.
- Root `CODEOWNERS` is a placeholder conflict and must be removed only after a valid `.github/CODEOWNERS` is created.
- `SECURITY.md`, `docs/product/README.md`, and canonical Document 15 are compatible and must be preserved.
- Root `docs/decisions/`, root `specs/`, governance tooling, PR template, `.github/CODEOWNERS`, approved policy, workflows, and the VOC-001 package are absent and must be created.
- No open PR existed at grounding time, but Codex must recheck before implementation.

This amendment changes repository-specific file effects only. It does not expand product scope, migrate approved documents, add application code, automate Claude, enable auto-merge, or deploy anything.

## Open questions and remaining blockers

Repository-file blockers are resolved by the founder authorization recorded in issue
#6 and by direct verified steward routing. Hosted rulesets, required checks, separate
agent identities, and enforcement proofs remain founder-controlled Phase 4 closure
requirements and do not authorize Codex to administer them.

# Approved decision register

The following decisions were approved by the founder on 2026-07-13. Their detailed rationale is reflected throughout this package.

## Authority and evidence

- **VOC-001-D01:** Document 15 governs operating model, repository structure, lifecycle, authority, merge, and governance decisions; Document 13 remains a compatible historical input.
- **VOC-001-D02:** Current repository state must be determined from authorized read-only inspection of `develop`.
- **VOC-001-D03:** Required paths use the approved evidence classifications.
- **VOC-001-D04:** Material unverified items block `implementation-ready`.
- **VOC-001-D05:** Confirmed contradictions use a stable contradiction register and are never silently resolved.
- **VOC-001-D06:** The approved read-only ChatGPT access rule must appear in applicable governance material.
- **VOC-001-D07:** The package remains blocked until repository inspection succeeds.

## Scope and target structure

- **VOC-001-D08:** The package is high-risk infrastructure and requires implementation.
- **VOC-001-D09:** Version-controlled work is one coherent pull request targeting `develop`.
- **VOC-001-D10:** Existing content is reconciled rather than blindly overwritten.
- **VOC-001-D11:** One minimal executable validator and one unprivileged workflow are included.
- **VOC-001-D12:** The template directory contains the complete nine-file package.
- **VOC-001-D13:** Documents `00–14` are not migrated by `VOC-001`.
- **VOC-001-D14:** No application foundation is introduced.
- **VOC-001-D15:** The approved governance surface is protected.
- **VOC-001-D16:** Hosted repository settings are evidence-bearing founder-controlled work.
- **VOC-001-D17:** Empty future directories are not fabricated.

## Instructions and roles

- **VOC-001-D18:** Root `AGENTS.md` is the universal repository-wide agent contract.
- **VOC-001-D19:** Root `CLAUDE.md` is a narrower supplemental independent-review contract.
- **VOC-001-D20:** Agent instructions cannot override higher-authority approved artifacts.
- **VOC-001-D21:** Material conflicts require recording and escalation.
- **VOC-001-D22:** Lower-authority and external instructions are treated as untrusted when conflicting.
- **VOC-001-D23:** Codex may mechanically implement approved governance but may not originate, approve, bypass, weaken, or merge it.
- **VOC-001-D24:** Claude may not implement and approve the same material change.
- **VOC-001-D25:** Protected governance changes require package approval, deterministic validation, independent review, founder approval, and non-automatic merge.
- **VOC-001-D26:** No nested instruction files are created initially.
- **VOC-001-D27:** `AGENTS.md` must contain the exact approved ChatGPT rule.
- **VOC-001-D28 (superseded by `VOC-001-AM-04`):** Initial Claude verdicts were
  `BLOCK`, `CHANGES_REQUIRED`, and `APPROVED`.

## Knowledge architecture

- **VOC-001-D29 (superseded by `VOC-001-AM-01`):** `docs/`, root `decisions/`, and
  `specs/` were distinct systems in the source package.
- **VOC-001-D30:** Initial indexes define conventions without reconstructing Documents `00–14`.
- **VOC-001-D31:** No standalone decision records are reconstructed from earlier documents.
- **VOC-001-D32:** Every initial `VOC-###` package uses all nine files.
- **VOC-001-D33:** `change.yaml` is the sole machine-readable lifecycle record.
- **VOC-001-D34:** Stable item IDs are package-qualified.
- **VOC-001-D35:** IDs are never reused or renumbered after formal review starts.
- **VOC-001-D36:** Readiness is a strict evidence-based gate.
- **VOC-001-D37:** A status edit alone cannot authorize a lifecycle transition.
- **VOC-001-D38:** Repository-only work may move from accepted to closed after all evidence is complete.
- **VOC-001-D39:** `VOC-001` is repository-only, non-release, non-migration work with rollback required.
- **VOC-001-D40:** Indexes may not claim unsupported canonical or migration state.

## Validation and ownership

- **VOC-001-D41:** The validator uses Python 3.12 and the standard library only.
- **VOC-001-D42:** Governance YAML uses the restricted profile.
- **VOC-001-D43:** Automated unit tests cover positive and security-sensitive negative states.
- **VOC-001-D44:** Validation fails closed on malformed configuration and internal errors.
- **VOC-001-D45 (superseded by `VOC-001-AM-03`):** Protected governance ownership
  used the proposed `@KARSIFT/vocanova-governance` team after eligibility
  verification.
- **VOC-001-D46:** Ownership is path-specific, not repository-wide founder ownership.
- **VOC-001-D47:** `/.github/` is self-protected.
- **VOC-001-D48:** Pull requests require package, evidence, governance, security, rollback, and provenance information.
- **VOC-001-D49:** The workflow has only `contents: read` permission.
- **VOC-001-D50:** The workflow uses `pull_request` and `push`, not `pull_request_target`.
- **VOC-001-D51:** External actions are pinned to verified immutable full commit SHAs.
- **VOC-001-D52:** The stable required check is `Repository Governance / validate`.
- **VOC-001-D53:** The governance workflow has no path filtering.
- **VOC-001-D54:** Team and ruleset administration are founder-controlled.
- **VOC-001-D55 (superseded by `VOC-001-AM-04`):** The source package proposed a
  bootstrap exception for `VOC-001`.
- **VOC-001-D56:** Closure requires a post-merge proof of the controls.

## Risk, security, rollback, and evidence

- **VOC-001-D57:** Overall risk is high.
- **VOC-001-D58:** There is no production, runtime, learner-data, staging, or production-deployment impact.
- **VOC-001-D59:** All eight blocking dependencies must resolve before readiness.
- **VOC-001-D60:** File Library copies establish approved intent, not current repository state.
- **VOC-001-D61:** Risks `VOC-001-R01` through `VOC-001-R10` are required.
- **VOC-001-D62:** Implementation requires zero secrets.
- **VOC-001-D63:** Tests use no personal data.
- **VOC-001-D64:** Teams, roles, rulesets, required checks, and recovery remain founder-controlled.
- **VOC-001-D65:** Bootstrap and rollback must be reversible and avoid lockout.
- **VOC-001-D66:** Only the founder may temporarily relax governance for emergency recovery, with reconciliation afterward.
- **VOC-001-D67:** Closure requires evidence `VOC-001-EV-01` through `VOC-001-EV-13` as applicable.
- **VOC-001-D68:** Policy and hosted-settings drift blocks closure.
- **VOC-001-D69:** Completing this package does not automatically authorize application work.

## Acceptance and completion gates

- **VOC-001-D70:** Acceptance criteria are `VOC-001-AC-01` through `VOC-001-AC-28`.
- **VOC-001-D71:** Acceptance IDs are not renumbered.
- **VOC-001-D72:** Repository-evidence criteria are pre-implementation, while the full Definition of Ready still applies.
- **VOC-001-D73:** Merge is not package closure.
- **VOC-001-D74:** Hosted governance requires hosted evidence.
- **VOC-001-D75:** A controlled negative enforcement proof is mandatory.
- **VOC-001-D76:** Criteria, tasks, tests, owners, and evidence are bidirectionally traceable.
- **VOC-001-D77:** Subjective completion statements do not satisfy criteria.
- **VOC-001-D78:** Closure requires all applicable criteria.

## Implementation execution

- **VOC-001-D79:** Implementation uses inspect, implement, validate, and activation phases.
- **VOC-001-D80:** The default branch is `chore/VOC-001-repository-foundation`.
- **VOC-001-D81:** The branch begins from the latest verified `origin/develop` SHA.
- **VOC-001-D82:** Inventory and contradiction analysis precede modification.
- **VOC-001-D83:** Tasks are `VOC-001-T01` through `VOC-001-T24`.
- **VOC-001-D84:** Codex controls repository-file implementation and pull-request preparation only.
- **VOC-001-D85 (superseded in part by `VOC-001-AM-04`):** Founder controlled hosted
  activation, bootstrap merge, proof approval, and closure.
- **VOC-001-D86:** Non-approved Claude verdicts return work to Codex for correction and revalidation.
- **VOC-001-D87:** The preferred merge is squash merge preserving `VOC-001` in history.
- **VOC-001-D88:** Codex does no direct protected-branch work or destructive force operations.
- **VOC-001-D89:** Newly discovered material changes block implementation pending amendment.
- **VOC-001-D90:** The required check is activated only after it passes on merged `develop`.

## Testing and repository-only release

- **VOC-001-D91:** Testing has synthetic, actual-branch, and hosted-enforcement layers.
- **VOC-001-D92:** Tests are `VOC-001-TEST-01` through `VOC-001-TEST-25`.
- **VOC-001-D93:** Negative validator tests use temporary synthetic fixtures.
- **VOC-001-D94:** Unit tests do not replace complete diff inspection.
- **VOC-001-D95:** Hosted controls require hosted proof.
- **VOC-001-D96:** Invalid proof content is closed without merge and the branch is deleted.
- **VOC-001-D97:** A positive proof confirms compliant pull requests can pass.
- **VOC-001-D98:** There is no staging, production, release tag, version, or feature-flag activation.
- **VOC-001-D99:** The only integration target is `develop`.
- **VOC-001-D100:** Required-check activation follows successful merged workflow execution.
- **VOC-001-D101:** Failed hosted enforcement or settings drift blocks closure.
- **VOC-001-D102:** Material corrections require affected deterministic tests and fresh independent review.

## Consolidation and handoff

- **VOC-001-D103:** Initial consolidation remains blocked pending repository evidence.
- **VOC-001-D104:** Consolidation approval authorizes file generation only.
- **VOC-001-D105:** The founder must separately approve the complete consolidated package.
- **VOC-001-D106:** Codex requires separate valid implementation authorization.
- **VOC-001-D107:** Repository-specific claims remain unverified until direct evidence exists.
- **VOC-001-D108:** Evidence-only fields may update without reopening product intent.
- **VOC-001-D109:** Material amendments require founder approval and lifecycle regression.
- **VOC-001-D110:** The approved package-file precedence applies.
- **VOC-001-D111:** All approved decision, acceptance, task, risk, contradiction, test, dependency, and evidence IDs remain stable.
- **VOC-001-D112:** Conversation approval supports preparation but canonical evidence must be stored in GitHub.
- **VOC-001-D113:** Delivery includes nine files and a ZIP preserving the package directory.
- **VOC-001-D114:** Package generation performs no repository implementation action.
- **VOC-001-D115:** A repository-grounded amendment is mandatory before readiness.
- **VOC-001-D116:** The next founder decision after delivery is consolidated-package approval or modification, not implementation execution.
