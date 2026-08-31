# VOC-109 — Restore governed foundation-chain extensibility

This draft R3 package responds to
[issue #198](https://github.com/KARSIFT/vocanova-platform/issues/198). The active
VOC-081 F2 evidence validator correctly protects its own command and the established
foundation order, but it also freezes the entire `ci:foundation` chain. That broader
comparison rejects the exact later evidence command required by adopted VOC-105.

VOC-109 defines the minimum prerequisite correction: keep the original eight-command
foundation prefix and terminal test exact, keep the canonical F2 command direct and
non-bypassable, and permit unique canonical lowercase-single-hyphen `ci:*` checks only
in one explicit extension slot when each maps to a distinct single direct Node
foundation-policy entry point.

This package changes no package command, workflow, F2 acceptance fact, historical
VOC-081 package, or adopted VOC-105 scope. It authorizes no implementation until exact
review, adoption, and merge of this plan. It authorizes no GitHub setting or secret,
Cloudflare action, dispatch, deployment, migration, traffic/DNS change, production or
learner-data access, spending, or launch.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
