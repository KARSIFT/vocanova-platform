# Acceptance Criteria

> **Approved reconciliation:** GitHub issue #6 authorizes implementation from
> `0211d75f28a4986694555f584dd8b84a3228a2ad`. Amendments `VOC-001-AM-01` through
> `VOC-001-AM-05` in `specification.md` supersede root `decisions/`, the uppercase PR
> template, the unverified governance team, the expired bootstrap model, legacy
> Claude verdicts, and hosted controls as implementation blockers. Original criteria
> IDs remain unchanged; hosted criteria remain closure work.

## Use of this file

- Criteria IDs are stable and must not be renumbered.
- Each criterion must map to an owner, one or more tasks, a verification procedure, and evidence where specified.
- Subjective statements such as “looks correct,” “configured,” or “works” do not satisfy a criterion.
- `VOC-001-AC-01` through `VOC-001-AC-05` are repository-evidence gates required before implementation readiness.
- All applicable criteria must pass before package closure.

# Gate A — Repository evidence and implementation readiness

## Repository-grounding evidence snapshot

As of 2026-07-14, `VOC-001-AC-01` through `VOC-001-AC-05` have repository-file
implementation evidence at `0211d75f28a4986694555f584dd8b84a3228a2ad` and issue
#6. Hosted portions of `VOC-001-DEP-05` and identity separation remain closure work,
not readiness blockers. Codex revalidated all baseline facts before editing.


## VOC-001-AC-01 — Current repository state is inspected

**Requirement source:** `VOC-001-D02`, `VOC-001-D03`, `VOC-001-D04`
**Verification method:** Inspection
**Owner:** ChatGPT analysis with Codex evidence collection
**Tasks:** `VOC-001-T01`, `VOC-001-T03`

Given authorized read-only access to `KARSIFT/vocanova-platform`, when the `develop` branch is inspected, every target path must be classified as exactly one of:

```text
confirmed-present
confirmed-present-needs-change
confirmed-absent
confirmed-conflict
```

No material target path may remain `unverified`.

**Required evidence:** `VOC-001-EV-01`

## VOC-001-AC-02 — Existing content is reconciled

**Requirement source:** `VOC-001-D10`, `VOC-001-D82`
**Verification method:** Inspection
**Owner:** Codex
**Tasks:** `VOC-001-T03`, `VOC-001-T07` through `VOC-001-T14`, `VOC-001-T18`

For every target file that existed before implementation:

- compatible content is preserved;
- required modifications are identified;
- removed or superseded rules are listed;
- unrelated content is not overwritten;
- the pull request explains the before-and-after treatment.

**Required evidence:** `VOC-001-EV-04`

## VOC-001-AC-03 — Contradictions are explicitly resolved

**Requirement source:** `VOC-001-D05`, `VOC-001-D21`, `VOC-001-D89`
**Verification method:** Inspection
**Owner:** Founder decision, ChatGPT analysis, Codex evidence
**Tasks:** `VOC-001-T04`, `VOC-001-T05`

Every confirmed contradiction between the current repository, Document 13, Document 15, and this package must have:

- a stable contradiction ID;
- both sources;
- the higher-authority source;
- affected files or controls;
- a proposed treatment;
- founder approval;
- resolution evidence.

No material contradiction may be resolved silently or remain unresolved at readiness.

**Required evidence:** `VOC-001-EV-02`

## VOC-001-AC-04 — Blocking dependencies are resolved

**Requirement source:** `VOC-001-D04`, `VOC-001-D36`, `VOC-001-D59`
**Verification method:** Mixed
**Owner:** Founder, ChatGPT, Codex, Claude as assigned
**Tasks:** `VOC-001-T06`

All dependencies `VOC-001-DEP-01` through `VOC-001-DEP-08` must be resolved with evidence before `change.yaml` can use:

```yaml
status: implementation-ready
```

The validator must reject `implementation-ready` while any blocking dependency, material unknown, or blocking reason remains.

## VOC-001-AC-05 — Canonical Document 15 is verified

**Requirement source:** `VOC-001-D01`, `VOC-001-D02`, `VOC-001-D60`
**Verification method:** Inspection
**Owner:** ChatGPT and Codex
**Tasks:** `VOC-001-T04`

The repository must contain and identify the approved operating model at:

```text
docs/operations/15-ai-native-product-and-engineering-operating-model.md
```

Its identity must be consistent with `DOC-15`, Version `1.0`, approved status, and Amendment `A-001`. `VOC-001` must not recreate the document from chat history or an incomplete source.

# Gate B — Repository and knowledge-system foundation

## VOC-001-AC-06 — Required root instructions exist

**Requirement source:** `VOC-001-D18`, `VOC-001-D19`
**Verification method:** Automated and inspection
**Owner:** Codex
**Tasks:** `VOC-001-T07`

The repository contains:

```text
AGENTS.md
CLAUDE.md
README.md
```

Each file implements the responsibilities approved in this package.

## VOC-001-AC-07 — ChatGPT access boundary is exact

**Requirement source:** `VOC-001-D06`, `VOC-001-D27`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T07`, `VOC-001-T11`, `VOC-001-T12`

`AGENTS.md` contains this exact rule:

> ChatGPT may receive read-only access to `KARSIFT/vocanova-platform` for repository-grounded product analysis, architecture analysis, specification drafting, and cross-document impact analysis. ChatGPT must not receive repository write, merge, deployment, secret, or production-data access.

Validation fails if the rule is absent, materially weakened, or contradicted by root instructions.

## VOC-001-AC-08 — Repository instruction hierarchy is defined

**Requirement source:** `VOC-001-D18`, `VOC-001-D20`, `VOC-001-D21`, `VOC-001-D22`
**Verification method:** Automated and inspection
**Owner:** Codex
**Tasks:** `VOC-001-T07`, `VOC-001-T11`

`AGENTS.md` defines:

- the approved authority hierarchy;
- GitHub as the canonical source;
- the valid change-package gate;
- role boundaries;
- scope discipline;
- stop-and-escalate conditions;
- security boundaries;
- completion-evidence requirements.

Lower-authority instructions cannot override approved governance or specifications.

## VOC-001-AC-09 — Claude review contract is independent

**Requirement source:** `VOC-001-D19`, `VOC-001-D24`, `VOC-001-D28`
**Verification method:** Automated and inspection
**Owner:** Codex, reviewed by Claude
**Tasks:** `VOC-001-T07`, `VOC-001-T18`

`CLAUDE.md`:

- states that it supplements `AGENTS.md`;
- defines required review inputs and order;
- uses `FAIL`, `FAIL`, and `PASS`;
- prohibits Claude from implementing and approving the same material change;
- prohibits weakening its own review controls.

## VOC-001-AC-10 — Knowledge-system indexes exist

**Requirement source:** `VOC-001-D29`
**Verification method:** Automated and inspection
**Owner:** Codex
**Tasks:** `VOC-001-T08`

The repository contains:

```text
docs/README.md
docs/decisions/README.md
specs/README.md
```

The indexes distinguish:

```text
docs/       current approved state
docs/decisions/  material decision rationale
specs/      approved bounded executable changes
```

## VOC-001-AC-11 — Indexes do not fabricate migration state

**Requirement source:** `VOC-001-D13`, `VOC-001-D30`, `VOC-001-D31`, `VOC-001-D40`
**Verification method:** Automated and inspection
**Owner:** Codex
**Tasks:** `VOC-001-T08`, `VOC-001-T16`

The indexes do not claim that Documents `00–14` were migrated, normalized, summarized, assigned verified final paths, or converted into standalone decisions. They reserve preservation-first migration for `VOC-003`.

## VOC-001-AC-12 — Reusable package templates are complete

**Requirement source:** `VOC-001-D12`, `VOC-001-D32`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T09`, `VOC-001-T11`, `VOC-001-T12`

`specs/templates/change-package/` contains exactly the required template artifacts:

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

Each template includes all required sections. Additional explanatory files require explicit approval and may not replace a required artifact.

## VOC-001-AC-13 — The complete VOC-001 package exists

**Requirement source:** `VOC-001-D09`, `VOC-001-D32`, `VOC-001-D113`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T10`, `VOC-001-T11`

The canonical package exists at:

```text
specs/changes/VOC-001-repository-foundation/
```

It contains all nine required files, and the actual path agrees with `change.yaml`.

## VOC-001-AC-14 — Package schema and stable identifiers are valid

**Requirement source:** `VOC-001-D33` through `VOC-001-D37`, `VOC-001-D42`, `VOC-001-D44`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T09` through `VOC-001-T12`

The validator confirms:

- all required `change.yaml` fields and nested fields exist;
- enums are valid;
- `id`, `slug`, directory name, and `canonical_path` agree;
- dependency entries are valid, unique, and not self-referential;
- package-qualified identifiers are valid and unique;
- referenced criteria and tasks exist;
- unsupported YAML and duplicate keys fail closed.

## VOC-001-AC-15 — Root README is truthful and navigable

**Requirement source:** `VOC-001-D10`, `VOC-001-D40`
**Verification method:** Inspection
**Owner:** Codex
**Tasks:** `VOC-001-T07`, `VOC-001-T18`

Root `README.md` and reconciled contribution/navigation files identify:

- Vocanova and repository ownership;
- `develop` and `main` roles;
- GitHub as canonical;
- current repository phase;
- the three knowledge systems;
- Document 15;
- the `VOC-###` workflow;
- the absence of application feature implementation in `VOC-001`;
- the approved `chore/` branch use for governance and maintenance;
- legacy documentation directories as transitional rather than canonical.

They do not present planned infrastructure or migrated documents as completed.

# Gate C — Deterministic validation and workflow security

## VOC-001-AC-16 — Governance validator exists and is dependency-free

**Requirement source:** `VOC-001-D11`, `VOC-001-D41`, `VOC-001-D44`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T11`

The repository contains:

```text
tooling/governance/validate_repository_foundation.py
```

The validator:

- supports Python 3.12;
- uses only the standard library;
- performs no network calls;
- writes no repository files;
- processes files deterministically;
- uses exit codes `0`, `1`, and `2` as approved;
- reports actionable file-specific failures.

## VOC-001-AC-17 — Validator unit tests cover required failures

**Requirement source:** `VOC-001-D43`, `VOC-001-D91`, `VOC-001-D93`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T12`

The unit-test suite covers valid foundations and the approved negative cases, including missing files, malformed identity, duplicate IDs, invalid lifecycle, false readiness, unknown impact, missing protection, excessive workflow permissions, `pull_request_target`, floating action references, missing ChatGPT rule, unsupported YAML, and duplicate YAML keys.

All fixtures are temporary and synthetic.

## VOC-001-AC-18 — Exact local validation passes

**Requirement source:** `VOC-001-D43`, `VOC-001-D76`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T15`

From repository root, these commands succeed:

```bash
python3 --version

python3 -m unittest discover \
  -s tooling/governance/tests \
  -p 'test_*.py' \
  -v

python3 tooling/governance/validate_repository_foundation.py \
  --repository-root .

git diff --check
```

Python is compatible, tests pass, the validator exits `0`, and `git diff --check` reports no error.

**Required evidence:** `VOC-001-EV-03`

## VOC-001-AC-19 — Governance workflow is read-only and deterministic

**Requirement source:** `VOC-001-D49` through `VOC-001-D53`
**Verification method:** Automated and inspection
**Owner:** Codex, reviewed by Claude
**Tasks:** `VOC-001-T14`, `VOC-001-T18`, `VOC-001-T21`

`.github/workflows/repository-governance.yml`:

- runs on pull requests targeting `develop` and `main`;
- runs on pushes to `develop` and `main`;
- has no path filter;
- declares only `contents: read`;
- uses no secrets, deployment, merge, Codex, or Claude action;
- does not use `pull_request_target`;
- pins external actions to reviewed full commit SHAs;
- has a finite timeout;
- runs unit tests and repository validation;
- produces `Repository Governance / validate`.

## VOC-001-AC-20 — No sensitive data or privileged access is introduced

**Requirement source:** `VOC-001-D58`, `VOC-001-D62`, `VOC-001-D63`
**Verification method:** Inspection
**Owner:** Codex and Claude
**Tasks:** `VOC-001-T14`, `VOC-001-T16`, `VOC-001-T18`

Implementation introduces no secrets, production or staging credentials, production data, learner personal data, deployment permission, agent repository-administration permission, or workflow write permission.

# Gate D — Pull-request and hosted governance enforcement

## VOC-001-AC-21 — Pull-request template requires traceable evidence

**Requirement source:** `VOC-001-D48`
**Verification method:** Automated and inspection
**Owner:** Codex
**Tasks:** `VOC-001-T13`, `VOC-001-T17`

`.github/pull_request_template.md` requires package linkage, scope, acceptance mapping, file reconciliation, decision disclosure, governance disclosure, security implications, commands and results, documentation impact, rollback, provenance, and merge-readiness evidence.

## VOC-001-AC-22 — Protected paths have consistent ownership

**Requirement source:** `VOC-001-D15`, `VOC-001-D45` through `VOC-001-D47`
**Verification method:** Automated
**Owner:** Codex
**Tasks:** `VOC-001-T13`, `VOC-001-T11`, `VOC-001-T12`

`.github/CODEOWNERS` and `.github/approved-policy/protected-paths.yaml` consistently cover every approved protected path using the approved governance owner. `/.github/` protects the ownership and workflow controls themselves. The stale root `CODEOWNERS` placeholder is absent after the verified replacement is staged.

## VOC-001-AC-23 — Governance owner is operational

**Requirement source:** `VOC-001-D45`, `VOC-001-D54`, `VOC-001-D64`
**Verification method:** Manual inspection
**Owner:** Founder
**Tasks:** `VOC-001-T06`, `VOC-001-T22`

`@m-e-h-r-d-a-a-d`:

- exists;
- is visible;
- has sufficient explicit repository access for `CODEOWNERS`;
- includes the founder;
- excludes Codex, Claude, ChatGPT, workflow bots, and other automation identities from approval authority.

**Required evidence:** `VOC-001-EV-08`

## VOC-001-AC-24 — Repository protections match approved policy

**Requirement source:** `VOC-001-D16`, `VOC-001-D54`, `VOC-001-D68`
**Verification method:** Manual inspection
**Owner:** Founder
**Tasks:** `VOC-001-T22`

Equivalent protection is active for applicable branches:

- pull requests required;
- at least one approving review;
- code-owner review required;
- stale approvals dismissed after material changes;
- conversation resolution required;
- `Repository Governance / validate` required;
- force pushes blocked;
- deletion blocked;
- ordinary actors and agents cannot bypass.

Any unavailable or different mechanism must be documented and approved.

**Required evidence:** `VOC-001-EV-09`

## VOC-001-AC-25 — Negative and positive enforcement are demonstrated

**Requirement source:** `VOC-001-D56`, `VOC-001-D75`, `VOC-001-D95` through `VOC-001-D97`
**Verification method:** Mixed
**Owner:** Founder with Codex support
**Tasks:** `VOC-001-T23`

A controlled proof pull request demonstrates:

- intentionally invalid governance content fails validation;
- the failed check blocks merge;
- a protected path requests governance-owner review;
- an unresolved conversation blocks merge;
- a compliant pull request can satisfy all controls.

Invalid content must not merge into `develop`.

**Required evidence:** `VOC-001-EV-10`, `VOC-001-EV-11`

# Gate E — Review, rollback, scope, and closure

## VOC-001-AC-26 — Independent review and founder approval are recorded

**Requirement source:** `VOC-001-D25`, `VOC-001-D54`, `VOC-001-D86`
**Verification method:** Inspection
**Owner:** Claude and Founder
**Tasks:** `VOC-001-T18`, `VOC-001-T19`, `VOC-001-T20`

Before merge:

- Claude performs an independent structured review;
- no critical, high, or blocking finding remains;
- Claude's verdict is `PASS`;
- the founder approves the protected governance pull request.

**Required evidence:** `VOC-001-EV-05`, `VOC-001-EV-06`

## VOC-001-AC-27 — Rollback is executable

**Requirement source:** `VOC-001-D65`, `VOC-001-D66`
**Verification method:** Inspection and controlled verification
**Owner:** Founder and Codex
**Tasks:** `VOC-001-T02`, `VOC-001-T20`, `VOC-001-T24`

Before merge, the package records:

- the pre-change `develop` commit;
- previous governance settings;
- files and hosted settings changed;
- rollback owner;
- safe reversal order;
- rollback triggers;
- emergency recovery conditions.

Rollback must not depend on a failing workflow or an automated agent retaining elevated authority.

**Required evidence:** `VOC-001-EV-12`

## VOC-001-AC-28 — Scope and closure conditions are satisfied

**Requirement source:** `VOC-001-D13`, `VOC-001-D14`, `VOC-001-D56`, `VOC-001-D67` through `VOC-001-D69`, `VOC-001-D78`
**Verification method:** Mixed
**Owner:** Founder, supported by ChatGPT, Codex, and Claude evidence
**Tasks:** `VOC-001-T16`, `VOC-001-T21` through `VOC-001-T24`

Before `closed`, evidence confirms:

- no application feature or runtime code was introduced;
- no Documents `00–14` were migrated, rewritten, summarized, or reconstructed;
- no Codex automation, Claude automation, auto-merge, staging, or production deployment was implemented;
- the merged `develop` commit passed governance validation;
- hosted settings match version-controlled policy;
- all applicable evidence exists;
- no blocker, material contradiction, critical risk, or required follow-up remains;
- closure does not independently authorize application development.

**Required evidence:** `VOC-001-EV-07`, `VOC-001-EV-13`

# Gate transitions

## Entry into implementation-ready

The package may enter `implementation-ready` only after `VOC-001-AC-01` through `VOC-001-AC-05` and the complete Definition of Ready are satisfied.

## Pull-request acceptance

The implementation pull request may be accepted only after `VOC-001-AC-06` through `VOC-001-AC-23`, `VOC-001-AC-26`, and `VOC-001-AC-27` are satisfied as applicable before merge.

`VOC-001-AC-24` is completed after the workflow exists on `develop` and the founder can activate the required hosted controls.

## Package closure

The package may move to `closed` only after all applicable criteria `VOC-001-AC-01` through `VOC-001-AC-28` pass.
