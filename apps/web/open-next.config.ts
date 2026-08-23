import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Keep OpenNext's storage-free defaults until a later task has measured a
// requirement for persistent incremental caching. This T03 bundle therefore
// needs no R2 bucket, KV namespace, or remote resource during build/preview.
export default defineCloudflareConfig();
