# VOC-107 — Diagnose and deterministically remediate a local-stack deadlock

This draft R3 package responds to [issue #194](https://github.com/KARSIFT/vocanova-platform/issues/194). It records an intermittent failure of the required, credential-free local-stack control at [CI run 33406243445](https://github.com/KARSIFT/vocanova-platform/actions/runs/33406243445), merge SHA `abf35db76d8182e82aebd4ee78773a09528153d6`.

The only established symptom is an esbuild fatal deadlock emitted by the API local Worker after the second cycle's successful probes. The plan does not claim a cause. It requires an evidence-led inventory and bounded reproduction before selecting a minimum source or dependency remediation, and it expressly rejects masking the failure with an allowlist, broad retry, or success conversion.

The outcome is repository-only. It grants no workflow/settings/secret change, Cloudflare action, deployment, migration, traffic/DNS change, production or learner-data access, spending, or launch authority.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
