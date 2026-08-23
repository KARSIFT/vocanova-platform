# VOC-082 Implementation Plan

## Preconditions

These preconditions governed the completed implementation and were satisfied before T00
began: the plan PR recorded an independently reviewed exact candidate SHA, complete R4
plan evidence, adopted status, and `implementation_authorized: true`. The planner did
not review or adopt its own plan. Implementation used a different builder actor, and
each final task revision received a different cross-model reviewer actor under the
pre-VOC-082 governance self-modification rule.

## Completed Sequence

1. **T00 — Canonical policy and operational guidance.** Completed at exact SHA
   `b1fa02e0b79e11d75e02194988826106aae2939c`, merged by PR #112 as
   `26c16b7b07d55c1910c7fd9711dfb17662a75d8e`. The task created ADR-0005 and reconciled
   DOC-00's product-authority boundary and indexes plus active governance, post-merge
   activation, contributor, reviewer, template, and Ruflo documentation. It replaced
   DOC-00's permanent ChatGPT/Codex/Claude assignments and the checklist's Codex/Claude
   identity requirement with distinct provider-neutral actors, added one valid AI-only
   worked example and one invalid same-actor relabeling example, and updated
   DOC-15/DOC-16 versions plus DOC-16 amendment history without rewriting historical
   evidence or changing product behavior.
2. **T01 — Deterministic guard and final evidence.** Completed at exact SHA
   `9b52963eba5b1dee30e0a63936de2c9ff0b82337`, merged by PR #114 as
   `eb13979a7ad59e5dd1eef0680116b84eeadb059a`. The task added the narrow
   foundation-validation invariants and negative fixtures, neutralized the synthetic
   merge-eligibility actor labels, proved evaluator/workflow byte identity, preserved
   the superseded `aa63cd6811c42b1ac02327fe64b6fdd44bce1235` PASS and the exact-SHA
   FAIL on comment `5385846754`, then received final exact-SHA PASS, hosted proof,
   reverse-order rollback, and post-merge checks.

## File reconciliation

Before editing, classify every affected path as present-compatible, present-needs-
clarification, absent-approved-to-create, or historical-preserve:

- `ADR-0005` is absent and approved to create only after package adoption.
- Active governance/contributor/template/runbook files need compatible clarification.
- The post-merge activation checklist's unchecked Codex/Claude identity requirement,
  DOC-10's Codex sizing example, and the change-specification template's Codex owner
  example are present-needs-reconciliation active guidance.
- DOC-00 §6 is present-needs-reconciliation. Its product vision and founder-controlled
  decisions are present-compatible. `docs/README.md` and `docs/product/README.md` need
  relationship/current-direction synchronization with DOC-00 and ADR-0005; they do not
  create a second authority definition.
- DOC-12's provider-named change-control example is covered by its active v1.2 neutral
  amendment; DOC-09's named Codex/Claude data rule is a restrictive synthetic-data
  permission ceiling. Inspect both and preserve or add only a canonical cross-reference.
- `CLAUDE.md` remains a tool-specific entry point with no exclusive reviewer authority;
  the AGENTS.md ChatGPT clause remains a scoped read-only permission boundary.
- ADR-0004 may receive a non-semantic cross-reference/clarification; its accepted
  Cloudflare/Ruflo decision and evidence remain unchanged.
- `docs/templates/technical-approval-request.md`, the technical-steward appointment,
  historical bootstrap/vendor markers, historical packages, archived docs, transition
  records, and evidence artifacts are inspect-and-preserve surfaces.
- Inventory every DOC-15 named-provider occurrence. Its current amendment and §17 are
  normative; its unreconciled v1.0 examples and decision register remain preserved
  history rather than silently rewritten role authority.

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

There is no release or deployment. The completed implementation remained stacked,
repository-only, and draft until evidence was complete. Reverse tasks in a disposable
worktree, validate each predecessor, then remove only that exact disposable worktree.
Do not delete open task branches or touch settings, Cloudflare, DNS, secrets,
production data, billing, or live systems.
