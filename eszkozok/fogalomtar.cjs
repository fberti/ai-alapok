// A fogalomtár és kereső (fogalomtar.html) előállítása a fejezetek fogalomkártyáiból és tartalomjegyzékéből.
// Használat a projekt gyökeréből: node eszkozok/fogalomtar.cjs
// Minden fejezet módosítása után újra kell futtatni; a tesztek ellenőrzik, hogy a kimenet naprakész.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'fejezetek');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (html) => html.replace(/<sub>(.*?)<\/sub>/g, '$1').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Fejezetek beolvasása. */
function readChapters() {
  return fs.readdirSync(DIR).filter((f) => /^\d\d-.*\.html$/.test(f)).sort().map((file) => {
    const html = fs.readFileSync(path.join(DIR, file), 'utf8');
    const title = text(html.match(/<title>(.*?)<\/title>/)[1]).replace(/ \| MI-alapok$/, '');
    const [num, ...rest] = title.split(' · ');
    const toc = html.match(/<nav class="toc"[\s\S]*?<\/nav>/)[0];
    const sections = [...toc.matchAll(/<li><a href="#([^"]+)">(.*?)<\/a><\/li>/g)].map((m) => ({ id: m[1], name: text(m[2]) }))
      .filter((s) => !/^(fogalmak|kviz|forrasok|osszegzes)$/.test(s.id));
    const cards = [];
    for (const dl of html.match(/<dl class="u-cards">[\s\S]*?<\/dl>/g) || []) {
      for (const m of dl.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) cards.push({ term: text(m[1]), def: text(m[2]) });
    }
    return { file, num, name: rest.join(' · '), sections, cards };
  });
}

function build() {
  const chapters = readChapters();
  const total = chapters.reduce((s, c) => s + c.cards.length, 0);
  const item = (href, title, body, tag) => `<li data-kereses="${esc((title + ' ' + body + ' ' + tag).toLowerCase())}"><a class="xref" href="${href}">${esc(title)}</a> <span class="g-tag">${esc(tag)}</span>${body ? `<p>${esc(body)}</p>` : ''}</li>`;
  let chapterList = '', terms = '';
  chapters.forEach((c) => {
    chapterList += `<li data-kereses="${esc((c.num + '. fejezet ' + c.name).toLowerCase())}"><a href="fejezetek/${c.file}"><strong>${c.num}</strong> ${esc(c.name)}</a><ul class="g-sections">${c.sections.map((s) => `<li data-kereses="${esc(s.name.toLowerCase())}"><a class="xref" href="fejezetek/${c.file}#${s.id}">${esc(s.name)}</a></li>`).join('')}</ul></li>`;
    terms += `<section class="g-chapter" id="f-${c.num}" aria-labelledby="f-${c.num}-cim"><h2 id="f-${c.num}-cim">${c.num} · ${esc(c.name)} <small>${c.cards.length} fogalom</small></h2><ul class="g-terms">${c.cards.map((k) => item(`fejezetek/${c.file}#fogalmak`, k.term, k.def, `${c.num}. fejezet`)).join('')}</ul></section>`;
  });
  return `<!doctype html>
<html lang="hu">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f6f3eb"><meta name="description" content="Az MI-alapok kurzus fogalomtára és keresője: mind a tizenegy fejezet fogalmai magyarul és angolul, a fejezetek és szakaszok listájával."><title>Fogalomtár és kereső | MI-alapok</title><script>document.documentElement.classList.add('js')</script><script src="assets/js/theme.js?v=3"></script><script defer src="assets/js/xref.js"></script><link rel="stylesheet" href="assets/css/course.css?v=5"><link rel="stylesheet" href="assets/css/fogalomtar.css"><script defer src="assets/js/fogalomtar.js"></script></head>
<body id="top" class="glossary">
<a class="skip" href="#tartalom">Ugrás a tartalomhoz</a>
<header class="site-header"><a class="brand" href="index.html"><span class="brand-mark">mi.</span> ALAPOK <span class="brand-note">/ interaktív jegyzet</span></a><div class="header-actions"><a href="index.html#fejezetek">← Összes fejezet</a><button class="theme-toggle" type="button" role="switch" aria-checked="false" data-theme-toggle><span class="theme-toggle-icon" aria-hidden="true"></span><span class="visually-hidden">Sötét mód</span></button></div></header>
<main id="tartalom" class="g-main">
<p class="eyebrow">A KURZUS EGY HELYEN</p>
<h1>Fogalomtár és kereső</h1>
<p class="lead">A ${chapters.length} fejezet ${total} fogalma, a fejezetek és szakaszaik. Írj be egy szót magyarul vagy angolul – például „A*”, „perceptron”, „rezolúció”, „hill climbing” –, és a lista csak a találatokat mutatja. Az ékezeteket nem kell pontosan beírni.</p>
<div class="g-search js-only"><label for="g-kereso">Keresés</label><input type="search" id="g-kereso" autocomplete="off" placeholder="fogalom, algoritmus vagy fejezet"><p id="g-talalat" role="status" aria-live="polite"></p></div>
<noscript><p>JavaScript nélkül a teljes lista olvasható; a böngésző saját keresője (Ctrl+F) is használható.</p></noscript>
<section class="g-chapters" aria-labelledby="g-fejezetek-cim"><h2 id="g-fejezetek-cim">Fejezetek és szakaszok</h2><ol class="g-chapter-list">${chapterList}</ol></section>
${terms}
</main>
<footer>MI-alapok / Fogalomtár <a href="index.html">Kezdőlap</a></footer>
<a class="to-top" href="#top" aria-label="Vissza az oldal tetejére" title="Vissza az oldal tetejére"><span aria-hidden="true">↑</span></a>
</body>
</html>
`;
}
if (require.main === module) {
  const out = path.join(ROOT, 'fogalomtar.html');
  fs.writeFileSync(out, build());
  console.log('kész', out);
}
module.exports = { build, readChapters };
