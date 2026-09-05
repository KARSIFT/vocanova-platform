# Operations

Pull-request workflows are credential-free and validate local builds only.
Cloudflare Workers Builds deploys a validated push to `main` to staging after its
repository trigger has been configured. Production delivery is not automated.

The [staging deployment runbook](staging-deployment.md) documents setup,
verification, recovery, and the boundary between staging delivery and feature
enablement. Never commit credentials or production data.

The [synthetic PostgreSQL-to-D1 conversion guide](data-conversion.md) documents the
local conversion harness and its recovery boundaries.
