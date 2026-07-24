# GitHub Configuration

This directory contains repository contribution and governance controls:

- `pull_request_template.md` records traceability, risk, evidence, impact, verification,
  and approvals with a lightweight R0 path.
- `ISSUE_TEMPLATE/` provides governed change intake and private security routing.
- `CODEOWNERS` uses the verified human repository identity for review routing. It is
  not approval evidence and does not create a standing post-A-003 authority.
- `workflows/governance-policy.yml` validates the governance structure and prevents a
  pull request from declaring a risk below its changed-path floor.

The policy workflow is the only truthful automated check at the current foundation
stage. Application CI, independent Claude Code status, Cloudflare previews/staging,
production release gates, monitoring, and rollback automation require application
tooling and external configuration that do not yet exist. See
[`docs/governance/repository-settings.md`](../docs/governance/repository-settings.md)
for the required administrator settings and credentials.

A-003 governance authority is active. These files do not technically activate RL1 or
RL2, production deployment, autonomous production release, DOC-17, or DOC-18. (Automatic
merge into `develop` specifically - a distinct, narrower gate, A-003 §10 - is separately
implemented and live via karsift-ai-infra's merge-gate.yml; see
`docs/governance/a003-transition-state.yaml`'s `automatic_merge_allowed` field.)
