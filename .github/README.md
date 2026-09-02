# GitHub configuration

VocaNova uses a conventional protected-trunk workflow:

1. Branch from `main`.
2. Open one focused pull request.
3. Pass the product, quality, security, and title checks.
4. Resolve review comments.
5. Squash-merge and delete the short-lived branch.

## Files

- `CODEOWNERS`: routes review to the repository owner.
- `ISSUE_TEMPLATE/`: bug, feature, and private-security intake.
- `pull_request_template.md`: concise scope and validation record.
- `actions/setup-toolchain/`: pinned Node/pnpm setup with frozen dependencies.
- `workflows/ci.yml`: application, package, Worker API, and local-stack checks.
- `workflows/quality.yml`: path-scoped accessibility and Lighthouse checks.
- `workflows/security.yml`: dependency audit and secret scanning.
- `workflows/pr-title.yml`: Conventional Commit title validation.
- `dependabot.yml`: weekly dependency and GitHub Actions updates.

Pull-request workflows use read-only tokens and do not deploy or receive Cloudflare credentials.
