# VOC-025 — Impact Analysis

## Security and privacy

`VOC-025-R00`: bearer theft/replay or unsafe cookie configuration. Mitigate with opaque high-entropy tokens, hashed server records, Secure/HttpOnly cookie, expiry/revocation/logout, CSRF, HTTPS/CORS/security-header integration, and negative tests.

`VOC-025-R01`: account enumeration, magic-link/OAuth replay, provider-link takeover, or abuse. Mitigate with single-use 15-minute hashed links, OAuth state validation, verified identity rules, generic responses, provider isolation, rate limits, fake-provider CI, and staging tests.

`VOC-025-R02`: cross-user exposure. Mitigate with authenticated requester context, service-level query scoping, 404 private-resource behavior, two-user tests, and exact-SHA security review. Do not log tokens, secrets, link values, OAuth codes, or personal content.

## Data and migrations

`VOC-025-R03`: identity migration integrity/rollback failure. Use Ent schemas plus reviewed versioned Atlas SQL, constraints/indexes, disposable PostgreSQL rehearsal, explicit migration execution outside startup, backup/recovery evidence where F3 provides it, and compatibility review. Reverting code must not make issued/revoked session state unsafe; data repair/recovery ownership is assigned at release approval.

## Analytics and accessibility

Analytics is excluded; only non-identifying operational metrics may be proposed later with privacy review. Accessibility is material: labelled keyboard controls, focus/error/redirect behavior, semantic status/errors, non-color-only state, and mobile layout. `VOC-025-R04` is inaccessible or misleading auth UI; test automation availability must be reported honestly.

## Risks, dependencies, and evidence

- `VOC-025-R05`: current API scaffold lacks implemented Ent/Atlas/Huma/provider infrastructure; reconcile baseline before T00 and do not report absent tooling as passing.
- `VOC-025-R06`: D05 could expand A1 into P1–P4; founder adoption must bound it.
- `VOC-025-R07`: request wording “refresh” conflicts with no sliding renewal; D07 retains DOC-06 pending a future approved change.
- `VOC-025-DEP-01`..`DEP-04`: dependencies recorded in `change.yaml`.
- `VOC-025-EV-00`..`EV-23`: migration, test, contract, staging, rollback, and exact-SHA review evidence referenced by acceptance criteria.
