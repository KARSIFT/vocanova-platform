import type { ErrorEvent } from "@sentry/cloudflare";

const SENSITIVE_TAG =
  /(?:authorization|cookie|credential|dsn|learner|password|secret|token)/i;

function redactText(value: string): string {
  return value.replace(
    /(authorization|cookie|credential|dsn|password|secret|token)\s*[:=]\s*[^\s,;]+/gi,
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

// The generated OpenNext Worker owns server initialization. Keeping this
// module as an explicit no-op prevents Next's Node server barrel from being
// pulled into the Worker graph.
export function register(): void {}
