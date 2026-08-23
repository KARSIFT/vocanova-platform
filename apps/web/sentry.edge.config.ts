import { withSentry } from "@sentry/cloudflare";

import openNextWorker from "./.open-next/worker.js";
import { sentryOptions } from "./src/sentry/options";

// This is the Wrangler custom main. Sentry initializes from the per-request
// Cloudflare env and wraps the generated OpenNext handler, so no Node/Next
// server barrel is part of the Worker graph.
export default withSentry(sentryOptions, openNextWorker);
