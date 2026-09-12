const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'eloadasfelvetelek.html', 'fejezetek/01-mi-es-intelligencia.html', 'fejezetek/02-tudasbazisok.html', 'fejezetek/03-tudasreprezentacio.html', 'fejezetek/04-formalis-logika.html', 'fejezetek/05-prolog-es-fuzzy.html'];
test('A kezdőlap elérhetővé teszi az első magyar fejezetet', () => {
  const home = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  assert.match(home, /href="fejezetek\/01-mi-es-intelligencia.html"/);
  assert.match(home, /href="fejezetek\/02-tudasbazisok.html"/);
  assert.match(home, /href="fejezetek\/03-tudasreprezentacio.html"/);
  assert.match(home, /href="fejezetek\/04-formalis-logika.html"/);
  assert.match(home, /href="fejezetek\/05-prolog-es-fuzzy.html"/);
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
  assert.match(recordings, /href="https:\/\/www\.youtube\.com\/watch\?v=TvYmsF3XGj8"/);
  assert.match(recordings, /href="https:\/\/www\.youtube\.com\/watch\?v=0ROR8cW7tMk"/);
  assert.match(recordings, /Első előadás · 1\. rész/);
  assert.match(recordings, /Első előadás · 2\. rész/);
});
test('A téma fájljai verzióval kerülik el a régi böngésző-gyorsítótárat', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /course\.css\?v=2/);
    assert.match(html, /theme\.js\?v=2/);
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
