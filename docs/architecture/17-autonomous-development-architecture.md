---
id: DOC-17
title: VocaNova Autonomous Development Architecture
version: 1.0
document_type: technical-architecture
status: approved
owner: founder
canonical_path: docs/architecture/17-autonomous-development-architecture.md

founder_direction_status: approved
formal_repository_approval_status: pending-exact-revision-founder-approval
repository_adoption_status: candidate-pending-merge
technical_activation_status: inactive
frozen_source_sha256: 8c9fd7b714e84d39f4b5e9d5c8a4cf8f00a3231b269e2d6dadf6e0ff7707693a
frozen_substantive_body_sha256: b3a157557210f0afecbb5ed4ff53cd2738f50c451c39ef0d012363a6d8df7a40
adoption_change: VOC-004

related_documents:
  - DOC-15
  - DOC-16
  - DOC-18

related_decisions:
  - A-001
  - A-002
  - A-003
---

# VocaNova Autonomous Development Architecture v1

## 1. Purpose

This document defines the technical system that implements VocaNova's autonomous-development operating model.

A-003 defines who and what has authority.

This document defines the machinery through which that authority is exercised safely.

The target founder experience is:

> I talk to one AI about VocaNova; behind that AI, an autonomous software-development organization does the work.

The system should allow the founder to communicate primarily with ChatGPT while a VocaNova-owned Control Plane coordinates product specification, implementation, deterministic verification, independent verification, releases, monitoring, incident response, cost control, durable scheduling, and durable operational state.

This architecture does not replace or reopen the approved VocaNova product architecture.

The VocaNova learning product and the autonomous-development Control Plane are separate systems with separate responsibilities.

---

## 2. Architectural Principles

The architecture follows these principles:

1. **One founder-facing interface.** ChatGPT is the normal conversational interface for the founder.
2. **VocaNova owns operational state.** Durable workflow truth must not depend on the private memory of ChatGPT, Codex, Claude, or another vendor.
3. **Deterministic systems before AI.** Mechanical validation should use ordinary software whenever reliable deterministic verification is possible.
4. **AI workers are replaceable.** Codex and Claude are initial implementations of functional worker roles, not permanent architectural dependencies.
5. **Specifications are versioned.** Meaningful work is bound to an immutable Change Contract version.
6. **Implementation and verification remain independent.** The implementation worker must not be the final independent verifier of its own work.
7. **Autonomy is policy constrained.** Agents do not decide their own permissions, budgets, or release authority.
8. **Production changes are evidence driven.** READY TO PUBLISH is computed from objective gates rather than an AI statement.
9. **Authority and capability are separate.** Governance permission does not imply that a technical capability is activated.
10. **Every important workflow is traceable.**
11. **Autonomy expands gradually.** New autonomous capabilities operate in observation or shadow mode before receiving irreversible authority.
12. **The founder manages by exception.**
13. **Execution is duplicate-safe.** Retries, crashes, scheduler races, and duplicated events must not cause uncontrolled duplicate work or side effects.
14. **Queued work is revalidated before execution.** Work that waits must be checked for freshness and continuing authority before consuming AI capacity.

---

## 3. System Context

The target architecture is:

```text
FOUNDER
   │
   ▼
CHATGPT — VOCANOVA FOUNDER AI
   │
   ▼
FOUNDER INTERFACE ADAPTER
   │
   ├── MCP
   └── HTTPS API
   │
   ▼
┌────────────────────────────────────────────────┐
│              VOCANOVA CONTROL PLANE           │
│                                                │
│  Request & Decision Manager                    │
│  Product / Specification Manager               │
│  Change Contract Registry                      │
│  Work Queue Manager                            │
│  Freshness & Authority Validator               │
│  Workflow State Manager                        │
│  Policy & Risk Engine                          │
│  AI Budget Governor                            │
│  Context Pack Builder                          │
│  Agent Runtime Adapters                        │
│  Execution Lease Manager                       │
│  Evidence Registry                             │
│  Verification Manager                          │
│  Release Controller                            │
│  Incident Controller                           │
│  Knowledge Synchronizer                        │
│  Audit Ledger                                  │
└──────────────────────┬─────────────────────────┘
                       │
        ┌──────────────┼─────────────────┐
        │              │                 │
        ▼              ▼                 ▼
      GitHub       AI Workers       Operations
                    │                 │
                 Codex             Cloudflare
                 Claude            Sentry
                 Future agents     PostHog
                                    Other systems
```

The canonical execution path is:

```text
Founder
→ ChatGPT Founder AI
→ Founder Interface Adapter / MCP
→ VocaNova Control Plane
→ Product and specification workflow
→ Change Contract
→ Durable Work Queue
→ task eligibility
→ freshness and authority validation
→ AI Budget Governor
→ atomic execution lease
→ Task Context Pack
→ Codex builder
→ deterministic CI
→ Claude independent verifier
→ bounded repair loop
→ automatic merge according to policy
→ preview and staging
→ release-readiness state machine
→ policy-based RL1/RL2 production release
→ Sentry and PostHog feedback
→ autonomous investigation and repair
```

The Control Plane is the durable coordinator.

ChatGPT is the founder-facing interface.

Codex is initially the primary builder.

Claude is initially the independent verifier.

GitHub remains the source of truth for code and approved version-controlled artifacts.

External production systems remain authoritative for production reality.

The durable work queue is part of the Control Plane and governs when authorized work becomes eligible for execution.

The work queue controls execution timing and prioritization.

The Freshness and Authority Validator determines whether eligible work is still current and authorized.

The AI Budget Governor controls resource selection and final execution authorization.

The Execution Lease Manager prevents duplicate worker execution.

None of these components changes the authority model defined by A-003.

---

## 4. Founder AI

### 4.1 Role

ChatGPT acts as the VocaNova Founder AI.

Its responsibilities include:

- understanding founder requests;
- retrieving current VocaNova context;
- explaining current product and engineering status;
- converting founder intent into structured Control Plane requests;
- presenting consequential decisions;
- presenting release and incident status;
- presenting AI and infrastructure spending;
- summarizing important changes;
- coordinating rather than personally owning all implementation work.

### 4.2 Normal Founder Commands

The interface should support requests such as:

- "Build this feature."
- "Users are having this problem. Investigate it."
- "Review VocaNova and identify the most important improvements."
- "Fix this problem."
- "What is being developed?"
- "Is the next release ready?"
- "What changed recently?"
- "What is live?"
- "Are there important problems?"
- "What requires my decision?"
- "What are we spending on AI and infrastructure?"

### 4.3 Founder AI Boundaries

The Founder AI does not:

- become the canonical source of product truth;
- directly grant itself infrastructure permissions;
- directly deploy production;
- fabricate approval;
- bypass the Control Plane for auditable actions;
- silently reinterpret approved product strategy.

All meaningful actions should flow through the Control Plane.

### 4.4 Founder Independence from GitHub

Except for unavoidable initial account configuration, repository ownership actions, exceptional emergency recovery, or another action that cannot safely be delegated, the founder should not be required to interact directly with the GitHub user interface for routine:

- development;
- pull-request review or approval;
- merging;
- release approval;
- deployment;
- engineering-status inspection.

Routine founder interactions should happen through the VocaNova Founder AI in ChatGPT.

Where founder authority is required, the Founder AI should present the decision conversationally and submit the authenticated decision through the controlled Founder Interface Adapter.

GitHub remains:

- the source of truth for code and repository-backed engineering artifacts;
- the execution environment for pull requests, checks, merge controls, and repository automation;
- an auditable engineering system behind the Founder AI.

GitHub is not intended to be the founder's routine operating interface.

The Founder AI must expose sufficient Control Plane-grounded status that the founder does not need to open GitHub merely to discover:

- what is being developed;
- which pull requests exist;
- what passed or failed;
- whether a release is ready;
- whether anything requires founder judgment.

---

## 5. Founder Interface Adapter and MCP

The Control Plane exposes a stable Founder Interface Adapter.

The adapter provides:

1. an MCP interface for supported ChatGPT integrations;
2. a conventional authenticated HTTPS API;
3. the same authorization policy beneath both interfaces.

The architecture must not depend exclusively on a specific ChatGPT client capability.

If the available ChatGPT environment temporarily supports only part of the desired action surface, the Control Plane remains unchanged.

### 5.1 Founder-Facing Read Capabilities

Initial MCP tools should include:

- `get_vocanova_status`
- `get_active_changes`
- `get_change`
- `get_release_status`
- `get_production_status`
- `get_open_incidents`
- `get_required_founder_decisions`
- `get_ai_budget_status`
- `get_recent_changes`

### 5.2 Founder-Facing Write Capabilities

Policy-controlled write tools may include:

- `submit_founder_request`
- `approve_founder_decision`
- `reject_founder_decision`
- `pause_agent_dispatch`
- `pause_production_release`
- `resume_allowed_workflow`
- `authorize_founder_controlled_release`

Write actions must:

- authenticate the founder;
- use typed inputs;
- record an audit event;
- reference the affected object and version;
- enforce current policy inside the Control Plane.

MCP itself must not become an authorization bypass.

---

## 6. VocaNova Control Plane

### 6.1 Responsibility

The VocaNova Control Plane is the durable operational brain of the autonomous engineering system.

It owns workflow state and execution scheduling but does not replace GitHub as code truth or production telemetry as production truth.

### 6.2 Core Modules

#### Request and Decision Manager

Maintains:

- founder requests;
- system-generated improvement proposals;
- unresolved questions;
- founder decision requests;
- approved decisions;
- rejected decisions.

#### Product and Specification Manager

Coordinates:

- product evidence gathering;
- existing-decision retrieval;
- Change Contract generation;
- acceptance criteria;
- scope management;
- task decomposition.

#### Change Contract Registry

Maintains:

- draft Change Contracts;
- immutable versions;
- content hashes;
- lifecycle status;
- canonical repository references.

#### Work Queue Manager

Maintains the durable prioritized queue of work eligible or potentially eligible for autonomous execution.

It is responsible for:

- priority;
- `execution_policy`;
- lifecycle `status`;
- `waiting_reason`;
- earliest eligible execution time;
- dependency state;
- founder-decision blocking state;
- quota-related waiting;
- budget-related waiting;
- provider-unavailability waiting;
- retry eligibility;
- scheduling;
- emergency reprioritization;
- budget reservation;
- supersession state.

The Work Queue Manager must not represent scheduling intent, lifecycle state, and waiting cause redundantly.

It coordinates with the Freshness and Authority Validator before final dispatch authorization.

It coordinates with the Execution Lease Manager before a worker can execute.

#### Freshness and Authority Validator

Revalidates eligible work immediately before substantial AI execution.

It determines whether:

- the authorized Change Contract version remains valid;
- the task remains active;
- the task has been cancelled or superseded;
- base Git assumptions remain acceptable;
- dependencies remain satisfied;
- newer approved work has replaced the task;
- new product or architecture decisions invalidate the task;
- equivalent work has already been completed;
- the task still has authority to execute.

#### Workflow State Manager

Maintains the current state of:

- changes;
- tasks;
- agent runs;
- verification;
- releases;
- deployments;
- incidents.

#### Policy and Risk Engine

Evaluates:

- R0–R4 change risk;
- RL1–RL3 release class;
- applicable required gates;
- founder-control requirements;
- EHR triggers;
- permission boundaries.

#### AI Budget Governor

Selects:

- whether AI should be used;
- whether execution should occur now;
- provider;
- worker capability;
- model tier;
- reasoning effort;
- maximum context;
- retry allowance;
- escalation conditions;
- fallback eligibility.

#### Context Pack Builder

Builds focused inputs for workers after freshness and authority validation succeeds and final execution authorization is granted.

#### Agent Runtime Adapters

Provide a common abstraction over:

- Codex;
- Claude;
- future coding agents;
- future verification agents.

#### Execution Lease Manager

Provides durable atomic claiming and duplicate-dispatch prevention.

It manages:

- idempotency keys;
- execution leases;
- lease ownership;
- lease expiration;
- heartbeats and renewal;
- maximum concurrency;
- duplicate-dispatch detection;
- safe lease-expiry recovery.

#### Evidence Registry

Indexes immutable evidence from:

- GitHub;
- GitHub Actions;
- agent runs;
- preview/staging systems;
- deployment systems;
- monitoring tools.

#### Verification Manager

Coordinates:

- Verification Package creation;
- Claude verification;
- finding lifecycle;
- repair loops;
- final verdicts.

#### Release Controller

Coordinates:

- release candidate creation;
- readiness-gate evaluation;
- release authorization;
- staged rollout;
- rollback.

#### Incident Controller

Coordinates:

- detection;
- classification;
- containment;
- investigation;
- autonomous repair;
- incident closure.

#### Knowledge Synchronizer

Identifies when outcomes require changes to canonical product, architecture, governance, operations, incident, or experiment knowledge.

#### Audit Ledger

Records important actions and state transitions.

### 6.3 Durable Work Queue

The Control Plane maintains a durable work queue in PostgreSQL.

The queue exists so VocaNova does not need to execute every task immediately and can use fixed or limited AI capacity efficiently.

#### Priority

Every queued executable item has one priority:

```text
P0 — Production emergency
P1 — Urgent
P2 — Normal product or engineering work
P3 — Opportunistic improvement
```

Priority affects scheduling but does not override:

- mandatory safety gates;
- unresolved founder decisions;
- EHR;
- capability restrictions.

#### `execution_policy`

`execution_policy` describes how the task is intended to become eligible:

```text
IMMEDIATE
WHEN_AI_CAPACITY_AVAILABLE
SCHEDULED
```

#### `status`

`status` describes the current work-item lifecycle:

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

`waiting_reason` describes why a non-progressing item cannot currently proceed:

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

The same scheduling or blocking concept must not be redundantly encoded across these fields.

For example:

- a normal task intended to wait for capacity may have `execution_policy=WHEN_AI_CAPACITY_AVAILABLE`;
- while quota constrained it may remain `status=QUEUED` with `waiting_reason=QUOTA`;
- when capacity becomes available it may become `status=ELIGIBLE` with `waiting_reason=NONE`.

#### Required Work-Item Information

Every queued item should retain at minimum:

- request or task reference;
- priority;
- R0–R4 risk classification;
- required worker capability;
- estimated AI usage;
- execution policy;
- lifecycle status;
- waiting reason;
- earliest eligible execution time where applicable;
- deadline where applicable;
- retry state;
- budget reservation where applicable;
- superseded-by reference where applicable;
- creation and last-prioritization timestamps.

#### Emergency Reprioritization

P0 production emergencies may automatically move ahead of normal development work.

The reprioritization must be auditable.

The system must record:

- what work was displaced;
- why the emergency received priority;
- whether any reserved budget or AI capacity was reassigned.

Emergency priority does not grant new authority or waive mandatory verification.

#### Fairness and Starvation

The scheduling policy should prevent long-lived P2 and P3 work from disappearing indefinitely merely because newer tasks continually arrive.

Operational policy may use:

- age-based priority boosts;
- reserved capacity;
- deadlines;
- explicit founder priorities.

### 6.4 Pre-Dispatch Freshness and Authority Validation

A task that was valid when queued may become obsolete before execution.

Substantial AI work must therefore not be dispatched immediately merely because a queue item becomes eligible.

The required path is:

```text
Queued task
→ becomes eligible
→ freshness and authority validation
→ AI Budget Governor execution decision
→ atomic execution lease
→ Task Context Pack creation or refresh
→ worker dispatch
```

The validator checks at least:

- the authorized Change Contract version is still valid;
- the task has not been cancelled;
- the task has not been superseded;
- relevant base Git commit or branch assumptions remain acceptable;
- dependencies remain satisfied;
- no newer approved task has replaced the same work;
- relevant product or architecture decisions have not invalidated the task;
- the requested work has not already been implemented by another change;
- the task still has authority to execute.

#### Recoverably Stale Work

If the task is stale but safely recoverable:

1. refresh repository assumptions;
2. rebase or update relevant base assumptions where appropriate;
3. refresh the Task Context Pack;
4. rerun applicable risk and policy evaluation;
5. proceed only when the refreshed work is valid.

#### Superseded Work

If the task has been replaced:

```text
status: SUPERSEDED
```

The system records:

- what replaced it;
- when;
- why.

No AI capacity should be consumed implementing obsolete work.

#### Material Change Contract Changes

If execution requires a material Change Contract change:

1. create or reference the new Change Contract version;
2. invalidate stale implementation authorization where applicable;
3. invalidate stale verification where applicable;
4. rerun the required authority and policy process.

### 6.5 Execution Claiming and Duplicate-Dispatch Prevention

The initial Control Plane uses PostgreSQL for durable atomic task claiming.

No separate distributed lock service is required initially.

Before a worker performs substantial execution:

```text
Eligible validated work
→ final AI Budget Governor authorization
→ atomic execution claim
→ execution lease acquired
→ Task Context Pack finalized
→ worker executes
```

The task claim must be atomic.

For an exclusive task, no second worker may acquire an active conflicting lease.

At minimum the system supports:

- stable idempotency keys;
- execution leases;
- lease ownership;
- lease acquisition timestamp;
- lease expiration;
- heartbeat or renewal where needed;
- maximum allowed concurrent execution count per task;
- duplicate-dispatch detection;
- safe retry after lease expiration.

Conceptually:

```text
worker atomically acquires execution lease
→ no second worker may execute the same exclusive task
→ worker completes
→ execution result recorded
→ lease closed
```

If the worker disappears:

```text
lease expires
→ system reconciles previous execution state
→ checks external side effects
→ determines whether retry is safe
→ work becomes eligible only when policy permits
```

Lease expiry alone does not prove that the previous external operation failed.

The system must reconcile relevant state before retrying.

#### External Side Effects

Retries must not accidentally create:

- duplicate paid AI execution;
- duplicate branches where uniqueness matters;
- duplicate commits representing the same operation;
- duplicate pull requests;
- duplicate release candidates;
- duplicate deployments;
- duplicate external side effects.

Side-effecting adapters should use stable idempotent operation identifiers where the external system supports them.

Where native idempotency is unavailable, the adapter must reconcile existing external state before creating a new resource or repeating the operation.

---

## 7. Sources of Truth

The architecture uses separate authoritative systems for different types of truth.

### Product Truth

Approved VocaNova product documentation in GitHub.

### Architecture and Decision Truth

Approved PDRs, ADRs, ODRs, governance amendments, and canonical technical documents in GitHub.

### Change Truth

The exact immutable Change Contract version authorized for implementation.

A draft may exist in the Control Plane.

The implementation-authorized version must have:

- a stable identifier;
- a version number;
- a content hash;
- a canonical immutable representation.

### Code Truth

GitHub.

### Workflow Truth

The VocaNova Control Plane PostgreSQL database.

### Evidence Truth

Original evidence systems plus immutable references recorded by the Control Plane.

Examples include:

- Git commit SHA;
- GitHub Actions run ID;
- verifier run ID;
- preview deployment ID;
- production deployment ID;
- Sentry event reference.

### Production Truth

Production systems, telemetry, monitoring, product analytics, and production databases.

The Control Plane may summarize production truth but must not pretend cached summaries are authoritative when live production evidence differs.

---

## 8. Persistent Product Knowledge

Canonical durable knowledge remains version controlled.

This includes:

- Product Bible;
- MVP PRD;
- personas;
- product principles;
- architecture documents;
- security model;
- ADRs;
- PDRs;
- ODRs;
- runbooks;
- known limitations;
- experiment records;
- incident reports;
- release history;
- governance documents.

The Control Plane maintains an indexed knowledge graph or retrieval index over these artifacts.

The index is derivative.

It is not the canonical authority.

Every meaningful workflow ends with these questions:

```text
Did product behavior change?
Did architecture change?
Was a new durable decision made?
Was an important limitation discovered?
Was something learned from production?
Should canonical knowledge be updated?
```

When the answer is yes, the system creates a governed documentation or decision-record task.

It does not silently rewrite canonical knowledge.

---

## 9. Control Plane Data Model

The initial relational model should include at least the following entities.

### `founder_requests`

Represents founder intent.

Core fields:

- `id`
- `source`
- `request_text`
- `created_at`
- `status`
- `linked_objective_id`
- `linked_change_id`

### `product_objectives`

Represents the outcome a change is intended to achieve.

### `decisions`

Represents:

- founder decisions;
- automated policy decisions;
- documented technical decisions.

Core fields include:

- decision type;
- authority;
- exact subject version;
- evidence;
- outcome;
- timestamp.

### `change_contracts`

Stable logical identity for a change.

### `change_contract_versions`

Immutable versions containing:

- version;
- content;
- hash;
- status;
- canonical repository reference.

### `tasks`

Executable units of work.

### `task_dependencies`

Directed dependencies between tasks.

### `work_queue_items`

Represents durable execution scheduling.

Core fields include:

- `id`
- `request_id`
- `task_id`
- `priority`
- `risk_classification`
- `required_worker_capability`
- `estimated_ai_usage`
- `execution_policy`
- `status`
- `waiting_reason`
- `earliest_eligible_at`
- `deadline_at`
- `retry_state`
- `budget_reservation_id`
- `superseded_by_work_item_id`
- `created_at`
- `updated_at`
- `last_prioritized_at`

### `execution_attempts`

Represents an individual controlled execution attempt.

Core fields include:

- `id`
- `work_queue_item_id`
- `task_id`
- `attempt_number`
- `idempotency_key`
- `lease_id`
- `lease_owner`
- `lease_acquired_at`
- `lease_expires_at`
- `heartbeat_at`
- `status`
- `started_at`
- `completed_at`
- `worker_capability`
- `provider`
- `external_operation_ids`
- `result_reference`
- `failure_reference`

The system also tracks the maximum allowed concurrent execution count per task or work-item class.

Exclusive tasks default to one active execution attempt.

### `budget_reservations`

Represents AI budget provisionally reserved for eligible work.

Core fields include:

- work-item reference;
- provider or capability scope where applicable;
- reserved amount or capacity estimate;
- expiry;
- status;
- final actual usage.

Budget reservation does not guarantee execution.

The AI Budget Governor may release or reallocate a reservation according to policy.

### `workflow_runs`

Durable workflow instances.

### `agent_runs`

Each AI execution.

Core fields:

- provider;
- worker adapter;
- model configuration;
- reasoning tier;
- context-pack reference;
- start/end time;
- result;
- estimated cost;
- actual cost where available;
- quota consumption.

### `context_packs`

Immutable Task Context Pack versions.

### `verification_packages`

Immutable verifier inputs.

### `verification_runs`

Independent-verifier executions.

### `verification_findings`

Structured findings with:

- severity;
- category;
- evidence;
- status;
- affected code;
- resolution reference.

### `test_runs`

References to deterministic test evidence.

### `pull_requests`

Repository PR references and exact reviewed SHA.

### `release_candidates`

Immutable release snapshots.

### `deployments`

Environment deployments.

### `rollout_steps`

Each staged production exposure step.

### `incidents`

Production incidents.

### `experiments`

Controlled product experiments.

### `budget_ledgers`

AI and infrastructure usage records.

### `policy_versions`

The exact operational policy versions applied to a decision.

### `capability_grants`

Auditable temporary or persistent system capabilities.

### `knowledge_updates`

Required canonical knowledge changes.

### `audit_events`

Append-oriented records of important actions.

---

## 10. Change Contract

Every meaningful feature, improvement, bug fix, technical change, or incident repair begins with a Change Contract when its risk requires one.

The exact complexity may vary by risk.

### 10.1 Required Structure

```yaml
id: VOC-###
version: 1
status: draft | authorized | implementing | verifying | completed | cancelled
content_hash: sha256:...

origin:
  type: founder_request | user_feedback | analytics | incident | autonomous_improvement
  references: []

problem:
  statement: ""
  affected_users: []
  evidence: []

desired_outcome:
  statement: ""
  success_metrics: []

authority_context:
  relevant_product_decisions: []
  relevant_architecture_decisions: []
  founder_decisions_required: []

scope:
  in_scope: []
  out_of_scope: []

requirements:
  functional: []
  non_functional: []

acceptance_criteria:
  - id: AC-01
    statement: ""
    verification_method: ""

edge_cases: []

analytics:
  required_events: []
  success_measurement: []

security:
  considerations: []
  required_checks: []

privacy:
  considerations: []
  data_classification: []

testing:
  unit: []
  integration: []
  e2e: []
  additional: []

risk:
  declared_class: R0 | R1 | R2 | R3 | R4
  protected_areas: []
  ehr_triggers_to_watch: []

release:
  proposed_class: RL1 | RL2 | RL3
  rollout_strategy: ""
  monitoring_requirements: []

rollback:
  strategy: ""
  trigger_conditions: []
  recovery_reference: ""

definition_of_completion: []

traceability:
  related_changes: []
  related_incidents: []
  related_releases: []
```

### 10.2 Version Lock

When work begins, the authorized Change Contract version is locked.

All of the following reference the exact version and hash:

- Work Queue item;
- freshness validation;
- Task Context Pack;
- builder run;
- pull request;
- deterministic evidence;
- Verification Package;
- release candidate.

A material contract change creates a new version and invalidates stale authorization or verification where policy requires re-evaluation.

---

## 11. Product and Specification Workflow

The default workflow is:

```text
Signal or founder request
        ↓
Retrieve relevant canonical knowledge
        ↓
Gather available evidence
        ↓
Define problem and desired outcome
        ↓
Draft Change Contract
        ↓
Detect unresolved decisions
        ↓
Apply approved defaults where safe
        ↓
Escalate only genuine founder-controlled decisions
        ↓
Classify risk
        ↓
Authorize exact Change Contract version
        ↓
Break into tasks and dependencies
        ↓
Place executable tasks into durable work queue
```

The Product and Specification role should use economical AI where practical.

It should not ask the founder questions when:

- existing documentation already answers them;
- an approved architectural rule applies;
- the choice is safely reversible;
- one option clearly follows established product principles.

It should escalate when a genuine R4 decision remains unresolved.

---

## 12. AI Budget Governor

The AI Budget Governor is a mandatory policy layer between autonomous workflows, the durable work queue, and AI execution providers.

Its objective is not merely to select the cheapest model for each call.

Its objective is:

> Maximize total successful, valuable work per available AI capacity and approved budget while preserving required quality and safety.

For every candidate AI task, the Governor determines:

- whether AI is required;
- whether the task should execute now;
- whether the task can safely wait;
- functional worker role;
- provider adapter;
- model or capability tier;
- reasoning effort;
- context budget;
- turn budget;
- retry allowance;
- escalation conditions;
- stop conditions;
- whether paid fallback is justified.

The Governor considers at least:

- task complexity;
- task urgency;
- task priority;
- task risk;
- expected benefit of immediate execution;
- whether safe deferral is possible;
- subscription-backed capacity remaining where observable;
- known or estimated provider quota availability;
- expected quota reset timing where available;
- provider health;
- provider execution-interface availability;
- metered API budget remaining;
- currently reserved budget;
- expected execution cost;
- probability that stronger execution will materially improve success.

The Governor distinguishes at least these provider conditions:

```text
AVAILABLE_WITH_CAPACITY
AVAILABLE_QUOTA_CONSTRAINED
PROVIDER_UNAVAILABLE
METERED_FALLBACK_AVAILABLE
APPROVED_ALTERNATE_AVAILABLE
```

The Governor must distinguish between:

```text
AI is technically suitable for this task
```

and:

```text
AI capacity should be consumed for this task now
```

### 12.1 Tier 0 — Deterministic Software

Use ordinary deterministic software instead of AI whenever it can reliably perform the required work.

Examples include:

- builds;
- type checking;
- linting;
- formatting;
- unit tests;
- integration tests;
- end-to-end tests;
- dependency scanning;
- schema validation;
- health checks;
- deployment checks.

### 12.2 Tier 1 — Economical Intelligence

Use economical capacity for:

- classification;
- summarization;
- retrieval assistance;
- feedback triage;
- routine reporting.

### 12.3 Tier 2 — Normal Engineering

Use the approved normal builder capability for routine engineering.

Codex is the initial primary implementation worker.

### 12.4 Tier 3 — Difficult Engineering

Escalate for:

- repeated implementation failure;
- difficult architecture;
- sensitive engineering;
- difficult migrations;
- serious incidents.

### 12.5 Tier 4 — Independent Cross-Model Verification

Use an independent verifier model family according to policy.

Claude is the initial primary independent verifier.

### 12.6 Capacity-Aware Default Policy

The default execution policy is:

```text
Normal non-urgent task
+ insufficient suitable included AI capacity
→ queue or defer until suitable capacity is available
```

```text
Urgent production incident
+ insufficient suitable included capacity
→ evaluate policy-approved stronger or metered fallback
```

```text
Critical task
→ prioritize quality and safety over saving a small amount of AI usage
```

Temporary exhaustion or reduction of included subscription capacity does not automatically authorize paid metered API usage.

The Governor must first determine whether waiting is safe.

### 12.7 Quota and Provider-Unavailability Behavior

`QUOTA` means:

- the provider is operational;
- the selected execution interface is functioning;
- suitable included capacity is temporarily unavailable.

Typical behavior:

```text
Normal non-urgent work
→ wait for capacity or expected reset
```

```text
Urgent work
→ evaluate policy-approved metered or alternate-capability fallback
```

`PROVIDER_UNAVAILABLE` means the selected provider or execution interface cannot currently perform the task because of conditions such as:

- provider outage;
- authentication failure;
- unavailable CLI or execution service;
- network failure;
- integration failure;
- unsupported execution interface.

Typical behavior:

```text
Short temporary outage
→ retry according to provider-recovery policy
```

```text
Extended outage
→ queue non-urgent work
```

```text
Urgent work
→ evaluate approved alternate provider or execution capability
```

Provider unavailability must not weaken independent-verification requirements.

If Claude is the required independent verifier and is unavailable:

```text
Codex implementation
+ Claude unavailable
→ wait for Claude
or
→ use another separately configured and validated
   policy-approved independent verifier
   from a different model family
```

Codex must not become its own independent verifier.

### 12.8 Paid Fallback Decision

Metered AI fallback may be used only when:

- the task is sufficiently urgent or valuable;
- the relevant operational policy permits paid fallback;
- sufficient metered budget remains;
- required capability is technically available;
- expected benefit justifies the cost.

Every paid fallback decision records:

- work item;
- reason included capacity was unsuitable or unavailable;
- whether the reason was quota or provider unavailability;
- urgency and priority;
- expected cost;
- remaining approved budget;
- policy version authorizing fallback;
- actual cost where available.

---

## 13. Model and Reasoning Escalation

The Control Plane treats provider and model names as configuration.

Workflow definitions refer to capabilities such as:

```text
economy_classifier
normal_builder
advanced_builder
normal_verifier
deep_verifier
```

The AI Budget Governor maps those capabilities to currently approved providers and models.

### Escalation Rules

Escalation requires new evidence.

Valid escalation triggers include:

- deterministic failure evidence;
- unresolved verifier findings;
- repeated implementation failure;
- materially increased risk;
- insufficient context confidence;
- security-sensitive complexity.

The system must not repeatedly resend an identical prompt after failure.

Each retry should include new evidence explaining what failed.

Stronger reasoning should be used only when cheaper execution is insufficient or risk policy requires it.

Execution escalation and capacity fallback are related but distinct.

A task must not be escalated to a more expensive capability solely because the preferred subscription-backed capacity is temporarily unavailable.

The decision sequence is:

```text
Preferred capability unavailable
        ↓
Is this QUOTA or PROVIDER_UNAVAILABLE?
        ↓
Can the task safely wait?
   │              │
  Yes             No
   │              │
Queue/defer    Evaluate permitted fallback
                  ↓
         Budget and benefit justify cost?
             │                 │
            Yes                No
             │                 │
          Execute          Hold/escalate
```

A task requiring stronger reasoning for safety or correctness may still escalate regardless of whether cheaper capacity is available.

Critical quality escalation must not be suppressed merely to conserve a small amount of AI usage.

---

## 14. Task Context Packs

Before substantial implementation work, the Control Plane creates an immutable focused Task Context Pack.

The Task Context Pack is created or refreshed only after:

1. the work item becomes eligible;
2. freshness and authority validation succeeds;
3. the AI Budget Governor authorizes execution;
4. the worker acquires the required execution lease.

### 14.1 Structure

```yaml
pack_id: TCP-###
version: 1

change_contract:
  id: VOC-###
  version: 1
  hash: sha256:...

task:
  id: TASK-###
  objective: ""
  deliverables: []

repository:
  base_branch: develop
  base_sha: ""
  relevant_paths: []

product_context:
  decisions: []
  requirements: []

architecture_context:
  decisions: []
  constraints: []

interfaces:
  affected: []

acceptance_criteria: []

required_tests: []

known_risks: []

prohibited_scope:
  - unrelated refactoring
  - unauthorized architecture change
  - unauthorized product scope expansion

expected_evidence: []

execution_budget:
  context_limit: policy-reference
  turn_limit: policy-reference
  retry_limit: policy-reference
```

Only relevant material should be included.

The worker should not repeatedly rediscover the entire repository when focused retrieval is sufficient.

---

## 15. Builder Abstraction

The Control Plane uses a common implementation-worker interface.

Conceptually:

```text
prepare(task_context_pack)
execute(idempotency_key, lease)
resume_with_failure_evidence()
collect_result()
cancel()
```

A worker result should include:

- implementation summary;
- changed files;
- commits;
- tests added or changed;
- known limitations;
- unresolved concerns;
- exact resulting SHA.

This allows future replacement or addition of:

- Claude Code;
- Devin;
- GitHub coding agents;
- other future systems.

---

## 16. Codex Builder Workflow

Codex is initially the primary implementation worker.

The default flow is:

```text
Eligible validated task
        ↓
AI Budget Governor authorizes execution
        ↓
Atomic execution lease acquired
        ↓
Task Context Pack created or refreshed
        ↓
Create or reconcile isolated branch/worktree
        ↓
Inspect focused repository context
        ↓
Implement bounded scope
        ↓
Add or update tests
        ↓
Run available local deterministic checks
        ↓
Create or reconcile commit state
        ↓
Open, update, or reconcile pull request
        ↓
Return exact implementation evidence
        ↓
Close execution lease
```

Codex must:

- remain within the Change Contract;
- avoid unrelated refactoring;
- preserve approved architecture;
- add appropriate tests;
- report uncertainty;
- never approve its own work;
- never deploy directly to production.

Retries must use the execution attempt's idempotency key and reconcile existing GitHub state before creating new side effects.

---

## 17. GitHub Development Workflow

### 17.1 Permanent Branches

```text
develop
main
```

`develop` is the integrated development and staging state.

`main` is production-ready and the sole normal production source.

### 17.2 Working Branches

Use short-lived branches such as:

```text
change/VOC-123-short-description
```

Each implementation worker should use an isolated worktree or equivalent isolated checkout.

Branch, commit, and pull-request creation operations should use stable operation identities or reconciliation logic so retries do not create unintended duplicate resources.

### 17.3 Pull Requests to `develop`

A PR includes:

- Change Contract reference and exact version;
- implementation summary;
- risk classification;
- affected protected areas;
- deterministic evidence;
- verifier evidence;
- exact reviewed head SHA.

A retry must detect an existing equivalent PR before creating another one.

### 17.4 Automatic Merge

A PR may merge automatically into `develop` only when:

- branch protection permits it;
- all required checks pass;
- required verification passes;
- no blocking conversation remains;
- the exact reviewed SHA is still current;
- no EHR state exists;
- required founder decisions are already satisfied;
- the current policy permits automatic merge.

A changed head SHA invalidates stale exact-SHA verification where required.

### 17.5 Promotion to `main`

Promotion uses an immutable release candidate rather than arbitrary branch state.

The release operation identifies exactly what `develop` state is being promoted.

---

## 18. Deterministic CI

The installed deterministic verification stack should grow with the product.

Applicable checks may include:

- dependency installation integrity;
- formatting;
- linting;
- TypeScript type checking;
- unit tests;
- integration tests;
- contract tests;
- application build;
- end-to-end tests;
- accessibility tests;
- schema validation;
- migration checks;
- dependency vulnerability scanning;
- secret scanning;
- governance validation;
- release-policy validation;
- preview health checks.

The Control Plane computes the required gate set from:

- changed paths;
- semantic risk;
- Change Contract requirements;
- policy version.

No AI verdict may convert a failed mandatory deterministic check into a passing result.

---

## 19. Verification Packages

Claude should receive a focused Verification Package rather than uncontrolled repository context.

### 19.1 Structure

```yaml
verification_id: VER-###

change_contract:
  id: VOC-###
  version: 1
  hash: sha256:...

implementation:
  repository: KARSIFT/vocanova-platform
  base_sha: ""
  head_sha: ""
  pull_request: ""
  changed_files: []

diff_summary: ""

relevant_context:
  product_decisions: []
  architecture_decisions: []
  surrounding_code: []

deterministic_evidence:
  test_runs: []
  build_runs: []
  policy_checks: []

risk:
  effective_class: R0 | R1 | R2 | R3 | R4
  protected_areas: []

review_requirements:
  specification_compliance: true
  architecture: true
  security: conditional
  privacy: conditional
  accessibility: conditional
  performance: conditional
  analytics: conditional
  unintended_behavior: true

known_limitations: []

required_output:
  verdict:
    - PASS
    - PASS_WITH_NON_BLOCKING_FINDINGS
    - FAIL
```

---

## 20. Claude Independent Verification Workflow

Claude is initially the primary independent verifier.

Claude reviews:

- exact Change Contract version;
- exact implementation SHA;
- diff;
- relevant surrounding code;
- applicable architecture decisions;
- deterministic evidence;
- security implications;
- privacy implications;
- accessibility where relevant;
- performance where relevant;
- analytics instrumentation;
- unintended behavior;
- scope expansion.

Claude must not rely solely on the builder's summary.

The normal outcome is one of:

```text
PASS
PASS WITH NON-BLOCKING FINDINGS
FAIL
```

Blocking findings must include:

- severity;
- evidence;
- affected requirement;
- required correction.

The verifier may raise the risk classification.

It may not independently lower a deterministic risk floor.

If the preferred verifier is unavailable, the workflow waits or uses another separately configured and validated policy-approved independent verifier from a different model family.

The builder must never substitute for the required independent verifier.

---

## 21. Bounded Repair and Retry Loop

When deterministic verification or independent verification fails:

```text
Failure evidence
        ↓
Structured repair request
        ↓
Controlled new execution attempt
        ↓
Atomic lease acquisition
        ↓
Codex repair
        ↓
Deterministic checks rerun
        ↓
Focused Verification Package updated
        ↓
Claude re-verifies relevant changes
```

The loop is bounded by operational policy.

Mandatory rules are:

- every retry includes new failure evidence;
- identical failed prompts are not repeated;
- retry count is finite;
- retries do not create uncontrolled parallel duplicate execution;
- lease expiry requires reconciliation before safe retry;
- repeated failure escalates rather than recursing indefinitely;
- material scope changes return to specification;
- unresolved high-risk uncertainty may trigger EHR;
- budget exhaustion places the workflow on hold.

Retries must not accidentally create duplicate:

- paid AI executions;
- commits;
- pull requests;
- releases;
- deployments;
- external side effects.

---

## 22. Preview and Staging Environments

### Preview

Deployable pull requests should receive isolated preview environments where appropriate.

Preview environments:

- use non-production credentials;
- use isolated or safe non-production data;
- expose health status to the Control Plane.

### Staging

Successful integration into `develop` deploys to staging after staging automation is technically activated.

Staging should approximate production sufficiently to validate:

- critical user journeys;
- configuration;
- migrations;
- external integrations;
- monitoring;
- rollback behavior where practical.

Preview and staging must never receive unrestricted production credentials merely for convenience.

---

## 23. Release Readiness State Machine

The formal release state machine is:

```text
DEVELOPING
    ↓
FEATURE_COMPLETE
    ↓
RELEASE_CANDIDATE
    ↓
READY_TO_PUBLISH
    ↓
GOING_TO_PUBLISH
    ↓
PUBLISHING
    ↓
LIVE_MONITORING
    ↓
HEALTHY
```

Exceptional states include:

```text
BLOCKED
HELD
EHR_REQUIRED
FAILED
ROLLBACK_IN_PROGRESS
ROLLED_BACK
CANCELLED
```

### DEVELOPING

One or more included changes remain under implementation or verification.

### FEATURE_COMPLETE

Included Change Contracts have satisfied implementation acceptance criteria and required development verification.

### RELEASE_CANDIDATE

An immutable candidate has been created from an exact source revision.

### READY_TO_PUBLISH

Every mandatory readiness gate has objectively passed.

### GOING_TO_PUBLISH

Release policy has authorized or scheduled deployment.

This state is distinct from readiness.

### PUBLISHING

A production rollout is actively in progress.

### LIVE_MONITORING

The candidate is live at some or all intended production exposure and is inside its required observation period.

### HEALTHY

Required rollout has completed and defined health conditions remain acceptable.

---

## 24. Objective READY TO PUBLISH Gates

READY TO PUBLISH is calculated by the Release Controller.

It must not depend solely on an AI saying a release is ready.

### Product Gates

- agreed scope complete;
- acceptance criteria passed;
- no blocker product issue remains.

### Engineering Gates

- required build passes;
- required type checking passes;
- required unit tests pass;
- required integration tests pass;
- required migration checks pass;
- required security checks pass.

### User Experience Gates

Where applicable:

- critical end-to-end journeys pass;
- required mobile/responsive journeys pass;
- accessibility baseline passes.

### Independent Verification Gate

- required Claude verification passes;
- all blocking findings are resolved.

### Operations Gates

- required preview or staging is healthy;
- monitoring exists;
- release configuration is valid;
- rollback path exists;
- required rollback evidence exists.

### Authority Gates

- no active EHR state;
- required R4 founder decisions are approved;
- founder-controlled RL3 events are approved;
- any other explicit protected condition is satisfied.

Only after all applicable mandatory gates pass may the state become:

```text
READY_TO_PUBLISH
```

---

## 25. Release-Class Behavior

### RL1 — Routine

Default behavior:

- automatic authorization when all gates pass;
- minimal safe staged rollout;
- automated health checks;
- automatic expansion when healthy;
- automatic rollback when predefined conditions fail.

### RL2 — Significant

Default behavior:

- stronger staging evidence;
- stronger independent verification where appropriate;
- slower or more granular staged rollout;
- longer observation requirements;
- stronger rollback evidence.

RL2 still publishes automatically when policy gates pass.

### RL3 — Protected or Major

RL3 receives enhanced release controls.

Founder approval is required only when:

- an R4 decision is involved;
- the event is explicitly classified as founder-controlled;
- another approved policy explicitly requires founder authorization.

A release must not be escalated to founder approval merely because it contains technically complex R3 implementation.

---

## 26. Staged Production Rollout

Production releases use staged exposure where the platform supports safe staged delivery.

The Release Controller:

1. deploys the candidate to an initial exposure stage;
2. evaluates health;
3. expands exposure automatically when thresholds remain healthy;
4. pauses expansion when evidence is ambiguous;
5. rolls back automatically when predefined rollback conditions are met.

Exact:

- exposure percentages;
- observation periods;
- health thresholds;

belong in version-controlled operational policy.

---

## 27. Automatic Rollback

Automatic rollback is permitted when:

- the rollback mechanism was pre-approved;
- the mechanism has been tested or otherwise demonstrated;
- waiting would create greater risk;
- rollback is safer than continuation.

Possible triggers include:

- major error-rate regression;
- critical availability failure;
- failed health checks;
- severe latency regression;
- explicit application safety invariant failure.

Rollback:

- preserves failed-release evidence;
- creates or updates an incident;
- records the last known-good version;
- does not automatically declare the underlying problem solved.

---

## 28. Sentry Feedback Loop

Sentry is the primary initial application-error monitoring integration.

The Control Plane should ingest relevant events or alerts such as:

- new high-severity errors;
- regression detection;
- release-associated error spikes.

The incident pipeline is:

```text
Sentry signal
→ Normalize
→ Deduplicate
→ Classify
→ Associate with release/change
→ Create or update incident
→ Apply incident policy
```

AI workers should receive only the minimum production information necessary for investigation.

Sensitive production data should be minimized or redacted before inclusion in AI context.

---

## 29. PostHog Feedback Loop

PostHog is the initial product-analytics and feature-flag integration.

The Control Plane may use approved PostHog data for:

- adoption measurement;
- funnel regression detection;
- feature success measurement;
- experiment outcomes;
- rollout control through feature flags where appropriate.

Product analytics should inform changes but should not automatically override approved product strategy.

Significant autonomous product-improvement proposals still pass through Change Contracts and applicable decision authority.

---

## 30. Autonomous Incident Investigation and Repair

The target loop is:

```text
Production signal
        ↓
Detect and deduplicate
        ↓
Classify severity and blast radius
        ↓
Immediate reversible containment if authorized
        ↓
Create incident
        ↓
Gather production evidence
        ↓
Attempt reproduction
        ↓
Create or update Change Contract
        ↓
Create or update queued repair task
        ↓
Freshness and authority validation
        ↓
AI Budget Governor authorization
        ↓
Execution lease acquisition
        ↓
Create Task Context Pack
        ↓
Codex implementation
        ↓
Deterministic verification
        ↓
Claude independent verification
        ↓
Release according to policy
        ↓
Production monitoring
        ↓
Incident closure
        ↓
Knowledge update
```

Routine low-risk incidents may complete this loop autonomously.

R4 or EHR conditions interrupt the workflow appropriately.

---

## 31. Security and Capability Boundaries

The system follows least privilege.

### Founder AI

May:

- read approved status;
- submit requests;
- submit authenticated founder decisions through controlled endpoints.

Must not receive:

- unrestricted production credentials;
- raw infrastructure administrator credentials.

### Codex Builder

May receive:

- isolated workspace;
- scoped repository branch permissions;
- required non-production test credentials.

Must not receive routine:

- production deployment credentials;
- production database write access;
- unrestricted organization administration.

### Claude Verifier

Normally receives:

- read-only repository context;
- diff;
- verification evidence.

It should not need:

- merge authority;
- production deployment authority;
- broad production write permissions.

### Release Controller

Receives narrowly scoped deployment capabilities.

It must not need authority to rewrite source code or approval policy.

### n8n

Acts as an orchestration helper.

It is not the canonical workflow state authority and must not own broad master credentials.

---

## 32. Credential Architecture

Prefer:

- short-lived credentials;
- scoped GitHub App permissions;
- environment-specific deployment credentials;
- separate agent identities;
- production secrets unavailable to implementation workers;
- capability grants issued per task where practical.

The Control Plane should mediate sensitive actions through typed capabilities rather than handing general-purpose agents reusable master credentials.

Every sensitive capability should be auditable.

---

## 33. Kill Switches

Authorized maintainers must be able to independently disable:

- founder-interface write actions;
- product/specification automation;
- agent dispatch;
- automatic merge;
- preview deployment;
- staging deployment;
- production deployment;
- staged rollout expansion;
- automatic rollback.

Disabling one capability should not require disabling the entire Control Plane.

---

## 34. Traceability

Every meaningful production change should retain this chain:

```text
Founder request or observed signal
→ Product objective
→ Approved VocaNova decision
→ Change Contract version
→ Task
→ Work Queue item
→ Freshness and authority validation
→ Execution attempt and lease
→ Task Context Pack
→ Agent run
→ Code change
→ Deterministic evidence
→ Verification Package
→ Independent verification
→ Pull request
→ Release candidate
→ Deployment
→ Production outcome
```

No unexplained production change is permitted.

---

## 35. AI Usage and Cost Monitoring

Every AI run records:

- workflow;
- change;
- task;
- execution attempt;
- provider;
- model configuration;
- reasoning tier;
- provider availability state;
- quota state where observable;
- input size where available;
- output size where available;
- execution duration;
- retries;
- estimated cost;
- actual metered cost when available;
- subscription quota impact where observable.

The Founder AI should be able to report:

- current month AI usage;
- usage by provider;
- usage by change;
- unusually expensive tasks;
- retry waste;
- budget remaining;
- queued work waiting because of quota;
- queued work waiting because of budget;
- queued work waiting because of provider unavailability.

Approaching policy thresholds should reduce or pause non-critical autonomous work before hard budget limits are exceeded.

---

## 36. Initial Low-Cost Implementation

The initial implementation should remain deliberately small.

### Recommended Stack

#### Founder Interface

- ChatGPT as the normal founder-facing AI;
- MCP interface through the Founder Interface Adapter;
- HTTPS API as a stable fallback and integration surface.

#### Control Plane

- TypeScript;
- Node.js;
- lightweight API framework;
- PostgreSQL;
- a small worker process for durable polling, atomic claiming, and task execution.

#### Orchestration

- n8n where visual integrations and simple orchestration provide value;
- ordinary TypeScript workflow code for core safety-critical state transitions.

#### Engineering

- GitHub;
- GitHub Actions;
- Codex as the primary builder;
- Claude as the primary verifier.

#### Operations

- Cloudflare for VocaNova deployment infrastructure where already planned;
- Sentry;
- PostHog.

#### Initial Hosting

A small private VPS may initially host:

- Control Plane API;
- Control Plane worker;
- PostgreSQL;
- self-hosted n8n.

The system should use backups from the beginning.

The initial goal is to prove the workflow, not build enterprise infrastructure.

PostgreSQL atomic claims and leases are sufficient for the initial duplicate-execution prevention design.

No additional distributed locking infrastructure is required unless later operational evidence proves it necessary.

---

## 37. Subscription-First AI Strategy

The initial implementation should use the founder's existing ChatGPT Plus and Claude Pro capacity as much as is practical, permitted, technically suitable, and reliably accessible.

The architecture must distinguish:

```text
subscription-backed capacity
```

from:

```text
reliably automatable unattended execution capacity
```

These are not assumed to be equivalent.

The system must not assume:

- subscription capacity is unlimited;
- quota availability is constant;
- exact reset times are always known;
- subscription-backed execution is always available through a reliable unattended interface.

The preferred execution sequence is:

```text
1. Prefer deterministic software when possible.
2. Prefer approved included subscription-backed AI capacity
   when suitable and technically supported.
3. If included capacity is temporarily unavailable because of quota,
   determine whether the task can safely wait.
4. If the provider or execution interface is technically unavailable,
   apply provider-recovery policy separately from quota policy.
5. Queue non-urgent work instead of automatically consuming
   metered API budget.
6. Use metered or alternate-provider fallback only when urgency
   or expected value justifies it, policy permits it,
   and sufficient budget remains.
7. Record every fallback decision and its reason.
```

Critical workflows must not depend exclusively on subscription-backed execution where no sufficiently reliable unattended interface exists.

For such workflows, the architecture should support a policy-approved reliable fallback while still preferring included capacity when practical.

The durable work queue and AI Budget Governor together allow VocaNova to use limited subscription capacity efficiently rather than forcing all work to execute immediately.

---

## 38. n8n and Temporal

n8n may initially orchestrate:

- webhooks;
- notifications;
- simple integration sequences;
- non-critical scheduled workflows.

The Control Plane database remains the source of workflow truth.

Core workflow state transitions must not exist only inside an opaque n8n execution.

The architecture should expose a workflow-engine abstraction.

Temporal should be introduced only when real operating evidence shows that VocaNova needs stronger durable-workflow semantics.

Possible triggers include:

- many long-running workflows;
- significant workflow recovery complexity;
- high concurrency;
- complicated compensation logic;
- repeated reliability problems with the simpler approach.

Migration to Temporal must not change the founder-facing experience.

---

## 39. Operational Policy Layer

Configurable operational policy should remain separate from this architecture.

Initial policy domains include:

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

Policies contain configurable details such as:

### AI Budget Policy

- monthly metered limits;
- task-level spend limits;
- budget reservations;
- warning thresholds.

### AI Capacity and Fallback Policy

- approved subscription-backed execution methods;
- quota estimation rules;
- expected reset handling;
- provider health classification;
- provider-recovery timing;
- safe-deferral rules;
- paid fallback eligibility;
- alternate-provider eligibility;
- independent-verifier fallback requirements.

### Work Queue Policy

- priority ordering;
- age-based reprioritization;
- scheduling windows;
- starvation prevention;
- emergency preemption;
- maximum queue age;
- deadlines.

### Retry Policy

- retry limits;
- execution lease duration;
- heartbeat intervals;
- lease-expiration handling;
- reconciliation before retry;
- duplicate-dispatch rules.

### Capability Policy

- maximum concurrent execution count;
- exclusive versus parallelizable task classes;
- side-effect idempotency requirements.

### Release and Incident Policies

- rollout percentages;
- observation periods;
- health thresholds;
- incident severity thresholds;
- automatic rollback thresholds.

Policy versions are recorded with each affected automated decision.

---

## 40. Technical Activation Levels

VocaNova should activate autonomy progressively.

### Level 0 — Observe

Control Plane records state but performs no autonomous write actions.

### Level 1 — Coordinate

Founder requests, Change Contracts, durable queueing, and status are managed through the Control Plane.

### Level 2 — Build

Codex can autonomously implement approved bounded tasks after freshness validation, AI authorization, and safe execution claiming.

### Level 3 — Verify and Merge

Claude verification and policy-based automatic merge into `develop` are active.

### Level 4 — Stage

Preview and staging deployment are automated.

### Level 5 — RL1 Production

Automatic RL1 production release and rollback are active.

### Level 6 — RL2 Production

Automatic RL2 staged production release is active.

### Level 7 — Autonomous Incident Repair

Eligible incidents can execute the governed repair loop automatically.

Each level requires explicit evidence that its technical controls have been implemented and tested.

Governance permission alone does not activate a level.

---

## 41. Architecture Success Criteria

The architecture is successfully implemented when the founder can issue a normal request through ChatGPT and the system can, within policy:

```text
Understand request
→ Retrieve VocaNova context
→ Create Change Contract
→ Resolve or escalate decisions
→ Place executable work in the durable queue
→ Prioritize and schedule work
→ Task becomes eligible
→ Revalidate freshness and execution authority
→ Evaluate provider health, capacity, quota, and budget
→ AI Budget Governor authorizes execution
→ Atomically acquire execution lease
→ Create or refresh Task Context Pack
→ Dispatch Codex
→ Run deterministic CI
→ Create Verification Package
→ Dispatch Claude
→ Repair bounded failures safely
→ Merge exact verified SHA
→ Deploy to staging
→ Create release candidate
→ Evaluate objective readiness
→ Release automatically when authorized
→ Monitor production
→ Roll back or investigate when necessary
→ Report concise verified status to the founder
```

The founder should normally be able to complete this operating relationship without using the GitHub user interface for routine engineering activity.

The ultimate operating goal remains:

> I talk to one AI about VocaNova; behind that AI, an autonomous software-development organization does the work.
