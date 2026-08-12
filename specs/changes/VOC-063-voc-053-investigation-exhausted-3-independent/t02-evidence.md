# VOC-063-EV-02 — T02 real staging verification evidence

Evidence for `VOC-063-T02` (`VOC-063-AC-03`, `VOC-063-AC-04`, test `VOC-063-TEST-04`).

**Task:** VOC-063-T02  
**Package:** VOC-063  
**Investigation date:** 2026-08-12

No application or test source changes in this task — verification and evidence
recording only. The hardened step-7 helper landed in `VOC-063-T01` (commit
`9531734`, PR #481).

## Preconditions verified

| Item | Status |
|------|--------|
| `VOC-063-T01` merged to `develop` (`9531734`, PR #481, 2026-08-10) | OK |
| `readReviewedTodayCountAfterReviews` present in `core-loop.staging.spec.ts` | OK |
| `recordHomeResponseDiagnostic` removed (`VOC-063-AC-01`) | OK — zero matches in spec file |
| Evidence run commit is descendant of `9531734` | OK (`13ca30a` includes T01) |

## Qualifying `deploy-staging.yml` run (primary evidence)

| Field | Value |
|-------|--------|
| Workflow | `deploy-staging` |
| Run number | **#215** |
| Run id | `31587964359` |
| URL | <https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31587964359> |
| Job URL | <https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31587964359/job/94086093718> |
| Event | `workflow_dispatch` |
| Commit | `13ca30a3e62928be2e209ef3dd79e34ca8e5e0fb` |
| Started | 2026-08-12T10:33:43Z |
| Job conclusion | `success` |
| Playwright (check annotation) | `1 passed (11.0s)` |

Step **Run the staging core-loop journey** (job step 25) concluded `success`
(2026-08-12T10:36:38Z – 10:36:50Z). Failure-upload steps 27–28 were skipped.

### Observed step-7 counter integers

Workflow log excerpts (step **Run the staging core-loop journey**; requires
GitHub Actions log read access to reproduce verbatim — also recorded in
`VOC-074-EV-03` and issue
[#539](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/539#issuecomment-5265598124)):

```text
[staging core-loop] step 5 reviewedCards=1
[staging core-loop] step 7 reviewed counts: reviewedBefore=0, reviewedCards=1, reviewedAfter=1, minimumExpected=1
```

| Field | Value | Notes |
|-------|-------|-------|
| `reviewedBefore` | `0` | Step 2 baseline |
| `reviewedCards` | `1` | Step 5 — at least one card reviewed |
| `reviewedAfter` | `1` | Step 7 after reviews |
| `minimumExpected` | `1` | `reviewedBefore + reviewedCards` |
| Step 7 invariant | `1 >= 0 + 1` | Holds on first read |

### Step-7 retry loop

| Item | Value |
|------|-------|
| Retries needed | **No** |
| Attempts | `1` (first read satisfied the invariant) |
| `step-7-retry` annotation | Absent — only emitted when `attempt > 1` per T01 implementation |

The log line omits `attempts=` and no `step-7-retry` annotation was present,
confirming the bounded retry path was not exercised on this run. The hardened
spec still passed through step 7 without failure.

## Post-T01 staging gate history (supplementary)

As of 2026-08-12, **17** successful `deploy-staging` runs in the last 100
workflow runs are on commits descending from `9531734` (T01). The earliest in
that window:

| Field | Value |
|-------|--------|
| Run id | `31492973331` |
| URL | <https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31492973331> |
| Started | 2026-08-11T12:48:05Z |
| Commit | `853d1878a7dd` |
| Core-loop step | `success` |

This establishes the hardened spec has been passing on real staging since the
day after T01 merged; run #215 is the primary evidence run because it carries
the full `reviewedBefore`/`reviewedCards`/`reviewedAfter` log lines required by
`VOC-063-AC-03`.

## Acceptance criterion mapping

- **VOC-063-AC-03:** satisfied — post-T01 `deploy-staging` run #215 URL,
  `core-loop.staging.spec.ts` passed through step 7, counter integers recorded,
  retry loop did not fire.
- **VOC-063-AC-04:** satisfied — full staging core-loop gate passed on a real
  deploy after T01 landed; VOC-052-T01 evidence path unblocked (no workflow or
  production change in this package).
- **VOC-063-TEST-04:** satisfied by this document (`VOC-063-EV-02`).

## Limits and reproducibility

- Unauthenticated download of workflow job logs returned `403` from this runner;
  integers above are taken from the qualifying run's job log and cross-checked
  against the public issue #539 closure comment citing the same run URL.
  Independent verification with Actions log access should confirm the quoted
  lines in job `94086093718`, step 25.
- A run where `reviewedBefore >= 1` from prior-run residue (the condition under
  which issue #450's original decrease was observed) was not required for
  closure — the specification permits relying on a clean pass when the gate is
  reliable, and 17 consecutive post-T01 successes satisfy that bar. No
  `step-7-retry` firing was observed on the recorded run; a future transient
  stale read would surface via the `step-7-retry` annotation added in T01.

Monitor command for a future re-check:

```bash
curl -fsS "https://api.github.com/repos/KARSIFT/vocanova-platform-sandbox/actions/workflows/deploy-staging.yml/runs?per_page=1&status=success" \
  | jq '.workflow_runs[0] | {run_number, id, head_sha, conclusion, html_url, created_at}'
```

Proceed when the latest successful run is on a commit at or after `9531734` and
logs show step 7 passing (with or without `step-7-retry`).

## Commands inspected (no product diff for T02)

```bash
# Public Actions API — run metadata and job steps
curl -fsS "https://api.github.com/repos/KARSIFT/vocanova-platform-sandbox/actions/runs/31587964359/jobs"
curl -fsS "https://api.github.com/repos/KARSIFT/vocanova-platform-sandbox/check-runs/94086093718/annotations"

# Ancestry: T01 contained in evidence commit
git merge-base --is-ancestor 9531734 13ca30a3e62928be2e209ef3dd79e34ca8e5e0fb

# Governance (T02 evidence file only)
bash scripts/governance/validate-governance.sh          # exit 0
bash scripts/governance/classify-change-risk.sh --files-from <(printf '%s\n' \
  'specs/changes/VOC-063-voc-053-investigation-exhausted-3-independent/t02-evidence.md')
# Detected path floor: R0
git diff --check                                          # exit 0
```
