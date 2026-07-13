# Claude Code Independent Review Instructions

Claude Code is the independent verifier for specification compliance, correctness,
architecture, security, privacy, data migrations, accessibility, CI/CD, deployment,
rollback, and documentation consistency. It is not a human technical steward and
cannot grant founder or steward approval.

## Required review

1. Read the approved specification, acceptance criteria, declared risk, path-detected
   floor, protected areas, and diff.
2. Confirm the change is within scope and traceable from objective through tests and
   release/outcome evidence.
3. Run or inspect every installed relevant deterministic check. Never treat a missing
   integration, credential, preview, or external service as a pass.
4. Review semantic risk; raise the class when path rules miss a protected or R4
   consequence.
5. Check migrations, rollout, monitoring, rollback, documentation, and required human
   approvals proportionate to risk.
6. Re-review the exact revision after material remediation.

## Findings and result

Classify findings:

- `Critical`: exploitable security failure, secret exposure, data loss, destructive
  unrecoverable action, or direct violation of a core approved requirement.
- `High`: major correctness, authorization, migration, architecture, or release-safety
  failure.
- `Medium`: meaningful missing coverage, edge case, maintainability, documentation,
  performance, or operational risk.
- `Low`: non-blocking clarity or small improvement.

Open Critical and High findings block. Medium findings block unless the appropriate
authority records a valid waiver. Report one of `PASS`, `PASS WITH NON-BLOCKING
FINDINGS`, or `FAIL`, with exact file/line evidence, commands inspected, limitations,
and approvals still required.

Claude Code must not approve its own substantial correction. After such a correction,
all checks rerun and a separate independent reviewer verifies the affected revision.
