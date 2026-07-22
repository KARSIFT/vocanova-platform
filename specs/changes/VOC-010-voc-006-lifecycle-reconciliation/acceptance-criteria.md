# VOC-010 Acceptance Criteria

## VOC-010-AC-01 — Package precedes correction

The complete package and index entry are independently verified and validly merged
before existing VOC-006 records change.

Traceability: `R01`, `R12`; `T01`, `T02`; `TEST-01`; `EV-01`, `EV-03`, `EV-10`.

## VOC-010-AC-02 — Evidence is exact

Every recorded PR/issue number, SHA, timestamp, state, verdict, comment ID, and URL
matches live GitHub and Git history.

Traceability: `R02`, `R04`; `T03`; `TEST-02`; `EV-02`.

## VOC-010-AC-03 — Events remain distinct

PR #20, PR #21, PR #22, PR #24, and issue #19 remain separate truthful events.

Traceability: `R03`; `T03`, `T05`; `TEST-03`; `EV-02`, `EV-07`.

## VOC-010-AC-04 — Completion remains bounded

VOC-006 is completed only for F2-I03 with authority exercised/exhausted and no F2-I04
or later authority.

Traceability: `R07`, `R08`; `T05`; `TEST-04`; `EV-07`.

## VOC-010-AC-05 — PR #24 remains non-canonical

No record claims PR #24 merged or completed synchronization.

Traceability: `R05`; `T03`, `T05`; `TEST-05`; `EV-02`, `EV-07`.

## VOC-010-AC-06 — PR #22 remains valid and untouched

The application implementation is neither invalidated nor recreated, and issue #19
closure has no retroactive effect.

Traceability: `R04`, `R06`; `T03`, `T06`; `TEST-06`; `EV-02`, `EV-06`.

## VOC-010-AC-07 — Stale claims are removed consistently

No in-scope current record says issue #19 is active, implementation is pending, or
authority remains active.

Traceability: `R07`; `T04`, `T05`; `TEST-07`; `EV-06`, `EV-07`.

## VOC-010-AC-08 — Exact path scope is preserved

Only authorized specification paths change; all excluded paths are untouched.

Traceability: `R09`, `R10`; `T04`, `T06`; `TEST-08`; `EV-03`, `EV-06`.

## VOC-010-AC-09 — Activation remains disabled

All six activation/automation values remain false or disabled.

Traceability: `R11`; `T06`; `TEST-09`; `EV-08`.

## VOC-010-AC-10 — Validation and rollback pass

Governance, foundation, YAML/link, classifier, diff, scope, and reverse-apply checks
pass for each exact candidate.

Traceability: `R13`, `R14`; `T07`; `TEST-10`, `TEST-11`; `EV-04`, `EV-09`.

## VOC-010-AC-11 — Every candidate is independently gated

Each exact SHA receives fresh independent verification with no blocking finding.

Traceability: `R12`, `R13`; `T08`; `TEST-12`; `EV-10`, `EV-12`.

## VOC-010-AC-12 — Separation and closure hold

Codex does not approve/merge, deploy, begin F2-I04, or close issue #39; closure waits
for a separately merged final sync.

Traceability: `R12`, `R13`; `T08`, `T09`; `TEST-13`; `EV-11`, `EV-13`.
