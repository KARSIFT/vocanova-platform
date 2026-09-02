# VocaNova agent guides

This directory is the tool-neutral home for reusable development workflows. `AGENTS.md` remains the repository-wide engineering guide; these skills explain how to carry out common tasks without creating a second policy layer.

Supported adapters:

- Claude Code discovers `.claude/skills`, which points here.
- Codex reads `AGENTS.md` and `.codex/config.toml`.
- Cursor loads `.cursor/rules/vocanova-harness.mdc`.
- OpenCode can use the shared guides and its bounded PR-poller role.

The Claude adapters are Git symlinks. On Windows, enable Developer Mode or Git symlink support before cloning; otherwise Git may materialize them as plain text and Claude will not discover the shared guides.

Use the smallest applicable skill. A skill does not grant deployment, secret, spending, or other external-effect authority.
