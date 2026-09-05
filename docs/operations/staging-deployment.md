# Staging deployment

VocaNova uses Cloudflare Workers Builds to deploy staging from `main`. Cloudflare
owns the GitHub connection and build token; GitHub Actions remains credential-free.
The repository entry points validate Cloudflare's branch and exact commit SHA
before any remote command runs.

This delivery does not deploy production, modify DNS, or enable authentication,
signup, email, or AI features. Those settings remain controlled by the staging
Wrangler configuration and Cloudflare runtime secrets.

## One-time Cloudflare setup

The Cloudflare GitHub App is installed for the KARSIFT organization. Configure one
build trigger on `vocanova-web-staging`; do not create a second trigger for the API
Worker because the reviewed deploy entry point orders both Workers together.

In `vocanova-web-staging` **Settings > Builds**, use:

| Setting                       | Value                                |
| ----------------------------- | ------------------------------------ |
| Git repository                | `KARSIFT/vocanova-platform`          |
| Production branch             | `main`                               |
| Root directory                | `/`                                  |
| Build command                 | `pnpm run cloudflare:build:staging`  |
| Deploy command                | `pnpm run cloudflare:deploy:staging` |
| Non-production branch builds  | Disabled                             |
| Build variable `NODE_VERSION` | `24.18.0`                            |
| Build variable `PNPM_VERSION` | `11.14.0`                            |

Select a dedicated token restricted to the VocaNova account and the
`vocanova.site` zone. It needs only the permissions required to deploy Workers,
maintain the existing Worker routes, and edit D1. Cloudflare's automatically
generated default build token does not include D1, so add that permission or
select the existing staging token if it remains active.

Cloudflare attaches a build to one Worker and injects
`WRANGLER_CI_OVERRIDE_NAME`. The repository entry point deliberately removes that
override before deploying, allowing the two checked-in Wrangler staging
environments to select `vocanova-api-staging` and `vocanova-web-staging` exactly.

## Deployment sequence

For each push to `main`, Cloudflare runs:

1. `pnpm validate` against the exact checked-out revision.
2. The OpenNext web build with staging API origins and the Cloudflare-provided
   `WORKERS_CI_COMMIT_SHA` as its release.
3. Pending compatible migrations against `vocanova-staging` D1.
4. The API Worker deployment with `RELEASE` set to that Git SHA.
5. The web Worker deployment from the previously built OpenNext artifact.
6. Bounded smoke checks against API health, D1 health, the reported release, and
   the public web origin.

The entry point fails closed unless `WORKERS_CI=1`, the branch is exactly `main`,
and the release is a 40-character Git SHA. It also verifies the OpenNext Worker
artifact exists before beginning remote mutation.

## Verify a release

Open the Worker build in the Cloudflare dashboard and confirm its deploy command
and final smoke output. Cloudflare also reports the build as a GitHub check. For an
independent read-only check:

```bash
curl --fail --silent --show-error https://api-stag.vocanova.site/healthz
curl --fail --silent --show-error https://api-stag.vocanova.site/configz
curl --fail --silent --show-error --output /dev/null https://stag.vocanova.site/
```

`configz.release` must equal the `main` commit shown by the build. A healthy
deployment does not imply that sign-in is usable: inspect `configz` feature flags
before beginning a learner-journey walkthrough.

## Recover or roll back

First determine whether the failure occurred before or after each deploy step. A
failed build can be retried from Cloudflare only when `main` is still the intended
revision and the failure was transient.

For a bad Worker version, list recent deployments and roll each affected Worker
back to a known-good version ID. Authenticate Wrangler interactively, then run
from the repository root:

```bash
pnpm --filter @vocanova/api-worker exec wrangler deployments list --env staging
pnpm --filter @vocanova/web exec wrangler deployments list --env staging

pnpm --filter @vocanova/api-worker exec wrangler rollback VERSION_ID --env staging
pnpm --filter @vocanova/web exec wrangler rollback VERSION_ID --env staging
```

Worker rollback does not reverse D1 migrations. Migrations delivered through this
flow must be backward-compatible with the preceding Worker version. If a data
repair or destructive database action is needed, stop and obtain explicit
authorization before changing remote D1 data.
