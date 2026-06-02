# SVG Filters Research — Card Theme Ideas

Last updated: 2026-06-02

Reference document for SVG filter techniques that could make interesting card themes. Ideas are not yet selected for implementation. See `TOP_IDEAS.md` for confirmed picks.

---

## Why SVG Filters Are the Frontier

Auditing the existing 21 themes reveals that **`feDisplacementMap` is completely unused** and `feTurbulence` appears in only one theme (Blackboard and Chalk). This matters because:

- Everything done so far — glows, emboss, scanlines, color shifts — applies to the *card surface* as decoration.
- `feDisplacementMap` applies to the *content itself*: it physically warps the text and images, which no existing theme does.
- Animated `feTurbulence` (via SVG `<animate>` on `baseFrequency` or `seed`) creates living, breathing textures that no CSS animation can replicate.

---

## Ideas Using feDisplacementMap (completely unused across all 21 themes)

---

### Idea 1 — Underwater / Aquarium

**Unexplored primitive:** `feDisplacementMap`

**Concept:** The card appears to be read through the curved glass wall of an aquarium or submerged underwater. All content — text and images alike — wobbles continuously.

**Filter pipeline:**
```
feTurbulence (type=turbulence, baseFrequency=0.012 0.008, numOctaves=2)
  → feDisplacementMap (scale=12, xChannelSelector=R, yChannelSelector=G, in=SourceGraphic)
```
Animating `feTurbulence`'s `seed` attribute from 0 → 100 over 8s with `<animate>` creates slow, organic drift. The displacement is gentle — barely perceptible on a still image but clearly liquid in motion.

**Background:**
- Deep translucent navy/teal gradient (`#0a2540` → `#093d5e`)
- `feSpecularLighting` with `fePointLight` high above center → caustic light patches ripple across the card surface (simulate with a second SVG filter layer on the background only)
- Optional: CSS `::before` pseudo-element with a subtle upward-floating particle animation (small white dots, `opacity: 0.4`)

**Typography:**
- White or pale cyan, `"Nunito"` or any rounded sans — readable even through the distortion
- Font-size should be slightly larger than other themes to compensate for the wobble

**Why it's unique:** Every other theme treats the card as a flat surface. This theme makes the card feel physically submerged — the content itself moves.

---

### Idea 2 — Heat Shimmer / Desert Mirage

**Unexplored primitive:** `feDisplacementMap` with directional bias

**Concept:** The card looks as if it's sitting on scorching asphalt and the air above it is shimmering. The text rises and warps vertically — the classic highway mirage.

**Filter pipeline:**
```
feTurbulence (type=turbulence, baseFrequency=0.02 0.003, numOctaves=1, seed=animated)
  → feDisplacementMap (scale=18, xChannelSelector=R, yChannelSelector=R, in=SourceGraphic)
```
The asymmetric `baseFrequency` (wide horizontally, narrow vertically) plus using `R` for both channels creates a predominantly vertical shear — the heat-shimmer signature. Animate `seed` 0→50 over 3s (loop) for continuous shimmer.

**Background:**
- Warm bleached sand gradient: `#e8d5a3` → `#c9a96e` → `#a0522d` at the bottom edge
- Optional: a stark horizon line (thin dark rule at 60% height), above which the sky is a pale washed-out blue

**Typography:**
- Dark earthy brown (`#3d1f00`), `"Merriweather"` or any book serif — the displacement is doing the visual work, so the font can be conventional
- The warping affects the letterforms; no need for a decorative font

**Why it's unique:** The shimmer is emergent from the filter — it cannot be faked with CSS animations because CSS can only move/scale elements rigidly. The feDisplacementMap produces per-pixel warp that looks genuinely atmospheric.

---

### Idea 3 — Burning Parchment

**Unexplored primitive:** `feDisplacementMap` applied via a masked alpha channel (edge-only distortion)

**Concept:** The card is an aged document with fire-eaten edges. The center is readable; the perimeter writhes with the organic irregularity of a burning edge. Think a treasure map set alight, or a letter held too close to a candle.

**Filter pipeline (edge mask approach):**
1. Generate a turbulent edge mask: `feTurbulence` → `feColorMatrix` → `feComposite` (atop a radial gradient that is opaque at edges, transparent at center)
2. `feDisplacementMap` on `SourceGraphic` using the edge mask as displacement source
3. `feColorMatrix` on the displaced result to push edge pixels toward orange/brown → char effect

**Background:**
- Aged parchment: `#d4b896` base, subtle noise texture
- Radial vignette darkening toward corners: `radial-gradient(ellipse at center, transparent 50%, rgba(30,15,0,0.7) 100%)`
- CSS `::before` pseudo-element with ember-orange glow bleeding inward from all edges

**Typography:**
- Dark sepia ink (`#2a1500`), `"IM Fell English"` (period serif with ink variation)
- Centered, formal — the drama comes from the burning frame, not the text

**Why it's unique:** The damage is topological — the card shape itself is eroded. No existing theme attacks the card's own boundary.

---

### Idea 10 — Fire Text / Burning Title

**Primitive:** `feTurbulence` → `feDisplacementMap` → `feOffset` (known working recipe from research)

**Concept:** The card's question term appears to be written in fire. The lettering writhes with organic turbulence, the base of each letter bleeds into ember-orange, and the tips flicker. The rest of the card is dark and neutral — the fire text is the only source of light.

**Filter pipeline (confirmed working pattern):**
```xml
<filter id="fire" x="-10%" y="-30%" width="120%" height="160%">
  <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2"
                seed="69" result="noise">
    <animate attributeName="baseFrequency" values="0.04;0.06;0.04"
             dur="2s" repeatCount="indefinite" />
    <animate attributeName="seed" values="0;50" dur="0.3s"
             repeatCount="indefinite" />
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="30"
                     xChannelSelector="R" yChannelSelector="G" result="displaced" />
  <feOffset in="displaced" dx="-10" dy="-10" />   <!-- corrects displacement drift -->
</filter>
```
The `feOffset` correction (`dx/dy ≈ -(scale × 0.33)`) is the critical detail confirmed by research — without it, the text drifts down-right by ~30% of the scale value.

**Colour layering:**
- Base text: deep red `#cc2200`
- A `feColorMatrix` remaps the displaced result → orange at edges, bright yellow at tips
- Faint `feGaussianBlur` halo behind the text in orange → the "glow from below" of a fire

**Card design:**
- Background: near-black `#0a0805`
- Card frame: charred wood texture — `feTurbulence` → `feColorMatrix` (dark brown/black bands)
- Image (if present): rendered dark/desaturated and framed by the fire title above it
- Answer side: same card, fire title extinguished → same text in white ash grey, `feColorMatrix` fully desaturated — a before/after that feels meaningful

**Why it's unique:** The turbulence animates the letter shapes themselves, not just an overlay. The text appears to physically burn rather than glow.

---

## Ideas Using feTurbulence + feSpecularLighting

---

### Idea 5 — Stone Inscription / Ancient Relic

**Primitive combination:** `feTurbulence` as bump map → `feSpecularLighting` with extreme raking light → `feConvolveMatrix` emboss

**Concept:** The question is carved into worn stone — a temple inscription, a rune stone, a museum artifact. The answer appears on weathered clay tablet. Raking light reveals the carved depth.

**Filter pipeline:**
```
feTurbulence (type=fractalNoise, baseFrequency=0.04, numOctaves=6) [stone grain]
  → feComposite (over SourceGraphic, operator=in) [mask to card area]
  → feSpecularLighting (surfaceScale=8, specularExponent=12)
      feDistantLight (azimuth=225, elevation=8) [extreme raking angle]
  → feBlend (in=SourceGraphic, mode=multiply)
```
The very low elevation angle (8°) is the key — it exaggerates the depth of any surface irregularity, making carved letters dramatically visible.

**Front (question) — dark basalt:**
- Background: dark charcoal `#2a2825`, stone-grain feTurbulence overlay
- Typography: slightly lighter than bg (`#4a4642`), `"Cinzel Decorative"` or `"Trajan"` — Roman/classical weight
- The text appears to be incised INTO the stone (the raking light catches the edges of each letter's carved groove)

**Back (answer) — clay tablet:**
- Background: warm ochre `#c8a96e`, finer grain texture
- Typography: dark impressed marks (`#5a3010`), `"Noto Serif"` — the cuneiform-scholar aesthetic

**Why it's unique:** The stone texture is *reactive* to the lighting — the same filter applied to different text produces different shadow patterns per letter, making each card feel like a physical artifact rather than a print.

---

## Ideas Using feColorMatrix / feComponentTransfer

---

### Idea 6 — Thermal Camera

**Primitive:** `feColorMatrix` as a luminance-to-palette remap (palette substitution, not just color shift)

**Concept:** The card looks as if filmed with a FLIR infrared camera. Black is cold; white is hot; in between is the full thermal spectrum (purple → blue → cyan → green → yellow → red → white). Text and images are recolored by their luminance value.

**Filter pipeline:**
```
feColorMatrix (type=saturate, values=0) [desaturate to grayscale]
  → feComponentTransfer
      feFuncR (type=table, tableValues="0 0.1 0.5 0.9 1.0 1.0 1.0")
      feFuncG (type=table, tableValues="0 0.0 0.3 0.7 0.8 0.4 0.0")
      feFuncB (type=table, tableValues="0.2 0.5 0.5 0.2 0.0 0.0 0.0")
```
The `tableValues` map the 0→1 luminance range to the classic FLIR palette (black → purple → blue → green → yellow → red → white). This applies to both text and images.

**Front side:** Dark cool palette (the question is "cold" — unknown). Text appears in cold blue-green against a near-black background.

**Back side:** Warm hot palette shifted (the answer is "revealed" — active, warm). Text shifts toward red-yellow. Different `feComponentTransfer` values on back vs. front.

**Optional conceit:** Card images (vocab illustrations) become unrecognizable thermal blobs on the front, then revealed normally on the back.

**Why it's unique:** The same content looks completely alien when filtered this way. It's also the first theme where the filter changes the *semantic reading* of an image (you can't tell what the image is from the thermal version) — which can be used as a deliberate reveal mechanic.

---

### Idea 7 — Duotone / Risograph Print

**Primitive:** `feColorMatrix` (desaturate) → `feComponentTransfer` (table lookup, 2 colors)

**Concept:** Every card image is remapped to exactly two colours — like a Risograph or Letraset print, or the duotone images Spotify uses for playlists. The same image looks completely different depending on which two colours you choose.

**Filter pipeline:**
```xml
<feColorMatrix type="saturate" values="0" />   <!-- Step 1: strip all colour -->
<feComponentTransfer>                           <!-- Step 2: map grey → 2-colour gradient -->
  <feFuncR type="table" tableValues="R1 R2" />
  <feFuncG type="table" tableValues="G1 G2" />
  <feFuncB type="table" tableValues="B1 B2" />
</feComponentTransfer>
```
`R1/G1/B1` = shadow colour (normalised 0–1). `R2/G2/B2` = highlight colour. The `table` function linearly interpolates between them across the luminance range.

**Card design:**
- Pick a bold two-colour palette — e.g., deep indigo `#1a0a3d` (shadow) + electric lime `#c8ff00` (highlight)
- The image becomes a graphic, poster-like object with no mid-tone noise
- Add a subtle `feTurbulence` grain (very low frequency) over the duotone to simulate the ink-on-paper unevenness of a real risograph print
- Slight `feComposite` misregistration: apply a second copy of the duotone with a 2px offset in a third accent colour → the "out-of-register" two-colour print effect

**Theme variations by colour pair:**
| Name | Shadow | Highlight | Mood |
|---|---|---|---|
| Risograph Coral | deep teal | coral/salmon | indie zine |
| Soviet Constructivist | black | red | propaganda poster |
| Cyanotype | white | Prussian blue | 19th-century photograph |
| Neon Noir | near-black | hot pink | cyberpunk |

**Why it's unique:** The filter transforms any user image into graphic design. The card doesn't look like a card with a photo — it looks like a designed poster.

---

### Idea 8 — Screen Print / Posterization

**Primitive:** `feComponentTransfer` with `discrete` transfer function

**Concept:** Rather than a smooth duotone gradient, `discrete` snaps every pixel to one of N hard colour bands — the solarised, posterised look of a screen-print or Warhol silkscreen.

**Filter pipeline:**
```xml
<feColorMatrix type="saturate" values="0" />
<feComponentTransfer>
  <feFuncR type="discrete" tableValues=".1 .4 .75 1" />
  <feFuncG type="discrete" tableValues=".05 .3 .6 .9" />
  <feFuncB type="discrete" tableValues=".2 .4 .5 .8" />
</feComponentTransfer>
```
Four values per channel = four tone bands. Each channel can use different breakpoints to bias toward a particular hue in each zone.

**Card aesthetic:**
- Pair with bold flat block colours (no gradients in the card frame itself)
- The abrupt colour transitions in the image echo the flat CSS of the frame — the whole card becomes a graphic object
- Works especially well for portrait-style images (faces, single subjects)

**Why it's useful:** Quick-win complexity. The `discrete` function alone is a 3-line filter; the result looks like deliberate high-effort graphic design.

---

## Ideas Using CSS + SVG Combination

---

### Idea 9 — RGB Glitch / Channel Shift

**Primitive:** Animated `feColorMatrix` with channel offset using CSS `@keyframes` on filter seed / transform

**Concept:** The card image appears as if a CRT signal is breaking up — the red, green, and blue colour channels are slightly misaligned and occasionally jerk. Screened over a VHS noise background, this becomes the definitive "digital corruption" aesthetic.

**Implementation approach:**
- Render the image three times as absolutely positioned copies
- Apply `feColorMatrix` to extract only R, only G, only B from each copy respectively
- Animate horizontal `translate()` on each channel layer with staggered timing and different offsets
- The overlap of the three shifted channels recreates the full image *most* of the time, with a periodic split

```css
.channel-r { filter: url(#extract-red);   animation: glitch-r 3s steps(1) infinite; }
.channel-g { filter: url(#extract-green); animation: glitch-g 3s steps(1) infinite; }
.channel-b { filter: url(#extract-blue);  animation: glitch-b 3s steps(1) infinite; }

@keyframes glitch-r {
  0%, 90% { transform: translateX(0); }
  92%      { transform: translateX(-4px); }
  96%      { transform: translateX(3px); }
  100%     { transform: translateX(0); }
}
```

**Card design:**
- Dark VHS background: near-black with faint horizontal scanlines (CSS `repeating-linear-gradient`)
- White/green monospace typography (`"Courier New"` or `"Share Tech Mono"`)
- Occasional `feTurbulence` noise burst as a CSS animation on the filter's `seed` → simulates a tape dropout

**Why it's unique:** The glitch *only* affects the image; the text stays legible. The image periodically corrupts and stabilises — which creates a natural tension that draws the eye.

---

### Idea 11 — Directional Blur / Kinetic Speed

**Primitive:** `feGaussianBlur` with asymmetric `stdDeviation` (separate X and Y values)

**Concept:** Unlike CSS `filter: blur()` which blurs uniformly, SVG `feGaussianBlur` accepts `stdDeviation="24 2"` — 24px horizontal, 2px vertical. This creates a motion-blur streak: the image looks as if caught mid-movement.

**Filter pipeline:**
```xml
<filter id="speedBlur">
  <feGaussianBlur stdDeviation="20 1" />   <!-- wide X, tight Y = horizontal streak -->
</filter>
```

**Card design — "Velocity" theme:**
- Background: dark gradient with speed-line CSS `repeating-linear-gradient` (thin white diagonal lines)
- The card image gets the horizontal blur → subject appears at high speed
- Text is crisp (filter applied only to the image container, not the whole card)
- Colour palette: bold red/white/black — racing aesthetic
- Vertical variant (`stdDeviation="1 20"`): subject falling, diving, or launching

**Bonus combo:** Animate the `stdDeviation` from `0 0` → `20 1` → `0 0` over 0.8s on hover/loop, making the image repeatedly "blur past" and snap back into focus. This is **impossible** with CSS `filter: blur()` which can only do uniform blur.

**Why it's useful:** The simplest unexplored primitive in the list. A one-line filter produces an effect that looks custom-built. Low complexity, high visual payoff.

---

## Priority / Complexity Reference

| Idea | Theme | Key primitive | Complexity | Confirmed recipe? |
|---|---|---|---|---|
| 10 | Fire Text | feTurbulence → feDisplacementMap → feOffset | Medium | **Yes (exact params)** |
| 7 | Duotone / Risograph | feColorMatrix + feComponentTransfer table | Low | Yes |
| 11 | Directional Blur / Kinetic | feGaussianBlur asymmetric | Low | Yes |
| 8 | Screen Print | feComponentTransfer discrete | Low | Yes |
| 9 | RGB Glitch | feColorMatrix channel extraction + CSS animation | Medium | Yes |
| 1 | Underwater / Aquarium | feDisplacementMap + animated feTurbulence | Medium-high | Partial |
| 2 | Heat Shimmer | feDisplacementMap directional | Medium | Partial |
| 5 | Stone Inscription | feTurbulence bump + feSpecularLighting raking | Medium | Partial |
| 6 | Thermal Camera | feComponentTransfer palette remap | Low-medium | Yes |
| 3 | Burning Parchment | feDisplacementMap edge-masked | High | Partial |

**"Confirmed recipe"** = filter parameters known from real implementations found in research, not just theorised.

---

## Research Sources

- [Deep Dive Into SVG Displacement Filtering — Smashing Magazine](https://www.smashingmagazine.com/2021/09/deep-dive-wonderful-world-svg-displacement-filtering/)
- [Holographic Trading Card Effect — CSS-Tricks](https://css-tricks.com/holographic-trading-card-effect/)
- [Pokemon Cards CSS (simeydotme) — GitHub](https://github.com/simeydotme/pokemon-cards-css)
- [SVG Filter Effects: feTurbulence Texture — Codrops](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/)
- [SVG Filter Effects: feDisplacementMap — Codrops](https://tympanus.net/codrops/2019/02/12/svg-filter-effects-conforming-text-to-surface-texture-with-fedisplacementmap/)
- [SVG Filter Effects: Duotone with feComponentTransfer — Codrops](https://tympanus.net/codrops/2019/02/05/svg-filter-effects-duotone-images-with-fecomponenttransfer/)
- [SVG Filter Effects: Poster Image with feComponentTransfer — Codrops](https://tympanus.net/codrops/2019/01/29/svg-filter-effects-poster-image-effect-with-fecomponenttransfer/)
- [Revisiting SVG Filters — utilitybend](https://utilitybend.com/blog/revisiting-svg-filters-my-forgotten-powerhouse-for-duotones-noise-and-other-effects/)
- [How to Make an SVG Fire Effect — Medium](https://medium.com/@leimapapa/wait-no-this-is-how-to-make-an-svg-fire-effect-53963ccb89c9)
- [Liquid Glass in the Browser — kube.io](https://kube.io/blog/liquid-glass-css-svg/)
