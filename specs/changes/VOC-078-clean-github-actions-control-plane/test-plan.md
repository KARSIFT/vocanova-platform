# VOC-078 — Test Plan

## VOC-078-TEST-00 — Exact workflow inventory

- Assert `.github/workflows/` contains exactly the four approved filenames.
- Assert no repository file references `KARSIFT/karsift-ai-infra` except historical material that
  adoption explicitly retains; active docs and executable configuration must contain zero.
- Expected: `VOC-078-AC-00` passes.

## VOC-078-TEST-01 — Deterministic CI parity

- Run `pnpm validate` from a clean dependency installation.
- Verify the CI workflow invokes committed scripts rather than duplicating command logic.
- Verify Node, pnpm, Go, and third-party actions are pinned.
- Expected: `VOC-078-AC-01` passes.

## VOC-078-TEST-02 — Governance positive and negative coverage

- Run governance validation on the real tree.
- Run existing/new fixtures proving a protected workflow change cannot declare less than its
  detected floor and malformed governance fails closed.
- Inspect shell boundaries for pull-request-controlled input.
- Expected: `VOC-078-AC-02` passes.

## VOC-078-TEST-03 — Quality and security checks

- Prove accessibility and Lighthouse jobs run for relevant web changes and skip unrelated docs.
- Run dependency audit and secret-scan negative fixture using synthetic non-secret text only.
- Assert workflow permissions are read-only and actions are immutable-SHA pinned.
- Expected: `VOC-078-AC-03` passes.

## VOC-078-TEST-04 — No deployment or monitoring capability

- Search executable workflows/scripts referenced by workflows for SSH, SCP, Cloudflare mutation,
  deployment, branch promotion, server health polling, Sentry API calls, and staging/production
  secret access.
- Confirm `infra/`, application code, migrations, and live settings are absent from the diff.
- Expected: `VOC-078-AC-04` passes.

## VOC-078-TEST-05 — No agent-triggered write authority

- Assert workflows have no `issues`, `issue_comment`, or agent-label triggers.
- Assert no workflow has contents/issues/pull-request write permission.
- Assert orchestrator entrypoints/assets are absent and package scripts cannot launch them.
- Expected: `VOC-078-AC-05` passes.

## VOC-078-TEST-06 — Cross-document reconciliation

- Search active documentation for retired workflow/job names, external-infra claims, automatic
  release/deployment claims, and orchestrator-live claims.
- Read every remaining match and classify it as current truth or remove/update it.
- Expected: `VOC-078-AC-06` passes.

## VOC-078-TEST-07 — Rollback rehearsal

- In a disposable worktree, revert task commits in reverse order.
- Re-run YAML, governance, and diff checks after each revert.
- Do not push, deploy, or use production credentials.
- Expected: `VOC-078-AC-07` passes.

## Required commands

```bash
pnpm validate
pnpm audit --audit-level high
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Evidence records exact commands, outputs, workflow run URLs, and reviewed commit SHAs as
`VOC-078-EV-00` through `VOC-078-EV-07`.
