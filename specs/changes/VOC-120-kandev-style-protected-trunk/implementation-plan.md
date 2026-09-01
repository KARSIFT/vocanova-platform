# VOC-120 — Implementation Plan

## Preconditions

1. The exact plan candidate passes governance validation and receives independent
   governance, GitHub Actions/ruleset, and security review.
2. Blocking findings are resolved and the final candidate is reviewed again.
3. Adoption and implementation authorization are recorded under the pre-change
   rules before implementation begins.
4. PR #215 and issue #231 remain untouched except for read-only impact analysis.
5. No live GitHub setting changes occur until PR1 is promoted and exact authorization
   for `VOC-120-HOLD-01` is confirmed.

## PR1 — Protected-trunk preparation

Branch from then-current `origin/develop`. Keep the old process operational while
installing the future model in a dual-compatible form.

### Policy and contributor surfaces

- Introduce one concise normative governance/workflow document.
- Rewrite root `AGENTS.md` as an engineering guide modeled on Kandev's scoped style:
  architecture, commands, safety boundaries, and links—not repeated authority prose.
- Replace the PR template with required summary/validation and removable optional
  sections.
- Replace issue templates with concise bug/feature forms containing reproduction or
  user-value, acceptance, risk, and privacy prompts.
- Add the EHR runbook.

### CI and review surfaces

- Create the smallest stable aggregate gate set for policy, web/packages, API/D1,
  integration/quality, and security.
- Add a tested changed-path helper with GitHub-compatible include/exclude behavior.
- Ensure required workflows report aggregate conclusions for skipped expensive work
  and `merge_group` events.
- Retain or bridge legacy check names needed to review and promote PR1.
- Remove or disable the PR-body merge-eligibility poller only after native-equivalent
  evidence is available in the transition path.
- Add least-privilege, SHA-pinned review workflow scaffolding only if usable bot/app
  credentials and identities exist; otherwise document the manual native-review
  path without inventing a false automation claim.

### Historical/control mapping

Inventory every foundation/governance script and classify it as historical-only,
native-replaced, retained product/security control, or explicitly retired. Produce a
machine-readable transition inventory used by PR2 and rollback validation. Do not
delete legacy package/history surfaces in PR1.

### PR1 validation

- current pre-change governance and risk classification;
- action pinning and workflow security lint;
- changed-path and aggregate-gate contract tests;
- current application validation for all paths touched by workflow restructuring;
- exact diff/control inventory and rollback rehearsal;
- independent GitHub Actions/ruleset, governance, and security review.

## Pre-change promotion and synchronization

After PR1 merges to `develop`, follow the current reviewed `develop` to `main` release
flow and one final reviewed main-to-develop synchronization. Record exact SHAs,
ancestry, branch inventory, checks, and rollback ref. No deployment is implied.

## Settings activation

With explicit founder authorization:

1. Capture exact live repository/ruleset/branch/security/environment settings.
2. Enable secret scanning, push protection, and Dependabot security updates where
   supported.
3. Create immutable `v*` tag rules.
4. Create the protected `main` ruleset with deletion/non-fast-forward protection,
   linear/squash PRs, conversation resolution, stable gates, and merge queue.
5. Avoid permanent administrator bypass.
6. Exercise a non-destructive test PR or equivalent read-only/temporary verification
   proving every required gate reports and the queue accepts the configured names.
7. Commit or immediately follow with truthful settings documentation.

If any readback differs, restore the captured snapshot and stop before PR2.

## PR2 — Main-only cleanup

Branch from the exact protected `main` activation SHA.

- Remove DOC-15/DOC-16-era active authority surfaces superseded by the concise source.
- Remove `specs/changes`, nine-file templates, and package lifecycle validators from
  the active tree after recording their history/index and replacement mapping.
- Remove historical F2/F3/settings/closure prose-replay validators that do not protect
  current product behavior.
- Remove PR-body evidence schema, adapter, tests, and 1,800-second polling job.
- Remove develop-target, release-head, and main-to-develop synchronization machinery.
- Reconcile README, CONTRIBUTING, docs indexes, operations/development/security/
  delivery docs, CODEOWNERS, package scripts, and workflows to one current truth.
- Keep product security, API, D1, integration, accessibility, dependency, delivery,
  and rollback tests in their affected-path or trunk/release lanes.
- Ensure final workflow triggers and ruleset names are `main`/`merge_group` correct.

## Develop retirement

After PR2 merges and final checks/readback pass:

1. Prove the protected `main` SHA contains all intended `develop` ancestry.
2. Preserve an immutable rollback tag/ref and recreation command.
3. Confirm no open non-EHR PR or required automation targets `develop`.
4. Handle PR #215 only according to its EHR outcome; do not silently close it.
5. With explicit `VOC-120-HOLD-02` authorization, retire/delete `develop`.
6. Read back default branch, branches, rulesets, required checks, security settings,
   tags, and open PR targets.

## Rollback

Before settings activation, revert PR1 under the current flow. After activation,
restore the captured settings snapshot, keep or recreate `develop` from the recorded
SHA if needed, and revert PR2 through protected `main`. No rollback deletes Git
history, local developer state, D1 state, Cloudflare resources, or production data.
