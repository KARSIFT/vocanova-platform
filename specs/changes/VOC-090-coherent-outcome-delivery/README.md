# VOC-090 — Coherent Outcome Delivery

Status: draft planning package only. GitHub issue
[#143](https://github.com/KARSIFT/vocanova-platform/issues/143) authorizes preparation
and review of this plan; it does not adopt the package or authorize implementation,
merge, repository-setting mutation, deployment, or any live/external effect.

Repository guidance currently pulls in two directions. DOC-15 requires one coherent
objective and prohibits artificially splitting work, while its task example decomposes
one outcome by technical layer. DOC-10 additionally gives fixed preferred changed-line
ranges and says changes over 800 lines are normally split. The active templates do not
explain that task IDs are minimum-sufficient traceability/evidence groupings rather
than branch or pull-request units. The resulting ambiguity can multiply coordination,
validation, exact-SHA review, hosted-check, merge, time, and token cost without reducing
outcome, rollback, or security risk.

This package proposes one atomic governance/process reconciliation. The default
delivery unit becomes one approved change package and one implementation pull request
for one coherent user or business outcome. A package uses the minimum number of stable
task IDs needed to map requirements, acceptance criteria, tests, ownership, sequence,
and evidence; task IDs do not imply separate branches or pull requests. Splitting is
driven by independently releasable and rollback-safe outcomes, material risk or
action-authority boundaries, hard dependencies, incompatible reviewer/owner needs, or
a genuinely unreviewable diff. Component count, test layers, documentation updates,
and fixed line counts do not require a split. Any plan proposing multiple
implementation pull requests must record a concrete written rationale that compares
those benefits with coordination, elapsed-time, token, repeated-check, bookkeeping,
and exact-review overhead.

The later implementation is deliberately one pull request and one minimum-sufficient
task, `VOC-090-T00`, reconciling every affected living guidance/template surface and
adding a narrow deterministic regression guard. Unrelated-scope separation,
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
