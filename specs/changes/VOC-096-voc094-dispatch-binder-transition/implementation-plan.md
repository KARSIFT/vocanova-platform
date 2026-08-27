# VOC-096 — Implementation Plan

## Preconditions and exact shape

Do not implement until this exact package revision has separate Cloudflare,
security/settings, and independent R4 plan reviews, an accountable adoption decision,
complete adoption bookkeeping, a genuine eligible result, and a normal non-author
merge. Preserve the dirty VOC-090 worktree and every recovery ref.

Use one minimum-sufficient task and exactly two implementation PRs. PR1 is the
16-file executable/resource/living-doc unit. ACT-03 then creates or reconciles only the
held staging environment and two secret names. PR2 is the five-file documentation-only
settings reconciliation. No third executable PR is needed because the runtime binder
is created only after the exact PR2 merge SHA exists.

## Ordered sequence

1. Re-fetch `origin/main` and `origin/develop`; inspect open PRs/issues, worktrees, and
   recovery refs. Freeze the current VOC-094/VOC-095/issue-#158/#164 evidence and
   current Cloudflare public readbacks. Stop on staging resource, baseline, cost, or
   production drift. Do not provision, redeploy, migrate, promote, or delete anything.
2. A different builder creates isolated PR1 from current `origin/develop` and changes
   exactly the 16 files declared in `change.yaml`. Bind the exact existing staging
   account/zone/D1/routes/Workers/baselines/evidence and zero-cost facts. Keep every
   production sentinel/hold unchanged.
3. In PR1, implement `prepared` state and the strict runtime-binder schema/evaluator.
   Add workflow inputs for authority/review URLs and digests plus nonce; exact
   digest/nonce run naming; first-attempt and prior-run replay rejection; public
   unauthenticated read-only comment/PR/files/run fetching; direct current-run
   verification; strict pagination and a fail-closed 1,000-result ceiling; a second
   credential-free verification immediately before migration; and a network-free
   injected-fixture test path unavailable to workflow inputs. Never fetch or execute
   arbitrary URLs and never add GitHub-token permissions for these reads.
4. Update all 16 declared living/executable/config surfaces consistently. PR1 must say
   the GitHub staging environment remains absent/held/planned through its merge and
   must not preclaim ACT-03 or ACT-04 post-state. Historical packages/evidence remain
   unchanged.
5. Run all applicable checks on the exact PR1 head, including governance, risk,
   diff-check, full workspace validation, delivery/foundation tests, Wrangler config
   validation/dry runs, production-sentinel hashes, secret-placement scans, strict
   offline HTTP fixtures, and the complete current-gate parity matrix. Obtain separate
   exact-SHA Cloudflare, security/settings, and independent R4 PASS records. A distinct
   non-author actor merges normally and records post-merge checks/source-head recovery.
6. Only after PR1 merge and separate unchanged VOC-094/VOC-085 authority, ACT-03 may
   create/reconcile `cloudflare-staging`, set exactly `CLOUDFLARE_ACCOUNT_ID` and
   `CLOUDFLARE_API_TOKEN` with one distinct Phase-4 token, and record sanitized pre/
   post-state, rollback, scope, expiry, and no-production/cost drift. VOC-096 itself
   authorizes none of this. Dispatch remains blocked.
7. A different builder opens PR2 from current `develop` and changes exactly:
   `.github/README.md`, `docs/governance/repository-settings.md`,
   `docs/governance/repository-settings-current.yaml`,
   `docs/operations/11-devops-and-ci-cd.md`, and
   `docs/operations/cloudflare-delivery.md`. Record ACT-03 sanitized truth and the two
   secret names only. Any sixth path or executable change stops for package review.
   Run applicable checks, obtain different-actor exact review, and non-author merge.
8. After PR2 merge, independently verify its exact merged `develop` SHA, five-file
   diff, hosted checks, ACT-03 truth, manifest/workflow/policy hashes, staging resources,
   baselines/probes, current smoke, zero rows/seven migrations, Free plans, exact
   incremental cost `0`, unchanged Basic Load Balancing, and production holds.
9. Under the separately authorized VOC-094-ACT-04 only, relay the strict authority
   record on issue #158 with a 30-minute maximum lifetime and one-use nonce. A different
   non-author reviewer re-fetches everything and relays the strict binder-review record.
   Never put a token value in either record.
10. Dispatch only the exact PR2 merge SHA once with matching URL/digest/nonce/baseline/
    cost/confirmation inputs. The credential-free gate and pre-migration recheck must
    both pass live; fixture mode is forbidden. Monitor the unchanged migration/upload/
    exact-promotion/smoke/outcome/rollback sequence. A failed attempt consumes the
    binder and never silently reuses it.
11. Under unchanged ACT-05, immediately revoke/expire the Phase-4 token, retain
    successful staging resources, record outcome/cost/production readbacks, and close
    #164 only after correction post-merge evidence. Close #158 only after all F3
    acceptance evidence is complete.

## Validation minimum

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base <fresh-origin-develop> --head HEAD
git diff --check <fresh-origin-develop> HEAD
pnpm validate
pnpm run ci:foundation
pnpm run ci:delivery
```

Use committed scripts and `docs/development.md` for exact additional commands. Do not
invent a check or report an unavailable check as passing.
