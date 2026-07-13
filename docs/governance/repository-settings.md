# Repository and External Settings

Files in this repository describe policy but cannot enable GitHub organization
settings, create Cloudflare projects, or provision credentials. A repository
administrator must configure and record the following before autonomous merge or
release is enabled.

## GitHub rulesets

Configure `develop`:

- require pull requests and block direct pushes, force pushes, and branch deletion;
- require `policy / governance-policy` and every installed application CI check;
- require the independent Claude Code verifier status check;
- require conversation resolution and dismiss stale approvals;
- require code-owner review for protected paths;
- allow squash merge; and
- restrict bypass to a small human incident-administrator group with audited use.

Configure a non-self-referential R4 control for these exact paths:

```text
/.github/workflows/governance-policy.yml
/.github/CODEOWNERS
/scripts/governance/
/docs/operations/15-ai-native-product-and-engineering-operating-model.md
/docs/governance/approval-matrix.md
/docs/governance/change-risk-classification.md
/docs/governance/protected-areas.md
/docs/governance/post-merge-activation-checklist.md
/docs/governance/amendments/
/docs/governance/16-autonomous-development-operating-model.md
```

After the initial bootstrap PR merges, that ruleset must require founder approval and
technical-steward review without depending on the pull-request version of the
classifier it protects. Where the GitHub plan supports organization-required
workflows, run the policy gate from a separately protected default-branch or
organization source. A status name produced solely by a workflow that the same pull
request can rewrite is not sufficient protection.

Configure `main`:

- include all `develop` protections;
- accept only release pull requests from `develop` or the documented emergency path;
- require release, staging, migration, rollback, and health-check gates;
- require technical-steward approval for R3 and founder approval for R4 through
  rulesets/environments or a reviewed approval-gate integration;
- use merge commits for release promotion; and
- prevent an AI or release-bot identity from bypassing required approvals.

GitHub cannot natively express every conditional R0-R4 approval combination using
CODEOWNERS alone. Use separate protected teams/environments and a reviewed gate that
validates the effective risk class and attributable approvals. Keep autonomous merge
disabled until that gate is tested.

Multiple owners on one CODEOWNERS pattern are alternatives: one matching owner can
satisfy GitHub's native code-owner review requirement. They do not mean that every
listed owner must approve. Enforce combined founder-and-steward requirements for
R4-plus-R3 changes in the non-self-referential ruleset or approval gate above.

Enable repository security settings when available:

- secret scanning and push protection;
- Dependabot alerts and security updates after a dependency manifest exists;
- private vulnerability reporting;
- Actions restricted to reviewed, immutable action SHAs; and
- minimal default workflow token permissions.

The bootstrap CODEOWNERS file uses only the verified human repository identity
`@m-e-h-r-d-a-a-d`. It intentionally does not claim that a technical-steward identity
or team exists. After a qualified steward is appointed, create and verify the GitHub
team, add its real slug to the protected patterns, and activate required-review rules.
Never use an AI or bot identity as the steward.

## Required identities and credentials

- Distinct Codex implementation and Claude Code verification identities.
- A human founder identity and a qualified human technical-steward identity/team.
- GitHub App or OIDC-based credentials with least privilege and short expiry.
- Separate Cloudflare preview, staging, and production projects/accounts or clearly
  isolated environments.
- Environment-scoped Cloudflare tokens; production credentials are unavailable to
  pull-request and implementation-agent contexts.

No credential value belongs in the repository.

## Cloudflare and release configuration

Before deployment automation is added, record and validate:

- approved build and deploy commands from the future package scripts;
- preview, staging, and production project identifiers and domains;
- environment bindings, data stores, migration order, and secret isolation;
- preview cleanup behavior and access restrictions;
- staging and production smoke/health endpoints;
- monitoring alerts, responsible responder, and evidence retention;
- last-known-good artifact or commit redeployment procedure;
- feature-flag or traffic-shift rollback where relevant;
- database backup, restore test, recovery point objective, and recovery time objective;
  and
- production environment approval rules matching R3/R4.

## Current blockers

The repository currently has no application, package manifest, pnpm lockfile,
workspace, test/build scripts, database tooling, Cloudflare configuration, deployment
credentials, monitoring endpoints, or verifier integration. DOC-15's broader
knowledge-system bootstrap is also incomplete: verified sources for DOC-00 through
DOC-14, `docs/migration-manifest.yaml`, and `docs/document-graph.yaml` are not yet
available. They require a separate preservation-first migration change; this work
does not invent their content. Therefore:

- only the dependency-free governance policy check can run today;
- application CI, previews, staging, production, and rollback cannot truthfully be
  automated yet; and
- autonomous merge/release must remain disabled until the missing gates are
  implemented and validated through a non-production rehearsal.

The initial governance bootstrap may merge to `develop` with founder approval,
independent Claude Code verification, and passing repository validation. It does not
remove any blocker above, authorize deployment, or mark steward approval satisfied.
After that merge, R3 production remains blocked until the steward identity and its
non-self-referential enforcement are active.
