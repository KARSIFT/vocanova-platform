#!/usr/bin/env python3
"""Deterministically validate the VocaNova repository foundation."""

from __future__ import annotations

import argparse
import hashlib
import json
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

DOC16_PATH = "docs/governance/16-autonomous-development-operating-model.md"
A003_STATE_PATH = "docs/governance/a003-transition-state.yaml"
A003_FROZEN_SHA256 = "f2b454653a33e6cb76a0eab37c01d48b0174227450c9ea255474f6aac59b4f83"
# A003_FROZEN_BODY_SHA256 protected the standalone amendment file's exact text
# before DOC-16 v2.0 (2026-08-14) folded it directly into DOC-16 and retired
# that file. A whole-body checksum can no longer apply to text that was
# deliberately reformatted into a single consolidated document; the exact
# evidence markers checked in validate_a003_lifecycle below (URLs, SHAs,
# timestamps) now play the equivalent role - unaltered evidence rather than an
# unaltered byte string.
# Retired to docs/archive/ 2026-08-14 (status: superseded) - the frozen source/body
# checksums below are unchanged, since only frontmatter fields (canonical_path,
# status) and file location moved, never the checksummed body text itself.
DOC17_PATH = "docs/archive/17-autonomous-development-architecture.md"
DOC18_PATH = "docs/archive/18-autonomous-development-implementation-roadmap.md"
# VOC-004's own package files are a permanent historical record written at
# adoption time (2026-07-24), when DOC-17/DOC-18 lived at these original paths -
# that evidence must never be rewritten to describe the later 2026-08-14 archive
# move, so validate_voc_004_package checks these constants, not DOC17_PATH/
# DOC18_PATH above.
DOC17_PATH_AT_VOC004_ADOPTION = "docs/architecture/17-autonomous-development-architecture.md"
DOC18_PATH_AT_VOC004_ADOPTION = "docs/planning/18-autonomous-development-implementation-roadmap.md"
DOC17_SOURCE_SHA256 = "8c9fd7b714e84d39f4b5e9d5c8a4cf8f00a3231b269e2d6dadf6e0ff7707693a"
DOC18_SOURCE_SHA256 = "717c33649f49cedca64cc4744d8121f4b6f5a371c9760076bfa8134c050a8664"
DOC17_BODY_SHA256 = "b3a157557210f0afecbb5ed4ff53cd2738f50c451c39ef0d012363a6d8df7a40"
DOC18_BODY_SHA256 = "3d578186804cc2b3b500eec72809b26c03d9f236a4a22d3534daa1e2ba34c451"
VOC002_PATH = "specs/changes/VOC-002-a003-governance-transition"
VOC003_PATH = "specs/changes/VOC-003-a003-lifecycle-sync"
VOC004_PATH = "specs/changes/VOC-004-canonical-adoption-doc-17-doc-18"
AUTOMATIC_MERGE_EXAMPLES = (
    "specs/templates/change-package/examples/automatic-merge-drafting.json"
)

REQUIRED_FILES = (
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".github/CODEOWNERS",
    ".github/approved-policy/protected-paths.yaml",
    ".github/pull_request_template.md",
    ".github/workflows/governance.yml",
    "docs/README.md",
    DOC17_PATH,
    DOC18_PATH,
    DOC16_PATH,
    A003_STATE_PATH,
    "docs/decisions/README.md",
    "docs/decisions/ADR-0002-risk-class-approval-neutral-authority.md",
    "scripts/governance/classify-change-risk.sh",
    "scripts/governance/validate-governance.sh",
    "specs/README.md",
    AUTOMATIC_MERGE_EXAMPLES,
    f"{VOC002_PATH}/change.yaml",
    f"{VOC003_PATH}/change.yaml",
    f"{VOC004_PATH}/change.yaml",
    "tooling/governance/validate_repository_foundation.py",
    "tooling/governance/tests/test_validate_repository_foundation.py",
    "tooling/governance/merge-eligibility/README.md",
    "tooling/governance/merge-eligibility/evaluator.py",
    "tooling/governance/merge-eligibility/github_adapter.py",
    "tooling/governance/merge-eligibility/schema-v1.json",
    "tooling/governance/merge-eligibility/fixtures/eligible-r4.json",
    "tooling/governance/merge-eligibility/fixtures/blocked-r4.json",
    "tooling/governance/tests/test_merge_eligibility.py",
)

PROTECTED_PATHS = (
    "AGENTS.md",
    "CLAUDE.md",
    ".github/CODEOWNERS",
    ".github/pull_request_template.md",
    ".github/actions/",
    ".github/workflows/",
    ".github/approved-policy/",
    "scripts/governance/",
    "tooling/governance/",
    "docs/governance/",
    DOC17_PATH,
    DOC18_PATH,
    "docs/operations/15-ai-native-product-and-engineering-operating-model.md",
    "docs/decisions/",
    "specs/README.md",
    "specs/templates/",
    "specs/changes/VOC-001-repository-foundation/",
    "specs/changes/VOC-002-a003-governance-transition/",
    "specs/changes/VOC-003-a003-lifecycle-sync/",
    "specs/changes/VOC-004-canonical-adoption-doc-17-doc-18/",
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
    "Active authority model",
    "Effective-activation evidence",
    "Automatic-merge status",
    "Lightweight R0",
)

# VOC-082 keeps the role-separation clarification fail-closed at the repository
# foundation boundary. These are deliberately short, active-policy markers rather
# than a second copy of the full operating model. Historical/vendor/tool records
# are not scanned: they are preserved evidence or scoped permission boundaries.
VOC082_POLICY_MARKERS = {
    "AGENTS.md": (
        ("distinct actor", "separately\n  instantiated AI participant"),
        ("provider neutrality", "Model/provider provenance may"),
        ("exact revision", "authorship of the reviewed exact revision"),
        ("self-review/self-merge", "it cannot approve or merge its own work"),
        ("action authority separation", "separately defined action-specific authority"),
    ),
    DOC16_PATH: (
        ("distinct actor", "Any human or separately instantiated AI participant may occupy"),
        ("provider neutrality", "optional runtime provenance or defense in depth, never authority"),
        ("exact revision", "reviewer must not have\nauthored the reviewed exact revision"),
        ("self-review/self-merge", "The builder cannot\nindependently review, approve, or merge its revision"),
        ("action authority separation", "action-specific authority hold"),
    ),
    "docs/decisions/ADR-0005-provider-neutral-distinct-agent-role-separation.md": (
        ("distinct actor", "separately instantiated AI participant"),
        ("provider neutrality", "Runtime provenance"),
        ("exact revision", "did not author the reviewed exact\nrevision"),
        ("self-review/self-merge", "implementation builder\ncannot review, approve, or merge that revision"),
        ("action authority separation", "Technical review and merge eligibility never satisfy a separately\ndefined authority"),
    ),
    "docs/governance/approval-matrix.md": (
        ("distinct actor", "separately\ninstantiated AI participant"),
        ("provider neutrality", "Model/provider choice may"),
        ("exact revision", "exact revision"),
        ("self-review/self-merge", "Builders cannot verify, approve, or merge their own\nrevision"),
        ("action authority separation", "action-specific authority"),
    ),
}

VOC082_ACTIVE_POLICY_PATHS = tuple(VOC082_POLICY_MARKERS)
VOC082_UNSAFE_POLICY_PATTERNS = (
    ("human-only role requirement", re.compile(r"\bhuman is required solely\s+(?:for|to)\b", re.IGNORECASE)),
    ("vendor-derived authority", re.compile(r"\b(?:model|provider|vendor) identity grants authority\b", re.IGNORECASE)),
    ("same-actor relabeling", re.compile(r"\brelabel(?:ing|ed)?\s+(?:itself\s+)?(?:creates?|establishes?)\s+(?:independence|separation)\b", re.IGNORECASE)),
    ("review-as-action authority", re.compile(r"\b(?:review verdict|reviewer verdict|reviewer evidence)\s+(?:satisf(?:y|ies)|supplies|replaces)\s+the?\s*action-specific authority\b", re.IGNORECASE)),
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


def strip_restricted_yaml_comment(raw: str) -> str:
    quote = ""
    for index, character in enumerate(raw):
        if character in {"\"", "'"}:
            if not quote:
                quote = character
            elif quote == character:
                quote = ""
        elif character == "#" and not quote:
            return raw[:index].rstrip()
    return raw.rstrip()


def validate_restricted_yaml(validation: Validation, relative: str) -> dict[str, str]:
    text = validation.read(relative)
    top_level: dict[str, str] = {}
    contexts: dict[int, tuple[str, ...]] = {-1: ("root",)}
    sequence_counts: defaultdict[tuple[tuple[str, ...], int], int] = defaultdict(int)
    seen: defaultdict[tuple[str, ...], set[str]] = defaultdict(set)

    for number, raw in enumerate(text.splitlines(), 1):
        if "\t" in raw:
            validation.error(relative, f"line {number}: tabs are not allowed in restricted YAML")
        content = strip_restricted_yaml_comment(raw)
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


def automatic_merge_drafting_error(
    values: dict[str, object], *, transition_exception: bool = False
) -> str | None:
    risk = values.get("risk")
    if risk not in {f"R{level}" for level in range(5)}:
        return "automatic-merge drafting requires risk R0 through R4"
    allowed = values.get("automatic_merge_allowed")
    if allowed is True or (isinstance(allowed, str) and allowed.casefold() == "true"):
        return None
    if not (allowed is False or (isinstance(allowed, str) and allowed.casefold() == "false")):
        return "automatic_merge_allowed must be explicitly true or false"
    if (
        transition_exception
        and values.get("id") == "VOC-079"
        and values.get("risk") == "R4"
    ):
        return None
    reason = values.get("automatic_merge_hold_reason")
    if not isinstance(reason, str) or not reason.strip():
        return "automatic_merge_allowed false requires automatic_merge_hold_reason"
    if reason.strip().casefold() in {
        "n/a",
        "none",
        "not applicable",
        "replace",
        "tbd",
        "todo",
        "unknown",
    } or "replace with" in reason.casefold():
        return "automatic_merge_hold_reason must be a non-placeholder package-local rationale"
    return None


def read_package_drafting_values(validation: Validation, relative: str) -> dict[str, str]:
    wanted = {
        "id",
        "risk",
        "automatic_merge_allowed",
        "automatic_merge_hold_reason",
    }
    values: dict[str, str] = {}
    for raw in validation.read(relative).splitlines():
        if not raw or raw[0].isspace() or raw.lstrip().startswith("#") or ":" not in raw:
            continue
        key, value = raw.split(":", 1)
        if key not in wanted:
            continue
        if key in values:
            validation.error(relative, f"duplicate top-level package drafting key: {key}")
            continue
        values[key] = strip_restricted_yaml_comment(value).strip().strip("\"'")
    return values


def validate_automatic_merge_drafting(validation: Validation) -> None:
    template_path = "specs/templates/change-package/change.yaml"
    template = validate_restricted_yaml(validation, template_path)
    if template.get("automatic_merge_allowed") != "true":
        validation.error(template_path, "R0-R4 template default must be automatic_merge_allowed: true")
    drafting_markers = {
        "AGENTS.md": (
            "R0, R1, R2, R3, and R4 all default to",
            "automatic_merge_hold_reason",
            "VOC-079 is the sole transition exception",
        ),
        "CONTRIBUTING.md": (
            "defaults to\n`true` for R0–R4",
            "automatic_merge_hold_reason",
            "sole\ntransition exception",
        ),
        ".github/README.md": (
            "defaults to `true` across R0–R4",
            "automatic_merge_hold_reason",
            "pre-transition exception",
        ),
        ".github/pull_request_template.md": (
            "R0–R4 default to",
            "automatic_merge_hold_reason",
            "VOC-079's documented transition value",
        ),
        "docs/operations/15-ai-native-product-and-engineering-operating-model.md": (
            "R0–R4 packages default it to `true`",
            "automatic_merge_hold_reason",
            "VOC-079 preserved as the sole pre-transition exception",
        ),
        "docs/decisions/ADR-0002-risk-class-approval-neutral-authority.md": (
            "New R0–R4 packages default `automatic_merge_allowed` to `true`",
            "automatic_merge_hold_reason",
            "sole transition exception",
        ),
        "specs/templates/change-package/README.md": (
            "template literal is `true` for R0–R4",
            "automatic_merge_hold_reason",
            "sole transition\nexception",
        ),
        template_path: (
            "R0–R4 all default to true",
            "automatic_merge_hold_reason",
            "risk label alone is never an opt-out",
        ),
    }
    for relative, markers in drafting_markers.items():
        source = validation.read(relative)
        for marker in markers:
            if marker not in source:
                validation.error(relative, f"missing automatic-merge drafting rule marker: {marker}")

    try:
        matrix = json.loads(validation.read(AUTOMATIC_MERGE_EXAMPLES))
    except json.JSONDecodeError as exc:
        validation.error(AUTOMATIC_MERGE_EXAMPLES, f"invalid JSON: {exc}")
        matrix = {}
    cases = matrix.get("cases") if isinstance(matrix, dict) else None
    if not isinstance(matrix, dict) or matrix.get("schema_version") != 1 or not isinstance(cases, list):
        validation.error(AUTOMATIC_MERGE_EXAMPLES, "drafting matrix must use schema_version 1 and a cases array")
        cases = []

    coverage: defaultdict[str, set[str]] = defaultdict(set)
    names: set[str] = set()
    for index, case in enumerate(cases):
        label = f"case {index + 1}"
        if not isinstance(case, dict):
            validation.error(AUTOMATIC_MERGE_EXAMPLES, f"{label} must be an object")
            continue
        name = case.get("name")
        if not isinstance(name, str) or not name or name in names:
            validation.error(AUTOMATIC_MERGE_EXAMPLES, f"{label} must have a unique non-empty name")
        else:
            names.add(name)
            label = name
        expected = case.get("expected_valid")
        if not isinstance(expected, bool):
            validation.error(AUTOMATIC_MERGE_EXAMPLES, f"{label} expected_valid must be boolean")
            continue
        error = automatic_merge_drafting_error(
            case, transition_exception=case.get("transition_exception") is True
        )
        if (error is None) != expected:
            validation.error(
                AUTOMATIC_MERGE_EXAMPLES,
                f"{label} expected_valid={expected} disagrees with policy: {error or 'valid'}",
            )
        risk = case.get("risk")
        if isinstance(risk, str):
            if case.get("automatic_merge_allowed") is True and expected:
                coverage["default"].add(risk)
            elif case.get("automatic_merge_allowed") is False and case.get("automatic_merge_hold_reason") and expected:
                coverage["reasoned"].add(risk)
            elif case.get("automatic_merge_allowed") is False and not case.get("automatic_merge_hold_reason") and not expected:
                coverage["unreasoned"].add(risk)
    expected_risks = {f"R{level}" for level in range(5)}
    for category in ("default", "reasoned", "unreasoned"):
        if coverage[category] != expected_risks:
            validation.error(AUTOMATIC_MERGE_EXAMPLES, f"{category} examples must cover R0-R4")
    if "voc079-transition-exception" not in names:
        validation.error(AUTOMATIC_MERGE_EXAMPLES, "missing VOC-079 transition exception example")

    changes = validation.root / "specs/changes"
    for package_file in sorted(changes.glob("VOC-*/change.yaml")):
        match = re.match(r"VOC-(\d{3})-", package_file.parent.name)
        if not match:
            continue
        number = int(match.group(1))
        if number < 79:
            continue
        relative = package_file.relative_to(validation.root).as_posix()
        values = read_package_drafting_values(validation, relative)
        if number == 79:
            source = validation.read(relative)
            if (
                values.get("id") != "VOC-079"
                or values.get("risk") != "R4"
                or values.get("automatic_merge_allowed") != "false"
            ):
                validation.error(relative, "VOC-079 must preserve its pre-transition R4 false exception")
            for marker in (
                "currently effective R4 rule governs this transition package",
                "must not be reused as precedent after adoption",
            ):
                if marker not in source:
                    validation.error(relative, f"missing VOC-079 transition-exception marker: {marker}")
            error = automatic_merge_drafting_error(values, transition_exception=True)
        else:
            error = automatic_merge_drafting_error(values)
        if error:
            validation.error(relative, error)


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


def validate_voc_002_package(validation: Validation) -> None:
    relative = VOC002_PATH
    require_complete_directory(validation, relative)
    values = validate_restricted_yaml(validation, f"{relative}/change.yaml")
    expected = {
        "schema_version": "1",
        "id": "VOC-002",
        "slug": "a003-governance-transition",
        "title": "A-003 Governance Transition",
        "type": "governance",
        "status": "implementing",
        "risk": "R4",
        "protected_technical_effect": "R3",
        "canonical_path": relative,
    }
    for key, value in expected.items():
        if values.get(key) != value:
            validation.error(f"{relative}/change.yaml", f"{key} must equal {value!r}")

    package = {name: validation.read(f"{relative}/{name}") for name in PACKAGE_FILES if name.endswith(".md")}
    combined = "\n".join(package.values())
    patterns = {
        "specification.md": re.compile(r"^- \*\*(VOC-002-R\d+):?\*\*", re.MULTILINE),
        "acceptance-criteria.md": re.compile(r"^## (VOC-002-AC-\d+)", re.MULTILINE),
        "impact-analysis.md": re.compile(r"^## (VOC-002-IMP-\d+)", re.MULTILINE),
        "tasks.md": re.compile(r"^## (VOC-002-T\d+)", re.MULTILINE),
        "test-plan.md": re.compile(r"^## (VOC-002-TEST-\d+)", re.MULTILINE),
    }
    definitions: list[str] = []
    for name, pattern in patterns.items():
        definitions.extend(pattern.findall(package[name]))
    duplicates = sorted(item for item in set(definitions) if definitions.count(item) > 1)
    if duplicates:
        validation.error(relative, f"duplicate VOC-002 stable identifier definitions: {duplicates}")
    required = {
        *(f"VOC-002-R{i:02d}" for i in range(1, 17)),
        *(f"VOC-002-AC-{i:02d}" for i in range(1, 13)),
        *(f"VOC-002-IMP-{i:02d}" for i in range(1, 9)),
        *(f"VOC-002-T{i:02d}" for i in range(1, 9)),
        *(f"VOC-002-TEST-{i:02d}" for i in range(1, 13)),
    }
    missing = sorted(required - set(definitions))
    if missing:
        validation.error(relative, f"missing VOC-002 stable identifier definitions: {missing}")
    references = set(re.findall(r"VOC-002-(?:R\d+|AC-\d+|IMP-\d+|T\d+|TEST-\d+)", combined))
    unresolved = sorted(references - set(definitions))
    if unresolved:
        validation.error(relative, f"unresolved VOC-002 stable identifier references: {unresolved}")
    for marker in (
        A003_FROZEN_SHA256,
        "pre-A-003",
        "R4",
        "R3",
        "exact-SHA Claude",
        "approved PR head SHA",
        "adopted `develop` SHA",
        "one-time",
        "DOC-17",
        "DOC-18",
        "automatic merge",
        "autonomous production release",
    ):
        if marker not in combined:
            validation.error(relative, f"missing VOC-002 transition marker: {marker}")


def validate_voc_003_package(validation: Validation) -> None:
    relative = VOC003_PATH
    require_complete_directory(validation, relative)
    values = validate_restricted_yaml(validation, f"{relative}/change.yaml")
    expected = {
        "schema_version": "1",
        "id": "VOC-003",
        "slug": "a003-lifecycle-sync",
        "title": "A-003 Lifecycle State Synchronization",
        "type": "governance",
        "status": "implementing",
        "risk": "R4",
        "canonical_path": relative,
        "base_sha": "9d5b4bc1d4a72e313b013047601265ee837c34f2",
        "authority_model": "a003-active",
        "post_activation_sync": "true",
        "new_activation_event": "false",
        "automatic_merge": "false",
        "autonomous_merge": "false",
        "rl1_technical_activation": "false",
        "rl2_technical_activation": "false",
        "production_deployment": "false",
        "autonomous_production_release": "disabled",
        "doc_17_repository_adoption": "false",
        "doc_18_repository_adoption": "false",
        "control_plane_implementation": "false",
    }
    for key, value in expected.items():
        if values.get(key) != value:
            validation.error(f"{relative}/change.yaml", f"{key} must equal {value!r}")
    combined = "\n".join(validation.read(f"{relative}/{name}") for name in PACKAGE_FILES)
    for marker in (
        "post-activation canonical synchronization",
        "c858ebff3d97da88fea830bc32a74f69f59a9ad2",
        "9d5b4bc1d4a72e313b013047601265ee837c34f2",
        "2026-07-17T16:44:34Z",
        "R4",
        "exhausted",
        "DOC-17",
        "DOC-18",
        "Control Plane",
        "autonomous production release",
    ):
        if marker not in combined:
            validation.error(relative, f"missing VOC-003 synchronization marker: {marker}")


def validate_voc_004_package(validation: Validation) -> None:
    relative = VOC004_PATH
    require_complete_directory(validation, relative)
    values = validate_restricted_yaml(validation, f"{relative}/change.yaml")
    expected = {
        "schema_version": "1",
        "id": "VOC-004",
        "slug": "canonical-adoption-doc-17-doc-18",
        "title": "Canonical Adoption of DOC-17 and DOC-18",
        "type": "governance",
        "status": "completed",
        "risk": "R4",
        "canonical_path": relative,
        "base_branch": "develop",
        "base_sha": "873038735aea30b754a8c57b3522e1ff41f6d89c",
        "authority_model": "a003-active",
        "approved_candidate_sha": "89013e6a8fab4cee45935e700d9eb3e49d3d39ed",
        "independent_verification_status": "passed-exact-revision-with-non-blocking-findings",
        "independent_verification_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11#issuecomment-5007950942",
        "founder_r4_approval_status": "approved-exact-revision",
        "founder_r4_approval_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11#issuecomment-5007966020",
        "repository_adoption_status": "adopted",
        "adoption_pr": "11",
        "adopted_develop_sha": "2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77",
        "repository_adoption_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11",
        "canonical_lifecycle_sync_status": "complete",
        "doc_17_source_sha256": DOC17_SOURCE_SHA256,
        "doc_18_source_sha256": DOC18_SOURCE_SHA256,
        "doc_17_repository_adoption": "true",
        "doc_18_repository_adoption": "true",
        "control_plane_implementation": "false",
        "rl1_technical_activation": "false",
        "rl2_technical_activation": "false",
        "automatic_merge": "false",
        "autonomous_merge": "false",
        "production_deployment": "disabled",
        "autonomous_production_release": "disabled",
        "ehr": "not-triggered",
        "standing_technical_steward_approval": "not-applicable",
    }
    for key, value in expected.items():
        if values.get(key) != value:
            validation.error(f"{relative}/change.yaml", f"{key} must equal {value!r}")

    package = {
        name: validation.read(f"{relative}/{name}")
        for name in PACKAGE_FILES
        if name.endswith(".md")
    }
    patterns = {
        "specification.md": re.compile(r"^- \*\*(VOC-004-R\d+):?\*\*", re.MULTILINE),
        "acceptance-criteria.md": re.compile(r"^## (VOC-004-AC-\d+)", re.MULTILINE),
        "impact-analysis.md": re.compile(r"^## (VOC-004-IMP-\d+)", re.MULTILINE),
        "tasks.md": re.compile(r"^## (VOC-004-T\d+)", re.MULTILINE),
        "test-plan.md": re.compile(r"^## (VOC-004-TEST-\d+)", re.MULTILINE),
    }
    definitions: list[str] = []
    for name, pattern in patterns.items():
        definitions.extend(pattern.findall(package[name]))
    duplicates = sorted(item for item in set(definitions) if definitions.count(item) > 1)
    if duplicates:
        validation.error(relative, f"duplicate VOC-004 stable identifier definitions: {duplicates}")
    required = {
        *(f"VOC-004-R{i:02d}" for i in range(1, 13)),
        *(f"VOC-004-AC-{i:02d}" for i in range(1, 11)),
        *(f"VOC-004-IMP-{i:02d}" for i in range(1, 8)),
        *(f"VOC-004-T{i:02d}" for i in range(1, 11)),
        *(f"VOC-004-TEST-{i:02d}" for i in range(1, 11)),
    }
    missing = sorted(required - set(definitions))
    if missing:
        validation.error(relative, f"missing VOC-004 stable identifier definitions: {missing}")
    combined = "\n".join(package.values())
    references = set(
        re.findall(r"VOC-004-(?:R\d+|AC-\d+|IMP-\d+|T\d+|TEST-\d+)", combined)
    )
    unresolved = sorted(references - set(definitions))
    if unresolved:
        validation.error(relative, f"unresolved VOC-004 stable identifier references: {unresolved}")
    for marker in (
        "/home/mehrdad/project/vocanova-source/DOC-17-vocanova-autonomous-development-architecture-v1.md",
        "/home/mehrdad/project/vocanova-source/DOC-18-vocanova-autonomous-development-implementation-roadmap.md",
        DOC17_SOURCE_SHA256,
        DOC18_SOURCE_SHA256,
        DOC17_PATH_AT_VOC004_ADOPTION,
        DOC18_PATH_AT_VOC004_ADOPTION,
        "R4",
        "exact-SHA Claude Code",
        "exact-SHA founder R4 approval",
        "EHR is not triggered",
        "standing technical-steward approval",
        "exhausted",
        "VocaNova MVP",
        "89013e6a8fab4cee45935e700d9eb3e49d3d39ed",
        "2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77",
        "PASS WITH NON-BLOCKING FINDINGS",
        "PR #11",
    ):
        if marker not in combined:
            validation.error(relative, f"missing VOC-004 adoption marker: {marker}")


def frontmatter_values(text: str) -> dict[str, str]:
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        return {}
    frontmatter = text[4:].split("\n---\n", 1)[0]
    values: dict[str, str] = {}
    for line in frontmatter.splitlines():
        match = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$", line)
        if match:
            values[match.group(1)] = match.group(2).strip().strip("\"'")
    return values


def validate_doc_17_doc_18_adoption(validation: Validation) -> None:
    expected_documents = {
        DOC17_PATH: {
            "id": "DOC-17",
            "status": "superseded",
            "canonical_path": DOC17_PATH,
            "founder_direction_status": "approved",
            "formal_repository_approval_status": "approved-exact-revision",
            "repository_adoption_status": "adopted",
            "technical_activation_status": "inactive",
            "frozen_source_sha256": DOC17_SOURCE_SHA256,
            "frozen_substantive_body_sha256": DOC17_BODY_SHA256,
            "adoption_change": "VOC-004",
            "approved_candidate_sha": "89013e6a8fab4cee45935e700d9eb3e49d3d39ed",
            "independent_verification_status": "passed-exact-revision-with-non-blocking-findings",
            "independent_verification_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11#issuecomment-5007950942",
            "founder_r4_approval_status": "approved-exact-revision",
            "founder_r4_approval_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11#issuecomment-5007966020",
            "adoption_pr": "11",
            "adopted_develop_sha": "2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77",
            "repository_adoption_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11",
        },
        DOC18_PATH: {
            "id": "DOC-18",
            "status": "superseded",
            "canonical_path": DOC18_PATH,
            "founder_direction_status": "approved",
            "formal_repository_approval_status": "approved-exact-revision",
            "repository_adoption_status": "adopted",
            "technical_activation_status": "inactive",
            "frozen_source_sha256": DOC18_SOURCE_SHA256,
            "frozen_substantive_body_sha256": DOC18_BODY_SHA256,
            "adoption_change": "VOC-004",
            "approved_candidate_sha": "89013e6a8fab4cee45935e700d9eb3e49d3d39ed",
            "independent_verification_status": "passed-exact-revision-with-non-blocking-findings",
            "independent_verification_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11#issuecomment-5007950942",
            "founder_r4_approval_status": "approved-exact-revision",
            "founder_r4_approval_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11#issuecomment-5007966020",
            "adoption_pr": "11",
            "adopted_develop_sha": "2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77",
            "repository_adoption_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/11",
        },
    }
    body_hashes = {DOC17_PATH: DOC17_BODY_SHA256, DOC18_PATH: DOC18_BODY_SHA256}
    for relative, expected in expected_documents.items():
        text = validation.read(relative)
        metadata = frontmatter_values(text)
        for key, value in expected.items():
            if metadata.get(key) != value:
                validation.error(relative, f"canonical adoption requires {key}: {value}")
        body = text.split("---", 2)[2] if text.count("---") >= 2 else ""
        if hashlib.sha256(body.encode("utf-8")).hexdigest() != body_hashes[relative]:
            validation.error(relative, "frozen substantive body checksum mismatch")

    architecture_index = validation.read("docs/architecture/README.md")
    planning_index = validation.read("docs/planning/README.md")
    root_index = validation.read("docs/README.md")
    specs_index = validation.read("specs/README.md")
    for relative, text, marker in (
        ("docs/architecture/README.md", architecture_index, "17-autonomous-development-architecture.md"),
        ("docs/planning/README.md", planning_index, "18-autonomous-development-implementation-roadmap.md"),
        ("docs/README.md", root_index, "DOC-17 and DOC-18 were adopted together"),
        ("specs/README.md", specs_index, "VOC-004 — Canonical Adoption of DOC-17 and DOC-18"),
    ):
        if marker not in text:
            validation.error(relative, f"missing canonical adoption index marker: {marker}")


def validate_a003_lifecycle(validation: Validation) -> None:
    state = validate_restricted_yaml(validation, A003_STATE_PATH)
    operating_model = validation.read(DOC16_PATH)

    if state.get("frozen_source_sha256") != A003_FROZEN_SHA256:
        validation.error(A003_STATE_PATH, "frozen A-003 source checksum identifier is missing or changed")

    active = state.get("effective_activation_status") == "active"
    if not active:
        # A-003 effective activation (2026-07-17T16:44:34Z) is a completed,
        # permanent historical fact for this repository - there is no valid path
        # back to a pre-activation state, so unlike earlier validator revisions
        # this is a hard failure rather than a second branch that re-validates an
        # alternate pre-merge document shape.
        validation.error(
            A003_STATE_PATH,
            "effective_activation_status must remain active - this repository has no "
            "supported pre-activation state after 2026-07-17T16:44:34Z",
        )
    else:
        required_active = {
            "authority_model": "a003-active",
            "current_successor_authority_model": "voc079-approval-neutral",
            "transition_stage": "effectively-active",
            "formal_founder_approval_status": "approved-exact-revision",
            "technical_steward_migration_approval_status": "approved-exact-revision-one-time",
            "independent_verification_status": "passed-exact-revision",
            "repository_adoption_status": "adopted",
            "effective_activation_status": "active",
            "post_merge_validation_status": "passed",
            "migration_approval_status": "exhausted-non-reusable",
            "migration_approval_exhausted": "true",
            "technical_steward_routine_authority_status": "historical-retired",
            "exceptional_human_review_mode": "exceptional-only",
            "canonical_lifecycle_sync_status": "complete",
        }
        for key, value in required_active.items():
            if state.get(key) != value:
                validation.error(A003_STATE_PATH, f"active A-003 requires {key}: {value}")
        for key in ("approved_pr_head_sha", "adopted_develop_sha"):
            if not re.fullmatch(r"[0-9a-f]{40}", state.get(key, "")):
                validation.error(A003_STATE_PATH, f"active A-003 requires a full {key}")
        if state.get("approved_pr_head_sha") == state.get("adopted_develop_sha"):
            validation.error(A003_STATE_PATH, "approved PR head SHA and adopted develop SHA must be distinct records")
        exact_active_state = {
            "approved_pr_head_sha": "c858ebff3d97da88fea830bc32a74f69f59a9ad2",
            "adopted_develop_sha": "9d5b4bc1d4a72e313b013047601265ee837c34f2",
            "approved_adopted_tree_sha": "07ef24cbb8602f540600dcea551306ed51a6215f",
            "formal_founder_approval_at": "2026-07-17T16:37:38Z",
            "formal_founder_approval_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005389067",
            "technical_steward_migration_approval_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005389067",
            "independent_verification_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005293621",
            "repository_adoption_at": "2026-07-17T16:41:32Z",
            "repository_adoption_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005429197",
            "effective_activation_at": "2026-07-17T16:44:34Z",
            "post_merge_validation_evidence": "https://github.com/KARSIFT/vocanova-platform/actions/runs/29597154713",
            "activation_evidence": "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622",
        }
        for key, value in exact_active_state.items():
            if state.get(key) != value:
                validation.error(A003_STATE_PATH, f"active A-003 requires exact {key}: {value}")
        doc16_metadata = frontmatter_values(operating_model)
        if doc16_metadata.get("status") != "approved":
            validation.error(DOC16_PATH, "DOC-16 requires synchronized status: approved")

        # DOC-16 v2.0 folds the former standalone A-002/A-003/A-004 amendment
        # documents directly into this operating model and preserves their
        # approval evidence in its own "Amendment history" section instead of a
        # separate frozen-checksum file per amendment. A whole-body checksum
        # cannot survive a legitimate, authorized consolidation of three
        # documents into one - so this checks the same underlying fact a
        # checksum protected (evidence cannot be silently dropped or altered)
        # by requiring every exact evidence string to still appear verbatim.
        required_evidence_markers = (
            "Amendment history",
            "09f97341ff093fd20a70683d88b772e154979330",
            "https://github.com/KARSIFT/vocanova-platform/pull/3#issuecomment-4961029533",
            "2026-07-17T16:44:34Z",
            "c858ebff3d97da88fea830bc32a74f69f59a9ad2",
            "9d5b4bc1d4a72e313b013047601265ee837c34f2",
            "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005389067",
            "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005293621",
            "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005429197",
            "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622",
            "94f4d2196156c55b3264f955c4d03746ab2cd37a",
            "https://github.com/KARSIFT/vocanova-platform/pull/54#issuecomment-5295002955",
        )
        for marker in required_evidence_markers:
            if marker not in operating_model:
                validation.error(DOC16_PATH, f"missing folded amendment evidence marker: {marker}")

    for key in (
        "rl1_technical_activation",
        "rl2_technical_activation",
        "control_plane_implementation",
    ):
        if state.get(key) != "false":
            validation.error(A003_STATE_PATH, f"{key} must remain false")
    for key in ("doc_17_repository_adoption", "doc_18_repository_adoption"):
        if state.get(key) != "true":
            validation.error(A003_STATE_PATH, f"{key} must be true for atomic VOC-004 adoption")

    # Automatic merge/release/production-deployment authority (A-003 SS10-12) is a
    # hard, unconditional invariant UNLESS the file also carries a specific,
    # dated authorization marker - not just the boolean flip. This preserves the
    # original fail-closed tripwire (a silent/accidental flip of just the
    # boolean still fails validation) while allowing the founder's explicit,
    # twice-confirmed 2026-08-08 decision to actually take effect. See
    # AGENTS.md's "Release and deployment authority" section for the record of
    # that decision - this check requires the same marker text to be present
    # here, not just asserted in a doc elsewhere.
    state_source = validation.read(A003_STATE_PATH)
    autonomy_authorized = "AUTONOMOUS-RELEASE-AUTHORIZED-2026-08-08" in state_source
    control_plane_retired = "VOC-078-CONTROL-PLANE-RETIRED-2026-08-19" in state_source
    merge_release_defaults = {
        "automatic_merge_allowed": "false",
        "autonomous_merge_allowed": "false",
        "production_deployment": "disabled",
        "autonomous_production_release": "disabled",
    }
    merge_release_authorized = {
        "automatic_merge_allowed": "true",
        "autonomous_merge_allowed": "true",
        "production_deployment": "enabled",
        "autonomous_production_release": "enabled",
    }
    merge_release_retired = {
        "automatic_merge_allowed": "false",
        "autonomous_merge_allowed": "false",
        "production_deployment": "disabled",
        "autonomous_production_release": "disabled",
    }
    for key, default in merge_release_defaults.items():
        current = state.get(key)
        if control_plane_retired:
            if current != merge_release_retired[key]:
                validation.error(A003_STATE_PATH, f"{key} must equal {merge_release_retired[key]!r} after VOC-078 control-plane retirement")
        elif autonomy_authorized:
            if current != merge_release_authorized[key]:
                validation.error(A003_STATE_PATH, f"{key} must equal {merge_release_authorized[key]!r} once authorized")
        elif current != default:
            validation.error(A003_STATE_PATH, f"{key} must remain {default!r} without an authorization marker")

    appointment = validation.read("docs/governance/technical-steward-appointment.md")
    for marker in (
        "Appointed qualified human technical steward: `@m-e-h-r-d-a-a-d`",
        "same verified human presently serves in two explicitly separate",
        "permanent audit history",
        "one-time VOC-002 approval is exhausted and is not reusable",
    ):
        if marker not in appointment:
            validation.error("docs/governance/technical-steward-appointment.md", f"missing historical evidence marker: {marker}")

    authority = validation.read("docs/governance/approval-matrix.md")
    for marker in (
        "no class requires founder",
        "exact-revision review",
        "separately named external-effect authority still applies",
        "EHR",
        "must never be reused",
        "CODEOWNERS remains review routing",
    ):
        if marker not in authority:
            validation.error("docs/governance/approval-matrix.md", f"missing current authority marker: {marker}")


def validate_ownership(validation: Validation) -> None:
    policy_path = ".github/approved-policy/protected-paths.yaml"
    policy_values = validate_restricted_yaml(validation, policy_path)
    policy = validation.read(policy_path)
    expected_policy_state = {
        "status": "approved-voc079-active",
        "authority_model": "voc079-approval-neutral",
        "hosted_enforcement_status": "not-activated",
        "rl1_technical_activation": "false",
        "rl2_technical_activation": "false",
        "doc_17_repository_adoption": "true",
        "doc_18_repository_adoption": "true",
        "control_plane_implementation": "false",
    }
    for key, value in expected_policy_state.items():
        if policy_values.get(key) != value:
            validation.error(policy_path, f"canonical protected policy requires {key}: {value}")

    # Same authorization-marker gate as validate_a003 applies here - this file
    # mirrors docs/governance/a003-transition-state.yaml's merge/release/
    # deployment fields and must move in lockstep with it, never drift apart.
    autonomy_authorized = "AUTONOMOUS-RELEASE-AUTHORIZED-2026-08-08" in policy
    control_plane_retired = "VOC-078-CONTROL-PLANE-RETIRED-2026-08-19" in policy
    merge_release_defaults = {
        "automatic_merge_allowed": "false",
        "autonomous_merge_allowed": "false",
        "production_deployment": "disabled",
        "autonomous_production_release": "disabled",
    }
    merge_release_authorized = {
        "automatic_merge_allowed": "true",
        "autonomous_merge_allowed": "true",
        "production_deployment": "enabled",
        "autonomous_production_release": "enabled",
    }
    merge_release_retired = {
        "automatic_merge_allowed": "false",
        "autonomous_merge_allowed": "false",
        "production_deployment": "disabled",
        "autonomous_production_release": "disabled",
    }
    for key, default in merge_release_defaults.items():
        current = policy_values.get(key)
        if control_plane_retired:
            if current != merge_release_retired[key]:
                validation.error(policy_path, f"{key} must equal {merge_release_retired[key]!r} after VOC-078 control-plane retirement")
        elif autonomy_authorized:
            if current != merge_release_authorized[key]:
                validation.error(policy_path, f"{key} must equal {merge_release_authorized[key]!r} once authorized")
        elif current != default:
            validation.error(policy_path, f"{key} must remain {default!r} without an authorization marker")
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
    relative = ".github/workflows/governance.yml"
    text = validation.read(relative)
    if not re.search(r"^name:\s*Governance\s*$", text, re.MULTILINE):
        validation.error(relative, "workflow display name must be Governance")
    for marker in (
        "pull_request:",
        "push:",
        "branches: [develop, main]",
        "contents: read",
        "checks: read",
        "pull-requests: read",
        "timeout-minutes:",
        "name: merge eligibility",
        "merge-eligibility/github_adapter.py",
        "persist-credentials: false",
    ):
        if marker not in text:
            validation.error(relative, f"missing workflow control: {marker}")
    for prohibited in ("pull_request_target", "paths:", "paths-ignore:", "contents: write", "secrets.", "codex", "claude"):
        if prohibited in text.lower():
            validation.error(relative, f"prohibited workflow construct: {prohibited}")
    for action in re.findall(r"^\s*uses:\s*([^\s#]+)", text, re.MULTILINE):
        if not re.fullmatch(r"[^@]+@[0-9a-f]{40}", action):
            validation.error(relative, f"external action is not pinned to a full immutable SHA: {action}")
    permission_match = re.search(
        r"^permissions:\s*\n(?P<body>(?: {2}[A-Za-z-]+:\s*[^\n]+\n)+)",
        text,
        re.MULTILINE,
    )
    expected_permissions = {
        "contents": "read",
        "checks": "read",
        "pull-requests": "read",
    }
    if not permission_match:
        validation.error(relative, "missing parseable top-level permissions block")
    else:
        permissions = dict(
            re.findall(r"^ {2}([A-Za-z-]+):\s*([^\s#]+)", permission_match.group("body"), re.MULTILINE)
        )
        if permissions != expected_permissions:
            validation.error(
                relative,
                f"workflow permissions must equal the read-only set {expected_permissions!r}",
            )


def validate_merge_eligibility(validation: Validation) -> None:
    base = "tooling/governance/merge-eligibility"
    evaluator = validation.read(f"{base}/evaluator.py")
    adapter = validation.read(f"{base}/github_adapter.py")
    schema_text = validation.read(f"{base}/schema-v1.json")
    try:
        schema = json.loads(schema_text)
    except json.JSONDecodeError as exc:
        validation.error(f"{base}/schema-v1.json", f"invalid JSON schema: {exc}")
        schema = {}
    if schema.get("properties", {}).get("schema_version", {}).get("const") != 1:
        validation.error(f"{base}/schema-v1.json", "schema_version must be pinned to 1")
    for prohibited in ("urllib", "requests", "http.client", "subprocess", "GITHUB_TOKEN"):
        if prohibited in evaluator:
            validation.error(f"{base}/evaluator.py", f"pure evaluator contains prohibited boundary: {prohibited}")
    if 'method="GET"' not in adapter:
        validation.error(f"{base}/github_adapter.py", "adapter must make explicit GET-only requests")
    for prohibited in (
        'method="POST"',
        'method="PATCH"',
        'method="PUT"',
        'method="DELETE"',
        "subprocess",
        "os.system",
    ):
        if prohibited in adapter:
            validation.error(f"{base}/github_adapter.py", f"adapter contains prohibited write/process path: {prohibited}")
    for marker in (
        "package.opt_out",
        "risk.invalid",
        "review.self_authored",
        "review.stale",
        "review.blocking_findings",
        "review.evidence_missing",
        "ehr.active",
        "action_authority.unmet_",
        "r4_evidence.",
    ):
        if marker not in evaluator:
            validation.error(f"{base}/evaluator.py", f"missing fail-closed policy reason: {marker}")
    consumption_markers = {
        "AGENTS.md": "reads it only to report the read-only eligibility decision",
        "docs/operations/15-ai-native-product-and-engineering-operating-model.md": (
            "consumes it only for the read-only eligibility report"
        ),
        "specs/templates/change-package/change.yaml": (
            "consumes it only for the read-only\n# eligibility report"
        ),
    }
    for relative, marker in consumption_markers.items():
        if marker not in validation.read(relative):
            validation.error(relative, "missing accurate automatic_merge_allowed consumption rule")


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
    approval_neutral_sources = {
        DOC16_PATH: (
            "universal evidence contract",
            "R4 does not require founder approval merely because it is R4",
            "action-specific authority",
        ),
        "docs/governance/change-risk-classification.md": (
            "No approval from risk class",
            "exact-revision independent verification",
            "Action-specific authority remains separate from classification",
        ),
        "AGENTS.md": (
            "R0-R4 are consequence classes",
            "Resolve every blocking finding before merge",
            "Explicit external-effect authority still applies",
        ),
        "CLAUDE.md": (
            "may occupy the independent-reviewer role",
            "no class requires founder or standing",
            "Explicit action-specific authority remains mandatory",
        ),
        ".github/pull_request_template.md": (
            "no founder approval solely because work is R4",
            "Action-specific authority and evidence",
            "Blocking-findings resolution",
        ),
    }
    for relative, markers in approval_neutral_sources.items():
        text = validation.read(relative)
        for marker in markers:
            if marker not in text:
                validation.error(relative, f"missing VOC-079 approval-neutral marker: {marker}")


def validate_voc082_policy_markers(validation: Validation) -> None:
    """Keep the active distinct-actor contract present and fail closed on regressions."""
    active_text: dict[str, str] = {}
    for relative, markers in VOC082_POLICY_MARKERS.items():
        text = validation.read(relative)
        active_text[relative] = text
        for name, marker in markers:
            if marker not in text:
                validation.error(relative, f"missing VOC-082 {name} policy marker")

    for relative in VOC082_ACTIVE_POLICY_PATHS:
        text = active_text[relative]
        for name, pattern in VOC082_UNSAFE_POLICY_PATTERNS:
            if pattern.search(text):
                validation.error(relative, f"prohibited VOC-082 {name} wording")


def validate_false_activation(validation: Validation) -> None:
    # AUTONOMOUS-RELEASE-AUTHORIZED-2026-08-08: protected-paths.yaml is now
    # legitimately authorized to say automatic_merge_allowed: true and
    # autonomous_production_release: enabled (see that file's own marker
    # comment and validate_ownership's authorization check above, which
    # already enforces that the marker and the four merge/release/deploy
    # fields move together). Excluding it here would make this a check with
    # no teeth if authorization is ever removed without also fixing this
    # file, so instead: only skip the "true"/"enabled" patterns for this one
    # file, and only when the marker is actually present - "Status: Activated"
    # stays banned everywhere unconditionally, since nothing in this
    # authorization concerns hosted-governance activation.
    policy_source = validation.read(".github/approved-policy/protected-paths.yaml")
    authorized = "AUTONOMOUS-RELEASE-AUTHORIZED-2026-08-08" in policy_source
    retired = "VOC-078-CONTROL-PLANE-RETIRED-2026-08-19" in policy_source
    paths = (
        ".github/approved-policy/protected-paths.yaml",
        "docs/governance/post-merge-activation-checklist.md",
        "specs/changes/VOC-001-repository-foundation/change.yaml",
    )
    for relative in paths:
        text = validation.read(relative)
        patterns = [r"(?im)^Status:\s*Activated\s*$"]
        if not (authorized and not retired and relative == ".github/approved-policy/protected-paths.yaml"):
            patterns += [r"automatic_merge(?:_allowed)?:\s*true", r"autonomous_production_release:\s*enabled"]
        for pattern in patterns:
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
    validate_automatic_merge_drafting(validation)
    validate_package(validation)
    validate_voc_002_package(validation)
    validate_voc_003_package(validation)
    validate_voc_004_package(validation)
    validate_doc_17_doc_18_adoption(validation)
    validate_a003_lifecycle(validation)
    validate_ownership(validation)
    validate_workflow(validation)
    validate_merge_eligibility(validation)
    validate_governance_language(validation)
    validate_voc082_policy_markers(validation)
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
