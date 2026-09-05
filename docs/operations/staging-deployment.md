# Staging deployment

VocaNova deploys staging from `.github/workflows/deploy-staging.yml`. A merge to
`main` creates a push event and starts one serialized deployment for that exact
commit. A maintainer can also dispatch the workflow manually, but its runtime
guard rejects any ref other than `main`.

This workflow does not deploy production, modify DNS, or enable authentication,
signup, email, or AI features. Those settings remain controlled by the staging
Wrangler configuration and Cloudflare secrets.

## One-time GitHub and Cloudflare setup

Create a GitHub Actions environment named `staging`. Limit its deployment branch
policy to `main`; add required reviewers if the repository plan and desired
operating model support them.

Create a dedicated Cloudflare API token restricted to the VocaNova account and,
where the permission supports resource selection, the `vocanova.site` zone. Give
it only the permissions required to deploy Workers, maintain the existing Worker
custom-domain routes, and apply D1 migrations. Do not reuse a user-wide token or
a production credential.

Add these environment secrets to `staging`:

- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account containing the staging Workers
  and D1 database.
- `CLOUDFLARE_API_TOKEN`: the dedicated, narrowly scoped staging deployment token.

The repository's `staging` environment accepts deployments only from `main`. Until
both environment secrets exist, the workflow intentionally fails its credential
check before running a remote command.

## Deployment sequence

The workflow:

1. Checks out `github.sha`, installs the pinned toolchain, runs `pnpm validate`,
   and rejects high-severity dependency audit findings without credentials.
2. Rebuilds the API and OpenNext web Workers for the staging origins.
3. Verifies both Cloudflare credentials are present.
4. Applies pending migrations to the remote `vocanova-staging` D1 database.
5. Deploys `vocanova-api-staging` with `RELEASE` set to the 40-character Git SHA,
   then deploys `vocanova-web-staging`.
6. Retries bounded smoke checks against the API health and configuration endpoints
   and the public web origin. The API must report the expected SHA.

The `staging-deployment` concurrency group prevents two deployments from mutating
staging simultaneously. A newer queued run supersedes an older queued run, while
the active deployment is allowed to finish.

## Verify a release

Open the successful `Deploy staging` Actions run and confirm the final smoke step.
For an independent read-only check:

```bash
curl --fail --silent --show-error https://api-stag.vocanova.site/healthz
curl --fail --silent --show-error https://api-stag.vocanova.site/configz
curl --fail --silent --show-error --output /dev/null https://stag.vocanova.site/
```

`configz.release` must equal the merge commit shown by the workflow. A healthy
deployment does not imply that sign-in is usable: inspect `configz` feature flags
before beginning a learner-journey walkthrough.

## Recover or roll back

First determine whether the failure occurred before or after each deploy step.
Rerun the failed workflow only when `main` is still the intended revision and the
failure was transient.

For a bad Worker version, list recent deployments and roll each affected Worker
back to a known-good version ID. Set the two Cloudflare environment variables in
your shell without putting their values in command history, then run from the
repository root:

```bash
pnpm --filter @vocanova/api-worker exec wrangler deployments list --env staging
pnpm --filter @vocanova/web exec wrangler deployments list --env staging

pnpm --filter @vocanova/api-worker exec wrangler rollback VERSION_ID --env staging
pnpm --filter @vocanova/web exec wrangler rollback VERSION_ID --env staging
```

Worker rollback does not reverse D1 migrations. Migrations delivered through this
workflow must be backward-compatible with the preceding Worker version. If a data
repair or destructive database action is needed, stop and obtain explicit
authorization before changing remote D1 data.
