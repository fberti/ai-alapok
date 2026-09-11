const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/01-mi-es-intelligencia.html';

test('Az idővonal időrendben, teljes magyarázatokkal jelenik meg', async ({page}) => {
  await page.goto(chapter);
  const timeline = page.locator('#intelligenciatesztek-idovonala');
  await expect(timeline.locator('article')).toHaveCount(4);
  await expect(timeline.locator('time')).toHaveText(['1890', '1905', '1908']);
  await expect(timeline).toContainText('85–90%-a');
  await expect(page.locator('.history-context')).toContainText('Raymond B. Cattell');
  await expect(page.locator('.history-context')).toContainText('57 változóhoz nincs pontos forrás');
});

test('Az idézetek forrást kapnak, a magyarázatok nem idézetként szerepelnek', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('.source-quote blockquote')).toHaveText('„A játék nem játék!”');
  await expect(page.locator('.source-quote figcaption')).toContainText('PDF 11. oldal');
  await expect(page.locator('.dialogue-scene figcaption')).toContainText('PDF 23. oldal');
  await expect(page.locator('.perspectives blockquote')).toHaveCount(0);
  await expect(page.locator('.perspective')).toHaveCount(4);
});

test('Az új olvasási elemek kis képernyőn és mindkét témával is elférnek', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      // Compare with the actual viewport, not innerWidth: mobile browsers can
      // enlarge innerWidth to hide an overflowing page from that weaker check.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.perspective, .explanation-row, .flow-node, .history-timeline, .formula-sheet').evaluateAll(
        (nodes, limit) => nodes.filter(node => {
          const bounds = node.getBoundingClientRect();
          return bounds.left < -1 || bounds.right > limit + 1 || node.scrollWidth > node.clientWidth + 1;
        }).map(node => node.className), width
      );
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('Az olvasási elemek JavaScript nélkül is látszanak, más fejezetet nem módosítanak', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  try {
    const page = await context.newPage();
    await page.goto(baseURL + chapter);
    for (const selector of ['.history-timeline', '.source-quote', '.flow-figure', '.explanation-rows', '.dialogue-scene', '.takeaway']) {
      await expect(page.locator(selector).first()).toBeVisible();
    }
    await expect(page.locator('#erzekeles .process-list > li')).toHaveCount(3);
    await expect(page.locator('#nyelv .explanation-row')).toHaveCount(4);
    await page.goto(baseURL + 'fejezetek/02-tudasbazisok.html');
    await expect(page.locator('link[href*="chapter-one.css"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveClass(/chapter-one/);
  } finally {
    await context.close();
  }
});
