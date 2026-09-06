import assert from "node:assert/strict";
import test from "node:test";

import { createIdentityRefresh } from "../../src/lib/identity-refresh";

test("an older identity response cannot replace a newer verified identity", async () => {
  const identities: Array<string | undefined> = [];
  let resolveFirst!: (userId: string) => void;
  let resolveSecond!: (userId: string) => void;
  const firstUser = new Promise<string>((resolve) => {
    resolveFirst = resolve;
  });
  const secondUser = new Promise<string>((resolve) => {
    resolveSecond = resolve;
  });
  const refreshIdentity = createIdentityRefresh((userId) =>
    identities.push(userId),
  );

  const firstRefresh = refreshIdentity(() => firstUser);
  const secondRefresh = refreshIdentity(() => secondUser);
  assert.deepEqual(identities, [undefined, undefined]);

  resolveSecond("second-user");
  await secondRefresh;
  resolveFirst("first-user");
  await firstRefresh;

  assert.deepEqual(identities, [undefined, undefined, "second-user"]);
});
