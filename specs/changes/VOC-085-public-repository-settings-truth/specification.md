# VOC-085 — Specification

## Objective and requirement source

GitHub issue #119 identifies a truthfulness gap introduced when
`KARSIFT/vocanova-platform` changed from private to public. VOC-080's read-only
settings snapshot remains valid history, but living guidance must describe the
current public repository and distinguish configured controls from desired controls.

The planning base is exact `e629693669e7c5f56c2a9d6719b66532df0f95f2` on `develop`.
Issue #119 grants planning direction only. Adoption of this package is required
before any implementation task begins.

## Decisions

### VOC-085-D00 — Current hosted posture is a separate immutable observation

The implementation records the verified public-repository settings in a new
repository-local current-state artifact. It does not infer settings from plan
availability, policy prose, or historical records, and it does not call a mutable
external system from deterministic validation.

### VOC-085-D01 — VOC-080's private snapshot remains historical

The VOC-080 transition JSON and Markdown records are immutable historical evidence of
the private-repository read-only snapshot. They are not rewritten, reclassified as
current, or used to claim that the present public repository has the same posture.

### VOC-085-D02 — Living guidance follows current evidence

Active README, GitHub, governance, and operations guidance must link the current-state
artifact and state exactly what is configured, absent, or disabled. A historical
private-plan limitation may appear only when explicitly labelled as history.

### VOC-085-D03 — Truthfulness is fail-closed and scoped

A network-free guard may validate designated current/prospective/history sections and
must reject stale current claims, omissions, or current/history conflation. It must
not globally ban words that are valid in labelled historical evidence.

### VOC-085-D04 — Public visibility does not equal enforcement

Public-repository availability of a GitHub feature is not evidence that the feature is
configured. Rulesets, protected branches, security scanning, Dependabot security
updates, environment protection, and release gates remain absent/disabled or held
unless separately observed and recorded.

### VOC-085-D05 — Settings and live actions remain out of scope

No repository or environment setting, Cloudflare/Sentry/DNS/server resource, secret,
production data, deployment, `main` promotion, or branch is changed. Issue #119 is
eligible for closure only after final merge and post-merge proof.

## Current verified state

The implementation must add `docs/governance/repository-settings-current.yaml`, a
repository-local, machine-readable current-state record based on the following
read-only observations made on 2026-08-23:

```yaml
visibility: public
default_branch: main
allow_merge_commit: true
allow_squash_merge: true
allow_rebase_merge: false
delete_branch_on_merge: false
actions:
  enabled: true
  allowed_actions: selected
  sha_pinning_required: true
  default_workflow_permissions: read
  can_approve_pull_request_reviews: false
rulesets: []
branch_protection:
  develop: http-404-not-protected
  main: http-404-not-protected
dependabot_security_updates: disabled
secret_scanning:
  enabled: false
  push_protection: false
  validity_checks: false
```

The record must include observation date, repository identity, read-only source,
and an explicit `settings_mutation: prohibited` boundary. It must not include tokens,
secrets, environment values, or claims about live Cloudflare, Sentry, DNS, servers,
or production data.

## Historical versus current truth

The VOC-080 transition JSON and Markdown records remain historical snapshots of the
private repository. They must not be edited to erase their private-plan HTTP 403
observations. Living guidance must link to them as historical and link to the new
current-state record for present facts.

## Living guidance reconciliation

The implementation must update every active document that makes a contradictory
private-repository claim, at minimum:

- `README.md`;
- `.github/README.md`;
- `docs/governance/repository-settings.md`;
- `docs/operations/cloudflare-delivery.md`; and
- DOC-16 at `docs/governance/16-autonomous-development-operating-model.md`,
  including its revision metadata and amendment-history entry if its current-state
  wording changes.

The reconciled language must say exactly what is configured today, what is absent or
disabled, and what remains prospective. It must not imply branch protection, ruleset
enforcement, Dependabot security updates, GitHub-hosted secret scanning, push
protection, environment protection, deployment, or release authority that is not
observed. Existing active Actions hardening may be described as configured.

## Desired controls, explicitly held

The package may document a future mature-open-source target, but it must label it
`prospective`/`held` and keep it separate from current state. The target includes:

- rulesets for `develop` and `main`, pull-request-only changes, required deterministic
  checks, review/conversation controls, code-owner routing, no force pushes, and no
  unaudited bypass;
- release-pull-request-only promotion into `main` with appropriate evidence;
- Dependabot alerts/security updates and public-repository secret scanning/push
  protection when separately authorized and verified; and
- any environment protection or Cloudflare delivery activation only under the named
  VOC-080 holds and a separately adopted activation package.

No target control is enabled by this package.

## Static truthfulness guard

Implementation adds a network-free validator and negative fixtures that fail when
active guidance reintroduces private-plan availability claims, treats
the historical VOC-080 snapshot as current, presents a held desired control as
configured, or claims this package mutated settings. The guard must be scoped to
designated current-state sections and historical/prospective markers; it must not use
a global word ban that rejects valid historical text.

## Explicit non-goals

This package does not change GitHub repository or environment settings, branch
protection, rulesets, Actions policy, Dependabot, secret scanning, environments,
Cloudflare, Sentry, DNS, servers, SSH, secrets, production data, deployment, product
behavior, workflows, `main`, or branch retention. It does not close issue #119 until
the final implementation has merged and passed applicable post-merge checks.

## Role separation

The plan candidate requires a different non-author exact-SHA reviewer before adoption.
Each implementation task requires a different builder and exact-revision reviewer,
with a separate non-author merge actor. Model/provider provenance may strengthen
evidence but does not itself create independence or authority. No EHR is triggered by
repository-only documentation and validation work.
