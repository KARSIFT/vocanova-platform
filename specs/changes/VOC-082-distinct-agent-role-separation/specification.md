# VOC-082 Specification

## 1. Problem statement

Issue #109 demonstrates that the existing phrases “different role,” “different
reviewer,” and “builder cannot merge” can be misread as requiring a human or a named
vendor. That interpretation caused a coordinating builder to hand routine repository
evidence/merge work back to the user even though current governance already permits
human or AI participants and rejects vendor-derived authority.

The clarification must remove that ambiguity without weakening independent review,
adding a vendor hierarchy, changing merge-eligibility semantics, or granting an
external-effect permission.

## 2. Decision

### VOC-082-D00 — Independence is actor- and authorship-based

For one exact revision, role separation is satisfied only by distinct actors with
independent assignments and recorded identities. A human or a separately instantiated
AI agent may be an actor. Merely renaming a role, changing a prompt, or beginning a new
phase inside the same acting identity does not turn self-review into independent review.

The author of a plan cannot independently review or adopt that plan. The builder of an
implementation cannot independently review, approve, or merge that revision. A
non-author merge actor must audit the exact-SHA evidence before merging. No third human
role is required merely because every participant is an AI agent.

A reviewer that materially edits the reviewed revision becomes a builder for the new
revision. Deterministic checks and review must run again, and a different reviewer must
verify the new exact SHA.

Model and provider selection is an evidence-hardening choice, not a source of authority.
The base independence contract does not require different vendors or models. A narrower
risk control may expressly require cross-model evidence—for example the pre-existing
DOC-16 rule for governance self-modification—and that evidence requirement remains
mandatory for its scope. Meeting it strengthens verification; it does not make the
model or provider an accountable authority.

## 3. Functional requirements

### VOC-082-R00 — Canonical terminology

Active governance shall distinguish:

- **role**: the bounded responsibility being performed;
- **actor**: the attributable human or separately instantiated AI participant
  performing that role for a task/revision;
- **identity record**: the stable receipt recorded in GitHub for that actor, role,
  exact revision, and result; and
- **runtime provenance**: optional model/provider/tool metadata used for audit or
  defense in depth, never as authority by itself.

### VOC-082-R01 — Separation invariants

DOC-15, DOC-16, AGENTS.md, the approval matrix, protected-area guidance, and contributor
instructions shall consistently prohibit plan-author self-review/adoption and
implementation-builder self-review/approval/merge. They shall require a distinct
reviewer actor bound to the exact revision and a non-author merge actor that audits the
complete eligibility result. They shall not imply that the merge actor must be human.

The clarification shall not invent a mandatory third actor where current policy permits
one non-author actor to fill more than one compatible role. Any participant still obeys
the permission ceiling and action-specific authority assigned to each role.

### VOC-082-R02 — Separately instantiated AI agents

At least one canonical worked example shall show a coordinator assigning a planner,
builder, reviewer, and merge-audit role to separately instantiated AI agents. The
example shall record distinct actor identities, isolated write ownership, exact SHA,
verdict, blocking-finding state, and the authorized non-author merge action. It shall
also show that the same actor relabeled into another role is invalid.

### VOC-082-R03 — Model/provider neutrality with defense in depth

Active guidance shall say that using another model or provider is allowed operational
hardening but does not grant approval, merge, legal, financial, production, or release
authority. It shall preserve any explicitly applicable cross-model verification
requirement as an evidence control under the pre-change rules and describe local
orchestrator conventions as local execution policy, not canonical authority.

### VOC-082-R04 — Evidence and action authority remain separate

Templates and guidance shall capture actor identity, role, exact reviewed SHA, verdict,
authorship independence, resolved blocking findings, and optional runtime provenance.
They shall state that a technical reviewer verdict or merge-eligibility decision cannot
satisfy a separately defined contract, spending, secret/personal-data, production,
irreversible-mutation, or launch authority hold.

### VOC-082-R05 — Provider-neutral templates and examples

Contributor, pull-request, verification-report, change-package, and external Ruflo
guidance shall use role/actor terminology. Historical vendor-specific evidence may stay
historical. The active eligible/blocked R4 fixtures shall demonstrate that an AI
reviewer identity is valid without changing their logical outcomes.

### VOC-082-R06 — Evaluator semantics stay unchanged

The current evaluator already requires distinct builder/reviewer identity strings,
different roles, exact-head binding, a passing verdict, and resolved blocking findings.
Implementation shall not modify `evaluator.py`, `github_adapter.py`, `schema-v1.json`,
or `governance.yml`. Documentation must disclose that GitHub records declared
provenance and exact evidence but does not cryptographically prove external actor,
model, provider, or session independence.

If implementation finds a real evaluator semantic defect, it shall stop that work and
file a separate issue/package rather than expanding VOC-082.

### VOC-082-R07 — Deterministic clarification guard

Repository governance validation shall fail closed when the core active documents lose
the distinct-actor, AI-participant, model/provider-neutrality, exact-revision,
self-review/self-merge, or action-authority separation markers. Negative fixtures shall
cover human-only wording, vendor-derived authority, same-actor relabeling, and a review
verdict treated as external-effect authority.

## 4. Out of scope

- Changing merge-eligibility schema, evaluator, adapter, permissions, workflow, or
  reason codes.
- Adding automatic merge, an agent dispatcher, repository-local orchestrator, or
  hosted identity attestation.
- Assigning permanent authority to Ruflo, Codex, Claude, ChatGPT, a model family, a
  provider, the founder, or a standing technical steward.
- Weakening exact-revision review, deterministic checks, R4 evidence, EHR, protected
  paths, or action-specific holds.
- Merging any pull request, changing repository settings, deploying, or touching
  Cloudflare, DNS, secrets, billing, production data, or live services.
- Rewriting immutable historical packages or evidence.

## 5. Security, privacy, and compatibility

The change carries no data, authentication, secret, or runtime effect. Identity records
must use non-sensitive participant labels; raw prompts, provider account identifiers,
tokens, or personal data are prohibited. Existing PR evidence remains compatible
because no machine-readable schema changes. Historical records remain truthful under
their then-current terminology.
