const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'fejezetek/01-mi-es-intelligencia.html'];
test('A kezdőlap elérhetővé teszi az első magyar fejezetet', () => {
  const home = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  assert.match(home, /href="fejezetek\/01-mi-es-intelligencia.html"/);
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /lang="hu"/);
    assert.match(html, /<main/);
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
      const [target, anchor] = url.split('#');
      const resolved = target ? path.resolve(root, path.dirname(file), target) : path.join(root, file);
      assert.ok(fs.existsSync(resolved), `Hiányzó cél: ${url}`);
      if (anchor) assert.ok(fs.readFileSync(resolved, 'utf8').includes(`id="${anchor}"`), `Hiányzó horgony: ${url}`);
    }
  }
});
