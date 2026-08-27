# VOC-096 — Tasks

## VOC-096-T00 — Implement the fail-closed post-PR2 runtime binder

- Requirements: `VOC-096-D00` through `VOC-096-D15`
- Acceptance criteria: `VOC-096-AC-00` through `VOC-096-AC-05`
- Tests: `VOC-096-TEST-00` through `VOC-096-TEST-07`
- Evidence: `VOC-096-EV-00` through `VOC-096-EV-07`
- Risk: R4
- Implementation mapping: PR1 exact 16-file prepared binder implementation; ACT-03;
  PR2 exact five-file documentation-only settings reconciliation; post-PR2 authority
  and different-actor binder review; one ACT-04 dispatch; ACT-05 cleanup
- Status: planned-pending-adoption

This remains one task because the prepared state, live binder, PR2 truth boundary,
replay defense, unchanged delivery gates, reviews, and rollback form one authorization
outcome. The two PRs are retained only for the already-adopted external-settings/truth
boundary; component count or implementation convenience does not justify another
task or PR.

VOC-096 authorizes zero external actions. The three remaining actions are the existing
VOC-094-ACT-03, ACT-04, and ACT-05, each still requiring its own accountable actor and
effective action record.
