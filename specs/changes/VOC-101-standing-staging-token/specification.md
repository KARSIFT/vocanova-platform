# VOC-101 — Specification

## Objective

Make the exact least-privilege staging credential a standing token valid until
revoked, without changing what it can access or who may use staging delivery.

## Requirements

### VOC-101-D00 — Adoption precedes implementation

Issue #176 and chat establish intent only. The exact candidate needs independent
review and accountable adoption. Neither the plan nor adoption authorizes settings,
secrets, Cloudflare, dispatch, deployment, or production action.

### VOC-101-D01 — Standing credential

Future living guidance describes the staging token as operator-revoked and valid
until revoked. Token replacement or revocation remains an operator-controlled
operational action with no plan or PR.

### VOC-101-D02 — Least privilege is invariant

The token remains restricted to account
`0a9eda28b96d77c24dcde74f3e074d47` and exactly `Workers Scripts Edit` plus `D1
Edit`. It remains stored only as `CLOUDFLARE_API_TOKEN` in `cloudflare-staging`; the
canonical account identifier remains `CLOUDFLARE_ACCOUNT_ID` in the same environment.
Neither name may exist at repository or organization scope. Values never appear in
repository, logs, comments, artifacts, or agent records.

### VOC-101-D03 — Revocation is fail-closed

Revoke immediately on suspected disclosure, account or permission drift,
shared-identity fabrication, loss of operator control, or accountable-operator
revocation request. After any mandatory trigger, staging remains disabled unless and
until a replacement passes dashboard policy readback, local status/account
verification without logging, environment secret entry, and the protected no-write
credential check. Only a voluntary replacement with no mandatory trigger may retain
the prior credential through those checks and revoke it afterward. If a voluntary
replacement fails, restore the prior environment secret, pass the protected no-write
check, and revoke the failed replacement. If a replacement after a mandatory trigger
fails, revoke and remove the failed replacement and keep staging disabled.

### VOC-101-D04 — Delivery authority is unchanged

VOC-100's manual event, actor, branch, SHA/attempt receipt, approval-history-first
secret isolation, environment protections, exact resource tuple, synthetic data,
Free/$0 ceiling, rollback, and production holds remain intact. The credential policy
does not grant dispatch or review authority.

### VOC-101-D05 — Living truth changes; history does not

Update the exact living path inventory in `change.yaml`. Deterministic checks cover
every inventoried living file, require the standing valid-until-revoked contract, and
reject any contradictory staging-token lifecycle claim without changing unrelated
application or session credential terms. Do not edit VOC-100 or VOC-094 through
VOC-099 historical records.

### VOC-101-D06 — Verification and delivery

Use one coherent implementation PR. Plan and implementation each require fresh
exact-revision Cloudflare, security/governance, and independent R4 PASS evidence from
distinct non-author actors, hosted checks, and a merge by a separate non-author actor.

## Exclusions

No GitHub setting or secret mutation, Cloudflare mutation, dispatch, deployment,
DNS, spending, data access, production action, launch, application behavior, Worker
configuration, D1 migration, or historical-package rewrite is included.
