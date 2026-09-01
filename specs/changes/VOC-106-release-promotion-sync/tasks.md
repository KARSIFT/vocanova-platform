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
