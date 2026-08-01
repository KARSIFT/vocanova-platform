# VOC-037-EV-06 — Production provisioning evidence (T06)

## Scope

This evidence file records the repository-side deliverables implemented for
`VOC-037-T06` and the host/runtime checks required to complete `VOC-037-AC-06`.

## Repository deliverables (implemented)

- `.github/workflows/deploy-production.yml`
  - deploys through `environment: production`
  - uses production-only secret names (`PRODUCTION_*`)
  - writes deployment artifacts only under `/opt/vocanova/production/`
  - deploys with compose project `vocanova-production`
- `infra/docker-compose.production.yml`
  - separate production compose file
  - explicit per-service resource limits (`mem_limit`, `cpus`)
  - production-only network and volume names
  - no staging directory references
- `infra/nginx-production/` config tree
  - production-specific host placeholders for founder-confirmed hostnames
- `infra/scripts/rehearse-production-secrets-boundary.sh`
  - host-side negative-access rehearsal for `INS-9` through `INS-11`
- `infra/README.md`
  - production path layout and isolation conventions

## Host/runtime checks (pending founder-run execution)

These checks require real host and GitHub environment access and cannot be
executed from this local implementation environment.

- [ ] `production` GitHub Actions environment exists with founder-controlled
      required reviewers.
- [ ] `deploy-production` workflow run succeeds against the production host.
- [ ] `/opt/vocanova/production/` exists and is separate from `/opt/vocanova/infra/`.
- [ ] `rehearse-production-secrets-boundary.sh` passes all checks on host
      (`INS-9` through `INS-11`).

## Notes

- This task provisions the production deployment shape and isolation controls.
  It does not close R2 or authorize launch; founder go/no-go remains `VOC-037-T05`.
