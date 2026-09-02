// apps/web/next.config.ts
//
// OpenNext owns the standalone intermediate it needs while
// transforming this application for workerd. A plain `next build` remains
// useful for fast UI checks, but it is no longer deployment evidence.
// `initOpenNextCloudflareForDev` exposes locally simulated bindings only to
// `next dev`; production `next start` remains the transitional HTTP-fallback
// harness, while the generated OpenNext Worker receives bindings at runtime.

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev();
}

// Next 16.3 otherwise creates nested AGENTS.md/CLAUDE.md files
// when an AI coding agent is detected. Repository authority is maintained at
// the repository root, so local development must never generate replacements.
const nextConfig = {
  agentRules: false,
} satisfies NextConfig;

// Sentry source-map upload remains deliberately disabled. There is no Sentry
// build plugin, uploader, organization, project, or auth token in this config.
export default {
  ...nextConfig,
  productionBrowserSourceMaps: false,
} satisfies NextConfig;
