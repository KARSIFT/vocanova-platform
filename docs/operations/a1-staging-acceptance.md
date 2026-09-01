# A1 provider staging acceptance — pending template

Status: `pending-separate-authority`

This is a sanitized procedure and evidence template, not an execution record. VOC-112
changes repository code only: it did not select provider accounts, install credentials,
change settings, dispatch, deploy, send or receive a message, use a live identity, or
complete A1. Every procedure below remains `pending-separate-authority` until a later
accountable action record names the actor, exact action, evidence, rollback owner, and
completion or expiry condition. No step may be executed under VOC-112 authority.

<!-- A1-STAGING-ACCEPTANCE-RECORD-BEGIN -->

```json
{
  "schema_version": "vocanova-a1-staging-acceptance-v1",
  "record_status": "pending-separate-authority",
  "a1_milestone_status": "pending-separate-authority",
  "external_effects_by_voc112": "none-repository-only",
  "exact_binding": {
    "exact_repository_sha": "PENDING_EXACT_40_HEX_SHA",
    "workflow_run_id": "PENDING_AUTHORIZED_RUN_ID",
    "run_attempt": "PENDING_POSITIVE_INTEGER_ATTEMPT",
    "action_authority_record": "PENDING_LATER_ACTION_RECORD",
    "result": "pending-separate-authority",
    "evidence": "pending-separate-authority"
  },
  "provider_status": {
    "email_magic_link": "pending-separate-authority",
    "google_oauth": "pending-separate-authority"
  },
  "checks": [
    {
      "id": "exact-sha-attempt-binding",
      "procedure": "Bind a separately authorized staging attempt to one exact repository SHA, workflow run, positive attempt, and later action-authority record before any provider action.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "magic-link-request-receipt-single-consume",
      "procedure": "Using a disposable non-production inbox with no retained identifier, request one real magic link, verify receipt, and consume it exactly once.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "magic-link-replay-denial",
      "procedure": "Replay the already consumed magic link and verify denial without an additional identity or session.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "magic-link-redacted-logs",
      "procedure": "Inspect sanitized logs and retain only redacted evidence with no inbox identifier, link, token, credential, provider body, or personal data.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "google-start-callback",
      "procedure": "Using a disposable non-production Google identity with no retained identifier, perform one real Google start and callback through the exact allowlisted redirect.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "google-mismatched-state-denial",
      "procedure": "Submit a mismatched OAuth state and verify denial without an identity or session.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "google-replayed-state-denial",
      "procedure": "Replay an already consumed OAuth state and verify denial without an additional identity or session.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "session-navigation",
      "procedure": "Verify the authenticated session persists through normal protected navigation without extending the fixed lifetime.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "onboarding-routing",
      "procedure": "Verify a new authenticated identity follows onboarding routing and an onboarded identity follows the protected destination.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "logout-old-cookie-denial",
      "procedure": "Log out, then reuse the old session cookie and verify protected access is denied.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "unauthenticated-denial",
      "procedure": "Request protected resources without authentication and verify a non-enumerating denial.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "two-user-cross-access-denial",
      "procedure": "Use two disposable non-production users and verify guessed identifiers and idempotency keys cannot cross the requester boundary.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "csrf-denial",
      "procedure": "Submit protected mutations with absent and mismatched CSRF values and verify denial without mutation.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "disabled-user-denial",
      "procedure": "Disable a disposable non-production user and verify its existing session and new authentication attempts are denied.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "abuse-limit",
      "procedure": "Exercise the bounded authentication abuse limit and verify excess attempts are denied without account enumeration.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "email-provider-kill-switch",
      "procedure": "Disable only the email provider switch and verify email is unavailable with no network call, fake fallback, or effect on a complete Google capability.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "google-provider-kill-switch",
      "procedure": "Disable only the Google provider switch and verify Google is unavailable with no network call, fake fallback, or effect on a complete email capability.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "exact-worker-rollback",
      "procedure": "Restore the exact prior Worker version named by the later authority record, verify held switches, and retain sanitized rollback evidence.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    },
    {
      "id": "forward-only-d1-integrity",
      "procedure": "Verify no schema change is expected; preserve D1 and use only a separately reviewed forward correction if integrity remediation is ever required.",
      "result": "pending-separate-authority",
      "evidence": "pending-separate-authority"
    }
  ],
  "later_authority": {
    "provider_accounts_and_selection": "pending-separate-authority",
    "contracts_and_spend": "pending-separate-authority",
    "google_oauth_client_and_redirect_allowlist": "pending-separate-authority",
    "email_sender_domain_and_inbox": "pending-separate-authority",
    "credential_creation_installation_rotation": "pending-separate-authority",
    "disposable_test_identities_and_retention": "pending-separate-authority",
    "staging_dispatch_and_deployment": "pending-separate-authority",
    "evidence_minimization": "pending-separate-authority",
    "rollback_owner_and_procedure": "pending-separate-authority",
    "completion_or_expiry": "pending-separate-authority"
  },
  "production_holds": [
    {
      "id": "VOC-080-HOLD-01",
      "state": "held"
    },
    {
      "id": "VOC-080-HOLD-02",
      "state": "held"
    }
  ]
}
```

<!-- A1-STAGING-ACCEPTANCE-RECORD-END -->

The later action record must separately authorize provider selection and accounts,
contract or spend, Google client and redirect allowlist, email sender/domain/inbox,
credential creation/installation/rotation, disposable identities and retention,
staging dispatch/deployment, evidence minimization, rollback, and expiry. Provider
runtime secret bindings are `EMAIL_PROVIDER_API_KEY` and
`GOOGLE_OAUTH_CLIENT_SECRET`; this template records names only and never values.

A1 remains unresolved. Production traffic and D1 migrations remain held under
`VOC-080-HOLD-01`; production learner data remains held under
`VOC-080-HOLD-02`. This repository-only template grants no production, learner-data,
DNS, spending, provider-account, credential, staging, dispatch, or deployment action.
