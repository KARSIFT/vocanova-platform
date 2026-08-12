# VOC-072 — Cloudflare Zone-Scoped API Token for VOC-067-T05 Origin-Port Cutover

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #535](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/535),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-072
- Title: Cloudflare Zone-Scoped API Token for VOC-067-T05 Origin-Port Cutover
- Canonical path:
  `specs/changes/VOC-072-same-request-as-github-issue-535-voc-067-t05`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R3` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issue:
  [#535](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/535)

## Why this exists

VOC-067-T05 added repository-driven Cloudflare API cutover tooling
(`infra/scripts/cloudflare-remove-production-origin-port-remap.sh`,
`deploy-production.yml` input `voc067_cloudflare_origin_cutover`) per founder
approval in VOC-067-DEP-03. The cutover job resolves the zone with
`GET /zones?name=vocanova.site` before reading or mutating Origin Rules on the
`http_request_origin` phase.

Issue #535 reports that the production workflow run fails at zone resolution:
the token bound as `PRODUCTION_CLOUDFLARE_API_TOKEN` returns an **empty** zone
list for `vocanova.site`. That token was originally provisioned for Workers AI
secret sync (`deploy-production.yml` injects `AI_PROVIDER_API_KEY` from
`PRODUCTION_CLOUDFLARE_API_TOKEN` and `PRODUCTION_CLOUDFLARE_ACCOUNT_ID`) — not
for Zone or Origin Rules API access.

Until a zone-capable credential is stored in GitHub and wired into the cutover
job, VOC-067-TEST-06 remains fail-closed, `VOC-067-EV-05` keeps
`cloudflare_remap_api_status: unconfirmed`, and the `:8443` bridge must stay in
place (`scripts/foundation/voc067-cutover-bridge-gate.test.mjs`).

## What this package does

1. **Provision a zone-scoped Cloudflare API token and GitHub secret**
   (`VOC-072-T00`): founder/ops creates a token with **Zone:Read** and
   **Origin Rules:Edit** limited to `vocanova.site`, stores it in the
   production GitHub environment (dedicated secret recommended — see open
   question 1), records redacted evidence.
2. **Wire the cutover workflow and operator docs to the zone-capable secret**
   (`VOC-072-T01`): update `deploy-production.yml`'s
   `voc067-cloudflare-cutover` job and the post-smoke `--apply` step; document
   env var precedence in `infra/scripts/` and `infra/README.md`; optionally
   improve the empty-zone error so permission misconfiguration is obvious.
3. **Prove `--verify-only` succeeds in production CI**
   (`VOC-072-T02`): dispatch `deploy-production.yml` with
   `voc067_cloudflare_origin_cutover=verify-only`; record a redacted transcript
   showing zone resolution and remap status (found or absent).

Executing `--apply` to remove a still-present remap, and completing
VOC-067-T04 bridge retirement, remain governed by VOC-067's cutover order once
verify-only passes — not silently expanded here unless adoption explicitly
authorizes a follow-on dispatch in T02 evidence.

## What this package deliberately does NOT do

- Not reopening VOC-067 shared-edge architecture, T02–T03 nginx layout, or
  VOC-037 isolation decisions (already founder-approved in VOC-067).
- Not committing secret values, token strings, or Cloudflare account IDs to git.
- Not weakening fail-closed behavior when credentials are missing or mis-scoped.
- Not authorizing production deployment or remap removal by itself — see
  `release-plan.md`.
- Does not adopt itself. `change.yaml` leaves every adoption/authorization field
  at its template default.

## Open questions for the reviewing human

See `specification.md`. The most important:

1. **Dedicated secret vs broadening `PRODUCTION_CLOUDFLARE_API_TOKEN`**
   (`VOC-072-DEP-00`).
2. **Exact dedicated secret name** if separation is chosen (`VOC-072-DEP-01`).

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
