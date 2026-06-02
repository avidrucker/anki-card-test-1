# SVG Filters Research — Volume 2

Research date: 2026-06-02  
Sources: 6 articles reviewed (see bottom). Cross-referenced against all 21 existing themes.

---

## Article Summaries

---

### 1. Codrops — Duotone Images with feComponentTransfer
**URL:** https://tympanus.net/codrops/2019/02/05/svg-filter-effects-duotone-images-with-fecomponenttransfer/  
**Date:** February 5, 2019  
**Accessibility:** ★★★★★ (clear, exact code, step-by-step)  
**Usefulness for theme design:** High

**What it covers:**
The definitive tutorial for the duotone technique. Two-step pipeline: desaturate with `feColorMatrix` equal-weight rows, then remap grayscale to a two-colour gradient with `feComponentTransfer type="table"`. Critical detail: `color-interpolation-filters="sRGB"` must be present on the `<filter>` element or colours shift subtly across browsers.

**Exact pipeline:**
```xml
<!-- Step 1: desaturate -->
<feColorMatrix type="matrix" values=".33 .33 .33 0 0
                                     .33 .33 .33 0 0
                                     .33 .33 .33 0 0
                                     0   0   0  1 0" />
<!-- Step 2: map greyscale → two colours -->
<feComponentTransfer color-interpolation-filters="sRGB">
  <feFuncR type="table" tableValues="[R_shadow] [R_highlight]" />
  <feFuncG type="table" tableValues="[G_shadow] [G_highlight]" />
  <feFuncB type="table" tableValues="[B_shadow] [B_highlight]" />
</feComponentTransfer>
```
Where shadow/highlight values are the normalised (0–1) RGB components of your chosen colours.

**Gamma correction variant** — makes shadows darker, highlights brighter:
```xml
<feComponentTransfer color-interpolation-filters="sRGB">
  <feFuncR type="gamma" exponent="1.5" amplitude="1.3" offset="0" />
  <feFuncG type="gamma" exponent="1.5" amplitude="1.3" offset="0" />
  <feFuncB type="gamma" exponent="1.5" amplitude="1.3" offset="0" />
</feComponentTransfer>
```

**Tool:** Yoksel's SVG Gradient Map Tool converts hex colours directly to the correct `tableValues` — skips the manual normalisation.

**Gap vs. existing themes:** Classic Apple and 8 Bit Console use `feComponentTransfer` with `type="linear"` (dithering/brightness) and `type="discrete"` (bit-depth quantization) — not `type="table"` for duotone remapping. Duotone is genuinely absent.

---

### 2. CSS-Tricks — Creating Patterns with SVG Filters
**URL:** https://css-tricks.com/creating-patterns-with-svg-filters/  
**Date:** March 15, 2021  
**Accessibility:** ★★★☆☆ (requires understanding of Perlin noise math)  
**Usefulness for theme design:** Very High

**What it covers:**
The single most underused technique in the filter literature. Core insight: `feComponentTransfer type="discrete"` with a short `tableValues` list **quantizes continuous Perlin noise into flat, distinct colour regions** — which become the organic zones of camouflage, wood grain, leopard spots, or terrain maps.

**Five fully-worked patterns:**

| Pattern | `type` | `baseFrequency` | `numOctaves` | Effect |
|---|---|---|---|---|
| Starry sky | turbulence | 0.4+ | 1 | Sparse bright dots on black |
| Pine wood | turbulence | `0.02 0.2` (asymmetric) | 2 | Directional grain lines |
| Dalmatian spots | fractalNoise | 0.08 | 3 | Organic blobs |
| ERDL camouflage | fractalNoise | 0.03 | 4 | 4-colour military camo zones |
| Island terrain | fractalNoise | 0.015 | 5 | Heightmap colour banding |

**Recolour pipeline per zone:**
```xml
<!-- 1. Generate noise -->
<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" result="noise" />
<!-- 2. Quantize to flat regions -->
<feComponentTransfer in="noise" result="zones">
  <feFuncR type="discrete" tableValues="0 0 1 1" />
  <feFuncG type="discrete" tableValues="0 1 0 1" />
  <feFuncB type="discrete" tableValues="0 0 0 0" />
</feComponentTransfer>
<!-- 3. Flood each zone with a colour and mask -->
<feFlood flood-color="#4a6741" result="color1" />
<feComposite operator="in" in="color1" in2="zones" result="zone1" />
<!-- repeat per zone, then feMerge all zones -->
```

**Performance warning:** Complex discrete chains are CPU-heavy. Rasterise to JPEG/PNG for production; use `will-change: filter` to promote to GPU compositing during development/preview.

**Bonus:** `seed` attribute generates 10 million unique pattern variations — server-side randomization gives each user a slightly different pattern.

**Gap vs. existing themes:** No existing theme uses discrete quantization for multi-colour pattern generation. Blackboard and Chalk uses discrete only for alpha thresholding on chalk texture.

---

### 3. Frontend Masters — SVG Filters Guide: Getting Started
**URL:** https://frontendmasters.com/blog/svg-filters-guide-getting-started-with-the-basics/  
**Date:** April 9, 2026 (most recent of the set — 2 months ago)  
**Accessibility:** ★★★★★ (best beginner entry point)  
**Usefulness for theme design:** Medium (for an experienced designer) / High (for filter newcomers)

**What it covers:**
Written by Ana Tudor. Covers filter anatomy, `filterUnits` vs `primitiveUnits`, `color-interpolation-filters="sRGB"` (she calls this the #1 source of confusing colour bugs), input/output chaining. Lists 8 demonstrated effects by name without full code:

- Duotone
- Pixelation
- 3D calendar effect
- Diagonal slice with offset
- Bending
- Ripped poster
- Split text
- Embossing

**Most valuable specific note:** `color-interpolation-filters="sRGB"` must be set explicitly — without it the browser uses linearRGB by default, which produces mathematically correct but perceptually wrong colour blending.

**Open questions raised:** "Bending", "ripped poster", and "pixelation" are listed but not explained. These likely use:
- Bending/ripped poster → `feDisplacementMap` with a structured gradient map (not random turbulence)
- Pixelation → `feFlood → feTile → feComposite` (pipeline not confirmed — see Open Research Questions)

---

### 4. Codrops — SVG Filters 101
**URL:** https://tympanus.net/codrops/2019/01/15/svg-filters-101/  
**Date:** January 15, 2019  
**Accessibility:** ★★★★★  
**Usefulness for theme design:** Low (foundational, already surpassed by existing themes)

Builds drop shadow from scratch:
```
SourceAlpha → feGaussianBlur → feFlood → feComposite(in) → feOffset → feMerge
```
Most useful conceptual note: `SourceAlpha` (just the shape silhouette) vs `SourceGraphic` (full colour image) as filter inputs — the distinction that unlocks emboss, outline, and extrude effects (already used in Beach Night Poster).

---

### 5. Creative Bloq — How to Go Beyond the Basics with SVG Filters
**URL:** https://www.creativebloq.com/netmag/how-go-beyond-basics-svg-filters-71412280  
**Date:** July 11, 2014 (oldest of the set — still accurate, spec unchanged)  
**Accessibility:** ★★★☆☆ (older format, denser)  
**Usefulness for theme design:** High — contains the most unique technique not found elsewhere

**Three techniques covered:**

**A. Alpha contour / topographic shadow**
```xml
<filter id="contour">
  <feGaussianBlur stdDeviation="5" />
  <feComponentTransfer>
    <feFuncA type="discrete" tableValues="0 0 0 1 0 0 0 1 0 0 0 1" />
  </feComponentTransfer>
</filter>
```
Instead of a soft shadow blur, the alpha channel is quantized into discrete bands — creating concentric hard rings like topographic contour lines around any shape. Striking for floating text labels or depth cues.

**B. feDiffuseLighting for matte procedural textures**
This is the most important finding: `feDiffuseLighting` is entirely different from `feSpecularLighting`:
- `feSpecularLighting` = shiny/reflective surfaces (metal, glass, chrome, polished stone)
- `feDiffuseLighting` = matte/light-absorbing surfaces (paper, clay, felt, fabric, raw wood, concrete)

Pipeline:
```xml
<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
<feDiffuseLighting in="noise" lighting-color="white" diffuseConstant="1" surfaceScale="5">
  <feDistantLight azimuth="225" elevation="25" />
</feDiffuseLighting>
```
Claimed achievable textures: brick, marble, felt, woven cloth, craft paper, sandpaper, concrete, plaster.

**Key difference from feSpecularLighting:** Diffuse lighting looks the same from every viewing angle (matte); specular lighting has a bright highlight that shifts with the viewing angle (shiny). For most natural materials, diffuse is more convincing.

**C. Gotham filter recreation**
Sequential `feColorMatrix` + `feComponentTransfer` transforms to recreate Instagram's old Gotham filter (high-contrast, cyan shadows, faded whites). Shows that chained colour transforms can match specific photographic film stock aesthetics — applicable to any "vintage photo" card concept.

**Gap vs. existing themes:** `feDiffuseLighting` is used in **zero** of the 21 themes. Every lighting effect uses `feSpecularLighting`. This is the most significant blind spot.

---

### 6. Codrops — SVG Filter Effects: Moving Forward
**URL:** https://tympanus.net/codrops/2019/02/26/svg-filter-effects-moving-forward/  
**Date:** February 26, 2019  
**Accessibility:** ★★☆☆☆ (links article, not a tutorial)  
**Usefulness for theme design:** Medium (as a research pointer)

Wrap-up article in the Codrops series. Most valuable reference: **Lucas Bebber's Gooey Effect**.

Reconstructed pipeline:
```xml
<filter id="gooey">
  <!-- 1. Dilate shapes so nearby elements overlap -->
  <feMorphology operator="dilate" radius="8" in="SourceGraphic" result="dilated" />
  <!-- 2. Blur the dilated result — merges overlapping areas -->
  <feGaussianBlur stdDeviation="10" in="dilated" result="blurred" />
  <!-- 3. Alpha-threshold: snap soft blur edge back to hard shape -->
  <feColorMatrix type="matrix"
    values="1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 18 -7"
    in="blurred" result="gooMask" />
  <!-- 4. Clip original colour back onto goo shape -->
  <feComposite operator="atop" in="SourceGraphic" in2="gooMask" />
</filter>
```
The alpha row (`0 0 0 18 -7`) multiplies alpha by 18 and subtracts 7 — this snaps the soft Gaussian tail into a hard edge while keeping the merged goo blob smooth. Adjusting the threshold (18/-7 ratio) controls how "sticky" the goo is.

Also mentions:
- David Dailey's bokeh effects (feTurbulence with circular aperture masking)
- Dirk Weber's `feTile + feConvolveMatrix` for repeating text/pattern effects
- Yoksel's visual SVG Filters editor

---

## Primitive Coverage Audit — All 21 Themes

| Primitive | Themes using it | How used |
|---|---|---|
| feGaussianBlur | Beach Night Poster, Game Menu UI | Height map input to feSpecularLighting |
| feTurbulence | Blackboard and Chalk only | fractalNoise for chalk alpha texture |
| feSpecularLighting | Beach Night Poster (multi-light), Game Menu UI (7 point lights) | Shiny surface lighting |
| feColorMatrix | 8 Bit Console, Classic Apple, Ink on Ricepaper | Desaturate / grayscale channel ops |
| feComponentTransfer | Blackboard and Chalk, 8 Bit Console, Classic Apple, Ink on Ricepaper | discrete (alpha), linear (dithering), Sobel edge combine |
| feConvolveMatrix | Beach Night Poster (emboss 8×8), Ink on Ricepaper (4× Sobel edge!) | Depth/edge detection |
| feMorphology | Beach Night Poster (dilate for outline), Starry Night Poster | Shape expansion |
| feComposite | Game Menu UI, Starry Night Poster | Arithmetic compositing |
| feBlend | Ink on Ricepaper | lighten blend for edge maps |
| feImage | Beach Night Poster | Pattern fill layer |
| **feDisplacementMap** | **zero themes** | — |
| **feDiffuseLighting** | **zero themes** | — |
| **feTile** | **zero themes** | — |
| **feFlood** (in main chain) | **zero themes** | — |
| **feOffset** (standalone) | **zero themes** | — |

**Already sophisticated:** Ink on Ricepaper uses 4× Sobel passes combined with feBlend lighten — remarkably advanced. Game Menu UI has 7 separate feSpecularLighting passes with different point light positions. Beach Night Poster stacks emboss + multi-source specular + morphology dilate + feImage fill.

---

## Open Research Questions

1. **Pixelation pipeline** — Ana Tudor's April 2026 article lists "pixelation" as achievable with SVG filters but doesn't show the primitive chain. Likely `feFlood → feTile → feComposite` but setup is unconfirmed.

2. **Bending and ripped-poster effects** — Also from the 2026 article. Likely `feDisplacementMap` with a structured gradient displacement map (not random turbulence) for a controlled curve or tear. Exact gradient encoding is unknown.

3. **`color-interpolation-filters="sRGB"` in existing themes** — Are all 21 themes already setting this? Missing it causes subtle colour shift in `feComponentTransfer` operations. Could explain any colour inconsistency on certain screens.

4. **feDiffuseLighting for leather (Death Note front)** — The planned Death Note theme uses `feSpecularLighting` for leather grain, but real leather is matte. Would `feDiffuseLighting` with the same feTurbulence bump map look more convincing? Needs a quick test comparison.

5. **Gooey Effect threshold values for card dimensions** — Bebber's demo tunes `feMorphology radius`, `feGaussianBlur stdDeviation`, and the alpha-boost matrix for his specific element sizes. Right values for a ~300×420px card area need experimentation.

6. **Animated feTurbulence performance floor** — CSS-Tricks warns about filter chain CPU cost but gives no device-specific threshold. At what chain depth does animating `seed` start dropping frames on mid-range mobile?

---

## Sources

- [Codrops: Duotone with feComponentTransfer (Feb 2019)](https://tympanus.net/codrops/2019/02/05/svg-filter-effects-duotone-images-with-fecomponenttransfer/)
- [CSS-Tricks: Creating Patterns with SVG Filters (Mar 2021)](https://css-tricks.com/creating-patterns-with-svg-filters/)
- [Frontend Masters: SVG Filters Guide — Getting Started (Apr 2026)](https://frontendmasters.com/blog/svg-filters-guide-getting-started-with-the-basics/)
- [Codrops: SVG Filters 101 (Jan 2019)](https://tympanus.net/codrops/2019/01/15/svg-filters-101/)
- [Creative Bloq: Beyond the Basics with SVG Filters (Jul 2014)](https://www.creativebloq.com/netmag/how-go-beyond-basics-svg-filters-71412280)
- [Codrops: SVG Filter Effects — Moving Forward (Feb 2019)](https://tympanus.net/codrops/2019/02/26/svg-filter-effects-moving-forward/)
