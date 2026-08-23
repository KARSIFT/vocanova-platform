import process from "node:process";
import { fileURLToPath } from "node:url";

export async function runDeliverySmoke(options) {
  const {
    apiUrl,
    webUrl,
    environment,
    release,
    attempts,
    timeoutSeconds,
    fetchImpl = fetch,
    delay = (milliseconds) =>
      new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
  } = options;
  for (const [label, value] of [
    ["apiUrl", apiUrl],
    ["webUrl", webUrl],
  ]) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname.endsWith(".invalid")) {
      throw new Error(`${label} must be an authorized HTTPS route`);
    }
  }
  if (!["staging", "production"].includes(environment)) {
    throw new Error("environment must be staging or production");
  }
  if (!/^[0-9a-f]{40}$/.test(release)) {
    throw new Error("release must be an exact commit SHA");
  }
  if (!Number.isSafeInteger(attempts) || attempts < 1 || attempts > 20) {
    throw new Error("attempts must be an integer from 1 to 20");
  }
  if (
    !Number.isSafeInteger(timeoutSeconds) ||
    timeoutSeconds < 1 ||
    timeoutSeconds > 900
  ) {
    throw new Error("timeoutSeconds must be an integer from 1 to 900");
  }

  const deadline = Date.now() + timeoutSeconds * 1_000;
  let lastError;
  for (
    let attempt = 1;
    attempt <= attempts && Date.now() < deadline;
    attempt += 1
  ) {
    try {
      await verifyApi(fetchImpl, apiUrl, environment, release);
      await verifyWeb(fetchImpl, webUrl);
      return { status: "pass", attempts: attempt, environment, release };
    } catch (error) {
      lastError = error;
      if (attempt < attempts && Date.now() < deadline) await delay(1_000);
    }
  }
  throw new Error(
    `Cloudflare ${environment} smoke failed within its bounded retry window: ${safeMessage(lastError)}`,
  );
}

async function verifyApi(fetchImpl, apiUrl, environment, release) {
  const [health, config, contract] = await Promise.all([
    fetchImpl(new URL("/healthz", apiUrl), requestOptions()),
    fetchImpl(new URL("/configz", apiUrl), requestOptions()),
    fetchImpl(new URL("/openapi.json", apiUrl), requestOptions()),
  ]);
  if (!health.ok || !config.ok || !contract.ok) {
    throw new Error(
      "API health, config, or contract endpoint was not successful",
    );
  }
  const healthBody = await health.json();
  if (healthBody.status !== "ok" || healthBody.database !== "ok") {
    throw new Error("API or D1 health evidence did not pass");
  }
  const configBody = await config.json();
  if (
    configBody.environment !== environment ||
    configBody.release !== release ||
    configBody.runtime !== "cloudflare-workers" ||
    configBody.data !== "d1" ||
    configBody.migrationStatus !== "full-api-parity"
  ) {
    throw new Error(
      "API configuration is not bound to the exact promoted release",
    );
  }
  const contractBody = await contract.json();
  if (contractBody.openapi !== "3.1.0" || !contractBody.paths?.["/healthz"]) {
    throw new Error("API contract evidence is incomplete");
  }
}

async function verifyWeb(fetchImpl, webUrl) {
  const response = await fetchImpl(new URL("/", webUrl), requestOptions());
  if (!response.ok) throw new Error("web route was not successful");
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error("web route did not return HTML");
  }
}

function requestOptions() {
  return {
    headers: { "cache-control": "no-cache" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  };
}

function safeMessage(error) {
  return error instanceof Error
    ? error.message
    : "unknown bounded smoke failure";
}

function argument(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing ${name}`);
  return argv[index + 1];
}

async function main(argv) {
  const result = await runDeliverySmoke({
    apiUrl: argument(argv, "--api-url"),
    webUrl: argument(argv, "--web-url"),
    environment: argument(argv, "--environment"),
    release: argument(argv, "--release"),
    attempts: Number(argument(argv, "--attempts")),
    timeoutSeconds: Number(argument(argv, "--timeout-seconds")),
  });
  console.log(JSON.stringify(result));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(safeMessage(error));
    process.exitCode = 1;
  });
}
