#!/usr/bin/env bash
set -euo pipefail

# VOC-067-T05 — external HTTPS verification for shared-edge cutover.
#
# Confirms staging and production web/API hostnames succeed on ordinary
# Cloudflare :443 (no :8443 in the URL). Intended for use immediately
# before and after Cloudflare origin-port-remap removal.
#
# Usage:
#   verify-voc067-cutover.sh
#   verify-voc067-cutover.sh --include-8443-bridge   # also probe legacy bridge
#
# Requires: curl

include_bridge=false
if [ "${1:-}" = "--include-8443-bridge" ]; then
  include_bridge=true
elif [ -n "${1:-}" ]; then
  echo "usage: $0 [--include-8443-bridge]" >&2
  exit 1
fi

check_url() {
  local label="$1"
  local url="$2"
  local status
  status="$(curl -sS --max-time 20 -o /dev/null -w "%{http_code}" "$url" || echo "000")"
  if [[ "$status" =~ ^2 ]]; then
    echo "PASS: $label ($url) -> HTTP $status"
    return 0
  fi
  echo "FAIL: $label ($url) -> HTTP $status" >&2
  return 1
}

failures=0
run_check() {
  if ! check_url "$@"; then
    failures=$((failures + 1))
  fi
}

echo "VOC-067 cutover verification — external :443 (via Cloudflare)"
run_check "staging web" "https://staging.vocanova.site/"
run_check "staging api healthz" "https://api-staging.vocanova.site/healthz"
run_check "production web" "https://production.vocanova.site/"
run_check "production api healthz" "https://api-production.vocanova.site/healthz"

if [ "$include_bridge" = true ]; then
  echo ""
  echo "Legacy :8443 bridge probes (optional; expected absent after bridge retirement)"
  run_check "production web :8443" "https://production.vocanova.site:8443/" || true
  run_check "production api :8443 healthz" "https://api-production.vocanova.site:8443/healthz" || true
fi

echo ""
if [ "$failures" -eq 0 ]; then
  echo "All required :443 checks passed."
  exit 0
fi
echo "ERROR: $failures required check(s) failed." >&2
exit 1
