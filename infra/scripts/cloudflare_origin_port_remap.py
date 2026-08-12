#!/usr/bin/env python3
"""VOC-067-T05 — mutate Cloudflare Origin Rules for the production :8443 remap.

Single implementation used by cloudflare-remove-production-origin-port-remap.sh
and its offline selftest. Do not duplicate this logic in the selftest.
"""

from __future__ import annotations

import json
import sys
from typing import Any


def host_in_expression(expr: str, host: str) -> bool:
    return bool(expr) and host in expr


def rule_targets_production(rule: dict[str, Any], web_host: str, api_host: str) -> bool:
    expr = rule.get("expression", "")
    return host_in_expression(expr, web_host) or host_in_expression(expr, api_host)


def rule_has_port(rule: dict[str, Any], port: int) -> bool:
    origin = (rule.get("action_parameters") or {}).get("origin") or {}
    return origin.get("port") == port


def production_port_rules(
    rules: list[dict[str, Any]], web_host: str, api_host: str, origin_port: int
) -> list[dict[str, Any]]:
    return [
        rule
        for rule in rules
        if rule_targets_production(rule, web_host, api_host)
        and rule_has_port(rule, origin_port)
    ]


def mutate_rules(
    rules: list[dict[str, Any]],
    action: str,
    web_host: str,
    api_host: str,
    origin_port: int,
) -> tuple[list[dict[str, Any]], bool]:
    updated: list[dict[str, Any]] = []
    changed = False
    for rule in rules:
        if not rule_targets_production(rule, web_host, api_host):
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
        else:
            raise SystemExit(f"ERROR: unknown mutate action {action!r}")
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
    return updated, changed


def embed_rules(ruleset: dict[str, Any], rules: list[dict[str, Any]]) -> dict[str, Any]:
    result = dict(ruleset.get("result") or {})
    result["rules"] = rules
    out = dict(ruleset)
    out["result"] = result
    return out


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    full_ruleset = False
    if "--full-ruleset" in args:
        args.remove("--full-ruleset")
        full_ruleset = True
    if len(args) != 4:
        print(
            "usage: cloudflare_origin_port_remap.py "
            "verify|remove|restore <web_host> <api_host> <origin_port> "
            "[--full-ruleset]",
            file=sys.stderr,
        )
        return 1
    action, web_host, api_host, origin_port_raw = args
    origin_port = int(origin_port_raw)
    ruleset = json.load(sys.stdin)
    rules = ruleset.get("result", {}).get("rules") or []

    if action == "verify":
        port_rules = production_port_rules(rules, web_host, api_host, origin_port)
        if not port_rules:
            print(f"OK: no origin rules remap production hosts to port {origin_port}")
            return 0
        print(
            f"FOUND: {len(port_rules)} origin rule(s) still remap to port {origin_port}:",
            file=sys.stderr,
        )
        for rule in port_rules:
            print(
                f"  - id={rule.get('id')} ref={rule.get('ref')} "
                f"expr={rule.get('expression')!r}",
                file=sys.stderr,
            )
        return 2

    if action not in {"remove", "restore"}:
        print(f"ERROR: unknown action {action!r}", file=sys.stderr)
        return 1

    updated, changed = mutate_rules(rules, action, web_host, api_host, origin_port)
    if not changed:
        print("NOOP")
        return 0
    if full_ruleset:
        print(json.dumps(embed_rules(ruleset, updated)))
    else:
        print(json.dumps({"rules": updated}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
