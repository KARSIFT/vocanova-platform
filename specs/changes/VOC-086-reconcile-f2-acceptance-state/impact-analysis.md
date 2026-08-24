# VOC-086 — Impact Analysis

## Consequence

The change corrects canonical milestone/evidence truth used for future dependency
decisions. It changes no product behavior or live state. Repository/local F2 completion
becomes explicit; no later milestone becomes accepted.

## Failure modes and mitigations

- `VOC-086-R00`: false F2 completion. Mitigation: exact PR #108 head/merge/post-merge
  identifiers and validator comparison.
- `VOC-086-R01`: historical candidate evidence rewritten as if it never existed.
  Mitigation: explicit candidate-history fields/sections retained.
- `VOC-086-R02`: F2 wording implies F3/A1/product/live acceptance. Mitigation: bounded
  exclusions and negative fixtures across every active surface.
- `VOC-086-R03`: one index drifts later. Mitigation: one network-free designated-surface
  validator in the foundation aggregate.
- `VOC-086-R04`: merge or issue closure precedes exact review/checks. Mitigation:
  read-only eligibility evidence, separate merge actor, and post-merge closure gate.

## Operational and rollback impact

Rollback is repository-only reverse-order revert. It restores the previous contradictory
text but performs no data rollback. Rehearsal must compare exact trees in a disposable
worktree and remove that worktree afterward. No Cloudflare, settings, deployment, or
production contingency is applicable because those effects are prohibited.
