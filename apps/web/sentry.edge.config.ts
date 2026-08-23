import { withSentry } from "@sentry/cloudflare";

// @ts-expect-error -- OpenNext generates this module after ordinary typecheck;
// Wrangler resolves it while bundling the configured custom main.
import openNextWorker from "./.open-next/worker.js";
import { sentryOptions } from "./sentry.server.config";

// This is the Wrangler custom main. Sentry initializes from the per-request
// Cloudflare env and wraps the generated OpenNext handler, so no Node/Next
// server barrel is part of the Worker graph.
export default withSentry(sentryOptions, openNextWorker);
