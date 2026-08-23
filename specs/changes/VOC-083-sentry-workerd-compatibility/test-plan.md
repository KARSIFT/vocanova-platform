# VOC-083 — Test Plan

## VOC-083-TEST-00 — Candidate matrix and controlled reproduction

- Covers: `VOC-083-AC-00`
- Preconditions: adopted package and frozen locked base/selected revision.
- Procedure: reproduce the generated-bundle/workerd failure; inspect dependency/export
  paths; retrieve current primary Cloudflare and Sentry evidence; compare all three
  candidates for Worker safety, reporting features, package graph, maintenance,
  privacy, rollback, and no-live feasibility.
- Expected result: one qualified candidate with exact evidence, or an explicit blocked
  result; no candidate is assumed valid because it merely suppresses the log.
- Evidence: `VOC-083-EV-00`.

## VOC-083-TEST-01 — Generated OpenNext bundle invariant

- Covers: `VOC-083-AC-01`
- Preconditions: canonical OpenNext build output exists.
- Procedure: inspect all relevant generated runtime chunks for the prohibited Workers
  Wasm compilation forms; run positive/minified fixture cases for each form and a clean
  fixture; keep source scan only as diagnostic context.
- Expected result: selected generated bundle passes; every unsafe fixture fails with
  path/rule output before workerd can be claimed compatible.
- Evidence: `VOC-083-EV-01`.

## VOC-083-TEST-02 — Reporting-equivalence and privacy contract

- Covers: `VOC-083-AC-02`
- Preconditions: selected SDK/config exposes a test-only transport or equivalent
  injected boundary that cannot enable normal outbound use.
- Procedure: exercise enabled synthetic configuration for request/global/browser error
  capture, disabled local DSN behavior, event redaction, source-map/upload options,
  telemetry/debug/spotlight settings, and local supervisor DSN/token stripping.
- Expected result: required captures reach a non-network test boundary; local runs send
  nothing; forbidden data/configuration is absent.
- Evidence: `VOC-083-EV-02`.

## VOC-083-TEST-03 — Workerd HTTP-success/log-failure regression

- Covers: `VOC-083-AC-03`
- Preconditions: real OpenNext/mock-service-binding workerd smoke and two-Worker local
  stack can be started locally with bounded timeouts.
- Procedure: prove clean output passes all existing HTTP/service-binding assertions;
  feed/emit fixture diagnostics that include unhandled rejection, compile error, generic
  runtime error, allowed known startup text, and HTTP success plus error output.
- Expected result: unexpected diagnostics fail nonzero and print bounded redacted
  context; only documented narrow allowed diagnostics pass.
- Evidence: `VOC-083-EV-03`.

## VOC-083-TEST-04 — Existing CI and no-live boundary

- Covers: `VOC-083-AC-04`
- Preconditions: frozen install.
- Procedure: run web/local-stack commands and inspect `ci.yml` aggregate/workflow count,
  credentials, Sentry API/source-map/upload references, remote Wrangler flags, service
  binding, and dependency audit when changed.
- Expected result: required aggregates include the new evidence; exactly four workflows
  remain and no credential, query, upload, deploy, or remote operation exists.
- Evidence: `VOC-083-EV-04`.

## VOC-083-TEST-05 — Documentation and affected-file inventory

- Covers: `VOC-083-AC-04`
- Preconditions: implementation diff.
- Procedure: compare docs and package claims to executable scripts/configuration;
  inventory every planned affected area and explicitly classify untouched candidates.
- Expected result: docs describe local workerd evidence accurately and make no hosted,
  live Sentry, source-map, deployment, or unperformed review claim.
- Evidence: `VOC-083-EV-05`.

## VOC-083-TEST-06 — Final exact-SHA verification and rollback

- Covers: `VOC-083-AC-05`
- Preconditions: completed deterministic evidence.
- Procedure: run the available commands in the implementation plan, `git diff --check`,
  and a reverse-order repository rollback rehearsal in a disposable worktree; obtain a
  different-role exact-final-SHA Cloudflare/Workers/Sentry review.
- Expected result: final evidence is bound to the reviewed revision, blockers are
  resolved, rollback restores predecessor behavior, and no live system is contacted.
- Evidence: `VOC-083-EV-06`.
