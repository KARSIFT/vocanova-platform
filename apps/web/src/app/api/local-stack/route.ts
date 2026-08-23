import { getCloudflareContext } from "@opennextjs/cloudflare";

const LOCAL_STACK_MARKER = "voc081-local-stack-v1";
const INTERNAL_CONFIG_URL = "https://vocanova-api.internal/configz";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { env } = getCloudflareContext();
  if (
    env.ENVIRONMENT !== "local" ||
    request.headers.get("x-vocanova-local-stack") !== LOCAL_STACK_MARKER
  ) {
    return new Response(null, { status: 404 });
  }

  const upstream = await env.API.fetch(
    new Request(INTERNAL_CONFIG_URL, {
      headers: { Accept: "application/json" },
    }),
  );
  const headers = new Headers(upstream.headers);
  headers.set("x-vocanova-local-stack-marker", LOCAL_STACK_MARKER);
  headers.set("x-vocanova-local-stack-transport", "service-binding");
  return new Response(upstream.body, {
    headers,
    status: upstream.status,
    statusText: upstream.statusText,
  });
}
