from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
MODULE_DIR = ROOT / "tooling/governance/merge-eligibility"
FIXTURE = MODULE_DIR / "fixtures/eligible-r4.json"
BLOCKED_FIXTURE = MODULE_DIR / "fixtures/blocked-r4.json"
sys.path.insert(0, str(MODULE_DIR))

from evaluator import evaluate  # noqa: E402
from github_adapter import (  # noqa: E402
    AdapterError,
    BASE_REQUIRED_CHECKS,
    build_normalized_evidence,
    render_summary,
)


def fixture() -> dict[str, Any]:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


class MergeEligibilityEvaluatorTests(unittest.TestCase):
    def assert_blocked(self, evidence: dict[str, Any], code: str) -> None:
        result = evaluate(evidence)
        self.assertFalse(result["eligible"], result)
        self.assertEqual("blocked", result["decision"])
        self.assertIn(code, {reason["code"] for reason in result["reasons"]})

    def test_complete_r4_evidence_is_eligible(self) -> None:
        self.assertEqual(
            {"schema_version": 1, "eligible": True, "decision": "eligible", "reasons": []},
            evaluate(fixture()),
        )

    def test_committed_r4_opt_out_fixture_is_blocked(self) -> None:
        evidence = json.loads(BLOCKED_FIXTURE.read_text(encoding="utf-8"))
        self.assert_blocked(evidence, "package.opt_out")

    def test_r4_label_alone_does_not_change_eligibility(self) -> None:
        r4 = fixture()
        r3 = copy.deepcopy(r4)
        r3["risk"] = "R3"
        self.assertTrue(evaluate(r4)["eligible"])
        self.assertTrue(evaluate(r3)["eligible"])

        malformed_r3 = copy.deepcopy(r3)
        malformed_r3["risk_evidence"] = {}
        self.assert_blocked(malformed_r3, "risk_evidence.decision_record_invalid")

    def test_check_failures_fail_closed(self) -> None:
        missing = fixture()
        missing["checks"]["observed"] = missing["checks"]["observed"][1:]
        self.assert_blocked(missing, "checks.missing_validate")

        failed = fixture()
        failed["checks"]["observed"][0]["conclusion"] = "failure"
        self.assert_blocked(failed, "checks.failed_validate")

        incomplete = fixture()
        incomplete["checks"]["observed"][0]["status"] = "in_progress"
        incomplete["checks"]["observed"][0]["conclusion"] = None
        self.assert_blocked(incomplete, "checks.incomplete_validate")

    def test_role_separation_and_exact_revision_fail_closed(self) -> None:
        cases = {
            "review.self_authored": ("identity", "builder-agent"),
            "review.same_role": ("role", "implementer"),
            "review.stale": ("reviewed_sha", "b" * 40),
            "review.not_passing": ("verdict", "fail"),
            "review.blocking_findings": ("blocking_findings_resolved", False),
            "review.identity_missing": ("identity", ""),
        }
        for code, (key, value) in cases.items():
            with self.subTest(code=code):
                evidence = fixture()
                evidence["roles"]["reviewer"][key] = value
                self.assert_blocked(evidence, code)

        missing = fixture()
        missing["roles"]["reviewer"] = None
        self.assert_blocked(missing, "review.missing")

    def test_each_r4_artifact_is_required(self) -> None:
        for key in fixture()["risk_evidence"]:
            with self.subTest(key=key):
                evidence = fixture()
                evidence["risk_evidence"][key] = False
                self.assert_blocked(evidence, f"r4_evidence.{key}_missing")

    def test_ehr_package_risk_and_action_holds_fail_closed(self) -> None:
        active_ehr = fixture()
        active_ehr["ehr"]["active"] = True
        self.assert_blocked(active_ehr, "ehr.active")

        opt_out = fixture()
        opt_out["package"]["automatic_merge_allowed"] = False
        self.assert_blocked(opt_out, "package.opt_out")

        unknown_risk = fixture()
        unknown_risk["risk"] = "R9"
        self.assert_blocked(unknown_risk, "risk.invalid")

        unmet = fixture()
        unmet["action_authority"] = [
            {"name": "production access", "required": True, "satisfied": False}
        ]
        self.assert_blocked(unmet, "action_authority.unmet_0")

        unknown_field = fixture()
        unknown_field["founder_approval"] = True
        self.assert_blocked(unknown_field, "schema.fields_unknown")

    def test_schema_is_versioned_json_and_evaluator_has_no_network_boundary(self) -> None:
        schema = json.loads((MODULE_DIR / "schema-v1.json").read_text(encoding="utf-8"))
        self.assertEqual(1, schema["properties"]["schema_version"]["const"])
        source = (MODULE_DIR / "evaluator.py").read_text(encoding="utf-8")
        for prohibited in ("urllib", "requests", "http.client", "subprocess", "GITHUB_TOKEN"):
            self.assertNotIn(prohibited, source)

    def test_additional_malformed_evidence_paths_fail_closed(self) -> None:
        cases: list[tuple[str, Any, str]] = []

        wrong_version = fixture()
        wrong_version["schema_version"] = 2
        cases.append(("wrong schema", wrong_version, "schema.unsupported"))

        missing_field = fixture()
        del missing_field["ehr"]
        cases.append(("missing field", missing_field, "schema.fields_missing"))

        missing_checks = fixture()
        missing_checks["checks"] = None
        cases.append(("missing checks", missing_checks, "checks.missing"))

        stale_check = fixture()
        stale_check["checks"]["observed"][0]["head_sha"] = "b" * 40
        cases.append(("stale check", stale_check, "checks.stale_validate"))

        missing_builder = fixture()
        missing_builder["roles"]["builder"] = None
        cases.append(("missing builder", missing_builder, "builder.missing"))

        for name, evidence, code in cases:
            with self.subTest(name=name):
                self.assert_blocked(evidence, code)


class FakeReadClient:
    def __init__(
        self,
        checks: list[dict[str, Any]],
        quality: bool = False,
        comment_body: str | None = None,
        inline_comment: dict[str, Any] | None = None,
        formal_review: dict[str, Any] | None = None,
    ) -> None:
        self.checks = checks
        self.quality = quality
        self.comment_body = comment_body
        self.inline_comment = inline_comment
        self.formal_review = formal_review
        self.calls: list[str] = []

    def get(self, endpoint: str) -> Any:
        self.calls.append(endpoint)
        if "/files?" in endpoint:
            filename = "apps/web/src/example.ts" if self.quality else "docs/example.md"
            return [{"filename": filename}]
        if "/reviews?" in endpoint:
            return [self.formal_review or {"id": 101, "state": "APPROVED"}]
        if "/pulls/" in endpoint and "/comments?" in endpoint:
            return [self.inline_comment] if self.inline_comment else []
        if "/comments?" in endpoint:
            return [
                {
                    "id": 102,
                    "html_url": "https://github.com/KARSIFT/vocanova-platform/pull/79#issuecomment-example",
                    "body": self.comment_body or ("Exact SHA " + "a" * 40 + "\n**Verdict:** **PASS**"),
                }
            ]
        if "/check-runs?" in endpoint:
            return {"check_runs": self.checks}
        raise AssertionError(f"unexpected GET: {endpoint}")


class GitHubAdapterTests(unittest.TestCase):
    maxDiff = None

    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        package = self.root / "specs/changes/VOC-079-r4-approval-neutral"
        package.mkdir(parents=True)
        (package / "change.yaml").write_text(
            "schema_version: 1\nid: VOC-079\nrisk: R4\nautomatic_merge_allowed: true\n",
            encoding="utf-8",
        )
        self.head = "a" * 40
        roles = fixture()
        block = {
            "builder": roles["roles"]["builder"],
            "reviewer": roles["roles"]["reviewer"],
            "risk_evidence": roles["risk_evidence"],
            "ehr": roles["ehr"],
            "action_authority": roles["action_authority"],
        }
        self.body = (
            "- Change-package status and canonical path: adopted; "
            "`specs/changes/VOC-079-r4-approval-neutral`\n"
            "Risk classification: R4\n\n"
            "<!-- merge-eligibility-evidence-v1\n"
            f"{json.dumps(block)}\n"
            "-->\n"
        )
        self.event = {
            "number": 80,
            "repository": {"full_name": "KARSIFT/vocanova-platform"},
            "pull_request": {
                "body": self.body,
                "head": {"sha": self.head},
                "user": {"login": "example-author"},
            },
        }

    def tearDown(self) -> None:
        self.temp.cleanup()

    def checks(self, names: tuple[str, ...] = BASE_REQUIRED_CHECKS) -> list[dict[str, Any]]:
        return [
            {
                "id": index,
                "name": name,
                "status": "completed",
                "conclusion": "success",
                "head_sha": self.head,
            }
            for index, name in enumerate(names, 1)
        ]

    def test_adapter_normalizes_live_reads_to_same_eligible_decision(self) -> None:
        client = FakeReadClient(self.checks())
        evidence, review_count = build_normalized_evidence(
            self.event, self.root, client, wait_seconds=0
        )
        result = evaluate(evidence)
        self.assertTrue(result["eligible"], result)
        self.assertEqual(2, review_count)
        self.assertEqual(list(BASE_REQUIRED_CHECKS), evidence["checks"]["required"])
        self.assertTrue(all(call.startswith("/repos/") for call in client.calls))
        summary = render_summary(evidence, result, review_count)
        self.assertIn("**Decision:** `eligible`", summary)
        self.assertIn(self.head, summary)

    def test_adapter_requires_quality_checks_for_quality_paths(self) -> None:
        names = BASE_REQUIRED_CHECKS + ("accessibility", "lighthouse")
        evidence, _ = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(self.checks(names), quality=True),
        )
        self.assertEqual(list(names), evidence["checks"]["required"])
        self.assertTrue(evaluate(evidence)["eligible"])

    def test_missing_live_check_is_a_concrete_block(self) -> None:
        evidence, _ = build_normalized_evidence(
            self.event, self.root, FakeReadClient(self.checks()[1:])
        )
        result = evaluate(evidence)
        self.assertFalse(result["eligible"])
        self.assertIn("checks.missing_validate", {reason["code"] for reason in result["reasons"]})

    def test_declared_review_must_bind_to_live_exact_sha_pass(self) -> None:
        evidence, _ = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(self.checks(), comment_body="Verdict: PASS for stale revision"),
        )
        result = evaluate(evidence)
        self.assertFalse(result["eligible"])
        self.assertIn("review.evidence_missing", {reason["code"] for reason in result["reasons"]})

        misleading = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(
                self.checks(),
                comment_body=("Exact SHA " + self.head + "\nVerdict: FAIL; an older run said PASS"),
            ),
        )[0]
        self.assertIn(
            "review.evidence_missing",
            {reason["code"] for reason in evaluate(misleading)["reasons"]},
        )

        contradictory = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(
                self.checks(),
                comment_body=("Exact SHA " + self.head + "\nVerdict: PASS\nVerdict: FAIL"),
            ),
        )[0]
        self.assertIn(
            "review.evidence_missing",
            {reason["code"] for reason in evaluate(contradictory)["reasons"]},
        )

        formal_url = "https://github.com/KARSIFT/vocanova-platform/pull/79#pullrequestreview-456"
        self.event["pull_request"]["body"] = self.body.replace(
            "https://github.com/KARSIFT/vocanova-platform/pull/79#issuecomment-example",
            formal_url,
        )
        dismissed = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(
                self.checks(),
                formal_review={
                    "html_url": formal_url,
                    "commit_id": self.head,
                    "state": "DISMISSED",
                    "body": "Verdict: PASS",
                },
            ),
        )[0]
        self.assertIn(
            "review.evidence_missing",
            {reason["code"] for reason in evaluate(dismissed)["reasons"]},
        )

        changes_requested = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(
                self.checks(),
                formal_review={
                    "html_url": formal_url,
                    "commit_id": self.head,
                    "state": "CHANGES_REQUESTED",
                    "body": "Verdict: PASS",
                },
            ),
        )[0]
        self.assertIn(
            "review.evidence_missing",
            {reason["code"] for reason in evaluate(changes_requested)["reasons"]},
        )

        self.event["pull_request"]["body"] = self.body
        embedded_sha = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(
                self.checks(),
                comment_body=("Exact SHA f" + self.head + "a\nVerdict: PASS"),
            ),
        )[0]
        self.assertIn(
            "review.evidence_missing",
            {reason["code"] for reason in evaluate(embedded_sha)["reasons"]},
        )

    def test_inline_review_comment_can_bind_exact_sha_pass(self) -> None:
        inline_url = "https://github.com/KARSIFT/vocanova-platform/pull/79#discussion_r123"
        self.event["pull_request"]["body"] = self.body.replace(
            "https://github.com/KARSIFT/vocanova-platform/pull/79#issuecomment-example",
            inline_url,
        )
        evidence, _ = build_normalized_evidence(
            self.event,
            self.root,
            FakeReadClient(
                self.checks(),
                inline_comment={
                    "html_url": inline_url,
                    "commit_id": self.head,
                    "body": "Verdict: PASS",
                },
            ),
        )
        self.assertTrue(evaluate(evidence)["eligible"])

    def test_declared_risk_below_package_floor_fails_closed(self) -> None:
        self.event["pull_request"]["body"] = self.body.replace(
            "Risk classification: R4", "Risk classification: R3"
        )
        with self.assertRaisesRegex(AdapterError, "below package risk floor"):
            build_normalized_evidence(self.event, self.root, FakeReadClient(self.checks()))

    def test_declared_risk_may_raise_package_floor(self) -> None:
        package = self.root / "specs/changes/VOC-079-r4-approval-neutral/change.yaml"
        package.write_text(
            package.read_text(encoding="utf-8").replace("risk: R4", "risk: R3"),
            encoding="utf-8",
        )
        evidence, _ = build_normalized_evidence(
            self.event, self.root, FakeReadClient(self.checks())
        )
        self.assertEqual("R4", evidence["risk"])
        self.assertTrue(evaluate(evidence)["eligible"])

    def test_risk_line_accepts_classifier_whitespace_and_rejects_duplicates(self) -> None:
        self.event["pull_request"]["body"] = self.body.replace(
            "Risk classification: R4", "  Risk classification: R4"
        )
        evidence, _ = build_normalized_evidence(
            self.event, self.root, FakeReadClient(self.checks())
        )
        self.assertEqual("R4", evidence["risk"])

        self.event["pull_request"]["body"] += "\nRisk classification: R4\n"
        with self.assertRaisesRegex(AdapterError, "one plain Risk classification"):
            build_normalized_evidence(self.event, self.root, FakeReadClient(self.checks()))

    def test_unfilled_risk_template_is_rejected(self) -> None:
        self.event["pull_request"]["body"] = self.body.replace(
            "Risk classification: R4",
            "Risk classification: <!-- Replace with exactly R0, R1, R2, R3, or R4 -->",
        )
        with self.assertRaisesRegex(AdapterError, "Risk classification"):
            build_normalized_evidence(self.event, self.root, FakeReadClient(self.checks()))

    def test_package_boolean_case_is_normalized(self) -> None:
        package = self.root / "specs/changes/VOC-079-r4-approval-neutral/change.yaml"
        package.write_text(
            package.read_text(encoding="utf-8").replace(
                "automatic_merge_allowed: true", "automatic_merge_allowed: True"
            ),
            encoding="utf-8",
        )
        evidence, _ = build_normalized_evidence(
            self.event, self.root, FakeReadClient(self.checks())
        )
        self.assertTrue(evaluate(evidence)["eligible"])

    def test_pr_text_is_data_not_shell_source(self) -> None:
        sentinel = self.root / "SHOULD_NOT_EXIST"
        self.event["pull_request"]["body"] = self.body.replace(
            '"identity": "builder-agent"',
            f'"identity": "$(touch {sentinel})"',
        )
        evidence, _ = build_normalized_evidence(
            self.event, self.root, FakeReadClient(self.checks())
        )
        self.assertIn("$(touch", evidence["roles"]["builder"]["identity"])
        self.assertFalse(sentinel.exists())

    def test_adapter_source_exposes_only_get_and_no_process_launcher(self) -> None:
        source = (MODULE_DIR / "github_adapter.py").read_text(encoding="utf-8")
        self.assertIn('method="GET"', source)
        for prohibited in ('method="POST"', 'method="PATCH"', 'method="PUT"', 'method="DELETE"', "subprocess", "os.system"):
            self.assertNotIn(prohibited, source)


if __name__ == "__main__":
    unittest.main()
