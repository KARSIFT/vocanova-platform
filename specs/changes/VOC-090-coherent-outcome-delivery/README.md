# VOC-090 — Coherent Outcome Delivery

Status: draft planning package only. GitHub issue
[#143](https://github.com/KARSIFT/vocanova-platform/issues/143) authorizes preparation
and review of this plan; it does not adopt the package or authorize implementation,
merge, repository-setting mutation, deployment, or any live/external effect.

Repository guidance currently pulls in two directions. DOC-15 requires one coherent
objective and prohibits artificially splitting work, while its task example decomposes
one outcome by technical layer. DOC-10 additionally gives fixed preferred changed-line
ranges and says changes over 800 lines are normally split. Approved, forward-looking
DOC-12 and DOC-09 prescribe the same six-part future P3/AI work as a mandatory and a
recommended pull-request sequence. The active templates do not explain that task IDs
are minimum-sufficient traceability/evidence groupings rather than branch or pull-
request units. The resulting ambiguity can multiply coordination, validation,
exact-SHA review, hosted-check, merge, time, and token cost without reducing outcome,
rollback, or security risk.

This package proposes one atomic governance/process reconciliation. Planners must
select the largest safe coherent delivery unit containing every backend, frontend,
contract, test, documentation, rollback, and evidence layer that shares one approved
user or business outcome and control boundary. That unit defaults to one approved
change package, one implementation pull request, and one minimum-sufficient task. Task
IDs map requirements, acceptance criteria, tests, ownership, sequence, and evidence;
they do not imply separate branches or pull requests. Splitting is exceptional and
requires evidence of independently releasable and rollback-safe outcomes, a material
risk or action-authority boundary, a hard dependency, incompatible reviewer/owner
needs, or a demonstrated cognitive/reviewability limit. Component count, test layers,
documentation updates, convenience, and fixed line counts do not require a split. Any
plan proposing multiple
implementation pull requests must record a concrete written rationale that compares
those benefits with coordination, elapsed-time, token, repeated-check, bookkeeping,
and exact-review overhead.

The later implementation is deliberately one pull request and one minimum-sufficient
task, `VOC-090-T00`, because the full reconciliation is the largest safe coherent unit.
It reconciles every affected living guidance/template surface and adds a narrow
deterministic regression guard. Unrelated-scope separation,
reviewability, risk classification, rollback, security, different-actor exact-revision
review, complete R4 evidence, EHR, and separately applicable action-specific authority
remain unchanged.

The semantic policy effect would otherwise be R3 governance/process guidance, but the
unchanged path classifier assigns DOC-15 an R4 floor. Effective risk is therefore R4.
The package does not weaken that floor and requires complete decision, impact,
contingency, specialist, deterministic, and exact-revision independent-review evidence.
No R4 label creates founder or standing technical-steward approval.

`automatic_merge_allowed: true` was explicitly examined under the current drafting
default. It is read-only package policy metadata, not a merge instruction or authority
bypass. No current workflow performs automatic merge.

## Plan review history

Exact candidate `98fd6f4f8c194e8ff1c0463b58efbf9d7780f62f` received an independent
general/R4 **FAIL** on
[PR #144 comment 5392546514](https://github.com/KARSIFT/vocanova-platform/pull/144#issuecomment-5392546514)
because the active-surface inventory omitted DOC-12's mandatory future P3 six-PR order
and DOC-09's recommended AI six-PR sequence. That verdict is immutable history and is
not reinterpreted as approval. This amended candidate adds both active documents and
requires their six items to become ordered non-PR implementation components inside the
default coherent PR, unless a future adopted package records a D03–D05-compliant,
overhead-aware multi-PR exception. Fresh exact-SHA general and specialist review remain
required.
