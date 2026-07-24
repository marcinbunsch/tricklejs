// ESM smoke test: verifies `import { ... } from "tricklejs"` resolves the ESM
// build (exports.import). A missing named export throws at load time with
// "does not provide an export named ...", so the import itself is the real
// check; the assertions guard against undefined bindings. Run: node smoke/smoke.mjs
import assert from "node:assert";

import { StreamController, Stream, StreamSubscription } from "tricklejs";

assert.strictEqual(typeof StreamController, "function", "StreamController export missing");
assert.strictEqual(typeof Stream, "function", "Stream export missing");
assert.strictEqual(typeof StreamSubscription, "function", "StreamSubscription export missing");

const controller = new StreamController();
assert.ok(controller.stream, "StreamController should expose a stream");

const seen = [];
controller.stream.listen((value) => seen.push(value));
controller.add(1);
controller.add(2);

setImmediate(() => {
  assert.deepStrictEqual(seen, [1, 2], "stream did not deliver added values");
  console.log("ESM smoke test passed");
});
