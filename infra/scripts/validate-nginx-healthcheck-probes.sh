#!/usr/bin/env bash
set -euo pipefail

# VOC-066-T01 — deterministic regression check for nginx Docker HEALTHCHECK
# probes on the default-server catch-all (port 80). Fails if an edge nginx
# compose service regresses to a bare `http://127.0.0.1/` probe that cannot
# succeed while VOC-032-D03 / VOC-066 still return 444 for unrecognized Host.
#
# Implementation: scripts/foundation/nginx-healthcheck-probe.test.mjs (also
# runs via `pnpm test` in normal CI).
#
# Usage: infra/scripts/validate-nginx-healthcheck-probes.sh

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
exec node --test "$repo_root/scripts/foundation/nginx-healthcheck-probe.test.mjs"
