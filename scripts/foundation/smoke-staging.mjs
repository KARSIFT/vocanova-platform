import { pathToFileURL } from "node:url";

const API_ORIGIN = "https://api-stag.vocanova.site";
const WEB_ORIGIN = "https://stag.vocanova.site";

async function get(url, fetchImpl, timeoutSignal) {
  const response = await fetchImpl(url, {
    redirect: "error",
    signal: timeoutSignal(10_000),
  });
  if (!response.ok) {
    throw new Error(
      `${new URL(url).pathname || "/"} returned HTTP ${response.status}`,
    );
  }
  return response;
}

export async function smokeStaging(
  expectedRelease,
  fetchImpl = fetch,
  timeoutSignal = AbortSignal.timeout,
) {
  const healthResponse = await get(
    `${API_ORIGIN}/healthz`,
    fetchImpl,
    timeoutSignal,
  );
  const health = await healthResponse.json();
  if (health.status !== "ok" || health.database !== "ok") {
    throw new Error(
      `/healthz is not healthy: status=${String(health.status)}, database=${String(health.database)}`,
    );
  }

  const configResponse = await get(
    `${API_ORIGIN}/configz`,
    fetchImpl,
    timeoutSignal,
  );
  const config = await configResponse.json();
  if (config.environment !== "staging") {
    throw new Error(
      `/configz reported environment ${String(config.environment)}`,
    );
  }
  if (config.release !== expectedRelease) {
    throw new Error(
      `expected release ${expectedRelease}, but /configz reported ${String(config.release)}`,
    );
  }

  await get(`${WEB_ORIGIN}/`, fetchImpl, timeoutSignal);
}

export async function runSmokeCli(
  expectedRelease,
  fetchImpl = fetch,
  timeoutSignal = AbortSignal.timeout,
) {
  if (!/^[0-9a-f]{40}$/.test(expectedRelease ?? "")) {
    throw new Error(
      "usage: node scripts/foundation/smoke-staging.mjs <40-character-git-sha>",
    );
  }

  const attempts = 12;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await smokeStaging(expectedRelease, fetchImpl, timeoutSignal);
      console.log(`Staging is healthy at release ${expectedRelease}.`);
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.warn(
        `Staging smoke attempt ${attempt}/${attempts} failed: ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runSmokeCli(process.argv[2]);
}
