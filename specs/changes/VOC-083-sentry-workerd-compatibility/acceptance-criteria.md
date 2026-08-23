# VOC-083 — Acceptance Criteria

## VOC-083-AC-00 — One evidence-backed Workers-safe approach is selected

- Requirements: `VOC-083-R00`
- Tasks: `VOC-083-T00`
- Tests: `VOC-083-TEST-00`
- Evidence: `VOC-083-EV-00`
- Result: pending

The final decision compares configuration, package-update, and Workers-native-adapter
candidates using exact versions and current primary evidence. It selects one only when
it preserves required reporting and passes generated-bundle/workerd proof; otherwise
it stops for a new decision. It does not claim that any candidate is preselected here.

## VOC-083-AC-01 — Generated Worker forbids unsupported runtime Wasm compilation

- Requirements: `VOC-083-R01`
- Tasks: `VOC-083-T01`
- Tests: `VOC-083-TEST-01`
- Evidence: `VOC-083-EV-01`
- Result: pending

The canonical OpenNext artifact scan passes only when every scanned generated runtime
chunk is free of the prohibited Worker Wasm compilation forms. Deliberately injected
positive fixtures for each form fail with a location and rule name.

## VOC-083-AC-02 — Error reporting survives the compatibility repair

- Requirements: `VOC-083-R02`
- Tasks: `VOC-083-T01`
- Tests: `VOC-083-TEST-02`
- Evidence: `VOC-083-EV-02`
- Result: pending

With a synthetic non-secret DSN/test transport, a controlled Worker/server request
error and global error reach the selected reporting boundary; the browser capture path
remains covered. With no DSN, local loops perform no external call. Tests prove redaction
and retain disabled source-map upload, telemetry, debug, spotlight, credential-free
builds, and local service binding.

## VOC-083-AC-03 — Successful HTTP cannot hide a workerd runtime rejection

- Requirements: `VOC-083-R03`
- Tasks: `VOC-083-T02`
- Tests: `VOC-083-TEST-03`
- Evidence: `VOC-083-EV-03`
- Result: pending

Both real smoke owners fail nonzero when their bounded Worker output contains an
unexpected unhandled-rejection/error diagnostic, even if all HTTP response assertions
succeed. Clean output passes; expected diagnostics require an explicit narrow,
fixture-tested rationale and cannot include the affected Wasm/rejection forms.

## VOC-083-AC-04 — CI, dependencies, docs, and boundaries remain accurate

- Requirements: `VOC-083-R04`
- Tasks: `VOC-083-T02`, `VOC-083-T03`
- Tests: `VOC-083-TEST-04`, `VOC-083-TEST-05`
- Evidence: `VOC-083-EV-04`, `VOC-083-EV-05`
- Result: pending

The four-workflow invariant, frozen install, audit, CI aggregate, no-live policy,
documentation, lockfile, and exact affected-file inventory agree. No Sentry API or
source-map upload, Cloudflare mutation/deploy, secret, production-data access, or
hosted/independent PASS claim is introduced.

## VOC-083-AC-05 — Exact-revision verification and rollback are complete

- Requirements: all
- Tasks: `VOC-083-T03`
- Tests: `VOC-083-TEST-06`
- Evidence: `VOC-083-EV-06`
- Result: pending

Every implementation revision has the required deterministic evidence and a different-
role Cloudflare/Workers/Sentry specialist verdict bound to its exact final SHA. A
revert restores the predecessor instrumentation and checks without touching live
Cloudflare/Sentry state; any blocked reporting-equivalence finding is resolved first.
