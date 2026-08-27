# VOC-100 — Standard Cloudflare Environment Delivery

Status: draft; implementation is not authorized.

This package replaces the still-future operational parts of the VOC-094/VOC-096
custom five-record runtime binder with standard GitHub environment controls. It is
the only planned package for issue #173 and maps to two ordered implementation pull
requests under the same adopted authority: the delivery-control PR and the mandatory
post-settings documentation-only reconciliation PR.

The package preserves the useful Cloudflare work merged by PR #168: exact staging
resources, Free/$0 limits, synthetic-only staging data, ordered D1 migrations,
immutable Worker versions, smoke checks, and rollback. It removes the duplicated
comment/digest/nonce protocol, per-dispatch token recreation, ACT-03-to-PR2 settings
ceremony, and future self-effectiveness bookkeeping.

The target operating model is:

- staging: only `m-e-h-r-d-a-a-d` may manually dispatch from `develop`; GitHub
  environment `cloudflare-staging` names that same GitHub identity as reviewer,
  allows identity-layer self-review, and disables admin bypass. The dispatcher may
  not approve: a fresh, non-author AI subagent using a different model performs the
  exact-run review and produces an attributable receipt. An authorized operator posts
  that receipt unchanged as the approval comment. GitHub then makes environment
  secrets available to the job, whose first step must validate the current-attempt
  approval history before any workflow expression references
  `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN`;
- production: separate `cloudflare-production` environment and credential, `main`
  only, still disabled and held by `VOC-080-HOLD-01` and `VOC-080-HOLD-02`;
- credentials: reusable across dispatches, least privilege, rotated independently
  of deployment, and never stored as repository secrets or repository content;
- repository delivery: one delivery-control PR, one separately authorized settings
  action, and one immediate documentation-only settings-truth PR. This one-time split
  follows current `AGENTS.md`; it is not a per-dispatch binder or a new plan.

GitHub cannot distinguish the dispatcher from that subagent because both use the
same account. The separation is therefore a governed, auditable actor boundary rather
than a native GitHub identity control. The workflow fails on missing, malformed,
stale, or conflicting receipts, but a dispatcher can forge a syntactically valid one.
Activation therefore requires a separate R4 action record explicitly accepting that
residual risk; detected fabrication or dispatcher-authored review is an incident
requiring a stop and token revocation.

Adopting or merging this package authorizes repository implementation only. It does
not authorize GitHub settings, secret entry, token creation, Cloudflare mutation,
workflow dispatch, production, spending, learner data, DNS, or launch. Each external
action still requires its own exact authority.

Canonical intake: https://github.com/KARSIFT/vocanova-platform/issues/173

Standards basis:

- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments
- https://docs.github.com/en/rest/actions/workflow-runs
- https://docs.github.com/en/code-security/reference/secret-security/secret-types
