# VOC-004 Release Plan

## Release and deployment authorization

VOC-004 is a canonical-document adoption, not a software release. No deployment,
automatic merge, autonomous merge, RL1/RL2 activation, or autonomous production
release is authorized. DOC-17 and DOC-18 are canonically adopted by the completed
authorized merge of PR #11.

## Completed adoption gates

- Deterministic validation passed on exact candidate
  `89013e6a8fab4cee45935e700d9eb3e49d3d39ed`.
- Independent Claude Code verification returned `PASS WITH NON-BLOCKING FINDINGS` on
  that exact revision.
- No blocking finding remained.
- Founder R4 approval was granted for that exact revision.
- EHR was not triggered.

No standing technical-steward approval is required. The VOC-002 migration approval is
exhausted, permanently non-reusable, and not release evidence for VOC-004.

## Merge and post-merge state

PR #11 completed a governed manual squash merge after all gates. The canonical adopted
`develop` commit is `2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77`. Both documents are
canonical and both adoption flags remain true, while all technical-autonomy and
production states remain inactive or disabled. Return focus to the approved VocaNova
MVP plan; this lifecycle synchronization does not begin the automation roadmap.

## Rollback, human approvals, and closure

After merge, use a new R4 package to atomically revert documents, indexes, state,
policy, validator, tests, and package integration without falsifying audit history.
VOC-004 is `completed`; PR #11, the approved candidate SHA, the canonical adopted
`develop` SHA, and exact-revision verification and founder-approval evidence are
recorded in `change.yaml`.
