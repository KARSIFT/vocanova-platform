# Implementation Plan

> **Approved reconciliation:** Execute this plan only with canonical
> `docs/decisions/`, `.github/pull_request_template.md`, direct routing to
> `@m-e-h-r-d-a-a-d`, normal R3/R4 exact-head approval, and hosted controls retained
> as Phase 4 closure. GitHub issue #6 supplies implementation authorization. Any
> conflicting bootstrap or direct-steward step below is historical and superseded
> by `VOC-001-AM-01` through `VOC-001-AM-05`.

## Preconditions

Repository grounding, Document 13 comparison, Document 15 verification, founder package approval, and the manual Claude review path are complete.

Implementation began only after the founder approved the reconciled package and
explicitly authorized Codex in GitHub issue #6. Direct routing to verified account
`@m-e-h-r-d-a-a-d` resolves the repository ownership prerequisite. The branch starts
at `0211d75f28a4986694555f584dd8b84a3228a2ad`, and `change.yaml.status` is
`implementing`. Hosted protection and identity-separation work remains Phase 4 and
does not authorize Codex to administer repository settings.

## Technical approach

Use a four-phase approach:

```text
Phase 1 — Inspect and reconcile
Phase 2 — Implement repository artifacts
Phase 3 — Validate, independently review, and merge
Phase 4 — Activate hosted governance and close
```

Codex performs repository-file work and pull-request preparation. Claude independently reviews. The founder controls hosted GitHub administration, manual squash merge approval, enforcement activation, and closure.

## Files and components affected

Target version-controlled paths:

```text
AGENTS.md
CLAUDE.md
README.md
CONTRIBUTING.md
CODEOWNERS
docs/README.md
docs/architecture/README.md
docs/planning/README.md
docs/decisions/README.md
docs/decisions/README.md
specs/README.md
specs/templates/change-package/change.yaml
specs/templates/change-package/README.md
specs/templates/change-package/specification.md
specs/templates/change-package/acceptance-criteria.md
specs/templates/change-package/impact-analysis.md
specs/templates/change-package/implementation-plan.md
specs/templates/change-package/tasks.md
specs/templates/change-package/test-plan.md
specs/templates/change-package/release-plan.md
specs/changes/VOC-001-repository-foundation/change.yaml
specs/changes/VOC-001-repository-foundation/README.md
specs/changes/VOC-001-repository-foundation/specification.md
specs/changes/VOC-001-repository-foundation/acceptance-criteria.md
specs/changes/VOC-001-repository-foundation/impact-analysis.md
specs/changes/VOC-001-repository-foundation/implementation-plan.md
specs/changes/VOC-001-repository-foundation/tasks.md
specs/changes/VOC-001-repository-foundation/test-plan.md
specs/changes/VOC-001-repository-foundation/release-plan.md
tooling/governance/validate_repository_foundation.py
tooling/governance/tests/test_validate_repository_foundation.py
.github/README.md
.github/pull_request_template.md
.github/CODEOWNERS
.github/approved-policy/protected-paths.yaml
.github/workflows/repository-governance.yml
```

Existing files must be reconciled; the list is not permission to overwrite compatible content.


## Repository-grounded file-effect map

Baseline: `0211d75f28a4986694555f584dd8b84a3228a2ad` on `develop`.

### Create

```text
AGENTS.md
CLAUDE.md
docs/decisions/README.md
specs/README.md
specs/templates/change-package/change.yaml
specs/templates/change-package/README.md
specs/templates/change-package/specification.md
specs/templates/change-package/acceptance-criteria.md
specs/templates/change-package/impact-analysis.md
specs/templates/change-package/implementation-plan.md
specs/templates/change-package/tasks.md
specs/templates/change-package/test-plan.md
specs/templates/change-package/release-plan.md
specs/changes/VOC-001-repository-foundation/change.yaml
specs/changes/VOC-001-repository-foundation/README.md
specs/changes/VOC-001-repository-foundation/specification.md
specs/changes/VOC-001-repository-foundation/acceptance-criteria.md
specs/changes/VOC-001-repository-foundation/impact-analysis.md
specs/changes/VOC-001-repository-foundation/implementation-plan.md
specs/changes/VOC-001-repository-foundation/tasks.md
specs/changes/VOC-001-repository-foundation/test-plan.md
specs/changes/VOC-001-repository-foundation/release-plan.md
tooling/governance/validate_repository_foundation.py
tooling/governance/tests/test_validate_repository_foundation.py
.github/pull_request_template.md
.github/CODEOWNERS
.github/approved-policy/protected-paths.yaml
.github/workflows/repository-governance.yml
```

### Modify while preserving compatible content

```text
README.md
CONTRIBUTING.md
docs/README.md
docs/architecture/README.md
docs/planning/README.md
docs/decisions/README.md
.github/README.md
```

### Delete only after replacement verification

```text
CODEOWNERS
```

Deletion is authorized only after `.github/CODEOWNERS` is present, syntactically valid, references the verified direct steward, and is included in the same commit.

### Preserve unchanged

```text
SECURITY.md
docs/product/README.md
docs/operations/15-ai-native-product-and-engineering-operating-model.md
```

### Forbidden in this PR

```text
apps/**
packages/**
infrastructure/**
application dependencies
Documents 00–14 migration
Cloudflare configuration
deployment workflows
production or staging configuration
secrets or personal data
```

## Reconciliation with existing content

Before editing each target:

1. Inspect the current `develop` content and file history.
2. Classify the path as confirmed present, present-needs-change, absent, or conflict.
3. Identify compatible content that must be retained.
4. Identify approved changes required by this package.
5. Record any removed or superseded rule.
6. Stop when a new material contradiction is discovered.
7. Include before-and-after treatment in the pull request.

Do not reconstruct current state from chat history or File Library copies.

## Security controls

- No secrets, credentials, production data, or learner data.
- ChatGPT remains read-only.
- Codex has no administration, bypass, production deployment, secret, or governance-approval authority.
- Claude has review access only and may not implement and approve the same material change.
- The workflow declares only `contents: read`.
- `pull_request_target` is prohibited.
- External actions use verified full commit SHAs.
- The validator performs no network call and writes no repository file.
- Governance files cannot weaken their own controls without protected approval.

## Validation approach

Validation has three layers:

1. Synthetic validator unit tests.
2. Full validation and diff inspection of the actual implementation branch.
3. GitHub-hosted negative and positive enforcement proof after merge.

Exact local commands:

```bash
python3 --version

python3 -m unittest discover \
  -s tooling/governance/tests \
  -p 'test_*.py' \
  -v

python3 tooling/governance/validate_repository_foundation.py \
  --repository-root .

git diff --check
git status --short
```

Final branch inspection:

```bash
git diff --name-status origin/develop...HEAD
git diff --stat origin/develop...HEAD
git diff origin/develop...HEAD
```

## Implementation sequence

# Phase 1 — Inspect and reconcile

### 1. Confirm repository and branches

```bash
git remote -v
git fetch origin --prune
git branch --all
git rev-parse origin/develop
git rev-parse origin/main
git remote show origin
```

Expected repository:

```text
KARSIFT/vocanova-platform
```

Stop if the identity, branch roles, or authenticated permissions differ from the approved assumptions.

### 2. Create the implementation branch

```bash
git switch develop
git pull --ff-only origin develop
git switch -c chore/VOC-001-repository-foundation
git rev-parse HEAD
```

Record the starting SHA as rollback evidence.

### 3. Inventory targets

```bash
find . -maxdepth 4 -type f \
  -not -path './.git/*' \
  -print | sort

git ls-tree -r --name-only HEAD | sort

git log --oneline --decorate --all -- \
  AGENTS.md \
  CLAUDE.md \
  README.md \
  docs \
  decisions \
  specs \
  tooling/governance \
  .github
```

### 4. Verify Documents 13 and 15

- Verify the canonical Document 15 repository file and Amendment A-001.
- Identify the approved Document 13 source used for impact comparison.
- Do not migrate either document.
- Add new contradictions to the register and stop when treatment is not already approved.

### 5. Resolve dependencies and readiness

Record evidence for all eight dependencies. Update only evidence fields and current-state classifications unless a material amendment is approved.

# Phase 2 — Implement repository artifacts

### 6. Reconcile root instructions and README

Create or update `AGENTS.md`, `CLAUDE.md`, and `README.md` according to the approved responsibilities and exact ChatGPT rule.

### 7. Establish knowledge indexes

Create or update `docs/README.md`, `docs/decisions/README.md`, and `specs/README.md`. Define conventions without fabricating migration state.

### 8. Create reusable templates

Create all nine files in `specs/templates/change-package/`. Templates must use safe placeholder values that cannot be mistaken for an approved real package.

### 9. Add the approved package

Add this complete package under `specs/changes/VOC-001-repository-foundation/`. Codex may update verified evidence fields, but not approved scope, decisions, criteria, or security controls.

### 10. Implement the validator

Create `tooling/governance/validate_repository_foundation.py` using Python 3.12 and the standard library only.

The validator checks:

- required foundation artifacts;
- complete template and package artifacts;
- package ID, slug, path, schema, and enums;
- dependency syntax and direct self-reference;
- package-qualified IDs and references;
- readiness blockers and unknown impact;
- exact instruction safeguards;
- protected-path manifest and CODEOWNERS alignment;
- workflow permissions, events, action pins, triggers, timeout, and commands;
- required template headings;
- deterministic, fail-closed behavior.

### 11. Implement unit tests

Create temporary synthetic fixtures covering `VOC-001-TEST-01` through `VOC-001-TEST-16`.

### 12. Add PR, ownership, and workflow controls

Create or reconcile:

```text
.github/README.md
.github/pull_request_template.md
.github/CODEOWNERS
.github/approved-policy/protected-paths.yaml
.github/workflows/repository-governance.yml
```

The workflow must expose:

```text
Repository Governance / validate
```

It must not automate Codex, Claude, merging, or deployment.

# Phase 3 — Validate, independently review, and merge

### 13. Run local validation

Run all exact commands. Do not open a pull request while any validation fails.

### 14. Audit scope and secrets

```bash
git diff --name-only origin/develop...HEAD | sort

git grep -nE \
  '(BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|api[_-]?key|client[_-]?secret|password)' \
  -- . \
  ':!specs/changes/VOC-001-repository-foundation/**' \
  ':!tooling/governance/tests/**'
```

This grep is supporting evidence, not a complete secret scanner.

Confirm no application, migration, automation, deployment, secret, or data scope leakage.

### 15. Commit and push

```bash
git add \
  AGENTS.md \
  CLAUDE.md \
  README.md \
  docs \
  decisions \
  specs \
  tooling/governance \
  .github

git diff --cached --check
git diff --cached --stat

git commit \
  -m "chore(governance): establish VOC-001 repository foundation"

git push -u origin chore/VOC-001-repository-foundation
```

Open a pull request targeting `develop` and complete the approved template.

### 16. Claude review and correction loop

Claude reviews the package, full diff, test fixtures, workflow security, protected ownership, reconciliation, rollback, and scope.

- `FAIL` or `FAIL`: return to Codex, fix, rerun affected and full required validation, request fresh review.
- `PASS`: proceed only when deterministic checks and founder approval are also present.

### 17. Bootstrap merge

The founder approves and authorizes a squash merge into `develop`. Preserve `VOC-001` in the merge title or body. Do not merge to `main` and do not deploy.

# Phase 4 — Activate hosted governance and close

### 18. Verify merged workflow

Confirm `Repository Governance / validate` passes on the merged `develop` commit before making it required.

### 19. Activate founder-controlled settings

Verify or configure the direct steward, code-owner eligibility, required check, review requirements, stale dismissal, conversation resolution, force-push protection, deletion protection, and bypass restrictions.

### 20. Run hosted enforcement proof

Use temporary branches and pull requests to prove invalid changes fail and compliant changes can pass. Invalid content must never merge.

### 21. Complete evidence and closure

Record all applicable evidence items, verify no policy/settings drift, and obtain founder approval before changing to `closed`.

## Founder-controlled actions

The founder controls:

- approval of the consolidated package;
- implementation authorization;
- read-only repository access for ChatGPT;
- direct steward creation and membership;
- Codex and Claude access boundaries;
- rulesets and branch protections;
- protected governance PR approval;
- manual squash merge authorization;
- emergency recovery;
- package closure.

## Codex-controlled actions

Codex may:

- inspect the checked-out repository;
- create the implementation branch;
- reconcile approved files;
- implement the validator, tests, templates, and workflow;
- run validation;
- push the feature branch;
- open and update the pull request;
- resolve review findings;
- collect implementation evidence.

Codex may not administer teams or rulesets, grant access, add itself as code owner, approve governance, merge, deploy, or access production systems.

## Claude review requirements

Claude must review:

1. Package validity and approval state.
2. Scope compliance.
3. Acceptance-criteria coverage.
4. Correctness and failure behavior.
5. Architecture and operating-model compliance.
6. Security and data boundaries.
7. Validator and negative-test quality.
8. Documentation and traceability.
9. Governance integrity and anti-self-weakening.
10. Merge recommendation.

Every material finding includes ID, severity, location, violated requirement, problem, impact, evidence, required correction, and required validation.

## Stopping conditions

Stop and report a blocker when:

1. Repository identity or branch differs.
2. `develop` is unavailable.
3. Authenticated permissions include unexpected administration or bypass.
4. Document 15 is missing or materially different.
5. A target contains a potentially authoritative unapproved rule.
6. An existing workflow has affected write, secret, merge, or deployment behavior.
7. Governance-team eligibility is unavailable.
8. Required hosted protection is unavailable.
9. An unapproved dependency is required.
10. Restricted YAML cannot be parsed safely.
11. An action SHA cannot be verified.
12. Documents `00–14` would be changed.
13. Application workspace files would be added.
14. A required command cannot run.
15. Unrelated changes are present.
16. A blocking security finding remains.
17. Package status or approval evidence is inconsistent.
18. A newly discovered material change is outside approved scope.

Stopping is correct. Do not guess, silently weaken controls, or continue with partial authority.

## Rollback approach

### Normal rollback

1. Founder disables a newly required check only if it blocks the rollback path.
2. Open a rollback pull request targeting `develop`.
3. Revert the `VOC-001` squash commit.
4. Run the previously valid checks.
5. Restore previous ruleset and ownership settings.
6. Verify a known-safe pull request can proceed.
7. Record evidence and root cause.
8. Mark `VOC-001` blocked or superseded.
9. Use a corrected package before reattempting.

### Emergency recovery

Founder-only administrative action is allowed when the configuration blocks all pull requests, blocks urgent security correction, grants unintended privilege, exposes secrets, or creates an exploitable workflow path.

The founder must preserve evidence, make the smallest change, restore protection promptly, and reconcile through repository history and an incident record.

## Known technical risks

See `VOC-001-R01` through `VOC-001-R10` in `impact-analysis.md`. The highest concerns are self-weakening governance, lockout, false readiness, validator defects, excessive workflow permissions, and policy/settings drift.
