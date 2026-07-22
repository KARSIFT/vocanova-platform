# VOC-007 Implementation Plan

## Preconditions and stop conditions

Implementation must not begin until this exact package candidate passes deterministic
and hosted checks, receives exact-SHA Claude Code verification with no blocking
finding, receives exact-SHA founder R4 approval, and is validly merged into canonical
`develop`. Then re-verify live `develop`, issue #25, package lifecycle, source hashes,
instructions, governance state, conventions, and target paths.

Stop for a changed source hash, unresolved content loss, new ID/path conflict, required
edit to a protected existing authority file, unapproved product redesign, unclear
privacy/user-trust choice, application change, deployment, autonomy activation, or
scope outside this package.

## Implementation sequence

1. Create an isolated short-lived branch/worktree from current `origin/develop` and
   inventory current docs, indexes, manifests, validators, and source hashes.
2. Build a section-level coverage map from each source file to its canonical target;
   split combined sources while preserving stable DOC identities and all load-bearing
   content.
3. Add proposed DOC-00 through DOC-13 with truthful metadata and cross-references,
   using live path conventions and no duplicate architecture/planning/decision tree.
4. Preserve the reconciliation changelog as migration evidence with a visible erratum
   for stale governance conclusions and retain the six product/technical decisions as
   proposed review points.
5. Account for historical DOC-14 in the manifest without importing it as current
   authority; add proposed DOC-19 as an accurate cross-referencing guide to live
   authority and technical activation state.
6. Search imported content for stale governance/merge/release statements and correct
   only those passages, recording every semantic correction in a table.
7. Add the migration manifest, document graph, root index changes, and category
   indexes; validate unique IDs, paths, statuses, relationships, and coverage.
8. Run every installed applicable governance, risk, document, link, metadata, graph,
   whitespace, and source-hash check; do not invent unavailable checks.
9. Inspect exact changed paths/full diff for protected files, runtime effects, secrets,
   production data, deployment, autonomy, silent approval, and unrelated changes.
10. Publish a separate draft implementation PR to `develop`, declare effective R4,
    record evidence, obtain exact-SHA independent verification and founder approval,
    and stop without merge, deployment, self-approval, or issue closure.

## Validation and independent verification

The implementation PR records actual commands, complete file mapping, exact source
hashes, exact base/head, classifier output, hosted checks, and rollback. Claude Code
independently reviews the exact candidate for source completeness, stable IDs,
frontmatter truth, governance accuracy, product/technical consistency, security and
privacy implications, and exclusions. Material correction invalidates prior exact-SHA
verification and founder approval.

## Deployment and rollback

There is no deployment or release. Before merge, rollback is closing the draft and
deleting its branch. After an authorized squash merge, rollback is a separately
governed revert followed by all prior checks. Proposed documents do not authorize
product implementation. No database, learner-data, secret, environment, credential,
or production rollback applies.
