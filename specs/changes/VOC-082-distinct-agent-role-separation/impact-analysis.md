# VOC-082 Impact Analysis

## Consequence classification

R4 is mandatory because the planned implementation changes DOC-15, DOC-16, agent
instructions, and governance authority guidance, all assigned an R4 path floor by the
current classifier. Semantically, the decision clarifies existing provider-neutral
separation and grants no new autonomous authority. The pre-VOC-082 rules govern the
transition, including independent cross-model verification and the complete R4
evidence contract.

## Authority and privilege analysis

There is no privilege expansion. The package makes these existing boundaries more
explicit:

- builders still cannot review, approve, or merge their own revisions;
- planners still cannot review or adopt their own plans;
- exact-SHA independent review and resolved findings remain mandatory;
- a material reviewer edit resets reviewer independence for the new revision;
- GitHub Actions and Ruflo receive no write/merge authority;
- identity strings remain declared provenance, not cryptographic attestation; and
- action-specific external-effect authority remains independently required.

The main failure mode is accidental weakening through an overbroad sentence such as
“any second agent is independent.” Mitigation requires authorship, separate instance,
assignment, identity, exact-SHA, and permission-ceiling qualifications plus negative
fixtures.

## Documents and templates

Affected canonical/active surfaces are:

- authority: `AGENTS.md`, DOC-15, DOC-16, approval matrix, risk classification,
  protected areas, repository settings, governance index;
- contributor/reviewer operation: `CONTRIBUTING.md`, `CLAUDE.md`, `.github/README.md`,
  pull-request template, DOC-10, external Ruflo runbook;
- rationale and templates: ADR-0004 clarification, new ADR-0005, decisions index,
  verification/change-specification/change-package templates; and
- deterministic evidence: merge-eligibility README and synthetic R4 fixture identity
  labels, foundation validator, and its unit tests.

`docs/templates/technical-approval-request.md` is inspected but is not expected to
change: it is already explicitly limited to historical/EHR human review. Historical
change packages, archived documents, transition evidence, and generated visual records
remain immutable.

## Evaluator and CI/CD

The pure evaluator already blocks identical builder/reviewer identities and roles,
stale reviews, failed checks, unresolved findings, incomplete R4 evidence, EHR, opt-
out, and action holds. The adapter already states its attribution limitation. No
semantic, schema, permission, reason-code, workflow, or inventory change is needed.
Only explanatory documentation, neutral synthetic participant labels, and governance-
document invariant tests are in scope.

## Security and privacy

The package handles no secret, personal data, production data, or credential. Actor
receipts use non-sensitive stable labels and GitHub evidence URLs. Provider account
names, raw prompts, private payloads, and tokens are excluded. Stronger clarity reduces
the risk of self-review disguised as a role change and the risk of incorrectly treating
a provider as authority.

## Product, runtime, data, accessibility, and analytics

No product behavior, UI, API, Worker, D1 schema, migration, accessibility, analytics,
email, AI-provider runtime, or learner-data path changes. No product suite or browser
test is justified. Governance validation and exact file-inventory checks are
proportionate.

## Dependencies and risks

- `VOC-082-RISK-00`: wording weakens independence by allowing same-actor relabeling.
  Mitigation: explicit invalid example and deterministic markers.
- `VOC-082-RISK-01`: different-model guidance is mistaken for model-derived authority.
  Mitigation: separate base independence, optional hardening, and applicable explicit
  cross-model evidence controls.
- `VOC-082-RISK-02`: ordinary technical review is mistaken for external-effect
  authority. Mitigation: templates and examples keep the gates separate.
- `VOC-082-RISK-03`: docs claim hosted identity enforcement GitHub does not provide.
  Mitigation: preserve declared-provenance limitation and avoid schema claims.
- `VOC-082-RISK-04`: historical provider references are rewritten as current facts.
  Mitigation: update active policy only and preserve immutable history.
- `VOC-082-RISK-05`: a clarification silently changes merge evaluator semantics.
  Mitigation: byte-for-byte protected file inventory and a separate-issue stop rule.

## Rollback and contingency

Each implementation task is independently revertible. Reverse T01 then T00 in a
disposable worktree, run governance validation/classification/diff checks after each
revert, and confirm the exact adopted base tree. A rollback restores the prior ambiguity
but does not affect GitHub settings, merged history, runtime, data, Cloudflare, or a
live system. If semantic consensus cannot be reached, do not adopt or implement; keep
issue #109 open and continue under the pre-VOC-082 text.
