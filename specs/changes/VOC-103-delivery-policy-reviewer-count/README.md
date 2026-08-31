# VOC-103 — Count only reviewer rules in the delivery gate

VOC-103 is the minimum-sufficient defect-remediation plan for issue #183. The
protected Cloudflare delivery gate currently requires the complete GitHub
`protection_rules` array to contain exactly one entry. GitHub returns the valid
required-reviewer rule and the independently configured deployment branch-policy
rule in that array, so the gate rejects the authorized staging configuration.

Observed evidence is GitHub Actions run
[`33342926874`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33342926874)
at exact `develop` SHA `eeb744cb4f2c17c5c3b7764d6e7d13f5bba23609`.
All prerequisite jobs and `ci required` passed. `cloudflare delivery gate` then
failed before either protected environment job with `delivery blocked: environment
must have exactly one required-reviewer rule`; staging and production were skipped.

The implementation will filter environment protection rules by
`type === "required_reviewers"`, require exactly one matching rule, validate its
existing reviewer contract, and preserve the separate exact deployment branch-policy
checks. No workflow, setting, secret, Cloudflare, dispatch, deployment, migration,
traffic, DNS, production, spending, or data action is in scope. This draft grants no
repository implementation or external-action authority.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
