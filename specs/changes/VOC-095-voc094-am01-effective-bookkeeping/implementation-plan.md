# VOC-095 — Implementation plan

## Preconditions

1. Adopt VOC-095 through independent exact-plan review and an accountable adoption
   decision. Do not treat issue #161 or this draft as implementation authority.
2. Start one isolated implementation branch/worktree from then-current `origin/develop`.
   Record branch, base SHA, worktrees, recovery refs, and a clean-tree readback.
3. Re-read the exact VOC-094 package and all eight listed package documents. Audit
   other living documents for direct stale AM-01 claims and record exclusions.

## Ordered repository-only work

1. Capture the immutable evidence from VOC-094-AM-01 and PR #160: approved candidate,
   final bookkeeping SHA, exact review URLs, Governance eligibility run, merge SHA,
   post-merge runs, and lifecycle/source-head evidence.
2. Edit only the VOC-094 package surfaces listed in `change.yaml`. Reconcile AM-01's
   adoption bookkeeping gate, implementation authority/effectiveness, adoption and
   release status, task status, README lifecycle text, and blocker list. Preserve
   original adoption, all historic reviews, and external holds.
3. Add the ACT-01 sequencing incident and D1 UUID as preserved non-secret evidence,
   explicitly prohibiting D1 use, deletion, migration, or read/write action under
   VOC-095. Keep the fresh ACT-02 authority requirement prominent.
4. Do not edit application code, workflows, delivery policy, overlays, Cloudflare
   configuration, GitHub settings, environments, secrets, or living documents that
   do not contain a demonstrated direct stale contradiction.
5. Run local validation and inspect the complete diff. Obtain fresh different-actor
   exact-revision R4 and applicable governance/lifecycle specialist review. Resolve
   every finding; any material revision requires fresh review and checks.
6. Open one implementation PR to `develop` with a complete evidence body and exactly
   one current-head merge-eligibility binder. A separate non-author actor merges it
   normally only after all required checks and reviews pass.
7. Read back the merge SHA, `develop`, source-head lifecycle, worktrees, and recovery
   refs. Record post-merge CI/Security/Governance success and the exact recreation
   command. Close no external action and do not claim ACT-02 readiness.

## Explicit non-actions

No Cloudflare/GitHub API calls, workflow dispatch, secret handling, DNS change,
deployment, migration, D1 query, billing change, production access, public launch,
branch/worktree deletion, or `main` mutation is part of implementation.
