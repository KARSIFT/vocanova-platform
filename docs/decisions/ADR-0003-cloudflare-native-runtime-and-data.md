# ADR-0003: Cloudflare-native runtime and data

- Status: accepted
- Date: 2026-08-22
- Owner: m-e-h-r-d-a-a-d

## Context

VocaNova needs a managed runtime for its Next.js web application, API, and relational data without operating a dedicated server. Cloudflare Workers supports the required edge runtime, and D1 provides managed SQLite. The previous Go/PostgreSQL/Docker implementation was retired after its behavior was ported and tested.

## Decision

VocaNova uses this architecture:

```text
Browser
  -> Next.js through OpenNext on a Cloudflare Web Worker
      -> Cloudflare service binding
          -> Hono API Worker
              -> Cloudflare D1
              -> explicitly configured provider APIs
```

- `apps/web` owns the Next.js application and OpenNext Worker bundle.
- `apps/api-worker` owns the TypeScript/Hono API, D1 migrations, and OpenAPI contract.
- Local development and CI use workerd and local D1.
- Staging and production use distinct Worker names, databases, bindings, routes, and secrets.
- Provider integrations are disabled unless explicitly configured.
- Logs and telemetry must exclude learner text, tokens, cookies, magic links, OAuth material, prompts, responses, and unnecessary personal data.
- New paid Cloudflare capabilities require a demonstrated product need.

## Consequences

- Web validation must cover the OpenNext output and representative workerd requests, not only `next build`.
- D1 schema behavior, migrations, authorization, and conversion are tested explicitly because SQLite and PostgreSQL differ.
- Secrets belong in Cloudflare secret bindings or another approved secret store, never in Git.
- Production readiness requires measured Worker limits, D1 usage, rollback behavior, and cost.
- Remote deployment and production-data migration remain explicit operator actions, separate from repository merges.

## Alternatives considered

- An owned server was rejected because it preserves infrastructure cost and operational burden.
- Managed VM/container hosting was rejected as the primary target because it remains server-shaped.
- Cloudflare Containers and Go/Wasm were rejected because they carry incompatible server assumptions forward.
- Hyperdrive with external PostgreSQL was rejected because it retains a separately operated database.
- Rewriting the web away from Next.js was rejected because OpenNext supports the current application requirements.

## Migration and rollback

Schema changes use forward migrations and forward correction. Worker rollback uses a previously recorded version. D1 restore is a separate destructive action and must never happen automatically.

## References

- [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
