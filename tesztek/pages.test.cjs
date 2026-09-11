const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'fejezetek/01-mi-es-intelligencia.html', 'fejezetek/02-tudasbazisok.html', 'fejezetek/03-tudasreprezentacio.html'];
test('A kezdőlap elérhetővé teszi az első magyar fejezetet', () => {
  const home = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  assert.match(home, /href="fejezetek\/01-mi-es-intelligencia.html"/);
  assert.match(home, /href="fejezetek\/02-tudasbazisok.html"/);
  assert.match(home, /href="fejezetek\/03-tudasreprezentacio.html"/);
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
  assert.match(home, /A tananyagban hivatkozott PDF az eredeti oktató előadása/);
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
