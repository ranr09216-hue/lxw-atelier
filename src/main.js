import './style.css';
import { products, orderUrl } from './products.js';
const $ = (s) => document.querySelector(s);
let selected = 1, detail = false, wardrobe;
const colors = ['#253345', '#eeece5', '#a2a4a4', '#292a2b'];
products.forEach((p, i) => {
  const button = document.createElement('button');
  button.className = 'piece';
  button.innerHTML = `<span class="swatch" style="--swatch:${colors[i]}" aria-hidden="true"></span>${p.color}`;
  button.setAttribute('aria-label', `Explore ${p.name}, $${p.price}`);
  button.addEventListener('click', () => select(i, true));
  $('#pieces').append(button);
});
function render() {
  const p = products[selected];
  $('#product-info').innerHTML = `<h2>${p.name}</h2><p>${p.color} <b>$${p.price} USD</b></p>`;
  $('#description').textContent = p.description;
  $('#order').href = orderUrl(p);
  $('#detail-copy').hidden = !detail;
  $('#close').hidden = !detail;
  $('#scene').classList.toggle('detail', detail);
  $('#gesture-hint').textContent = detail ? 'Drag to turn · A/D keys rotate · Esc to return' : 'Drag to browse · Tap a piece to explore';
  document.querySelectorAll('.piece').forEach((b, i) => b.setAttribute('aria-pressed', String(i === selected)));
}
function select(i, open = detail) {
  selected = (i + products.length) % products.length;
  detail = open;
  render();
  wardrobe?.select(selected, detail);
}
$('#prev').onclick = () => select(selected - 1);
$('#next').onclick = () => select(selected + 1);
$('#close').onclick = () => { select(selected, false); $('#scene').focus({ preventScroll: true }); };
$('#scene').addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) e.preventDefault();
  if (e.key === 'ArrowLeft') select(selected - 1);
  if (e.key === 'ArrowRight') select(selected + 1);
  if (e.key === 'Enter') select(selected, true);
  if (detail && ['a', 'd', 'w', 's'].includes(e.key.toLowerCase())) {
    e.preventDefault();
    const key = e.key.toLowerCase();
    wardrobe?.rotate(key === 'a' ? -.3 : key === 'd' ? .3 : 0, key === 'w' ? -.08 : key === 's' ? .08 : 0);
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && detail) $('#close').click(); });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
function motion() {
  document.body.classList.toggle('paused', paused);
  $('#motion').textContent = paused ? 'Resume motion' : 'Pause motion';
  $('#motion').setAttribute('aria-pressed', String(paused));
  wardrobe?.pause(paused);
}
$('#motion').onclick = () => { paused = !paused; motion(); };
reduced.addEventListener('change', () => { paused = reduced.matches; motion(); });
$('#year').textContent = new Date().getFullYear();
render(); motion();
function fallback() {
  $('.loading').hidden = true;
  $('#fallback').hidden = false;
  $('#motion').hidden = true;
}
function loadWardrobe() {
return import('./wardrobe.js').then(async ({ createWardrobe }) => {
  wardrobe = await createWardrobe($('#scene'), {
    onSelect: select,
    onProgress: (n, failures) => {
      $('#load-progress').value = n;
      $('#load-label').textContent = `Opening the wardrobe… ${Math.round(n / 4 * 100)}%`;
      if (n === 4) {
        $('.loading').hidden = true;
        if (failures) { $('#fallback').hidden = false; $('#fallback').textContent = 'Some 3D pieces couldn’t load. You can still choose every piece below and order via WhatsApp. Refresh to try again.'; }
      }
    },
    onError: fallback,
  });
  wardrobe.select(selected, detail); motion();
}).catch(fallback);
}
const rackObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) { rackObserver.disconnect(); loadWardrobe(); }
}, { rootMargin: '200px' });
rackObserver.observe($('#studio'));
window.addEventListener('pagehide', (e) => { if (!e.persisted) wardrobe?.dispose(); });
