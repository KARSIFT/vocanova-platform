import * as Sentry from "@sentry/react";

import { redactSentryEvent } from "../sentry.server.config";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend: redactSentryEvent,
    // `debug` and `spotlight` are the two options that can surface a Sentry
    // developer UI/console output in the browser. Both are pinned off rather
    // than left to their defaults so a production or staging build can never
    // render Sentry's dev overlay to an end user (VOC-051-TEST-01).
    debug: false,
    spotlight: false,
  });
}

type RouterTransitionType = "push" | "replace" | "traverse";

// Next's App Router calls this hook with the destination and transition kind.
// The browser SDK owns the span lifecycle; this typed adapter keeps the
// runtime-specific client boundary independent from the Next-specific SDK.
export function onRouterTransitionStart(
  href: string,
  navigationType: RouterTransitionType,
): void {
  const client = Sentry.getClient();
  if (!client) {
    return;
  }

  Sentry.startBrowserTracingNavigationSpan(
    client,
    { name: href, op: "navigation" },
    { url: href },
  );
  void navigationType;
}
