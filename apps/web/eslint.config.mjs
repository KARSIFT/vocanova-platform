import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";

import foundationConfig from "../../packages/eslint-config/index.js";

export default defineConfig([
  ...foundationConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "worker-configuration.d.ts",
    "playwright.config.ts",
    "tests/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
