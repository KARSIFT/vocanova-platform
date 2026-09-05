# Operations

Pull-request workflows are credential-free and validate local builds only. A push
to `main` deploys the validated revision to staging after the required GitHub
environment and Cloudflare credentials have been configured. Production delivery
is not automated.

The [staging deployment runbook](staging-deployment.md) documents setup,
verification, recovery, and the boundary between staging delivery and feature
enablement. Never commit credentials or production data.

The [synthetic PostgreSQL-to-D1 conversion guide](data-conversion.md) documents the
local conversion harness and its recovery boundaries.
