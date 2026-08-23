/* global console, process */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = process.cwd();
const moduleRequire = createRequire(import.meta.url);
const wranglerBin = moduleRequire.resolve("wrangler");
const executableExtensions = new Set([".cjs", ".js", ".mjs"]);
const sourceCodeExtensions = new Set([
  ".astro",
  ".coffee",
  ".cts",
  ".jsx",
  ".mts",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]);
const knownAssetExtensions = new Set([
  ".avif",
  ".cache",
  ".css",
  ".gif",
  ".html",
  ".ico",
  ".jpg",
  ".jpeg",
  ".jsonc",
  ".md",
  ".json",
  ".map",
  ".png",
  ".svg",
  ".sql",
  ".ts",
  ".txt",
  ".wasm",
  ".webp",
  ".woff",
  ".woff2",
]);
const knownAssetBasenames = new Set(["BUILD_ID", "LICENSE", "README"]);
const dryRunDirectory = path.join(
  root,
  ".wrangler/dry-run/compatibility-local",
);
// Keep the evidence manifest outside both artifact roots.  Writing it below
// .open-next makes a later scan enumerate its own stale JSON and obscures the
// freshness/completeness invariant.
const manifestPath = path.join(
  root,
  ".wrangler/dry-run/compatibility-artifact-manifest.json",
);
const requiredOpenNextRuntimeModules = [
  ".build/durable-objects/bucket-cache-purge.js",
  ".build/durable-objects/queue.js",
  ".build/durable-objects/sharded-tag-cache.js",
  "cloudflare/images.js",
  "cloudflare/init.js",
  "cloudflare/next-env.mjs",
  "cloudflare/skew-protection.js",
  "middleware/handler.mjs",
  "middleware/open-next.config.mjs",
  "server-functions/default/apps/web/handler.mjs",
  "server-functions/default/handler.mjs",
  "worker.js",
];
const compatibilityEnvironmentPassthroughKeys = Object.freeze([
  "COLORTERM",
  "COMSPEC",
  "FORCE_COLOR",
  "LANG",
  "LC_ALL",
  "NO_COLOR",
  "PATH",
  "PATHEXT",
  "SYSTEMROOT",
  "TEMP",
  "TERM",
  "TMP",
  "TMPDIR",
  "TZ",
  "WINDIR",
]);

export function validateSourceCompatibility(repositoryRoot = root) {
  const middleware = read(path.join(repositoryRoot, "src/middleware.ts"));
  const transport = read(
    path.join(repositoryRoot, "src/lib/server-api-transport.ts"),
  );
  const wranglerConfig = read(path.join(repositoryRoot, "wrangler.jsonc"));

  assert.doesNotMatch(
    middleware,
    /export\s+const\s+runtime\s*=\s*["']nodejs["']/,
    "Cloudflare OpenNext does not support Node.js middleware",
  );
  assert.match(transport, /getCloudflareContext\(\)\.env\.API/);
  assert.match(transport, /binding\.fetch\(/);
  assert.doesNotMatch(wranglerConfig, /["']remote["']\s*:\s*true/);
  assert.doesNotMatch(
    wranglerConfig,
    /(api[_-]?token|account[_-]?id|password|secret)\s*["']?\s*:/i,
    "Wrangler configuration must not contain credentials or secret values",
  );

  const configPath = ts.findConfigFile(
    repositoryRoot,
    ts.sys.fileExists,
    "tsconfig.json",
  );
  assert.ok(configPath, "tsconfig.json not found");
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, ts.sys);
  assert.ok(parsed, "unable to parse tsconfig.json");
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const findings = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.fileName.startsWith(path.join(repositoryRoot, "src"))) {
      continue;
    }
    const source = sourceFile.getFullText();
    for (const pattern of [
      /\bBuffer\s*\./g,
      /from\s+["']node:(?:child_process|cluster|dgram|fs|net|tls|worker_threads)["']/g,
      /\b(?:request|response)\.(?:arrayBuffer|blob|bytes|text)\(\)/g,
    ]) {
      for (const match of source.matchAll(pattern)) {
        findings.push(
          `${relative(repositoryRoot, sourceFile.fileName)}: unsupported/unbounded pattern ${match[0]}`,
        );
      }
    }

    visit(sourceFile);

    function visit(node) {
      if (
        ts.isExpressionStatement(node) &&
        isPromiseLike(checker, node.expression)
      ) {
        const position = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(),
        );
        findings.push(
          `${relative(repositoryRoot, sourceFile.fileName)}:${position.line + 1}: floating Promise expression`,
        );
      }
      ts.forEachChild(node, visit);
    }
  }

  assert.deepEqual(findings, [], findings.join("\n"));
}

export function inspectGeneratedArtifacts({
  repositoryRoot = root,
  openNextRoot = path.join(repositoryRoot, ".open-next"),
  dryRunRoot = dryRunDirectory,
} = {}) {
  const realOpenNextRoot = requireDirectory(openNextRoot, "OpenNext root");
  const realDryRunRoot = requireDirectory(dryRunRoot, "Wrangler dry-run root");
  const entry = requireRegularNonEmptyFile(
    path.join(realOpenNextRoot, "worker.js"),
    "OpenNext Worker entry",
  );

  const modules = new Map();
  const emptyModules = new Map();
  const assets = new Map();
  const unknowns = new Map();
  collectArtifactInventory({
    assets,
    emptyModules,
    modules,
    unknowns,
    owner: "opennext",
    root: realOpenNextRoot,
  });
  collectArtifactInventory({
    assets,
    emptyModules,
    modules,
    unknowns,
    owner: "wrangler-dry-run",
    root: realDryRunRoot,
  });

  if (!modules.has(manifestKey("opennext", realOpenNextRoot, entry))) {
    throw new Error(
      "Generated inventory omitted required .open-next/worker.js",
    );
  }
  const openNextModules = [...modules.values()].filter(
    (module) => module.owner === "opennext",
  );
  const dryRunModules = [...modules.values()].filter(
    (module) => module.owner === "wrangler-dry-run",
  );
  if (openNextModules.length === 0 || dryRunModules.length === 0) {
    throw new Error(
      `Generated inventory is incomplete: OpenNext modules=${String(openNextModules.length)}, Wrangler dry-run modules=${String(dryRunModules.length)}`,
    );
  }
  if (unknowns.size > 0) {
    const paths = [...unknowns.values()]
      .map((record) => record.relativePath)
      .sort()
      .join(", ");
    throw new Error(
      `Generated inventory contains unclassified assets: ${paths}`,
    );
  }
  if (modules.size === 0) {
    throw new Error("Generated inventory contains zero JavaScript modules");
  }

  const moduleKeys = new Map(
    [...modules.values()].map((module) => [
      manifestKey(module.owner, module.root, module.absolutePath),
      module,
    ]),
  );
  const referencesByModule = new Map();
  const reachable = new Set();
  const roots = [
    manifestKey("opennext", realOpenNextRoot, entry),
    ...dryRunModules.map((module) =>
      manifestKey(module.owner, module.root, module.absolutePath),
    ),
  ];

  function referencesFor(module) {
    const key = manifestKey(module.owner, module.root, module.absolutePath);
    if (!referencesByModule.has(key)) {
      const source = read(module.absolutePath);
      referencesByModule.set(
        key,
        collectExecutableReferences(module.relativePath, source).map(
          (reference) => ({
            ...reference,
            resolved: resolveReference(module, reference, modules, assets),
          }),
        ),
      );
    }
    return referencesByModule.get(key);
  }

  function visit(key) {
    if (reachable.has(key)) return;
    const module = moduleKeys.get(key);
    if (!module) return;
    reachable.add(key);
    for (const reference of referencesFor(module)) {
      if (reference.resolved.kind === "module") visit(reference.resolved.key);
    }
  }
  for (const key of roots) visit(key);

  const findings = [];
  const references = [];
  for (const module of modules.values()) {
    const key = manifestKey(module.owner, module.root, module.absolutePath);
    const isReachable = reachable.has(key);
    const source = read(module.absolutePath);
    for (const reference of referencesFor(module)) {
      references.push({
        classification: reference.resolved.kind,
        line: reference.line,
        module: module.relativePath,
        owner: module.owner,
        reachable: isReachable,
        specifier: reference.specifier,
      });
      if (
        ["escaping", "missing", "unknown"].includes(reference.resolved.kind)
      ) {
        findings.push(
          `${module.relativePath}: ${reference.resolved.kind} referenced artifact ${reference.specifier}`,
        );
      }
    }
    for (const finding of scanProhibitedWasmForms(
      module.relativePath,
      source,
    )) {
      findings.push(finding);
    }
  }

  assert.deepEqual(findings, [], findings.join("\n"));

  const manifest = {
    schema_version: 1,
    generated_at: "deterministic-local-validation",
    roots: {
      opennext: ".open-next",
      wrangler_dry_run: path.relative(repositoryRoot, realDryRunRoot),
    },
    modules: [...modules.values()].map((module) => ({
      digest: module.digest,
      owner: module.owner,
      path: module.relativePath,
      reachability: reachable.has(
        manifestKey(module.owner, module.root, module.absolutePath),
      )
        ? "reachable"
        : "unreachable",
      size: module.size,
    })),
    assets: [...assets.values()].map((asset) => ({
      digest: asset.digest,
      owner: asset.owner,
      path: asset.relativePath,
      size: asset.size,
    })),
    empty_modules: [...emptyModules.values()].map((module) => ({
      digest: module.digest,
      owner: module.owner,
      path: module.relativePath,
      size: module.size,
    })),
    unknowns: [...unknowns.values()].map((unknown) => ({
      digest: unknown.digest,
      owner: unknown.owner,
      path: unknown.relativePath,
      size: unknown.size,
    })),
    references,
    reachability: {
      roots: roots.map((key) => moduleKeys.get(key)?.relativePath ?? key),
      reachable_modules: [...reachable].length,
      unreachable_modules: modules.size - reachable.size,
    },
  };
  manifest.modules.sort(compareManifestRecords);
  manifest.assets.sort(compareManifestRecords);
  manifest.empty_modules.sort(compareManifestRecords);
  manifest.unknowns.sort(compareManifestRecords);
  manifest.references.sort(
    (left, right) =>
      left.module.localeCompare(right.module) ||
      left.line - right.line ||
      left.specifier.localeCompare(right.specifier),
  );
  return manifest;
}

export function canonicalizeOpenNextOutput({
  repositoryRoot = root,
  openNextRoot = path.join(repositoryRoot, ".open-next"),
} = {}) {
  const realOpenNextRoot = requireDirectory(openNextRoot, "OpenNext root");
  const workerEntry = requireRegularNonEmptyFile(
    path.join(realOpenNextRoot, "worker.js"),
    "OpenNext Worker entry",
  );
  const serverFunctionRoot = requireDirectory(
    path.join(realOpenNextRoot, "server-functions/default"),
    "OpenNext default server-function root",
  );
  const forwardingHandler = requireRegularNonEmptyFile(
    path.join(serverFunctionRoot, "handler.mjs"),
    "OpenNext forwarding handler",
  );
  const bundledHandler = requireRegularNonEmptyFile(
    path.join(serverFunctionRoot, "apps/web/handler.mjs"),
    "OpenNext bundled handler",
  );
  const bundleMetadataPath = requireRegularNonEmptyFile(
    `${bundledHandler}.meta.json`,
    "OpenNext bundled-handler metadata",
  );

  const workerReferences = collectExecutableReferences(
    relative(realOpenNextRoot, workerEntry),
    read(workerEntry),
  ).map((reference) => reference.specifier);
  assert.ok(
    workerReferences.includes("./server-functions/default/handler.mjs"),
    "OpenNext Worker must import the canonical default forwarding handler",
  );
  assert.deepEqual(
    collectExecutableReferences(
      relative(realOpenNextRoot, forwardingHandler),
      read(forwardingHandler),
    ).map((reference) => reference.specifier),
    ["./apps/web/handler.mjs"],
    "OpenNext forwarding handler must point only to the final bundled handler",
  );

  const bundleMetadata = JSON.parse(read(bundleMetadataPath));
  const outputRecords = Object.entries(bundleMetadata.outputs ?? {});
  assert.equal(
    outputRecords.length,
    1,
    "OpenNext bundled-handler metadata must describe exactly one output",
  );
  const [metadataOutputPath, metadataOutput] = outputRecords[0];
  assert.equal(
    realpathSync(path.resolve(repositoryRoot, metadataOutputPath)),
    bundledHandler,
    "OpenNext bundled-handler metadata output path drifted",
  );
  assert.ok(
    Number.isSafeInteger(metadataOutput.bytes) && metadataOutput.bytes > 0,
    "OpenNext bundled-handler metadata must record a non-empty output",
  );
  assert.ok(
    Array.isArray(metadataOutput.imports) &&
      metadataOutput.imports.every((record) => record.external === true),
    "OpenNext final handler must be self-contained apart from declared platform externals",
  );
  assert.ok(
    Object.keys(bundleMetadata.inputs ?? {}).length > 0,
    "OpenNext bundled-handler metadata must identify its bundled inputs",
  );

  const retainedRuntimeModules = new Set(
    requiredOpenNextRuntimeModules.map((relativePath) =>
      requireRegularNonEmptyFile(
        path.join(realOpenNextRoot, relativePath),
        `OpenNext runtime module ${relativePath}`,
      ),
    ),
  );
  const assetRoot = requireDirectory(
    path.join(realOpenNextRoot, "assets"),
    "OpenNext static-asset root",
  );
  const modules = new Map();
  const emptyModules = new Map();
  collectArtifactInventory({
    assets: new Map(),
    emptyModules,
    modules,
    owner: "opennext",
    root: realOpenNextRoot,
    unknowns: new Map(),
  });
  const retainedAssetModules = new Set(
    [...modules.values(), ...emptyModules.values()]
      .filter((module) => isWithin(assetRoot, module.absolutePath))
      .map((module) => module.absolutePath),
  );
  const retained = new Set([
    ...retainedRuntimeModules,
    ...retainedAssetModules,
  ]);
  const removed = [...modules.values(), ...emptyModules.values()]
    .filter((module) => !retained.has(module.absolutePath))
    .map((module) => ({
      digest: module.digest,
      path: module.relativePath,
      size: module.size,
    }))
    .sort(compareManifestRecords);
  assert.ok(
    removed.length > 0,
    "OpenNext canonicalization expected traced JavaScript intermediates",
  );
  for (const module of [...modules.values(), ...emptyModules.values()]) {
    if (!retained.has(module.absolutePath)) rmSync(module.absolutePath);
  }

  const canonicalizationManifest = {
    schema_version: 1,
    generated_at: "deterministic-local-validation",
    reason:
      "OpenNext esbuild final-handler bundle supersedes copied standalone JavaScript inputs",
    bundle: {
      digest: digestFile(bundledHandler),
      external_imports: metadataOutput.imports
        .map((record) => record.path)
        .sort(),
      input_count: Object.keys(bundleMetadata.inputs).length,
      metadata: relative(realOpenNextRoot, bundleMetadataPath),
      pre_open_next_patch_size: metadataOutput.bytes,
      path: relative(realOpenNextRoot, bundledHandler),
      size: statSync(bundledHandler).size,
    },
    retained_runtime_modules: [...retainedRuntimeModules]
      .map((file) => ({
        digest: digestFile(file),
        path: relative(realOpenNextRoot, file),
        size: statSync(file).size,
      }))
      .sort(compareManifestRecords),
    retained_static_asset_modules: [...retainedAssetModules]
      .map((file) => ({
        digest: digestFile(file),
        path: relative(realOpenNextRoot, file),
        size: statSync(file).size,
      }))
      .sort(compareManifestRecords),
    removed_intermediate_modules: removed,
  };
  writeFileSync(
    path.join(realOpenNextRoot, "canonicalization-manifest.json"),
    `${JSON.stringify(canonicalizationManifest, null, 2)}\n`,
  );
  return canonicalizationManifest;
}

export function validateOpenNextCanonicalization({
  artifactManifest,
  repositoryRoot = root,
  openNextRoot = path.join(repositoryRoot, ".open-next"),
} = {}) {
  assert.ok(artifactManifest, "generated artifact manifest is required");
  const realOpenNextRoot = requireDirectory(openNextRoot, "OpenNext root");
  const canonicalizationPath = requireRegularNonEmptyFile(
    path.join(realOpenNextRoot, "canonicalization-manifest.json"),
    "OpenNext canonicalization manifest",
  );
  const canonicalization = JSON.parse(read(canonicalizationPath));
  assert.equal(canonicalization.schema_version, 1);
  assert.equal(
    canonicalization.reason,
    "OpenNext esbuild final-handler bundle supersedes copied standalone JavaScript inputs",
  );
  assert.ok(
    Number.isSafeInteger(canonicalization.bundle?.input_count) &&
      canonicalization.bundle.input_count > 0,
    "OpenNext canonicalization must record final-bundle inputs",
  );

  const retainedRuntime = validateCanonicalRecords(
    canonicalization.retained_runtime_modules,
    "retained runtime modules",
  );
  assert.deepEqual(
    [...retainedRuntime.keys()].sort(),
    [...requiredOpenNextRuntimeModules].sort(),
    "OpenNext canonical runtime-module set drifted",
  );
  const retainedStatic = validateCanonicalRecords(
    canonicalization.retained_static_asset_modules,
    "retained static asset modules",
  );
  for (const relativePath of retainedStatic.keys()) {
    assert.ok(
      relativePath.startsWith("assets/"),
      `canonical static module is outside assets/: ${relativePath}`,
    );
  }
  const removed = validateCanonicalRecords(
    canonicalization.removed_intermediate_modules,
    "removed intermediate modules",
  );
  assert.ok(removed.size > 0, "canonicalization must record removed modules");

  const actualOpenNextModules = new Map(
    [...artifactManifest.modules, ...artifactManifest.empty_modules]
      .filter((record) => record.owner === "opennext")
      .map((record) => [record.path, record]),
  );
  const expectedRetained = new Map([...retainedRuntime, ...retainedStatic]);
  assert.deepEqual(
    [...actualOpenNextModules.keys()].sort(),
    [...expectedRetained.keys()].sort(),
    "post-canonicalization OpenNext module inventory does not match the retained record",
  );
  for (const [relativePath, recorded] of expectedRetained) {
    const actual = actualOpenNextModules.get(relativePath);
    assert.equal(
      actual.digest,
      recorded.digest,
      `canonical retained-module digest drifted: ${relativePath}`,
    );
    assert.equal(
      actual.size,
      recorded.size,
      `canonical retained-module size drifted: ${relativePath}`,
    );
  }
  for (const relativePath of removed.keys()) {
    assert.ok(
      !existsSync(path.join(realOpenNextRoot, relativePath)),
      `canonical removed module is still present: ${relativePath}`,
    );
  }
  return canonicalization;
}

function validateCanonicalRecords(records, label) {
  assert.ok(Array.isArray(records), `${label} must be an array`);
  const byPath = new Map();
  for (const record of records) {
    assert.equal(typeof record?.path, "string", `${label} path is invalid`);
    assert.match(
      record.path,
      /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$)).+$/,
      `${label} path escapes its artifact root`,
    );
    assert.match(
      record.digest,
      /^sha256:[a-f0-9]{64}$/,
      `${label} digest is invalid: ${record.path}`,
    );
    assert.ok(
      Number.isSafeInteger(record.size) && record.size >= 0,
      `${label} size is invalid: ${record.path}`,
    );
    assert.ok(
      !byPath.has(record.path),
      `${label} has duplicate ${record.path}`,
    );
    byPath.set(record.path, record);
  }
  return byPath;
}

export function scanProhibitedWasmForms(filePath, source) {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const wasmModuleBindings = collectWasmModuleBindings(sourceFile);
  const findings = [];

  visit(sourceFile);
  return findings;

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const rule = classifyWasmCall(node, wasmModuleBindings);
      if (rule) {
        const position = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        findings.push(
          `${filePath}:${position.line + 1}:${position.character + 1}: ${rule}`,
        );
      }
    }
    ts.forEachChild(node, visit);
  }
}

export function runFreshWranglerDryRun({
  repositoryRoot = root,
  outputDirectory = dryRunDirectory,
} = {}) {
  rmSync(outputDirectory, { force: true, recursive: true });
  mkdirSync(path.dirname(outputDirectory), { recursive: true });
  const runtimeDirectory = mkdtempSync(
    path.join(tmpdir(), "vocanova-wrangler-compatibility-"),
  );
  try {
    const environment = buildCompatibilityDryRunEnvironment({
      runtimeDirectory,
    });
    for (const directory of [
      environment.HOME,
      environment.XDG_CACHE_HOME,
      environment.XDG_CONFIG_HOME,
    ]) {
      mkdirSync(directory, { recursive: true });
    }
    const result = spawnSync(
      process.execPath,
      [
        wranglerBin,
        "deploy",
        "--dry-run",
        "--experimental-provision=false",
        "--experimental-auto-create=false",
        "--env=",
        "--outdir",
        outputDirectory,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: environment,
        maxBuffer: 16 * 1_048_576,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `Wrangler compatibility dry run failed with exit code ${String(result.status)}\n${redactAndBound(result.stdout)}\n${redactAndBound(result.stderr)}`,
      );
    }
  } finally {
    rmSync(runtimeDirectory, { force: true, recursive: true });
  }
}

export function buildCompatibilityDryRunEnvironment({
  runtimeDirectory,
  source = process.env,
} = {}) {
  assert.equal(
    typeof runtimeDirectory,
    "string",
    "compatibility runtimeDirectory is required",
  );
  assert.notEqual(
    runtimeDirectory,
    "",
    "compatibility runtimeDirectory is required",
  );
  const environment = {};
  for (const key of compatibilityEnvironmentPassthroughKeys) {
    if (typeof source[key] === "string" && source[key] !== "") {
      environment[key] = source[key];
    }
  }
  const controlledHome = path.join(runtimeDirectory, "home");
  return Object.freeze({
    ...environment,
    CI: "true",
    HOME: controlledHome,
    NEXT_TELEMETRY_DISABLED: "1",
    USERPROFILE: controlledHome,
    WRANGLER_SEND_METRICS: "false",
    XDG_CACHE_HOME: path.join(runtimeDirectory, "cache"),
    XDG_CONFIG_HOME: path.join(runtimeDirectory, "config"),
  });
}

function isPromiseLike(checker, node) {
  if (ts.isAwaitExpression(node) || ts.isVoidExpression(node)) return false;
  const type = checker.getTypeAtLocation(node);
  return checker.getPropertyOfType(type, "then") !== undefined;
}

function collectArtifactInventory({
  assets,
  emptyModules,
  modules,
  owner,
  root: artifactRoot,
  unknowns,
}) {
  const stack = [artifactRoot];
  while (stack.length > 0) {
    const directory = stack.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const real = realpathSync(absolute);
      if (!isWithin(artifactRoot, real)) {
        throw new Error(
          `Generated artifact escapes ${owner} root: ${absolute}`,
        );
      }
      const target = statSync(real);
      if (entry.isDirectory() || target.isDirectory()) {
        stack.push(real);
        continue;
      }
      if (!entry.isFile() && !target.isFile()) {
        throw new Error(
          `Generated artifact is not a regular file: ${absolute}`,
        );
      }
      // Resolve symlinks before classifying; generated pnpm package trees use
      // extensionless links (for example `client-only`) to regular modules.
      const extension = path.extname(real).toLowerCase();
      const size = target.size;
      const relativePath = path
        .relative(artifactRoot, real)
        .replaceAll("\\", "/");
      const record = Object.freeze({
        absolutePath: real,
        digest: digestFile(real),
        owner,
        relativePath,
        root: artifactRoot,
        size,
      });
      if (executableExtensions.has(extension)) {
        if (size === 0) {
          // OpenNext emits intentional empty conditional-export shims (for
          // example client-only/index.js). They are recorded explicitly as
          // empty_modules and are never runtime roots; a root with no
          // non-empty module still fails the per-owner inventory invariant.
          emptyModules.set(manifestKey(owner, artifactRoot, real), record);
          continue;
        }
        modules.set(manifestKey(owner, artifactRoot, real), record);
      } else if (
        knownAssetExtensions.has(extension) ||
        knownAssetBasenames.has(path.basename(real))
      ) {
        assets.set(manifestKey(owner, artifactRoot, real), record);
      } else {
        unknowns.set(manifestKey(owner, artifactRoot, real), record);
      }
    }
  }
}

function collectExecutableReferences(filePath, source) {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const references = [];

  visit(sourceFile);
  return references;

  function add(specifier, node) {
    if (!specifier.startsWith(".")) return;
    const position = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile),
    );
    references.push({
      line: position.line + 1,
      specifier,
    });
  }

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      add(node.moduleSpecifier.text, node);
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "require" &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      add(node.arguments[0].text, node);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      add(node.arguments[0].text, node);
    }
    ts.forEachChild(node, visit);
  }
}

function collectWasmModuleBindings(sourceFile) {
  // Track the small set of static alias shapes emitted by minifiers and
  // bundlers.  A direct `WebAssembly.compile` check misses e.g.
  // `const w = WebAssembly; const c = w.compile; c(bytes)`, while treating
  // every `instantiate` as unsafe rejects the supported imported Module form.
  const bindings = new Map();
  const wasmModuleBindings = new Set();
  const reassignedWasmModuleBindings = new Set();
  bindings.set("WebAssembly", { kind: "namespace" });
  for (const globalObject of ["globalThis", "self", "global"]) {
    bindings.set(globalObject, { kind: "global-object" });
  }

  function setBinding(name, value) {
    if (ts.isIdentifier(name) && value) bindings.set(name.text, value);
  }

  function bindPattern(pattern, value) {
    if (ts.isIdentifier(pattern)) {
      setBinding(pattern, value);
      return;
    }
    if (!ts.isObjectBindingPattern(pattern) || !value) return;
    for (const element of pattern.elements) {
      if (!ts.isBindingElement(element)) continue;
      const property = propertyName(element.propertyName ?? element.name);
      if (property === undefined) continue;
      if (value.kind === "namespace") {
        setBinding(element.name, { kind: "method", method: property });
      } else if (value.kind === "global-object" && property === "WebAssembly") {
        setBinding(element.name, { kind: "namespace" });
      }
    }
  }

  function collect(node) {
    if (ts.isImportDeclaration(node) && node.importClause) {
      const source = node.moduleSpecifier;
      if (
        ts.isStringLiteralLike(source) &&
        path.extname(source.text).toLowerCase() === ".wasm"
      ) {
        const { importClause } = node;
        if (importClause.name) wasmModuleBindings.add(importClause.name.text);
        if (importClause.namedBindings) {
          if (ts.isNamespaceImport(importClause.namedBindings)) {
            wasmModuleBindings.add(importClause.namedBindings.name.text);
          } else {
            for (const element of importClause.namedBindings.elements) {
              wasmModuleBindings.add(element.name.text);
            }
          }
        }
      }
    }
    if (ts.isVariableDeclaration(node)) {
      const value = wasmReference(node.initializer);
      bindPattern(node.name, value);
    } else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(node.left)
    ) {
      setBinding(node.left, wasmReference(node.right));
    }
    ts.forEachChild(node, collect);
  }

  function wasmReference(node) {
    if (!node) return null;
    if (ts.isIdentifier(node) && wasmModuleBindings.has(node.text)) {
      return { kind: "module" };
    }
    if (ts.isIdentifier(node)) return bindings.get(node.text) ?? null;
    if (ts.isParenthesizedExpression(node))
      return wasmReference(node.expression);
    const property = propertyAccess(node);
    if (property) {
      const object = wasmReference(property.object);
      if (
        object?.kind === "global-object" &&
        property.property === "WebAssembly"
      ) {
        return { kind: "namespace" };
      }
      if (object?.kind === "namespace") {
        return { kind: "method", method: property.property };
      }
    }
    return null;
  }

  collect(sourceFile);
  collectWrites(sourceFile);
  return {
    bindings,
    isStableModule(identifier) {
      return (
        ts.isIdentifier(identifier) &&
        wasmModuleBindings.has(identifier.text) &&
        !reassignedWasmModuleBindings.has(identifier.text) &&
        !isLexicallyShadowed(identifier, identifier.text)
      );
    },
    reference: wasmReference,
  };

  function collectWrites(node) {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
      node.operatorToken.kind <= ts.SyntaxKind.LastAssignment
    ) {
      recordWrittenBindings(node.left);
    } else if (
      (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
      [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(
        node.operator,
      )
    ) {
      recordWrittenBindings(node.operand);
    } else if (
      (ts.isForInStatement(node) || ts.isForOfStatement(node)) &&
      !ts.isVariableDeclarationList(node.initializer)
    ) {
      recordWrittenBindings(node.initializer);
    }
    ts.forEachChild(node, collectWrites);
  }

  function recordWrittenBindings(node) {
    if (ts.isIdentifier(node)) {
      if (
        wasmModuleBindings.has(node.text) &&
        !isLexicallyShadowed(node, node.text)
      ) {
        reassignedWasmModuleBindings.add(node.text);
      }
      return;
    }
    if (
      ts.isArrayLiteralExpression(node) ||
      ts.isObjectLiteralExpression(node)
    ) {
      for (const element of node.elements ?? node.properties) {
        if (ts.isSpreadElement(element))
          recordWrittenBindings(element.expression);
        else if (ts.isShorthandPropertyAssignment(element)) {
          recordWrittenBindings(element.name);
        } else if (ts.isPropertyAssignment(element)) {
          recordWrittenBindings(element.initializer);
        } else if (ts.isIdentifier(element)) {
          recordWrittenBindings(element);
        }
      }
    }
  }

  function isLexicallyShadowed(identifier, name) {
    for (
      let ancestor = identifier.parent;
      ancestor && !ts.isSourceFile(ancestor);
      ancestor = ancestor.parent
    ) {
      if (functionLikeBindsName(ancestor, name)) return true;
      if (
        (ts.isBlock(ancestor) || ts.isModuleBlock(ancestor)) &&
        ancestor.statements.some((statement) =>
          statementBindsName(statement, name),
        )
      ) {
        return true;
      }
      if (
        ts.isCatchClause(ancestor) &&
        ancestor.variableDeclaration &&
        bindingNameContains(ancestor.variableDeclaration.name, name)
      ) {
        return true;
      }
      if (
        (ts.isForStatement(ancestor) ||
          ts.isForInStatement(ancestor) ||
          ts.isForOfStatement(ancestor)) &&
        ancestor.initializer &&
        ts.isVariableDeclarationList(ancestor.initializer) &&
        ancestor.initializer.declarations.some((declaration) =>
          bindingNameContains(declaration.name, name),
        )
      ) {
        return true;
      }
    }
    return false;
  }
}

function classifyWasmCall(node, wasmModuleBindings) {
  const methodReference = wasmModuleBindings.reference(node.expression);
  const method =
    methodReference?.kind === "method" ? methodReference.method : undefined;
  if (method === "compile") return "prohibited-wasm-compile";
  if (method === "compileStreaming") {
    return "prohibited-wasm-compileStreaming";
  }
  if (method === "instantiateStreaming") {
    return "prohibited-wasm-instantiateStreaming";
  }
  if (method !== "instantiate") return null;

  const [firstArgument] = node.arguments;
  if (firstArgument && wasmModuleBindings.isStableModule(firstArgument)) {
    return null;
  }
  return "prohibited-wasm-instantiate-buffer-source-or-unknown";
}

function functionLikeBindsName(node, name) {
  if (!(
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  )) {
    return false;
  }
  return node.parameters.some((parameter) =>
    bindingNameContains(parameter.name, name),
  );
}

function statementBindsName(statement, name) {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.some((declaration) =>
      bindingNameContains(declaration.name, name),
    );
  }
  if (
    (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
    statement.name?.text === name
  ) {
    return true;
  }
  return false;
}

function bindingNameContains(bindingName, name) {
  if (ts.isIdentifier(bindingName)) return bindingName.text === name;
  return bindingName.elements.some(
    (element) =>
      ts.isBindingElement(element) && bindingNameContains(element.name, name),
  );
}

function propertyName(node) {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isStringLiteralLike(node)) return node.text;
  return undefined;
}

function propertyAccess(node) {
  if (ts.isPropertyAccessExpression(node)) {
    return { object: node.expression, property: node.name.text };
  }
  if (
    ts.isElementAccessExpression(node) &&
    node.argumentExpression &&
    ts.isStringLiteralLike(node.argumentExpression)
  ) {
    return { object: node.expression, property: node.argumentExpression.text };
  }
  return null;
}

function resolveReference(module, reference, modules, assets) {
  const base = path.dirname(module.absolutePath);
  const candidate = path.resolve(base, reference.specifier);
  if (!isWithin(module.root, candidate)) return { kind: "escaping" };
  const extension = path.extname(candidate).toLowerCase();
  if (executableExtensions.has(extension)) {
    const key = hasManifestRecord(module, candidate, modules);
    return key ? { key, kind: "module" } : { kind: "missing" };
  }
  if (sourceCodeExtensions.has(extension)) return { kind: "unknown" };
  if (extension === "") {
    for (const executableExtension of executableExtensions) {
      const key = hasManifestRecord(
        module,
        `${candidate}${executableExtension}`,
        modules,
      );
      if (key) {
        return { key, kind: "module" };
      }
    }
    for (const executableExtension of executableExtensions) {
      const key = hasManifestRecord(
        module,
        path.join(candidate, `index${executableExtension}`),
        modules,
      );
      if (key) {
        return { key, kind: "module" };
      }
    }
    return { kind: "missing" };
  }
  if (knownAssetExtensions.has(extension)) {
    return hasManifestRecord(module, candidate, assets)
      ? { kind: "asset" }
      : { kind: "missing" };
  }
  return { kind: "unknown" };
}

function hasManifestRecord(module, filePath, records) {
  if (!existsSync(filePath)) return false;
  const real = realpathSync(filePath);
  if (!isWithin(module.root, real)) return false;
  const key = manifestKey(module.owner, module.root, real);
  return records.has(key) ? key : false;
}

function requireDirectory(directory, label) {
  if (!existsSync(directory))
    throw new Error(`${label} is missing: ${directory}`);
  const real = realpathSync(directory);
  const stat = lstatSync(real);
  if (!stat.isDirectory())
    throw new Error(`${label} is not a directory: ${directory}`);
  return real;
}

function requireRegularNonEmptyFile(file, label) {
  if (!existsSync(file)) throw new Error(`${label} is missing: ${file}`);
  const real = realpathSync(file);
  const stat = lstatSync(real);
  if (!stat.isFile())
    throw new Error(`${label} is not a regular file: ${file}`);
  if (stat.size === 0) throw new Error(`${label} is empty: ${file}`);
  return real;
}

function compareManifestRecords(left, right) {
  return (
    left.path.localeCompare(right.path) || left.owner.localeCompare(right.owner)
  );
}

function digestFile(file) {
  return `sha256:${createHash("sha256").update(readFileSync(file)).digest("hex")}`;
}

function isWithin(parent, candidate) {
  const child = path.relative(parent, candidate);
  return child === "" || (!child.startsWith("..") && !path.isAbsolute(child));
}

function manifestKey(owner, rootDirectory, file) {
  return `${owner}:${path.relative(rootDirectory, file).replaceAll("\\", "/")}`;
}

function relative(repositoryRoot, file) {
  return path.relative(repositoryRoot, file);
}

function redactAndBound(value) {
  return String(value ?? "")
    .replaceAll(/https:\/\/[^@\s]+@/g, "https://[REDACTED]@")
    .replaceAll(
      /(?:token|authorization|cookie|password|secret)=\S+/gi,
      "$1=[REDACTED]",
    )
    .slice(-16_384);
}

function read(file) {
  return readFileSync(file, "utf8");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--canonicalize-opennext") {
    const canonicalization = canonicalizeOpenNextOutput();
    console.log(
      `OpenNext canonicalization: PASS (retained runtime modules=${String(canonicalization.retained_runtime_modules.length)}, retained static asset modules=${String(canonicalization.retained_static_asset_modules.length)}, removed build intermediates=${String(canonicalization.removed_intermediate_modules.length)}, manifest=.open-next/canonicalization-manifest.json)`,
    );
  } else {
    validateSourceCompatibility();
    runFreshWranglerDryRun();
    const manifest = inspectGeneratedArtifacts();
    validateOpenNextCanonicalization({ artifactManifest: manifest });
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(
      `Worker compatibility scan: PASS (edge middleware, typed service binding, no remote bindings, unsupported globals, unbounded body buffering, floating Promises, generated manifest modules=${String(manifest.modules.length)}, assets=${String(manifest.assets.length)}, prohibited Worker Wasm forms absent)`,
    );
  }
}
