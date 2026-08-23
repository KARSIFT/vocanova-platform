from __future__ import annotations

import importlib.util
import json
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
            ignore=shutil.ignore_patterns(
                ".git",
                ".next",
                "node_modules",
                "dist",
                "coverage",
                "__pycache__",
                "*.pyc",
            ),
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

    def test_valid_repository_passes(self) -> None:
        result = self.run_validator()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("validation passed", result.stdout)

    def test_valid_evidence_backed_a003_active_state_passes(self) -> None:
        result = self.run_validator()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_automatic_merge_drafting_matrix_covers_r0_through_r4(self) -> None:
        spec = importlib.util.spec_from_file_location("foundation_validator_matrix", VALIDATOR)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for level in range(5):
            risk = f"R{level}"
            with self.subTest(risk=risk, case="default"):
                self.assertIsNone(
                    module.automatic_merge_drafting_error(
                        {"id": "VOC-080", "risk": risk, "automatic_merge_allowed": True}
                    )
                )
            with self.subTest(risk=risk, case="reasoned hold"):
                self.assertIsNone(
                    module.automatic_merge_drafting_error(
                        {
                            "id": "VOC-080",
                            "risk": risk,
                            "automatic_merge_allowed": False,
                            "automatic_merge_hold_reason": "Named package-local merge window.",
                        }
                    )
                )
            with self.subTest(risk=risk, case="unreasoned hold"):
                self.assertIn(
                    "requires automatic_merge_hold_reason",
                    module.automatic_merge_drafting_error(
                        {"id": "VOC-080", "risk": risk, "automatic_merge_allowed": False}
                    ),
                )

    def test_future_package_unreasoned_automatic_merge_hold_fails(self) -> None:
        package = self.root / "specs/changes/VOC-080-policy-fixture"
        package.mkdir()
        (package / "change.yaml").write_text(
            "id: VOC-080\nrisk: R4\nautomatic_merge_allowed: false\n",
            encoding="utf-8",
        )
        self.assert_failure("automatic_merge_allowed false requires automatic_merge_hold_reason")

    def test_future_package_reasoned_automatic_merge_hold_passes(self) -> None:
        package = self.root / "specs/changes/VOC-080-policy-fixture"
        package.mkdir()
        (package / "change.yaml").write_text(
            "id: VOC-080\nrisk: R4\nautomatic_merge_allowed: false\n"
            "automatic_merge_hold_reason: Named package-local merge window.\n",
            encoding="utf-8",
        )
        result = self.run_validator()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_future_package_placeholder_automatic_merge_hold_fails(self) -> None:
        package = self.root / "specs/changes/VOC-080-policy-fixture"
        package.mkdir()
        (package / "change.yaml").write_text(
            "id: VOC-080\nrisk: R2\nautomatic_merge_allowed: false\n"
            "automatic_merge_hold_reason: TBD\n",
            encoding="utf-8",
        )
        self.assert_failure("must be a non-placeholder package-local rationale")

    def test_automatic_merge_example_matrix_requires_r0_through_r4(self) -> None:
        path = self.root / "specs/templates/change-package/examples/automatic-merge-drafting.json"
        matrix = json.loads(path.read_text(encoding="utf-8"))
        matrix["cases"] = [case for case in matrix["cases"] if case["name"] != "r4-default"]
        path.write_text(json.dumps(matrix), encoding="utf-8")
        self.assert_failure("default examples must cover R0-R4")

    def test_voc079_automatic_merge_transition_marker_is_required(self) -> None:
        self.replace(
            "specs/changes/VOC-079-r4-approval-neutral/change.yaml",
            "must not be reused as precedent after adoption",
            "marker removed for test",
        )
        self.assert_failure("missing VOC-079 transition-exception marker")

    def test_voc079_automatic_merge_transition_exception_stays_r4(self) -> None:
        self.replace(
            "specs/changes/VOC-079-r4-approval-neutral/change.yaml",
            "risk: R4",
            "risk: R3",
        )
        self.assert_failure("must preserve its pre-transition R4 false exception")

    def test_automatic_merge_cross_document_rule_is_required(self) -> None:
        self.replace(
            "AGENTS.md",
            "R0, R1, R2, R3, and R4 all default to",
            "Only lower risk classes default to",
        )
        self.assert_failure("missing automatic-merge drafting rule marker")

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

    def test_incomplete_voc_003_package_fails(self) -> None:
        (self.root / "specs/changes/VOC-003-a003-lifecycle-sync/tasks.md").unlink()
        self.assert_failure("must contain exactly nine files")

    def test_incomplete_voc_004_package_fails(self) -> None:
        (self.root / "specs/changes/VOC-004-canonical-adoption-doc-17-doc-18/tasks.md").unlink()
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

    def test_voc_003_classifier_floor_is_r4(self) -> None:
        result = self.run_classifier_for_path(
            "specs/changes/VOC-003-a003-lifecycle-sync/README.md", "R4"
        )
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("Detected path-based risk floor: R4", result.stdout)

    def test_voc_004_classifier_floor_is_r4(self) -> None:
        result = self.run_classifier_for_path(
            "specs/changes/VOC-004-canonical-adoption-doc-17-doc-18/README.md", "R4"
        )
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("Detected path-based risk floor: R4", result.stdout)

    def test_voc_004_classifier_rejects_r3(self) -> None:
        result = self.run_classifier_for_path(
            "docs/archive/17-autonomous-development-architecture.md", "R3"
        )
        self.assertEqual(1, result.returncode, result.stdout + result.stderr)
        self.assertIn("below the detected floor R4", result.stderr)

    def test_doc16_folded_amendment_evidence_removal_fails(self) -> None:
        # DOC-16 v2.0 folds the former standalone A-002/A-003/A-004 amendment
        # documents into itself and preserves their approval evidence in its own
        # "Amendment history" section instead of a separate frozen-checksum file
        # per amendment (see validate_a003_lifecycle). Losing one of those exact
        # evidence strings - here, A-003's effective-activation comment URL -
        # must still fail validation, the same protection the old whole-body
        # checksum provided before consolidation.
        self.replace(
            "docs/governance/16-autonomous-development-operating-model.md",
            "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622",
            "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-0000000000",
        )
        self.assert_failure("missing folded amendment evidence marker")

    def test_a003_authority_rollback_without_governed_record_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "authority_model: a003-active",
            "authority_model: pre-a003",
        )
        self.assert_failure("active A-003 requires")

    def test_a003_missing_approved_pr_head_sha_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "approved_pr_head_sha: c858ebff3d97da88fea830bc32a74f69f59a9ad2",
            "approved_pr_head_sha: null",
        )
        self.assert_failure("full approved_pr_head_sha")

    def test_a003_missing_adopted_develop_sha_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "adopted_develop_sha: 9d5b4bc1d4a72e313b013047601265ee837c34f2",
            "adopted_develop_sha: null",
        )
        self.assert_failure("full adopted_develop_sha")

    def test_a003_conflated_revision_shas_fail(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "adopted_develop_sha: 9d5b4bc1d4a72e313b013047601265ee837c34f2",
            "adopted_develop_sha: c858ebff3d97da88fea830bc32a74f69f59a9ad2",
        )
        self.assert_failure("must be distinct records")

    def test_a003_missing_activation_evidence_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            'activation_evidence: "https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622"',
            "activation_evidence: null",
        )
        self.assert_failure("exact activation_evidence")

    def test_a003_incomplete_post_merge_validation_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "post_merge_validation_status: passed",
            "post_merge_validation_status: incomplete",
        )
        self.assert_failure("post_merge_validation_status: passed")

    def test_a003_migration_approval_reuse_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "migration_approval_status: exhausted-non-reusable",
            "migration_approval_status: reusable",
        )
        self.assert_failure("exhausted-non-reusable")

    def test_a003_permanent_ehr_layer_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "exceptional_human_review_mode: exceptional-only",
            "exceptional_human_review_mode: permanent-routine-approval",
        )
        self.assert_failure("exceptional-only")

    def test_a003_historical_steward_falsification_fails(self) -> None:
        self.replace(
            "docs/governance/technical-steward-appointment.md",
            "Appointed qualified human technical steward: `@m-e-h-r-d-a-a-d`",
            "Appointed qualified human technical steward: `@someone-else`",
        )
        self.assert_failure("historical evidence marker")

    def test_voc079_risk_class_personal_approval_marker_removal_fails(self) -> None:
        self.replace(
            "docs/governance/approval-matrix.md",
            "no class requires founder",
            "R4 requires founder approval",
        )
        self.assert_failure("missing current authority marker")

    def test_voc079_r4_approval_neutral_doc16_marker_removal_fails(self) -> None:
        self.replace(
            "docs/governance/16-autonomous-development-operating-model.md",
            "R4 does not require founder approval merely because it is R4",
            "R4 always requires founder approval",
        )
        self.assert_failure("missing VOC-079 approval-neutral marker")

    def test_voc079_action_specific_authority_marker_removal_fails(self) -> None:
        self.replace(
            ".github/pull_request_template.md",
            "Action-specific authority and evidence",
            "Generic approval",
        )
        self.assert_failure("missing VOC-079 approval-neutral marker")

    def test_voc079_reviewer_role_neutrality_marker_removal_fails(self) -> None:
        self.replace(
            "CLAUDE.md",
            "may occupy the independent-reviewer role",
            "is the permanent independent reviewer",
        )
        self.assert_failure("missing VOC-079 approval-neutral marker")

    def test_a003_rl2_false_activation_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "rl2_technical_activation: false",
            "rl2_technical_activation: true",
        )
        self.assert_failure("rl2_technical_activation must remain false")

    def test_a003_rl1_false_activation_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "rl1_technical_activation: false",
            "rl1_technical_activation: true",
        )
        self.assert_failure("rl1_technical_activation must remain false")

    def test_a003_automatic_merge_retirement_fails_closed(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "automatic_merge_allowed: false",
            "automatic_merge_allowed: true",
        )
        self.assert_failure("automatic_merge_allowed must equal 'false' after VOC-078 control-plane retirement")

    def test_a003_retirement_without_marker_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "VOC-078-CONTROL-PLANE-RETIRED-2026-08-19",
            "MARKER-REMOVED-FOR-TEST",
        )
        self.assert_failure("automatic_merge_allowed must equal 'true' once authorized")

    def test_a003_autonomous_merge_enablement_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "autonomous_merge_allowed: false",
            "autonomous_merge_allowed: true",
        )
        self.assert_failure("autonomous_merge_allowed must equal 'false' after VOC-078 control-plane retirement")

    def test_a003_autonomous_production_enablement_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "autonomous_production_release: disabled",
            "autonomous_production_release: enabled",
        )
        self.assert_failure("autonomous_production_release must equal 'disabled' after VOC-078 control-plane retirement")

    def test_a003_doc_17_adoption_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "doc_17_repository_adoption: true",
            "doc_17_repository_adoption: false",
        )
        self.assert_failure("doc_17_repository_adoption must be true")

    def test_a003_doc_18_adoption_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "doc_18_repository_adoption: true",
            "doc_18_repository_adoption: false",
        )
        self.assert_failure("doc_18_repository_adoption must be true")

    def test_doc_17_frozen_body_change_fails(self) -> None:
        self.replace(
            "docs/archive/17-autonomous-development-architecture.md",
            "AI workers are replaceable.",
            "AI workers are permanent.",
        )
        self.assert_failure("frozen substantive body checksum mismatch")

    def test_doc_18_frozen_body_change_fails(self) -> None:
        self.replace(
            "docs/archive/18-autonomous-development-implementation-roadmap.md",
            "Production autonomy is not activated early.",
            "Production autonomy is activated early.",
        )
        self.assert_failure("frozen substantive body checksum mismatch")

    def test_doc_17_false_technical_activation_fails(self) -> None:
        self.replace(
            "docs/archive/17-autonomous-development-architecture.md",
            "technical_activation_status: inactive",
            "technical_activation_status: active",
        )
        self.assert_failure("technical_activation_status: inactive")

    def test_doc_17_pre_merge_lifecycle_fails(self) -> None:
        self.replace(
            "docs/archive/17-autonomous-development-architecture.md",
            "repository_adoption_status: adopted",
            "repository_adoption_status: candidate-pending-merge",
        )
        self.assert_failure("repository_adoption_status: adopted")

    def test_doc_18_missing_adopted_develop_sha_fails(self) -> None:
        self.replace(
            "docs/archive/18-autonomous-development-implementation-roadmap.md",
            "adopted_develop_sha: 2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77",
            "adopted_develop_sha: null",
        )
        self.assert_failure("adopted_develop_sha: 2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77")

    def test_voc_004_incomplete_lifecycle_sync_fails(self) -> None:
        self.replace(
            "specs/changes/VOC-004-canonical-adoption-doc-17-doc-18/change.yaml",
            "canonical_lifecycle_sync_status: complete",
            "canonical_lifecycle_sync_status: pending",
        )
        self.assert_failure("canonical_lifecycle_sync_status must equal 'complete'")

    def test_control_plane_false_implementation_fails(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "control_plane_implementation: false",
            "control_plane_implementation: true",
        )
        self.assert_failure("control_plane_implementation must remain false")

    def test_production_deployment_retirement_fails_closed(self) -> None:
        self.replace(
            "docs/governance/a003-transition-state.yaml",
            "production_deployment: disabled",
            "production_deployment: enabled",
        )
        self.assert_failure("production_deployment must equal 'disabled' after VOC-078 control-plane retirement")

    def test_protected_policy_partial_adoption_fails(self) -> None:
        self.replace(
            ".github/approved-policy/protected-paths.yaml",
            "doc_18_repository_adoption: true",
            "doc_18_repository_adoption: false",
        )
        self.assert_failure("canonical protected policy requires doc_18_repository_adoption")

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
        self.replace(".github/workflows/governance.yml", "contents: read", "contents: write")
        self.assert_failure("contents: read")

    def test_merge_eligibility_permission_expansion_fails(self) -> None:
        self.replace(".github/workflows/governance.yml", "checks: read", "checks: write")
        self.assert_failure("checks: read")

    def test_missing_merge_eligibility_adapter_fails(self) -> None:
        (self.root / "tooling/governance/merge-eligibility/github_adapter.py").unlink()
        self.assert_failure("github_adapter.py")

    def test_merge_eligibility_adapter_write_method_fails(self) -> None:
        self.replace(
            "tooling/governance/merge-eligibility/github_adapter.py",
            'method="GET"',
            'method="POST"',
        )
        self.assert_failure("prohibited write/process path")

    def test_merge_eligibility_schema_version_change_fails(self) -> None:
        self.replace(
            "tooling/governance/merge-eligibility/schema-v1.json",
            '"schema_version": { "const": 1 }',
            '"schema_version": { "const": 2 }',
        )
        self.assert_failure("schema_version must be pinned to 1")

    def test_merge_eligibility_evaluator_network_boundary_fails(self) -> None:
        path = self.root / "tooling/governance/merge-eligibility/evaluator.py"
        path.write_text(path.read_text(encoding="utf-8") + "\nimport urllib\n", encoding="utf-8")
        self.assert_failure("pure evaluator contains prohibited boundary")

    def test_pull_request_target_fails(self) -> None:
        self.replace(".github/workflows/governance.yml", "pull_request:", "pull_request_target:")
        self.assert_failure("pull_request_target")

    def test_path_filtered_workflow_fails(self) -> None:
        self.replace(
            ".github/workflows/governance.yml",
            "  pull_request:\n    branches:",
            "  pull_request:\n    paths:\n      - docs/**\n    branches:",
        )
        self.assert_failure("paths:")

    def test_unpinned_external_action_fails(self) -> None:
        self.replace(
            ".github/workflows/governance.yml",
            "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
            "actions/checkout@v4",
        )
        self.assert_failure("not pinned")

    def test_false_autonomous_activation_claim_fails(self) -> None:
        # Targets post-merge-activation-checklist.md, not
        # protected-paths.yaml: as of 2026-08-08 the latter is a legitimately
        # authorized exception to this pattern (see validate_false_activation's
        # own comment) - this test still needs to prove the tripwire is real
        # everywhere ELSE a false activation claim could appear.
        path = self.root / "docs/governance/post-merge-activation-checklist.md"
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
