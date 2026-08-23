import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  buildCompatibilityDryRunEnvironment,
  inspectGeneratedArtifacts,
  scanProhibitedWasmForms,
} from "../../scripts/check-worker-compatibility.mjs";

function assertRule(source, rule) {
  const findings = scanProhibitedWasmForms("fixture.mjs", source);
  assert.equal(findings.length, 1, `${source}: ${findings.join("\n")}`);
  assert.match(findings[0], new RegExp(rule));
}

test("unsupported Wasm compilation forms fail with named rules", () => {
  assertRule("WebAssembly.compile(bytes)", "prohibited-wasm-compile");
  assertRule(
    "WebAssembly.compileStreaming(stream)",
    "prohibited-wasm-compileStreaming",
  );
  assertRule(
    "WebAssembly.instantiateStreaming(stream, imports)",
    "prohibited-wasm-instantiateStreaming",
  );
  assertRule(
    "WebAssembly.instantiate(new ArrayBuffer(8), imports)",
    "prohibited-wasm-instantiate-buffer-source-or-unknown",
  );
  assertRule(
    "WebAssembly.instantiate(new Uint8Array(bytes), imports)",
    "prohibited-wasm-instantiate-buffer-source-or-unknown",
  );
  assertRule(
    "WebAssembly.instantiate(new DataView(bytes), imports)",
    "prohibited-wasm-instantiate-buffer-source-or-unknown",
  );
});

test("computed and aliased Wasm methods are not missed by the detector", () => {
  assertRule(
    "const w=WebAssembly;const c=w[\"compile\"];c(bytes)",
    "prohibited-wasm-compile",
  );
  assertRule(
    "const {instantiate:i}=WebAssembly;i(bytes,imports)",
    "prohibited-wasm-instantiate-buffer-source-or-unknown",
  );
  assertRule(
    "globalThis.WebAssembly.compile(bytes)",
    "prohibited-wasm-compile",
  );
  assertRule(
    'self["WebAssembly"]["compileStreaming"](stream)',
    "prohibited-wasm-compileStreaming",
  );
  assertRule(
    "const root=global;const wasm=root.WebAssembly;wasm.instantiateStreaming(stream,imports)",
    "prohibited-wasm-instantiateStreaming",
  );
  assertRule(
    "const {WebAssembly:wasm}=globalThis;const instantiate=wasm['instantiate'];instantiate(bytes,imports)",
    "prohibited-wasm-instantiate-buffer-source-or-unknown",
  );
  assertRule(
    "const {WebAssembly}=self;const {compile}=WebAssembly;compile(bytes)",
    "prohibited-wasm-compile",
  );
});

test("an imported precompiled Module is the supported instantiate form", () => {
  const findings = scanProhibitedWasmForms(
    "fixture.mjs",
    'import compiledModule from "./fixture.wasm"; await WebAssembly.instantiate(compiledModule, imports);',
  );
  assert.deepEqual(findings, []);
});

test("reassigned, unknown, and lexically shadowed Wasm inputs fail closed", () => {
  for (const source of [
    'import compiledModule from "./fixture.wasm"; compiledModule=bytes; WebAssembly.instantiate(compiledModule,imports);',
    'import compiledModule from "./fixture.wasm"; function run(compiledModule){ WebAssembly.instantiate(compiledModule,imports); }',
    'import compiledModule from "./fixture.wasm"; { const compiledModule=bytes; WebAssembly.instantiate(compiledModule,imports); }',
    'import compiledModule from "./fixture.wasm"; function run(){ const compiledModule=bytes; WebAssembly.instantiate(compiledModule,imports); }',
    "WebAssembly.instantiate(unknownModule,imports);",
  ]) {
    assertRule(
      source,
      "prohibited-wasm-instantiate-buffer-source-or-unknown",
    );
  }
});

test("named function and class scopes cannot masquerade as imported Wasm Modules", () => {
  for (const source of [
    'import compiledModule from "./fixture.wasm"; const f=function compiledModule(){ WebAssembly.instantiate(compiledModule,imports); };',
    'import compiledModule from "./fixture.wasm"; { function compiledModule(){ WebAssembly.instantiate(compiledModule,imports); } }',
    'import compiledModule from "./fixture.wasm"; const C=class compiledModule{ static { WebAssembly.instantiate(compiledModule,imports); } };',
    'import compiledModule from "./fixture.wasm"; { class compiledModule{ static { WebAssembly.instantiate(compiledModule,imports); } } }',
  ]) {
    assertRule(
      source,
      "prohibited-wasm-instantiate-buffer-source-or-unknown",
    );
  }
});

test("compatibility dry run receives only local execution environment", () => {
  const environment = buildCompatibilityDryRunEnvironment({
    runtimeDirectory: "/synthetic/compatibility-runtime",
    source: {
      AWS_SECRET_ACCESS_KEY: "aws-secret",
      CF_API_TOKEN: "cf-token",
      CLOUDFLARE_ACCOUNT_ID: "account-id",
      CLOUDFLARE_API_TOKEN: "cloudflare-token",
      FORCE_COLOR: "1",
      GH_TOKEN: "github-token",
      HOME: "/credentialed/home",
      LANG: "C.UTF-8",
      NEXT_PUBLIC_SENTRY_DSN: "https://public@sentry.invalid/1",
      NPM_TOKEN: "npm-token",
      PATH: "/synthetic/bin",
      SENTRY_AUTH_TOKEN: "sentry-token",
      SENTRY_CREDENTIAL: "sentry-credential",
      SENTRY_DSN: "https://server@sentry.invalid/2",
      TEMP: "/synthetic/temp",
      UNRELATED_DATABASE_PASSWORD: "database-password",
      XDG_CONFIG_HOME: "/credentialed/config",
    },
  });

  assert.deepEqual(environment, {
    CI: "true",
    FORCE_COLOR: "1",
    HOME: "/synthetic/compatibility-runtime/home",
    LANG: "C.UTF-8",
    NEXT_TELEMETRY_DISABLED: "1",
    PATH: "/synthetic/bin",
    TEMP: "/synthetic/temp",
    USERPROFILE: "/synthetic/compatibility-runtime/home",
    WRANGLER_SEND_METRICS: "false",
    XDG_CACHE_HOME: "/synthetic/compatibility-runtime/cache",
    XDG_CONFIG_HOME: "/synthetic/compatibility-runtime/config",
  });
  assert.doesNotMatch(
    JSON.stringify(environment),
    /aws-secret|token|account-id|sentry\.invalid|credential|database-password/,
  );
});

function artifactFixture(t, workerSource) {
  const root = mkdtempSync(join(tmpdir(), "voc083-artifacts-"));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const openNext = join(root, ".open-next");
  const dryRun = join(root, ".wrangler", "dry-run");
  mkdirSync(openNext, { recursive: true });
  mkdirSync(dryRun, { recursive: true });
  writeFileSync(join(openNext, "worker.js"), workerSource);
  writeFileSync(join(openNext, "safe.js"), "export default 1;");
  writeFileSync(join(openNext, "dangerous.js"), "WebAssembly.compile(bytes);");
  writeFileSync(join(dryRun, "main.js"), "export default {};");
  return { dryRun, openNext, root };
}

test("inventory rejects prohibited Wasm in every module, including unreachable modules", (t) => {
  const fixture = artifactFixture(t, 'import "./safe.js";');
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: fixture.root,
        openNextRoot: fixture.openNext,
        dryRunRoot: fixture.dryRun,
      }),
    /dangerous\.js:1:1: prohibited-wasm-compile/,
  );

  const reachable = artifactFixture(t, 'import "./dangerous.js";');
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: reachable.root,
        openNextRoot: reachable.openNext,
        dryRunRoot: reachable.dryRun,
      }),
    /prohibited-wasm-compile/,
  );
});

test("inventory rejects broken executable references in unreachable modules", (t) => {
  const fixture = artifactFixture(t, 'import "./safe.js";');
  writeFileSync(
    join(fixture.openNext, "dangerous.js"),
    'import "./missing-unreachable.js";',
  );
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: fixture.root,
        openNextRoot: fixture.openNext,
        dryRunRoot: fixture.dryRun,
      }),
    /dangerous\.js: missing referenced artifact \.\/missing-unreachable\.js/,
  );
});

test("inventory rejects relative source-code references as executable unknowns", (t) => {
  const fixture = artifactFixture(t, 'import "./source.ts";');
  writeFileSync(join(fixture.openNext, "dangerous.js"), "export default 1;");
  writeFileSync(join(fixture.openNext, "source.ts"), "export default 1;");
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: fixture.root,
        openNextRoot: fixture.openNext,
        dryRunRoot: fixture.dryRun,
      }),
    /worker\.js: unknown referenced artifact \.\/source\.ts/,
  );
});

test("inventory fails closed for missing, zero, partial, unknown, and escaping artifacts", (t) => {
  const missingEntry = artifactFixture(t, 'import "./safe.js";');
  rmSync(join(missingEntry.openNext, "worker.js"));
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: missingEntry.root,
        openNextRoot: missingEntry.openNext,
        dryRunRoot: missingEntry.dryRun,
      }),
    /OpenNext Worker entry is missing/,
  );

  const zeroDryRun = artifactFixture(t, 'import "./safe.js";');
  rmSync(zeroDryRun.dryRun, { recursive: true });
  mkdirSync(zeroDryRun.dryRun, { recursive: true });
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: zeroDryRun.root,
        openNextRoot: zeroDryRun.openNext,
        dryRunRoot: zeroDryRun.dryRun,
      }),
    /Wrangler dry-run modules=0/,
  );

  const broken = artifactFixture(t, 'import "./missing.js";');
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: broken.root,
        openNextRoot: broken.openNext,
        dryRunRoot: broken.dryRun,
      }),
    /missing referenced artifact \.\/missing\.js/,
  );

  const unknown = artifactFixture(t, 'import "./safe.js";');
  writeFileSync(join(unknown.openNext, "unclassified.bin"), "artifact");
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: unknown.root,
        openNextRoot: unknown.openNext,
        dryRunRoot: unknown.dryRun,
      }),
    /unclassified assets: .*unclassified\.bin/,
  );

  const escaping = artifactFixture(t, 'import "./safe.js";');
  const outside = join(escaping.root, "outside.js");
  writeFileSync(outside, "export default 1;");
  symlinkSync(outside, join(escaping.openNext, "escape.js"));
  assert.throws(
    () =>
      inspectGeneratedArtifacts({
        repositoryRoot: escaping.root,
        openNextRoot: escaping.openNext,
        dryRunRoot: escaping.dryRun,
      }),
    /escapes opennext root: .*escape\.js/,
  );
});
