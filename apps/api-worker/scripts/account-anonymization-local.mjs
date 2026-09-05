import { getPlatformProxy } from "wrangler";
import process from "node:process";

import { AccountAnonymizationProcessor } from "../dist/identity/anonymization.js";
import { LOCAL_D1_PATHS } from "./local-d1-init.mjs";

const args = process.argv.slice(2);
if (!(args.length === 0 || (args.length === 1 && args[0] === "--apply")))
  throw new Error("Usage: node scripts/account-anonymization-local.mjs [--apply]");
const platform = await getPlatformProxy({
  configPath: LOCAL_D1_PATHS.canonicalConfigPath,
  environment: "",
  envFiles: [],
  remoteBindings: false,
  persist: { path: LOCAL_D1_PATHS.canonicalStateDirectory },
});
try {
  const result = await new AccountAnonymizationProcessor(platform.env.DB).run({
    dryRun: args[0] !== "--apply",
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} finally {
  await platform.dispose();
}
