# LXW Atelier
3D wardrobe showcase site. Orders via WhatsApp +86 14718114366 (no on-site payment).

## Run and build

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Vite produces a static `dist/` directory. There is no server, database, cart, checkout or payment integration. All product order links open WhatsApp with the product name, USD price and a size prompt. Edit `src/products.js` to change product copy or pricing; replace models in `public/models/` using the same filenames. Models are normalized to one unit high on load.

## Deploy

**Vercel:** import this repository, choose Vite, set build command `npm run build` and output directory `dist`. No environment variables are required.

**GitHub Pages:** run `npm ci && npm run build`, upload `dist` using `actions/upload-pages-artifact`, and deploy with `actions/deploy-pages` (grant `pages: write` and `id-token: write`). Set Pages source to GitHub Actions. `base: './'` supports a repository subpath as well as a custom domain. Serve the contents of `dist`, not the source repository.

## Interactions and accessibility

Drag or swipe horizontally to slide the rack. Click a garment or use a color button to open it; drag the detail view for 360° rotation. Previous/next buttons browse in either mode. Focus the wardrobe and use arrow keys, Enter to open, Escape to close. A close button returns focus to the scene. Vertical page scrolling remains available over the rack; detail rotation owns the touch surface. Pointer cancellation and lost capture reset the gesture.

Four models load with at most two concurrent requests. A loading indicator and per-model failure message cover unavailable assets. If WebGL is unavailable, all product buttons, descriptions and WhatsApp order links remain usable. Renderer DPR is capped at 1.5; shadows use one 1024px map; rendering pauses offscreen and when the tab is hidden. Models and GPU resources are disposed on teardown. Reduced-motion preferences disable ambient motion and inertia. No video is included.

## Design QA

See `QA.md` for the Impeccable audit/polish record and verification limits. The checked-in Finesse detector is available at `.agents/skills/finesse-ui/scripts/detect.mjs`. Do not enable hooks.
