# VOC-072 — Impact Analysis

## Security and privacy

Intent: supply least-privilege Cloudflare credentials for an already-authorized
production cutover path without widening unrelated API access.

- **Dedicated secret (recommended):** limits Origin Rules mutation to the
  cutover workflow; Workers AI token stays narrow. Adds one more secret to
  rotate and audit.
- **Reuse `PRODUCTION_CLOUDFLARE_API_TOKEN`:** single secret simplifies wiring
  but any leak grants both Workers AI and zone Origin Rules access — higher blast
  radius; requires explicit adoption acceptance.
- **Evidence discipline:** token values must never appear in git, PR comments, or
  CI logs pasted verbatim into evidence (redact `Authorization` headers).
- No application personal data, session, or authz logic changes.

## Data and migrations

None. No schema, seed, or production database change.

## Analytics and accessibility

None. No analytics events and no user-facing UI/accessibility surface.

## Risks, dependencies, and evidence

- **`VOC-072-R00`:** Broadening the existing token breaks Workers AI sync if new
  scopes are incompatible with how Cloudflare issues Workers AI keys. Mitigated
  by recommending dedicated secret (DEP-00) and requiring post-change AI sync
  smoke on reuse path.
- **`VOC-072-R01`:** Over-scoped token (all zones) violates least privilege.
  Mitigated by AC-00 requiring `vocanova.site`-specific zone resource in evidence.
- **`VOC-072-R02`:** T02 `--verify-only` success with remap still FOUND does not
  mean cutover complete — premature `--apply` or bridge retirement could cause
  outage. Mitigated by VOC-067 cutover order, bridge gate test, and open question 3
  keeping `--apply` out of default T02 scope.
- **`VOC-072-R03`:** Workflow wiring mistake could leave cutover job still bound
  to Workers-AI token while docs claim fix. Mitigated by TEST-01/03 and independent
  verification of exact workflow env blocks.
- **`VOC-072-DEP-00`–`DEP-01`:** see `change.yaml` and `specification.md`.
- **`VOC-067` dependency:** T05 tooling exists; AC-06 remap clause blocked until
  this package (or equivalent ops action) completes.
- **`VOC-072-EV-00`–`EV-02`:** produced by T00–T02; none exist yet.
