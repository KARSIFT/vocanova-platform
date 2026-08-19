# Read-only merge eligibility

This directory owns the provider-neutral, deterministic policy decision introduced by
VOC-079. `evaluator.py` consumes only normalized version-1 JSON evidence and returns
`eligible` or `blocked` with stable reason codes. It has no network client, credential,
merge path, or GitHub write operation.

`github_adapter.py` is the separate read-only boundary used by the Governance workflow.
It reads the pull-request event, package metadata, check runs, changed files, formal
reviews, top-level PR conversation comments, and inline review comments; binds the
declared review URL to a live record that contains the exact head SHA and a passing
verdict; combines those facts with the machine-readable evidence block in the PR
body; and writes the decision and reasons only to the Actions job summary. A
blocked decision is a valid policy result, so the reporting job succeeds; malformed
input, API failure, or adapter failure makes the job fail closed. A future merge actor
must consume and revalidate the exact-SHA result separately. Nothing here approves,
comments, merges, dispatches, or mutates GitHub.

The reporting-job exit code describes adapter execution, not merge eligibility:
well-formed `eligible` and `blocked` decisions both exit zero and appear explicitly in
the summary; an adapter error exits nonzero. A green reporting job is therefore not an
eligibility grant. No executor may infer the decision from the job conclusion alone.
The standalone pure-evaluator CLI is intentionally different: it exits one for a
`blocked` decision so command-line policy checks fail closed.

GitHub confirms that the evidence URL is a live record with the exact SHA and PASS
verdict. Role identity remains recorded provenance rather than cryptographic hosted
identity enforcement, because an external human or AI reviewer may not own the GitHub
account that records its report. The adapter does not claim stronger attribution than
the available evidence provides; a future orchestrator may add signed provenance under
a separately adopted contract.

The PR body block has this form:

```text
<!-- merge-eligibility-evidence-v1
{"builder":{"identity":"...","role":"implementer"},"reviewer":{"identity":"...","role":"independent-reviewer","reviewed_sha":"<40-char SHA>","verdict":"pass","blocking_findings_resolved":true,"evidence_url":"https://..."},"risk_evidence":{"decision_record":true,"impact_assessment":true,"contingency_plan":true,"specialist_evidence":true,"deterministic_evidence":true},"ehr":{"active":false},"action_authority":[]}
-->
```

The role identities describe the actual builder and independent reviewer, whether human
or agent. They are not permanent vendor assignments. PR prose is parsed as data and is
never interpolated into a shell command.

`schema-v1.json` defines the structural contract. The evaluator additionally applies
cross-field semantics that JSON Schema alone does not express, including different
builder/reviewer identities and roles, exact-head binding, passing checks, complete R4
evidence, cleared EHR, and satisfied action holds.

The committed eligible and blocked R4 files are pure-evaluator fixtures and therefore
use a synthetic canonical-shaped `VOC-999-policy-fixture` path. They do not describe
VOC-079's real package, whose pre-transition `automatic_merge_allowed: false` opt-out is
intentional. Live adapter input must identify a real package whose `change.yaml` exposes
top-level scalar `risk` and `automatic_merge_allowed` keys. The dependency-free adapter
parses that deliberately restricted canonical subset and fails closed on unsupported or
missing package metadata.

The package risk is the adopted planning floor. The PR declaration may equal or raise
that floor when changed paths or independent review identify higher consequences, but
it may never lower it. The hosted adapter waits up to the CI workflow's 30-minute
validation contract before reporting missing or incomplete check evidence.
