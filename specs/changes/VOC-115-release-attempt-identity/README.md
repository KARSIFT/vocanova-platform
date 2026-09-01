# VOC-115 — Make release-attempt identity retry-safe

Issue [#216](https://github.com/KARSIFT/vocanova-platform/issues/216) and the
[PR #215 specialist FAIL](https://github.com/KARSIFT/vocanova-platform/pull/215#issuecomment-5491674409)
prove that adopted VOC-114 cannot retry at unchanged `develop`. PR #217's first two
candidates are also rejected and transfer no review: `f7abcc8` used a racy client
sequence and incomplete comment ledger; `535bcd4` still treated non-atomic editable
comments as allocation authority and specified unreconstructible receipts.

The replacement removes comment-ledger authority. For each deterministic frontier,
contenders create distinct canonical same-tree claim commits and race one GitHub
POST-create-ref. The fixed claim name is an atomic first-writer lock; the winning
never-deleted claim ref/commit is durable identity and binds frozen `develop` before an
exact attempt ref/PR exists. Closed-unmerged PRs advance the frontier, merged closes
allocation, and any impossible duplicates all close before a conflict frontier.

Exhaustive all-state PR, full timeline, claim-commit, and dual-source ref scans
reconstruct state.
Canonical non-self-referential scan receipts are evidence only. Unknown PR POST results
are never retried, comment/body loss cannot recreate genesis, and exact actor-to-login
mapping prevents inferred takeover.

After reviewed adoption, one corrected revision of draft PR
[#215](https://github.com/KARSIFT/vocanova-platform/pull/215) changes exactly 27 paths:
seven living surfaces, all nine VOC-106 artifacts, all nine VOC-114 artifacts, and two
foundation validator/test files. It preserves release topology and immutable refs and
performs no release, settings, deployment, secret, data, or live-system action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
