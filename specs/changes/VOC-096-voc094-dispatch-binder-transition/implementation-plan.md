# VOC-096 — Implementation Plan

## Preconditions and exact shape

Do not implement until this exact package revision has separate Cloudflare,
security/settings, and independent R4 plan reviews, an accountable adoption decision,
complete adoption bookkeeping, a genuine eligible result, and a normal non-author
merge. Preserve the dirty VOC-090 worktree and every recovery ref.

Use one minimum-sufficient task and exactly two implementation PRs. PR1 is the
27-file package-reconciliation/generated-type/executable/resource/living-doc unit.
ACT-03 then creates or reconciles only the
held staging environment and two secret names. PR2 is the five-file documentation-only
settings reconciliation. No third executable PR is needed because the runtime binder
is created only after the exact PR2 merge SHA exists.

## Ordered sequence

1. Re-fetch `origin/main` and `origin/develop`; inspect open PRs/issues, worktrees, and
   recovery refs. Freeze the current VOC-094/VOC-095/issue-#158/#164 evidence and
   current Cloudflare public readbacks. Stop on staging resource, baseline, cost, or
   production drift. Do not provision, redeploy, migrate, promote, or delete anything.
2. A different builder creates isolated PR1 from current `origin/develop` and changes
   exactly the 27 files declared in `change.yaml`. First reconcile all nine VOC-094
   package surfaces: preserve adoption, amendment, review, approval, evidence, and
   completed Phase-1 history; label the VOC-096 amendment; and replace every
   contradictory still-unstarted Phase-3/4 static-binder/PR2 clause with the prepared
   runtime-binder transition. Bind the exact `prepared_staging_tuple`, including the
   distinct original-execution and final-readback/closure binders, sealed schema and
   migrations, domain/certificate/DNS IDs, rollback baselines, three zero-traffic
   evidence probes, Free/$0/LB state, and production holds. Regenerate both tracked
   `worker-configuration.d.ts` files with locked Wrangler `4.125.0`. Keep every
   production sentinel/hold unchanged.
3. In PR1, implement `prepared` state and the strict runtime-binder schema/evaluator.
   Add workflow inputs for ACT-03, merged-PR2 exact-review, authority, and binder-review
   URLs/digests plus nonce; exact
   digest/nonce run naming; first-attempt and prior-run replay rejection; public
   unauthenticated read-only comment/PR/files/run fetching; direct current-run
   verification; strict pagination and a fail-closed 1,000-result ceiling; a second
   credential-free verification immediately before migration; and a network-free
   injected-fixture test path unavailable to workflow inputs. Never fetch or execute
   arbitrary URLs and never add GitHub-token permissions for these reads.
   Implement the exact committed schema-bundle digests. Parse each RFC-8785 body with
   duplicate-key rejection and separately project/validate fetched API envelope
   metadata. A body never contains its own URL/digest/timestamps/publisher fields.
4. Update all 27 declared package/living/executable/config/generated surfaces
   consistently. PR1 must say
   the GitHub staging environment remains absent/held/planned through its merge and
   must not preclaim ACT-03 or ACT-04 post-state. Historical evidence within VOC-094
   remains preserved and all other adopted/completed packages remain unchanged.
5. Run all applicable checks on the exact PR1 head, including governance, risk,
   diff-check, full workspace validation, delivery/foundation tests, Wrangler config
   validation/dry runs, production-sentinel hashes, secret-placement scans, strict
   offline HTTP fixtures, API `types:check`, web `cloudflare:typecheck`, and the
   complete current-gate parity matrix. Obtain separate
   exact-SHA Cloudflare, security/settings, and independent R4 PASS records. A distinct
   non-author actor merges normally and records post-merge checks/source-head recovery.
6. Only after PR1 merge and separate unchanged VOC-094/VOC-085 authority, ACT-03 may
   create/reconcile `cloudflare-staging`, set exactly `CLOUDFLARE_ACCOUNT_ID` and
   `CLOUDFLARE_API_TOKEN` with one distinct Phase-4 token, and record sanitized pre/
   post-state, rollback, scope, expiry, and no-production/cost drift. Relay the strict
   ACT-03 record with committed API-publisher equality and separately attributable
   settings-actor provenance. VOC-096 itself authorizes none of this. Dispatch remains
   blocked.
7. A different builder opens PR2 from current `develop` and changes exactly:
   `.github/README.md`, `docs/governance/repository-settings.md`,
   `docs/governance/repository-settings-current.yaml`,
   `docs/operations/11-devops-and-ci-cd.md`, and
   `docs/operations/cloudflare-delivery.md`. Record ACT-03 sanitized truth and the two
   secret names only. Any sixth path or executable change stops for package review.
   Run applicable checks, obtain different-actor exact review, and non-author merge.
8. After PR2 merge, independently verify its exact merged `develop` SHA, five-file
   diff, hosted checks, ACT-03 truth, manifest/workflow/policy hashes, staging resources,
   baselines/probes, current smoke, zero application rows/seven sealed migrations, Free
   plans, exact incremental cost `0`, unchanged Basic Load Balancing, and production
   holds. Relay the dedicated strict exact-PR2-merged-SHA body with trusted API
   publisher equality established only from its later fetched envelope, exact nested
   governance actor provenance, PASS, and zero blockers. After creation, fetch its
   canonical URL, immutable server timestamps, and raw-body digest; none is
   self-asserted in the body.
9. Under the separately authorized VOC-094-ACT-04 only and strictly after the PR2 review
   record, relay the strict authority body on issue #158 with a proposed `expires_at`
   and one-use nonce but no `issued_at`, self URL, self digest, or server timestamp.
   Use the already reviewed publisher script: fetch a GitHub API `Date`, set body
   `expires_at` to exactly 25 minutes later, and create the comment once within 60
   seconds. Immediately fetch the created comment; its immutable API `created_at` is the sole
   issuance time and must satisfy `created_at < expires_at <= created_at + 30 minutes`
   without an edit. A different non-author reviewer re-fetches ACT-03, PR2 review, authority, PR/
   run metadata, and the exact tuple, then relays the strict binder-review record.
   Never put a token value in any record. GitHub publisher equality authenticates the
   relayer only; separately reviewed actor/provenance records establish role separation.
10. Dispatch only the exact PR2 merge SHA once with matching URL/digest/nonce/baseline/
    cost/confirmation inputs. The credential-free gate and pre-migration recheck must
    both pass live and strictly before expiry; fixture mode is forbidden. Monitor the unchanged migration/upload/
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
pnpm --dir apps/api-worker run types:check
pnpm --dir apps/web run cloudflare:typecheck
```

Use committed scripts and `docs/development.md` for exact additional commands. Do not
invent a check or report an unavailable check as passing.
