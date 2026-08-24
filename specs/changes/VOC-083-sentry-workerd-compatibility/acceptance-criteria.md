# VOC-083 — Acceptance Criteria

## VOC-083-AC-00 — One evidence-backed Workers-safe approach is selected

- Requirements: `VOC-083-R00`
- Tasks: `VOC-083-T00`
- Tests: `VOC-083-TEST-00`
- Evidence: `VOC-083-EV-00`
- Result: complete; T00 selection finally qualified by T02 exact-SHA evidence

T00 compared configuration, package-update, and Workers-native-adapter candidates using
exact versions/current primary evidence and bounded disposable isolated-worktree probes.
It recorded the Workers-native adapter as the provisional candidate, with the required
reporting design and no known incompatibility. T02 finally qualified that selection on
the remediated exact SHA and its fresh bundle, workerd, and reporting evidence. T00
left the canonical task branch unchanged and discarded/reverted every probe.

## VOC-083-AC-01 — Generated Worker forbids unsupported runtime Wasm compilation

- Requirements: `VOC-083-R01`
- Tasks: `VOC-083-T01`, `VOC-083-T02`
- Tests: `VOC-083-TEST-01`
- Evidence: `VOC-083-EV-01`
- Result: complete through T02 exact-SHA and hosted evidence

In the same CI job, a fresh canonical OpenNext build and fresh local Wrangler dry run
produce a deterministic complete manifest: required entry, every non-empty regular
JavaScript module below `.open-next`, all configured-main dry-run modules, executable
references, and classified non-code assets. Missing/zero/unreadable/unclassified/
escaping/broken artifacts fail before a compatibility PASS. Every manifest module is
free of the prohibited Worker Wasm compilation forms. Deliberately injected positive
fixtures for `compile`, `compileStreaming`, `instantiateStreaming`, and buffer-source
`instantiate` fail with a location/rule name; the imported precompiled
`WebAssembly.Module` `instantiate(module, imports)` fixture passes.

## VOC-083-AC-02 — Error reporting survives the compatibility repair

- Requirements: `VOC-083-R02`
- Tasks: `VOC-083-T01`, `VOC-083-T02`
- Tests: `VOC-083-TEST-02`
- Evidence: `VOC-083-EV-02`
- Result: complete through T02 exact-SHA and hosted evidence

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
- Result: complete through T02 exact-SHA and hosted evidence

Both real smoke owners fail nonzero when their bounded Worker output contains an
unexpected unhandled-rejection/error diagnostic, even if all HTTP response assertions
succeed. Clean output passes; expected diagnostics require an explicit narrow,
fixture-tested rationale and cannot include the affected Wasm/rejection forms.

## VOC-083-AC-04 — CI, dependencies, docs, and boundaries remain accurate

- Requirements: `VOC-083-R04`
- Tasks: `VOC-083-T02`, `VOC-083-T03`
- Tests: `VOC-083-TEST-04`, `VOC-083-TEST-05`
- Evidence: `VOC-083-EV-04`, `VOC-083-EV-05`
- Result: complete-through-final-T03-exact-SHA-bd7d98fc9bc2af9683b42d2fb1807794d27cda1a-review-hosted-and-post-merge-evidence

The four-workflow invariant, frozen install, audit, CI aggregate, no-live policy,
documentation, lockfile, and exact affected-file inventory agree. `ci:web` builds
before compatibility/dry-run/smoke and local-stack builds/scans its own fresh output;
no check accepts stale or partial artifacts. T02's exact review and hosted results are
recorded in the package evidence. T03 then reconciled the package documentation,
corrected DOC-11's stale active `@sentry/nextjs` runtime statement, received final
specialist PASS on exact SHA `bd7d98fc9bc2af9683b42d2fb1807794d27cda1a`, and recorded
hosted plus post-merge proof in `t03-evidence.md`; no unperformed Sentry API or
source-map upload, Cloudflare mutation/deploy, secret, or production-data access is
claimed.

## VOC-083-AC-05 — Exact-revision verification and rollback are complete

- Requirements: all
- Tasks: `VOC-083-T03`
- Tests: `VOC-083-TEST-06`
- Evidence: `VOC-083-EV-06`
- Result: complete-through-final-T03-exact-SHA-bd7d98fc9bc2af9683b42d2fb1807794d27cda1a-review-hosted-four-commit-rollback-and-post-merge

Every implementation revision must have the required deterministic evidence and a
different-role Cloudflare/Workers/Sentry specialist verdict bound to its exact final
SHA. T02 satisfied its own review and hosted gates, and T03 preserved the prior FAIL on
exact SHA `987d38caf461eece780ba0421594305d759fa7c4` before the final exact SHA
`bd7d98fc9bc2af9683b42d2fb1807794d27cda1a` received specialist PASS, hosted proof,
ordinary four-commit repository rollback, and post-merge CI/Governance/Security PASS.
No live Cloudflare/Sentry state was touched.
