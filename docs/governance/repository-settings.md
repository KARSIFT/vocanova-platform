# Repository and External Settings

Files in this repository describe policy but cannot enable GitHub organization
settings, create Cloudflare projects, or provision credentials. The current hosted
posture is recorded separately in the [repository settings record](repository-settings-current.yaml),
which is current as observed at 2026-08-24 and is point-in-time evidence, not a live
settings feed.

VOC-079 approval-neutral governance authority is active. That authority must not be
represented as hosted or technical activation. VOC-078-T01 retired the workflows that
executed automatic merge into `develop` and package-driven promotion into `main`; both
remain disabled even though historical runs proved the earlier mechanism.
VOC-079-T01 restores only the repository-owned, read-only policy decision: the
Governance workflow reports eligibility and concrete reasons but has no GitHub write or
merge authority. RL1/RL2
technical activation remains disabled. VOC-078-T03 removed push-triggered deployment
and scheduled Sentry monitoring workflows. Removing repository automation did not
inspect, stop, or mutate any existing server.

VOC-080 selects Cloudflare Workers/D1 as the target and external Ruflo as optional
coordination. T10 adds held Cloudflare delivery code after parity, but does not mutate
settings, create a GitHub environment or Cloudflare resource, configure a secret, or
deploy. Its manifest blocks before credentialed jobs. Ruflo never receives a GitHub
write token, Cloudflare credential, production secret/data, DNS permission, or
deployment authority. T11 removes the old runtime from the active repository tree
only; it does not inspect, mutate, or stop a live server.

## Current hosted posture (observed 2026-08-24)

The [machine-readable current record](repository-settings-current.yaml) is the source
for this point-in-time observation. It records a public repository with `main` as the
default branch; merge commits and squash merges enabled; rebase merges and automatic
branch deletion disabled; and Actions enabled with selected actions, required SHA
pinning, read-only default workflow-token permissions, and pull-request review
approval disabled.

The same read-only observation records dependency/vulnerability alerts enabled. This
is distinct from the disabled Dependabot security-update automation. GitHub-hosted
secret scanning, push protection, and validity checks are disabled as observed.
The `rulesets` record is empty, and protection reads for both `develop` and `main`
returned HTTP 404 (not protected). Public availability does not mean that a feature is
configured or enforced.

The record is point-in-time only. Its network-free guard proves internal consistency
with the committed observation; it cannot prove live freshness. It becomes stale if
a later repository-settings mutation is authorized or observed, or if the observation
cannot be independently reverified. Any future settings mutation requires an immediate
governed documentation-only follow-up. This package and this guide perform no settings
mutation.

## VOC-080 historical transition snapshot

[`voc-080-transition-record.md`](../operations/voc-080-transition-record.md) and its
JSON source are immutable historical evidence of the private-repository snapshot read
on 2026-08-22. They are not the current hosted state and are not rewritten to resemble
the public observation above. The current record is the only source for the
current-as-observed-at-2026-08-24 repository settings.

## Prospective settings held by VOC-085-HOLD-00

The following are desired mature controls, not configured current state: rulesets and
protected `develop`/`main` branches; pull-request-only changes and required checks;
conversation, code-owner, bypass, and release protections; Dependabot security
updates; secret scanning and push protection; and any future hosted enforcement or
environment approval settings. `VOC-085-HOLD-00` applies only to a future external
GitHub repository-settings mutation. It names an accountable settings operator,
requires separate exact-action authority, and requires a pre-state, intended payload,
rollback, immediate documentation follow-up, post-state read-back, and exact evidence
record. It does not block repository-only planning, implementation, review, or merge.

The currently enabled dependency/vulnerability alerts are observed evidence, not a
prospective held target. The distinct `VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and
`VOC-080-HOLD-02` continue to govern Cloudflare staging resources/secrets, production
traffic or D1 migrations, and production learner data respectively.

## Desired rulesets and branch protections (prospective)

Configure `develop`:

- require pull requests and block direct pushes, force pushes, and branch deletion;
- require `CI / ci required`, `Security / security required`, `Governance / structure`,
  `Governance / changed-path risk`, `Governance / merge eligibility`, and the
  path-applicable `Quality / quality required` check;
- require deterministic CI/governance/quality/security checks when a future settings
  mutation is separately authorized and the repository settings support rulesets;
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
combination using CODEOWNERS alone. If these prospective controls are activated, use
separate protected teams/environments and a reviewed gate that validates the effective
risk class, exact-revision independent verdict, blocking-findings resolution, and any
attributable action-specific authority. Keep autonomous merge disabled until a
repository-owned gate is tested; the pull request must record the evidence explicitly.

Multiple owners on one CODEOWNERS pattern are alternatives: one matching owner can
satisfy GitHub's native code-owner review requirement. They do not mean that every
listed owner must approve. Under active VOC-079 governance, CODEOWNERS never proves
R4 evidence or action-specific authority; do not recreate a standing founder-and-
steward requirement from ownership routing or risk class.

Future settings activation may consider:

- secret scanning and push protection;
- Dependabot alerts and security updates after a dependency manifest exists;
- private vulnerability reporting;
- Actions restricted to reviewed, immutable action SHAs; and
- minimal default workflow token permissions.

The current observation has enabled dependency/vulnerability alerts, full-SHA Actions
enforcement, a selected-action allowlist, and minimal default workflow-token
permissions. Dependabot security updates, secret scanning/push protection, and
validity checks are disabled. None of the prospective controls is enabled by this
documentation package; any activation remains under `VOC-085-HOLD-00`.

The verified human repository identity `@m-e-h-r-d-a-a-d` is formally recorded as
founder and as the historical pre-A-003 qualified human technical steward in
[technical-steward-appointment.md](technical-steward-appointment.md). Direct account
routing is currently used. A steward team is not a prerequisite to A-003 activation
and must not be created as a replacement permanent authority. Direct routing may
remain for review routing, but never proves conditional approval. Never use an AI or
bot identity as human authority.

## Required identities and credentials

- Distinct implementer and independent-reviewer actors, recorded per pull request with
  role, exact SHA, verdict, authorship independence, resolved blocking findings, and
  optional runtime provenance. An actor may be human or separately instantiated AI;
  relabeling a session or changing a model/provider is not separation. No vendor is
  permanently assigned by repository policy, and provenance grants no authority.
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
