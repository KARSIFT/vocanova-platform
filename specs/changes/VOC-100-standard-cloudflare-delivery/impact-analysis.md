# VOC-100 — Impact Analysis

## Complete impact disposition

| Category | Disposition | Evidence and boundary |
| --- | --- | --- |
| Product and user experience | Not affected | No application behavior, route, content, or learner flow changes. |
| Living documentation | Affected | All inventoried current CI, architecture, governance, settings, and operations surfaces change through PR1/PR2. |
| Decision/change records | Affected | VOC-100 prospectively supersedes conflicting future binder instructions; historical VOC-080/VOC-094–099 records remain immutable. |
| Frontend | Not affected | Web code and UI are unchanged; only the existing Worker delivery step is controlled. |
| Backend and API | Not affected | Hono/API behavior and contracts are unchanged; existing version upload/promotion is retained. |
| Authentication/authorization | Affected | Delivery authorization moves from bespoke comments to a named dispatcher, fresh non-author AI decision-maker, mechanical same-account approval proxy, current-attempt receipt readback, and live protection checks. Product auth is unchanged. |
| Security and privacy | Affected | Reusable credential lifetime, environment/repository/organization secret scope, redaction, reviewer, and synthetic-data boundaries change. |
| Data and migrations | Affected | No schema changes now; future staging retains ordered D1 migrations and forward-only correction. |
| Analytics | Not affected | No product analytics change; only sanitized workflow summaries remain. |
| Accessibility | Not affected | No rendered product surface changes. |
| Performance and reliability | Affected | Deployment preflight, exact 100% rollback discovery, smoke, failure handling, and credential availability change; runtime code does not. |
| AI/provider behavior | Not affected | AI kill switch, provider boundaries, prompts, responses, and spend remain unchanged/held. |
| Infrastructure/deployment | Affected | GitHub environments, workflow gate, token lifecycle, Worker versions, D1 migration invocation, and production holds are protected R4 surfaces. |
| Testing and verification | Affected | Binder tests are replaced by event/protection/secret-isolation/Wrangler-parse/rollback tests and three exact-SHA reviews. |
| Support and operations | Affected | Operators use one manual dispatch plus one environment approval; rotation uses a no-write credential check, not a PR. |
| Cost and billing | Not affected | Free plan and zero-paid-spend ceiling remain exact; any paid requirement stops work. |
| Production and learner data | Not affected | Production environment, credentials, traffic, D1, data, and HOLD-01/HOLD-02 remain prohibited. |
| Unknowns | One platform limitation requiring separate acceptance | GitHub cannot prove the AI authored the comment posted by the shared account. Exact current-attempt receipt checks detect malformed/stale/conflicting records but not a forged valid receipt. The staging action owner must explicitly accept or reject that residual in the separate R4 delegation; rejection keeps delivery disabled. Locked Wrangler surfaces were read back. |

## Security and privacy

The change removes unauditable operational complexity and reduces the number of
places that describe authorization. Environment-scoped secrets plus a fresh
non-author AI review, attributable approval receipt, first-step exact approval-history
validation, disabled admin bypass, exact custom `develop` policy, live pre-environment
readback, and sole dispatcher `m-e-h-r-d-a-a-d` prevent ordinary unrelated jobs from
evaluating staging credentials. Repository and
organization secrets with the same names are prohibited. Step-scoped variables reduce
exposure duration. No token value is an input or stored in Git/evidence/agent context.

Residual risk remains because Cloudflare Workers Scripts Edit and D1 Edit are account
permissions, not resource-level permissions. A compromised staging token could reach
other Workers/D1 resources in the selected account. Mitigations are exact account and
manifest checks, minimal permissions, separate production token, 90-day maximum
rotation, immediate incident rotation, no DNS/billing scope, GitHub environment
review, and exact manifest/resource checks.

This intentionally expands durable staging authority relative to a one-use binder:
the named dispatcher can request multiple deployments while the token/delegation is
valid. It does not expand repository merge, production, DNS, billing, or data
authority. A different non-author AI actor must decide every SHA-bound run, while
an authorized proxy posts that actor's exact PASS receipt under the dispatcher's GitHub
identity. GitHub cannot prove receipt authorship. The standing delegation expires with
the token no later than 90 days and is revoked on actor, scope, receipt, or security
drift. The repository administrator can change settings or forge a receipt,
irreducible platform-owner capabilities; live preflight, exact first-step readback,
sanitized settings truth, and post-run audit make detectable violations visible but
do not provide cryptographic provenance.

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
  incident rotation, different per-run AI reviewer, sole dispatcher, and separate
  production credential. Owner: settings/secret operator. Tests/evidence: TEST-01/02,
  EV-01. Contingency: revoke, remove secrets, and restore prior unrevoked token only
  if it still satisfies the exact contract.
- `VOC-100-R01`: simplification could remove a useful fail-closed check with the
  binder. Mitigation: map every retained invariant to deterministic manifest/event
  tests and require specialist comparison against PR #168 behavior. Owner: builder
  and Cloudflare reviewer. Tests/evidence: TEST-03/05, EV-02/03. Contingency: keep
  staging blocked or revert PR1 through review.
- `VOC-100-R02`: branch restriction could be documentation-only or drift after
  merge. Mitigation: credential-free live API readback before every environment job,
  immediate PR2 truth, and settings-drift stop. Owner: settings operator. Tests/
  evidence: TEST-01/03, EV-01/02. Contingency: remove secrets/environment or restore
  exact protections before any dispatch.
- `VOC-100-R03`: querying rollback IDs could select the wrong version. Mitigation:
  require exact current 100% deployment readback for both Workers and fail on missing,
  mixed, or ambiguous deployment state. Owner: staging operator. Tests/evidence:
  TEST-04/05, EV-02/03. Contingency: stop before write; after promotion restore the
  exact captured Worker UUIDs and forward-correct D1 only.
- `VOC-100-R04`: environment secret names could also exist at repository/organization
  scope or an untrusted job could reference the environment. Mitigation: broader-
  scope absence readback, required reviewer, exact actor/ref, job-graph assertions,
  and no secret reference outside environment credential/write steps. Owner:
  security/settings reviewer. Tests/evidence: TEST-01/03/04, EV-01/02. Contingency:
  remove broader secrets, revoke token, and block the workflow.
- `VOC-100-R05`: staging simplification could weaken production. Mitigation: separate
  job/environment/ref/token contract and retained manifest sentinels/HOLD-01/HOLD-02.
  Owner: independent R4 reviewer. Tests/evidence: TEST-06, EV-04. Contingency: keep
  production pre-environment failure unconditional and remove any accidental setting.
- `VOC-100-R06`: settings mutation creates a temporary documentation mismatch.
  Mitigation: PR1 merges first, separately authorized mutation occurs only when the
  documentation-only PR2 branch is ready, and PR2 opens immediately with sanitized
  readback under the same adopted package. Owner: settings operator and PR2 builder.
  Tests/evidence: TEST-00/01/07, EV-00/01/05. Contingency: roll settings back to the
  documented pre-state if PR2 cannot open or pass review.
- `VOC-100-R07`: GitHub cannot distinguish the human dispatcher from the AI reviewer
  because approval is posted by a proxy using `m-e-h-r-d-a-a-d` and identity-layer
  self-review must be enabled. A dispatcher could forge a valid receipt and bypass the
  intended actor separation. Mitigation: instantiate a fresh task-scoped reviewer
  with no exact-SHA authorship or authenticated approval credential; use model
  diversity for agent-mediated dispatch; require a structured current-attempt receipt;
  mechanically post it unchanged; validate the approval history as the first job step
  before any secret expression; audit every run; disable admin bypass. These controls
  do not prevent a valid forgery. Owner: staging action owner, approval proxy, and
  independent deployment-review actor. Tests/evidence: TEST-01/03/04, EV-01/02.
  Contingency: unless a separate R4 action record explicitly accepts the residual,
  keep staging disabled. On detected fabrication, cancel the run; after any write,
  stop delivery, revoke the token, remove/disable environment secrets, audit the run,
  and require a reviewed corrective package before reactivation.
- `VOC-100-R08`: locked Wrangler command drift can fail after credentials are exposed.
  Mitigation: exact migration/status/promotion/rollback invocations parse without
  authentication or network in a no-help CI harness, deliberate unknown-option
  controls prove the parser is active, and unsupported D1 flags are prohibited.
  Owner: Cloudflare specialist. Tests/evidence: TEST-05, EV-03. Contingency: stop
  before write and correct only through reviewed repository change.
- `VOC-100-R09`: the approval proxy uses an authenticated GitHub session whose actual
  capability may be broader than the one authorized endpoint. Mitigation: the AI
  reviewer never receives the credential; action authority permits the named proxy
  only to submit the unchanged receipt to the exact run/environment approval endpoint;
  pre/post API readback records the bounded action. Owner: staging action owner and
  approval proxy. Tests/evidence: TEST-01/03/04, EV-01/02. Contingency: cancel the
  run, revoke/rotate the affected GitHub session or token, audit repository actions,
  and keep staging disabled until the capability boundary is restored.
- `VOC-100-DEP-00`: PR #168 merge `2b946024...` is the repository baseline; its
  successful CI/Security/Governance and three PASS reviews are historical evidence,
  not authority transferable to VOC-100.
- `VOC-100-DEP-01`: Cloudflare documents account-scoped API tokens and recommends not
  storing token values in a repository.
- `VOC-100-DEP-02`: GitHub documents that environment secrets become available only
  to jobs referencing the environment after protection rules pass, whereas repository
  secrets are available to all workflows in the repository.
- `VOC-100-EV-00`: exact plan review/adoption/eligibility and normal merge evidence.
- `VOC-100-EV-01`: sanitized reviewer/protection/branch-policy/environment-secret,
  repository/organization-secret absence, token-policy/status/expiry, AI-review
  provenance/receipt, and credential-check readback.
- `VOC-100-EV-02`: workflow diff and positive/negative delivery-policy tests.
- `VOC-100-EV-03`: manifest, Wrangler dry-run, migration, smoke, cost, and privacy
  validation.
- `VOC-100-EV-04`: production sentinel/hold and credential-separation tests.
- `VOC-100-EV-05`: local/hosted checks and exact-SHA specialist/R4 reviews.
