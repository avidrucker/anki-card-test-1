# Top Theme Ideas — Selected Designs

Last updated: 2026-06-02

Themes 1–2 are fully specced for implementation. Themes 3–7 are selected concepts with initial design notes, pending full spec.

---

## Theme 1 — Death Note

**Two-sided concept:** Black leather cover (front) / Japanese lined paper (back)

### Front side — black leather cover

Visual target: The Death Note book as Ryuk drops it — matte black hardcover with "DEATH NOTE" embossed on the front.

**Background:**
- `background-color: #0a0a0a`
- SVG `feTurbulence` (type `fractalNoise`, `baseFrequency` ~0.65, `numOctaves` 4) → `feSpecularLighting` with a raking `feDistantLight` (azimuth 225°, elevation 15°) → produces the subtle sheen of pressed leather grain
- A very faint `feConvolveMatrix` emboss pass adds micro-relief

**Typography:**
- Title / question text: `"Noto Serif JP"` or `"Cinzel"` (gothic/serif), white (`#ffffff`), large, centered, letter-spacing ~0.15em
- Optional "DEATH NOTE" label as a small all-caps sub-header beneath the question, styled as if embossed on the cover
- No decorative border — the restraint is part of the aesthetic

**Image treatment:**
- If a card image is present: `filter: brightness(0.6) contrast(1.2) grayscale(0.3)` — dark and slightly desaturated, like a Polaroid developed badly

---

### Back side — Japanese manuscript paper (原稿用紙 / genkouyoshi)

Visual target: The interior pages of the Death Note — very faint ruled lines, eerie calm, pencil-sketch handwriting.

**Background:**
- Off-white / aged cream (`#f5f0e8`)
- `feTurbulence` (very low amplitude) → `feColorMatrix` to push toward sepia → faint paper grain
- Horizontal rules every ~2rem: `repeating-linear-gradient(to bottom, transparent, transparent calc(2rem - 1px), #b8a89a 1px)` — pale reddish-brown like old ballpoint ruled lines
- Optional: genkouyoshi-style grid (squares for kanji practice) as a very faint overlay — `background-image` 2-gradient grid, opacity 0.15

**Typography:**
- Answer text: `"Caveat"` or `"Noto Sans JP"` at low weight — looks handwritten/pencil
- Slightly irregular letter-spacing (CSS `letter-spacing: -0.01em` plus `word-spacing`) to suggest real handwriting rhythm
- Text color: very dark grey (`#1a1a1a`) rather than pure black — like pencil on paper

**Tension:**
- The front is dramatic and monolithic; the back is quiet and clinical — the contrast mirrors the book's role as an ordinary-looking object with terrible power.

---

## Theme 2 — Holographic Foil Trading Card

**Research basis:** The best real-world reference is [simeydotme's Pokemon Cards CSS](https://github.com/simeydotme/pokemon-cards-css) and the [CSS-Tricks holographic card writeup](https://css-tricks.com/holographic-trading-card-effect/). The technique combines CSS gradient layers with SVG turbulence noise — the sparkle *distribution* comes from feTurbulence, not from CSS.

**Core concept:** A collectible card where the **image area specifically** shimmers and sparkles as if coated in holographic foil. The rest of the card (frame, title bar, text box) is non-foil but metallic. Three SVG filter layers combine over the image to produce: rainbow sheen + random sparkle glints + sweeping specular highlight.

---

### Card structure (overall layout)

```
┌─────────────────────────────────┐  ← thin gold metallic border
│ ★★★  CARD NAME          TYPE ❋ │  ← title bar, silver text, rarity stars top-left
├─────────────────────────────────┤
│                                 │
│   [ IMAGE AREA — HOLO ZONE ]   │  ← ~55% of card height, ALL three filter layers here
│                                 │
├─────────────────────────────────┤
│  ─────────────────────────────  │
│  Description / answer text      │  ← plain dark bg, no foil
│  Type · Category · Notes        │
└─────────────────────────────────┘
```

- **Card background:** Very dark navy `#0d0d1a` — the foil reads brightest against a near-black field
- **Border:** CSS `linear-gradient(135deg, #9a7d3a, #f0d060, #c8a84a, #f0d060, #9a7d3a)` — gold collector's border, 3px
- **Title bar:** `#1a1a2e`, silver text (`"Cinzel"`, letter-spacing 0.1em), rarity stars (★) top-left, element icon top-right
- **Description box:** Dark charcoal `#111118`, muted silver text (`"Libre Baskerville"` 14px), thin separator rule above

---

### The image area — three holographic layers

All three layers sit on top of the base `<img>` inside a positioned container:

**Layer 1 — Rainbow sheen (CSS, `mix-blend-mode: color-dodge`)**

```css
background: conic-gradient(
  from var(--hue-offset),
  hsl(0 100% 60%), hsl(60 100% 55%), hsl(120 100% 50%),
  hsl(180 100% 55%), hsl(240 100% 60%), hsl(300 100% 55%), hsl(360 100% 60%)
);
mix-blend-mode: color-dodge;
opacity: 0.35;
animation: holo-rotate 4s linear infinite;

@keyframes holo-rotate {
  to { --hue-offset: 360deg; }
}
```

This is the smooth, slow rainbow sweep across the whole image. `color-dodge` brightens the image colours rather than replacing them, so the photo still reads through the shimmer.

**Layer 2 — Sparkle glints (SVG filter, `mix-blend-mode: screen`)**

This is the key SVG filter layer — the one that produces the individual glint dots that CSS alone cannot replicate:

```xml
<filter id="sparkle" x="0%" y="0%" width="100%" height="100%">
  <!-- Step 1: generate high-frequency noise -->
  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="1"
                stitchTiles="stitch" result="noise" />
  <!-- Step 2: threshold — keep only the bright peaks as sparkle points -->
  <feColorMatrix type="matrix" in="noise"
    values="0 0 0 0 0
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 9 -7"
    result="sparkleMask" />
  <!-- Step 3: tint the sparkles white/pale gold -->
  <feFlood flood-color="#ffe8a0" result="color" />
  <feComposite in="color" in2="sparkleMask" operator="in" result="tintedSparkles" />
  <!-- Step 4: screen over the source image -->
  <feBlend in="SourceGraphic" in2="tintedSparkles" mode="screen" />
</filter>
```

The `feColorMatrix` alpha row (`0 0 0 9 -7`) is the trick: it multiplies the noise alpha by 9 and subtracts 7, which means only noise values above ~0.78 survive as non-transparent — the bright peaks become the sparse glint dots. Lower the threshold value (`-7` → `-5`) for more sparkles; raise it (`-7` → `-8.5`) for fewer, brighter ones.

**Layer 3 — Moving specular sweep (SVG filter, `mix-blend-mode: screen`)**

```xml
<filter id="specularSweep">
  <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="4"
                stitchTiles="stitch" result="bumpMap" />
  <feSpecularLighting surfaceScale="4" specularConstant="1.5" specularExponent="25"
                      lighting-color="#ffffff" in="bumpMap" result="specular">
    <fePointLight>
      <animate attributeName="x" values="-100;500;-100" dur="5s" repeatCount="indefinite" />
      <animate attributeName="y" values="300;-100;300" dur="5s" repeatCount="indefinite" />
      <animate attributeName="z" values="200;200;200" dur="5s" repeatCount="indefinite" />
    </fePointLight>
  </feSpecularLighting>
  <feComposite in="specular" in2="SourceGraphic" operator="in" />
</filter>
```

The `fePointLight` sweeps diagonally across the image (top-right → bottom-left → top-right). `feComposite operator=in` clips the specular to the image shape — important for images with transparent backgrounds.

---

### Animation interaction between layers

The three layers are deliberately out of phase so there is always *something* happening:
- Rainbow: slow 4s loop (conic gradient rotation)
- Sparkle: static (the noise is constant, no animation needed — the turbulence pattern itself already looks random enough)
- Specular sweep: 5s loop offset by 1.5s relative to the rainbow start

Result: the sweep highlight passes across the image every 5s; between passes, the rainbow still slowly rotates and the static sparkle dots catch the eye.

---

### Front vs. back

- **Front (question side):** Full holographic treatment on image. Title = question term. Dark background.
- **Back (answer side):** Same card frame, but the image area shows a subtle CSS metallic sheen only — no full foil. The answer being "plain" makes the front feel rarer and more special. Alternatively: back gets the foil too but with a blue/silver palette instead of rainbow/gold.

---

### Why it's unique

- **No existing theme does multi-layer blending on the image specifically.** Every current theme applies a uniform filter to the whole card. This targets only the image zone.
- **The sparkle distribution is non-repeating** — feTurbulence generates a pseudo-random field, not a regular CSS repeating-gradient pattern.
- **The effect requires all three primitives together** — rainbow alone looks cheap, specular alone looks too synthetic, sparkle alone looks like noise. The combination is physically convincing.

---

## Theme 3 — Ukiyo-e Woodblock

**Vibe:** Hokusai / Hiroshige flat-colour woodblock print — bold outlines, discrete colour zones, cartouche title box.

**Why SVG filters unlock this:** Ukiyo-e printing is physically a discrete flat-colour process — ink from a carved block, one colour at a time. `feTurbulence` + `feComponentTransfer discrete` produces exactly that: organic-edged flat colour regions, no smooth gradients. The bold black contour lines come from a `feConvolveMatrix` Sobel edge pass — the same technique already used in Ink on Ricepaper, remixed here for outline rather than ink texture.

**Design notes:**
- **Background:** `feTurbulence (fractalNoise, baseFrequency 0.025, numOctaves 4)` → `feComponentTransfer discrete (3–4 tableValues bands)` → recoloured with `feFlood + feComposite` per zone. Palette: sky blue `#87b8c8`, earth ochre `#c8a050`, pale cream `#f0e8d0`, dark ink `#1a1008`.
- **Outline layer:** `feConvolveMatrix` Sobel-style kernel over the colour regions → thin dark outline separating zones. Blend over the colour layer.
- **Front side:** Cartouche title box (CSS rectangular border with inner rule) in the upper-right corner containing the question term in vertical Japanese layout (`writing-mode: vertical-rl`). Main image area below, with the woodblock filter applied.
- **Back side:** Plain cream paper, same cartouche reversed for the answer. Minimal — the woodblock front is the visual event.
- **Typography:** `"Noto Serif JP"` for body text; large, minimal, with generous whitespace echoing the breathing room of classic prints.
- **Cross-reference:** Complements Ink on Ricepaper (brush/parchment) but goes in a completely different direction — bold, graphic, flat — rather than soft and textured.

---

## Theme 4 — Hollow Knight Lore Tablet

**Vibe:** Pale carved stone, insect-script glyphs, atmospheric vignette, the quiet grandeur of a ruined civilisation.

**Why SVG filters unlock this:** The stone surface needs `feDiffuseLighting` (matte, not shiny — the You Died theme already covers shiny dark stone). Raking low-angle light across a `feTurbulence` bump map makes the carved glyphs visually emerge as real incised depth. `feDiffuseLighting` is completely unused across all 21 current themes.

**Design notes:**
- **Background:** `feTurbulence (fractalNoise, baseFrequency 0.035, numOctaves 6)` → `feDiffuseLighting (diffuseConstant 1.2, surfaceScale 4)` with `feDistantLight (azimuth 210°, elevation 12°)` — low raking angle exaggerates micro-relief. Blend with `feComposite operator=multiply` over pale stone base colour `#d8cfc0`.
- **Colour palette:** Pale limestone `#cfc8b8`, shadow `#7a6e60`, faint amber glow `#c8a060` for any light-source elements. Desaturated, dusty, archival.
- **Front side (question):** The question term rendered large in a glyph-like weight (`"Cinzel Decorative"` or a custom pixel-adjacent serif), centred. The diffuse-lit stone appears to have the text carved into it. A soft vignette darkens the corners (`radial-gradient ellipse`).
- **Back side (answer):** Same stone, lighter — as if this side of the tablet is better preserved. Answer text in slightly warmer ink.
- **Border:** Subtle CSS box border with corner notches (pseudo-element triangles cut inward), suggesting a stone slab's chipped edges. No ornate decoration — the restraint is part of the aesthetic.
- **Atmosphere:** Very faint `feGaussianBlur` halo (2px) behind the text simulates the way carved letters gather dust and shadow at their edges.

---

## Theme 5 — Pokémon RBY / Pixel UI

**Vibe:** Game Boy era — Red/Blue/Yellow cartridge, 4-shade monochrome pixel display, chunky pixel font, battle menu boxes.

**Why SVG filters unlock this:** The pixelation effect (feFlood → feTile → feComposite, or feColorMatrix + feComponentTransfer discrete) can reduce a full-colour image to the exact 4-shade Game Boy palette: white `#9bbc0f`, light `#8bac0f`, dark `#306230`, black `#0f380f`. The filter does this in-browser to any image, including photos — no pre-processed sprites needed.

**Design notes:**
- **Image filter:** `feColorMatrix (desaturate)` → `feComponentTransfer discrete (4 tableValues: 0 0.33 0.66 1)` → `feColorMatrix` remap from greyscale to the 4 GB palette colours. The result: any photo becomes a Game Boy sprite.
- **Background:** Pure `#9bbc0f` (GB screen green) or dark `#0f380f` (off mode). CSS `image-rendering: pixelated` on all images.
- **Typography:** A pixel font (`"Press Start 2P"` Google Font) at exact pixel-grid sizes (8px, 16px, 24px — no fractional sizing).
- **Front side (question):** Battle menu layout. Top half: a darkened "wild Pokémon appeared" style zone (image area with 4-shade filter). Bottom half: white menu box with chunky border (CSS `outline` + `border` double-line), question text inside.
- **Back side (answer):** Same menu box, now showing the answer — as if you selected "CHECK" or "DEX ENTRY" and the data appeared.
- **Scanline overlay:** CSS `repeating-linear-gradient` at 2px intervals for the LCD grid-line effect. `opacity: 0.15` — subtle.
- **Animation:** Blinking cursor `_` in the menu box (`@keyframes` opacity toggle, 0.8s). The one deliberate animation; fits the aesthetic exactly.

---

## Theme 6 — Obon Festival

**Vibe:** Japanese ancestor festival — paper lanterns glowing on dark water, warm orange-red light, reflections, brush calligraphy.

**Why SVG filters unlock this:** The lantern glow and water reflections are two distinct SVG filter opportunities. The glow uses `feGaussianBlur` + `feBlend screen` for the soft light bloom. The reflections use `feDisplacementMap` with animated `feTurbulence` for the gentle water surface distortion — the only currently-planned theme that uses `feDisplacementMap` for a calm, beautiful purpose rather than a chaotic one.

**Design notes:**
- **Background:** Near-black deep water `#040810`. CSS `radial-gradient` warm orange-amber pools `rgba(200,100,20,0.15)` at lantern positions. `feTurbulence (type=turbulence, baseFrequency 0.015, numOctaves 2)` → `feDisplacementMap (scale 8)` with slowly animating `seed` applied to the reflection zone only — gentle water ripple distortion.
- **Lanterns:** CSS-drawn circles or ellipses in warm amber `#e8920a`, with `feGaussianBlur (stdDeviation 12)` + `feBlend screen` glow halos. The glow bleeds naturally into the surrounding dark.
- **Typography:** `"Noto Serif JP"`, vertical layout on the front (question as a vertical column of characters, left-aligned), horizontal on the back (answer). Brush-weight strokes — the heaviest available weight.
- **Colour palette:** Deep water black `#040810`, lantern amber `#e8920a`, warm red `#c03010`, pale reflection shimmer `#f8d080`.
- **Front side:** The question term set large and vertical in the centre, framed by lantern glows at top and bottom. The lanterns are decorative — they frame the text without competing.
- **Back side:** Same dark water, but the reflection distortion is still. The answer appears as if the water has calmed.

---

## Theme 7 — Steampunk

**Vibe:** Victorian brass machinery, riveted iron plates, exposed gears, wood panelling, warm gas-lamp light.

**Why SVG filters unlock this:** Steampunk needs at least three distinct material surfaces: polished brass (`feSpecularLighting` — already available), matte iron (`feDiffuseLighting` — completely unused), and aged wood grain (directional `feTurbulence` with asymmetric `baseFrequency`, same as the CSS-Tricks pine wood pattern). No other theme concept so naturally calls for multiple different material filter treatments on different parts of the card simultaneously.

**Design notes:**
- **Card zones (front):**
  - *Header bar* — riveted iron plate. `feTurbulence (fractalNoise, baseFrequency 0.55, numOctaves 3)` → `feDiffuseLighting (surfaceScale 3)` with raking `feDistantLight`. Dark charcoal `#2a2520` with bolt/rivet accents (CSS circles).
  - *Image area* — brass-framed porthole. Circular `clip-path` on the image. `feSpecularLighting` on the brass ring border: gold `#b8820a` with a tight specular highlight.
  - *Lower panel* — wood. `feTurbulence (type=turbulence, baseFrequency 0.025 0.003, numOctaves 2)` for directional horizontal grain. Warm walnut `#5c3010`.
- **Typography:** `"IM Fell English"` or `"Cinzel"` with a slight sepia tone. Slightly warm off-white `#f0e0c0` on dark surfaces. Gear/cog decorations as CSS clip-path polygons or inline SVG in the corners.
- **Colour palette:** Brass `#b8820a`, iron `#4a4540`, walnut `#5c3010`, patina green `#4a7050`, gas-lamp amber `#f0b040`.
- **Back side:** Parchment or aged map paper. `feDiffuseLighting` for the matte fibrous paper surface. The answer in typewriter-style serif (`"Courier Prime"`), as if printed on a telegraphic message slip.
- **Complexity note:** This is the highest-complexity theme in the list — three different material filter treatments on one card. Likely builds best in stages: iron header first, then brass porthole ring, then wood panel.
