# VOC-079 — Implementation Plan

## Preconditions

Do not implement until this exact package revision is independently reviewed, receives
the one-time founder approval required by the current R4 model, is adopted, and records
`implementation.authorized: true`. Do not use the proposed rule to approve this package.

Before enforcement changes land, satisfy `VOC-079-DEP-01`: VOC-078 must retire the
active call to the external `karsift-ai-infra` merge gate. VOC-079 then replaces the
policy-decision portion with a repository-owned, read-only eligibility evaluator; it
does not recreate the external state machine or add a merge credential. Work occurs on
short-lived branches from current `origin/develop`; never push directly to `develop` or
`main`.

## Sequence

1. **T00 — Reconcile canonical authority.** Update DOC-15/DOC-16, the approval matrix,
   risk classification, protected-area guidance, AGENTS.md, CONTRIBUTING.md, decision
   indexes, and repository-settings guidance. Add a dedicated decision record and a
   DOC-16 amendment-history entry. Remove DOC-16's `not R4` orchestrator-path condition
   and bind that path to the universal evidence contract. Distinguish active rules from
   historical evidence.
2. **T01 — Build the local eligibility evaluator.** After the external call is gone,
   add a provider-neutral pure policy module and normalized evidence schema. It emits
   eligible/blocked plus reasons, owns no write token, and performs no GitHub mutation.
   Add a read-only GitHub adapter invoked by the Governance workflow; it reads live PR,
   check, review, and package evidence and writes only the Actions job summary/check
   result. Add adapter and evaluator positive/negative tests. Unknown risk stays
   fail-closed.
3. **T02 — Reconcile package drafting.** Update change-package templates and validation so
   R0–R4 default to `automatic_merge_allowed: true`; require a documented package-local
   reason for `false`; preserve an explicit transition exception for VOC-079.
4. **T03 — Prove and activate.** Run the full semantic inventory and deterministic suite,
   obtain exact-revision independent governance/security review, record the one-time
   founder approval, and merge without deployment.

Tasks may be split into independently reviewed PRs after adoption, but no intermediate
revision may claim the new authority is active while docs and enforcement disagree.

## Required validation

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
pnpm validate
git diff --check
```

Run targeted policy fixtures that cover `VOC-079-TEST-01` through
`VOC-079-TEST-04`. Inspect the real GitHub check graph if merge-policy workflows are
changed. Do not report unavailable checks as passing.

## Deployment and rollback

No deployment, server, cloud, secret, environment, or repository-settings mutation is
authorized. The release is the repository governance merge only.

Rollback trigger: R4 can merge without complete evidence; self-review becomes possible;
an active rule contradicts the new model; or a named external-effect gate is bypassed.
Rollback by reverting the transition implementation to the last `develop` revision
before activation and rerunning governance validation under the restored policy.
