import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { heroLooks, heroOrderUrl } from "../src/hero-state.js";

test("all four hero looks have committed item and try-on assets", async () => {
  assert.equal(heroLooks.length, 4);
  for (const look of heroLooks) {
    await access(new URL(`../public/hero/women/${look.item}`, import.meta.url));
    await access(new URL(`../public/hero/women/${look.tryon}`, import.meta.url));
  }
});
test("each hero order names its look and asks for price on the required WhatsApp number", () => {
  for (const look of heroLooks) {
    const url = new URL(heroOrderUrl(look));
    assert.equal(url.origin + url.pathname, "https://wa.me/8614718114366");
    assert.ok(url.searchParams.get("text").includes(look.name));
    assert.match(url.searchParams.get("text"), /price/);
    assert.doesNotMatch(url.searchParams.get("text"), /\$/);
  }
});
