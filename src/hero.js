import "./hero.css";
import { heroLooks, heroOrderUrl } from "./hero-state.js";

const hero = document.querySelector("#dawn");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
const assetBase = `${import.meta.env.BASE_URL}hero/women/`;

hero.innerHTML = `<div class="hero-world">
  <div class="hero-top"><a class="hero-wordmark" href="#dawn" aria-label="LXW Atelier home">LXW ATELIER</a></div>
  <div class="hero-heading"><h1 id="dawn-title">Dawn, <br><em>Worn Lightly</em></h1><p>Everyday pieces, in a softer light.</p><p id="tryon-hint">Choose a look to try it on.</p></div>
  <div class="hero-stage">
    <div class="persona-parallax"><div class="persona-float" id="hero-model">${heroLooks.map((look, i) => `<img class="persona-image ${i === 0 ? "is-current" : ""}" src="${assetBase}${look.tryon}" alt="Model wearing ${look.name}" width="768" height="1024" aria-hidden="${i !== 0}" loading="eager" ${i === 0 ? 'fetchpriority="high"' : ''}>`).join("")}</div></div>
    <div class="hero-items">${heroLooks.map((look, i) => `<div class="hero-item item-${i}">
      <button type="button" class="hero-tryon" data-item="${i}" aria-label="Try on ${look.name}" aria-pressed="${i === 0}" aria-controls="hero-model" aria-describedby="tryon-hint">
        <span class="item-float"><span class="hero-media"><img src="${assetBase}${look.item}" alt="" width="768" height="768"></span></span>
        <span class="item-label"><span>${look.name}</span><b>Price on WhatsApp</b></span>
      </button>
      <a class="hero-order" href="${heroOrderUrl(look)}" target="_blank" rel="noopener" aria-label="Order ${look.name} on WhatsApp">Order on WhatsApp</a>
    </div>`).join("")}</div>
  </div>
  <p class="hero-status" role="status"></p>
  <div class="hero-bottom"><button type="button" class="hero-motion" aria-pressed="false">Pause motion</button><a class="scroll-cue" href="#wardrobe">Discover the 3D wardrobe <span aria-hidden="true">↓</span></a></div>
</div>`;

const items = [...hero.querySelectorAll("[data-item]")];
const models = [...hero.querySelectorAll(".persona-image")];
// Eagerly load and decode every try-on in the existing image slot. Waiting for
// decode keeps a slow or failed request from fading the current model to blank.
const ready = models.map((img) => img.decode().then(() => true, () => false));
let request = 0;
items.forEach((button, index) => button.addEventListener("click", async () => {
  const currentRequest = ++request;
  const loaded = await ready[index];
  if (currentRequest !== request) return;
  const status = hero.querySelector(".hero-status");
  if (!loaded) {
    status.textContent = "This try-on image is unavailable. You can still order the look on WhatsApp.";
    return;
  }
  items.forEach((item, i) => item.setAttribute("aria-pressed", String(i === index)));
  models.forEach((img, i) => {
    img.classList.toggle("is-current", i === index);
    img.setAttribute("aria-hidden", String(i !== index));
  });
  status.textContent = `Now trying on ${heroLooks[index].name}.`;
}));

let visible = false;
let paused = false;
const parallax = hero.querySelector(".persona-parallax");
function resetParallax() { parallax.style.transform = ""; }
function syncMotion() {
  hero.classList.toggle("motion-paused", !visible || document.hidden || paused || reduced.matches);
  hero.classList.toggle("reduced-motion", reduced.matches);
  if (reduced.matches || paused || !visible || document.hidden) resetParallax();
}
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  syncMotion();
}).observe(hero);
document.addEventListener("visibilitychange", syncMotion);
reduced.addEventListener("change", syncMotion);
hero.querySelector(".hero-motion").addEventListener("click", (event) => {
  paused = !paused;
  event.currentTarget.textContent = paused ? "Resume motion" : "Pause motion";
  event.currentTarget.setAttribute("aria-pressed", String(paused));
  syncMotion();
});
hero.addEventListener("pointermove", (event) => {
  if (reduced.matches || paused || !visible || !fine.matches) return;
  const rect = hero.getBoundingClientRect();
  parallax.style.transform = `translate(${Math.max(-10, Math.min(10, ((event.clientX - rect.left) / rect.width - 0.5) * 20))}px,${Math.max(-10, Math.min(10, ((event.clientY - rect.top) / rect.height - 0.5) * 20))}px)`;
});
hero.addEventListener("pointerleave", resetParallax);
syncMotion();
