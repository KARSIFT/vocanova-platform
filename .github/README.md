# GitHub Configuration

This directory contains repository contribution and governance controls:

- `pull_request_template.md` records traceability, risk, evidence, impact, verification,
  and approvals with a lightweight R0 path.
- `ISSUE_TEMPLATE/` provides governed change intake and private security routing.
- `CODEOWNERS` uses the verified human repository identity for review routing. It is
  not approval evidence and does not create a standing post-A-003 authority.
- `workflows/governance-policy.yml` validates the governance structure and prevents a
  pull request from declaring a risk below its changed-path floor.

The policy workflow is one of several automated checks now live - see
`docs/governance/repository-settings.md`'s "Current reality" section for what
actually runs today (application CI, independent review, staging and production
deployment) versus what's still genuinely unbuilt (per-PR Cloudflare previews,
one-click rollback automation). Treat that section, not this paragraph, as the
source of truth for current automation state - this file only describes what
lives in `.github/` itself. See
[`docs/governance/repository-settings.md`](../docs/governance/repository-settings.md)
for the required administrator settings and credentials.

A-003 governance authority is active. These files do not technically activate RL1 or
RL2, production deployment, or autonomous production release. (Automatic merge into
`develop` specifically - a distinct, narrower gate, DOC-16's "Branch and merge
behavior" section - is separately implemented and live via karsift-ai-infra's
merge-gate.yml; see `docs/governance/a003-transition-state.yaml`'s
`automatic_merge_allowed` field.) DOC-17 and DOC-18's Control Plane architecture is
superseded and archived (`docs/archive/`) - not something these files, or anything
else, still needs to "activate."
