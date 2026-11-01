# Dawn hero verification — 2026-10-31

## Files and boundaries

- `index.html`: inserts the hero before the existing rack; uses one h1 (hero), demotes the rack introduction to h2, and loads `src/entry.js`.
- `src/entry.js`: mounts the light hero, gives it a paint, then imports rack controls.
- `src/hero.js`: supplied asset rendering, persona selection, media lifecycle, bounded parallax, product dialog, catalog-based WhatsApp links, focus return/trap, and dismissal.
- `src/hero.css`: cream composition, blended media, leader labels, floats, push-in/drawer, mobile grid/bottom sheet, and reduced-motion states.
- `src/hero-state.js`: persona-to-product IDs and wraparound cycling.
- `src/main.js`: defers the existing wardrobe import with IntersectionObserver (200px preload margin). Existing rack controls/callbacks remain intact.
- `src/style.css`: darkens the existing secondary-text token to meet contrast on every studio surface.
- `tests/hero.test.js`: exact persona mapping and bidirectional wrapping.
- `.finesse/log.json`: records this composition alongside the existing rack.
- `HERO-QA.md`: this audit, polish, and verification record.

`src/products.js`, `src/wardrobe.js`, `src/hanger.js`, existing tests, all supplied media, and all model files are unchanged. No dependencies added. No media generated. No hooks enabled.

## Spec verification

| Requirement | Evidence |
| --- | --- |
| Desktop cream, wordmark, serif headline/subline | Rendered and inspected in Chromium at 1440×1000 and 1024×900. Uses #f4efe6, existing Georgia/sans brand typography; no purple, gradient text, glass, or decoration. |
| Centered persona / float / parallax | CSS 6s ease-in-out float, 8px excursion; pointer movement clamped to ±10px, fine-pointer only. Two stills crossfade in the same frame. |
| Four floating products / videos / labels | Each supplied loop has muted, loop, playsinline, autoplay and metadata preload; supplied WebP poster underneath. Offset float timing; whole-item multiply blending plus feathered media edges; thin leader rules; names/prices read from catalog. |
| Persona switch | Morning Studio defaults to W01/W02; Weekend Easy maps to W03/W04. Unit and browser checks confirm mapping, pressed state and two dimmed items. Other items remain operable. |
| Product detail | Native modal dialog, selected-item push-in, blurred/dimmed background, right drawer, large loop, canonical name/color/price/description and orderUrl. Browser checks cycle last→first and first→last, validate WhatsApp URL, focus wrapping, focus return, Back/Escape/outside dismissal. |
| Scroll to unchanged rack | Scroll cue targets wardrobe. Browser network checks show zero model requests at initial hero load and all four models_hunyuan requests after scrolling. Rendered rack inspected; keyboard browse, Enter detail, A rotation, Escape return pass. Existing model and fitted-hanger tests pass. |
| Mobile ≤768px | Inspected 375px and 768px layouts: heading, chips, centered persona, 2×2 labeled grid without leader lines. Also inspected 1024px intermediate layout. Browser asserts no horizontal overflow. Synthesized Chromium touch exercises chips and opening the sheet. Bottom edge is asserted at 812px; long sheet content remains scrollable. |
| Reduced motion | Browser emulation confirms no MP4 requests on initial reduced-motion load; all videos paused, autoplay false and videos hidden; WebP stills visible. CSS removes float/parallax/slide/zoom and preserves immediate state changes. Detail remains functional. |
| Visibility/performance | IntersectionObserver gates video sources/playback and rack import. Browser checks verify all hero videos pause offscreen, on simulated hidden-tab event, and explicit Pause. Hero float is paused offscreen/hidden. Initial hero entry is about 9KB JS before gzip; Three.js stays in the separate wardrobe chunk. |
| Contrast | Calculated WCAG luminance ratios: #575d56 secondary on #f4efe6 cream 5.90:1; on #eee8e1 studio 5.56:1; on #edcfc0 peach 4.60:1. Ink on cream 11.48:1. Persona dimming applies only to media, preserving full-contrast labels. |

## Impeccable audit → polish

Read AGENTS.md, Finesse UI, its design/motion/mobile/preflight guidance, existing PRODUCT/DESIGN and composition log, and Impeccable audit/polish/craft-floor references before implementation. Viewed `design-ref/hero_ui.jpg` and used only supplied assets. The user’s explicit video/reference brief overrides the previous design document’s no-video guidance for this new section.

The initial context launcher could not use its default home cache; existing project context was read directly. The detector subsequently ran using a writable workspace cache. Source scan of hero JS/CSS: **zero primary findings**. Advisories concern font sizes absent from the prior rack’s sparse type-ramp declaration; these follow the supplied hero composition and existing type families, not an accidental font substitution.

Audit findings addressed in the polish pass:

1. **P1, responsive:** absolute chip placement could collide with wrapped headlines. Fixed using normal mobile flex order.
2. **P1, contrast:** existing muted text would reach only 3.98:1 against the darkest peach surface. Darkened the shared token; minimum now 4.60:1.
3. **P2, imagery:** video stacking contexts retained visible white rectangles. Applied multiply to the entire item, and feathered outer image edges.
4. **P2, responsive:** explicitly anchored the mobile sheet to the bottom with a vertical flex dialog; browser geometry assertion passes.
5. **P2, implementation:** changed hero asset URLs to use Vite BASE_URL so relative-path hosting continues to work.
6. **P3, finish:** restored mobile headline word spacing and replaced the unsupported order-arrow glyph with the existing SVG icon style.

Audit health after polish: **17/20 (Good)** — accessibility 3, performance 4, theming 3, responsive 3, implementation integrity 4. Scores reserve full marks for browser/assistive-technology coverage beyond this Chromium session. All identified P1/P2 defects above are fixed; no known blocking findings remain.

Post-polish source review: coherent catalog-based implementation, scoped motion, native modal semantics, lazy playback and preserved rack. Rendered desktop/mobile and detail states inspected. Automated Chromium checks report no page errors. No physical-device, Safari, or screen-reader session was available; touch evidence is synthesized Chromium input, and hidden-tab evidence dispatches the visibility lifecycle with document.hidden set.

Final checks: `npm test` (4 tests), `npm run build`, `git diff --check`, source detector, browser interaction/geometry/network checks, and numeric contrast calculations.
