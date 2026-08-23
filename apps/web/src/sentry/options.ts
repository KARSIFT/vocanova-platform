import type { CloudflareOptions, ErrorEvent } from "@sentry/cloudflare";

import { redactSentryEvent } from "./redaction";

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
