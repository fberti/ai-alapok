// Magyarázó tippek a kódrészletekhez (assets/js/kod-tippek.js jeleníti meg).
//
// Használat a projekt gyökeréből:
//   node eszkozok/kodtippek.cjs            minden fejezet frissítése
//   node eszkozok/kodtippek.cjs 05 06      csak a megadott fejezetek
//   node eszkozok/kodtippek.cjs --check    csak ellenőrzés: van-e elavult fájl
//
// Adatok:
//   eszkozok/kodtippek/kozos.json   az általános Python- és Prolog-elemek tippjei
//                                   (kulcsszavak, beépített függvények, könyvtárak)
//   eszkozok/kodtippek/NN.json      az NN. fejezet kódrészletei, azonosító szerint:
//     { "<figure vagy pre id>": { "lang": "python" | "prolog",
//                                 "tips": { "szó": { "tip": "…", "ex": "…", "exLang": "prolog" } },
//                                 "skip": ["szó", …] } }
//   A fejezet saját tippje felülírja a közöset; a "skip" listán lévő közös szavak
//   ebben a kódrészletben nem kapnak tippet. A "tip" kötelező, az "ex" (futtatható
//   példa, kimenettel megjegyzésben) a függvényeknél és műveleteknél ajánlott.
//
// Működés: a megadott azonosítójú elemen belül az első <pre> szövegében minden
// ismert szót <span class="u-tok" data-tip="…"> elembe csomagol. A megjegyzéseken
// (# vagy %) és a szövegkonstansokon belül nem csomagol. Minden kulcs első
// előfordulása tabindex="0"-t kap. A korábbi csomagolást előbb eltávolítja, így
// többször is futtatható. Az oldal első tippes kódja alá rövid használati tippet
// tesz, és gondoskodik a kod-tippek.js betöltéséről.
// A 09–11. fejezetnél a sablont (eszkozok/NN-sablon.html) írja; utána a megfelelő
// NN-abrak.cjs újragenerálja a fejezetet. Ezt a szkript el is végzi.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(__dirname, 'kodtippek');
const HINT = '<span class="u-js-only u-tok-hint"><strong>Tipp:</strong> vidd az egeret egy pontozottan aláhúzott szóra, koppints rá, vagy lépj a kódra a Tab billentyűvel, és a nyilakkal lépkedj a szavak között: rövid magyarázat és példa jelenik meg. </span>';
const HINT_P = '<p class="u-js-only u-tok-hint"><strong>Tipp:</strong> a kódokban vidd az egeret egy pontozottan aláhúzott szóra, koppints rá, vagy lépj a kódra a Tab billentyűvel, és a nyilakkal lépkedj a szavak között: rövid magyarázat és példa jelenik meg.</p>';
const SCRIPT = '<script defer src="../assets/js/kod-tippek.js"></script>';

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '&#10;');
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isWord = (k) => /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(k);

function chapterFile(nn) {
  const tpl = path.join(__dirname, `${nn}-sablon.html`);
  if (fs.existsSync(tpl)) return {file: tpl, template: true};
  const f = fs.readdirSync(path.join(ROOT, 'fejezetek')).find((x) => x.startsWith(nn + '-') && x.endsWith('.html'));
  return {file: path.join(ROOT, 'fejezetek', f), template: false};
}

/** A tippek egy kódrészlethez: közös + saját, a skip-pel szűrve. */
function tipsFor(common, spec) {
  const lang = spec.lang || 'python';
  const base = common[lang] || {};
  const out = {};
  for (const [k, v] of Object.entries(base)) if (!(spec.skip || []).includes(k)) out[k] = v;
  for (const [k, v] of Object.entries(spec.tips || {})) out[k] = typeof v === 'string' ? {tip: v} : v;
  return {lang, tips: out};
}

const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A kulcsok a nyers HTML-ben (entitásokkal) keresendők. */
function buildRegex(keys) {
  const sorted = [...keys].sort((a, b) => b.length - a.length);
  const parts = sorted.map((k) => (isWord(k)
    ? `(?<![A-Za-z0-9_&#])${escRe(k)}(?![A-Za-z0-9_])`
    : (escHtml(k) === k ? escRe(k) : `${escRe(escHtml(k))}|${escRe(k)}`)));
  return new RegExp(parts.join('|'), 'g');
}

/** Egy <pre> belsejének csomagolása. */
function wrapCode(inner, lang, tips) {
  inner = inner.replace(/<span class="u-tok"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  const keys = Object.keys(tips);
  if (!keys.length) return inner;
  const unHtml = (m) => m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const re = buildRegex(keys);
  const seen = new Set();
  const commentCh = lang === 'prolog' ? '%' : '#';
  let inComment = false;
  /** @type {string | null} */ let quote = null;
  let out = '';
  let plain = '';
  const flush = () => {
    if (!plain) return;
    out += plain.replace(re, (m) => {
      const key = tips[m] ? m : unHtml(m);
      const t = tips[key];
      const first = !seen.has(key);
      seen.add(key);
      let a = ` data-tip="${escAttr(t.tip)}"`;
      if (t.ex) a += ` data-ex="${escAttr(t.ex)}"`;
      const exLang = t.exLang || lang;
      if (t.ex && exLang !== 'python') a += ` data-ex-lang="${exLang}"`;
      if (first) a += ' tabindex="0"';
      return `<span class="u-tok"${a}>${m}</span>`;
    });
    plain = '';
  };
  // A HTML-címkék érintetlenül maradnak; a szövegben a megjegyzéseket és a
  // szövegkonstansokat átugorjuk, a többiben keresünk.
  for (const piece of inner.split(/(<[^>]+>)/)) {
    if (!piece) continue;
    if (piece.startsWith('<')) { flush(); out += piece; continue; }
    let i = 0;
    while (i < piece.length) {
      const ent = piece[i] === '&' ? piece.slice(i).match(/^&[#A-Za-z0-9]+;/) : null;
      const tok = ent ? ent[0] : piece[i];
      const ch = tok === '&quot;' ? '"' : tok === '&#39;' ? "'" : tok.length > 1 ? '' : tok;
      if (inComment) {
        if (ch === '\n') inComment = false;
        out += tok;
      } else if (quote) {
        if (ch === quote || ch === '\n') quote = null;
        out += tok;
      } else if (ch === commentCh) {
        flush(); inComment = true; out += tok;
      } else if (ch === "'" || ch === '"') {
        flush(); quote = ch; out += tok;
      } else {
        plain += tok;
      }
      i += tok.length;
    }
    flush();
  }
  return out;
}

function processFile(nn, check) {
  const specFile = path.join(DATA, `${nn}.json`);
  if (!fs.existsSync(specFile)) return null;
  const common = JSON.parse(fs.readFileSync(path.join(DATA, 'kozos.json'), 'utf8'));
  const specs = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const {file, template} = chapterFile(nn);
  const before = fs.readFileSync(file, 'utf8');
  let html = before.replace(/<p class="u-js-only u-tok-hint">[\s\S]*?<\/p>\n?/g, '').replace(/<span class="u-js-only u-tok-hint">[\s\S]*?<\/span>/g, '');
  let firstPos = Infinity;
  /** @type {string | null} */ let firstId = null;
  for (const [id, spec] of Object.entries(specs)) {
    if (id.startsWith('_')) continue;
    const at = html.search(new RegExp(`<(figure|pre|div)\\b[^>]*\\bid="${escRe(id)}"`));
    if (at < 0) throw new Error(`${path.basename(file)}: nincs ilyen azonosító: ${id}`);
    const preOpen = html.indexOf('<pre', at);
    const preStart = html.indexOf('>', preOpen) + 1;
    const preEnd = html.indexOf('</pre>', preStart);
    if (preOpen < 0 || preEnd < 0) throw new Error(`${path.basename(file)}: ${id} alatt nincs <pre>`);
    const {lang, tips} = tipsFor(common, spec);
    const inner = html.slice(preStart, preEnd);
    const wrapped = wrapCode(inner, lang, tips);
    html = html.slice(0, preStart) + wrapped + html.slice(preEnd);
  }
  for (const id of Object.keys(specs).filter((k) => !k.startsWith('_'))) {
    const at = html.search(new RegExp(`<(figure|pre|div)\\b[^>]*\\bid="${escRe(id)}"`));
    if (at >= 0 && at < firstPos) { firstPos = at; firstId = id; }
  }
  // Használati tipp az oldal első tippes kódja mellé: ha az képaláírásos ábra,
  // a képaláírás elejére; különben a kódot tartalmazó blokk (összevetés, ábra) elé.
  if (firstId) {
    const at = html.search(new RegExp(`<(figure|pre|div)\\b[^>]*\\bid="${escRe(firstId)}"`));
    const isFig = html.startsWith('<figure', at);
    const end = html.indexOf('</figure>', at);
    const cap = html.indexOf('<figcaption>', at);
    if (isFig && cap > 0 && cap < end) {
      html = html.slice(0, cap + 12) + HINT + html.slice(cap + 12);
    } else {
      // A legkülső nyitott tároló (div.u-compare, div.u-pair vagy figure) elejét keressük.
      let pos = at;
      for (const re of [/<div class="u-(compare|pair)[^"]*"[^>]*>/g, /<figure\b[^>]*>/g]) {
        let m, last = -1;
        re.lastIndex = 0;
        while ((m = re.exec(html)) && m.index < at) last = m.index;
        if (last < 0) continue;
        const tag = html.startsWith('<figure', last) ? 'figure' : 'div';
        let depth = 0;
        const scan = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
        scan.lastIndex = last;
        let t;
        while ((t = scan.exec(html)) && t.index < at) depth += t[0].startsWith('</') ? -1 : 1;
        if (depth > 0 && last < pos) pos = last;
      }
      html = html.slice(0, pos) + HINT_P + '\n' + html.slice(pos);
    }
  }
  if (!html.includes(SCRIPT)) {
    const anchor = html.indexOf('<script defer src="../assets/js/labor-teljes.js"></script>');
    if (anchor < 0) throw new Error(`${path.basename(file)}: nem találom a labor-teljes.js betöltését`);
    const pos = anchor + '<script defer src="../assets/js/labor-teljes.js"></script>'.length;
    html = html.slice(0, pos) + '\n' + SCRIPT + html.slice(pos);
  }
  const changed = html !== before;
  if (check) return changed ? path.relative(ROOT, file) : null;
  if (changed) fs.writeFileSync(file, html);
  if (template) {
    const out = chapterFile(nn); // a generált fejezet neve
    const target = fs.readdirSync(path.join(ROOT, 'fejezetek')).find((x) => x.startsWith(nn + '-'));
    execFileSync(process.execPath, [path.join(__dirname, `${nn}-abrak.cjs`), out.file, path.join(ROOT, 'fejezetek', target)], {stdio: 'pipe'});
  }
  return changed ? path.relative(ROOT, file) : null;
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const wanted = args.filter((a) => /^\d\d$/.test(a));
const all = fs.readdirSync(DATA).filter((f) => /^\d\d\.json$/.test(f)).map((f) => f.slice(0, 2)).sort();
const changed = (wanted.length ? wanted : all).map((nn) => processFile(nn, check)).filter(Boolean);
if (check) {
  if (changed.length) { console.error('Elavult kódtippek: ' + changed.join(', ') + '\nFuttasd: node eszkozok/kodtippek.cjs'); process.exit(1); }
  console.log('A kódtippek naprakészek.');
} else {
  console.log(changed.length ? 'Frissítve: ' + changed.join(', ') : 'Nincs változás.');
}
