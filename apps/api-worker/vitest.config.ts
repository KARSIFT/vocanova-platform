import path from "node:path";
import { fileURLToPath } from "node:url";

import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(
            path.join(root, "migrations"),
          ),
        },
      },
    })),
  ],
  test: {
    // Every file owns an isolated local D1 and applies the full forward migration
    // ledger twice. Serial files keep that setup deterministic on small CI runners
    // instead of racing several workerd instances against the hook timeout.
    fileParallelism: false,
    setupFiles: ["./test/setup.ts"],
  },
});
