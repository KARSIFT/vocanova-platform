import { withSentry, type CloudflareOptions } from "@sentry/cloudflare";

import type { ErrorEvent } from "@sentry/cloudflare";

// @ts-expect-error -- OpenNext generates this module after ordinary typecheck;
// Wrangler resolves it while bundling the configured custom main.
import openNextWorker from "./.open-next/worker.js";
import { redactSentryEvent } from "./sentry.server.config";

type SentryRuntimeEnv = CloudflareEnv & {
  SENTRY_DSN?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  NEXT_PUBLIC_SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
  NEXT_PUBLIC_SENTRY_RELEASE?: string;
};

export function sentryOptions(
  env: SentryRuntimeEnv,
): CloudflareOptions | undefined {
  const dsn = env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return undefined;
  }

  return {
    dsn,
    environment:
      env.SENTRY_ENVIRONMENT ??
      env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
      env.ENVIRONMENT,
    release: env.SENTRY_RELEASE ?? env.NEXT_PUBLIC_SENTRY_RELEASE,
    debug: false,
    spotlight: false,
    beforeSend: (event: ErrorEvent) => redactSentryEvent(event),
  };
}

// This is the Wrangler custom main. Sentry initializes from the per-request
// Cloudflare env and wraps the generated OpenNext handler, so no Node/Next
// server barrel is part of the Worker graph.
export default withSentry(sentryOptions, openNextWorker);
