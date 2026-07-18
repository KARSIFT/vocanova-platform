# VOC-006 Release Plan

## Package adoption

PR #20 prepared repository implementation authority without implementing or releasing
F2. Deterministic and hosted checks passed, applicable R3 controls completed, exact-SHA
Claude Code verification returned verdict `PASS`, and the authorized merge into
`develop` completed.
The exact package candidate was `2d6996234c2c9132bef2f59a018008788809a71c`;
canonical adoption is `b02327e995c7d0e754ea1a2a0a9ad331cb67145f`. Active A-003
required no standing founder or technical-steward approval solely because this was
routine R3; EHR was not triggered.

The valid adoption made this package implementation authority for unchanged F2-I03
through active issue #19. Package adoption is not implementation completion, issue
closure, deployment, release, production activation, automatic or autonomous merge
authority, RL1/RL2 activation, or F2-I04 or later authorization. Codex did not approve
or merge its own package work.

## Later implementation integration

Future implementation must use a separate short-lived branch and separate draft PR
for only F2-I03. Its actual diff must receive classification, pass the complete test
plan, deterministic and hosted checks, and receive its own exact-SHA independent
Claude Code review where required before a separate authorized human merge. The
implementation PR must not close issue #19; final issue closure waits for valid
implementation adoption and lifecycle synchronization.

## Deployment and activation

No release, Cloudflare/OpenNext deployment, preview environment, staging, production,
automatic merge, RL1/RL2 activation, or autonomous production release is authorized.
The Next.js production build is validation evidence only and creates no operational
environment.

## Rollback

Before package merge, rollback is closing the draft and deleting the branch. After
package adoption but before implementation, rollback is a separately governed revert
of the package adoption commit, which removes unused authority without application or
data effects. After a later implementation merge, rollback is a governed revert of
that implementation commit followed by frozen install and all prior web/workspace/
governance checks. No database, migration, secret, learner-data, or environment
rollback applies.

## Evidence and closure

Package adoption evidence `VOC-006-EV-12` is complete: PR #20 records the complete
package diff, classifier, deterministic and hosted validation, exact candidate
`2d6996234c2c9132bef2f59a018008788809a71c`, Claude verdict `PASS` and its evidence,
and canonical adoption `b02327e995c7d0e754ea1a2a0a9ad331cb67145f`. Implementation
evidence `VOC-006-EV-03` through `VOC-006-EV-11` is collected only later. Package
adoption does not claim those later tests passed or that F2-I03 is complete.
