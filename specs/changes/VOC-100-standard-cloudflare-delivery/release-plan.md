# VOC-100 — Release Plan

## Release and deployment authorization

The plan and implementation merges are repository-only. They do not deploy. GitHub
environment/secret setup and first staging dispatch require separate exact action
authority. Production, paid spend, DNS change, learner data, and launch remain
prohibited.

## Preconditions and staging outcome

Before implementation merge:

- the exact plan is adopted and on `develop`;
- the one implementation PR passes full local and hosted checks;
- an authorized operator creates/reconciles `cloudflare-staging`, restricts it to
  `develop`, and enters the two environment secrets without disclosing values;
- sanitized settings/token-scope readback is committed in the same PR;
- the exact final implementation SHA receives three zero-blocker reviews; and
- a different actor performs a normal eligible merge.

Before first staging dispatch:

- postmerge checks pass on the merged `develop` SHA;
- exact staging-dispatch authority names that SHA and accountable operator;
- current settings/token scope and Free/$0 state read back correctly;
- production remains held and staging contains synthetic data only.

The operator dispatches `staging` from `develop` with `DEPLOY staging`. The workflow
runs required validation, captures current API/web versions, applies ordered D1
migrations, uploads immutable SHA-tagged versions, promotes exact UUIDs, smokes the
API/web contract, and records a sanitized summary. Bounded soak monitors health,
errors, and Free-limit signals without learner content.

## Rollback

Stop before write on settings, token, account, manifest, resource, cost, migration,
or production drift. Revoke a compromised or over-scoped token and remove the
environment secrets. On Worker promotion or smoke failure, restore both exact
pre-promotion Worker version IDs. Do not attempt automatic D1 rollback; use the
reviewed forward corrective migration path. Revert repository policy only through a
reviewed rollback PR and keep live settings documentation truthful.

## Independent verification and closure

Plan and implementation each require different-actor Cloudflare/Wrangler,
security/settings, and independent R4 exact-SHA PASS evidence. A separate non-author
merge actor records merge and source-head lifecycle. Close issue #173 only after the
implementation, settings readback, and one successful separately authorized staging
dispatch are evidenced. Issue #158 may close only when its broader staging activation
outcome and soak are complete.
