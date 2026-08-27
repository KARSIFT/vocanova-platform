# VOC-100 — Release Plan

## Release and deployment authorization

The plan and implementation merges are repository-only. They do not deploy. GitHub
environment/secret setup and a maximum-90-day standing staging delegation require
separate exact action authority. The delegation names dispatcher `m-e-h-r-d-a-a-d`
and required reviewer `NegarJafari`; every run remains SHA-bound. Production, paid
spend, DNS change, learner data, and launch remain prohibited.

## Preconditions and staging outcome

Before PR1 delivery-control merge:

- the exact plan is adopted and on `develop`;
- PR1 passes full local/hosted checks and three exact-SHA zero-blocker reviews;
- live pre-environment readback keeps staging blocked while the environment is absent;
- a different actor performs a normal eligible merge.

Before PR2 settings-truth merge:

- a separate exact action record authorizes the named token/settings actors and
  payload/rollback and records `NegarJafari` participation confirmation;
- Cloudflare dashboard readback proves the finite token's exact account, two
  permissions, status, and expiry before entry;
- repository/organization secret absence is proven;
- `cloudflare-staging` requires only `NegarJafari`, prevents self-review/admin bypass,
  and has exactly one custom `develop` branch rule;
- the two environment secrets are entered without disclosing values;
- immediate PR2 records sanitized truth, passes applicable checks/reviews, and a
  different actor merges it normally.

Before first staging dispatch:

- postmerge checks pass on the merged `develop` SHA;
- the standing delegation remains valid for dispatcher/reviewer/token and the exact
  run confirmation names the `develop` SHA;
- current settings/token scope and Free/$0 state read back correctly;
- production remains held and staging contains synthetic data only.

The dispatcher selects `staging` on `develop` with `DEPLOY staging <sha>` and
`NegarJafari` approves the environment deployment. The workflow
runs required validation, captures current API/web versions, applies ordered D1
migrations, uploads immutable SHA-tagged versions, promotes exact UUIDs, smokes the
API/web contract, and records a sanitized summary. Bounded soak monitors health,
errors, and Free-limit signals without learner content.

## Rollback

Stop before write on settings, token, account, manifest, resource, cost, migration,
or production drift. On settings failure, remove the incomplete environment/secrets
and restore documented pre-state so PR2 is not needed for a false result. On rotation,
keep the prior token unrevoked until the installed replacement passes the no-write
environment check; otherwise reinstall the prior value and revoke the replacement.
Revoke compromised/over-scoped tokens immediately. On promotion/smoke failure,
restore both exact pre-promotion Worker version IDs. Do not attempt automatic D1 rollback; use the
reviewed forward corrective migration path. Revert repository policy only through a
reviewed rollback PR and keep live settings documentation truthful.

## Independent verification and closure

Plan, PR1, and PR2 each require applicable different-actor Cloudflare/Wrangler,
security/settings, and independent R4 exact-SHA PASS evidence. Separate non-author
merge actors record merge/source-head lifecycles. Close issue #173 only after both
PRs, settings readback, and one successful environment-reviewed staging dispatch are
evidenced. Issue #158 may close only when its broader staging activation
outcome and soak are complete.
