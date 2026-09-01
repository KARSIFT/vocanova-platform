# VOC-116 — Impact Analysis

## Classification

Planned implementation risk is R3 because `.github/workflows/ci.yml` is protected
CI/CD behavior. Impact is repository-only and reversible. The correction neither
changes application behavior nor creates an external effect. A too-small cap repeats
false cancellations; a needlessly large/unvalidated cap can conceal runaway CI and
delay feedback. Exact 20-minute enforcement bounds both risks.

## Impact matrix

| Area                                     | Status                      | Analysis                                                                                       |
| ---------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------- |
| Product scope / users / UX               | Not affected                | No product or learner behavior changes.                                                        |
| Living documents                         | Affected                    | `.github/README.md`, DOC-11, and `docs/development.md` describe the changed CI contract.       |
| Decision records / governance authority  | Not affected                | No ADR or authority rule changes; normal R3 lifecycle applies.                                 |
| Frontend / backend / API / database      | Not affected                | No application, contract, schema, migration, or package change.                                |
| Authentication / privacy / personal data | Not affected                | No identity, data, or credential access.                                                       |
| Security                                 | Affected-protected          | CI is protected; read-only permissions, pinned actions, frozen install, and all checks remain. |
| Accessibility / analytics / AI behavior  | Not affected                | No UI, telemetry, model, or evaluation behavior.                                               |
| Performance                              | Affected-CI-only            | Foundation cancellation ceiling becomes exact 20 minutes; suite work is unchanged.             |
| Infrastructure / deployment              | Affected-repository-CI-only | One GitHub Actions job value changes; no settings, runner class, environment, or deployment.   |
| Rollback                                 | Affected                    | One coherent revert restores the exact prior six-path state and 15-minute cap.                 |
| Testing                                  | Affected                    | Exact timeout drift fixtures and expanded aggregate result negatives are required.             |
| Support / operations                     | Affected                    | Issue #218 receives exact post-merge duration/test-count evidence or recurrence routing.       |

## Exact implementation-path audit

The workflow owns the timeout. `workflow-policy.mjs` already validates every job has a
timeout but does not bind the foundation value; its focused test is auto-discovered by
the unchanged foundation glob. `.github/README.md` and DOC-11 describe workflow
timeouts/aggregation, while `docs/development.md` owns local/hosted reproduction and
troubleshooting. Repository-wide searches found no other living surface that states a
foundation timeout value or needs semantic change.

Therefore the complete implementation inventory is exactly:

1. `.github/README.md`
2. `.github/workflows/ci.yml`
3. `docs/development.md`
4. `docs/operations/11-devops-and-ci-cd.md`
5. `scripts/foundation/workflow-policy.mjs`
6. `scripts/foundation/workflow-policy.test.mjs`

`package.json` is explicitly excluded because its exact aggregate command already
discovers the focused test and must not change. Historical packages remain immutable.

## Failure modes and controls

- Wrong/absent/overbroad cap: exact validator and mutation fixtures fail.
- Tests silently omitted: unchanged command byte proof, 204-test count, and foundation run fail evidence.
- Aggregate weakened: structural policy plus nonsuccess result matrix fails.
- Documentation drift: exact six-path review and cross-document assertions/evidence block merge.
- Hosted variance consumes 20 minutes: timeout remains visible; monitoring stops closure and opens governed intake rather than raising it ad hoc.
- Scope expansion: exact path audit fails and returns to planning.

## External-effect and hold analysis

The plan/implementation uses ordinary repository branches and checks only. It queries
no setting or secret and performs no dispatch, deployment, migration, Cloudflare,
production, data, traffic/DNS, spend, launch, release, or `main` action.
`VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain unchanged.

## Delivery shape

One task and one implementation PR keep the workflow, enforcement, regression proof,
and all living truth atomic. No independently releasable or rollback-safe split exists;
splitting increases contradictory intermediate states and review overhead.
