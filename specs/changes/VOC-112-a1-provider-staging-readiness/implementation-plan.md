# VOC-112 — Implementation Plan

## Preconditions

Implementation must not begin until the exact package candidate has passed distinct
security/authorization and independent R3 reviews, an accountable actor records
adoption and `implementation_authorized: true`, the bookkeeping revision receives
fresh review, the plan merges normally to `develop`, and VOC-105 records F3
complete-effective. Issue #189 and this draft grant no authority.

## Largest safe coherent delivery unit

Use one implementation PR and one task. Adapter behavior, dependency construction,
bindings/types, auth regressions, pending operations procedure, and rollback proof are
one security boundary: no subset is independently releasable without either unused
code, unsafe/incomplete wiring, or unverified provider behavior. One PR avoids the
coordination, elapsed-time, repeated-suite, exact-review, and bookkeeping costs of a
split while committed switches keep the complete revision dormant.

External provider/settings/secret/dispatch actions are not a second implementation
unit. They are prohibited and require a later independently authorized action record;
the repository PR cannot truthfully pre-record their result.

## Exact implementation sequence

1. Re-read the adopted package and inventory the current identity domain, factory,
   config, generated bindings, Worker safety/delivery policy, web journey, and tests.
   Freeze the allowed-path inventory; stop on incompatible drift.
2. Add the Worker-compatible Google adapter behind `OAuthProvider` with injected fetch,
   three literal endpoints, exact GET/POST/form/header/no-redirect contracts, exact
   accepted token fields, 16,384/65,536-byte bounded reader, cancel/release `finally`,
   8-second abort, strict shapes/avatar safety, and confidential token/code handling.
   Unit-test every request, declared/chunked oversize, disposal path, and redirect.
3. Reuse/harden `HttpEmailSender` without vendor specialization. Test HTTPS validation,
   URL credentials/query/fragment, sender/header injection, payload, auth header,
   timeout, no-redirect leakage, 2xx/non-2xx/network behavior, cancellation, and
   redaction with fake transport.
4. Add one centralized dependency/config factory and typed bindings. Prove switches-off
   needs no credentials; enabled+complete constructs the real adapter; enabled+missing,
   partial, malformed, or unsafe configuration fails capability-locally without call or
   session; prove both mixed-provider directions. Add the four exact disabled var
   literals to all Wrangler API maps, reconcile exact delivery-policy maps/tests, and
   regenerate types only through the committed command.
5. Preserve public contract/schema and expand identity/workerd tests across magic link,
   OAuth, replay/expiry, session/cookie/CSRF/logout, disabled user, rate limits, provider
   failure, and two-user isolation. Run web auth/accessibility/e2e coverage.
6. Add the pending sanitized staging runbook, its operations index entry, and named
   network-free policy/negative test. Reconcile only `docs/development.md`; retain all
   live-action/milestone holds. Do not edit any other documentation/generated path.
7. Run focused and full installed checks, enforce the exact fifteen-path inventory,
   inspect secrets/redaction,
   and reverse the complete base-to-head diff in a disposable worktree to prove exact
   repository restoration. Do not call Wrangler remotely or access a provider.
8. Obtain fresh exact-SHA specialist and independent R3 PASS verdicts from different
   non-authors. Resolve every blocking finding with a new SHA and full applicable
   revalidation; a separate non-author actor performs the merge.

## Compatibility and generated artifacts

No D1 migration, public route, DTO, or client behavior changes. If ordinary generation
changes OpenAPI or Worker binding artifacts, include only deterministic outputs and
explain why. Unexpected OpenAPI/client/schema drift is a blocker, not an allowed
expansion. Existing feature switches and held environments remain backward compatible.

## Rollback

The implementation PR body names its adopted base and exact changed paths. Rehearse
`git diff <base>..<candidate> | git apply -R` in a disposable detached worktree and
prove the tree equals the base. After merge, rollback requires a new reviewed revert
PR. No database down migration, provider call, credential removal, setting mutation,
or deployment is part of repository rollback.

## Handoff to later external action

The merged repository may be called `A1 provider-ready`, never `A1 complete`. A later
record must select and authorize provider accounts/contracts/spend, Google client and
email sender/domain, credential installation, disabled-to-enabled configuration,
delivery, test identities, evidence retention, failure triggers, and rollback. That
record must respect the current Cloudflare delivery workflow and HOLD-01/HOLD-02.
