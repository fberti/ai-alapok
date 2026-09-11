const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/03-tudasreprezentacio.html';
const aids = '.representation-map, .history-strip, .route-sheet, .reading-ledger, .reading-pair, .process-sheet, .dossier, .conflict-map, .calculation-strip, .case-flow, .takeaway';

test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('A PDF példái látható utakat, adatlapokat és teljes összevetéseket kapnak', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#kanari-utak .route-row')).toHaveCount(3);
  await expect(page.locator('#szoparok > div')).toHaveCount(3);
  await expect(page.locator('#el-szotar > div')).toHaveCount(3);
  await expect(page.locator('#celhalo-pelda')).toContainText('Gólya featured_by fehér');
  await expect(page.locator('#csipike-utja .reading-steps > li')).toHaveCount(3);
  await expect(page.locator('#pityuka-halo')).toContainText('Mirmur');
  await expect(page.locator('#pityuka-halo')).toContainText('éjfél');
  await expect(page.locator('#biztositas-agak')).toContainText('Taxi');
  await expect(page.locator('#biztositas-agak')).toContainText('Kaszkadőrmotor');
  for (const id of ['tipus-peldany', 'jelentes-par', 'kvantor-par']) {
    await expect(page.locator(`#${id} > div`)).toHaveCount(2);
  }
  await expect(page.locator('.correction')).toHaveCount(12);
  // Explanations are paraphrases, not invented source quotations.
  await expect(page.locator('blockquote')).toHaveCount(0);
});

test('A keretek minden mezője és az események kattintás nélkül olvashatók', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#barszek-orokles .reading-steps > li')).toHaveCount(3);
  await expect(page.locator('#demon-esemenyek dt code')).toHaveText(['IF_NEEDED', 'IF_ADDED', 'IF_MODIFIED', 'IF_DELETED']);
  await expect(page.locator('#eloadas-keretek .frame-record')).toHaveCount(2);
  await expect(page.locator('#eloadas-keretek dt')).toHaveCount(12);
  for (const text of ['kb. 200', 'kb. 40', '40–180', '160–175', '170 perc']) {
    await expect(page.locator('#eloadas-keretek')).toContainText(text);
  }
  await expect(page.locator('#eloadas-keretek')).toContainText('filctollas tábla');
  await expect(page.locator('#eloadas-vege')).toContainText('16:50');
});

test('Az esetfolyamat két ága és a számítás egyezik a működő laborral', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#eset-adatlap > div')).toHaveCount(3);
  await expect(page.locator('#eset-folyamat .reading-pair > div')).toHaveCount(2);
  await expect(page.locator('#eset-folyamat .flow-return')).toContainText('TANULÁS');
  await expect(page.locator('#hasonlosag-szamitas')).toContainText('50%');
  await page.locator('#case-height').fill('95');
  await page.locator('#case-seats').fill('7');
  for (const [index, score] of ['87,5%', '85%', '50%'].entries()) {
    await expect(page.locator('#case-results li').nth(index)).toContainText(score);
    await expect(page.locator('#tarolt-esetek dt').nth(index)).toContainText(score);
  }
  await expect(page.locator('#case-answer')).toContainText('Bárpult');
  await expect(page.locator('#tarolt-esetek')).toContainText('Nem vált be');
});

test('Az új olvasási elemek kis képernyőn és mindkét témában elférnek', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  for (const width of [320, 390, 768, 1024, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow = await page.locator(aids + ', .reading-ledger dd, pre, .math, .table-wrap').evaluateAll((nodes, limit) =>
        nodes.filter(node => {
          const bounds = node.getBoundingClientRect();
          return bounds.left < -1 || bounds.right > limit + 1 || node.scrollWidth > node.clientWidth + 1;
        }).map(node => node.id || node.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('A teljes magyarázat JavaScript nélkül és nyomtatásban is megmarad', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  try {
    const page = await context.newPage();
    await page.goto(baseURL + chapter);
    await expect(page.locator('details')).toHaveCount(0);
    const content = page.locator(aids);
    const text = await content.allTextContents();
    for (const aid of await content.all()) await expect(aid).toBeVisible();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await page.emulateMedia({media: 'print'});
      for (const aid of await content.all()) await expect(aid).toBeVisible();
      expect(await content.allTextContents()).toEqual(text);
      await expect(page.locator('#eloadas-keretek dd').last()).toBeVisible();
      await expect(page.locator('#tarolt-esetek dd').last()).toBeVisible();
      await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
      await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(page.locator('.chapter-main')).toHaveCSS('color', 'rgb(0, 0, 0)');
      await expect(page.locator('.finish')).toHaveCSS('color', 'rgb(0, 0, 0)');
    }
  } finally { await context.close(); }
});
