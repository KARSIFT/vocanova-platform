# VOC-104 — Acceptance Criteria

## VOC-104-AC-00 — Reviewed scope and authority

- Requirements: `VOC-104-D00`, `VOC-104-D07`
- Task: `VOC-104-T00`
- Tests: `VOC-104-TEST-00`
- Evidence: `VOC-104-EV-00`

The exact plan candidate has Cloudflare/CI-security specialist and independent R3
PASS reviews from distinct non-author actors and an accountable adoption record.
Adoption authorizes only the declared three-file repository implementation once the
package is on `develop`; every external action remains prohibited.

## VOC-104-AC-01 — Version-list producers complete before resolvers start

- Requirements: `VOC-104-D01`, `VOC-104-D05`
- Task: `VOC-104-T00`
- Tests: `VOC-104-TEST-01`
- Evidence: `VOC-104-EV-01`

The API and web list commands each finish successfully into a distinct secure
runner-local temporary file before the corresponding resolver starts. There is no
direct pipe, process substitution, or concurrent handoff. Cleanup runs on success and
failure without logging or persisting the path or JSON and without masking a primary
failure.

## VOC-104-AC-02 — Complete JSON preserves exact tag and UUID selection

- Requirements: `VOC-104-D02`, `VOC-104-D05`
- Task: `VOC-104-T00`
- Tests: `VOC-104-TEST-02`
- Evidence: `VOC-104-EV-02`

A completed synthetic API or web versions array resolves exactly the sole valid UUID
tagged for the current SHA/run/attempt. Truncated JSON, a failed producer, invalid or
duplicate UUID/tag evidence, a mismatched capture, and any earlier unpromoted version
fail before a step output or promotion input can be accepted.

## VOC-104-AC-03 — Pre-promotion failure and partial state remain safe

- Requirements: `VOC-104-D03`, `VOC-104-D04`
- Task: `VOC-104-T00`
- Tests: `VOC-104-TEST-03`
- Evidence: `VOC-104-EV-03`

Static workflow inspection and focused mutations prove list/capture/parse/resolution
failure stops before promotion and smoke with promotion rollback skipped. The next
run still reads currently serving 100%-traffic rollback targets, applies the same
ordered compatible ledger, uploads fresh run/attempt-tagged versions, and cannot
select the earlier unpromoted versions by inference. No protected version ID appears
in repository content or evidence.

## VOC-104-AC-04 — Adjacent delivery controls remain invariant

- Requirements: `VOC-104-D03`, `VOC-104-D06`, `VOC-104-D07`
- Task: `VOC-104-T00`
- Tests: `VOC-104-TEST-04`
- Evidence: `VOC-104-EV-04`

The implementation diff contains exactly the three approved files. Locked
Wrangler/config selection, approval-first and secret-isolation rules, current
deployment readback, migration/upload/promotion/smoke order, exact output use,
independent dual-Worker rollback after promotion failure, cost/resource checks, and
production holds remain effective. All applicable deterministic checks and exact-SHA
specialist/independent R3 reviews pass with zero unresolved blockers.

## VOC-104-AC-05 — Separately authorized staging outcome is explicit

- Requirements: `VOC-104-D03`, `VOC-104-D04`, `VOC-104-D06`
- Task: `VOC-104-T00`
- Tests: `VOC-104-TEST-05`
- Evidence: `VOC-104-EV-05`

After the reviewed implementation is merged, a later independently reviewed staging
dispatch under the existing delivery authority either records exact API/web promotion
and successful bounded smoke, or, if the repaired list/resolve boundary fails, records
that promotion stayed skipped and traffic remained unchanged. A post-promotion
failure is not accepted as the latter outcome and must instead produce the existing
dual-rollback evidence. This criterion grants no dispatch or Cloudflare authority and
does not block repository implementation merge; it gates operational closure of
issue #186.
