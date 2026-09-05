import { getPlatformProxy } from "wrangler";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { AccountAnonymizationProcessor } from "../dist/identity/anonymization.js";
import { LOCAL_D1_PATHS, localOnlyEnvironment } from "./local-d1-init.mjs";

export async function runLocalAnonymization({
  stateDirectory = LOCAL_D1_PATHS.canonicalStateDirectory,
  dryRun = true,
} = {}) {
  const previous = { ...process.env };
  Object.assign(process.env, localOnlyEnvironment());
  try {
    const platform = await getPlatformProxy({
      configPath: LOCAL_D1_PATHS.canonicalConfigPath,
      environment: "",
      envFiles: [],
      remoteBindings: false,
      persist: { path: join(stateDirectory, "v3") },
    });
    try {
      return await new AccountAnonymizationProcessor(platform.env.DB).run({
        dryRun,
      });
    } finally {
      await platform.dispose();
    }
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (!(args.length === 0 || (args.length === 1 && args[0] === "--apply")))
    throw new Error(
      "Usage: node scripts/account-anonymization-local.mjs [--apply]",
    );
  const result = await runLocalAnonymization({ dryRun: args[0] !== "--apply" });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
