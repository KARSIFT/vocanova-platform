# VOC-008 Implementation Plan

## Preconditions and stop conditions

Document adoption must not begin until this package candidate passes deterministic and
hosted checks, receives exact-SHA independent Claude Code verification with no blocking
finding, receives exact-SHA founder R4 approval, and is validly merged into canonical
`develop`. Re-verify issue #29, live base, package lifecycle, document hashes,
instructions, governance, transition state, and target paths afterward.

Stop for a changed baseline without reconciliation, unresolved C01–C11 item, newly
discovered material conflict, unclear founder product/privacy/infrastructure choice,
required protected-governance edit, application/runtime change, vendor action,
deployment, production action, activation, or scope outside this package.

## Adoption implementation sequence

1. Create a fresh isolated worktree from current `origin/develop`; inventory all
   in-scope docs, hashes, frontmatter, indexes, manifest, graph, and validation tools.
2. Build a topic-by-document semantic matrix and verify all local links and cited
   sections.
3. Resolve C01 through C11 plus newly discovered conflicts using the smallest coherent
   edits; record every substantive before/after decision and rationale.
4. Re-run the semantic matrix and governance-compatibility review; stop if founder
   judgment remains unresolved.
5. Atomically update DOC-00 through DOC-12 lifecycle metadata and remove only obsolete
   proposed notices. Preserve DOC-13/DOC-19 proposed and DOC-14 not adopted.
6. Synchronize root/category indexes, migration manifest, document graph, relations,
   completeness, and adoption evidence while retaining VOC-007 provenance.
7. Run every installed applicable check and explicit link/section/metadata/scope
   validation; inspect the full diff for false authority or external effect.
8. Publish a separate draft adoption PR to `develop`, declare R4, record exact
   evidence, obtain exact-SHA independent verification and founder approval, and stop
   for authorized human merge.
9. After merge, synchronize package/adoption lifecycle evidence through a separately
   reviewed record before closing issue #29.

## Scope controls

Stage only explicitly enumerated in-scope documents and derived documentation metadata.
Do not edit protected governance, DOC-15 through DOC-18, amendments, application code,
dependencies, workflows, infrastructure, or historical migration evidence. Do not use
adoption to claim that F2/F3, automation, deployment, or product implementation exists.

## Validation and independent verification

The adoption PR records exact base/head, document before/after hashes, correction log,
changed files/full diff, status inventory, link/section results, classifier, all
commands, hosted checks, limitations, rollback, and pending approvals. Claude Code
independently reads the entire candidate corpus and verifies semantic coherence,
governance precedence, privacy/security/AI trust, lifecycle truth, and exclusions.
Material correction invalidates earlier exact-SHA evidence.

## Deployment and rollback

There is no deployment or release. Before merge, rollback is closing the draft and
deleting the proposal branch when authorized. After merge, rollback is a separately
governed R4 revert restoring the prior content/statuses and derived metadata together.
No schema, learner-data, secret, environment, vendor, credential, or production
recovery applies.
