import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/products.js';
import { HANGER_FITS, hangerPolyline } from '../src/hanger.js';

test('every product has a fitted hanger whose hook sits above the peak', () => {
  for (const { id } of products) {
    const fit = HANGER_FITS[id];
    assert.ok(fit, `missing hanger fit for ${id}`);
    assert.ok(fit.rail[1] > fit.peak[1], `${id} rail must be above the peak`);
    for (const p of hangerPolyline(fit)) assert.ok(Math.abs(p.x) < .35 && Math.abs(p.y) <= .5, `${id} hanger point outside garment bounds`);
  }
  assert.equal(HANGER_FITS.w04.bar, false, 'w04 (crossed arms) must not have a crossbar');
});
