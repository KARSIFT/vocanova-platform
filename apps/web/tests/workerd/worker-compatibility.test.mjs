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
});

test("an imported precompiled Module is the supported instantiate form", () => {
  const findings = scanProhibitedWasmForms(
    "fixture.mjs",
    'import compiledModule from "./fixture.wasm"; await WebAssembly.instantiate(compiledModule, imports);',
  );
  assert.deepEqual(findings, []);
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

test("inventory records dangerous unreachable modules without masking reachable imports", (t) => {
  const fixture = artifactFixture(t, 'import "./safe.js";');
  const manifest = inspectGeneratedArtifacts({
    repositoryRoot: fixture.root,
    openNextRoot: fixture.openNext,
    dryRunRoot: fixture.dryRun,
  });
  assert.ok(manifest.reachability.unreachable_modules >= 1);
  assert.equal(
    manifest.modules.find((module) => module.path === "dangerous.js")
      ?.reachability,
    "unreachable",
  );
  assert.ok(manifest.reachability.unreachable_wasm_findings.length > 0);

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
