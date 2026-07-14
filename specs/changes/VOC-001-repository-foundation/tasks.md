# Tasks

> **Approved reconciliation:** Task IDs remain stable. Execute them under
> `VOC-001-AM-01` through `VOC-001-AM-05`: canonical `docs/decisions/`, lowercase PR
> template, direct verified steward routing, normal DOC-16/A-002 R3/R4 approval, and
> Phase 4 hosted closure. GitHub issue #6 authorizes repository-file work.

## Task rules

- Task IDs are stable and must not be renumbered.
- Each task must remain inside the approved scope.
- A checked box requires the stated output and validation evidence.
- Founder-controlled administration is not delegated to Codex.
- A newly discovered material requirement stops work and requires package amendment.

## Repository-grounding task status

- Pre-implementation evidence exists for repository inspection and Document 13/15 comparison at baseline `0211d75f28a4986694555f584dd8b84a3228a2ad`.
- `VOC-001-T06` repository-file prerequisites are resolved; hosted portions of
  `VOC-001-DEP-05` and identity separation remain Phase 4 closure work.
- Codex must repeat repository and branch checks immediately before editing.

# Phase 1 — Inspect and reconcile

## VOC-001-T01 — Confirm repository and branch identity

- **Owner:** Codex
- **Depends on:** None
- **Acceptance criteria:** `VOC-001-AC-01`
- **Output:** Verified repository, remote, branch roles, authenticated identity boundary, and command evidence.

Commands:

```bash
git remote -v
git fetch origin --prune
git branch --all
git rev-parse origin/develop
git rev-parse origin/main
git remote show origin
```

Stop when repository identity, branch existence, branch role, or permissions differ.

## VOC-001-T02 — Create the implementation branch

- **Owner:** Codex
- **Depends on:** `VOC-001-T01`
- **Acceptance criteria:** `VOC-001-AC-27`
- **Output:** `chore/VOC-001-repository-foundation` from the latest verified `origin/develop`, with starting SHA recorded.

```bash
git switch develop
git pull --ff-only origin develop
git switch -c chore/VOC-001-repository-foundation
git rev-parse HEAD
```

## VOC-001-T03 — Inventory required repository paths

- **Owner:** Codex
- **Depends on:** `VOC-001-T02`
- **Acceptance criteria:** `VOC-001-AC-01`, `VOC-001-AC-02`
- **Output:** Classified target-path inventory and relevant history.

```bash
find . -maxdepth 4 -type f \
  -not -path './.git/*' \
  -print | sort

git ls-tree -r --name-only HEAD | sort

git log --oneline --decorate --all -- \
  AGENTS.md CLAUDE.md README.md docs decisions specs tooling/governance .github
```

## VOC-001-T04 — Verify Documents 13 and 15

- **Owner:** Codex with ChatGPT analysis
- **Depends on:** `VOC-001-T03`
- **Acceptance criteria:** `VOC-001-AC-03`, `VOC-001-AC-05`
- **Output:** Verified Document 15 repository identity, approved Document 13 comparison source, and evidence references.

Do not recreate or migrate either document.

## VOC-001-T05 — Update the contradiction register

- **Owner:** ChatGPT analysis; Codex evidence; Founder decision
- **Depends on:** `VOC-001-T04`
- **Acceptance criteria:** `VOC-001-AC-03`
- **Output:** Confirmed contradiction entries with stable IDs, authority, treatment, affected files, approval, and evidence.

Stop when a new material contradiction lacks an approved treatment.

## VOC-001-T06 — Verify implementation dependencies

- **Owner:** Founder and assigned evidence owners
- **Depends on:** `VOC-001-T03`, `VOC-001-T04`, `VOC-001-T05`
- **Acceptance criteria:** `VOC-001-AC-04`, `VOC-001-AC-23`
- **Output:** Resolution evidence for `VOC-001-DEP-01` through `VOC-001-DEP-08`, cleared blockers, and valid readiness status.

# Phase 2 — Implement repository artifacts

## VOC-001-T07 — Reconcile root repository documents

- **Owner:** Codex
- **Depends on:** `VOC-001-T06`
- **Acceptance criteria:** `VOC-001-AC-06`, `VOC-001-AC-07`, `VOC-001-AC-08`, `VOC-001-AC-09`, `VOC-001-AC-15`
- **Output:** Approved content in `AGENTS.md`, `CLAUDE.md`, `README.md`, and `CONTRIBUTING.md`, with reconciliation notes.

## VOC-001-T08 — Establish the knowledge indexes

- **Owner:** Codex
- **Depends on:** `VOC-001-T06`
- **Acceptance criteria:** `VOC-001-AC-10`, `VOC-001-AC-11`
- **Output:** Truthful `docs/README.md`, `docs/decisions/README.md`, and `specs/README.md`, plus transition notices in legacy `docs/architecture/README.md`, `docs/planning/README.md`, and `docs/decisions/README.md`, with no fabricated migration state.

## VOC-001-T09 — Create reusable change-package templates

- **Owner:** Codex
- **Depends on:** `VOC-001-T06`
- **Acceptance criteria:** `VOC-001-AC-12`, `VOC-001-AC-14`
- **Output:** Complete nine-file template directory with safe placeholders and required sections.

## VOC-001-T10 — Add the approved VOC-001 package

- **Owner:** Codex
- **Depends on:** `VOC-001-T06`
- **Acceptance criteria:** `VOC-001-AC-13`, `VOC-001-AC-14`
- **Output:** The founder-approved package at its canonical repository path.

Codex may update verified evidence fields and references but may not alter approved scope, decisions, criteria, authority, or security requirements.

## VOC-001-T11 — Implement the governance validator

- **Owner:** Codex
- **Depends on:** `VOC-001-T07`, `VOC-001-T08`, `VOC-001-T09`, `VOC-001-T10`
- **Acceptance criteria:** `VOC-001-AC-07`, `VOC-001-AC-08`, `VOC-001-AC-12`, `VOC-001-AC-13`, `VOC-001-AC-14`, `VOC-001-AC-16`, `VOC-001-AC-22`
- **Output:** Dependency-free `tooling/governance/validate_repository_foundation.py` implementing only approved rules.

## VOC-001-T12 — Implement validator unit tests

- **Owner:** Codex
- **Depends on:** `VOC-001-T11`
- **Acceptance criteria:** `VOC-001-AC-12`, `VOC-001-AC-14`, `VOC-001-AC-17`, `VOC-001-AC-22`
- **Output:** Synthetic fixture suite covering `VOC-001-TEST-01` through `VOC-001-TEST-16`.

## VOC-001-T13 — Add pull-request and ownership controls

- **Owner:** Codex
- **Depends on:** `VOC-001-T06`
- **Acceptance criteria:** `VOC-001-AC-21`, `VOC-001-AC-22`
- **Output:** Reconciled PR template, `.github/CODEOWNERS`, protected-path manifest, updated `.github/README.md`, and removal of the stale root `CODEOWNERS` after replacement verification.

Do not treat a team name in `CODEOWNERS` as proof that the team exists or is eligible. Do not remove root `CODEOWNERS` until `.github/CODEOWNERS` is valid in the same staged change.

## VOC-001-T14 — Add the repository-governance workflow

- **Owner:** Codex
- **Depends on:** `VOC-001-T11`, `VOC-001-T12`, `VOC-001-T13`
- **Acceptance criteria:** `VOC-001-AC-19`, `VOC-001-AC-20`
- **Output:** Read-only `.github/workflows/repository-governance.yml` with verified immutable action pins and stable check name.

No Codex, Claude, merge, deploy, secret, or application CI behavior is permitted.

# Phase 3 — Validate, review, and merge

## VOC-001-T15 — Run local validation

- **Owner:** Codex
- **Depends on:** `VOC-001-T07` through `VOC-001-T14`
- **Acceptance criteria:** `VOC-001-AC-18`
- **Output:** Passing command output and clean intended diff evidence.

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

## VOC-001-T16 — Perform scope and security audit

- **Owner:** Codex
- **Depends on:** `VOC-001-T15`
- **Acceptance criteria:** `VOC-001-AC-11`, `VOC-001-AC-20`, `VOC-001-AC-28`
- **Output:** Complete diff inspection confirming no application, migration, later automation, deployment, secret, or data leakage.

```bash
git diff --name-only origin/develop...HEAD | sort
git diff --stat origin/develop...HEAD
git diff origin/develop...HEAD
```

## VOC-001-T17 — Commit, push, and open the pull request

- **Owner:** Codex
- **Depends on:** `VOC-001-T15`, `VOC-001-T16`
- **Acceptance criteria:** `VOC-001-AC-21`
- **Output:** Feature-branch commit and completed pull request targeting `develop`.

```bash
git add -A -- AGENTS.md CLAUDE.md README.md CONTRIBUTING.md CODEOWNERS docs decisions specs tooling/governance .github
git diff --cached --check
git diff --cached --stat
git commit -m "chore(governance): establish VOC-001 repository foundation"
git push -u origin chore/VOC-001-repository-foundation
```

No merge is authorized.

## VOC-001-T18 — Perform independent Claude review

- **Owner:** Claude
- **Depends on:** `VOC-001-T17`
- **Acceptance criteria:** `VOC-001-AC-02`, `VOC-001-AC-09`, `VOC-001-AC-15`, `VOC-001-AC-19`, `VOC-001-AC-20`, `VOC-001-AC-26`
- **Output:** Structured review verdict with findings and evidence.

## VOC-001-T19 — Resolve review findings

- **Owner:** Codex
- **Depends on:** `VOC-001-T18` when verdict is not `PASS`
- **Acceptance criteria:** `VOC-001-AC-26`
- **Output:** Finding-linked corrections, complete revalidation, and fresh independent review.

Codex must not hide a valid finding by weakening the specification or validator.

## VOC-001-T20 — Founder approval and manual squash merge

- **Owner:** Founder
- **Depends on:** `VOC-001-T18`, `VOC-001-T19` when applicable
- **Acceptance criteria:** `VOC-001-AC-26`, `VOC-001-AC-27`
- **Output:** Founder approval and authorized squash merge into `develop`, preserving `VOC-001` in history.

No merge to `main` and no deployment occurs.

# Phase 4 — Activate hosted governance and close

## VOC-001-T21 — Verify the merged workflow

- **Owner:** Founder with Codex evidence support
- **Depends on:** `VOC-001-T20`
- **Acceptance criteria:** `VOC-001-AC-19`, `VOC-001-AC-28`
- **Output:** Successful `Repository Governance / validate` run on the merged `develop` commit.

Do not activate the check as required while it is failing or absent.

## VOC-001-T22 — Activate governance-owner and ruleset settings

- **Owner:** Founder
- **Depends on:** `VOC-001-T21`
- **Acceptance criteria:** `VOC-001-AC-23`, `VOC-001-AC-24`
- **Output:** Evidence of team eligibility and hosted branch/ruleset controls matching approved policy.

Codex may not perform this task with administrative access.

## VOC-001-T23 — Run the enforcement proof

- **Owner:** Founder with Codex implementation support
- **Depends on:** `VOC-001-T22`
- **Acceptance criteria:** `VOC-001-AC-25`
- **Output:** Negative and positive proof pull requests showing failure blocking, protected review, conversation blocking, and compliant success.

Invalid content must not merge. Delete proof branches after evidence is recorded.

## VOC-001-T24 — Complete closure evidence

- **Owner:** ChatGPT prepares evidence summary; Founder approves closure
- **Depends on:** `VOC-001-T21`, `VOC-001-T22`, `VOC-001-T23`
- **Acceptance criteria:** `VOC-001-AC-27`, `VOC-001-AC-28`
- **Output:** Complete evidence register, no unresolved blockers or drift, and founder-approved transition to `closed`.

Completion does not authorize application development without a later approved package.

# Dependency graph

```text
T01
 └─ T02
     └─ T03
         ├─ T04
         │   └─ T05
         └──── T06
               ├─ T07
               ├─ T08
               ├─ T09
               ├─ T10
               ├─ T13
               └─ T11
                   └─ T12
                       └─ T14
                           └─ T15
                               └─ T16
                                   └─ T17
                                       └─ T18
                                           └─ T19 when required
                                               └─ T20
                                                   └─ T21
                                                       └─ T22
                                                           └─ T23
                                                               └─ T24
```
