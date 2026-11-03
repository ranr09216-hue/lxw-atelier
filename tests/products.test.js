import test from 'node:test';
import assert from 'node:assert/strict';
import { products, orderUrl } from '../src/products.js';
import { readFileSync } from 'node:fs';
test('all four supplied garments have valid GLB files and exact order messages', () => {
  assert.deepEqual(products.map(p => [p.id, p.price]), [['w01',39],['w02',19],['w03',25],['w04',29]]);
  for (const p of products) {
    const url = new URL(orderUrl(p));
    assert.equal(url.origin + url.pathname, 'https://wa.me/8614718114366');
    assert.equal(url.searchParams.get('text'), `Hi LXW Atelier, I'd like to order the ${p.name} ($${p.price}). Size: `);
    const glb = readFileSync(new URL(`../public/models/${p.id}.glb`, import.meta.url));
    assert.equal(glb.toString('ascii', 0, 4), 'glTF');
    assert.equal(glb.readUInt32LE(8), glb.length);
  }
});
