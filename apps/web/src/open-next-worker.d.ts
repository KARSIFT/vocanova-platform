/**
 * OpenNext creates this module during the Cloudflare build after Next's
 * application typecheck. The declaration keeps the custom Wrangler main
 * typed before that generated artifact exists.
 */
declare module "*.open-next/worker.js" {
  const worker: ExportedHandler<CloudflareEnv>;
  export default worker;
}
