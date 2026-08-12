#!/usr/bin/env bash
set -euo pipefail

# VOC-067-T05 — repository-driven Cloudflare API cutover (VOC-067-DEP-03).
#
# Removes Origin Rules that remap production hostnames to destination port
# 8443, restoring ordinary edge :443 → origin :443. Supports verify-only
# and rollback (restore port 8443) per T00.
#
# Environment (accepts production-prefixed names from deploy-production.yml):
#   CLOUDFLARE_API_TOKEN or PRODUCTION_CLOUDFLARE_API_TOKEN (required for --apply/--restore)
#   CLOUDFLARE_ZONE_NAME (default: vocanova.site)
#   VOC067_PRODUCTION_WEB_HOST (default: production.vocanova.site)
#   VOC067_PRODUCTION_API_HOST (default: api-production.vocanova.site)
#   VOC067_ORIGIN_PORT (default: 8443 — the cutover bridge port to remove)
#
# Usage:
#   cloudflare-remove-production-origin-port-remap.sh --verify-only
#   cloudflare-remove-production-origin-port-remap.sh --apply
#   cloudflare-remove-production-origin-port-remap.sh --restore
#
# After --apply or when --verify-only reports no remap, run:
#   infra/scripts/verify-voc067-cutover.sh

API_BASE="https://api.cloudflare.com/client/v4"
ZONE_NAME="${CLOUDFLARE_ZONE_NAME:-vocanova.site}"
WEB_HOST="${VOC067_PRODUCTION_WEB_HOST:-production.vocanova.site}"
API_HOST="${VOC067_PRODUCTION_API_HOST:-api-production.vocanova.site}"
ORIGIN_PORT="${VOC067_ORIGIN_PORT:-8443}"

TOKEN="${CLOUDFLARE_API_TOKEN:-${PRODUCTION_CLOUDFLARE_API_TOKEN:-}}"

mode=""
case "${1:-}" in
  --verify-only) mode=verify ;;
  --apply) mode=apply ;;
  --restore) mode=restore ;;
  *)
    echo "usage: $0 --verify-only | --apply | --restore" >&2
    exit 1
    ;;
esac

if [ "$mode" != verify ] && [ -z "$TOKEN" ]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN (or PRODUCTION_CLOUDFLARE_API_TOKEN) is required for --apply/--restore" >&2
  exit 1
fi

cf_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local tmp http_code
  tmp="$(mktemp)"
  if [ -n "$data" ]; then
    http_code="$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      --data "$data" \
      "${API_BASE}${path}")"
  else
    http_code="$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer ${TOKEN}" \
      "${API_BASE}${path}")"
  fi
  if [[ ! "$http_code" =~ ^2 ]]; then
    echo "ERROR: Cloudflare API ${method} ${path} returned HTTP ${http_code}:" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    exit 1
  fi
  cat "$tmp"
  rm -f "$tmp"
}

resolve_zone_id() {
  python3 -c '
import json, sys
payload = json.load(sys.stdin)
zones = payload.get("result", [])
if not zones:
    raise SystemExit("ERROR: zone not found")
print(zones[0]["id"])
' <<< "$(cf_api GET "/zones?name=${ZONE_NAME}")"
}

mutate_ruleset_json() {
  local action="$1"
  python3 - "$action" "$WEB_HOST" "$API_HOST" "$ORIGIN_PORT" <<'PY'
import json
import sys

action, web_host, api_host, origin_port = sys.argv[1:5]
origin_port = int(origin_port)
ruleset = json.load(sys.stdin)
rules = ruleset.get("result", {}).get("rules") or []

def host_in_expression(expr: str, host: str) -> bool:
    if not expr:
        return False
    return host in expr

def rule_targets_production(rule) -> bool:
    expr = rule.get("expression", "")
    return host_in_expression(expr, web_host) or host_in_expression(expr, api_host)

def rule_has_port(rule, port: int) -> bool:
    origin = (rule.get("action_parameters") or {}).get("origin") or {}
    return origin.get("port") == port

if action == "verify":
    port_rules = [r for r in rules if rule_targets_production(r) and rule_has_port(r, origin_port)]
    if not port_rules:
        print(f"OK: no origin rules remap production hosts to port {origin_port}")
        sys.exit(0)
    print(f"FOUND: {len(port_rules)} origin rule(s) still remap to port {origin_port}:", file=sys.stderr)
    for r in port_rules:
        print(
            f"  - id={r.get('id')} ref={r.get('ref')} expr={r.get('expression')!r}",
            file=sys.stderr,
        )
    sys.exit(2)

updated = []
changed = False
for rule in rules:
    if not rule_targets_production(rule):
        updated.append(rule)
        continue
    params = dict(rule.get("action_parameters") or {})
    origin = dict(params.get("origin") or {})
    if action == "remove":
        if origin.get("port") == origin_port:
            origin.pop("port", None)
            changed = True
    elif action == "restore":
        if origin.get("port") != origin_port:
            origin["port"] = origin_port
            changed = True
    if origin:
        params["origin"] = origin
    else:
        params.pop("origin", None)
    new_rule = dict(rule)
    if params:
        new_rule["action_parameters"] = params
    elif "action_parameters" in new_rule:
        new_rule.pop("action_parameters")
    updated.append(new_rule)

if not changed:
    print("NOOP")
    sys.exit(0)

print(json.dumps({"rules": updated}))
PY
}

ZONE_ID="$(resolve_zone_id)"
ruleset_json="$(cf_api GET "/zones/${ZONE_ID}/rulesets/phases/http_request_origin/entrypoint")"
RULESET_ID="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["id"])' <<<"$ruleset_json")"

case "$mode" in
  verify)
    printf '%s' "$ruleset_json" | mutate_ruleset_json verify
    ;;
  apply)
    update_payload="$(printf '%s' "$ruleset_json" | mutate_ruleset_json remove || true)"
    if [ -z "${update_payload:-}" ] || [ "$update_payload" = "NOOP" ]; then
      echo "Remap already absent; nothing to apply."
    else
      echo "Applying origin-port remap removal to ruleset ${RULESET_ID}..."
      cf_api PUT "/zones/${ZONE_ID}/rulesets/${RULESET_ID}" "$update_payload" >/dev/null
      echo "Cloudflare API update succeeded."
    fi
    printf '%s' "$(cf_api GET "/zones/${ZONE_ID}/rulesets/phases/http_request_origin/entrypoint")" | mutate_ruleset_json verify
    ;;
  restore)
    update_payload="$(printf '%s' "$ruleset_json" | mutate_ruleset_json restore || true)"
    if [ -z "${update_payload:-}" ] || [ "$update_payload" = "NOOP" ]; then
      echo "Remap already present; nothing to restore."
    else
      echo "Restoring origin-port remap to ${ORIGIN_PORT} on ruleset ${RULESET_ID}..."
      cf_api PUT "/zones/${ZONE_ID}/rulesets/${RULESET_ID}" "$update_payload" >/dev/null
      echo "Rollback API update succeeded. Re-verify :8443 path before closing incident."
    fi
    ;;
esac
