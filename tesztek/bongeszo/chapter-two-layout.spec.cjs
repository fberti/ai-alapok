const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/02-tudasbazisok.html';
const aids = '.reading-comparison, .reading-rows, .reading-steps, .handbook, .evidence-sheet, .system-sheet, .rule-tree, .interview-scene, .code-reading, .source-quote';

test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('A forrás elvei, kérdései és folyamatai teljes magyarázattal látszanak', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#reprezentacios-elvek > div')).toHaveCount(8);
  await expect(page.locator('#szakertotipusok > div')).toHaveCount(3);
  await expect(page.locator('.correction')).toHaveCount(9);
  await expect(page.locator('#fejlesztes-utja li')).toHaveCount(5);
  await expect(page.locator('#tudasgyujtes-lepesei > li')).toHaveCount(4);
  await expect(page.locator('#elemzes-lepesei > li')).toHaveCount(4);
  await expect(page.locator('#kerdessablonok dt')).toHaveText([
    'K1 · Indok', 'K2 · Részletek', 'K3 · Határok', 'K4 · Másik út', 'K5 · Más feltétel', 'K6 · Új irány'
  ]);
  await expect(page.locator('#tudas-kezikonyv dd strong')).toHaveCount(9);
  await expect(page.locator('#reszletes-tudas dd strong')).toHaveCount(13);
  await expect(page.locator('.return-path')).toContainText('újraformulázást');
  await expect(page.locator('#kovetkeztetesi-ciklus > li')).toHaveCount(3);
});

test('Csak a valódi forrásmondat idézet, a párbeszéd jelölt átfogalmazás', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('blockquote')).toHaveCount(1);
  await expect(page.locator('.source-quote blockquote')).toHaveText('„A fontos dolgokat világosan adja meg.”');
  await expect(page.locator('.source-quote figcaption')).toContainText('PDF 40. oldal');
  await expect(page.locator('#villamlas-parbeszed figcaption')).toContainText('Átfogalmazás, nem szó szerinti idézet.');
  await expect(page.locator('.interview-turns > p')).toHaveCount(7);
  await expect(page.locator('#kodolas-pelda figcaption')).toContainText('T17 azonosító');
});

test('Mindkét levezetés és az oktatói kód kattintás nélkül olvasható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#elore-megoldas .fact-state')).toHaveText([
    'a, b, c, d, e', 'a, b, c, d, e, f', 'a, b, c, d, e, f, g'
  ]);
  await expect(page.locator('#hatra-megoldas .reading-steps > li')).toHaveCount(4);
  await expect(page.locator('#hatra-megoldas .missing-fact')).toContainText('nem g hamisságának bizonyítéka');
  await expect(page.locator('#kod-szabalyok a')).toHaveAttribute('href', '../resources/code/12_Logika.py');
  await expect(page.locator('#kod-szabalyok pre')).toContainText('Nagyszulo(X,Z) <= Szulo(X,Y) & Szulo(Y,Z)');
  await expect(page.locator('#kod-szabalyok')).toContainText('Nagyszulo("Andras","Csaba")');
  await expect(page.locator('#kod-szabalyok')).toContainText('nem a pyDatalog belső végrehajtási sorrendjét');
});

test('Az olvasási elemek telefonon és mindkét témában elférnek', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  for (const width of [320, 390, 768, 1024, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow = await page.locator(aids + ', .reading-rows dd, pre, .interview-turns p').evaluateAll((nodes, limit) =>
        nodes.filter(node => {
          const bounds = node.getBoundingClientRect();
          return bounds.left < -1 || bounds.right > limit + 1 || node.scrollWidth > node.clientWidth + 1;
        }).map(node => node.id || node.className || node.tagName), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül és nyomtatásban sem tűnik el a szükséges tartalom', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  try {
    const page = await context.newPage();
    await page.goto(baseURL + chapter);
    await expect(page.locator('details')).toHaveCount(0);
    const content = page.locator(aids);
    const text = await content.allTextContents();
    for (const aid of await content.all()) await expect(aid).toBeVisible();
    for (const theme of ['light', 'dark']) {
      // Emulate the saved theme without running any page script.
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await page.emulateMedia({media: 'print'});
      for (const aid of await content.all()) await expect(aid).toBeVisible();
      expect(await content.allTextContents()).toEqual(text);
      await expect(page.locator('#tudas-kezikonyv dd').last()).toBeVisible();
      await expect(page.locator('#reszletes-tudas dd').last()).toBeVisible();
      await expect(page.locator('#hatra-megoldas .missing-fact')).toBeVisible();
      await expect(page.locator('#kod-szabalyok pre')).toBeVisible();
      await expect(page.locator('.chapter-main')).toHaveCSS('color', 'rgb(0, 0, 0)');
      await expect(page.locator('.finish')).toHaveCSS('color', 'rgb(0, 0, 0)');
    }
  } finally {
    await context.close();
  }
});

test('A második fejezet stílusa nem kerül más fejezetbe', async ({page}) => {
  for (const other of ['01-mi-es-intelligencia', '03-tudasreprezentacio']) {
    await page.goto(`fejezetek/${other}.html`);
    await expect(page.locator('link[href*="chapter-two.css"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveClass(/chapter-two/);
  }
});
