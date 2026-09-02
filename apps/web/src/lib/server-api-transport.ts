import { getCloudflareContext } from "@opennextjs/cloudflare";

const INTERNAL_API_ORIGIN = "https://vocanova-api.internal";

/**
 * Send a server-side API request through the Cloudflare service binding when
 * the app is running under OpenNext/workerd. The ordinary fetch fallback keeps
 * `next dev`, `next start`, and the pre-existing Node test harness usable while
 * the Worker API is unavailable during local fallback development.
 */
export function fetchApiFromServer(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const binding = getApiBinding();
  if (!binding) {
    return fetch(input, init);
  }

  const request = new Request(input, init);
  const serviceUrl = new URL(request.url);
  serviceUrl.protocol = "https:";
  serviceUrl.host = new URL(INTERNAL_API_ORIGIN).host;

  return binding.fetch(new Request(serviceUrl, request));
}

function getApiBinding(): Fetcher | null {
  try {
    return getCloudflareContext().env.API;
  } catch {
    return null;
  }
}
