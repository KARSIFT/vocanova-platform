# VOC-004 Release Plan

## Release and deployment authorization

VOC-004 is a canonical-document adoption, not a software release. No deployment,
automatic merge, autonomous merge, RL1/RL2 activation, or autonomous production
release is authorized. DOC-17 and DOC-18 remain candidates until an approved merge.

## Preconditions

- Deterministic validation passes on the exact final revision.
- Independent Claude Code verification passes on that exact revision.
- Every blocking finding is resolved and the resulting exact revision is reverified.
- Founder grants R4 approval bound to the exact final revision.
- EHR remains not triggered, or any newly discovered genuine trigger is stopped and
  governed separately.

No standing technical-steward approval is required. The VOC-002 migration approval is
exhausted, permanently non-reusable, and not release evidence for VOC-004.

## Merge and post-merge state

Only an authorized human process may merge after all gates. This package neither
grants merge authorization nor enables auto-merge. After merge, both documents are
canonical and both adoption flags remain true, while all technical-autonomy and
production states remain inactive or disabled. Reassess only the minimum automation
needed, then return focus to the approved VocaNova MVP plan.

## Rollback, human approvals, and closure

Before merge, abandonment is reversible by closing the draft PR. After merge, use a
new R4 package to atomically revert documents, indexes, state, policy, validator,
tests, and package integration without falsifying audit history. Close VOC-004 only
after merge evidence and any required post-merge validation are recorded; this draft
candidate remains `implementing`.
