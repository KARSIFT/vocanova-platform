# VOC-101 — Release Plan

## Repository delivery

After exact plan adoption, a different builder prepares one implementation PR into
`develop`. Distinct non-author Cloudflare, security/governance, and independent R4
reviewers verify the exact final SHA; a separate non-author/non-reviewer actor performs
the normal merge only when hosted checks and merge eligibility pass.

## External-action boundary

Plan adoption and implementation merge change repository policy only. They do not
create or reconcile `cloudflare-staging`, create or install a credential, dispatch a
workflow, deploy, migrate D1, change traffic or DNS, spend money, access data, or act
on production. Those actions remain separately authorized and fail closed.

## Activation after implementation

A new exact staging-settings and credential action record consistent with the
adopted standing-token policy is required before the held VOC-100 settings-truth
boundary resumes. The immediate documentation-only settings-truth PR remains part of
VOC-100 and is not duplicated here.

## Credential-action contingency

A later separately authorized voluntary replacement retains the prior credential only
while checking the replacement. If the replacement fails, restore the prior
environment secret, pass the protected no-write check, and revoke the failed token.
After a mandatory revocation trigger, the prior credential is never restored; revoke
and remove any failed replacement and keep staging disabled.

If any required revocation cannot be confirmed, remove the environment API-token
secret, reject new approvals, cancel in-flight staging runs, and record an incident.
Retry and verify the token is inactive without logging it. Staging remains disabled
until that verification succeeds and a valid credential passes the protected check.

## Rollback

Before merge, close the PR without effect. After merge, use a separately reviewed
revert PR. Since this package performs no external action, rollback never revokes or
changes a live credential by itself.
