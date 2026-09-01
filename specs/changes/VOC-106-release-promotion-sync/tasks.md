# VOC-106 — Tasks

## VOC-106-T00 — Independently promote an exact fresh-frozen develop alias to main

- Requirement source: `VOC-106-D00`–`D03`, `D05`–`D06`
- Acceptance criteria: `VOC-106-AC-00`, `VOC-106-AC-02`
- Tests: `VOC-106-TEST-00`, `VOC-106-TEST-01`, `VOC-106-TEST-05`
- Evidence: `VOC-106-EV-00`, `VOC-106-EV-01`, `VOC-106-EV-05`
- Implementation pull-request mapping: first protected-history PR; merge commit
- Status: authorized; pending fresh release freeze and immutable attempt creation

## VOC-106-T01 — Synchronize the promoted main ancestry into develop

- Requirement source: `VOC-106-D04`–`D06`
- Acceptance criteria: `VOC-106-AC-01`, `VOC-106-AC-02`
- Tests: `VOC-106-TEST-02`–`VOC-106-TEST-05`
- Evidence: `VOC-106-EV-02`–`VOC-106-EV-05`
- Implementation pull-request mapping: second hard-sequenced protected-history PR;
  short-lived head, merge commit, not a component-driven split
- Status: pending-release-merge

## VOC-115 durable release-attempt contract

This is the operative prospective procedure; every conflicting SHA-only, generic
collision, blanket abandonment/retry, and release-attempt auto-deletion instruction
above is retained only as superseded history. Adopted VOC-115 uses deterministic
`release/voc-106-claim-*`, a full-SHA attempt ref, and allocation-bound
`release/voc-106-submit-*`. Exact same-target atomic requests coalesce; foreign,
malformed, or post-claim stale topology stops. Only the exact invocation verifying the
submit-marker `201` may send one canonical no-retry/no-redirect PR POST. Every other
observer/response and marker-plus-zero is `submit-outcome-unknown`, never retry.

The separately authorized held active no-bypass three-pattern ruleset plus exhaustive
numeric-max history equality is a prerequisite. Lossless exact page/object/command/
scan/pass schemas, dual-source refs, two stable passes, null-provenance stops, and
cardinality-first cleanup apply. Claim, attempt, and submit refs remain immutable and
never deletion eligible; same-`develop` retry requires a deterministic closed/conflict
frontier and fresh distinct identity. `VOC-080-HOLD-01` and every settings/ref/release/
deployment/live hold remains. Approved SHA/review/adoption evidence is unchanged.
