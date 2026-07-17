---
id: DOC-18
title: VocaNova Autonomous Development Implementation Roadmap
version: 1.0
document_type: implementation-roadmap
status: approved
owner: founder
canonical_path: docs/planning/18-autonomous-development-implementation-roadmap.md

founder_direction_status: approved
formal_repository_approval_status: pending-exact-revision-founder-approval
repository_adoption_status: candidate-pending-merge
technical_activation_status: inactive
frozen_source_sha256: 717c33649f49cedca64cc4744d8121f4b6f5a371c9760076bfa8134c050a8664
frozen_substantive_body_sha256: 3d578186804cc2b3b500eec72809b26c03d9f236a4a22d3534daa1e2ba34c451
adoption_change: VOC-004

related_documents:
  - DOC-17
  - DOC-15
  - DOC-16

related_decisions:
  - A-003
---

# VocaNova Autonomous Development Implementation Roadmap

## 1. Objective

This roadmap defines the order in which VocaNova's autonomous-development architecture should be built and activated.

The implementation principle is:

> Build the smallest complete autonomous loop first, prove it with low-risk work, and expand authority only after objective evidence shows that the previous level is reliable.

The roadmap intentionally avoids building the entire final system before any part of it is useful.

---

## 2. Implementation Strategy

The architecture should be implemented as a sequence of independently valuable capability levels.

The practical order is:

```text
One-time A-003 governance transition
→ GitHub capability verification
→ Control Plane foundation
→ Founder interface
→ Durable work queue with normalized state
→ Atomic execution claiming and duplicate-dispatch prevention
→ Pre-dispatch freshness and authority validation
→ Change Contract automation
→ Initial AI Budget Governor
→ Provider health, quota, and availability distinction
→ Subscription-capacity and budget-aware scheduling
→ Codex implementation
→ Deterministic verification
→ Claude independent verification
→ Bounded repair
→ Automatic develop merge
→ Preview and staging
→ Release readiness
→ RL1 production automation
→ Monitoring and rollback
→ RL2 production automation
→ Monitoring-driven autonomous incident repair
→ Advanced orchestration only when justified
```

Production autonomy is not activated early.

The first major milestone remains a complete autonomous workflow ending in `develop` and staging.

---

## 3. Phase 0 — Governance Transition

### Goal

Adopt A-003 validly before using the new authority model.

### Work

1. Prepare the final A-003 repository artifact.
2. Reconcile:
   - DOC-16;
   - A-002;
   - approval matrix;
   - change-risk classification;
   - protected-areas documentation;
   - technical-steward appointment status;
   - AGENTS.md;
   - CLAUDE.md;
   - affected governance validators.
3. Run deterministic governance validation.
4. Obtain independent Claude review.
5. Apply the currently effective pre-A-003 approval rules.
6. Record exact-revision approval in both:
   - founder capacity;
   - qualified-human technical-steward capacity.
7. Merge the transition.
8. Run required post-merge governance validation.
9. Record A-003 effective activation.
10. Mark standing technical-steward authority permanently retired as a routine approval role.

### Important Rule

A-003 must not authorize its own adoption.

The founder and recorded technical steward are the same verified human acting in two separate capacities during this one-time migration.

After valid effective activation:

- the one-time migration requirement is exhausted;
- routine R3 work does not require founder approval merely because it is R3;
- routine R3 work does not require standing technical-steward approval;
- the migration requirement must never be reused as a routine approval rule.

### Exit Criteria

- A-003 is canonical.
- A-003 is effectively active.
- previous conflicting approval rules are reconciled;
- the standing steward role is historically preserved but no longer operationally required.

---

## 3A. GitHub Repository-Plan Capability Verification

### Goal

Verify before automatic merge activation that the selected GitHub account, organization configuration, and plan can enforce the controls required for VocaNova's private repositories.

The architecture must not permanently depend on a named commercial GitHub tier.

VocaNova should use:

> The lowest-cost GitHub plan that can reliably enforce all required controls for the repository's actual configuration.

Upgrade only when the current plan cannot provide a required protection.

### Required Functional Capabilities

Verify support for:

- protected branches or equivalent repository rules;
- required CI checks before merge;
- controlled automatic merge;
- suitable GitHub App or machine-identity permissions;
- protection against unauthorized direct writes to production branches;
- auditable repository actions and changes.

Also verify that the chosen configuration can support the exact controls required before each automation capability is activated.

### Evidence

Record:

- selected GitHub plan and organization configuration at verification time;
- required capabilities;
- supported capabilities;
- unsupported capabilities;
- compensating controls, if legitimately acceptable;
- upgrade decision, if necessary.

### Activation Boundary

Automatic merge must not be activated until this capability verification demonstrates that the required private-repository protections are enforceable.

The verification should be repeated when:

- GitHub plan or organization configuration changes;
- repository ownership changes materially;
- new protection requirements are introduced.

---

## 4. Phase 1 — Control Plane Foundation

### Goal

Create the smallest durable operational brain.

### Build

#### Control Plane Service

Create a TypeScript service containing:

- authenticated API;
- workflow-state manager;
- audit ledger;
- policy-version registry;
- basic integration adapter framework.

#### PostgreSQL

Implement the initial entities:

- founder requests;
- product objectives;
- decisions;
- Change Contracts and versions;
- tasks;
- workflow runs;
- agent runs;
- audit events.

### Deployment

Initially deploy the internal Control Plane to a small protected environment.

A low-cost VPS is acceptable for the first version.

### Security

Implement from the beginning:

- authentication;
- least-privilege service identities;
- secret separation;
- audit logging;
- backup procedure;
- kill switch for all automated write actions.

### What Is Not Enabled

- no Codex autonomous execution;
- no Claude automated verification;
- no automatic merge;
- no production deployment.

### Exit Criteria

The system can durably record:

```text
Founder request
→ Change Contract
→ Task
→ Workflow state
→ Decision
→ Audit history
```

without relying on chat memory.

---

## 5. Phase 2 — Founder Interface and Status Experience

### Goal

Make ChatGPT the primary founder-facing interface.

### Build

Implement the Founder Interface Adapter.

Expose initial MCP and API operations for:

- system status;
- active changes;
- open decisions;
- current releases;
- incidents;
- budget status;
- request submission.

### Initial Mode

Start with:

```text
Read operations
+ request creation
```

before exposing consequential write operations.

Then add policy-controlled founder decision submission.

### Founder Status Response

The Control Plane should support a concise executive status containing:

- current production version;
- current `develop` version;
- work in progress;
- release readiness;
- blockers;
- major risks;
- incidents;
- AI budget status;
- required founder decisions.

### Founder Independence

Routine founder interaction should occur through ChatGPT.

The founder should not need the GitHub UI for ordinary development, pull-request handling, merge approval, release approval, deployment, or status inspection except where an action cannot safely be delegated.

### Exit Criteria

The founder can use ChatGPT to ask:

> What is happening with VocaNova?

and receive a Control Plane-grounded answer rather than a memory-based reconstruction.

---

## 5A. Durable Work Queue and Normalized Queue State

### Goal

Create durable execution scheduling before substantial autonomous AI execution begins.

### Build

Implement PostgreSQL-backed queue records with three separate concepts.

#### `execution_policy`

```text
IMMEDIATE
WHEN_AI_CAPACITY_AVAILABLE
SCHEDULED
```

#### `status`

```text
QUEUED
ELIGIBLE
DISPATCHED
RUNNING
COMPLETED
FAILED
CANCELLED
BLOCKED
SUPERSEDED
```

#### `waiting_reason`

```text
NONE
QUOTA
BUDGET
DEPENDENCY
FOUNDER_DECISION
EXTERNAL_SYSTEM
PROVIDER_UNAVAILABLE
POLICY
```

Do not duplicate the same meaning across these fields.

Also store:

- request or task reference;
- P0–P3 priority;
- risk classification;
- required worker capability;
- estimated AI usage;
- earliest eligible execution time;
- deadline;
- retry state;
- budget reservation;
- supersession reference.

### Scheduling Behavior

The queue must:

- prioritize P0 production emergencies over routine development;
- preserve an audit trail of reprioritization;
- support safe deferral of normal work;
- avoid unlimited starvation of lower-priority work;
- integrate later with the AI Budget Governor.

### Exit Criteria

A task can:

- enter the queue;
- remain durably deferred;
- become eligible later;
- be superseded cleanly;
- execute without losing traceability.

---

## 5B. Atomic Execution Claiming and Idempotency

### Goal

Prevent accidental duplicate execution caused by retries, crashes, duplicated events, scheduler races, or worker restarts.

### Build

Implement the simplest reliable PostgreSQL-based claiming model.

Add:

- `execution_attempts`;
- idempotency keys;
- atomic work-item claiming;
- execution leases;
- lease ownership;
- lease acquisition timestamps;
- lease expiration;
- heartbeat or renewal where needed;
- configurable maximum concurrent execution count per task;
- duplicate-dispatch detection.

### Required Behavior

```text
Eligible validated work
→ final execution authorization
→ atomic lease acquisition
→ worker execution
→ result recorded
→ lease closed
```

For exclusive work, only one active lease is permitted.

If a worker disappears:

```text
lease expires
→ reconcile previous execution state
→ inspect external side effects
→ determine whether retry is safe
→ retry only when policy permits
```

Lease expiration alone must not automatically trigger blind duplicate execution.

### External Side Effects

Implement stable operation identifiers and reconciliation for:

- paid AI execution;
- branches;
- pull requests;
- release candidates;
- deployments;
- other side-effecting integrations.

Use native external idempotency support where available.

### Test Scenarios

Before Codex integration is considered production-ready, test:

- duplicate queue event;
- two scheduler processes racing;
- process crash after lease acquisition;
- process crash after external operation succeeds but before local success is recorded;
- expired lease with previous execution outcome uncertain;
- worker restart;
- duplicate retry request.

### Exit Criteria

The same exclusive task cannot unintentionally execute twice in parallel or create duplicate external side effects under the tested failure scenarios.

---

## 5C. Pre-Dispatch Freshness and Authority Validation

### Goal

Prevent delayed queued work from consuming AI capacity after it becomes obsolete or unauthorized.

### Build

Before final AI execution authorization, check:

- authorized Change Contract version validity;
- cancellation state;
- supersession state;
- relevant base Git assumptions;
- dependency satisfaction;
- newer approved replacement work;
- product or architecture decision changes;
- whether another change already implemented the requested outcome;
- continuing execution authority.

### Recoverably Stale Work

When stale work can be safely refreshed:

1. refresh repository assumptions;
2. rebase or update the base where appropriate;
3. rerun risk and policy evaluation;
4. refresh the Task Context Pack later after dispatch authorization;
5. execute only when valid.

### Replaced Work

When replaced:

```text
status: SUPERSEDED
```

Record the replacement reference and do not consume AI execution capacity.

### Material Specification Change

If the Change Contract must change materially:

- create or reference the new version;
- invalidate stale authorization;
- invalidate stale verification where applicable;
- rerun the required approval and policy path.

### Exit Criteria

Demonstrate that an intentionally outdated queued task is:

- safely refreshed;
- blocked;
- or superseded;

before any substantial AI execution begins.

---

## 6. Phase 3 — Change Contract and Specification Automation

### Goal

Turn founder intent and system signals into implementation-ready work.

### Build

Implement:

- canonical-knowledge retrieval;
- Change Contract generation;
- immutable Change Contract versions;
- acceptance-criteria generation;
- product-decision detection;
- task decomposition;
- dependency tracking;
- basic risk classification.

Implement the initial AI Budget Governor for specification tasks.

### Required Behavior

The system should:

- reuse existing VocaNova decisions;
- avoid unnecessary founder questions;
- detect genuine R4 decisions;
- stop before implementation when unresolved founder authority is required.

### Exit Criteria

A normal founder request can become an authorized immutable Change Contract and task graph whose executable tasks enter the durable work queue.

---

## 7. Phase 4 — Operational Policy Baseline

### Goal

Move configurable thresholds out of architecture documents.

### Create Version-Controlled Policies

At minimum:

```text
AI Budget Policy
AI Capacity and Fallback Policy
Work Queue Policy
Risk Policy
Verification Policy
Retry Policy
Release Policy
Incident Policy
Capability Policy
```

### Initial Recommended Defaults

#### Retry Policy

- bounded repair loops;
- approximately two normal repair cycles before escalation;
- no identical retry without new evidence;
- hard stop on repeated unresolved critical findings;
- lease-expiration reconciliation before retry;
- duplicate-dispatch prevention.

#### AI Budget

- deterministic tools first;
- economy models for classification and summaries;
- standard engineering capability by default;
- stronger reasoning only after defined escalation;
- cross-model verification where policy requires it.

#### Work Queue

- normalized execution policy, status, and waiting reason;
- P0 emergency precedence;
- starvation prevention;
- explicit supersession.

#### Provider Health

- distinguish quota constraint from provider unavailability;
- define provider-recovery windows;
- define alternate-provider eligibility;
- preserve independent-verification requirements.

#### Release Policy

Production automation remains disabled initially.

### Exit Criteria

Every automated policy decision can identify the exact policy version that authorized it.

---

## 7A. Subscription-Capacity, Provider-Health, and Budget-Aware Scheduling

### Goal

Use the founder's fixed subscription-backed AI capacity efficiently without turning temporary quota constraints or provider failures into uncontrolled API spending or weakened verification.

### Implement

The scheduler and AI Budget Governor should consider:

- current estimated included capacity;
- known quota state;
- estimated reset time where available;
- provider health;
- provider execution-interface availability;
- task priority;
- urgency;
- risk;
- expected execution value;
- ability to wait;
- metered API budget;
- approved alternate providers.

### Distinguish Conditions

#### QUOTA

The provider is operational but suitable included capacity is temporarily unavailable.

Typical behavior:

```text
P2/P3 non-urgent work
→ remain queued
```

```text
P0/P1 urgent work
→ evaluate policy-approved fallback
```

#### PROVIDER_UNAVAILABLE

The provider or selected execution interface is technically unavailable.

Typical behavior:

```text
Short outage
→ provider-recovery retry policy
```

```text
Extended outage
→ queue non-urgent work
```

```text
Urgent work
→ evaluate approved alternate provider or execution capability
```

### Verification Independence

A verifier outage must not weaken verification requirements.

Example:

```text
Codex implemented change
+ Claude unavailable
→ wait for Claude
or
→ use a separately validated, policy-approved
   independent verifier from another model family
```

Never allow the builder to substitute for the required independent verifier.

### Exit Criteria

Demonstrate that:

1. a normal task is safely deferred when included quota is temporarily unavailable;
2. a provider outage is represented differently from quota exhaustion;
3. the same task becomes eligible later;
4. an urgent simulated incident can select an approved fallback when policy and budget permit;
5. every metered or alternate-provider fallback is auditable;
6. verifier unavailability never results in self-verification by the builder.

---

## 8. Phase 5 — Codex Builder Integration

### Goal

Automate bounded implementation without production authority.

### Build

Implement the worker abstraction and initial Codex adapter.

Automate:

```text
Eligible task
→ freshness and authority validation
→ AI Budget Governor authorization
→ atomic execution lease
→ Task Context Pack
→ isolated worktree
→ feature branch
→ Codex execution
→ local checks
→ commit
→ pull request
```

### Duplicate-Safety Requirements

Before executing, Codex integration must:

- own a valid execution lease;
- use a stable idempotency key;
- reconcile existing branch state;
- reconcile existing PR state;
- avoid duplicate paid AI execution after uncertain failures.

### Permissions

Codex initially receives:

- repository read;
- bounded branch write;
- PR creation/update capability.

Codex does not receive:

- merge authority;
- production deployment authority;
- production database credentials.

### First Test Change

Use a deliberately low-risk R0 or R1 change.

The first end-to-end test should not be a complex product feature.

### Exit Criteria

The Control Plane can dispatch a bounded implementation task exactly once under tested normal and failure conditions and receive an exact implementation SHA and evidence.

---

## 9. Phase 6 — Deterministic CI Evidence Integration

### Goal

Make automated checks first-class Control Plane evidence.

### Build

Integrate GitHub Actions evidence for installed checks.

As application foundations exist, enable:

- frozen dependency installation;
- formatting;
- linting;
- type checking;
- unit tests;
- integration tests;
- builds;
- additional scope-specific checks.

The Control Plane must distinguish:

```text
check not installed
```

from:

```text
check installed and passed
```

No placeholder passing gates are permitted.

### Exit Criteria

A workflow can evaluate deterministic pass/fail state from objective evidence.

---

## 10. Phase 7 — Claude Independent Verification

### Goal

Automate independent cross-model review.

### Build

Implement:

- Verification Package builder;
- Claude verifier adapter;
- structured findings;
- exact-SHA binding;
- verifier verdicts;
- finding-resolution state;
- verifier provider-health handling.

Start with human-observed verification runs.

Do not immediately grant automatic merge authority.

### Availability Rule

If Claude is temporarily unavailable:

- do not substitute Codex;
- wait for Claude;
- or use another independently validated policy-approved verifier from a different model family if one has been configured.

### Exit Criteria

The same exact implementation revision can be:

```text
implemented by Codex
→ deterministically checked
→ independently verified by Claude
```

with durable evidence and without weakening independence during provider outages.

---

## 11. Phase 8 — Bounded Autonomous Repair Loop

### Goal

Allow normal verification failures to repair themselves safely.

### Build

```text
Deterministic or Claude failure
→ structured failure evidence
→ new controlled execution attempt
→ atomic lease
→ Codex repair
→ deterministic rerun
→ Claude re-verification
```

Enforce:

- retry limits;
- cost limits;
- no identical repeated prompts;
- scope-change detection;
- EHR escalation where applicable;
- lease-safe retry;
- reconciliation after uncertain execution;
- duplicate-attempt prevention.

### Exit Criteria

A low-risk intentionally failing test scenario can be repaired autonomously within the configured retry budget without duplicate commits, PRs, or paid worker executions.

---

## 12. Phase 9 — Automatic Merge to `develop`

### Goal

Activate the first major autonomous engineering authority.

### Prerequisites

Before enabling:

- GitHub repository-plan capability verification has demonstrated that all required private-repository branch/ruleset, CI, machine-identity, automatic-merge, unauthorized-write protection, and audit controls are enforceable;
- branch protections exist;
- required CI is reliable;
- exact-SHA Claude verification is reliable;
- stale verification is invalidated;
- policy engine is active;
- audit trail is complete;
- duplicate-dispatch prevention is tested;
- exact external operation reconciliation is implemented for merge-related operations;
- kill switch is tested.

Automatic merge must remain disabled when the selected account or plan cannot enforce required repository protections.

The response is to add the required protection capability or upgrade to the lowest-cost suitable plan, not to weaken the control.

### Rollout

#### Step 1

Shadow mode:

The Control Plane reports:

```text
WOULD AUTO-MERGE
```

without merging.

#### Step 2

Enable R0.

#### Step 3

Enable R1 after successful evidence.

#### Step 4

Expand to eligible R2 and R3 only when corresponding stronger gates exist.

### Exit Criteria

Eligible verified work can move from founder request to `develop` without routine founder intervention.

---

## 13. Phase 10 — Preview and Staging Automation

### Goal

Create reliable non-production deployment evidence.

### Build

- preview deployment integration;
- staging deployment from `develop`;
- health checks;
- environment-isolated credentials;
- deployment evidence in the Control Plane;
- idempotent or reconciled deployment operations.

### Critical Rule

No production credentials are shared with coding workers.

### Exit Criteria

A verified merge into `develop` can deploy to staging automatically and produce machine-readable health evidence without duplicate unintended deployments during retry scenarios.

---

## 14. Phase 11 — Release Candidate and Readiness State Machine

### Goal

Create objective release readiness.

### Build

Implement:

```text
DEVELOPING
FEATURE_COMPLETE
RELEASE_CANDIDATE
READY_TO_PUBLISH
GOING_TO_PUBLISH
PUBLISHING
LIVE_MONITORING
HEALTHY
```

Implement exceptional states.

Implement the readiness gate evaluator.

### Exit Criteria

The Control Plane can explain exactly:

- which gates passed;
- which gates failed;
- why a release is or is not READY TO PUBLISH.

No AI opinion alone may satisfy a mandatory gate.

---

## 15. Phase 12 — RL1 Production Automation

### Goal

Activate production autonomy for the safest releases.

### Prerequisites

- production deployment identity is isolated;
- main-only deployment is enforced;
- monitoring is active;
- rollback is tested;
- staged rollout works;
- production kill switch is tested;
- release evidence is complete;
- deployment operations are duplicate-safe and reconcilable.

### Rollout

Begin with observation:

```text
WOULD RELEASE
```

Then activate one narrowly defined RL1 category.

Expand RL1 eligibility gradually.

### Required Behavior

```text
READY TO PUBLISH
→ policy authorization
→ staged deployment
→ health evaluation
→ automatic expansion
or
→ automatic rollback
```

### Exit Criteria

At least several low-risk releases complete successfully with complete evidence and tested rollback capability.

---

## 16. Phase 13 — RL2 Production Automation

### Goal

Expand automated production release to normal significant features.

### Prerequisites

Evidence must show that:

- RL1 automation is reliable;
- staged rollout is reliable;
- monitoring thresholds are meaningful;
- rollback is trustworthy;
- incident handling works.

### RL2 Adds

- stronger staging requirements;
- more granular rollout;
- longer observation;
- stronger verification where required.

RL2 remains policy-based and may publish automatically.

### Exit Criteria

Normal product features can move from approved intent to healthy production without routine founder release approval.

---

## 17. Phase 14 — Sentry and PostHog Feedback Integration

### Goal

Connect production reality to the Control Plane.

### Sentry

Integrate:

- new severe errors;
- regressions;
- release-associated error increases.

### PostHog

Integrate:

- product adoption;
- funnel health;
- agreed success metrics;
- feature flags;
- experiment outcomes.

### Exit Criteria

The Control Plane can associate relevant production signals with:

- releases;
- Change Contracts;
- incidents.

---

## 18. Phase 15 — Autonomous Incident Investigation

### Goal

Automate investigation before automating broad repair authority.

### Build

```text
Signal
→ incident creation
→ evidence gathering
→ classification
→ reproduction attempt
→ proposed Change Contract
→ queued repair task
```

Initially require observation before dispatching repairs.

### Exit Criteria

The Control Plane can reliably create useful, deduplicated incident investigations and correctly prioritize P0/P1 work.

---

## 19. Phase 16 — Autonomous Incident Repair

### Goal

Enable full policy-limited repair for eligible incidents.

Start with:

- R1 incidents;
- clearly reproducible regressions;
- strongly reversible repairs.

Later expand to eligible R2/R3 cases when strengthened controls exist.

EHR and R4 boundaries remain active.

Incident repair uses the same:

- freshness validation;
- AI Budget Governor;
- provider-health rules;
- execution leases;
- independent verification;
- duplicate-safe side-effect handling.

### Exit Criteria

An eligible production regression can complete:

```text
detect
→ investigate
→ queue repair
→ validate freshness and authority
→ claim execution
→ repair
→ verify
→ release
→ monitor
```

without routine founder intervention.

---

## 20. Phase 17 — Cost Optimization and Learning

### Goal

Improve efficiency using actual workflow evidence.

Measure:

- cost per successful change;
- retries per worker;
- verifier rejection rate;
- context size;
- failure causes;
- quota-related waiting time;
- provider-outage waiting time;
- duplicate-dispatch prevention events;
- mean time from request to staging;
- mean time from release to healthy;
- incident repair time.

Use these metrics to improve:

- model routing;
- Task Context Packs;
- queue scheduling;
- retry policies;
- verification depth;
- release thresholds.

Do not optimize AI cost by weakening mandatory safety gates.

---

## 21. Phase 18 — Temporal Evaluation

Temporal should not be introduced merely because it is sophisticated.

Evaluate migration when actual evidence shows problems such as:

- difficult long-running workflow recovery;
- high workflow concurrency;
- complex compensation behavior;
- repeated n8n reliability limitations;
- substantial orchestration debugging cost.

Until then:

```text
PostgreSQL = durable workflow truth and atomic claims
TypeScript = critical workflow logic
n8n = integration helper
```

If Temporal is adopted, preserve:

- Control Plane API;
- data contracts;
- Founder AI interface;
- worker abstractions;
- policy model.

The founder-facing experience must not change.

---

## 22. What Must Be Built First

The highest-priority implementation sequence is:

```text
1. Complete the one-time A-003 governance transition
2. Verify GitHub repository-plan capabilities
3. Build the Control Plane database and audit foundation
4. Build founder status and request interfaces
5. Add the durable work queue with normalized execution_policy, status, and waiting_reason
6. Add atomic execution claiming and duplicate-dispatch prevention
7. Add pre-dispatch freshness and authority validation
8. Add Change Contract automation and immutable versions
9. Add the initial AI Budget Governor
10. Add provider health, quota, and availability distinction
11. Add subscription-capacity and budget-aware scheduling
12. Integrate Codex
13. Integrate deterministic CI evidence
14. Integrate Claude independent verification
15. Add bounded autonomous repair
16. Activate automatic merge gradually
17. Add preview and staging
18. Add the release-readiness state machine
19. Activate RL1 production autonomy
20. Add production monitoring and tested rollback
21. Activate RL2 production autonomy only after RL1 is proven
22. Add monitoring-driven autonomous incident repair
23. Evaluate Temporal only when actual evidence justifies it
```

The first complete autonomous vertical slice is:

```text
Founder asks ChatGPT for a small change
→ Control Plane records it
→ Change Contract created
→ task enters durable work queue
→ task becomes eligible
→ freshness and authority validation passes
→ AI Budget Governor authorizes execution
→ worker atomically acquires execution lease
→ Task Context Pack created
→ Codex implements
→ deterministic CI passes
→ Claude independently verifies
→ bounded repair occurs if necessary
→ exact verified SHA merges automatically into develop
→ staging deploys
→ Founder asks ChatGPT what changed
→ ChatGPT reports the exact verified result
```

The founder should not need to open GitHub to execute or understand this routine workflow.

Build this vertical slice before attempting a fully autonomous production organization.

---

## 23. What Should Be Postponed

Do not build initially:

- agent swarms;
- uncontrolled recursive agent delegation;
- multiple competing implementation agents;
- custom model hosting;
- a dedicated vector database without demonstrated need;
- Temporal;
- autonomous pricing decisions;
- autonomous major product-strategy changes;
- broad autonomous production database access;
- complex multi-region Control Plane infrastructure;
- advanced self-modifying agent behavior;
- automatic RL2 production before RL1 is proven;
- autonomous incident repair before monitoring and rollback are proven;
- additional distributed locking infrastructure without evidence PostgreSQL is insufficient.

These features add complexity before the core loop has demonstrated value.

---

## 24. Cost Planning Target

Use the founder's existing ChatGPT Plus and Claude Pro subscriptions as much as practical.

For planning purposes, target an initial incremental recurring infrastructure cost of approximately:

```text
€10–30 per month
```

before optional metered AI API usage.

A practical bootstrap budget model is:

```text
Existing ChatGPT subscription       existing cost
Existing Claude subscription        existing cost
Small VPS / backups                 low monthly cost
GitHub Actions                      existing/free allowance where sufficient
Sentry                              free tier initially where sufficient
PostHog                             free tier initially where sufficient
n8n Community                       self-hosted
Optional metered AI APIs            hard-capped separately
```

Including the founder's approximate existing AI subscriptions, the initial overall planning target is roughly:

```text
€50–70 per month
```

before material metered AI API consumption.

These numbers are planning targets rather than permanent vendor-price assumptions.

AI cost planning must distinguish:

- fixed subscription cost;
- estimated remaining subscription capacity;
- quota constraint;
- provider unavailability;
- optional metered fallback budget.

Temporary subscription quota pressure should normally create queued work rather than an unplanned increase in paid API consumption.

Provider unavailability should follow a separate recovery and alternate-provider policy.

The initial metered fallback budget should be explicitly capped and may remain very small until production-critical autonomous workflows require greater reliability.

All paid fallback usage must be attributable to a specific task, policy decision, and reason.

---

## 25. Recommended Activation Sequence

The recommended autonomy progression is:

```text
A0 — Read-only observation
A1 — Founder request, Change Contract coordination, and durable queueing
A2 — Autonomous implementation with freshness validation and duplicate-safe execution claiming
A3 — Autonomous verification and bounded repair
A4 — Automatic merge into develop
A5 — Automatic preview and staging
A6 — Automatic RL1 production release
A7 — Automatic RL2 production release
A8 — Autonomous eligible incident repair
```

Each activation step requires:

- objective implementation evidence;
- successful test scenarios;
- working kill switch;
- rollback or disable path;
- auditability.

No later level should be activated merely because its code exists.

---

## 26. Final Implementation Recommendation

The immediate engineering objective remains:

> Build one trustworthy end-to-end autonomous development loop that starts with a founder request in ChatGPT and ends with independently verified code safely merged into `develop` and deployed to staging.

That first loop must prove that:

- the founder can operate without routine GitHub UI interaction;
- work can wait durably in the Control Plane;
- queue execution policy, lifecycle status, and waiting reason remain semantically distinct;
- stale or superseded work does not consume AI capacity;
- AI execution is scheduled according to priority, provider health, available capacity, and budget;
- temporary subscription quota limits do not automatically trigger metered spending;
- provider outages are handled differently from quota exhaustion;
- duplicate queue events, retries, crashes, and worker restarts do not cause uncontrolled duplicate execution;
- exact execution and verification evidence can still be reported conversationally through the Founder AI.

Once that loop is reliable, production authority expands incrementally through the already approved RL1 and RL2 release model.

The final target remains:

> The founder talks to one AI about VocaNova; behind that AI, a governed autonomous software-development organization plans, schedules, builds, verifies, releases, monitors, repairs, and continuously improves the product with minimal founder involvement.
