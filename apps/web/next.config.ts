// apps/web/next.config.ts
//
// VOC-080-T03: OpenNext owns the standalone intermediate it needs while
// transforming this application for workerd. A plain `next build` remains
// useful for fast UI checks, but it is no longer deployment evidence.
// `initOpenNextCloudflareForDev` exposes locally simulated bindings only to
// `next dev`; production `next start` remains the transitional HTTP-fallback
// harness, while the generated OpenNext Worker receives bindings at runtime.

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev();
}

// VOC-081-T00: Next 16.3 otherwise creates nested AGENTS.md/CLAUDE.md files
// when an AI coding agent is detected. Repository authority is maintained at
// the repository root, so local development must never generate replacements.
const nextConfig = {
  agentRules: false,
} satisfies NextConfig;

// VOC-051-T01: hand-adapted equivalent of the @sentry/nextjs wizard's
// `withSentryConfig` options block. No `org`/`project`/`authToken` is set and
// source-map upload is disabled outright: this package provisions only a
// read-only Sentry API token for the monitoring workflow, never a build-time
// upload token, so leaving upload enabled would make every build attempt (and
// warn about) an upload it can never perform. `telemetry: false` keeps build
// metadata from being sent to Sentry, and `excludeDebugStatements` strips the
// SDK's own debug/logger statements from the built bundle so no Sentry debug
// output can reach a browser console. (`excludeDebugStatements` is used rather
// than the webpack-only `webpack.treeshake.removeDebugLogging` because
// apps/web builds with Turbopack, where the webpack options are inert.)
export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  sourcemaps: { disable: true },
  widenClientFileUpload: false,
  bundleSizeOptimizations: { excludeDebugStatements: true },
});
