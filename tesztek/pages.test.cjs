const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'eloadasfelvetelek.html', 'fejezetek/01-mi-es-intelligencia.html', 'fejezetek/02-tudasbazisok.html', 'fejezetek/03-tudasreprezentacio.html', 'fejezetek/04-formalis-logika.html', 'fejezetek/05-prolog-es-fuzzy.html', 'fejezetek/06-neuralis-halozatok.html', 'fejezetek/07-szamitasi-problemak.html', 'fejezetek/08-genetikus-algoritmusok.html', 'fejezetek/09-neminformalt-kereses.html', 'fejezetek/10-informalt-kereses.html', 'fejezetek/11-zh-gyakorlo.html', 'fogalomtar.html'];
test('A kezdőlap elérhetővé teszi mind a tíz fejezetet', () => {
  const home = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  assert.match(home, /href="fejezetek\/01-mi-es-intelligencia.html"/);
  assert.match(home, /href="fejezetek\/02-tudasbazisok.html"/);
  assert.match(home, /href="fejezetek\/03-tudasreprezentacio.html"/);
  assert.match(home, /href="fejezetek\/04-formalis-logika.html"/);
  assert.match(home, /href="fejezetek\/05-prolog-es-fuzzy.html"/);
  assert.match(home, /href="fejezetek\/06-neuralis-halozatok.html"/);
  assert.match(home, /href="fejezetek\/07-szamitasi-problemak.html"/);
  assert.match(home, /href="fejezetek\/08-genetikus-algoritmusok.html"/);
  assert.match(home, /href="fejezetek\/09-neminformalt-kereses.html"/);
  assert.match(home, /href="fejezetek\/10-informalt-kereses.html"/);
  assert.match(home, /href="fejezetek\/11-zh-gyakorlo.html"/);
  assert.doesNotMatch(home, /Tervezett fejezet/);
  assert.match(home, /href="fogalomtar.html"/);
  assert.doesNotMatch(home, /-uj\.html/);
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /lang="hu"/);
    assert.match(html, /<main/);
  }
});
test('Az eredeti oktatói források a fejezetlista előtt elérhetők', () => {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(home.indexOf('id="eredeti-forrasok"') < home.indexOf('id="fejezetek"'));
  assert.match(home, /href="resources\/presentation\/Mesterseges_intelligencia_alapjai_levelezo_01-10\.pdf" download/);
  assert.match(home, /href="https:\/\/github\.com\/fberti\/ai-alapok\/tree\/master\/resources\/code"/);
  assert.match(home, /href="https:\/\/edu\.iit\.uni-miskolc\.hu\/mesterseges_intelligencia_alapjai_gtk"/);
  assert.match(home, /Az oktató által megosztott összes anyag/);
  assert.match(home, /A tananyagban hivatkozott PDF az eredeti oktató előadása/);
});
test('A kezdőlapról elérhetők a magyar nyelvű előadásfelvételek', () => {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const recordings = fs.readFileSync(path.join(root, 'eloadasfelvetelek.html'), 'utf8');
  assert.ok(home.indexOf('id="eloadasfelvetelek"') > home.indexOf('id="eredeti-forrasok"'));
  assert.ok(home.indexOf('id="eloadasfelvetelek"') < home.indexOf('id="fejezetek"'));
  assert.match(home, /href="eloadasfelvetelek\.html"/);
  assert.match(recordings, /href="https:\/\/mega\.nz\/folder\/IKQyTSBS#6poeyE_D9RKM5w9HgGcc7w"/);
  assert.match(recordings, /href="https:\/\/www\.youtube\.com\/playlist\?list=PLX8dg4cf86Xc"/);
  assert.match(recordings, /Tamás felvételei a youtubeon/);
  assert.doesNotMatch(recordings, /youtube\.com\/watch/);
});
test('A téma fájljai verzióval kerülik el a régi böngésző-gyorsítótárat', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /course\.css\?v=5/);
    assert.match(html, /theme\.js\?v=3/);
  }
});
test('A helyi linkek és erőforrások alkönyvtárból is elérhetők', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, `Ismételt azonosító: ${file}`);
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:)/.test(url)) continue;
      assert.ok(!url.startsWith('/'), `Abszolút út: ${url}`);
      const [rawTarget, anchor] = url.split('#');
      const target = rawTarget.split('?')[0];
      const resolved = target ? path.resolve(root, path.dirname(file), target) : path.join(root, file);
      assert.ok(fs.existsSync(resolved), `Hiányzó cél: ${url}`);
      if (anchor) assert.ok(fs.readFileSync(resolved, 'utf8').includes(`id="${anchor}"`), `Hiányzó horgony: ${url}`);
    }
  }
});

test('A generált fejezetek és a fogalomtár naprakészek a sablonokhoz és a modellhez képest', () => {
  const {execFileSync} = require('node:child_process');
  const os = require('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mi-alapok-'));
  for (const [script, tpl, out] of [['09-abrak.cjs', '09-sablon.html', 'fejezetek/09-neminformalt-kereses.html'], ['10-abrak.cjs', '10-sablon.html', 'fejezetek/10-informalt-kereses.html'], ['11-abrak.cjs', '11-sablon.html', 'fejezetek/11-zh-gyakorlo.html']]) {
    const target = path.join(tmp, path.basename(out));
    execFileSync(process.execPath, [path.join(root, 'eszkozok', script), path.join(root, 'eszkozok', tpl), target], {stdio: 'pipe'});
    assert.equal(fs.readFileSync(target, 'utf8'), fs.readFileSync(path.join(root, out), 'utf8'), `${out} elavult: futtasd a node eszkozok/${script} parancsot`);
  }
  const {build} = require('../eszkozok/fogalomtar.cjs');
  assert.equal(build(), fs.readFileSync(path.join(root, 'fogalomtar.html'), 'utf8'), 'fogalomtar.html elavult: futtasd a node eszkozok/fogalomtar.cjs parancsot');
});
test('A kilencedik fejezet a tizedikre, a tizedik a kezdőlapra és a fogalomtárra vezet', () => {
  const nine = fs.readFileSync(path.join(root, 'fejezetek/09-neminformalt-kereses.html'), 'utf8');
  const ten = fs.readFileSync(path.join(root, 'fejezetek/10-informalt-kereses.html'), 'utf8');
  assert.match(nine, /<a href="10-informalt-kereses.html"><small>Következő fejezet/);
  assert.match(ten, /<a href="09-neminformalt-kereses.html"><small>← Előző fejezet/);
  assert.match(ten, /<a href="\.\.\/index.html"><small>Vissza/);
  assert.match(ten, /<a href="\.\.\/fogalomtar.html">/);
  const glossary = fs.readFileSync(path.join(root, 'fogalomtar.html'), 'utf8');
  assert.match(ten, /<a href="11-zh-gyakorlo.html"><small>Következő fejezet/);
  for (let i = 1; i <= 11; i++) assert.match(glossary, new RegExp(`id="f-${String(i).padStart(2, '0')}"`));
  assert.match(glossary, /Elfogadható heurisztika/);
});
test('A fejezetek és a fogalomtár betöltik az oldalsávos kereszthivatkozást', () => {
  for (const file of pages.filter((f) => f.startsWith('fejezetek/') || f === 'fogalomtar.html')) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /<script defer src="(\.\.\/)?assets\/js\/xref\.js"><\/script>/, file);
    if (file.startsWith('fejezetek/')) assert.match(html, /<script defer src="\.\.\/assets\/js\/labor-teljes\.js"><\/script>/, file);
  }
});
test('Minden xref kereszthivatkozás létező oldalra és horgonyra mutat', () => {
  const ids = new Map();
  const idsOf = (file) => {
    if (!ids.has(file)) ids.set(file, new Set([...fs.readFileSync(path.join(root, file), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    return ids.get(file);
  };
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [tag] of html.matchAll(/<a\b[^>]*\bclass="[^"]*\bxref\b[^"]*"[^>]*>/g)) {
      const href = (tag.match(/href="([^"]+)"/) || [])[1];
      assert.ok(href, `${file}: xref href nélkül: ${tag}`);
      if (/^https?:/.test(href)) continue;
      const [target, hash] = href.split('#');
      const targetFile = target ? path.posix.normalize(path.posix.join(path.posix.dirname(file), target)) : file;
      assert.ok(fs.existsSync(path.join(root, targetFile)), `${file}: hiányzó céloldal: ${href}`);
      if (hash) assert.ok(idsOf(targetFile).has(decodeURIComponent(hash)), `${file}: hiányzó horgony: ${href}`);
    }
  }
});
