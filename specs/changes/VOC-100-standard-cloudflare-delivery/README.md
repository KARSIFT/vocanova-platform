# VOC-100 — Standard Cloudflare Environment Delivery

Status: draft; implementation is not authorized.

This package replaces the still-future operational parts of the VOC-094/VOC-096
custom five-record runtime binder with standard GitHub environment controls. It is
the only planned package for issue #173 and maps to one implementation pull request.

The package preserves the useful Cloudflare work merged by PR #168: exact staging
resources, Free/$0 limits, synthetic-only staging data, ordered D1 migrations,
immutable Worker versions, smoke checks, and rollback. It removes the duplicated
comment/digest/nonce protocol, per-dispatch token recreation, ACT-03-to-PR2 settings
ceremony, and future self-effectiveness bookkeeping.

The target operating model is:

- staging: manual dispatch from `develop`, GitHub environment
  `cloudflare-staging`, and environment-scoped `CLOUDFLARE_ACCOUNT_ID` /
  `CLOUDFLARE_API_TOKEN`;
- production: separate `cloudflare-production` environment and credential, `main`
  only, still disabled and held by `VOC-080-HOLD-01` and `VOC-080-HOLD-02`;
- credentials: reusable across dispatches, least privilege, rotated independently
  of deployment, and never stored as repository secrets or repository content;
- repository delivery: one coherent implementation PR with the settings readback
  recorded before final exact-revision review, avoiding a PR2.

Adopting or merging this package authorizes repository implementation only. It does
not authorize GitHub settings, secret entry, token creation, Cloudflare mutation,
workflow dispatch, production, spending, learner data, DNS, or launch. Each external
action still requires its own exact authority.

Canonical intake: https://github.com/KARSIFT/vocanova-platform/issues/173

Standards basis:

- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments
- https://docs.github.com/en/code-security/reference/secret-security/secret-types
