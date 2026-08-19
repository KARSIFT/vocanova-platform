#!/usr/bin/env python3
"""Read GitHub PR evidence, normalize it, and report merge eligibility."""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Callable

from evaluator import evaluate

API_ROOT = "https://api.github.com"
PACKAGE_PATH = re.compile(r"specs/changes/VOC-[0-9]{3}-[a-z0-9-]+")
SHA = re.compile(r"[0-9a-f]{40}")
EVIDENCE_BLOCK = re.compile(
    r"<!--\s*merge-eligibility-evidence-v1\s*\n(?P<payload>.*?)\n\s*-->",
    re.DOTALL,
)
PASS_VERDICT = re.compile(
    r"^\s*(?:[-*]\s*)?\**verdict\**\s*:\**\s*\**PASS\b",
    re.IGNORECASE | re.MULTILINE,
)
FAIL_VERDICT = re.compile(
    r"^\s*(?:[-*]\s*)?\**verdict\**\s*:\**\s*\**FAIL\b",
    re.IGNORECASE | re.MULTILINE,
)
BASE_REQUIRED_CHECKS = (
    "validate",
    "structure",
    "changed-path risk",
    "dependency audit",
    "secret scan",
)
QUALITY_REQUIRED_CHECKS = ("accessibility", "lighthouse")
RISK_RANK = {f"R{level}": level for level in range(5)}


class AdapterError(RuntimeError):
    """A fail-closed error while collecting or normalizing live evidence."""


class GitHubReadClient:
    """Minimal GitHub client whose only operation is an authenticated GET."""

    def __init__(self, token: str, api_root: str = API_ROOT) -> None:
        if not token:
            raise AdapterError("GITHUB_TOKEN is required")
        self._token = token
        self._api_root = api_root.rstrip("/")

    def get(self, endpoint: str) -> Any:
        if not endpoint.startswith("/"):
            raise AdapterError("GitHub endpoint must be repository-relative")
        request = urllib.request.Request(
            f"{self._api_root}{endpoint}",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {self._token}",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "vocanova-read-only-merge-eligibility",
            },
            method="GET",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise AdapterError(f"GitHub read failed for {endpoint}: {exc}") from exc


def build_normalized_evidence(
    event: dict[str, Any],
    repository_root: Path,
    client: GitHubReadClient,
    wait_seconds: int = 0,
    sleep: Callable[[float], None] = time.sleep,
) -> tuple[dict[str, Any], int]:
    pull_request = event.get("pull_request")
    repository = event.get("repository")
    if not isinstance(pull_request, dict) or not isinstance(repository, dict):
        raise AdapterError("adapter requires a pull_request event")
    repo = repository.get("full_name")
    number = event.get("number")
    head = pull_request.get("head")
    author = pull_request.get("user")
    body = pull_request.get("body") or ""
    if not isinstance(repo, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
        raise AdapterError("repository.full_name is invalid")
    if not isinstance(number, int) or number < 1:
        raise AdapterError("pull-request number is invalid")
    if not isinstance(head, dict) or not isinstance(author, dict):
        raise AdapterError("pull-request head or author is missing")
    head_sha = head.get("sha")
    author_login = author.get("login")
    if not isinstance(head_sha, str) or not SHA.fullmatch(head_sha):
        raise AdapterError("pull-request head SHA is invalid")
    if not isinstance(author_login, str) or not author_login:
        raise AdapterError("pull-request author is missing")
    if not isinstance(body, str):
        raise AdapterError("pull-request body must be text")

    package_path = _package_path(body)
    package_values = _read_package(repository_root, package_path)
    declared_risk = _declared_risk(body)
    package_risk = package_values.get("risk")
    if package_risk not in RISK_RANK:
        raise AdapterError(f"package risk {package_risk!r} is unknown or unparseable")
    if RISK_RANK[declared_risk] < RISK_RANK[package_risk]:
        raise AdapterError(
            f"declared risk {declared_risk!r} is below package risk floor {package_risk!r}"
        )
    role_evidence = _role_evidence(body)

    encoded_repo = urllib.parse.quote(repo, safe="/")
    files = _read_pages(client, f"/repos/{encoded_repo}/pulls/{number}/files")
    reviews = _read_pages(client, f"/repos/{encoded_repo}/pulls/{number}/reviews")
    comments = _read_pages(client, f"/repos/{encoded_repo}/issues/{number}/comments")
    inline_comments = _read_pages(client, f"/repos/{encoded_repo}/pulls/{number}/comments")
    _bind_review_to_live_record(
        role_evidence,
        reviews,
        comments,
        inline_comments,
        head_sha,
    )
    required = list(BASE_REQUIRED_CHECKS)
    if any(_needs_quality(item.get("filename")) for item in files if isinstance(item, dict)):
        required.extend(QUALITY_REQUIRED_CHECKS)
    observed = _wait_for_checks(
        client,
        encoded_repo,
        head_sha,
        required,
        wait_seconds,
        sleep,
    )

    normalized = {
        "schema_version": 1,
        "pull_request": {
            "number": number,
            "head_sha": head_sha,
            "author": author_login,
        },
        "risk": declared_risk,
        "package": {
            "path": package_path,
            "automatic_merge_allowed": package_values.get("automatic_merge_allowed"),
        },
        "checks": {"required": required, "observed": observed},
        "roles": {
            "builder": role_evidence.get("builder"),
            "reviewer": role_evidence.get("reviewer"),
        },
        "risk_evidence": role_evidence.get("risk_evidence"),
        "ehr": role_evidence.get("ehr"),
        "action_authority": role_evidence.get("action_authority"),
    }
    return normalized, len(reviews) + len(comments) + len(inline_comments)


def _package_path(body: str) -> str:
    matches = PACKAGE_PATH.findall(body)
    unique = list(dict.fromkeys(matches))
    if len(unique) != 1:
        raise AdapterError("PR body must identify exactly one canonical change-package path")
    return unique[0]


def _declared_risk(body: str) -> str:
    matches = re.findall(
        r"^\s*Risk classification:\s*(R[0-9]+)\s*$", body, re.MULTILINE
    )
    if len(matches) != 1:
        raise AdapterError("PR body must contain one plain Risk classification value")
    declared = matches[0]
    if declared not in RISK_RANK:
        raise AdapterError(f"declared risk {declared!r} is unknown or unparseable")
    return declared


def _role_evidence(body: str) -> dict[str, Any]:
    matches = list(EVIDENCE_BLOCK.finditer(body))
    if len(matches) != 1:
        raise AdapterError("PR body must contain exactly one merge-eligibility evidence v1 block")
    try:
        payload = json.loads(matches[0].group("payload"))
    except json.JSONDecodeError as exc:
        raise AdapterError(f"merge-eligibility evidence block is invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise AdapterError("merge-eligibility evidence block must be a JSON object")
    return payload


def _read_package(repository_root: Path, relative: str) -> dict[str, Any]:
    root = repository_root.resolve()
    package = (root / relative / "change.yaml").resolve()
    try:
        package.relative_to(root)
    except ValueError as exc:
        raise AdapterError("change-package path escapes repository root") from exc
    try:
        text = package.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise AdapterError(f"cannot read package metadata: {exc}") from exc
    values: dict[str, Any] = {}
    for raw in text.splitlines():
        if not raw or raw[0].isspace() or raw.lstrip().startswith("#") or ":" not in raw:
            continue
        key, value = raw.split(":", 1)
        value = value.split("#", 1)[0].strip().strip("\"'")
        if key in {"risk", "automatic_merge_allowed"}:
            if key in values:
                raise AdapterError(f"duplicate top-level package key: {key}")
            normalized = value.casefold()
            if normalized == "true":
                values[key] = True
            elif normalized == "false":
                values[key] = False
            else:
                values[key] = value
    if "risk" not in values or "automatic_merge_allowed" not in values:
        raise AdapterError("package is missing risk or automatic_merge_allowed")
    return values


def _read_pages(client: GitHubReadClient, endpoint: str) -> list[Any]:
    combined: list[Any] = []
    for page in range(1, 11):
        separator = "&" if "?" in endpoint else "?"
        result = client.get(f"{endpoint}{separator}per_page=100&page={page}")
        if not isinstance(result, list):
            raise AdapterError(f"GitHub list endpoint returned a non-array: {endpoint}")
        combined.extend(result)
        if len(result) < 100:
            return combined
    raise AdapterError(f"GitHub list endpoint exceeds the supported 1000 records: {endpoint}")


def _bind_review_to_live_record(
    role_evidence: dict[str, Any],
    reviews: list[Any],
    comments: list[Any],
    inline_comments: list[Any],
    head_sha: str,
) -> None:
    reviewer = role_evidence.get("reviewer")
    if not isinstance(reviewer, dict):
        return
    evidence_url = reviewer.get("evidence_url")
    matched = False
    for review in reviews:
        if not isinstance(review, dict) or review.get("html_url") != evidence_url:
            continue
        body = review.get("body") or ""
        matched = (
            review.get("commit_id") == head_sha
            and review.get("state") != "DISMISSED"
            and isinstance(body, str)
            and FAIL_VERDICT.search(body) is None
            and (
                review.get("state") == "APPROVED"
                or (
                    review.get("state") == "COMMENTED"
                    and PASS_VERDICT.search(body) is not None
                )
            )
        )
        break
    if not matched:
        for comment in comments:
            if not isinstance(comment, dict) or comment.get("html_url") != evidence_url:
                continue
            body = comment.get("body") or ""
            matched = (
                isinstance(body, str)
                and _contains_exact_sha(body, head_sha)
                and PASS_VERDICT.search(body) is not None
                and FAIL_VERDICT.search(body) is None
            )
            break
    if not matched:
        for comment in inline_comments:
            if not isinstance(comment, dict) or comment.get("html_url") != evidence_url:
                continue
            body = comment.get("body") or ""
            matched = (
                isinstance(body, str)
                and comment.get("commit_id") == head_sha
                and PASS_VERDICT.search(body) is not None
                and FAIL_VERDICT.search(body) is None
            )
            break
    if not matched:
        reviewer["evidence_url"] = ""


def _contains_exact_sha(body: str, head_sha: str) -> bool:
    return re.search(
        rf"(?<![0-9a-f]){re.escape(head_sha)}(?![0-9a-f])",
        body,
        re.IGNORECASE,
    ) is not None


def _needs_quality(filename: Any) -> bool:
    if not isinstance(filename, str):
        return False
    return (
        filename.startswith("apps/web/")
        or filename.startswith("packages/")
        or filename
        in {
            "package.json",
            "pnpm-lock.yaml",
            "pnpm-workspace.yaml",
            ".github/workflows/quality.yml",
        }
    )


def _wait_for_checks(
    client: GitHubReadClient,
    repo: str,
    head_sha: str,
    required: list[str],
    wait_seconds: int,
    sleep: Callable[[float], None],
) -> list[dict[str, Any]]:
    deadline = time.monotonic() + max(0, wait_seconds)
    while True:
        runs = _read_check_runs(client, repo, head_sha)
        latest: dict[str, dict[str, Any]] = {}
        for index, run in enumerate(runs):
            if not isinstance(run, dict) or not isinstance(run.get("name"), str):
                continue
            candidate = dict(run)
            candidate["_order"] = candidate.get("id", index)
            current = latest.get(candidate["name"])
            if current is None or candidate["_order"] > current["_order"]:
                latest[candidate["name"]] = candidate
        observed = [
            {
                "name": name,
                "status": latest[name].get("status"),
                "conclusion": latest[name].get("conclusion"),
                "head_sha": latest[name].get("head_sha"),
            }
            for name in required
            if name in latest
        ]
        terminal = {
            check["name"]
            for check in observed
            if check["status"] == "completed"
        }
        if set(required) <= terminal or time.monotonic() >= deadline:
            return observed
        sleep(min(15, max(0, deadline - time.monotonic())))


def _read_check_runs(client: GitHubReadClient, repo: str, head_sha: str) -> list[Any]:
    combined: list[Any] = []
    for page in range(1, 11):
        payload = client.get(
            f"/repos/{repo}/commits/{head_sha}/check-runs?per_page=100&page={page}"
        )
        runs = payload.get("check_runs") if isinstance(payload, dict) else None
        if not isinstance(runs, list):
            raise AdapterError("GitHub check-runs endpoint returned malformed data")
        combined.extend(runs)
        if len(runs) < 100:
            return combined
    raise AdapterError("GitHub check-runs endpoint exceeds the supported 1000 records")


def render_summary(
    evidence: dict[str, Any], result: dict[str, Any], review_count: int
) -> str:
    safe = lambda value: html.escape(str(value).replace("\n", " "))
    lines = [
        "## Read-only merge eligibility",
        "",
        f"**Decision:** `{safe(result['decision'])}`",
        "",
        f"- Evidence schema: `{safe(evidence['schema_version'])}`",
        f"- Pull request: `#{safe(evidence['pull_request']['number'])}`",
        f"- Exact head SHA: `{safe(evidence['pull_request']['head_sha'])}`",
        f"- Risk: `{safe(evidence['risk'])}`",
        f"- Package: `{safe(evidence['package']['path'])}`",
        f"- GitHub review records read: `{review_count}`",
        "",
    ]
    if result["eligible"]:
        lines.append("All normalized evidence gates are complete. This job does not merge or write to GitHub.")
    else:
        lines.extend(["Concrete blocking reasons:", ""])
        for reason in result["reasons"]:
            lines.append(f"- `{safe(reason['code'])}` — {safe(reason['message'])}")
        lines.extend(
            [
                "",
                "A blocked decision is reported as data; it does not make this read-only reporting job an executor.",
            ]
        )
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repository-root", type=Path, required=True)
    parser.add_argument("--event-path", type=Path, required=True)
    parser.add_argument("--summary-path", type=Path, required=True)
    parser.add_argument("--wait-seconds", type=int, default=0)
    args = parser.parse_args(argv)
    try:
        event = json.loads(args.event_path.read_text(encoding="utf-8"))
        client = GitHubReadClient(os.environ.get("GITHUB_TOKEN", ""))
        evidence, review_count = build_normalized_evidence(
            event,
            args.repository_root,
            client,
            wait_seconds=args.wait_seconds,
        )
        result = evaluate(evidence)
        args.summary_path.write_text(render_summary(evidence, result, review_count), encoding="utf-8")
        print(json.dumps(result, sort_keys=True))
        return 0
    except (AdapterError, OSError, UnicodeError, json.JSONDecodeError) as exc:
        message = f"merge-eligibility adapter failed closed: {exc}"
        try:
            args.summary_path.write_text(f"## Read-only merge eligibility\n\n**Adapter error:** {html.escape(message)}\n", encoding="utf-8")
        except OSError:
            pass
        print(message, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
