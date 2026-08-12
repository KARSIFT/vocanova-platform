# VOC-072 — Release Plan

## Release and deployment authorization

Not authorized by this package. A merged package does not itself authorize
production deployment or Cloudflare remap mutation. Under this repository's
2026-08-08 auto-release / auto-deploy posture (AGENTS.md), promotion and
production deploy may follow automatically once the package's task roster closes
through the normal pipeline — that is a repository-level delegation, not extra
authority to run `--apply` or retire the `:8443` bridge. T02's `--verify-only`
dispatch is an explicit operator action on the production environment, not an
automatic consequence of merging to `develop`.

## Preconditions, monitoring, and outcome

Preconditions:

- `VOC-072-T00` secret provisioned in GitHub production environment.
- `VOC-072-T01` merged and independently verified.
- VOC-067 shared-edge and origin `:443` preconditions already satisfied (T00–T03
  evidence — not re-validated by this package unless T02 dispatch fails for
  non-credential reasons).

Monitoring after T02 `--verify-only`:

- Job conclusion and redacted log (zone ID resolved, verify message).
- External `:443` checks via `infra/scripts/verify-voc067-cutover.sh` unchanged
  unless a separate `--apply` is authorized later.
- `:8443` bridge container still present while VOC-067-EV-05 reports
  `cloudflare_remap_api_status: unconfirmed` or equivalent.

Outcome owner: founder/ops for T00/T02 dispatch; implementer named in T01 PR for
workflow wiring.

## Rollback

Trigger: new token mis-scoped (verify-only still fails); workflow env typo;
accidental `--apply` causes edge regression (out of default T02 scope but covered
for completeness).

Mechanism:

- Revoke/delete Cloudflare token; remove GitHub secret; revert T01 workflow commit.
- If remap was removed and edge fails: `cloudflare-remove-production-origin-port-remap.sh --restore`
  or `deploy-production.yml` with `voc067_cloudflare_origin_cutover=restore` using
  the zone-capable token (once fixed).

Accountable owner: founder (`m-e-h-r-d-a-a-d`, VOC-067-DEP-03).

Validation after rollback: `--verify-only` returns to fail-closed or prior error;
external `:443` and `:8443` bridge paths documented in VOC-067-EV-05 still work.

Last-known-good reference: workflow + secret state immediately before T01 merge;
record exact SHA in `VOC-072-EV-01` at implementation time.

## Independent verification, human approvals, and closure

Independent verifier result: not yet produced — pending implementation.

R3 approvals: under active A-003, routine R3 does not require standing
technical-steward or founder approval solely because it is R3; strengthened
applicable controls and independent verification remain required (CLAUDE.md).
This draft sets `automatic_merge_allowed: false` for founder eyes on develop
merge given production-secrets and Cloudflare zone wiring. R4 founder authority
is not implicated for the package as drafted; verifier must escalate if
implemented diff touches protected paths beyond scope.

Closure evidence: not yet produced. Repository merge, secret provisioning, T02
workflow dispatch, VOC-067 remap removal, and bridge retirement are distinct.
Closure requires `VOC-072-AC-02` with production `--verify-only` success.
Do not treat "merged to develop" as "VOC-067 cutover complete."

Cross-package note: when T02 shows remap absent, VOC-067-T05 may update
`cloudflare_remap_api_status: absent` and unblock T04 in a separate governed
revision — outside default VOC-072 closure unless adoption expands scope.
