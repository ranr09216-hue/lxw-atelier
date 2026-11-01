import test from "node:test";
import assert from "node:assert/strict";
import { personas, cycleItem } from "../src/hero-state.js";
import { products } from "../src/products.js";

test("persona looks map to the four catalog products exactly once", () => {
  assert.deepEqual(personas[0].items, ["w01", "w02"]);
  assert.deepEqual(personas[1].items, ["w03", "w04"]);
  assert.deepEqual(
    personas.flatMap((p) => p.items),
    products.map((p) => p.id),
  );
});
test("previous and next cycle through every product and wrap both ways", () => {
  const n = products.length;
  assert.equal(cycleItem(0, -1, n), n - 1);
  assert.equal(cycleItem(n - 1, 1, n), 0);
  assert.deepEqual(
    Array.from({ length: n }, (_, i) => cycleItem(0, i, n)),
    [0, 1, 2, 3],
  );
  for (let i = 0; i < n; i++)
    assert.equal(cycleItem(cycleItem(i, 1, n), -1, n), i);
});
