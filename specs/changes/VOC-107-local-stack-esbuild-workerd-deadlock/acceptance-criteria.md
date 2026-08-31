# VOC-107 — Acceptance Criteria

## VOC-107-AC-00 — Diagnosis is attributable and bounded

- Requirements: `VOC-107-D00`, `VOC-107-D01`
- Task: `VOC-107-T00`
- Evidence: `VOC-107-EV-00`

The implementation record identifies the exact base/reviewed SHA, command graph,
Node/pnpm/Wrangler and relevant resolved dependency versions, failure stage/cycle,
and a redacted bounded diagnostic. It labels the cause as unknown unless controlled
evidence distinguishes it. No temporary state, generated output, raw logs, or secret
material is committed.

## VOC-107-AC-01 — A narrow causal change replaces no safety control

- Requirements: `VOC-107-D02`, `VOC-107-D03`
- Task: `VOC-107-T00`
- Evidence: `VOC-107-EV-01`

The implementation diff is limited to the inventory-proven subset of the candidate
areas. It preserves fixed loopback/disposable topology, credentials/no-remote
boundaries, persistence and service-binding probes, bounded cleanup/stdio settlement,
tree cleanliness, and fail-closed workerd diagnostics. No unexpected fatal-deadlock
diagnostic is allowlisted, retried as success, or ignored.

## VOC-107-AC-02 — Regression proof is deterministic

- Requirements: `VOC-107-D04`
- Task: `VOC-107-T00`
- Evidence: `VOC-107-EV-02`

Focused tests deterministically exercise the identified causal condition and assert
the pre-fix failure/post-fix pass. A separately focused diagnostic test proves the
observed esbuild deadlock is terminal even if HTTP probes succeeded. If the race
cannot be deterministically triggered, the review evidence says so, preserves a
deterministic lifecycle/collector invariant, and includes the approved bounded real
smoke protocol rather than claiming certainty.

## VOC-107-AC-03 — Required gate is stable without broadening authority

- Requirements: `VOC-107-D03`, `VOC-107-D05`
- Task: `VOC-107-T00`
- Evidence: `VOC-107-EV-03`

At the exact implementation SHA, `pnpm run ci:local-stack` succeeds under the
documented bounded protocol, relevant unit suites and `pnpm validate` pass, and
hosted CI reports the `local stack` and `ci required` jobs successful. The diff has
no workflow, settings, secret, Cloudflare, deployment, migration, traffic, production,
or learner-data effect.

## VOC-107-AC-04 — Independent review and reversible delivery

- Requirements: `VOC-107-D05`
- Task: `VOC-107-T00`
- Evidence: `VOC-107-EV-04`

Distinct non-author CI/local-runtime specialist and independent R3 reviewers approve
the exact implementation SHA with zero unresolved blockers. A separately reviewed
revert restores the prior source/lock subset and reruns the same validation; no
external rollback is needed because no external action occurred.
