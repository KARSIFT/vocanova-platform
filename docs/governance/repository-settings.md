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

The verified human repository identity `@m-e-h-r-d-a-a-d` is formally recorded as
both founder and qualified human technical steward in
[technical-steward-appointment.md](technical-steward-appointment.md). Direct account
routing is currently used. A separate steward team and its hosted enforcement are not
yet configured. After a real team is created and verified, its slug may replace direct
routing in the protected patterns. Never use an AI or bot identity as the steward.

## Required identities and credentials

- Distinct Codex implementation and Claude Code verification identities.
- The recorded human founder and technical-steward identity; a separate steward team
  remains unconfigured.
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
credentials, monitoring endpoints, distinct Codex/Claude GitHub identities, or
verifier integration. Branch and non-self-referential ruleset enforcement is not
recorded as active. DOC-15's broader
knowledge-system bootstrap is also incomplete: verified sources for DOC-00 through
DOC-14, `docs/migration-manifest.yaml`, and `docs/document-graph.yaml` are not yet
available. They require a separate preservation-first migration change; this work
does not invent their content. Therefore:

- only the dependency-free governance policy check can run today;
- application CI, previews, staging, production, and rollback cannot truthfully be
  automated yet; and
- autonomous merge and autonomous production release must remain disabled until the
  missing gates are implemented and validated through a non-production rehearsal.

The initial governance bootstrap merged through PR #3 and its one-time exception has
expired. A qualified human steward is now formally appointed, and the same verified
account presently serves as founder and steward in separate capacities. This current
state does not remove any blocker above, activate hosted enforcement, authorize
deployment, or enable autonomous release. R3 approvals must explicitly identify the
steward capacity; combined R3/R4 approvals must identify both capacities.
