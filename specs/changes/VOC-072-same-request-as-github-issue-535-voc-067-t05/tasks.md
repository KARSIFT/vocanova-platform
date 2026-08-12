# VOC-072 — Tasks

None of the tasks below is implementation-authorized by this package. Adoption and
each task's own implementation authorization are separate. `VOC-072-T01` depends on
`VOC-072-DEP-00`/`DEP-01` being recorded at adoption and on `VOC-072-T00`
completing (secret must exist before workflow wiring is meaningful). `VOC-072-T02`
depends on `T01` merge and the secret being present in the production environment.

## VOC-072-T00 — Provision Cloudflare zone/Origin-Rules token and GitHub secret

- Requirement source: issue #535; `VOC-072-D00`; `VOC-072-DEP-00`, `VOC-072-DEP-01`
- Acceptance criteria: `VOC-072-AC-00`
- Tests: `VOC-072-TEST-00`
- Evidence: `VOC-072-EV-00` —
  [`t00-token-provisioning-evidence.md`](t00-token-provisioning-evidence.md)
- Status: pending — blocked on package adoption and DEP-00/DEP-01

Founder/ops task (human authority for Cloudflare dashboard and GitHub
production-environment secrets). No secret values in git.

1. In Cloudflare dashboard, create an API token with:
   - **Permissions:** Zone → Read; Account (or Zone) → Origin Rules → Edit
     (minimum needed for `GET /zones/{id}/rulesets/phases/http_request_origin/entrypoint`
     and `PUT` updates).
   - **Zone resources:** Include → Specific zone → `vocanova.site` only.
2. Add the token to GitHub → Settings → Environments → **production**:
   - **Recommended:** new secret per `VOC-072-DEP-01` (draft default
     `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN`).
   - **Alternative:** update `PRODUCTION_CLOUDFLARE_API_TOKEN` only if DEP-00
     chooses reuse; re-verify Workers AI sync still succeeds after broadening.
3. Record redacted evidence in `t00-token-provisioning-evidence.md` (token
   display name, scopes, secret name, date, operator GitHub handle — not the
   token string).

This task may land as evidence-only PR content under this package directory, or
as operator-recorded evidence linked from the T01 PR — but the secret must exist
before T02 runs.

## VOC-072-T01 — Wire deploy cutover job to zone-capable credential

- Requirement source: issue #535; `VOC-072-AC-01`
- Acceptance criteria: `VOC-072-AC-01`
- Tests: `VOC-072-TEST-01`, `VOC-072-TEST-02`
- Evidence: `VOC-072-EV-01`
- Status: pending — depends on adoption resolving DEP-00/DEP-01; T00 secret
  provisioned (or explicitly scheduled in parallel with founder confirmation)

Repository PR expected to touch:

| Target | Change |
| --- | --- |
| `.github/workflows/deploy-production.yml` | `voc067-cloudflare-cutover` job env; post-smoke `--apply` step env — bind adoption-chosen secret |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` | Document new env var in header; optional: accept `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` with fallback to existing names; clearer empty-zone error |
| `infra/README.md` | Operator sequence: which secret to set; do not paste values |

If DEP-00 chooses **dedicated secret**, do **not** change Workers AI sync env
(`PRODUCTION_CLOUDFLARE_API_TOKEN` / `PRODUCTION_CLOUDFLARE_ACCOUNT_ID` block).

Run deterministic checks listed in `implementation-plan.md`. No functional
change to cutover mutation logic beyond credential source and error clarity.

## VOC-072-T02 — Production workflow `--verify-only` evidence

- Requirement source: issue #535; VOC-067-TEST-06; `VOC-072-AC-02`
- Acceptance criteria: `VOC-072-AC-02`
- Tests: `VOC-072-TEST-03`
- Evidence: `VOC-072-EV-02` —
  [`t02-verify-only-evidence.md`](t02-verify-only-evidence.md)
- Status: pending — depends on `VOC-072-T01` merged and production secret live

No large new feature code expected.

1. Dispatch `deploy-production.yml` on the merged revision with
   `voc067_cloudflare_origin_cutover=verify-only` (founder/ops or authorized
   operator — production environment).
2. Confirm job `VOC-067-T05 Cloudflare origin-port remap` succeeds.
3. Paste redacted log excerpt into `t02-verify-only-evidence.md` showing zone
   lookup succeeded and verify output (FOUND vs OK absent).
4. Cross-reference `VOC-067-EV-05` §3: note that credential unblock is satisfied;
   if output is OK absent, record that VOC-067-T05 may update
   `cloudflare_remap_api_status` in a follow-up VOC-067 revision — do not edit
   VOC-067 package files from this task unless explicitly scoped at adoption.

Do **not** dispatch `--apply` unless adoption resolves open question 3 to allow
it. Do not retire the `:8443` bridge in this task.

Tasks preserve scope, separation of duties, and rollback safety. No task may be
dispatched before this package is adopted.
