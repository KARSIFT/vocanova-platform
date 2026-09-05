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

Cloudflare attaches a build to one Worker and injects both
`WRANGLER_CI_OVERRIDE_NAME` and `WRANGLER_CI_MATCH_TAG`. The latter identifies the
connected Worker independently of its name. Removing the name override alone
does not allow the API deployment: Wrangler would compare the API identity with
the web identity and reject it.

Before migrations, the entry point uses Cloudflare's injected account ID and
build API token to read both existing staging Workers' identity tags. It verifies
that this build is connected to `vocanova-web-staging`, supplies the API tag only
to API commands, and retains the web tag for the web deployment. The name override
is removed so the checked-in staging configurations select their own names.
Wrangler's Worker identity and account checks remain enabled. Missing credentials,
failed lookups, or a wrong connected Worker stop delivery before migrations.

## Deployment sequence

For each push to `main`, Cloudflare runs:

1. `pnpm validate` against the exact checked-out revision.
2. The OpenNext web build with staging API origins and the Cloudflare-provided
   `WORKERS_CI_COMMIT_SHA` as its release.
3. Verify both staging Worker identities and dry-run both deployments.
4. Pending compatible migrations against `vocanova-staging` D1.
5. The API Worker deployment with `RELEASE` set to that Git SHA.
6. The web Worker deployment from the previously built OpenNext artifact.
7. Bounded smoke checks against API health, D1 health, the reported release, and
   the public web origin.

The entry point fails closed unless `WORKERS_CI=1`, the branch is exactly `main`,
and the release is a 40-character Git SHA. It also verifies the OpenNext Worker
artifact exists before beginning remote mutation.

The web deployment sets `OPEN_NEXT_DEPLOY=true`, the flag OpenNext itself uses
when invoking Wrangler, to upload the prepared Worker directly. The build's
canonicalization removes OpenNext's temporary compiled configuration; allowing
Wrangler to hand deployment back to OpenNext would fail with “Could not find
compiled Open Next config.” The flag is scoped to web commands and does not
disable Wrangler's Worker identity checks. This direct-artifact path assumes the
current storage-free OpenNext configuration; adding persistent cache bindings
requires revisiting OpenNext's cache-population deployment steps.

## Verify a release

Open the Worker build in the Cloudflare dashboard and confirm its deploy command
and final smoke output. Cloudflare also reports the build as a GitHub check. For an
independent read-only check:

```bash
curl --fail --silent --show-error https://api-stag.vocanova.site/healthz
curl --fail --silent --show-error https://api-stag.vocanova.site/configz
curl --fail --silent --show-error --output /dev/null https://stag.vocanova.site/
```

`configz.release` must equal the `main` commit shown by the build. This endpoint
reports the API release, not the web release or authentication feature flags.
A healthy deployment does not imply that sign-in is usable: check the staging
authentication configuration and test sign-in before beginning a learner-journey
walkthrough.

### Test the merge-to-staging path

Use a small, reviewed pull request to exercise the existing connection:

1. Record staging's current API release, then merge the pull request after its
   required checks pass. Record the resulting commit on `main`, not the feature
   branch commit.
2. In the web Worker's Builds page, confirm that a build starts automatically for
   that exact `main` commit and uses the commands above. A successful GitHub CI
   run alone is not deployment evidence.
3. Confirm that the build completes its API and web deployments and final smoke
   checks. Check both Workers' deployment records for the same `sha-<commit>` tag.
4. Repeat the health and release checks above. The API release must match the
   merge commit. Load the website in a fresh browser context and inspect its
   client API requests: they must target `https://api-stag.vocanova.site`, never
   `http://127.0.0.1:8080`.

If no build starts, inspect the repository connection, branch, and build watch
paths. If a build fails, inspect its first failing step. Do not substitute a
manual Wrangler deployment as proof that automatic deployment works. Report
authentication or AI-provider failures separately from release delivery.

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
