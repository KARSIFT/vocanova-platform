# VOC-110 — Separate immutable F2 evidence from current later-milestone pointers

This draft R3 package responds to
[issue #203](https://github.com/KARSIFT/vocanova-platform/issues/203). The active
VOC-081 validator correctly protects accepted repository/local F2 evidence, its
historical candidate state, and the VOC-109 foundation-chain extension contract. It
also incorrectly freezes current living-document and JSON pointers at the pre-F3
state, so it rejects the exact later F3 boundary already adopted by VOC-105.

VOC-110 authorizes a two-file policy correction only. Immutable VOC-081 facts and
history remain exact. Current later-milestone assertions may match either the exact
pre-VOC-105 repository or the exact atomic VOC-105 state: F3 staging foundation
complete-effective under the VOC-105 record; A1 and P1+ unresolved; production and
learner data held; public launch unresolved-held; and `VOC-080-HOLD-01` plus
`VOC-080-HOLD-02` retained. Mixed profiles and broader product, production, live, or
hold-release claims fail closed.

The future profile is implementation-deterministic: `specification.md` owns literal
required and prohibited normalized marker strings for each of the five human F2-owned
surfaces, an exact whitespace-normalization algorithm, and the exact JSON profile.
Fixtures may use only those plan-canonical strings, never the preserved dirty
worktree. The negative corpus preserves every current F3, A1/P1+, production/
deployment, live, hold, and F2-pending subject/verb class and adds `effective` and
`resolved`; only the exact evidence-bound VOC-105 wording is allowlisted.

This package does not decide F3, change documentation, add the VOC-105 command, or
replace VOC-105's R4 evidence validator. It remains draft and implementation-
unauthorized until exact review, adoption, and plan merge. It authorizes no settings,
secret, Cloudflare, dispatch, deployment, migration, traffic/DNS, production/data,
spending, or launch action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
