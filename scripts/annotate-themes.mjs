/**
 * One-shot script: prepend a descriptive CSS comment block to each original
 * theme JSON in public/. Safe to re-run — skips any file whose cardCss
 * already starts with "/*".
 *
 * Run from project root: node scripts/annotate-themes.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (name) => resolve(__dirname, "../public", name);

// ---------------------------------------------------------------------------
// Comment blocks — one per theme
// ---------------------------------------------------------------------------

const comments = {

  "8 Bit Console.json": `\
/*
 * 8 BIT CONSOLE
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Retro green-phosphor terminal / 8-bit home computer
 * Fonts     : UnifontMedium — a GNU bitmap font that covers Unicode glyphs
 *             including CJK; renders at small sizes with pixel-exact edges
 * Palette   : #233501 dark green bg · #446710 mid green · #d0cf9d pale green
 * Background: solid dark green — simulates the P31 phosphor of classic CRTs
 *
 * Key techniques:
 *   SVG inline filter (#bit-depth-filter): feColorMatrix maps input to
 *   grayscale, then feComponentTransfer with discrete tableValues quantises
 *   each channel to 4 levels, reducing images to an 8-bit palette appearance
 *
 *   transform: translateZ(0) + backface-visibility: hidden on interactive
 *   elements — promotes them to their own GPU compositing layer to prevent
 *   jitter when CSS transitions run
 */
`,

  "Beach Night Poster.json": `\
/*
 * BEACH NIGHT POSTER
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Retro travel poster / neon beach night scene
 * Fonts     : M PLUS Rounded 1c — Japanese sans with round stroke endings;
 *             weights 400 and 700
 * Palette   : Dark indigo/navy bg · yellow · orange · purple accent
 * Background: background-image with multiple linear-gradient layers creating
 *             a layered poster sky effect; background-attachment: fixed gives
 *             a subtle parallax as the card content scrolls
 *
 * Key techniques:
 *   Large inline SVG filter (#poster-effect):
 *     feGaussianBlur on SourceAlpha creates a blurred height map
 *     feConvolveMatrix (8×8 kernel) applies an emboss/extrude for depth
 *     feSpecularLighting with multiple feDistantLight and fePointLight sources
 *       simulates coloured stage lighting hitting the poster artwork
 *     feMorphology dilate generates a thick outline around shapes
 *     feMerge composites the extrude, outline, and a feImage pattern fill
 *       (tiled from an embedded SVG data URI) into the final result
 */
`,

  "Blackboard and Chalk.json": `\
/*
 * BLACKBOARD AND CHALK
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Hand-written classroom blackboard
 * Fonts     : M PLUS Rounded 1c (Japanese body text, wght 400 & 700)
 *             Chalkduster — a TTF loaded via @font-face from font.download;
 *             the irregular stroke edges mimic real chalk on slate
 * Palette   : #3b383f slate bg · #ededed chalk white · #fff58a chalk yellow
 *             #a1c9f0 chalk light blue
 *
 * Key techniques:
 *   Inline SVG filter (#chalk-texture):
 *     feTurbulence (fractalNoise, baseFrequency ≈ 0.65) generates organic
 *     noise; feComponentTransfer with discrete feFuncA tableValues then
 *     punches the noise into a rough alpha mask, making text and borders
 *     look like they were drawn with real chalk
 *
 *   mix-blend-mode: lighten on images — lightens against the dark slate
 *   background so photos appear as if chalked or projected onto the board
 */
`,

  "Blueprint Theme.json": `\
/*
 * BLUEPRINT THEME
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Technical architectural / engineering blueprint
 * Fonts     : M PLUS 1p — Japanese gothic with clean geometry
 *             Roboto Mono — monospaced Latin for code-like annotations
 * Palette   : #0047ab blueprint blue · semi-transparent white grid lines
 *
 * Key techniques:
 *   Grid paper via two overlaid linear-gradient layers — one horizontal,
 *   one vertical — each a 1 px white line repeated at fixed intervals;
 *   combined they form the square grid characteristic of blueprint paper
 *
 *   Sketch/diazo effect on images: filter: brightness(2) grayscale(1)
 *   desaturates and brightens the image, then mix-blend-mode: screen
 *   burns the bright result into the blue background so images appear
 *   as white-line technical illustrations on blue
 *
 *   ::before pseudo-element with background-image: url(sketch_lines.jpg)
 *   and filter: invert(1) overlays hatching lines for a hand-drawn feel
 */
`,

  "Brutalist HTML.json": `\
/*
 * BRUTALIST HTML
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Raw unstyled web — "brutalist" web design (form = function)
 * Fonts     : System serif stack only (Liberation Serif, DejaVu Serif,
 *             Times New Roman, SF Pro Display, Segoe UI, system-ui) —
 *             no web fonts loaded, intentional
 * Palette   : White bg · black text · browser-default blue links
 *
 * Key techniques:
 *   Intentionally minimal — the absence of decoration IS the design.
 *   No backgrounds, no shadows, no transforms. The card renders as plain
 *   HTML would look in a 1995 browser, which is the entire point.
 *   vertical-align: middle + line-height: 0 on image wrapper prevents the
 *   inline baseline gap that appears under <img> elements in block flow.
 */
`,

  "Classic Apple.json": `\
/*
 * CLASSIC APPLE
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Original Macintosh System 1 desktop (1984)
 * Fonts     : DotGothic16 — pixel-grid Japanese font reminiscent of
 *             early Mac bitmap fonts
 *             ChicagoFLF — fan-made recreation of Apple's Chicago bitmap
 *             font, loaded via @font-face from a .ttf
 * Palette   : White bg · black text · checkerboard desktop pattern
 *
 * Key techniques:
 *   background-image: url(Swatch.svg) tiles a 2×2 pixel checkerboard SVG
 *   as the card background — reproduces the Mac desktop pattern exactly
 *
 *   Inline SVG dithering filter (#dithering-filter5):
 *     feColorMatrix desaturates the image to grayscale
 *     feComponentTransfer with linear feFuncR/G/B (slope + intercept)
 *     boosts contrast sharply before a discrete quantisation step,
 *     converting photos to high-contrast black-and-white as they would
 *     appear on a 1-bit monochrome Mac screen
 *
 *   cursor: url(macmouse.png) — replaces the system cursor with the
 *   original arrow cursor bitmap inside the card area
 */
`,

  "Code Rain.json": `\
/*
 * CODE RAIN
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : The Matrix (1999) — falling green Katakana code
 * Fonts     : Courier Prime — fixed-width serif; used for the terminal feel
 *             M PLUS 1 Code — monospaced Japanese font for the term display
 * Palette   : #000 black bg · lime (#00ff00) green text and glow
 *
 * Key techniques:
 *   <iframe> embeds rezmason.github.io/matrix — an external animated
 *   canvas rendering of the Matrix code rain; filter: brightness(0.15)
 *   dims it so text remains legible in the foreground
 *
 *   Text glow: 12-instance text-shadow stack, all in rgba(0,255,0,0.15)
 *   at increasing radii (5 px → 30 px) — layering many low-opacity
 *   shadows approximates the soft halo of a CRT phosphor glow
 *
 *   Images: mix-blend-mode: exclusion inverts colours where the image
 *   overlaps the green bg, giving photos a green-tinted negative look;
 *   filter: contrast(1.5) + a ::after overlay with mix-blend-mode: color
 *   tints the image uniformly in Matrix green
 */
`,

  "Da Vinci Sketch.json": `\
/*
 * DA VINCI SKETCH
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Leonardo da Vinci pen-and-ink study on aged parchment
 * Fonts     : Klee One — brush-style Japanese handwriting font (wght 400/600)
 *             EB Garamond — old-style serif with Renaissance character
 * Palette   : #3d3330 warm brown ink · parchment bg from bg_parchment_l_opt.jpg
 *
 * Key techniques:
 *   Image pencil effect: filter: brightness(1) grayscale(1) sepia(1)
 *   converts photos to warm sepia tone; mix-blend-mode: multiply then
 *   blends the image into the parchment background so light areas
 *   become transparent, revealing the paper beneath
 *
 *   ::before pseudo-element on .pencil-effect overlays sketch_lines.jpg
 *   with mix-blend-mode: overlay at full coverage — the hatching lines
 *   from the texture map interact with the image's mid-tones to simulate
 *   cross-hatched pen strokes
 *
 *   Hover: reverting filter and removing the ::before overlay reveals the
 *   original colour photo on mouse-over for a reveal interaction
 */
`,

  "Full Photo.json": `\
/*
 * FULL PHOTO
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Full-bleed photo card with legible text overlay
 * Fonts     : Noto Sans JP (wght 100–900 variable) · Noto Serif JP
 * Palette   : Dynamic — derived from the card's picture field
 *
 * Key techniques:
 *   Two-layer background trick: an absolutely-positioned .blur-bg div
 *   fills the card at z-index 0 with the same image, but with
 *   filter: blur(15px) and opacity 0.25 — this creates a soft,
 *   colour-matched ambient blur behind the sharp foreground image,
 *   helping text remain readable against any photo
 *
 *   filter: brightness(0.8) on the foreground image darkens it slightly
 *   so white text has enough contrast without a separate overlay div
 */
`,

  "Full Photo 2.json": `\
/*
 * FULL PHOTO 2
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Full-bleed photo with bold typographic overlay (variant 2)
 * Fonts     : Roboto (italic 700) — used for the bold slanted term display
 *             Noto Sans JP — Japanese reading and translation fields
 * Palette   : Dynamic — derived from the card's picture field
 *
 * Key techniques:
 *   Same blurred-background-behind-sharp-image approach as Full Photo,
 *   with an absolutely-positioned .blur-bg div at reduced opacity
 *
 *   transform: skewX(-8deg) on the term — gives the Japanese text a
 *   dynamic slant that matches the italic Roboto heading above it,
 *   creating a consistent angle across Latin and CJK glyphs
 *
 *   text-shadow stacking on the term creates a soft lifted appearance
 *   against the photo background without a separate text box
 */
`,

  "Game Menu UI.json": `\
/*
 * GAME MENU UI
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : 8-bit RPG pause menu / classic video game UI
 * Fonts     : UnifontMedium — pixel-exact bitmap font covering CJK glyphs
 * Palette   : #000 black bg · white text · cyan accents
 *
 * Key techniques:
 *   Inline SVG specular lighting filter (#game-menu-specular):
 *     feGaussianBlur on SourceAlpha creates a blurred height map
 *     7 feSpecularLighting passes, each with a fePointLight at a
 *     different 3D (x, y, z) position and a different specularConstant
 *     (0.4–0.8) and specularExponent (30–60) — simulates multi-source
 *     directional lighting bouncing off the UI chrome
 *     feComposite arithmetic (k1=0, k2=1, k3=1, k4=0) composites each
 *     specular highlight layer onto the previous result
 *
 *   ::before with background-image: url(pointer.svg) positions a
 *   pixel-art arrow cursor at a fixed corner of the active card element
 */
`,

  "Glowing Blue Circuits.json": `\
/*
 * GLOWING BLUE CIRCUITS
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Sci-fi circuit board / holographic tech UI
 * Fonts     : Exo 2 — geometric sci-fi sans with full variable weight axis
 *             Noto Sans JP — Japanese glyphs
 * Palette   : #000 black bg · #00ffff cyan · white accents
 *
 * Key techniques:
 *   12-layer box-shadow stack on UI elements — alternating inset and
 *   outset shadows at increasing radii in rgba cyan — simulates the
 *   soft bloom of neon / electroluminescent wire
 *
 *   backdrop-filter: blur(5px) (-webkit- prefixed for Safari) on
 *   semi-transparent panels — frosted glass morphism effect; requires
 *   the element to have a background with alpha < 1
 *
 *   ::after pseudo-element with mix-blend-mode: overlay and rgba cyan
 *   background tints the element in circuit-board blue without fully
 *   obscuring the content behind it
 *
 *   Images: filter: saturate(0.5) contrast(1.25) desaturates photos
 *   and boosts their contrast so they read as monochrome tech displays
 */
`,

  "Index Card.json": `\
/*
 * INDEX CARD
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Ruled paper index card / language-study flashcard
 * Fonts     : Chilanka — informal handwriting-style Latin font
 *             Yomogi — brush-style Japanese handwriting font
 * Palette   : white bg · #333333 dark gray · #9198e5 blue rule lines
 *             pink margin line
 *
 * Key techniques:
 *   .lined-bg: repeating-linear-gradient draws the ruled lines —
 *   the pattern repeats every 2.1 rem (line height), with a 0.1 rem
 *   wide blue stripe at the bottom of each repeat
 *
 *   .card header: a second repeating-linear-gradient draws the red
 *   margin line — a 0.025 rem pink stripe at 4.575 rem from the top,
 *   reproducing the vertical margin line found on US legal pads
 *
 *   .pencil-effect: filter: brightness(2) grayscale(1) bleaches and
 *   desaturates images; ::before overlays sketch_lines.jpg with
 *   mix-blend-mode: overlay to add hatching texture; hover removes
 *   both effects to reveal the original colour photo
 */
`,

  "Ink on Ricepaper.json": `\
/*
 * INK ON RICEPAPER
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Japanese sumi-e ink brush painting on washi / rice paper
 * Fonts     : Yuji Syuku — a brush-calligraphy-inspired Japanese serif
 * Palette   : #fff2e8 warm rice-paper white · black ink
 *
 * Key techniques:
 *   Inline SVG ink filter (#ink-and-paint-filter):
 *     feColorMatrix type=saturate desaturates the source to grayscale
 *     Four feConvolveMatrix passes each run a different 5×5 Sobel edge-
 *     detection kernel (oriented at 0°, 90°, 180°, 270°) — together
 *     they find edges in all directions, producing the fine ink outlines
 *     of brush-stroke painting
 *     feBlend mode=lighten combines the four edge maps; feComponentTransfer
 *     linear slope (slope=10, intercept=-4.5) sharply amplifies the edges
 *     into strong dark lines while suppressing the mid-tones
 *
 *   Images: filter: saturate(0) removes colour so photos look like
 *   ink washes; mix-blend-mode: multiply blends them into the paper
 *   background, making light areas transparent
 */
`,

  "Starry Night Poster.json": `\
/*
 * STARRY NIGHT POSTER
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Night-sky travel poster / celestial art print
 * Fonts     : Libre Franklin (wght 100–900 variable) · Noto Sans JP
 * Palette   : #00e5ff cyan · #ffff00 yellow · dark blue/black bg from
 *             bg_starry_night.jpg
 *
 * Key techniques:
 *   SVG filter (#text-stroke-yellow): feMorphology dilate (radius=2)
 *   expands the alpha of the source text, then feComposite in/out
 *   masks the expanded shape back to only the *new* border pixels —
 *   the result is a gold outline around the text with zero DOM additions
 *
 *   background-attachment: fixed on the .blur-bg layer creates a
 *   parallax effect: the starry sky stays fixed as the card content
 *   scrolls over it
 *
 *   Two overlay passes (rgba linear-gradient + the background image)
 *   darken and desaturate the background so light-coloured text
 *   remains readable at all card sizes
 */
`,

  "Stormy Night Poster.json": `\
/*
 * STORMY NIGHT POSTER
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Dramatic storm-lit night poster / noir travel print
 * Fonts     : Noto Serif JP — Japanese serif for an editorial headline look
 * Palette   : Dark navy/black bg · gold/amber highlights · white text
 *
 * Key techniques:
 *   Inline SVG specular-extrude filter (#poster-effect):
 *     feGaussianBlur + feMorphology dilate on SourceAlpha build a thick
 *     blurred height map; 7 feSpecularLighting passes each aim a
 *     fePointLight from a different angle and colour temperature,
 *     creating the multi-directional stage-lighting look of a dramatic
 *     poster; feComposite arithmetic chains the results
 *
 *   filter: sepia(0.75) saturate(1.25) hue-rotate(-10deg) on .card —
 *   warms the entire colour temperature toward amber/gold, unifying
 *   the image, text, and background into a cohesive stormy palette
 */
`,

  "Zenburn Theme.json": `\
/*
 * ZENBURN THEME
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Zenburn code-editor colour scheme (low-contrast programmer theme)
 * Fonts     : Source Code Pro (wght 200–900 variable) — monospaced coding font
 *             M PLUS 1 Code — monospaced Japanese coding font
 * Palette   : #3f3f3f gray bg · #dcdccc default text · #8cd0d3 cyan
 *             #7f9f7f muted green · #dca3a3 salmon · #f0dfaf wheat
 *             All colours are desaturated versions of their hue — Zenburn's
 *             signature is "not quite black, not quite white" for reduced
 *             eye strain during long study sessions
 *
 * Key techniques:
 *   Intentionally minimal CSS — the palette does the heavy lifting;
 *   no gradients, no filters, no blend modes
 *
 *   Images: opacity: 0.5 at rest, transition to opacity: 1 on hover —
 *   keeps photos visually recessive so they don't overpower the low-
 *   contrast text; hover reveals the full image as a focus action
 */
`,

};

// ---------------------------------------------------------------------------
// Apply comments
// ---------------------------------------------------------------------------

let skipped = 0;
let annotated = 0;

for (const [filename, comment] of Object.entries(comments)) {
  const path = pub(filename);
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.warn(`  skip (not found): ${filename}`);
    skipped++;
    continue;
  }

  if (data.cardCss.trimStart().startsWith("/*")) {
    console.log(`  skip (already annotated): ${filename}`);
    skipped++;
    continue;
  }

  data.cardCss = comment + data.cardCss;
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`  annotated: ${filename}`);
  annotated++;
}

console.log(`\nDone — ${annotated} annotated, ${skipped} skipped.`);
