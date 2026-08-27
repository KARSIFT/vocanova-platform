# VOC-100 — Impact Analysis

## Security and privacy

The change removes unauditable operational complexity and reduces the number of
places that describe authorization. Environment-scoped secrets prevent unrelated
repository jobs from reading staging credentials. Step-scoped environment variables
reduce exposure duration. No secret value is accepted as a workflow input or stored
in Git, comments, artifacts, or agent context.

Residual risk remains because Cloudflare Workers Scripts Edit and D1 Edit are account
permissions, not resource-level permissions. A compromised staging token could reach
other Workers/D1 resources in the selected account. Mitigations are exact account and
manifest checks, minimal permissions, separate production token, 90-day maximum
rotation, immediate incident rotation, no DNS/billing scope, and GitHub environment
branch restriction.

Staging remains synthetic-only. Production learner data and all production effects
remain held.

## Data and migrations

The repository implementation changes no schema and runs no migration. Future manual
staging delivery retains ordered compatible D1 migrations. D1 rollback remains
forward corrective because Worker version rollback cannot reverse a migrated
database. The workflow captures Worker version rollback targets before promotion.

## Analytics and accessibility

No product analytics or accessibility behavior changes. Workflow summaries are
sanitized operational evidence only.

## Risks, dependencies, and evidence

- `VOC-100-R00`: a reusable token has a longer exposure window than a per-run token.
  Mitigation: least privilege, environment scope, maximum 90-day rotation, immediate
  incident rotation, and separate production credential.
- `VOC-100-R01`: simplification could remove a useful fail-closed check with the
  binder. Mitigation: map every retained invariant to deterministic manifest/event
  tests and require specialist comparison against PR #168 behavior.
- `VOC-100-R02`: branch restriction could be documentation-only or drift after
  merge. Mitigation: API readback before final review and a settings-drift procedure.
- `VOC-100-R03`: querying rollback IDs could select the wrong version. Mitigation:
  require exact current 100% deployment readback for both Workers and fail on missing,
  mixed, or ambiguous deployment state.
- `VOC-100-R04`: environment secret names could also exist as broader repository
  secrets. Mitigation: explicit repository-secret absence readback and testable docs.
- `VOC-100-R05`: staging simplification could weaken production. Mitigation: separate
  job/environment/ref/token contract and retained manifest sentinels/HOLD-01/HOLD-02.
- `VOC-100-R06`: settings mutation during an open PR could create truth drift.
  Mitigation: execute only under separate exact authority after the code/docs draft,
  record sanitized readback in that PR, and perform final reviews afterward.
- `VOC-100-DEP-00`: PR #168 merge `2b946024...` is the repository baseline; its
  successful CI/Security/Governance and three PASS reviews are historical evidence,
  not authority transferable to VOC-100.
- `VOC-100-DEP-01`: Cloudflare documents account-scoped API tokens and recommends not
  storing token values in a repository.
- `VOC-100-DEP-02`: GitHub documents that environment secrets become available only
  to jobs referencing the environment after protection rules pass, whereas repository
  secrets are available to all workflows in the repository.
- `VOC-100-EV-00`: exact plan review/adoption/eligibility and normal merge evidence.
- `VOC-100-EV-01`: sanitized environment, branch-policy, secret-name, and repository-
  secret absence readback.
- `VOC-100-EV-02`: workflow diff and positive/negative delivery-policy tests.
- `VOC-100-EV-03`: manifest, Wrangler dry-run, migration, smoke, cost, and privacy
  validation.
- `VOC-100-EV-04`: production sentinel/hold and credential-separation tests.
- `VOC-100-EV-05`: local/hosted checks and exact-SHA specialist/R4 reviews.
