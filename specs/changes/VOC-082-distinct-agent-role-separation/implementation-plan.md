# VOC-082 Implementation Plan

## Preconditions

Do not begin implementation until the plan PR records an independently reviewed exact
candidate SHA, complete R4 plan evidence, adopted status, and
`implementation_authorized: true`. The planner cannot review or adopt its own plan.
Implementation must use a different builder actor, and every final task revision must
be verified by a different cross-model reviewer actor under the pre-VOC-082 governance
self-modification rule.

## Sequence

1. **T00 — Canonical policy and operational guidance.** Create ADR-0005 and reconcile
   active authority, contributor, reviewer, template, and Ruflo documentation. Add one
   valid AI-only worked example and one invalid same-actor relabeling example. Update
   DOC-15/DOC-16 versions and DOC-16 amendment history without rewriting historical
   evidence.
2. **T01 — Deterministic guard and final evidence.** Add narrow foundation-validation
   invariants and negative fixtures, neutralize the synthetic merge-eligibility actor
   labels, prove evaluator/workflow byte identity, run full governance checks, obtain
   exact-SHA review and hosted proof, and rehearse reverse rollback.

## File reconciliation

Before editing, classify every affected path as present-compatible, present-needs-
clarification, absent-approved-to-create, or historical-preserve:

- `ADR-0005` is absent and approved to create only after package adoption.
- Active governance/contributor/template/runbook files need compatible clarification.
- ADR-0004 may receive a non-semantic cross-reference/clarification; its accepted
  Cloudflare/Ruflo decision and evidence remain unchanged.
- `docs/templates/technical-approval-request.md`, historical packages, archived docs,
  transition records, and evidence artifacts are inspect-and-preserve surfaces.

## Canonical wording contract

Use one short normative block across the highest-authority documents and concise
references elsewhere:

- role = responsibility;
- actor = attributable human or separately instantiated AI participant;
- independence = different actor with no authorship of the reviewed exact revision;
- model/provider = optional provenance or evidence hardening, not authority;
- explicit cross-model rules remain scoped evidence requirements;
- reviewer edits create a new builder-authored revision;
- merge actor is non-author and audits exact evidence; and
- action-specific authority is never supplied by reviewer identity or verdict.

Do not duplicate the entire policy in every file. DOC-16 and ADR-0005 are canonical;
operational files link and summarize their applicable rule.

## Deterministic validation design

Extend `validate_repository_foundation.py` only with documentation-consistency markers
for the canonical surfaces and fixture labels. Unit tests mutate disposable repository
copies to prove human-only, vendor-authority, same-actor, self-merge, missing exact-SHA,
and reviewer-as-action-authority regressions fail. Do not modify the merge evaluator,
GitHub adapter, JSON schema, Governance workflow, permissions, or reason codes.

Record hashes or `git diff --exit-code` evidence showing those excluded files are
unchanged from the adopted base. Run the existing pure evaluator/tests to demonstrate
that eligible and blocked fixture decisions remain identical.

## Review and evidence model

The builder supplies completed commands, diffs, hashes, and hosted links. The reviewer
is read-only, independently inspects the exact SHA, and does not duplicate completed
long suites or start background processes. A material finding produces a new SHA and
fresh deterministic and independent review. An authorized non-author merge actor
audits the exact eligibility result; no role may fabricate hosted enforcement.

## Deployment and rollback

There is no release or deployment. Implementation PRs remain stacked, draft until
evidence is complete, and repository-only. Reverse tasks in a disposable worktree,
validate each predecessor, then remove only that exact disposable worktree. Do not
delete open task branches or touch settings, Cloudflare, DNS, secrets, production data,
billing, or live systems.

