# VOC-084 — Impact Analysis

## Governance and lifecycle impact

VOC-084 changes active package truth for four completed programs and introduces a
static consistency control. This is R3 because incorrect lifecycle evidence can cause
later planning, issue closure, or action-readiness mistakes. It does not change the
active authority model, risk classes, merge evaluator, workflow permissions, or
action-specific authority. T00-T03 are already repository-complete on `develop`; the
remaining T04 candidate is evidence-only and still cannot close any issue before merge
and passing post-merge checks.

## Security and privacy

No secret, credential, personal data, learner data, provider payload, or production
access is required. Evidence preparation may read public GitHub records. Committed
validation is network-free. Historical URLs and public repository identifiers contain
no new private data.

## Runtime, data, and migrations

No Worker, web, API, D1, migration, dependency, configuration, or generated artifact
changes are permitted. The PostgreSQL-to-D1 rehearsal remains synthetic history; no
production data migration is performed or implied.

## Deployment, settings, and external effects

All live actions remain outside scope. VOC-080-HOLD-00, HOLD-01, and HOLD-02 are
preserved. Issue #119 owns public-repository settings drift; VOC-084 must not enable
branch protection, rulesets, scanning, Dependabot, environments, or any other setting.
No branch deletion or `main` promotion occurs.

## Documentation, analytics, and accessibility

Only package/evidence documentation changes. Product analytics, telemetry, UI, and
accessibility are unchanged. Quality workflow applicability follows its existing path
filters and must be reported accurately rather than forced or fabricated.

## Risks and mitigations

- `VOC-084-R00`: false completion from an incomplete evidence row. Mitigation: exact
  schema, manual link audit, deterministic required fields, and independent review.
- `VOC-084-R01`: historical FAILs disappear during cleanup. Mitigation: required FAIL
  inventory and negative fixtures.
- `VOC-084-R02`: repository completion is mistaken for live activation. Mitigation:
  repeated inherited holds and negative hold-release fixtures.
- `VOC-084-R03`: a broad word scan rejects legitimate historical drafting language.
  Mitigation: enumerate every target-package file and parse its explicit
  `active-claim`, `historical`, or `prospective` classification rather than globally
  banning words.
- `VOC-084-R04`: the validator becomes another autonomous state machine. Mitigation:
  static committed comparison only, no GitHub network, writes, dispatch, merge, close,
  release, or agent execution.
- `VOC-084-R05`: issue #85 closes too broadly. Mitigation: post-merge closure language
  says repository-only and repeats all three live holds; issue #119 remains open.

## Dependencies and evidence

- `VOC-084-DEP-00`: different-role exact plan review before adoption.
- `VOC-084-DEP-01`: exact immutable existing task evidence before reconciliation.
- `VOC-084-DEP-02`: issue #119 remains separate.
- `VOC-084-DEP-03`: every target-package file receives exactly one explicit
  active-claim, historical, or prospective classification.
- `VOC-084-DEP-04`: current GitHub API objects, not number-like references in
  historical commit subjects, define the identities of issues #118 and #119.
- `VOC-084-EV-00`: audited machine-readable closure inventory.
- `VOC-084-EV-01`: reconciled VOC-080/VOC-081 active records.
- `VOC-084-EV-02`: reconciled VOC-082/VOC-083 active records.
- `VOC-084-EV-03`: validator and independent negative fixtures.
- `VOC-084-EV-04`: post-merge issue closure/no-live record.
- `VOC-084-EV-05`: final local, rollback, independent, hosted, and post-merge proof.

## Rollback

Rollback is repository-only and reverses T04 through T00. After each task revert,
validate package parsing, governance, the closure contract where present, and diff
cleanliness. Final reversal must reproduce base tree
`d2cb2190d83dae863b0f2126f8853ddffd5ed678`. Reopening an issue comment is a separate
GitHub record correction if a closure statement proves wrong; rollback never touches
Cloudflare, Sentry, a server, DNS, settings, or data.
