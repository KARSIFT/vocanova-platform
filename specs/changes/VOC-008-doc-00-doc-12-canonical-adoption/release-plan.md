# VOC-008 Release Plan

## Package adoption

This proposal prepares repository implementation authority without approving or
editing DOC-00 through DOC-12. Package adoption requires deterministic and hosted
checks, exact-revision independent verification with no blocking finding,
exact-revision founder R4 approval, and authorized human merge into `develop`.

After valid adoption, the package authorizes only the bounded document-review and
adoption implementation described here. It does not pre-approve the final content,
close issue #29, authorize application implementation, create vendor/spend authority,
or enable deployment, release, merge automation, or technical autonomy.

## Later document adoption

Use a separate branch and draft PR from the then-current `develop`. Resolve the full
contradiction register, review the entire 13-document candidate, update lifecycle and
derived metadata atomically, run the complete test plan, and obtain a fresh
exact-revision independent report and founder R4 approval. An authorized human performs
the merge while automatic/autonomous merge is disabled.

## Deployment and activation

There is no preview, staging, production deployment, vendor activation, Control Plane
change, RL1/RL2 activation, automatic/autonomous merge, or autonomous production
release. Governance permission and technical activation remain separate.

## Rollback

Before package merge, close the draft and delete the branch if abandonment is
authorized. After package adoption but before document adoption, revert the package
through a separately governed change. After document adoption, use a separately
governed R4 revert restoring all document content/statuses and derived metadata while
preserving audit history. No external or runtime rollback applies.

## Evidence and closure

Record package PR/base/head/checks/verifier/founder/merge evidence first. Record the
later adoption's document hashes, reconciliation log, full diff, checks, verifier,
founder approval, and canonical merge separately. Package adoption does not close
issue #29; close only after document adoption and truthful lifecycle synchronization.
