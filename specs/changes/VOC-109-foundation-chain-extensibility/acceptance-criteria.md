# VOC-109 — Acceptance Criteria

## VOC-109-AC-00 — Scope and lifecycle remain exact

- Requirements: `VOC-109-D00`, `VOC-109-D04`, `VOC-109-D06`
- Task: `VOC-109-T00`
- Tests: `VOC-109-TEST-00`, `VOC-109-TEST-04`
- Evidence: `VOC-109-EV-00`, `VOC-109-EV-04`
- Result: pending exact implementation evidence

The package remains draft and implementation-unauthorized until independently
reviewed and adopted. Its future implementation changes exactly the VOC-081 validator
and focused test in one task/one PR. It does not modify `package.json`, implement
VOC-105, or authorize an external action.

## VOC-109-AC-01 — Current and extended chains pass narrowly

- Requirements: `VOC-109-D01`, `VOC-109-D02`
- Task: `VOC-109-T00`
- Tests: `VOC-109-TEST-01`
- Evidence: `VOC-109-EV-01`
- Result: pending exact implementation evidence

The current unextended repository passes. Synthetic package JSON with one or more
unique, declared direct `ci:*` segments in the sole extension slot passes while every
one of the first eight segments remains in the exact prefix and the foundation test
glob remains exact and terminal. Each extension maps to a distinct single direct Node
foundation-policy entry point. The adopted VOC-105 shape with one direct declared
`pnpm run ci:f3-evidence` segment passes.

## VOC-109-AC-02 — F2-owned invariants still fail closed

- Requirements: `VOC-109-D01`, `VOC-109-D03`
- Task: `VOC-109-T00`
- Tests: `VOC-109-TEST-02`
- Evidence: `VOC-109-EV-02`
- Result: pending exact implementation evidence

One-at-a-time fixtures for a missing or duplicate F2 segment, drifted F2 entry point,
F2 alias, comment/echo substitution, `||` fallback, and prefix/suffix or shell-control
injection all fail. A textual or transitive reference never satisfies or duplicates
the required direct F2 execution.

## VOC-109-AC-03 — Extension and order errors fail closed

- Requirements: `VOC-109-D02`, `VOC-109-D03`
- Task: `VOC-109-T00`
- Tests: `VOC-109-TEST-03`
- Evidence: `VOC-109-EV-03`
- Result: pending exact implementation evidence

Missing, altered, or reordered prefix segments; a drifted/non-terminal foundation test
glob; unknown or duplicate extension names or entry points; aliased, compound,
commented, argument-bearing, or metacharacter-bearing extension definitions;
extensions before or after the sole slot; malformed JSON; empty segments; and
prohibited shell controls each fail with an invariant-specific diagnostic. The
validator performs no shell or network execution.

## VOC-109-AC-04 — Exact revision is independently verified and reversible

- Requirements: `VOC-109-D04`, `VOC-109-D05`
- Task: `VOC-109-T00`
- Tests: `VOC-109-TEST-04`
- Evidence: `VOC-109-EV-04`
- Result: pending exact implementation evidence

Focused, foundation, workspace, governance, hosted, path, and diff checks pass at the
exact two-file implementation SHA. Distinct non-author foundation-policy specialist
and cross-model R3 reviewers report PASS with zero unresolved blockers, a separate
non-author merges, and a repository revert rehearsal restores the exact prior tree.
