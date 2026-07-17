# VOC-004 Implementation Plan

## File reconciliation and implementation sequence

1. Verify live `develop` and issue #10 authority.
2. Locate exact frozen Markdown sources, record paths, and calculate source hashes.
3. Create an isolated branch from the current `develop` tree.
4. Copy each frozen source to its approved taxonomy destination.
5. Integrate only truthful lifecycle and integrity frontmatter; preserve body bytes.
6. Update documentation and specification indexes.
7. Atomically set both adoption flags true while leaving technical autonomy disabled.
8. Extend established R4 path coverage and deterministic validators/tests.
9. Run all required validation, inspect the full diff, commit, push, and open a draft
   PR targeting `develop`.

## Scope controls

Do not edit the frozen substantive bodies, implement roadmap capabilities, change
application behavior, migrate Documents 00–14, redesign taxonomy, reuse VOC-002
authority, create routine steward approval, or alter historical A-003 evidence.

## Verification and handoff

Record exact source and body hashes, exact changed files, base and candidate SHAs,
path floor, semantic R4 assessment, validation output, implementer provenance, EHR
assessment, and pending approval gates in the draft PR. Hand the exact final candidate
to Claude Code for independent verification before founder approval.

## Deployment and rollback

There is no deployment. Do not merge or enable auto-merge. Before merge, close the PR
or delete the proposal branch if abandonment is authorized. A post-merge rollback must
be a separately approved R4 atomic reversal preserving audit history.
