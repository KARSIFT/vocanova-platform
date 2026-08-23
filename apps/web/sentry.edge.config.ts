import { withSentry } from "@sentry/cloudflare";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Generated module existence varies by build state.
// @ts-ignore -- This import is absent before OpenNext builds and present afterward,
// so `@ts-expect-error` would make typechecking depend on generated local state.
// Wrangler resolves the generated module while bundling this custom main.
import openNextWorker from "./.open-next/worker.js";
import { sentryOptions } from "./sentry.server.config";

// This is the Wrangler custom main. Sentry initializes from the per-request
// Cloudflare env and wraps the generated OpenNext handler, so no Node/Next
// server barrel is part of the Worker graph.
export default withSentry(sentryOptions, openNextWorker);
