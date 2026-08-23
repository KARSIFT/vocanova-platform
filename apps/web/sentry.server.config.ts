import type { CloudflareOptions, ErrorEvent } from "@sentry/cloudflare";

export type SentryRuntimeEnv = Partial<Pick<CloudflareEnv, "ENVIRONMENT">> & {
  SENTRY_DSN?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  NEXT_PUBLIC_SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
  NEXT_PUBLIC_SENTRY_RELEASE?: string;
};

const SENSITIVE_TAG =
  /(?:authorization|cookie|credential|dsn|learner|password|provider|request|secret|token|user)/i;

function redactText(value: string): string {
  return value.replace(
    /(authorization|cookie|credential|dsn|learner|password|provider|request(?:[-_\s]?body)?|secret|token|user)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi,
    "$1=[REDACTED]",
  );
}

/** Remove request/user/provider payloads before a synthetic or live event is sent. */
export function redactSentryEvent(event: ErrorEvent): ErrorEvent {
  delete event.request;
  delete event.user;
  delete event.contexts;
  delete event.extra;
  delete event.breadcrumbs;

  if (event.message) {
    event.message = redactText(event.message);
  }
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) {
      exception.value = redactText(exception.value);
    }
  }
  if (event.tags) {
    for (const tag of Object.keys(event.tags)) {
      if (SENSITIVE_TAG.test(tag)) {
        delete event.tags[tag];
      }
    }
  }
  return event;
}

/** Build side-effect-free Worker options from the request environment. */
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

// The generated OpenNext Worker owns server initialization. Keeping this
// module as an explicit no-op prevents Next's Node server barrel from being
// pulled into the Worker graph.
export function register(): void {}
