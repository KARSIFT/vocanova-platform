#!/usr/bin/env python3
"""Pure, fail-closed merge-eligibility policy for normalized evidence v1."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
VALID_RISKS = frozenset({"R0", "R1", "R2", "R3", "R4"})
PASS_CONCLUSIONS = frozenset({"success"})
R4_EVIDENCE = (
    ("decision_record", "R4 decision record"),
    ("impact_assessment", "R4 impact assessment"),
    ("contingency_plan", "R4 contingency or rollback plan"),
    ("specialist_evidence", "applicable R4 specialist evidence"),
    ("deterministic_evidence", "R4 deterministic evidence"),
)
TOP_LEVEL_FIELDS = frozenset(
    {
        "schema_version",
        "pull_request",
        "risk",
        "package",
        "checks",
        "roles",
        "risk_evidence",
        "ehr",
        "action_authority",
    }
)


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _is_bool(value: Any) -> bool:
    return isinstance(value, bool)


def evaluate(evidence: Any) -> dict[str, Any]:
    """Return a deterministic decision; malformed or incomplete input is blocked."""

    reasons: list[dict[str, str]] = []

    def block(code: str, message: str) -> None:
        if not any(reason["code"] == code for reason in reasons):
            reasons.append({"code": code, "message": message})

    if not isinstance(evidence, dict):
        block("schema.invalid", "evidence must be a JSON object")
        return _result(reasons)

    if evidence.get("schema_version") != SCHEMA_VERSION:
        block("schema.unsupported", f"schema_version must equal {SCHEMA_VERSION}")
    missing_fields = TOP_LEVEL_FIELDS - evidence.keys()
    extra_fields = evidence.keys() - TOP_LEVEL_FIELDS
    if missing_fields:
        block("schema.fields_missing", f"required evidence fields are missing: {', '.join(sorted(missing_fields))}")
    if extra_fields:
        block("schema.fields_unknown", f"unknown evidence fields are prohibited: {', '.join(sorted(extra_fields))}")

    pull_request = evidence.get("pull_request")
    if not isinstance(pull_request, dict):
        block("pull_request.missing", "pull_request evidence is required")
        pull_request = {}
    head_sha = pull_request.get("head_sha")
    if not _is_non_empty_string(head_sha) or not re.fullmatch(r"[0-9a-f]{40}", head_sha):
        block("pull_request.head_sha_missing", "a full lowercase pull-request head SHA is required")
        head_sha = ""
    number = pull_request.get("number")
    if not isinstance(number, int) or isinstance(number, bool) or number < 1:
        block("pull_request.number_invalid", "positive pull-request number is required")
    if not _is_non_empty_string(pull_request.get("author")):
        block("pull_request.author_missing", "pull-request author is required")

    risk = evidence.get("risk")
    if risk not in VALID_RISKS:
        block("risk.invalid", "risk must be one of R0, R1, R2, R3, or R4")

    package = evidence.get("package")
    if not isinstance(package, dict):
        block("package.missing", "normalized package evidence is required")
        package = {}
    if not _is_non_empty_string(package.get("path")) or not re.fullmatch(
        r"specs/changes/VOC-[0-9]{3}-[a-z0-9-]+", str(package.get("path", ""))
    ):
        block("package.path_invalid", "canonical package path is invalid")
    if package.get("automatic_merge_allowed") is not True:
        block(
            "package.opt_out",
            "package does not permit automatic merge eligibility",
        )

    _evaluate_checks(evidence.get("checks"), str(head_sha), block)
    _evaluate_review(evidence.get("roles"), str(head_sha), block)

    risk_evidence = evidence.get("risk_evidence")
    if not isinstance(risk_evidence, dict):
        block("risk_evidence.invalid", "risk_evidence must be an object")
        risk_evidence = {}
    for key, label in R4_EVIDENCE:
        value = risk_evidence.get(key)
        if not _is_bool(value):
            block(
                f"risk_evidence.{key}_invalid",
                f"{label} state must be an explicit boolean",
            )
        elif risk == "R4" and value is not True:
            block(f"r4_evidence.{key}_missing", f"{label} is incomplete")

    ehr = evidence.get("ehr")
    if not isinstance(ehr, dict) or not _is_bool(ehr.get("active")):
        block("ehr.invalid", "EHR state must be an explicit boolean")
    elif ehr["active"]:
        block("ehr.active", "exceptional human review is active")

    action_holds = evidence.get("action_authority")
    if not isinstance(action_holds, list):
        block("action_authority.invalid", "action_authority must be an array")
    else:
        for index, hold in enumerate(action_holds):
            if not isinstance(hold, dict):
                block(
                    f"action_authority.invalid_{index}",
                    f"action-authority hold {index} must be an object",
                )
                continue
            name = hold.get("name")
            required = hold.get("required")
            satisfied = hold.get("satisfied")
            if not _is_non_empty_string(name) or not _is_bool(required) or not _is_bool(satisfied):
                block(
                    f"action_authority.invalid_{index}",
                    f"action-authority hold {index} is malformed",
                )
            elif required and not satisfied:
                block(
                    f"action_authority.unmet_{index}",
                    f"action-specific authority is unmet: {name}",
                )

    return _result(reasons)


def _evaluate_checks(checks: Any, head_sha: str, block: Any) -> None:
    if not isinstance(checks, dict):
        block("checks.missing", "deterministic check evidence is required")
        return
    required = checks.get("required")
    observed = checks.get("observed")
    if not isinstance(required, list) or not required or not all(_is_non_empty_string(name) for name in required):
        block("checks.required_invalid", "at least one named required check is required")
        required = []
    if len(set(required)) != len(required):
        block("checks.required_duplicate", "required check names must be unique")
    if not isinstance(observed, list):
        block("checks.observed_invalid", "observed checks must be an array")
        observed = []

    by_name: dict[str, dict[str, Any]] = {}
    for index, check in enumerate(observed):
        if not isinstance(check, dict) or not _is_non_empty_string(check.get("name")):
            block(f"checks.observed_invalid_{index}", f"observed check {index} is malformed")
            continue
        name = check["name"]
        if name in by_name:
            token = _reason_token(name)
            block(f"checks.duplicate_{token}", f"observed check is duplicated: {name}")
            continue
        by_name[name] = check

    for name in required:
        token = _reason_token(name)
        check = by_name.get(name)
        if check is None:
            block(f"checks.missing_{token}", f"required check is missing: {name}")
            continue
        if check.get("head_sha") != head_sha:
            block(f"checks.stale_{token}", f"required check is not bound to the current head: {name}")
        if check.get("status") != "completed":
            block(f"checks.incomplete_{token}", f"required check is incomplete: {name}")
        elif check.get("conclusion") not in PASS_CONCLUSIONS:
            block(f"checks.failed_{token}", f"required check did not pass: {name}")


def _reason_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.casefold()).strip("_") or "unnamed"


def _evaluate_review(roles: Any, head_sha: str, block: Any) -> None:
    if not isinstance(roles, dict):
        block("review.missing", "builder and reviewer evidence is required")
        return
    builder = roles.get("builder")
    reviewer = roles.get("reviewer")
    if not isinstance(builder, dict):
        block("builder.missing", "builder evidence is required")
        builder = {}
    if not isinstance(reviewer, dict):
        block("review.missing", "independent reviewer evidence is required")
        reviewer = {}

    builder_identity = builder.get("identity")
    builder_role = builder.get("role")
    reviewer_identity = reviewer.get("identity")
    reviewer_role = reviewer.get("role")
    if not _is_non_empty_string(builder_identity) or not _is_non_empty_string(builder_role):
        block("builder.identity_missing", "builder identity and role are required")
    if not _is_non_empty_string(reviewer_identity) or not _is_non_empty_string(reviewer_role):
        block("review.identity_missing", "reviewer identity and role are required")
    if _is_non_empty_string(builder_identity) and _is_non_empty_string(reviewer_identity):
        if builder_identity.strip().casefold() == reviewer_identity.strip().casefold():
            block("review.self_authored", "builder and reviewer identities must differ")
    if _is_non_empty_string(builder_role) and _is_non_empty_string(reviewer_role):
        if builder_role.strip().casefold() == reviewer_role.strip().casefold():
            block("review.same_role", "builder and reviewer roles must differ")

    if reviewer.get("reviewed_sha") != head_sha:
        block("review.stale", "review verdict is not bound to the current head SHA")
    if reviewer.get("verdict") != "pass":
        block("review.not_passing", "independent review verdict must be pass")
    if reviewer.get("blocking_findings_resolved") is not True:
        block("review.blocking_findings", "blocking findings are unresolved")
    evidence_url = reviewer.get("evidence_url")
    if not _is_non_empty_string(evidence_url) or not re.fullmatch(
        r"https://github\.com/KARSIFT/vocanova-platform/(?:pull|issues)/[0-9]+(?:#[^\s]+)?",
        str(evidence_url),
    ):
        block("review.evidence_missing", "independent review evidence URL is required")


def _result(reasons: list[dict[str, str]]) -> dict[str, Any]:
    eligible = not reasons
    return {
        "schema_version": SCHEMA_VERSION,
        "eligible": eligible,
        "decision": "eligible" if eligible else "blocked",
        "reasons": reasons,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("evidence", type=Path)
    args = parser.parse_args(argv)
    try:
        evidence = json.loads(args.evidence.read_text(encoding="utf-8"))
        result = evaluate(evidence)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        result = _result([{"code": "schema.unreadable", "message": str(exc)}])
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["eligible"] else 1


if __name__ == "__main__":
    sys.exit(main())
