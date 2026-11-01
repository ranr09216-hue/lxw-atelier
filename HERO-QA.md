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

## Live-QA correction pass — 2026-10-31 (supersedes the initial blend/dimming claims)

Base: `866a0ed`, same `feat/dawn-wardrobe` branch. Changes are limited to
`src/hero.css` and this record. All supplied media (including persona stills),
models, catalog data, wardrobe and hanger code remain byte-for-byte unchanged.
No dependencies or hooks added.

### Cause and correction

The media contains baked near-white studio grounds, not transparency or exact
white: sampled WebP corners are RGB 253–255; a decoded W03 MP4 frame samples
252–253. Multiplying those tones retains a slightly darker ground. The old CSS
blended nested whole-item/float groups rather than defining a neutral ground for
the media, and its masks faded products over only 5% while the persona mask faded
only left/right. The persona therefore retained straight top/bottom boundaries;
transforms, opacity and masking introduced additional compositing groups. No
product container shadow was responsible (the drawer's intentional outer shadow
is separate). An original-CSS screenshot reproduced the faint rectangular fields.

Each source now multiplies against an explicit neutral-white backing, and the
completed media group multiplies against the cream studio once. Only one product
source is visible: assigning a video source hides the underlying image, leaving
the video's own poster as its loading/error fallback. Reduced motion restores the
image. All four edges of product, persona and drawer media feather over 8%; there
is no opaque backing on the outer float that could cover a neighboring garment.
The backing is intentionally white: cream inside a multiply group darkens the
studio twice. No video re-encoding or persona-still modification was necessary.

### Verification evidence

Chromium 154, headless Linux, emulated viewports; touch below means synthesized
Chromium touch, not a physical-device session.

| Fix | Verified result |
| --- | --- |
| Seamless backgrounds | Screenshots of playing videos at two float times, mid-crossfade (~250ms), settled second persona, reduced-motion WebP posters, all four drawers, and 375/393/768/1024px layouts. Sampled pairs 2 CSS px inside/outside each eligible media edge at 15/25/50/75/85% along the edge. Temporarily paused browser animations at their current times so geometry and screenshots agree. Excluded text/leader rules, focus outlines, offscreen points and overlapping foreground media from studio-ground measurements. **560 eligible pairs; maximum absolute difference 1 per RGB channel** (limit 3). Representative studio RGB: (244,239,230). Product pairs max 1, drawer pairs max 0 and responsive persona pairs max 1. Inspected screenshots for straight boundaries and complete silhouettes as well as measuring pixels. |
| Label legibility | Computed name/price font: **14px desktop, 13px mobile**; price weight 600. Persona buttons **13px**. Labels retain full opacity. Ink/cream contrast **11.48:1**, muted/cream **5.90:1**, exceeding 4.5:1. |
| Persona dimming | After transition, Morning Studio media opacities `[1,1,.35,.35]`; Weekend Easy `[.35,.35,1,1]`. Media-only 450ms transition; labels remain full contrast. Hover/focus does not undo dimming. All four buttons retain keyboard activation and visible focus. |
| Mobile fit | At **393×852**, each item is **166.92px** wide and the last row including prices ends at **y=800.80**. At **375×852**, widths are **159px**, last row ends at **y=801.11**. Persona frame is ~170px high, grid gaps 12px; headline, chips, persona and full grid fit the first viewport. No horizontal overflow at 375/393/768/1024/1440px. |
| Mobile contact | At ≤768px the 44px WhatsApp contact control is in normal document flow after the content. It cannot sweep over products during scrolling. Checked 375/393px at multiple scroll positions, including the bottom of the page. Desktop floating placement is preserved. |
| W03 drawer sleeve | Removed the conflicting full-width / max-height frame sizing. Frame is a true square limited by available width and viewport height; every image/video uses `object-fit: contain` plus 16px padding. All four drawers inspected; W03 left and right sleeves are fully visible. The same edge treatment applies in the drawer. |
| Reduced motion | New reduced-motion context makes zero MP4 requests, including after opening a drawer; videos are hidden/paused, posters visible and float disabled. Dimming becomes immediate. Also checked reduced motion toggled on/off after videos load; the polish pass lowered the poster-hiding selector specificity so restoration wins. Existing persona switching, modal and playback lifecycle remain intact. |

### Impeccable audit → polish

Read AGENTS.md, taste skill, Impeccable audit/polish/craft-floor, PRODUCT.md and
DESIGN.md. Context launcher failed on its unwritable default cache; existing
context was read directly. Ran the bundled detector using a writable `work/`
cache. No hooks enabled. This is a narrow refinement of the incumbent hero, not
a new visual direction; the requested video/cream treatment remains authoritative.

Audit identified the reported defects: **P1** insufficient label size and mobile
contact overlap; **P2** visible media grounds, weak persona distinction, excessive
mobile vertical spacing and clipped drawer media. Polish corrected those local
CSS defects, removed redundant mobile rules and the obsolete nested float blend,
and preserved full-contrast labels and keyboard focus. No open P0/P1/P2 findings
remain in this correction scope. Source detector after polish: **0 primary
findings**, 15 typography advisories against the older rack's sparse DESIGN.md
ramp; the explicit 13/14px hero requirements and incumbent display sizes are
intentional, not ignored runtime defects.

| Dimension | Score | Evidence / limitation |
| --- | --- | --- |
| Accessibility | 3/4 | Contrast, focus, keyboard modal path and reduced motion verified; no assistive-technology session. |
| Performance | 4/4 | CSS-only change, no new asset/dependency cost; transform floats and media lifecycle retained. |
| Theming | 3/4 | Existing cream/ink tokens and one neutral media-ground token; no new theme introduced. |
| Responsive | 3/4 | Five widths, mobile grid, scrolling contact geometry and synthesized touch checked; no physical device or Safari session. |
| Implementation integrity | 4/4 | Catalog-driven behavior unchanged, source detector clean, only scoped CSS and QA record changed. |
| **Total** | **17/20 — Good** | Coherent product-specific implementation; requested corrections verified. |

Positive findings retained: native modal semantics and focus return/trapping,
canonical WhatsApp order links, explicit motion pause, lazy media playback,
and untouched 3D interaction code. Final source review found no unrelated churn.
Required checks: `npm test` (**3 test files pass**), `npm run build` and
`git diff --check` pass. Browser interaction checks cover both persona mappings,
all four keyboard-opened drawers, Tab/Shift+Tab wrapping, Escape/focus return,
WhatsApp URLs, playback pause/offscreen behavior, mobile touch and reduced motion.
No page errors observed in the rendered geometry run. Safari, physical devices
and screen readers were not exercised.
