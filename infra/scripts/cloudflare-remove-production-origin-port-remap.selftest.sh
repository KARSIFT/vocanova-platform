#!/usr/bin/env bash
set -euo pipefail

# VOC-067-T05 — offline harness for cloudflare-remove-production-origin-port-remap.sh
# rule-mutation logic (no live Cloudflare calls).
#
# Usage: infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
verify_script="$repo_root/infra/scripts/verify-voc067-cutover.sh"

sample_ruleset="$(mktemp)"
removed_ruleset="$(mktemp)"
trap 'rm -f "$sample_ruleset" "$removed_ruleset"' EXIT
cat >"$sample_ruleset" <<'JSON'
{
  "result": {
    "id": "ruleset-test",
    "rules": [
      {
        "id": "rule-prod-web",
        "expression": "(http.host eq \"production.vocanova.site\")",
        "action": "route",
        "action_parameters": {
          "origin": { "port": 8443 }
        }
      },
      {
        "id": "rule-staging",
        "expression": "(http.host eq \"staging.vocanova.site\")",
        "action": "route",
        "action_parameters": {}
      }
    ]
  }
}
JSON

run_python_mutate() {
  local action="$1"
  python3 - "$action" "$sample_ruleset" "production.vocanova.site" "api-production.vocanova.site" "8443" <<'PY'
import json
import sys

action, path, web_host, api_host, origin_port = sys.argv[1:6]
origin_port = int(origin_port)
with open(path, encoding="utf-8") as fh:
    ruleset = json.load(fh)
rules = ruleset.get("result", {}).get("rules") or []

def host_in_expression(expr: str, host: str) -> bool:
    return bool(expr) and host in expr

def rule_targets_production(rule) -> bool:
    expr = rule.get("expression", "")
    return host_in_expression(expr, web_host) or host_in_expression(expr, api_host)

def rule_has_port(rule, port: int) -> bool:
    origin = (rule.get("action_parameters") or {}).get("origin") or {}
    return origin.get("port") == port

if action == "verify":
    port_rules = [r for r in rules if rule_targets_production(r) and rule_has_port(r, origin_port)]
    if not port_rules:
        print("OK")
        sys.exit(0)
    print("FOUND")
    sys.exit(2)

updated = []
changed = False
for rule in rules:
    if not rule_targets_production(rule):
        updated.append(rule)
        continue
    params = dict(rule.get("action_parameters") or {})
    origin = dict(params.get("origin") or {})
    if action == "remove" and origin.get("port") == origin_port:
        origin.pop("port", None)
        changed = True
    if action == "restore" and origin.get("port") != origin_port:
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

echo "selftest: verify detects port 8443 remap"
if [ "$(run_python_mutate verify)" = "FOUND" ]; then
  echo "PASS"
else
  echo "FAIL: expected FOUND" >&2
  exit 1
fi

echo "selftest: remove strips port from production rule only"
removed="$(run_python_mutate remove)"
if echo "$removed" | python3 -c '
import json, sys
rules = json.load(sys.stdin)["rules"]
prod = [r for r in rules if "production.vocanova.site" in r.get("expression", "")]
assert prod and "port" not in (prod[0].get("action_parameters") or {}).get("origin", {})
print("ok")
'; then
  echo "PASS"
else
  echo "FAIL: remove mutation" >&2
  exit 1
fi

echo "selftest: restore re-adds port 8443"
run_python_mutate remove >"$removed_ruleset"
restored="$(python3 - restore "$removed_ruleset" "production.vocanova.site" "api-production.vocanova.site" "8443" <<'PY'
import json
import sys

action, path, web_host, api_host, origin_port = sys.argv[1:6]
origin_port = int(origin_port)
with open(path, encoding="utf-8") as fh:
    payload = json.load(fh)
rules = payload["rules"]

def host_in_expression(expr: str, host: str) -> bool:
    return bool(expr) and host in expr

def rule_targets_production(rule) -> bool:
    expr = rule.get("expression", "")
    return host_in_expression(expr, web_host) or host_in_expression(expr, api_host)

updated = []
for rule in rules:
    if not rule_targets_production(rule):
        updated.append(rule)
        continue
    params = dict(rule.get("action_parameters") or {})
    origin = dict(params.get("origin") or {})
    origin["port"] = origin_port
    params["origin"] = origin
    new_rule = dict(rule)
    new_rule["action_parameters"] = params
    updated.append(new_rule)

print(json.dumps({"rules": updated}))
PY
)"
if echo "$restored" | python3 -c '
import json, sys
rules = json.load(sys.stdin)["rules"]
prod = [r for r in rules if "production.vocanova.site" in r.get("expression", "")]
assert prod[0]["action_parameters"]["origin"]["port"] == 8443
print("ok")
'; then
  echo "PASS"
else
  echo "FAIL: restore mutation" >&2
  exit 1
fi

echo "selftest: verify-voc067-cutover.sh syntax"
bash -n "$verify_script"
echo "PASS"

echo "All cloudflare cutover selftests passed."
