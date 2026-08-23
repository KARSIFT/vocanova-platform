# Repository and External Settings

Files in this repository describe policy but cannot enable GitHub organization
settings, create Cloudflare projects, or provision credentials. A repository
administrator must configure and record the following before autonomous merge or
release is enabled.

VOC-079 approval-neutral governance authority is active. That authority must not be
represented as hosted or technical activation. VOC-078-T01 retired the workflows that executed
automatic merge into `develop` and package-driven promotion into `main`; both are
currently disabled even though historical runs proved the earlier mechanism.
VOC-079-T01 restores only the repository-owned, read-only policy decision: the
Governance workflow reports eligibility and concrete reasons but has no GitHub write or
merge authority. RL1/RL2
technical activation remains disabled. VOC-078-T03 removed push-triggered deployment
and scheduled Sentry monitoring workflows. Removing repository automation did not
inspect, stop, or mutate any existing server.

VOC-080 selects Cloudflare Workers/D1 as the target and external Ruflo as optional
coordination. T00 changed documentation only and T01 applied only the supported GitHub
hardening recorded below. T10 now adds held Cloudflare delivery code after parity, but
does not mutate settings, create a GitHub environment or Cloudflare resource, configure
a secret, or deploy. Its manifest blocks before credentialed jobs. Ruflo never receives
a GitHub write token, Cloudflare credential, production secret/data, DNS permission,
or deployment authority. T11 removes the old runtime from the active repository tree
only; it does not inspect, mutate, or stop a live server.

## Hosted state recorded by VOC-080-T01

The following supported repository settings were read, hardened, and read back through
the GitHub API on 2026-08-22. This is hosted state, not a claim that unsupported
controls exist:

| Setting                         | Before T01                                                          | Recorded T01 state                                                                                           |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Default `GITHUB_TOKEN`          | `write`                                                             | `read`; pull-request approval permission remains disabled                                                    |
| Allowed Actions                 | all actions; immutable-SHA policy disabled                          | GitHub-owned actions plus `pnpm/action-setup@*` and `trufflesecurity/trufflehog@*`; full-SHA policy required |
| Merge methods                   | merge commit, squash, and rebase enabled                            | merge commit and squash enabled; rebase disabled; automatic merge disabled                                   |
| Branch deletion                 | automatic deletion disabled                                         | unchanged while the governed VOC-080 stack has dependent branch bases                                        |
| Dependabot vulnerability alerts | disabled                                                            | enabled; automated security-fix PRs remain disabled                                                          |
| Branch protection/rulesets      | API returned GitHub Free private-repository `403`                   | unavailable; the desired controls below remain policy, not hosted enforcement                                |
| Environment state               | historical `production` environment exists with no protection rules | unchanged; T01 did not read environment secrets or mutate any environment                                    |

The selected-action allowlist is intentionally small. Repository-local composite
actions remain usable, GitHub-owned setup/check-out/artifact actions are allowed, and
the two named third-party actions cover pinned pnpm setup and secret scanning. The
separate full-SHA policy prevents those wildcard repository allowlist entries from
authorizing floating refs. T01 made no Cloudflare, DNS, deployment, environment,
secret, production-data, or server change.

## GitHub rulesets

Configure `develop`:

- require pull requests and block direct pushes, force pushes, and branch deletion;
- require `CI / ci required`, `Security / security required`, `Governance / structure`,
  `Governance / changed-path risk`, `Governance / merge eligibility`, and the
  path-applicable `Quality / quality required` check;
- require deterministic CI/governance/quality/security checks when the GitHub plan
  supports private-repository rulesets;
- require conversation resolution and dismiss stale approvals;
- require code-owner review for protected paths;
- allow squash merge; and
- restrict bypass to a small human incident-administrator group with audited use.

Configure a non-self-referential R4 evidence control for these exact paths:

```text
/.github/workflows/governance.yml
/.github/CODEOWNERS
/scripts/governance/
/docs/operations/15-ai-native-product-and-engineering-operating-model.md
/docs/governance/approval-matrix.md
/docs/governance/change-risk-classification.md
/docs/governance/protected-areas.md
/docs/governance/post-merge-activation-checklist.md
/docs/governance/a003-transition-state.yaml
/docs/governance/16-autonomous-development-operating-model.md
/docs/archive/17-autonomous-development-architecture.md
/docs/archive/18-autonomous-development-implementation-roadmap.md
/specs/changes/VOC-002-a003-governance-transition/
/specs/changes/VOC-003-a003-lifecycle-sync/
/specs/changes/VOC-004-canonical-adoption-doc-17-doc-18/
```

Under active VOC-079 governance, that ruleset must require the complete R4 evidence
contract without imposing founder or standing technical-steward approval merely from
the R4 label. Where the GitHub plan supports organization-required
workflows, run the policy gate from a separately protected default-branch or
organization source. A status name produced solely by a workflow that the same pull
request can rewrite is not sufficient protection.

Configure `main`:

- include all `develop` protections;
- accept only release pull requests from `develop` or the documented emergency path;
- require release, staging, migration, rollback, and health-check gates;
- enforce strengthened R3 gates and the complete R4 evidence contract without a
  standing founder/steward requirement caused solely by risk class; separately named
  external-effect authority remains mandatory;
- use merge commits for release promotion; and
- prevent an AI or release-bot identity from bypassing required approvals.

GitHub cannot natively express every conditional R0-R4 evidence and action-authority
combination using CODEOWNERS alone. Use separate protected teams/environments and a
reviewed gate that validates the effective risk class, exact-revision independent
verdict, blocking-findings resolution, and any attributable action-specific authority. Keep autonomous merge
disabled until a repository-owned gate is tested. On the current GitHub Free private-
repository plan these settings are desired controls, not enforceable hosted reality;
the pull request must record the evidence explicitly.

Multiple owners on one CODEOWNERS pattern are alternatives: one matching owner can
satisfy GitHub's native code-owner review requirement. They do not mean that every
listed owner must approve. Under active VOC-079 governance, CODEOWNERS never proves
R4 evidence or action-specific authority; do not recreate a standing founder-and-
steward requirement from ownership routing or risk class.

Enable repository security settings when available:

- secret scanning and push protection;
- Dependabot alerts and security updates after a dependency manifest exists;
- private vulnerability reporting;
- Actions restricted to reviewed, immutable action SHAs; and
- minimal default workflow token permissions.

Of this list, T01 has enabled Dependabot vulnerability alerts, full-SHA Actions
enforcement, a selected-action allowlist, and minimal default workflow-token
permissions. Secret scanning/push protection and private vulnerability reporting are
not claimed because the API did not expose an enabled supported control for this
private GitHub Free repository. Automated Dependabot security-fix PRs remain disabled
to avoid creating an unreviewed path around the governed package workflow; the
checked-in weekly dependency-update configuration continues to target `develop`.

The verified human repository identity `@m-e-h-r-d-a-a-d` is formally recorded as
founder and as the historical pre-A-003 qualified human technical steward in
[technical-steward-appointment.md](technical-steward-appointment.md). Direct account
routing is currently used. A steward team is not a prerequisite to A-003 activation
and must not be created as a replacement permanent authority. Direct routing may
remain for review routing, but never proves conditional approval. Never use an AI or
bot identity as human authority.

## Required identities and credentials

- Distinct implementer-role and independent-reviewer-role identities, recorded per
  pull request. Humans and AI agents may fill either role; no vendor is permanently
  assigned by repository policy.
- Any human identities explicitly assigned action-specific authority, plus the
  preserved historical founder and technical-steward evidence; no replacement standing
  steward team is required and no historical identity assignment is reusable approval.
- GitHub App or OIDC-based credentials with least privilege and short expiry.
- Separate Cloudflare preview, staging, and production projects/accounts or clearly
  isolated environments.
- Environment-scoped Cloudflare tokens; production credentials are unavailable to
  pull-request and implementation-agent contexts.
- No GitHub write or Cloudflare credential in Ruflo, reviewer, or ordinary builder
  configuration.

No credential value belongs in the repository.

## Cloudflare and release configuration

T10 records and validates the repository-owned portion in
[`cloudflare-delivery.md`](../operations/cloudflare-delivery.md): locked Wrangler
commands, distinct logical Worker/D1/environment names, credential-free dry runs,
ordered version/migration/promotion/smoke/rollback behavior, cost ceilings, exact-SHA
gating, and evidence format. The committed D1 IDs/routes are non-resource sentinels and
activation remains held.

Before a future activation change can authorize either environment, record and validate:

- approved OpenNext, Worker API, D1 migration, dry-run, version, and deploy commands
  from the implemented package scripts;
- preview, staging, and production project identifiers and domains;
- environment bindings, data stores, migration order, and secret isolation;
- preview cleanup behavior and access restrictions;
- staging and production smoke/health endpoints;
- monitoring alerts, responsible responder, and evidence retention;
- last-known-good artifact or commit redeployment procedure;
- feature-flag or traffic-shift rollback where relevant;
- database backup, restore test, recovery point objective, and recovery time objective;
  and
- production environment rules matching risk-specific evidence and explicitly assigned
  production-action authority.

## Current blockers (rewritten 2026-07-24 - the paragraph below was written during the

original repository bootstrap, before any application code existed, and had never been
updated since; it's preserved as history for the paragraph after it, which is still
accurate)

_Historical, no longer true:_ "The repository currently has no application, package
manifest, pnpm lockfile, workspace, test/build scripts... only the dependency-free
governance policy check can run today; application CI, previews, staging, production,
and rollback cannot truthfully be automated yet."

**Current reality:** `apps/web` and `apps/api-worker` are real, working applications;
`package.json`/`pnpm-lock.yaml`/the pnpm workspace exist; deterministic CI (format,
lint, typecheck, test, build) runs on every PR and has passed across 22+ shipped
packages (VOC-010 through VOC-022 at minimum). VOC-078-T00 adds the repository-local
`ci.yml`, `governance.yml`, `quality.yml`, and `security.yml` replacement set.
VOC-078-T01 has now removed the legacy external control-plane callers after the new
read-only jobs passed on a real pull request. VOC-078-T03 then removed server-bound
workflows, and T04 removed the superseded standalone quality/governance workflows.
The current workflow inventory is exactly `ci.yml`, `governance.yml`, `quality.yml`,
and `security.yml`. VOC-079-T01 extends `governance.yml` with a read-only evidence
adapter and pure eligibility evaluator; it does not add a workflow or an executor.
`docs/migration-manifest.yaml` and `docs/document-graph.yaml` were migrated
(VOC-007/VOC-008) and later archived to `docs/archive/` as historical evidence
trails (2026-07-24) - they are available, just not filed as live/current
documentation. Verified sources for DOC-00 through DOC-13 are canonical and adopted;
DOC-14 was deliberately reconciled but not adopted (see `docs/README.md`'s index).

**Historical deployment record:** the former staging and production workflows ran
successfully against real infrastructure beginning 2026-08-08, and the production
environment restricted those runs to `main`. VOC-078-T03 removed both workflows on
2026-08-19 while deliberately leaving runtime infrastructure and repository settings
unchanged. Server deployment and health polling remain unavailable. ADR-0003's
replacement now has Worker/D1 parity and T10's held GitHub Actions state machine, but
no live environment job is eligible until its manifest and action hold are separately
activated. T11 retired the former server runtime from the active repository tree after
that parity evidence; immutable Git history and compact migration fixtures preserve its
evidence. Per-PR previews remain unbuilt.

The initial governance bootstrap merged through PR #3 and its one-time exception has
expired. The historical technical-steward appointment and completed dual-capacity
VOC-002 approval remain permanent evidence, but the role is retired as routine R3
authority and that migration approval cannot be reused. A-003 historically established
strengthened technical gates and independent verification for routine R3 without
standing personal approval. VOC-079 now extends that approval-neutral model across
R0-R4 while retaining stronger R4 evidence and explicit action-specific authority.
Automatic merge into `develop`, autonomous production release, and repository-driven
production deployment are disabled after VOC-078-T01/T03; RL1/RL2 technical activation
remains disabled.
