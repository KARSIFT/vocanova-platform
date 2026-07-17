from __future__ import annotations

import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
VALIDATOR = REPOSITORY_ROOT / "tooling/governance/validate_repository_foundation.py"


class RepositoryFoundationValidatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name) / "synthetic-repository"
        shutil.copytree(
            REPOSITORY_ROOT,
            self.root,
            ignore=shutil.ignore_patterns(".git", "__pycache__", "*.pyc"),
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def run_validator(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(VALIDATOR), "--repository-root", str(self.root)],
            check=False,
            capture_output=True,
            text=True,
            timeout=20,
        )

    def run_classifier(self, declared_risk: str) -> subprocess.CompletedProcess[str]:
        files = self.root / "changed-files.txt"
        body = self.root / "pr-body.md"
        files.write_text(".github/approved-policy/protected-paths.yaml\n", encoding="utf-8")
        body.write_text(f"Risk classification: {declared_risk}\n", encoding="utf-8")
        return subprocess.run(
            [
                "bash",
                "scripts/governance/classify-change-risk.sh",
                "--files-from",
                str(files),
                "--pr-body-file",
                str(body),
                "--require-declaration",
            ],
            cwd=self.root,
            check=False,
            capture_output=True,
            text=True,
            timeout=20,
        )

    def run_classifier_for_path(self, path: str, declared_risk: str) -> subprocess.CompletedProcess[str]:
        files = self.root / "changed-files.txt"
        body = self.root / "pr-body.md"
        files.write_text(f"{path}\n", encoding="utf-8")
        body.write_text(f"Risk classification: {declared_risk}\n", encoding="utf-8")
        return subprocess.run(
            [
                "bash",
                "scripts/governance/classify-change-risk.sh",
                "--files-from",
                str(files),
                "--pr-body-file",
                str(body),
                "--require-declaration",
            ],
            cwd=self.root,
            check=False,
            capture_output=True,
            text=True,
            timeout=20,
        )

    def assert_failure(self, marker: str) -> None:
        result = self.run_validator()
        self.assertEqual(1, result.returncode, result.stdout + result.stderr)
        self.assertIn(marker, result.stderr)

    def replace(self, relative: str, old: str, new: str) -> None:
        path = self.root / relative
        text = path.read_text(encoding="utf-8")
        self.assertIn(old, text)
        path.write_text(text.replace(old, new, 1), encoding="utf-8")

    def activate_a003_fixture(self) -> None:
        state_replacements = (
            ("authority_model: pre-a003", "authority_model: a003-active"),
            ("transition_stage: pre-merge-transition", "transition_stage: effectively-active"),
            ("formal_founder_approval_status: pending-exact-revision-github-evidence", "formal_founder_approval_status: approved-exact-revision"),
            ("technical_steward_migration_approval_status: pending-exact-revision-github-evidence", "technical_steward_migration_approval_status: approved-exact-revision-one-time"),
            ("independent_verification_status: pending-exact-revision-claude-evidence", "independent_verification_status: passed-exact-revision"),
            ("repository_adoption_status: pending", "repository_adoption_status: adopted"),
            ("effective_activation_status: inactive", "effective_activation_status: active"),
            ("approved_pr_head_sha: null", "approved_pr_head_sha: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
            ("adopted_develop_sha: null", "adopted_develop_sha: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
            ("post_merge_validation_status: not-run", "post_merge_validation_status: passed"),
            ("post_merge_validation_evidence: null", "post_merge_validation_evidence: github-actions-run-100"),
            ("activation_evidence: null", "activation_evidence: github-issue-comment-200"),
            ("canonical_lifecycle_sync_status: pending-post-activation", "canonical_lifecycle_sync_status: complete"),
            ("migration_approval_status: pending-one-time-use", "migration_approval_status: exhausted-non-reusable"),
            ("migration_approval_exhausted: false", "migration_approval_exhausted: true"),
            ("technical_steward_routine_authority_status: current-until-valid-activation", "technical_steward_routine_authority_status: historical-retired"),
            ("exceptional_human_review_mode: exceptional-only-after-valid-activation", "exceptional_human_review_mode: exceptional-only"),
        )
        for old, new in state_replacements:
            self.replace("docs/governance/a003-transition-state.yaml", old, new)
        metadata_replacements = (
            ("status: proposed", "status: approved"),
            ("formal_founder_approval_status: pending-exact-revision-github-evidence", "formal_founder_approval_status: approved-exact-revision-github-evidence"),
            ("repository_adoption_status: pending", "repository_adoption_status: adopted"),
            ("effective_activation_status: inactive", "effective_activation_status: active"),
            ("approved_at: null", "approved_at: 2026-07-18"),
            ("adopted_at: null", "adopted_at: 2026-07-18"),
            ("effective_at: null", "effective_at: 2026-07-18"),
            ("approval_evidence: null", "approval_evidence: github-pr-exact-revision"),
        )
        for old, new in metadata_replacements:
            self.replace(
                "docs/governance/amendments/A-003-governed-autonomous-engineering-authority.md",
                old,
                new,
            )

    def test_valid_repository_passes(self) -> None:
        result = self.run_validator()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("validation passed", result.stdout)

    def test_valid_evidence_backed_a003_activation_passes(self) -> None:
        self.activate_a003_fixture()
        result = self.run_validator()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_classifier_accepts_r4_for_protected_policy(self) -> None:
        result = self.run_classifier("R4")
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("Detected path-based risk floor: R4", result.stdout)

    def test_classifier_rejects_declaration_below_r4_floor(self) -> None:
        result = self.run_classifier("R3")
        self.assertEqual(1, result.returncode, result.stdout + result.stderr)
        self.assertIn("below the detected floor R4", result.stderr)

    def test_missing_required_root_file_fails(self) -> None:
        (self.root / "AGENTS.md").unlink()
        self.assert_failure("AGENTS.md")

    def test_incomplete_template_package_fails(self) -> None:
        (self.root / "specs/templates/change-package/tasks.md").unlink()
        self.assert_failure("must contain exactly nine files")

    def test_incomplete_voc_001_package_fails(self) -> None:
        (self.root / "specs/changes/VOC-001-repository-foundation/tasks.md").unlink()
        self.assert_failure("must contain exactly nine files")

    def test_incomplete_voc_002_package_fails(self) -> None:
        (self.root / "specs/changes/VOC-002-a003-governance-transition/tasks.md").unlink()
        self.assert_failure("must contain exactly nine files")

    def test_voc_002_classifier_floor_is_r4(self) -> None:
        result = self.run_classifier_for_path(
            "specs/changes/VOC-002-a003-governance-transition/README.md", "R4"
        )
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("Detected path-based risk floor: R4", result.stdout)

    def test_voc_002_classifier_rejects_r3(self) -> None:
        result = self.run_classifier_for_path(
            "specs/changes/VOC-002-a003-governance-transition/README.md", "R3"
        )
        self.assertEqual(1, result.returncode, result.stdout + result.stderr)
        self.assertIn("below the detected floor R4", result.stderr)

    def test_a003_frozen_body_change_fails(self) -> None:
        self.replace(
            "docs/governance/amendments/A-003-governed-autonomous-engineering-authority.md",
            "AI performs the work",
            "AI sometimes performs the work",
        )
        self.assert_failure("frozen A-003 substantive body checksum mismatch")

    def test_a003_premature_activation_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "effective_activation_status: inactive",
            "effective_activation_status: active",
        )
        self.assert_failure("active A-003 requires")

    def test_a003_missing_exact_revision_evidence_fails(self) -> None:
        self.replace(
            "docs/governance/amendments/A-003-governed-autonomous-engineering-authority.md",
            "effective_activation_status: inactive",
            "effective_activation_status: active",
        )
        self.assert_failure("active A-003 requires")

    def test_a003_migration_approval_reuse_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "migration_approval_status: pending-one-time-use",
            "migration_approval_status: reusable",
        )
        self.assert_failure("pending-one-time-use")

    def test_a003_permanent_ehr_layer_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "exceptional_human_review_mode: exceptional-only-after-valid-activation",
            "exceptional_human_review_mode: permanent-routine-approval",
        )
        self.assert_failure("exceptional-only-after-valid-activation")

    def test_a003_historical_steward_falsification_fails(self) -> None:
        self.replace(
            "docs/governance/technical-steward-appointment.md",
            "Appointed qualified human technical steward: `@m-e-h-r-d-a-a-d`",
            "Appointed qualified human technical steward: `@someone-else`",
        )
        self.assert_failure("historical evidence marker")

    def test_a003_routine_r3_human_approval_marker_removal_fails(self) -> None:
        self.replace(
            "docs/governance/approval-matrix.md",
            "No standing technical-steward approval; no founder approval merely because work is R3",
            "Standing technical-steward and founder approval required for every R3",
        )
        self.assert_failure("missing A-003 authority marker")

    def test_a003_rl2_false_activation_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "rl2_technical_activation: false",
            "rl2_technical_activation: true",
        )
        self.assert_failure("rl2_technical_activation must remain false")

    def test_a003_autonomous_production_enablement_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "autonomous_production_release: disabled",
            "autonomous_production_release: enabled",
        )
        self.assert_failure("autonomous production release must remain disabled")

    def test_a003_doc_17_adoption_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "doc_17_repository_adoption: false",
            "doc_17_repository_adoption: true",
        )
        self.assert_failure("doc_17_repository_adoption must remain false")

    def test_package_path_id_mismatch_fails(self) -> None:
        self.replace(
            "specs/changes/VOC-001-repository-foundation/change.yaml",
            "canonical_path: specs/changes/VOC-001-repository-foundation",
            "canonical_path: specs/changes/VOC-999-wrong",
        )
        self.assert_failure("canonical_path must equal")

    def test_duplicate_stable_identifier_fails(self) -> None:
        path = self.root / "specs/changes/VOC-001-repository-foundation/tasks.md"
        path.write_text(path.read_text(encoding="utf-8") + "\n## VOC-001-T01 — Duplicate\n", encoding="utf-8")
        self.assert_failure("duplicate stable identifier")

    def test_invalid_lifecycle_fails(self) -> None:
        self.replace(
            "specs/changes/VOC-001-repository-foundation/change.yaml",
            "status: implementing",
            "status: impossible",
        )
        self.assert_failure("status must equal")

    def test_invalid_risk_fails(self) -> None:
        self.replace(
            "specs/changes/VOC-001-repository-foundation/change.yaml",
            "risk: R4",
            "risk: R9",
        )
        self.assert_failure("risk must equal")

    def test_unsupported_yaml_construct_fails(self) -> None:
        path = self.root / "specs/changes/VOC-001-repository-foundation/change.yaml"
        path.write_text(path.read_text(encoding="utf-8") + "anchor: &unsafe value\n", encoding="utf-8")
        self.assert_failure("unsupported YAML construct")

    def test_duplicate_yaml_key_fails(self) -> None:
        path = self.root / "specs/changes/VOC-001-repository-foundation/change.yaml"
        path.write_text(path.read_text(encoding="utf-8") + "risk: R4\n", encoding="utf-8")
        self.assert_failure("duplicate YAML key 'risk'")

    def test_root_decisions_directory_fails(self) -> None:
        (self.root / "decisions").mkdir()
        self.assert_failure("root decision directory is prohibited")

    def test_uppercase_duplicate_pr_template_fails(self) -> None:
        (self.root / ".github/PULL_REQUEST_TEMPLATE.md").write_text("duplicate", encoding="utf-8")
        self.assert_failure("uppercase duplicate PR template")

    def test_missing_codeowners_protected_path_fails(self) -> None:
        self.replace(
            ".github/CODEOWNERS",
            "/tooling/governance/                       @m-e-h-r-d-a-a-d",
            "# removed tooling owner",
        )
        self.assert_failure("missing exact protected path owner")

    def test_invented_governance_team_fails(self) -> None:
        path = self.root / ".github/CODEOWNERS"
        path.write_text(path.read_text(encoding="utf-8") + "\n/example/ @KARSIFT/vocanova-governance\n", encoding="utf-8")
        self.assert_failure("invented or unverified governance team")

    def test_ai_or_bot_owner_fails(self) -> None:
        path = self.root / ".github/CODEOWNERS"
        path.write_text(path.read_text(encoding="utf-8") + "\n/example/ @claude-bot\n", encoding="utf-8")
        self.assert_failure("AI or bot identity")

    def test_workflow_write_permission_fails(self) -> None:
        self.replace(".github/workflows/repository-governance.yml", "contents: read", "contents: write")
        self.assert_failure("contents: read")

    def test_pull_request_target_fails(self) -> None:
        self.replace(".github/workflows/repository-governance.yml", "pull_request:", "pull_request_target:")
        self.assert_failure("pull_request_target")

    def test_path_filtered_workflow_fails(self) -> None:
        self.replace(
            ".github/workflows/repository-governance.yml",
            "  pull_request:\n    branches:",
            "  pull_request:\n    paths:\n      - docs/**\n    branches:",
        )
        self.assert_failure("paths:")

    def test_unpinned_external_action_fails(self) -> None:
        self.replace(
            ".github/workflows/repository-governance.yml",
            "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
            "actions/checkout@v4",
        )
        self.assert_failure("not pinned")

    def test_false_autonomous_activation_claim_fails(self) -> None:
        path = self.root / ".github/approved-policy/protected-paths.yaml"
        path.write_text(path.read_text(encoding="utf-8") + "automatic_merge: true\n", encoding="utf-8")
        self.assert_failure("false claim")

    def test_internal_error_returns_two_and_fails_closed(self) -> None:
        spec = importlib.util.spec_from_file_location("foundation_validator", VALIDATOR)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with mock.patch.object(module, "validate_repository", side_effect=RuntimeError("synthetic parser defect")):
            self.assertEqual(2, module.main(["--repository-root", str(self.root)]))


if __name__ == "__main__":
    unittest.main()
