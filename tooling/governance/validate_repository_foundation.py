#!/usr/bin/env python3
"""Deterministically validate the VocaNova repository foundation."""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

PACKAGE_FILES = (
    "README.md",
    "acceptance-criteria.md",
    "change.yaml",
    "impact-analysis.md",
    "implementation-plan.md",
    "release-plan.md",
    "specification.md",
    "tasks.md",
    "test-plan.md",
)

REQUIRED_FILES = (
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".github/CODEOWNERS",
    ".github/approved-policy/protected-paths.yaml",
    ".github/pull_request_template.md",
    ".github/workflows/governance-policy.yml",
    ".github/workflows/repository-governance.yml",
    "docs/README.md",
    "docs/decisions/README.md",
    "scripts/governance/classify-change-risk.sh",
    "scripts/governance/validate-governance.sh",
    "specs/README.md",
    "tooling/governance/validate_repository_foundation.py",
    "tooling/governance/tests/test_validate_repository_foundation.py",
)

PROTECTED_PATHS = (
    "AGENTS.md",
    "CLAUDE.md",
    ".github/CODEOWNERS",
    ".github/pull_request_template.md",
    ".github/workflows/",
    ".github/approved-policy/",
    "scripts/governance/",
    "tooling/governance/",
    "docs/governance/",
    "docs/operations/15-ai-native-product-and-engineering-operating-model.md",
    "docs/decisions/",
    "specs/README.md",
    "specs/templates/",
    "specs/changes/VOC-001-repository-foundation/",
)

TEMPLATE_MARKERS = {
    "README.md": ("Identity and lifecycle", "Verification, approvals, release, and closure"),
    "specification.md": ("Objective and requirement source", "Data, migrations, analytics, and accessibility"),
    "acceptance-criteria.md": ("VOC-000-AC-00", "Evidence"),
    "impact-analysis.md": ("Security and privacy", "Risks, dependencies, and evidence"),
    "implementation-plan.md": ("File reconciliation and implementation sequence", "Deployment and rollback"),
    "tasks.md": ("VOC-000-T00", "Evidence"),
    "test-plan.md": ("VOC-000-TEST-00", "Expected result"),
    "release-plan.md": ("Release and deployment authorization", "human approvals, and closure"),
}

PR_MARKERS = (
    "VOC-###",
    "Change-package status and canonical path",
    "Requirement source",
    "Stable acceptance-criteria mapping",
    "Existing-file reconciliation",
    "Previous governance control",
    "Proposed governance control",
    "Implementer provenance",
    "Verifier provenance",
    "Exact reviewed head SHA",
    "Hosted activation status",
    "Package closure status",
    "Lightweight R0",
)

ID_TOKEN = re.compile(
    r"VOC-001-(?:D\d+|T\d+|R\d+|(?:AC|TEST|DEP|EV|CON|AM)-\d+)"
)


class Validation:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.errors: list[str] = []

    def error(self, path: str | Path, message: str) -> None:
        self.errors.append(f"{path}: {message}")

    def read(self, relative: str | Path) -> str:
        path = self.root / relative
        try:
            return path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            self.error(relative, f"cannot read UTF-8 text: {exc}")
            return ""


def validate_restricted_yaml(validation: Validation, relative: str) -> dict[str, str]:
    text = validation.read(relative)
    top_level: dict[str, str] = {}
    contexts: dict[int, tuple[str, ...]] = {-1: ("root",)}
    sequence_counts: defaultdict[tuple[tuple[str, ...], int], int] = defaultdict(int)
    seen: defaultdict[tuple[str, ...], set[str]] = defaultdict(set)

    for number, raw in enumerate(text.splitlines(), 1):
        if "\t" in raw:
            validation.error(relative, f"line {number}: tabs are not allowed in restricted YAML")
        content = raw.split("#", 1)[0].rstrip()
        if not content.strip():
            continue
        if re.search(r"(^|\s)[&*!][A-Za-z0-9_-]+", content) or any(x in content for x in ("{", "}", "[", "]")):
            validation.error(relative, f"line {number}: unsupported YAML construct")
        indent = len(content) - len(content.lstrip(" "))
        if indent % 2:
            validation.error(relative, f"line {number}: indentation must use two-space levels")
        match = re.match(r"^\s*(-\s+)?([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$", content)
        if not match:
            if not re.match(r"^\s*-\s+[^:]+$", content):
                validation.error(relative, f"line {number}: unsupported restricted-YAML syntax")
            continue
        is_sequence = bool(match.group(1))
        key = match.group(2)
        value = (match.group(3) or "").strip()
        lower_indents = [level for level in contexts if level < indent]
        parent = contexts[max(lower_indents)] if lower_indents else ("root",)
        if is_sequence:
            counter_key = (parent, indent)
            sequence_counts[counter_key] += 1
            scope = parent + (f"#{sequence_counts[counter_key]}",)
            contexts[indent] = scope
        else:
            scope = parent
        if key in seen[scope]:
            validation.error(relative, f"line {number}: duplicate YAML key '{key}'")
        seen[scope].add(key)
        if indent == 0 and not is_sequence:
            top_level[key] = value.strip('"\'')
        if not value and not is_sequence:
            contexts[indent] = scope + (key,)
        for level in tuple(contexts):
            if level > indent:
                del contexts[level]
    return top_level


def require_complete_directory(validation: Validation, relative: str) -> None:
    directory = validation.root / relative
    if not directory.is_dir():
        validation.error(relative, "required directory is missing")
        return
    actual = tuple(sorted(path.name for path in directory.iterdir() if path.is_file()))
    if actual != PACKAGE_FILES:
        missing = sorted(set(PACKAGE_FILES) - set(actual))
        extra = sorted(set(actual) - set(PACKAGE_FILES))
        validation.error(relative, f"must contain exactly nine files; missing={missing}, extra={extra}")
    for name in PACKAGE_FILES:
        path = directory / name
        if path.is_file() and path.stat().st_size == 0:
            validation.error(f"{relative}/{name}", "file is empty")


def validate_templates(validation: Validation) -> None:
    relative = "specs/templates/change-package"
    require_complete_directory(validation, relative)
    yaml_values = validate_restricted_yaml(validation, f"{relative}/change.yaml")
    expected = {
        "id": "VOC-000",
        "slug": "replace-with-approved-slug",
        "status": "draft",
        "risk": "R0",
    }
    for key, value in expected.items():
        if yaml_values.get(key) != value:
            validation.error(f"{relative}/change.yaml", f"{key} must be safe placeholder {value!r}")
    for name, markers in TEMPLATE_MARKERS.items():
        text = validation.read(f"{relative}/{name}")
        if "VOC-001" in text:
            validation.error(f"{relative}/{name}", "template must not look like the approved VOC-001 package")
        for marker in markers:
            if marker not in text:
                validation.error(f"{relative}/{name}", f"missing required template heading/marker: {marker}")


def definition_ids(package: dict[str, str]) -> list[str]:
    definitions: list[str] = []
    patterns = {
        "specification.md": re.compile(r"^-\s+(?:\*\*|`)(VOC-001-(?:D\d+|AM-\d+))", re.MULTILINE),
        "acceptance-criteria.md": re.compile(r"^##\s+(VOC-001-AC-\d+)", re.MULTILINE),
        "tasks.md": re.compile(r"^##\s+(VOC-001-T\d+)", re.MULTILINE),
        "test-plan.md": re.compile(r"^##\s+(VOC-001-TEST-\d+)", re.MULTILINE),
        "impact-analysis.md": re.compile(r"^##\s+(VOC-001-(?:(?:CON|DEP|EV)-\d+|R\d+))", re.MULTILINE),
    }
    for name, pattern in patterns.items():
        definitions.extend(pattern.findall(package.get(name, "")))
    return definitions


def validate_package(validation: Validation) -> None:
    relative = "specs/changes/VOC-001-repository-foundation"
    require_complete_directory(validation, relative)
    yaml_values = validate_restricted_yaml(validation, f"{relative}/change.yaml")
    expected = {
        "schema_version": "1",
        "id": "VOC-001",
        "slug": "repository-foundation",
        "title": "Repository Foundation",
        "type": "infrastructure",
        "status": "implementing",
        "risk": "R4",
        "canonical_path": relative,
    }
    for key, value in expected.items():
        if yaml_values.get(key) != value:
            validation.error(f"{relative}/change.yaml", f"{key} must equal {value!r}")
    if yaml_values.get("status") not in {"draft", "accepted", "implementation-ready", "implementing", "blocked", "closed", "superseded"}:
        validation.error(f"{relative}/change.yaml", "invalid lifecycle status")
    if yaml_values.get("risk") not in {"R0", "R1", "R2", "R3", "R4"}:
        validation.error(f"{relative}/change.yaml", "risk must be R0 through R4")

    package = {name: validation.read(f"{relative}/{name}") for name in PACKAGE_FILES if name.endswith(".md")}
    definitions = definition_ids(package)
    duplicates = sorted(identifier for identifier in set(definitions) if definitions.count(identifier) > 1)
    if duplicates:
        validation.error(relative, f"duplicate stable identifier definitions: {duplicates}")
    defined = set(definitions)
    references = set()
    for text in package.values():
        references.update(ID_TOKEN.findall(text))
    unresolved = sorted(references - defined)
    if unresolved:
        validation.error(relative, f"unresolved stable identifier references: {unresolved}")
    required_ranges = {
        *(f"VOC-001-D{i:02d}" for i in range(1, 109)),
        *(f"VOC-001-AC-{i:02d}" for i in range(1, 29)),
        *(f"VOC-001-T{i:02d}" for i in range(1, 25)),
        *(f"VOC-001-TEST-{i:02d}" for i in range(1, 26)),
        *(f"VOC-001-R{i:02d}" for i in range(1, 11)),
        *(f"VOC-001-DEP-{i:02d}" for i in range(1, 9)),
        *(f"VOC-001-EV-{i:02d}" for i in range(1, 14)),
        *(f"VOC-001-AM-{i:02d}" for i in range(1, 6)),
    }
    missing = sorted(required_ranges - defined)
    if missing:
        validation.error(relative, f"missing approved stable identifier definitions: {missing}")
    combined = "\n".join(package.values())
    for marker in ("GitHub issue #6", "0211d75f28a4986694555f584dd8b84a3228a2ad", "PASS WITH NON-BLOCKING FINDINGS"):
        if marker not in combined:
            validation.error(relative, f"missing reconciled evidence marker: {marker}")


def validate_ownership(validation: Validation) -> None:
    policy_path = ".github/approved-policy/protected-paths.yaml"
    validate_restricted_yaml(validation, policy_path)
    policy = validation.read(policy_path)
    owners = validation.read(".github/CODEOWNERS")
    listed = set(re.findall(r"^\s*-\s+path:\s*([^\s#]+)", policy, re.MULTILINE))
    for path in PROTECTED_PATHS:
        if path not in listed:
            validation.error(policy_path, f"missing protected path: {path}")
        owner_path = "/" + path
        if not any(line.split() and line.split()[0] == owner_path for line in owners.splitlines() if not line.lstrip().startswith("#")):
            validation.error(".github/CODEOWNERS", f"missing exact protected path owner: {owner_path}")
    active = "\n".join(line for line in owners.splitlines() if not line.lstrip().startswith("#"))
    if "@KARSIFT/" in active:
        validation.error(".github/CODEOWNERS", "invented or unverified governance team is prohibited")
    if re.search(r"@\S*(?:codex|claude|bot|automation)\S*", active, re.IGNORECASE):
        validation.error(".github/CODEOWNERS", "AI or bot identity cannot be a technical-steward owner")
    for line in active.splitlines():
        if line.strip() and "@m-e-h-r-d-a-a-d" not in line:
            validation.error(".github/CODEOWNERS", f"owner must route to @m-e-h-r-d-a-a-d: {line}")


def validate_workflow(validation: Validation) -> None:
    relative = ".github/workflows/repository-governance.yml"
    text = validation.read(relative)
    if not re.search(r"^name:\s*Repository Governance\s*$", text, re.MULTILINE):
        validation.error(relative, "workflow display name must be Repository Governance")
    for marker in ("pull_request:", "push:", "- develop", "- main", "contents: read", "timeout-minutes:"):
        if marker not in text:
            validation.error(relative, f"missing workflow control: {marker}")
    for prohibited in ("pull_request_target", "paths:", "paths-ignore:", "contents: write", "secrets.", "codex", "claude"):
        if prohibited in text.lower():
            validation.error(relative, f"prohibited workflow construct: {prohibited}")
    for action in re.findall(r"^\s*uses:\s*([^\s#]+)", text, re.MULTILINE):
        if not re.fullmatch(r"[^@]+@[0-9a-f]{40}", action):
            validation.error(relative, f"external action is not pinned to a full immutable SHA: {action}")


def validate_governance_language(validation: Validation) -> None:
    agents = validation.read("AGENTS.md")
    exact_chatgpt = (
        "ChatGPT may receive read-only access to KARSIFT/vocanova-platform for\n"
        "repository-grounded product analysis, architecture analysis, specification\n"
        "drafting, and cross-document impact analysis. ChatGPT must not receive\n"
        "repository write, merge, deployment, secret, or production-data access."
    )
    if exact_chatgpt not in agents:
        validation.error("AGENTS.md", "missing exact approved ChatGPT read-only rule")
    combined = agents + "\n" + validation.read("CLAUDE.md")
    for marker in ("approved `VOC-###`", "approve or merge", "independently verifies", "R3", "technical steward", "R4", "founder", "GitHub is the canonical", "Prompt injection"):
        if marker.lower() not in combined.lower():
            validation.error("AGENTS.md", f"missing current R3/R4 governance language: {marker}")
    pr = validation.read(".github/pull_request_template.md")
    for marker in PR_MARKERS:
        if marker not in pr:
            validation.error(".github/pull_request_template.md", f"missing required field: {marker}")


def validate_false_activation(validation: Validation) -> None:
    paths = (
        ".github/approved-policy/protected-paths.yaml",
        "docs/governance/post-merge-activation-checklist.md",
        "specs/changes/VOC-001-repository-foundation/change.yaml",
    )
    for relative in paths:
        text = validation.read(relative)
        for pattern in (r"(?im)^Status:\s*Activated\s*$", r"automatic_merge(?:_allowed)?:\s*true", r"autonomous_production_release:\s*enabled"):
            if re.search(pattern, text):
                validation.error(relative, "false claim that hosted governance or autonomous release is activated")


def validate_repository(root: Path) -> list[str]:
    validation = Validation(root)
    if not root.is_dir():
        return [f"{root}: repository root is not a directory"]
    for relative in REQUIRED_FILES:
        path = root / relative
        if not path.is_file():
            validation.error(relative, "required repository-foundation file is missing")
        elif path.stat().st_size == 0:
            validation.error(relative, "required repository-foundation file is empty")
    if (root / "decisions").exists():
        validation.error("decisions/", "root decision directory is prohibited; use docs/decisions/")
    if (root / ".github/PULL_REQUEST_TEMPLATE.md").exists():
        validation.error(".github/PULL_REQUEST_TEMPLATE.md", "uppercase duplicate PR template is prohibited")
    validate_templates(validation)
    validate_package(validation)
    validate_ownership(validation)
    validate_workflow(validation)
    validate_governance_language(validation)
    validate_false_activation(validation)
    return sorted(set(validation.errors))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repository-root", required=True, type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    try:
        args = build_parser().parse_args(argv)
        errors = validate_repository(args.repository_root.resolve())
    except SystemExit:
        raise
    except Exception as exc:  # fail closed on validator defects
        print(f"validator internal failure: {exc}", file=sys.stderr)
        return 2
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"Repository foundation validation failed with {len(errors)} error(s).", file=sys.stderr)
        return 1
    print("Repository foundation validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
