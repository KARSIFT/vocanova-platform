import { captureException } from "@sentry/cloudflare";

export function register(): void {
  // The outer Cloudflare Worker initializes Sentry once per request.
}

// Next.js calls this hook for every server-side request error (Route
// Handlers, Server Actions, RSC rendering). Without it those errors never
// reach Sentry. The Worker wrapper handles uncaught failures, while this hook
// covers errors Next.js catches and turns into a 500.
export function onRequestError(
  error: unknown,
  request: unknown,
  errorContext: unknown,
): void {
  // Next provides request/context objects here, but capturing their contents
  // would risk cookies, bodies, and provider payloads. The Worker wrapper
  // supplies the safe request scope; this hook records the caught exception.
  void request;
  void errorContext;
  captureException(error, {
    tags: { "sentry.source": "next.onRequestError" },
  });
}
