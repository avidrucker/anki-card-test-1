import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (name) => resolve(__dirname, "../public", name);

// ---------------------------------------------------------------------------
// 1. YOU DIED
// ---------------------------------------------------------------------------

const youDiedFront = `\
<section class="died-card died-flex-center">
  <div class="died-vignette"></div>
  <div class="died-content">
    {{#audio}}
    <p class="died-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <p class="died-prompt">What does this mean?</p>
    <!-- INPUT BLOCK START -->
    <div id="input-container" class="died-input-wrap" placeholder="Type your answer here">
      {{type:term}}
    </div>
    <!-- HINT BLOCK START -->
    <div class="died-hint-wrap">
      <a class="died-hint-link" href="#" onclick="this.style.display='none';document.getElementById('died-hint').style.display='block';return false;">Click here for a hint</a>
      <div id="died-hint" class="died-hint-text" style="display:none">{{Tags}}</div>
    </div>
  </div>
</section>
<img class="dn" src onerror="document.getElementById('typeans').placeholder=document.getElementById('input-container').getAttribute('placeholder'); document.getElementById('typeans').value=''; document.getElementById('typeans').removeAttribute('readonly');" />`;

const youDiedBack = `\
<section class="died-card died-flex-center">
  <div class="died-vignette"></div>
  <p class="died-recalled">YOU RECALLED</p>
  <div class="died-content">
    {{#audio}}
    <p class="died-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <h1 class="died-term">{{term}}</h1>
    {{#reading}}<p class="died-reading">{{reading}}</p>{{/reading}}
    {{#translation}}<p class="died-translation">{{translation}}</p>{{/translation}}
    {{#transliteration}}<p class="died-transliteration">"{{transliteration}}"</p>{{/transliteration}}
    <p class="died-tags">{{Tags}}</p>
    {{#picture}}<div class="died-picture">{{picture}}</div>{{/picture}}
  </div>
</section>`;

const youDiedCss = `\
/*
 * YOU DIED
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Dark Souls / FromSoftware death screen
 * Fonts     : Cinzel (Google Fonts) — Roman-era serif; evokes stone carvings
 * Palette   : #000 background · #D4C5A9 bone · #C0392B ember red · #666 ash
 * Background: radial-gradient from dark red center to pure black edges
 * Vignette  : absolute inset radial-gradient overlay, transparent center,
 *             rgba black at edges — deepens the sense of tunnel vision
 * Text glow : text-shadow in blood-red on the term; ember glow on the
 *             "YOU RECALLED" banner via multi-stop text-shadow spread
 * Images    : filter brightness(0.65) sepia(0.4) — aged, drained of color
 * Input     : borderless except a single bottom rule that glows red on focus
 */

@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap");

:root {
  --blood: #8B1A1A;
  --ember: #C0392B;
  --bone:  #D4C5A9;
  --ash:   #666;
}

.card {
  background: #000;
  color: var(--bone);
  font-family: "Cinzel", serif;
  min-height: 100%;
}

.died-card {
  background: radial-gradient(ellipse at 50% 50%, #1e0000 0%, #0a0000 55%, #000 100%);
  min-height: 100%;
  position: relative;
  overflow: hidden;
}

.died-flex-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.died-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%);
  pointer-events: none;
}

.died-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 4rem 3rem;
}

.died-recalled {
  position: absolute;
  top: 1.25rem;
  left: 0; right: 0;
  text-align: center;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--ember);
  text-shadow: 0 0 18px rgba(192,57,43,0.9), 0 0 40px rgba(192,57,43,0.4);
  z-index: 1;
  margin: 0;
}

.died-term {
  font-size: 6rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: var(--bone);
  text-shadow: 0 0 40px rgba(139,26,26,0.6);
  margin: 0 0 1rem;
  line-height: 1.1;
}

.died-prompt {
  font-size: 1.6rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--ash);
  margin: 0 0 1rem;
}

.died-reading {
  font-size: 3.2rem;
  color: #aaa;
  letter-spacing: 0.04em;
  margin: 0.5rem 0;
}

.died-translation {
  font-size: 2.4rem;
  color: var(--bone);
  opacity: 0.82;
  margin: 0.5rem 0;
}

.died-transliteration {
  font-size: 2rem;
  color: var(--ash);
  font-style: italic;
  margin: 0.5rem 0;
}

.died-tags {
  font-size: 1.4rem;
  color: var(--blood);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 1rem 0 0;
}

.died-audio {
  color: var(--ember);
  margin: 0 0 1.5rem;
}

.died-picture img {
  max-width: 220px;
  margin-top: 1.5rem;
  filter: brightness(0.65) sepia(0.4);
  border: 1px solid var(--blood);
}

.died-input-wrap {
  margin-top: 1.5rem;
}

#input-container input {
  background-color: transparent;
  color: var(--bone);
  font-family: "Cinzel", serif;
  font-size: 2rem;
  padding: 0.5rem 0;
  border: none;
  border-bottom: 1px solid var(--blood);
  width: 100%;
  text-align: center;
}

#input-container input::placeholder {
  color: var(--ash);
  opacity: 0.6;
}

#input-container input:focus {
  outline: none;
  border-bottom-color: var(--ember);
}

.died-hint-wrap {
  margin-top: 1rem;
}

.died-hint-link {
  font-size: 1.4rem;
  color: var(--ash);
  text-decoration: underline;
  cursor: pointer;
  letter-spacing: 0.1em;
}

.died-hint-text {
  font-size: 1.4rem;
  color: var(--blood);
  letter-spacing: 0.15em;
  margin-top: 0.5rem;
}

.dn { display: none; }

.play-button {
  color: var(--ember);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 3rem;
  line-height: 1;
}

.append-play-btn-text a::after { content: "▶"; color: var(--ember); }
.append-play-btn-text svg { display: none; }
.append-play-btn-text button { font-size: 3rem; cursor: pointer; padding: 0.2rem 0.4rem; }
`;

// ---------------------------------------------------------------------------
// 2. VAPORWAVE
// ---------------------------------------------------------------------------

const vaporwaveFront = `\
<section class="vapor-card">
  <div class="vapor-sun-wrap"><div class="vapor-sun"></div></div>
  <div class="vapor-grid"></div>
  <div class="vapor-content">
    {{#audio}}
    <p class="vapor-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <p class="vapor-eyebrow">Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ</p>
    <p class="vapor-prompt">Ｗｈａｔ ｄｏｅｓ ｔｈｉｓ ｍｅａｎ？</p>
    <!-- INPUT BLOCK START -->
    <div id="input-container" class="vapor-input-wrap" placeholder="Type your answer here">
      {{type:term}}
    </div>
    <!-- HINT BLOCK START -->
    <div class="vapor-hint-wrap">
      <a class="vapor-hint-link" href="#" onclick="this.style.display='none';document.getElementById('vapor-hint').style.display='block';return false;">Ｈｉｎｔ</a>
      <div id="vapor-hint" class="vapor-hint-text" style="display:none">{{Tags}}</div>
    </div>
  </div>
</section>
<img class="dn" src onerror="document.getElementById('typeans').placeholder=document.getElementById('input-container').getAttribute('placeholder'); document.getElementById('typeans').value=''; document.getElementById('typeans').removeAttribute('readonly');" />`;

const vaporwaveBack = `\
<section class="vapor-card">
  <div class="vapor-sun-wrap"><div class="vapor-sun"></div></div>
  <div class="vapor-grid"></div>
  <div class="vapor-content">
    {{#audio}}
    <p class="vapor-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <h1 class="vapor-term">{{term}}</h1>
    {{#reading}}<p class="vapor-reading">{{reading}}</p>{{/reading}}
    {{#translation}}<p class="vapor-translation">{{translation}}</p>{{/translation}}
    {{#transliteration}}<p class="vapor-transliteration">{{transliteration}}</p>{{/transliteration}}
    <p class="vapor-tags">{{Tags}}</p>
    {{#picture}}<div class="vapor-picture">{{picture}}</div>{{/picture}}
  </div>
</section>`;

const vaporwaveCss = `\
/*
 * VAPORWAVE
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : 1980s–90s retro-future / synthwave / aesthetic internet
 * Fonts     : VT323 (Google Fonts) — bitmap terminal monospace
 * Palette   : #ff71ce pink · #01cdfe cyan · #b967ff purple · #fffb96 yellow
 *             Background: linear-gradient from #0d0221 → #1a0533 → #2d1b69
 * Retro sun : half-circle (overflow:hidden on wrapper) with linear-gradient
 *             from pink → orange → red; horizontal stripe cutouts via
 *             repeating-linear-gradient on ::after overlay
 * Grid floor: two radial-gradient lines as background-image on an element
 *             with transform: perspective(220px) rotateX(58deg) — creates the
 *             receding checkerboard floor seen in synthwave artwork
 * Text glow : text-shadow with matching color for each field (pink/cyan/purple)
 *             plus a 3px offset drop-shadow in purple on the main term
 * Images    : hue-rotate(270deg) + saturate(2) → cyan/purple tint;
 *             box-shadow glow in pink around the border
 */

@import url("https://fonts.googleapis.com/css2?family=VT323&display=swap");

:root {
  --vp-pink:   #ff71ce;
  --vp-blue:   #01cdfe;
  --vp-purple: #b967ff;
  --vp-yellow: #fffb96;
  --vp-dark:   #0d0221;
}

.card {
  background: linear-gradient(180deg, #0d0221 0%, #1a0533 50%, #2d1b69 100%);
  font-family: "VT323", monospace;
  color: var(--vp-pink);
  min-height: 100%;
}

.vapor-card {
  min-height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #0d0221 0%, #1a0533 50%, #2d1b69 100%);
  display: flex;
  flex-direction: column;
}

.vapor-sun-wrap {
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 70px;
  overflow: hidden;
}

.vapor-sun {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff6ec7 0%, #ff8c00 40%, #ff4500 70%, #c0392b 100%);
  position: relative;
}

.vapor-sun::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(
    180deg,
    transparent 0px, transparent 7px,
    var(--vp-dark) 7px, var(--vp-dark) 11px
  );
}

.vapor-grid {
  position: absolute;
  bottom: 0;
  left: -30%;
  right: -30%;
  height: 42%;
  background-image:
    linear-gradient(rgba(255,113,206,0.55) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,113,206,0.55) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(220px) rotateX(58deg);
  transform-origin: bottom center;
}

.vapor-content {
  position: relative;
  z-index: 2;
  padding: 1.5rem 1.5rem 1rem;
  padding-top: 5.5rem;
  text-align: center;
}

.vapor-eyebrow {
  font-size: 1rem;
  color: var(--vp-purple);
  text-shadow: 0 0 8px var(--vp-purple);
  margin: 0 0 0.25rem;
  letter-spacing: 0.05em;
}

.vapor-term {
  font-size: 4.5rem;
  line-height: 1;
  color: var(--vp-pink);
  text-shadow: 0 0 12px var(--vp-pink), 3px 3px 0 var(--vp-purple);
  margin: 0 0 0.4rem;
}

.vapor-prompt {
  font-size: 1.75rem;
  color: var(--vp-blue);
  text-shadow: 0 0 10px var(--vp-blue);
  margin: 0;
}

.vapor-reading {
  font-size: 2.5rem;
  color: var(--vp-blue);
  text-shadow: 0 0 10px var(--vp-blue);
  margin: 0.1rem 0;
}

.vapor-translation {
  font-size: 2rem;
  color: var(--vp-yellow);
  text-shadow: 0 0 8px rgba(255,251,150,0.7);
  margin: 0.1rem 0;
}

.vapor-transliteration {
  font-size: 1.6rem;
  color: #9999bb;
  margin: 0.1rem 0;
}

.vapor-tags {
  font-size: 1.5rem;
  color: var(--vp-purple);
  text-shadow: 0 0 8px var(--vp-purple);
  margin: 0.25rem 0 0;
}

.vapor-audio {
  color: var(--vp-blue);
  margin: 0 0 0.5rem;
  text-shadow: 0 0 10px var(--vp-blue);
}

.vapor-picture img {
  max-width: 270px;
  margin-top: 0.5rem;
  filter: hue-rotate(270deg) saturate(2) brightness(0.75);
  border: 2px solid var(--vp-pink);
  box-shadow: 0 0 12px var(--vp-pink);
}

.play-button {
  color: var(--vp-blue);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 4rem;
  text-shadow: 0 0 10px var(--vp-blue);
}

.append-play-btn-text a::after { content: "▶"; color: var(--vp-blue); text-shadow: 0 0 10px var(--vp-blue); }
.append-play-btn-text svg { display: none; }
.append-play-btn-text button { font-size: 4rem; cursor: pointer; padding: 0.2rem 0.4rem; }

.vapor-input-wrap {
  margin-top: 1.25rem;
  width: 100%;
}

#input-container input {
  background: transparent;
  color: var(--vp-pink);
  font-family: "VT323", monospace;
  font-size: 2rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-blue);
  box-shadow: 0 0 10px rgba(1,205,254,0.4), inset 0 0 8px rgba(1,205,254,0.08);
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

#input-container input::placeholder {
  color: var(--vp-blue);
  opacity: 0.55;
}

#input-container input:focus {
  outline: none;
  border-color: var(--vp-pink);
  box-shadow: 0 0 14px rgba(255,113,206,0.6), inset 0 0 8px rgba(255,113,206,0.08);
}

.vapor-hint-wrap {
  margin-top: 0.75rem;
}

.vapor-hint-link {
  font-size: 1.5rem;
  color: var(--vp-purple);
  text-decoration: underline;
  cursor: pointer;
  text-shadow: 0 0 8px var(--vp-purple);
}

.vapor-hint-text {
  font-size: 1.5rem;
  color: var(--vp-purple);
  margin-top: 0.5rem;
  text-shadow: 0 0 8px var(--vp-purple);
}

.dn { display: none; }
`;

// ---------------------------------------------------------------------------
// 3. TAROT CARD
// ---------------------------------------------------------------------------

const tarotFront = `\
<section class="tarot-card">
  <div class="tarot-frame">
    <p class="tarot-header">✦ THE UNKNOWN ✦</p>
    <p class="tarot-stars">★ · ☽ · ★</p>
    <hr class="tarot-rule" />
    {{#audio}}
    <p class="tarot-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <p class="tarot-question">What does this mean?</p>
    <!-- INPUT BLOCK START -->
    <div id="input-container" class="tarot-input-wrap" placeholder="Type your answer here">
      {{type:term}}
    </div>
    <!-- HINT BLOCK START -->
    <div class="tarot-hint-wrap">
      <a class="tarot-hint-link" href="#" onclick="this.style.display='none';document.getElementById('tarot-hint').style.display='block';return false;">Click here for a hint</a>
      <div id="tarot-hint" class="tarot-hint-text" style="display:none">{{Tags}}</div>
    </div>
    <hr class="tarot-rule" />
    <div class="tarot-symbol">☿</div>
    <div class="tarot-footer-bar">The Card of Knowing</div>
  </div>
</section>
<img class="dn" src onerror="document.getElementById('typeans').placeholder=document.getElementById('input-container').getAttribute('placeholder'); document.getElementById('typeans').value=''; document.getElementById('typeans').removeAttribute('readonly');" />`;

const tarotBack = `\
<section class="tarot-card">
  <div class="tarot-frame">
    <p class="tarot-header">✦ REVEALED ✦</p>
    <p class="tarot-stars">★ · ☀ · ★</p>
    <hr class="tarot-rule" />
    {{#audio}}
    <p class="tarot-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <h1 class="tarot-term">{{term}}</h1>
    {{#reading}}<p class="tarot-reading">{{reading}}</p>{{/reading}}
    <hr class="tarot-rule" />
    {{#translation}}<p class="tarot-translation">{{translation}}</p>{{/translation}}
    {{#transliteration}}<p class="tarot-transliteration">{{transliteration}}</p>{{/transliteration}}
    <p class="tarot-tags">{{Tags}}</p>
    {{#picture}}<div class="tarot-picture">{{picture}}</div>{{/picture}}
    <div class="tarot-footer-bar">The Card of Memory</div>
  </div>
</section>`;

const tarotCss = `\
/*
 * TAROT CARD
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Major Arcana oracle card / occult mysticism
 * Fonts     : Cinzel (body text) + Cinzel Decorative (headers, term, footer)
 *             — Google Fonts; both are based on Roman inscriptional capitals
 * Palette   : #c9a84c gold · #7d6226 dim gold · #f0e6c8 cream · #a0a0c0 silver
 *             Background: radial-gradient spotlight from #1a1a38 → #0d0d1f
 * Border    : double-layered frame — outer 2px solid gold + inset box-shadow
 *             (1px dark gap, then 3px dim-gold inner rule) creates an ornate
 *             nested border without extra elements
 * Decorative: Unicode celestial glyphs (★ ✦ ☽ ☀ ☿) used as ornaments;
 *             <hr> rules at 55% width with opacity for subtle section breaks
 * Glow      : text-shadow on term and symbol in muted gold rgba
 * Images    : filter sepia(0.6) brightness(0.75) — aged illuminated manuscript
 * Layout    : flex column, footer pushed to bottom via margin-top: auto
 */

@import url("https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&display=swap");

:root {
  --tg:   #c9a84c;
  --tgd:  #7d6226;
  --tbg:  #0d0d1f;
  --tcr:  #f0e6c8;
  --tsl:  #a0a0c0;
}

.card {
  font-family: "Cinzel", serif;
  background: var(--tbg);
  color: var(--tcr);
  min-height: 100%;
}

.tarot-card {
  min-height: 100%;
  padding: 0.6rem;
  background: radial-gradient(ellipse at 50% 25%, #1a1a38 0%, #0d0d1f 70%);
  box-sizing: border-box;
}

.tarot-frame {
  min-height: calc(100% - 1.2rem);
  border: 2px solid var(--tg);
  box-shadow:
    inset 0 0 0 1px var(--tbg),
    inset 0 0 0 3px var(--tgd),
    0 0 24px rgba(201,168,76,0.18);
  padding: 1.8rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
}

.tarot-header {
  font-family: "Cinzel Decorative", serif;
  font-size: 1.5rem;
  color: var(--tg);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  margin: 0 0 0.6rem;
}

.tarot-stars {
  color: var(--tg);
  font-size: 2rem;
  letter-spacing: 0.6em;
  opacity: 0.65;
  margin: 0 0 1rem;
}

.tarot-rule {
  width: 55%;
  border: none;
  border-top: 1px solid var(--tgd);
  margin: 0.8rem auto;
  opacity: 0.55;
}

.tarot-symbol {
  font-size: 5rem;
  color: var(--tg);
  text-shadow: 0 0 18px rgba(201,168,76,0.5);
  margin: 0.8rem 0 0.4rem;
  line-height: 1;
}

.tarot-term {
  font-family: "Cinzel Decorative", serif;
  font-size: 4rem;
  color: var(--tcr);
  text-shadow: 0 0 14px rgba(201,168,76,0.25);
  margin: 0.4rem 0;
  line-height: 1.2;
}

.tarot-question {
  font-size: 1.5rem;
  color: var(--tsl);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0.6rem 0;
}

.tarot-reading {
  font-size: 2.2rem;
  color: var(--tg);
  letter-spacing: 0.08em;
  margin: 0.4rem 0;
}

.tarot-translation {
  font-size: 2rem;
  color: var(--tcr);
  opacity: 0.85;
  font-style: italic;
  margin: 0.4rem 0;
}

.tarot-transliteration {
  font-size: 1.8rem;
  color: var(--tsl);
  margin: 0.4rem 0;
}

.tarot-tags {
  font-size: 1.3rem;
  color: var(--tgd);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0.8rem 0 0;
}

.tarot-footer-bar {
  font-family: "Cinzel Decorative", serif;
  font-size: 1.2rem;
  color: var(--tg);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  padding: 0.6rem 1.6rem;
  border: 1px solid var(--tgd);
  margin-top: auto;
}

.tarot-audio {
  color: var(--tg);
  margin: 0 0 1rem;
}

.tarot-picture img {
  max-width: 210px;
  margin-top: 1rem;
  filter: sepia(0.6) brightness(0.75);
  border: 1px solid var(--tgd);
}

.play-button {
  color: var(--tg);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 2.4rem;
}

.append-play-btn-text a::after { content: "▶"; color: var(--tg); }
.append-play-btn-text svg { display: none; }
.append-play-btn-text button { font-size: 2.4rem; cursor: pointer; padding: 0.2rem 0.4rem; }

.tarot-input-wrap {
  margin-top: 1rem;
  width: 100%;
}

#input-container input {
  background: transparent;
  color: var(--tcr);
  font-family: "Cinzel", serif;
  font-size: 1.6rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--tgd);
  box-shadow: 0 0 8px rgba(201,168,76,0.2), inset 0 0 6px rgba(201,168,76,0.06);
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  letter-spacing: 0.05em;
}

#input-container input::placeholder {
  color: var(--tsl);
  opacity: 0.6;
}

#input-container input:focus {
  outline: none;
  border-color: var(--tg);
  box-shadow: 0 0 12px rgba(201,168,76,0.45), inset 0 0 6px rgba(201,168,76,0.1);
}

.tarot-hint-wrap {
  margin-top: 0.75rem;
}

.tarot-hint-link {
  font-size: 1.1rem;
  color: var(--tsl);
  text-decoration: underline;
  cursor: pointer;
  letter-spacing: 0.15em;
}

.tarot-hint-text {
  font-size: 1.1rem;
  color: var(--tgd);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-top: 0.4rem;
}

.dn { display: none; }
`;

// ---------------------------------------------------------------------------
// 4. HALFTONE COMICS
// ---------------------------------------------------------------------------

const halftoneFront = `\
<section class="halftone-card">
  <div class="halftone-banner">⚡ VOCAB CHALLENGE! ⚡</div>
  <div class="speech-bubble">
    <p class="halftone-prompt">What does this mean?!</p>
  </div>
  <div class="halftone-panel">
    {{#audio}}
    <p class="halftone-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <!-- INPUT BLOCK START -->
    <div id="input-container" class="halftone-input-wrap" placeholder="Type your answer here">
      {{type:term}}
    </div>
    <!-- HINT BLOCK START -->
    <div class="halftone-hint-wrap">
      <a class="halftone-hint-link" href="#" onclick="this.style.display='none';document.getElementById('halftone-hint').style.display='block';return false;">Click here for a hint</a>
      <div id="halftone-hint" class="halftone-hint-text" style="display:none">{{Tags}}</div>
    </div>
  </div>
</section>
<img class="dn" src onerror="document.getElementById('typeans').placeholder=document.getElementById('input-container').getAttribute('placeholder'); document.getElementById('typeans').value=''; document.getElementById('typeans').removeAttribute('readonly');" />`;

const halftoneBack = `\
<section class="halftone-card">
  <div class="halftone-banner">★ ANSWER REVEALED! ★</div>
  <div class="halftone-panel">
    {{#audio}}
    <p class="halftone-audio append-play-btn-text">{{audio}}</p>
    {{/audio}}
    <h1 class="halftone-term">{{term}}</h1>
    {{#reading}}<p class="halftone-reading">{{reading}}</p>{{/reading}}
    {{#translation}}<p class="halftone-translation">{{translation}}</p>{{/translation}}
    {{#transliteration}}<p class="halftone-transliteration">{{transliteration}}</p>{{/transliteration}}
    <p class="halftone-tags">{{Tags}}</p>
    {{#picture}}<div class="ht-pic ht-v1">{{picture}}</div>{{/picture}}
  </div>
</section>`;

const halftoneCss = `\
/*
 * HALFTONE COMICS
 * ─────────────────────────────────────────────────────────────────────────
 * Aesthetic : Silver Age comic book / Ben-Day dot print / Pop Art
 * Fonts     : Bangers (Google Fonts) — condensed display; used for all text
 *             fields including term, reading, translation, transliteration,
 *             tags, and picture variant labels
 *             Comic Neue (Google Fonts) — casual handwritten sans; used for
 *             card body text base (inherited by .card)
 * Palette   : #FFEC3D yellow · #E63946 red · #1D3557 navy · #457B9D blue-gray
 *             #FFFDE7 cream panel · #111 near-black
 * Background: radial-gradient dot pattern (1px circle, 8px grid) on yellow —
 *             simulates the Ben-Day printing dots of Silver Age comics
 * Panels    : white/cream divs with 3px solid border + hard 4px offset
 *             box-shadow (no blur) — mimics inked comic panel borders
 * Speech    : border-radius + CSS triangle (::after/::before with border trick)
 *             to create a speech bubble with a lower-left tail
 * Banner    : red bar with Bangers + letter-spacing + text-shadow drop
 *
 * Halftone picture variants (CSS-only, no SVG — technique from css-irl.info):
 *   All use a repeating radial-gradient dot grid on ::after + mix-blend-mode
 *   V1 Fine Grid  — hard-stop 0.12rem dots on 0.42rem grid, multiply blend;
 *                   image grayscaled, dots overlay as a tight newsprint screen
 *   V2 Contrast   — soft-center dots (0→transparent over 0.35rem) + container
 *                   filter:contrast(22); contrast sharpens the soft gradient
 *                   edges into crisp circles whose apparent size varies with
 *                   image brightness (bright = sharp dot, dark = no dot)
 *   V3 Inverted   — fine grid with double invert: image filter:invert(1) then
 *                   container filter:invert(1) flips the blend result so dots
 *                   appear in dark areas and highlights stay white
 *   V4 Ben-Day    — large 0.28rem blue dots on 0.9rem grid; pop-art scale
 *                   using --cb (navy) as dot color for a single-ink screen feel
 */

@import url("https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:ital,wght@0,400;0,700;1,400&display=swap");

:root {
  --cy: #FFEC3D;
  --cr: #E63946;
  --cb: #1D3557;
  --cc: #457B9D;
  --ck: #111111;
  --cw: #FFFDE7;
}

.card {
  font-family: "Comic Neue", cursive;
  background: var(--cy);
  color: var(--ck);
  min-height: 100%;
}

.halftone-card {
  min-height: 100%;
  background-color: var(--cy);
  background-image: radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px);
  background-size: 8px 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.halftone-banner {
  background: var(--cr);
  color: white;
  font-family: "Bangers", cursive;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  text-align: center;
  padding: 0.3rem 1rem;
  border-bottom: 3px solid var(--ck);
  box-shadow: 0 3px 0 var(--ck);
  text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
  margin: 0;
}

.halftone-panel {
  background: var(--cw);
  border: 3px solid var(--ck);
  box-shadow: 4px 4px 0 var(--ck);
  padding: 1rem;
  margin: 0.75rem;
}

.speech-bubble {
  background: white;
  border: 3px solid var(--ck);
  border-radius: 16px;
  padding: 0.6rem 1rem;
  margin: 0.75rem 0.75rem 0;
  position: relative;
  box-shadow: 4px 4px 0 var(--ck);
}

.speech-bubble::after {
  content: "";
  position: absolute;
  bottom: -19px;
  left: 22px;
  width: 0; height: 0;
  border-left: 14px solid transparent;
  border-right: 4px solid transparent;
  border-top: 19px solid var(--ck);
}

.speech-bubble::before {
  content: "";
  position: absolute;
  bottom: -13px;
  left: 25px;
  width: 0; height: 0;
  border-left: 10px solid transparent;
  border-right: 3px solid transparent;
  border-top: 14px solid white;
  z-index: 1;
}

.halftone-prompt {
  font-family: "Bangers", cursive;
  font-size: 1.75rem;
  letter-spacing: 0.05em;
  color: var(--ck);
  margin: 0;
}

.halftone-term {
  font-family: "Bangers", cursive;
  font-size: 3.5rem;
  line-height: 1;
  letter-spacing: 0.04em;
  color: var(--ck);
  margin: 0 0 0.25rem;
}

.halftone-reading {
  font-family: "Bangers", cursive;
  font-size: 2rem;
  color: var(--cb);
  margin: 0 0 0.25rem;
}

.halftone-translation {
  font-family: "Bangers", cursive;
  font-size: 2.2rem;
  letter-spacing: 0.04em;
  color: var(--ck);
  margin: 0.4rem 0;
}

.halftone-transliteration {
  font-family: "Bangers", cursive;
  font-size: 1.9rem;
  letter-spacing: 0.04em;
  color: #444;
  margin: 0.4rem 0;
}

.halftone-tags {
  font-family: "Bangers", cursive;
  font-size: 1.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--cc);
  margin: 0.6rem 0 0;
}

.halftone-audio {
  color: var(--cb);
  margin: 0 0 0.5rem;
}

/* ── Halftone picture comparison grid ───────────────────────────── */

.ht-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.ht-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ht-label {
  font-family: "Bangers", cursive;
  font-size: 1.1rem;
  color: var(--cb);
  letter-spacing: 0.05em;
  margin: 0.3rem 0 0;
  text-align: center;
}

/* shared base */
.ht-pic {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: white;
  border: 3px solid var(--ck);
  box-shadow: 3px 3px 0 var(--ck);
}

.ht-pic img {
  display: block;
  width: 100%;
}

.ht-pic::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* V1 — Fine dense grid, hard stops, multiply
   Small tight dots overlay the grayscale image.
   Bright image areas keep the dot pattern visible;
   dark areas merge into solid black. */
.ht-v1 img {
  filter: grayscale(1);
  mix-blend-mode: multiply;
}
.ht-v1::after {
  --d: 0.12rem;
  --g: 0.42rem;
  background-image:
    radial-gradient(circle, black var(--d), transparent var(--d)),
    radial-gradient(circle, black var(--d), transparent var(--d));
  background-size: var(--g) var(--g);
  background-position: 0 0, calc(var(--g) / 2) calc(var(--g) / 2);
  mix-blend-mode: multiply;
}

/* V2 — Contrast-sharpened halftone (article technique)
   Soft-stop dots + high contrast on the container.
   The contrast filter turns the gradient dot edges into
   crisp circles; the image via multiply modulates dot
   visibility: bright = sharp dot, dark = no dot. */
.ht-v2 {
  filter: contrast(22) grayscale(1);
}
.ht-v2 img {
  mix-blend-mode: multiply;
}
.ht-v2::after {
  --d: 0.35rem;
  --g: 0.65rem;
  background-image:
    radial-gradient(circle, black 0rem, transparent var(--d)),
    radial-gradient(circle, black 0rem, transparent var(--d));
  background-size: var(--g) var(--g);
  background-position: 0 0, calc(var(--g) / 2) calc(var(--g) / 2);
  background-color: white;
  mix-blend-mode: multiply;
}

/* V3 — Inverted: same fine grid but image+container inverted.
   Dark areas now show dots; light areas stay white.
   Flip image → dots → flip whole container back. */
.ht-v3 {
  filter: invert(1);
}
.ht-v3 img {
  filter: grayscale(1) invert(1);
  mix-blend-mode: multiply;
}
.ht-v3::after {
  --d: 0.12rem;
  --g: 0.42rem;
  background-image:
    radial-gradient(circle, black var(--d), transparent var(--d)),
    radial-gradient(circle, black var(--d), transparent var(--d));
  background-size: var(--g) var(--g);
  background-position: 0 0, calc(var(--g) / 2) calc(var(--g) / 2);
  mix-blend-mode: multiply;
}

/* V4 — Large Ben-Day dots, Pop Art scale
   Bigger, widely-spaced dots in the classic comic
   book register color (flat blue). */
.ht-v4 img {
  filter: grayscale(1);
  mix-blend-mode: multiply;
}
.ht-v4::after {
  --d: 0.28rem;
  --g: 0.9rem;
  background-image:
    radial-gradient(circle, var(--cb) var(--d), transparent var(--d)),
    radial-gradient(circle, var(--cb) var(--d), transparent var(--d));
  background-size: var(--g) var(--g);
  background-position: 0 0, calc(var(--g) / 2) calc(var(--g) / 2);
  mix-blend-mode: multiply;
}

.play-button {
  color: var(--cb);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 3rem;
}

.append-play-btn-text a::after { content: "▶"; color: var(--cb); }
.append-play-btn-text svg { display: none; }
.append-play-btn-text button { font-family: "Bangers", cursive; font-size: 3rem; cursor: pointer; padding: 0.2rem 0.4rem; }

.halftone-input-wrap {
  margin-top: 0.75rem;
}

#input-container input {
  background: transparent;
  color: var(--ck);
  font-family: "Bangers", cursive;
  font-size: 2rem;
  letter-spacing: 0.05em;
  padding: 0.4rem 0.6rem;
  border: 3px solid var(--ck);
  box-shadow: 3px 3px 0 var(--ck);
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

#input-container input::placeholder {
  color: var(--cb);
  opacity: 0.65;
}

#input-container input:focus {
  outline: none;
  border-color: var(--cr);
  box-shadow: 3px 3px 0 var(--cr);
}

.halftone-hint-wrap {
  margin-top: 0.6rem;
}

.halftone-hint-link {
  font-family: "Bangers", cursive;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  color: var(--cb);
  text-decoration: underline;
  cursor: pointer;
}

.halftone-hint-text {
  font-family: "Bangers", cursive;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  color: var(--cc);
  margin-top: 0.3rem;
}
`;

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

const themes = [
  { designName: "You Died",        frontHtml: youDiedFront,   backHtml: youDiedBack,   cardCss: youDiedCss   },
  { designName: "Vaporwave",       frontHtml: vaporwaveFront, backHtml: vaporwaveBack, cardCss: vaporwaveCss },
  { designName: "Tarot Card",      frontHtml: tarotFront,     backHtml: tarotBack,     cardCss: tarotCss     },
  { designName: "Halftone Comics", frontHtml: halftoneFront,  backHtml: halftoneBack,  cardCss: halftoneCss  },
];

for (const theme of themes) {
  const path = pub(`${theme.designName}.json`);
  writeFileSync(path, JSON.stringify(theme, null, 2));
  console.log(`wrote ${path}`);
}
