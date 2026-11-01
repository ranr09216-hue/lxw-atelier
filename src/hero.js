import "./hero.css";
import { products, orderUrl } from "./products.js";
import { personas, cycleItem } from "./hero-state.js";

const hero = document.querySelector("#dawn");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
const assetBase = `${import.meta.env.BASE_URL}hero/`;
const still = (id) => `${assetBase}item_${id}.webp`;
const media = (id) =>
  `<span class="hero-media"><img src="${still(id)}" alt="" width="768" height="768"><video muted loop playsinline autoplay preload="metadata" poster="${still(id)}" data-src="${assetBase}item_${id}_loop.mp4" aria-hidden="true"></video></span>`;
hero.innerHTML = `<div class="hero-world"><div class="hero-top"><a class="hero-wordmark" href="#dawn" aria-label="LXW Atelier home">LXW ATELIER</a><div class="persona-switch" role="group" aria-label="Choose a look">${personas.map((p, i) => `<button type="button" data-persona="${i}" aria-pressed="${i === 0}"><img src="${assetBase}persona_${p.id}.webp" alt="" width="40" height="40"><span>${p.name}</span></button>`).join("")}</div></div><div class="hero-heading"><h1 id="dawn-title">Dawn, <br><em>Worn Lightly</em></h1><p>Everyday pieces, in a softer light.</p></div><div class="hero-stage"><div class="persona-parallax"><div class="persona-float">${personas.map((p, i) => `<img class="persona-image ${i === 0 ? "is-current" : ""}" src="${assetBase}persona_${p.id}.webp" alt="${p.name}: ${p.items.map((id) => products.find((p) => p.id === id).name).join(" and ")}" width="768" height="1024" ${i === 0 ? 'fetchpriority="high"' : ""}>`).join("")}</div></div><div class="hero-items">${products.map((p, i) => `<button type="button" class="hero-item item-${i}" data-item="${i}" aria-label="Explore ${p.name}, $${p.price}"><span class="item-float">${media(p.id)}</span><span class="item-label"><span>${p.name}</span><b>$${p.price}</b></span></button>`).join("")}</div></div><div class="hero-bottom"><button type="button" class="hero-motion" aria-pressed="false">Pause motion</button><a class="scroll-cue" href="#wardrobe">Discover the 3D wardrobe <span aria-hidden="true">↓</span></a></div></div>`;
const dialog = document.createElement("dialog");
dialog.className = "hero-dialog";
dialog.setAttribute("aria-labelledby", "hero-detail-name");
dialog.innerHTML = `<div class="hero-detail"><button type="button" class="detail-back">Back <span aria-hidden="true">×</span></button><div class="detail-content" aria-live="polite"></div><div class="detail-navigation"><button type="button" class="detail-prev" aria-label="Previous product">Prev</button><span class="detail-count"></span><button type="button" class="detail-next" aria-label="Next product">Next</button></div></div>`;
document.body.append(dialog);
let persona = 0,
  selected = 0,
  visible = false,
  paused = false,
  opener;
const world = hero.querySelector(".hero-world");
const items = [...hero.querySelectorAll("[data-item]")];
function renderPersona() {
  hero
    .querySelectorAll("[data-persona]")
    .forEach((b, i) => b.setAttribute("aria-pressed", String(i === persona)));
  hero.querySelectorAll(".persona-image").forEach((img, i) => {
    img.classList.toggle("is-current", i === persona);
    img.setAttribute("aria-hidden", String(i !== persona));
  });
  items.forEach((b, i) =>
    b.classList.toggle(
      "is-secondary",
      !personas[persona].items.includes(products[i].id),
    ),
  );
}
hero.querySelectorAll("[data-persona]").forEach((b) =>
  b.addEventListener("click", () => {
    persona = Number(b.dataset.persona);
    renderPersona();
  }),
);
function syncMedia() {
  const play = visible && !document.hidden && !reduced.matches && !paused;
  hero.classList.toggle("motion-paused", !play);
  hero.classList.toggle("reduced-motion", reduced.matches);
  dialog.classList.toggle("reduced-motion", reduced.matches);
  document
    .querySelectorAll("#dawn video, .hero-dialog video")
    .forEach((video) => {
      const active =
        play && (dialog.contains(video) ? dialog.open : !dialog.open);
      video.autoplay = active;
      if (active) {
        if (!video.getAttribute("src")) video.src = video.dataset.src;
        video.play().catch(() => {});
      } else video.pause();
    });
  if (reduced.matches || paused) resetParallax();
}
new IntersectionObserver(
  ([entry]) => {
    visible = entry.isIntersecting;
    syncMedia();
  },
  { threshold: 0 },
).observe(hero);
document.addEventListener("visibilitychange", syncMedia);
reduced.addEventListener("change", syncMedia);
hero.querySelector(".hero-motion").addEventListener("click", (e) => {
  paused = !paused;
  e.currentTarget.textContent = paused ? "Resume motion" : "Pause motion";
  e.currentTarget.setAttribute("aria-pressed", String(paused));
  syncMedia();
});
const parallax = hero.querySelector(".persona-parallax");
function resetParallax() {
  parallax.style.transform = "";
}
hero.addEventListener("pointermove", (e) => {
  if (reduced.matches || paused || !fine.matches || dialog.open) return;
  const r = hero.getBoundingClientRect();
  parallax.style.transform = `translate(${Math.max(-10, Math.min(10, ((e.clientX - r.left) / r.width - 0.5) * 20))}px,${Math.max(-10, Math.min(10, ((e.clientY - r.top) / r.height - 0.5) * 20))}px)`;
});
hero.addEventListener("pointerleave", resetParallax);
function renderDetail() {
  const p = products[selected];
  dialog.querySelectorAll("video").forEach((v) => v.pause());
  dialog.querySelector(".detail-content").innerHTML =
    `${media(p.id)}<h2 id="hero-detail-name">${p.name}</h2><p class="detail-meta">${p.color}<b>$${p.price} USD</b></p><p class="detail-description">${p.description}</p><a class="primary" href="${orderUrl(p)}" target="_blank" rel="noopener">Order on WhatsApp <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 16 16 4M5 4h11v11"/></svg></a>`;
  dialog.querySelector(".detail-count").textContent =
    `${selected + 1} / ${products.length}`;
  items.forEach((b, i) => b.classList.toggle("is-selected", i === selected));
  syncMedia();
}
function openDetail(index) {
  selected = index;
  opener = document.activeElement;
  renderDetail();
  dialog.showModal();
  document.body.classList.add("hero-detail-open");
  world.inert = true;
  document.body.style.overflow = "hidden";
  resetParallax();
  syncMedia();
  dialog.querySelector(".detail-back").focus();
}
function closeDetail() {
  dialog.close();
}
dialog.addEventListener("close", () => {
  document.body.classList.remove("hero-detail-open");
  world.inert = false;
  document.body.style.overflow = "";
  items.forEach((b) => b.classList.remove("is-selected"));
  syncMedia();
  opener?.focus({ preventScroll: true });
});
items.forEach((b, i) => b.addEventListener("click", () => openDetail(i)));
dialog.querySelector(".detail-back").addEventListener("click", closeDetail);
dialog.querySelector(".detail-prev").addEventListener("click", () => {
  selected = cycleItem(selected, -1, products.length);
  renderDetail();
});
dialog.querySelector(".detail-next").addEventListener("click", () => {
  selected = cycleItem(selected, 1, products.length);
  renderDetail();
});
let outside = false;
dialog.addEventListener("pointerdown", (e) => {
  outside = e.target === dialog;
});
dialog.addEventListener("click", (e) => {
  if (outside && e.target === dialog) closeDetail();
  outside = false;
});
dialog.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const controls = [...dialog.querySelectorAll("button, a[href]")];
  const first = controls[0],
    last = controls.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
renderPersona();
syncMedia();
