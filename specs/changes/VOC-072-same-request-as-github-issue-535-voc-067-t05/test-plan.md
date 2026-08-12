# VOC-072 — Test Plan

## VOC-072-TEST-00 — Production environment holds zone-scoped secret (redacted audit)

- Covers: `VOC-072-AC-00`
- Preconditions: `VOC-072-T00` executed; adoption recorded DEP-00/DEP-01.
- Procedure:
  1. Confirm GitHub production environment lists the adoption-chosen secret
     name (screenshot or `gh secret list` redacted output — no values).
  2. Confirm evidence file documents Cloudflare token permissions and zone
     resource restriction to `vocanova.site`.
  3. If reuse path: confirm evidence notes Workers AI sync re-check plan/result.
- Expected result: secret exists; scopes documented; no values in git.
- Evidence: `VOC-072-EV-00`

## VOC-072-TEST-01 — Workflow binds cutover steps to adoption-chosen secret

- Covers: `VOC-072-AC-01`
- Preconditions: `VOC-072-T01` applied.
- Procedure:
  1. Read `deploy-production.yml` job `voc067-cloudflare-cutover` and the
     `VOC-067-T05 Cloudflare origin-port remap (apply after healthy deploy)` step.
  2. Confirm env references match DEP-00/DEP-01 (dedicated vs reuse).
  3. Confirm Workers AI block still references `PRODUCTION_CLOUDFLARE_API_TOKEN`
     when dedicated path chosen.
- Expected result: cutover modes use zone-capable binding; AI sync unchanged on
  dedicated path.
- Evidence: `VOC-072-EV-01`

## VOC-072-TEST-02 — Operator docs and script header describe credential precedence

- Covers: `VOC-072-AC-01`
- Preconditions: `VOC-072-T01` applied.
- Procedure:
  1. Read `infra/README.md` cutover section and
     `cloudflare-remove-production-origin-port-remap.sh` header comments.
  2. Confirm documented env var names match workflow wiring.
  3. Confirm no example lines contain real token placeholders beyond `…`.
- Expected result: operator can configure credentials without reading workflow YAML.
- Evidence: `VOC-072-EV-01`

## VOC-072-TEST-03 — Production CI `--verify-only` succeeds (zone resolution)

- Covers: `VOC-072-AC-02`; VOC-067-TEST-06 credential clause
- Preconditions: `VOC-072-T01` merged; T00 secret live; shared-edge preconditions
  from VOC-067 already met.
- Procedure:
  1. `workflow_dispatch` `deploy-production.yml` with
     `voc067_cloudflare_origin_cutover=verify-only`.
  2. Capture job conclusion success and redacted log lines for zone fetch + verify
     output.
  3. Confirm absence of `ERROR: zone not found` from empty `GET /zones` result.
- Expected result: exit 0; remap status reported (FOUND or OK absent).
- Evidence: `VOC-072-EV-02`

## VOC-072-TEST-04 — Offline selftests still pass (no regression)

- Covers: `VOC-072-AC-01` (non-live safety net)
- Preconditions: `VOC-072-T01` applied.
- Procedure:

```bash
bash infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh
node --test scripts/foundation/voc067-cutover-bridge-gate.test.mjs
```

- Expected result: selftests pass; bridge gate still enforces unconfirmed status.
- Evidence: `VOC-072-EV-01`

Include positive, negative, authorization, failure, migration, accessibility, and
rollback coverage as applicable. Tests must not use secrets or production data in
git-tracked fixtures beyond redacted log excerpts in evidence files.
