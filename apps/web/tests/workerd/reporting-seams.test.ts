import assert from "node:assert/strict";
import test from "node:test";

import * as CloudflareSentry from "@sentry/cloudflare";
import * as ReactSentry from "@sentry/react";

import { onRequestError } from "../../src/instrumentation.ts";
import {
  redactSentryEvent,
  sentryOptions,
} from "../../sentry.server.config.ts";

const TEST_DSN = "https://public@example.invalid/1";

type Envelope = readonly unknown[];

function memoryTransport(events: Envelope[]): () => {
  send: (envelope: Envelope) => Promise<{ statusCode: number }>;
  flush: () => Promise<boolean>;
} {
  return () => ({
    send: async (envelope) => {
      events.push(envelope);
      return { statusCode: 200 };
    },
    flush: async () => true,
  });
}

async function flushCloudflare(): Promise<void> {
  await CloudflareSentry.flush(1_000);
}

test("Worker uncaught errors reach an in-memory transport and are redacted", async () => {
  const events: Envelope[] = [];
  const options = sentryOptions({
    SENTRY_DSN: TEST_DSN,
    SENTRY_ENVIRONMENT: "synthetic-environment",
    SENTRY_RELEASE: "synthetic-release",
  });

  assert.ok(options);
  assert.equal(options.dsn, TEST_DSN);
  assert.equal(options.environment, "synthetic-environment");
  assert.equal(options.release, "synthetic-release");
  assert.equal(options.debug, false);
  assert.equal(options.spotlight, false);
  assert.equal(typeof options.beforeSend, "function");

  const worker = CloudflareSentry.withSentry(
    () => ({
      ...options,
      transport: memoryTransport(events),
    }),
    {
      async fetch(): Promise<Response> {
        throw new Error("worker failure token=synthetic-token cookie=synthetic-cookie");
      },
    },
  );

  await assert.rejects(() =>
    worker.fetch(new Request("https://example.invalid/"), {}, {
      waitUntil(): void {},
    }),
  );
  await flushCloudflare();

  assert.equal(events.length, 1);
  const serialized = JSON.stringify(events);
  assert.doesNotMatch(serialized, /synthetic-token|synthetic-cookie/);
  assert.match(serialized, /worker failure/);
});

test("Next-caught request errors use the Cloudflare capture boundary", async () => {
  const events: Envelope[] = [];
  const worker = CloudflareSentry.withSentry(
    () => ({
      dsn: TEST_DSN,
      transport: memoryTransport(events),
      beforeSend: redactSentryEvent,
    }),
    {
      async fetch(request: Request): Promise<Response> {
        onRequestError(
          new Error("next caught token=synthetic-token"),
          request,
          { routePath: "/synthetic" },
        );
        return new Response("ok");
      },
    },
  );

  const response = await worker.fetch(new Request("https://example.invalid/"), {}, {
    waitUntil(): void {},
  });
  assert.equal(response.status, 200);
  await flushCloudflare();

  assert.equal(events.length, 1);
  const serialized = JSON.stringify(events);
  assert.match(serialized, /next caught/);
  assert.doesNotMatch(serialized, /synthetic-token/);
});

test("React/global capture reaches the same in-memory boundary", async () => {
  const events: Envelope[] = [];
  ReactSentry.init({
    dsn: TEST_DSN,
    transport: memoryTransport(events),
    beforeSend: redactSentryEvent,
    integrations: [ReactSentry.browserTracingIntegration()],
    debug: false,
    spotlight: false,
  });

  ReactSentry.captureException(new Error("browser global secret=synthetic-secret"));
  await ReactSentry.flush(1_000);

  assert.equal(events.length, 1);
  const serialized = JSON.stringify(events);
  assert.match(serialized, /browser global/);
  assert.doesNotMatch(serialized, /synthetic-secret/);
});

test("missing DSN is a no-op and makes no transport call", async () => {
  const events: Envelope[] = [];
  const options = sentryOptions({});
  assert.equal(options, undefined);

  const worker = CloudflareSentry.withSentry(
    () => options,
    {
      async fetch(): Promise<Response> {
        throw new Error("disabled worker error");
      },
    },
  );

  await assert.rejects(() =>
    worker.fetch(new Request("https://example.invalid/"), {}, {
      waitUntil(): void {},
    }),
  );
  await flushCloudflare();
  assert.equal(events.length, 0);
});

test("redaction removes request, user, provider payloads, and sensitive text", () => {
  const event = {
    message: "token=synthetic-token",
    request: { url: "https://example.invalid", cookies: "synthetic-cookie" },
    user: { id: "synthetic-learner" },
    contexts: { provider: { body: "synthetic-provider-payload" } },
    extra: { requestBody: "synthetic-body" },
    breadcrumbs: [{ message: "cookie=synthetic-cookie" }],
    tags: { token: "synthetic-token", environment: "test" },
  };

  const redacted = redactSentryEvent(event);
  const serialized = JSON.stringify(redacted);
  assert.doesNotMatch(
    serialized,
    /synthetic-token|synthetic-cookie|synthetic-learner|synthetic-provider|synthetic-body/,
  );
  assert.match(serialized, /\[REDACTED\]/);
  assert.match(serialized, /environment/);
});
