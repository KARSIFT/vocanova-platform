# VOC-033 — Mock Disposition Inventory

## Scope and authority

This document is drafted before adoption/implementation, per this repository's
own package template convention (mirroring `VOC-030`/`VOC-031`/`VOC-032`, which
each carry this file even though it is not part of the base template in
`specs/templates/change-package/`).

## Draft-time confirmation (2026-07-30, by direct repository inspection)

This package introduces no mock, fake, or stub of any kind, and decommissions
none. Its entire scope is: two mechanical edits to existing SQL comment/index
statements in `apps/api/migrations/*.sql`, a regenerated integrity hash file,
and two new Go test files that validate real migration-file content and
(`VOC-033-T02`) apply real SQL against a real, disposable PostgreSQL 16
instance via the real, pinned Atlas v1.2.0 binary — not a mocked database or a
faked Atlas invocation.

`grep -rni "mock\|fake\|stub" apps/api/migrations/` against the pre-existing
directory returns exactly one pre-existing match, unrelated to this package:
`atlas_tooling_test.go:145`'s comment "Provide a stub atlas binary so the
wrapper reaches..." — it points `ATLAS_BIN` at `/bin/true` purely to reach a
pre-flight-validation code path in `VOC-032-T06`'s own wrapper test, not to
avoid a real database or a real Atlas apply. This package does not touch that
file and adds no further match.
