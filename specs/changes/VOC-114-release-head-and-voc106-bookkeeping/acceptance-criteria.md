# VOC-114 — Acceptance Criteria

## VOC-114-AC-00 — The defect and lifecycle are represented truthfully

- Requirements: `VOC-114-D00`, `VOC-114-D05`
- Task: `VOC-114-T00`
- Tests: `VOC-114-TEST-00`
- Evidence: `VOC-114-EV-00`
- Result: pending

Issue #213, the true hosted auto-delete posture, adopted VOC-106 evidence, and every
stale adoption/task field are inventoried. The corrected package retains adopted
authority but has no false pending-adoption blocker.

## VOC-114-AC-01 — Promotion cannot expose a permanent head to deletion

- Requirements: `VOC-114-D01`–`D03`
- Task: `VOC-114-T00`
- Tests: `VOC-114-TEST-01`, `VOC-114-TEST-02`
- Evidence: `VOC-114-EV-01`, `VOC-114-EV-02`
- Result: pending

Every current instruction requires an exact short-lived release head targeting
`main`; positive evidence proves SHA/tree identity, main as merge base, zero main-only
commits, and release-merge tree identity. Negative evidence rejects permanent,
drifted, extra-commit, diverged-main, tree-mismatched, colliding, or unrecorded heads.

## VOC-114-AC-02 — Release and synchronization controls remain complete

- Requirements: `VOC-114-D02`–`D04`, `VOC-114-D08`
- Task: `VOC-114-T00`
- Tests: `VOC-114-TEST-02`, `VOC-114-TEST-03`
- Evidence: `VOC-114-EV-02`, `VOC-114-EV-03`
- Result: pending

Each drifted attempt is closed and abandoned without ref deletion or mutation; a new
collision-free name and PR receive fresh evidence. Two reviewed merge-commit PRs,
R4/specialist evidence, actor separation, recreation records, tree/ancestry proof, and
zero-behind proof remain mandatory and internally consistent.

## VOC-114-AC-03 — All current policy surfaces agree

- Requirements: `VOC-114-D05`–`D07`
- Task: `VOC-114-T00`
- Tests: `VOC-114-TEST-04`
- Evidence: `VOC-114-EV-04`
- Result: pending

Exactly the 16 declared existing implementation paths change. `.github/README.md` and
all other current surfaces agree on the immutable disposable head, ancestry/tree,
collision, abandonment, and deletion boundary; historical records remain unchanged;
governance, risk, formatting, link/reference, and hosted checks pass.

## VOC-114-AC-04 — Independent evidence, rollback, and monitoring close

- Requirements: `VOC-114-D08`–`D10`
- Task: `VOC-114-T00`
- Tests: `VOC-114-TEST-05`, `VOC-114-TEST-06`
- Evidence: `VOC-114-EV-05`, `VOC-114-EV-06`
- Result: pending

Exact specialist and independent R4 reviewers report PASS with zero blockers, a
separate actor merges, reverse-diff rollback is proven, prohibited actions remain
absent, and DOC-15 §24.18 monitoring proves release-tree identity and reaches its
bounded success condition.
