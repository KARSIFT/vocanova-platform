# VOC-006 Release Plan

## Package adoption

This package-preparation PR creates implementation authority but implements and
releases nothing. Adoption requires deterministic validation, applicable hosted R3
controls, exact-SHA Claude Code verification with no blocking finding, and an
authorized merge into `develop`. Active A-003 requires no standing founder or
technical-steward approval solely because this is routine R3; EHR is not triggered.

Until adoption, `implementation-ready` is the proposed post-adoption lifecycle. Issue
#19, the package branch, and the draft PR do not independently authorize application
edits. Codex does not approve or merge its own work.

## Later implementation integration

After valid package adoption, a separate short-lived branch and draft PR may implement
only F2-I03. It must pass the complete test plan, actual risk gates, hosted checks, and
exact-SHA independent review before an authorized human merge. The implementation PR
must not close issue #19; final issue closure waits for valid implementation adoption
and lifecycle synchronization.

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

Package evidence `VOC-006-EV-12` must bind the complete package diff, exact candidate,
classifier, deterministic and hosted validation, exact-SHA independent verdict, and
canonical adoption. Implementation evidence `VOC-006-EV-03` through
`VOC-006-EV-11` is collected only later. Package adoption does not claim those later
tests passed or that F2-I03 is complete.
