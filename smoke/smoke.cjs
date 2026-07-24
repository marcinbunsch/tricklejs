// CJS smoke test: verifies `require("tricklejs")` resolves the CJS build
// (exports.require) and exposes the named classes. Run: node smoke/smoke.cjs
const assert = require("node:assert");

const t = require("tricklejs");

assert.strictEqual(typeof t.StreamController, "function", "StreamController export missing");
assert.strictEqual(typeof t.Stream, "function", "Stream export missing");
assert.strictEqual(typeof t.StreamSubscription, "function", "StreamSubscription export missing");

const controller = new t.StreamController();
assert.ok(controller.stream, "StreamController should expose a stream");

const seen = [];
controller.stream.listen((value) => seen.push(value));
controller.add(1);
controller.add(2);

setImmediate(() => {
  assert.deepStrictEqual(seen, [1, 2], "stream did not deliver added values");
  console.log("CJS smoke test passed");
});
