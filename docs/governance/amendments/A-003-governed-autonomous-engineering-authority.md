---
id: A-003
title: Governed Autonomous Engineering Authority
version: 1.0
document_type: governance-amendment
status: approved
owner: founder
canonical_path: docs/governance/amendments/A-003-governed-autonomous-engineering-authority.md

founder_direction_status: approved
formal_founder_approval_status: approved-exact-revision-github-evidence
repository_adoption_status: adopted
effective_activation_status: active

approved_at: 2026-07-17T16:37:38Z
adopted_at: 2026-07-17T16:41:32Z
effective_at: 2026-07-17T16:44:34Z
approved_pr_head_sha: c858ebff3d97da88fea830bc32a74f69f59a9ad2
adopted_develop_sha: 9d5b4bc1d4a72e313b013047601265ee837c34f2
approval_evidence: https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005389067
independent_verification_evidence: https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005293621
repository_adoption_evidence: https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005429197
activation_evidence: https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622

supersedes:
  - id: DOC-16
    scope: standing qualified-human technical-steward approval requirements for R3 protected technical changes
  - id: A-002
    scope: standing qualified-human technical-steward approval requirements for R3 protected technical merges and production releases

related_documents:
  - DOC-15
  - DOC-16
  - DOC-17

related_decisions:
  - A-001
  - A-002
---

# Amendment A-003 — Governed Autonomous Engineering Authority

## 1. Purpose

This amendment updates VocaNova's autonomous-development governance by retiring the requirement for a permanent qualified-human technical steward as a routine approval authority.

After this amendment becomes effective, technical work is governed primarily through:

- deterministic verification;
- independent cross-model verification;
- risk-specific engineering controls;
- least-privilege permissions;
- staged deployment;
- rollback readiness;
- explicit policy boundaries;
- traceability and audit evidence;
- Exceptional Human Review when autonomous confidence is insufficient.

The governing principle is:

> AI performs the work, automated systems verify the work, and the founder is involved only when a genuinely consequential decision requires founder judgment.

Routine technical implementation must not require unnecessary founder or standing human technical approval.

This amendment does not authorize an AI agent, workflow, or automated system to approve its own implementation, waive mandatory controls, expand its own authority, or bypass founder-controlled decisions.

---

## 2. Document Lifecycle

A-003 has three separate governance lifecycle stages.

### 2.1 Formal Founder Approval

Founder direction expressed during planning authorizes preparation of this amendment but is not, by itself, canonical repository approval.

Formal founder approval requires evidence attributable to the configured founder identity and bound to the exact final repository revision being approved.

Until that evidence exists:

```text
formal_founder_approval_status: pending-exact-revision-github-evidence
```

### 2.2 Repository Adoption

A-003 becomes adopted repository governance only when:

1. the final exact revision satisfies the governance rules effective before A-003;
2. all required deterministic validation passes;
3. required independent verification passes;
4. all currently required approval evidence is recorded;
5. the approved revision is merged into the canonical `develop` branch.

Repository adoption does not retroactively validate actions taken before adoption.

### 2.3 Effective Activation

Repository adoption and effective activation are distinct states.

After adoption, A-003 becomes effective only when the post-merge governance validation required for the transition succeeds and the activation evidence is recorded.

During any temporary state where A-003 is adopted but not yet effective, the previously effective authority model continues to govern.

Once effective activation is recorded:

```text
effective_activation_status: active
```

the standing technical-steward approval requirement is retired.

A-003's governance authority becoming effective does not itself activate autonomous production deployment. Production automation has separate technical activation requirements.

---

## 3. Authority and Precedence

A-003 partially supersedes DOC-16 and A-002 only where those documents require standing qualified-human technical-steward approval for R3 protected technical changes.

A-003 specifically supersedes requirements for:

- permanent technical-steward approval for every R3 merge;
- permanent technical-steward approval for every R3 production release;
- automatic blocking of an R3 change solely because a standing human technical steward has not approved it.

All non-conflicting controls from DOC-15, DOC-16, A-001, and A-002 remain in force.

These include:

- founder authority over consequential decisions;
- deterministic verification;
- independent verification;
- risk classification;
- protected branches;
- governed pull requests;
- least-privilege access;
- traceability;
- rollback requirements;
- separation of implementation and verification;
- prohibition of implementation self-approval;
- controlled production deployment;
- emergency controls;
- independent kill switches.

Where A-003 conflicts with the standing technical-steward requirements of DOC-16 or A-002, A-003 takes precedence only after A-003 becomes effectively active.

---

## 4. Engineering Governance Principle

VocaNova uses management by exception.

Routine, reversible, sufficiently verified technical work should proceed autonomously.

The existence of multiple reasonable implementation choices is not itself a reason to involve the founder.

The autonomous system should:

1. retrieve relevant approved product and architecture decisions;
2. use available evidence;
3. prefer simple, stable, secure, and reversible approaches;
4. remain within approved product scope;
5. choose the safest reasonable option within established boundaries;
6. record meaningful decisions and evidence;
7. continue automatically unless an explicit escalation condition is triggered.

Founder or external human involvement is required only when defined policy conditions require human judgment.

---

## 5. Change-Risk Classification

VocaNova retains the independent R0–R4 change-risk classification.

Risk classification and release classification are separate systems.

The effective change risk is the highest applicable assessment resulting from:

- deterministic path-based policy;
- semantic change analysis;
- implementation assessment;
- independent verification;
- security or operational assessment;
- explicit authority escalation.

Risk may be raised whenever new evidence appears.

### R0 — Trivial

Negligible-risk changes without behavioral, security, policy, authority, or release impact.

Examples include:

- typo corrections;
- harmless formatting;
- non-functional documentation corrections;
- safe metadata maintenance.

R0 may use a lightweight workflow where policy explicitly permits it.

### R1 — Low Risk

Routine, reversible changes with limited blast radius.

Examples include:

- small bug fixes;
- minor UI improvements;
- safe implementation refinements;
- ordinary internal maintenance.

R1 may proceed automatically when all applicable gates pass.

### R2 — Moderate Risk

Meaningful product or technical changes requiring stronger validation.

Examples include:

- normal product features;
- significant internal refactoring;
- meaningful behavioral changes;
- moderate cross-component changes.

R2 requires testing and independent verification appropriate to its actual scope.

### R3 — Protected Technical Risk

R3 covers sensitive or high-impact technical areas, including:

- authentication;
- authorization;
- sensitive-data handling;
- database migrations;
- production infrastructure;
- deployment and rollback controls;
- secrets and credential handling;
- security-critical code;
- production data operations;
- billing implementation;
- AI-provider controls;
- significant architecture boundaries;
- repository governance and autonomous-agent authority.

After A-003 becomes effective, R3 does not automatically require approval from a permanent human technical steward.

Instead, R3 requires strengthened risk-specific evidence.

Depending on the change, this may include:

- deeper deterministic testing;
- specialist security checks;
- stronger independent verification;
- migration rehearsal;
- recovery evidence;
- staging validation;
- explicit rollback testing;
- reduced rollout blast radius;
- enhanced monitoring.

An R3 change may proceed autonomously when every applicable mandatory gate passes and no Exceptional Human Review condition exists.

### R4 — Consequential Decision

R4 covers decisions requiring founder authority because they materially affect the company, product direction, users, finances, legal position, user trust, or autonomous-system authority.

Examples include:

- major product-direction changes;
- pricing changes;
- business-model changes;
- material legal commitments;
- material financial commitments outside approved authority;
- sensitive privacy or data-policy changes;
- consequential user-trust decisions;
- initial public launch;
- predefined major launches;
- substantially irreversible business actions;
- material expansion of autonomous-system powers.

R4 decisions require explicit founder approval.

Once an R4 decision is validly approved, its implementation may proceed according to the applicable technical risk and release policies.

---

## 6. Exceptional Human Review

VocaNova introduces:

### EHR — Exceptional Human Review Required

EHR is an escalation condition, not a routine approval layer and not an additional risk class.

EHR applies when autonomous systems and independent AI verification cannot establish sufficient confidence for safe continuation.

Possible triggers include:

- unresolved Critical or High security findings;
- destructive irreversible operations without demonstrated recovery;
- materially conflicting independent technical conclusions on a critical change;
- novel high-risk cryptographic, identity, security, or infrastructure architecture;
- repeated bounded repair-loop failure;
- insufficient evidence for a technically consequential irreversible action;
- an external legal, regulatory, contractual, insurance, or compliance requirement for qualified human review.

When EHR is triggered:

1. the affected operation stops;
2. reversible protective measures may continue;
3. the escalation reason is recorded;
4. suitable qualified human expertise is obtained;
5. the resulting review becomes permanent change evidence.

EHR must not be converted into a standing human approval requirement.

The absence of an EHR trigger means external human technical approval is not required unless another explicit policy independently requires it.

---

## 7. Routine Technical Authority

R0–R2 work may proceed without founder approval when:

- sufficient specification exists for the risk involved;
- required deterministic checks pass;
- required independent verification passes;
- blocking findings are resolved;
- no active EHR condition exists;
- no unresolved R4 decision exists.

After A-003 becomes effective, R3 protected technical work may also proceed without standing technical-steward approval when all strengthened applicable gates pass.

Routine technical decisions should not be escalated merely because multiple acceptable implementation options exist.

---

## 8. Founder Authority

Explicit founder approval is required for R4 consequential decisions.

Founder-controlled areas include:

- major product strategy;
- major product direction;
- pricing;
- business model;
- legal commitments;
- material spending outside approved authority;
- sensitive user-data policy;
- major privacy decisions;
- significant user-trust decisions;
- initial public launch;
- predefined major launches;
- substantially irreversible decisions with major business consequences;
- material expansion of autonomous-system authority.

Founder approval is normally not required for:

- routine implementation choices;
- ordinary architecture decisions within established boundaries;
- ordinary refactoring;
- routine bug fixes;
- normal database implementation work;
- routine infrastructure maintenance;
- safe dependency upgrades;
- normal UI improvements;
- ordinary R0–R2 releases;
- R3 work that passes strengthened controls and does not trigger EHR.

Founder decisions should preferably be requested conversationally through the VocaNova Founder AI.

The durable decision record should preserve:

- the decision requested;
- the evidence and context;
- the recommended decision;
- material alternatives where relevant;
- major risks;
- reversibility;
- the founder's decision;
- the exact affected change, policy, or release version.

---

## 9. AI and Automation Authority Boundaries

No AI agent, worker, verifier, workflow, or automated system may:

- approve its own implementation;
- waive mandatory checks;
- reduce its own required verification;
- grant itself additional privileges;
- expand its own financial authority;
- modify authority policy and rely on the modified policy to authorize the same change;
- fabricate founder approval;
- impersonate founder or qualified-human authority.

Codex or another builder may implement changes but may not independently authorize its own implementation.

Claude or another independent verifier may produce verification evidence and a policy-recognized verification verdict but does not become the founder or a standing human authority.

ChatGPT may coordinate work and route decisions but may not manufacture approval evidence.

Deterministic systems may enforce policy but may not make product, strategic, legal, or business decisions.

---

## 10. Merge Authority

### Merge into `develop`

A change may merge automatically into `develop` when:

- the applicable Change Contract or specification is valid and immutable for the reviewed revision;
- required deterministic checks pass;
- required independent verification passes;
- no blocking finding remains;
- no active EHR condition exists;
- any required founder decision has already been validly recorded;
- repository policy authorizes automatic merge for that change.

R3 requires stronger applicable gates but, after A-003 activation, does not require standing technical-steward approval.

Working branches should normally be short-lived and squash-merged into `develop`.

`develop` remains the integrated development and staging branch.

---

## 11. Promotion to `main`

Production promotion should use an identifiable immutable release candidate.

The release candidate should record at minimum:

- exact source commit;
- included change identifiers;
- exact approved Change Contract versions;
- risk classifications;
- deterministic test evidence;
- independent verification evidence;
- release class;
- deployment strategy;
- rollback reference.

`main` remains the only normal production deployment source.

Direct unverified production deployment remains prohibited.

---

## 12. Release Classes

Release classes are independent from R0–R4 change-risk classifications.

### RL1 — Routine Release

Typical examples include:

- minor bug fixes;
- copy changes;
- minor UI improvements;
- accessibility fixes;
- safe performance improvements;
- routine operational fixes;
- sufficiently safe dependency updates.

RL1 may publish automatically when all applicable gates pass.

### RL2 — Significant Release

Typical examples include:

- normal user-facing features;
- meaningful product improvements;
- significant internal changes;
- moderate technical changes.

RL2 may publish automatically when its stronger verification, staged-rollout, monitoring, and rollback requirements pass.

### RL3 — Protected or Major Release

RL3 identifies releases requiring special release treatment.

Possible examples include:

- the initial public launch;
- predefined major launches;
- releases associated with consequential business changes;
- unusually difficult-to-reverse releases;
- explicitly policy-protected events.

RL3 classification alone does not automatically imply founder approval.

Founder approval is required when:

- the release contains an unresolved R4 decision;
- the release is a predefined founder-controlled RL3 event;
- another explicit protected policy condition requires founder authorization.

An R3 technical change does not automatically create an RL3 release.

Change risk and release class must be evaluated independently.

---

## 13. Production Release Authority

RL1 and RL2 releases may publish automatically when every applicable policy gate passes.

Automated release authority may never override:

- failed mandatory deterministic checks;
- unresolved blocking verification findings;
- active EHR escalation;
- missing required R4 founder approval;
- missing founder approval for a predefined founder-controlled RL3 event;
- another explicit protected release condition;
- missing mandatory rollback capability.

Automation permission is not an obligation to release.

Any gate may hold a release when evidence indicates insufficient safety.

A-003 establishes governance permission for policy-based autonomous release but does not technically activate autonomous production deployment.

---

## 14. Self-Modification and Governance Safety

Changes affecting the autonomous-development system itself require stronger scrutiny.

Protected governance areas include:

- approval policies;
- risk-classification logic;
- release policies;
- protected paths;
- GitHub rulesets;
- CI requirements;
- deployment authority;
- agent permissions;
- credential scopes;
- AI Budget Governor policy;
- Control Plane authorization;
- rollback systems;
- kill switches.

Such changes require:

1. separation between implementation and verification;
2. independent cross-model verification;
3. deterministic policy validation where technically possible;
4. explicit privilege-expansion analysis;
5. preservation of existing protections until replacement protections are proven.

A system must not weaken its own protections and use the weakened protections to authorize the same transition.

A change that materially expands autonomous authority becomes R4.

Examples include:

- granting new production write authority;
- enabling a materially broader autonomous production capability;
- removing mandatory independent verification;
- materially increasing autonomous spending authority;
- materially expanding access to sensitive data;
- weakening founder-controlled decision boundaries.

Such changes require founder approval.

---

## 15. Safe Governance Transition

Governance changes are evaluated under the governance rules effective before the proposed replacement becomes active.

Proposed replacement rules cannot authorize their own adoption.

This rule applies to A-003.

Under the governance presently effective before A-003:

- changing approval or autonomous-agent authority is a protected governance change;
- the change carries an R3 protected technical effect;
- retiring a standing approval authority and materially changing autonomous authority is also an R4 governance decision;
- therefore the adoption revision must satisfy the approval requirements applicable to both R3 and R4 under the previously effective governance.

At the time of the A-003 transition, the recorded founder and qualified human technical steward are the same verified human acting in two explicitly separate capacities.

Accordingly, where the previously effective governance requires both approvals, the exact A-003 adoption revision may use one approval record to evidence both capacities only when that record explicitly:

- identifies the founder capacity;
- identifies the qualified-human technical-steward capacity;
- binds both approvals to the exact reviewed revision.

This requirement exists solely because the governance effective before A-003 governs A-003's own migration.

It is a one-time governance-transition requirement.

It does not establish, preserve, or imply a continuing requirement for routine founder approval or technical-steward approval of future R3 changes.

Once A-003 has been validly adopted and effectively activated, this transitional approval path is exhausted and must not be reused as precedent for subsequent technical work.

---

## 16. Emergency and Incident Authority

The autonomous system may take immediate pre-approved reversible protective actions when delaying action would create greater risk.

Permitted actions may include:

- rolling back to a known-good release;
- pausing or stopping deployment;
- reducing rollout exposure;
- disabling a feature through a feature flag;
- temporarily disabling a malfunctioning integration;
- isolating a compromised credential using an approved runbook;
- pausing autonomous agent execution;
- pausing production deployment.

These protective actions do not require routine founder approval when they remain within approved emergency policy.

---

## 17. Emergency Repair Workflow

After immediate stabilization, the normal governed lifecycle resumes:

```text
Detect
→ Contain
→ Record incident
→ Investigate
→ Create or update Change Contract
→ Implement
→ Deterministic verification
→ Independent verification
→ Release according to policy
→ Monitor
→ Close incident
```

Emergency work may shorten planning but may not permanently remove:

- traceability;
- required testing;
- independent verification;
- risk classification;
- EHR escalation;
- required founder authority.

---

## 18. Irreversible Emergency Actions

Emergency status does not authorize otherwise prohibited irreversible action.

Where an incident appears to require:

- destructive production-data modification;
- permanent deletion without proven recovery;
- consequential privacy decisions;
- extraordinary financial commitments;
- major user-trust decisions;

the system should first use reversible containment where practical.

Any remaining consequential action follows its normal R4 or EHR requirements.

---

## 19. Break-Glass Access

Any future break-glass mechanism must be:

- narrowly scoped;
- time-limited where technically practical;
- fully auditable;
- automatically associated with an incident record;
- reviewed after use;
- unavailable as an ordinary development credential.

Break-glass access must never silently become permanent agent authority.

---

## 20. Spending Authority

Routine autonomous spending may occur only within explicitly approved budgets and limits.

Specific monetary thresholds belong in version-controlled operational policy rather than this amendment.

The system should support:

```text
Within approved operational budget
→ autonomous operation permitted

Approaching warning threshold
→ founder notification

New material recurring commitment
or hard approval threshold exceeded
→ founder decision required
```

Agents may not independently increase their own financial authority.

---

## 21. Retirement of the Standing Technical-Steward Role

The existing qualified-human technical-steward appointment remains part of VocaNova's historical governance and permanent audit evidence.

It must not be deleted or rewritten as though it never existed.

The founder and the recorded technical steward at the time of the A-003 migration are the same verified human acting in two historically distinct governance capacities.

When A-003 becomes effectively active:

- the standing technical-steward role is permanently retired as a routine approval authority;
- ordinary R3 technical work no longer requires standing human technical approval;
- the historic appointment remains preserved solely as governance and audit history;
- the one-time transitional approval used to migrate from the previous governance model is considered exhausted;
- that transitional approval must never be reused as justification for requiring routine founder or technical-steward approval of later R3 changes;
- appropriate qualified external human expertise may still be engaged through EHR when predefined exceptional conditions require it.

EHR remains an exceptional escalation mechanism.

It must not evolve into a replacement standing approval layer or a de facto permanent technical-steward role.

---

## 22. Adoption and Effective Transition

The A-003 transition proceeds in this order:

```text
Founder direction approved
        ↓
Final repository revision prepared
        ↓
Governance effective before A-003 is applied
        ↓
Deterministic governance validation passes
        ↓
Independent verification passes
        ↓
Exact-revision R4 founder approval recorded
        ↓
Exact-revision R3 technical-steward approval recorded
only because the previously effective governance requires it
        ↓
Approved revision merged into develop
        ↓
Repository adoption recorded
        ↓
Post-merge governance validation succeeds
        ↓
Effective activation recorded
        ↓
Standing technical-steward role permanently retired
as a routine approval authority
```

At the time of this one-time transition, the founder and currently recorded qualified human technical steward are the same verified human.

Where the previously effective governance requires both capacities, one exact-revision GitHub approval may satisfy both only when the approval expressly identifies both capacities and binds both to the exact reviewed revision.

This approval requirement belongs exclusively to the migration from the pre-A-003 governance model.

A-003 does not authorize its own adoption.

After valid effective activation:

- subsequent changes are governed by A-003;
- routine R3 changes do not require standing technical-steward approval;
- routine R3 changes do not require founder approval merely because they are R3;
- the one-time migration approval requirement is permanently exhausted;
- no workflow, policy, reviewer, or later interpretation may revive that migration requirement as a routine approval rule.

Founder approval remains required only where A-003 independently requires it, including genuinely consequential R4 decisions, predefined founder-controlled RL3 events, or another explicit protected condition.

EHR remains available only as an exceptional escalation mechanism.

---

## 23. Autonomous Production Activation

A-003 does not by itself activate autonomous production release.

Autonomous production capability remains inactive until the necessary technical controls have been implemented, tested, and proven.

These include, where applicable:

- protected repository rules;
- required deterministic CI;
- independent verifier integration;
- VocaNova Control Plane authorization;
- least-privilege worker identities;
- protected deployment credentials;
- objective release-readiness evaluation;
- deployment policy enforcement;
- staged rollout;
- monitoring;
- tested rollback;
- independent kill switches.

Governance authority and technical activation are separate states.

The system must never represent a capability as operational merely because governance permits it.

---

## 24. Continuing Principles

After A-003 becomes effective:

1. AI performs routine engineering work.
2. Deterministic systems verify mechanical correctness wherever practical.
3. Independent verification challenges implementation.
4. Founder involvement is reserved for consequential decisions and explicit exceptions.
5. Technical autonomy is proportional to evidence and reversibility.
6. No builder approves its own implementation.
7. No system expands its own authority without appropriate independent controls.
8. EHR remains available when autonomous confidence is insufficient.
9. Production changes remain traceable.
10. Important actions remain auditable.
11. Production autonomy must be technically proven before activation.
12. Independent kill switches remain available.

---

## 25. Final Decision

VocaNova adopts controlled autonomous engineering as its target operating model.

After valid adoption and effective activation of A-003, a permanent human technical steward is no longer required as a routine approval authority.

Routine technical work, including R3 protected technical work, may proceed autonomously when all applicable deterministic, independent-verification, risk-specific, release, and operational gates pass.

Founder approval remains mandatory for genuinely consequential R4 decisions, predefined founder-controlled RL3 events, and other explicit protected conditions.

Exceptional qualified human technical review remains available through EHR when predefined conditions show that autonomous systems cannot establish sufficient confidence.

The target governance model is:

> The founder manages VocaNova through objectives, consequential decisions, and exceptions, while the autonomous engineering organization performs routine planning, implementation, verification, release, monitoring, and recovery within explicitly governed boundaries.
