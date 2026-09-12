const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/05-prolog-es-fuzzy.html';
const aids = '.chapter-cover, .timeline, .comparison, .ledger, .worked, .steps, .takeaway, .shape-gallery, .rule-pair, .control-loop, .chart';
test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('A teljes anyag JavaScript nélkül, fájlból és nyomtatva is olvasható', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const page = await context.newPage();
    await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
    await expect(page.locator('#keresofak')).toContainText('szebb(ursula,ursula)');
    await expect(page.locator('#altalanos-fa')).toContainText('F23');
    await expect(page.locator('#vizsga-levezetes')).toContainText('253/60');
    await expect(page.locator('#fuzzy-kod')).toContainText('1,65');
    await expect(page.locator('#datalog-kod')).toContainText('Diado');
    const content = page.locator(aids), text = await content.allTextContents();
    for (const node of await content.all()) await expect(node).toBeVisible();
    for (const theme of ['light','dark']) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme,theme);
      await page.emulateMedia({media:'print'});
      for (const node of await content.all()) await expect(node).toBeVisible();
      expect(await content.allTextContents()).toEqual(text);
      await expect(page.locator('html')).toHaveCSS('color-scheme','light');
      await expect(page.locator('.finish')).toHaveCSS('color','rgb(0, 0, 0)');
    }
  } finally {await context.close();}
});

test('Az ábrák, keresőfák és kitöltött laborok mindkét témában elférnek', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(chapter);
  while (await page.locator('#prolog-next').isEnabled()) await page.locator('#prolog-next').click();
  for (const width of [320,390,768,1024,1365]) {
    await page.setViewportSize({width,height:900});
    for (const dark of [false,true]) {
      const toggle = page.getByRole('switch', {name:'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow = await page.locator(aids + ', pre, .table-wrap, .trace').evaluateAll((nodes,width) => nodes.filter(node => {
        const box = node.getBoundingClientRect();
        return box.left < -1 || box.right > width+1 || node.scrollWidth > node.clientWidth+1;
      }).map(node => node.id || node.className),width);
      expect(overflow,`${width}px, dark=${dark}`).toEqual([]);
    }
  }
});

test('A kezdőlap és a negyedik fejezet ide vezet, a haladás külön mentődik', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name:'Prolog és fuzzy logika'}).click();
  await expect(page).toHaveURL(new RegExp(chapter+'$'));
  await page.getByRole('button', {name:'Késznek jelölöm a fejezetet'}).click();
  await page.reload();
  await expect(page.getByRole('button', {name:'Kész jelölés törlése'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('link', {name:'← Előző: Formális logika'}).click();
  await expect(page.getByRole('button', {name:'Késznek jelölöm a fejezetet'})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('link', {name:'Következő: 05 · Prolog és fuzzy logika →'}).click();
  await expect(page.locator('a[href*="06-neuralis"]')).toHaveCount(0);
});

test('Fájlmegnyitásból is működik a vizsgalabor', async ({page}) => {
  await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
  await page.getByLabel('Defuzzifikálás módja').selectOption('weighted');
  await expect(page.locator('#exam-status')).toContainText('4,667');
});
