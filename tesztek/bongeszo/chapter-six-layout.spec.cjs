const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/06-neuralis-halozatok.html';
const aids = '.chapter-cover, .timeline, .comparison, .ledger, .worked, .steps, .takeaway, .shape-gallery, .mechanisms, .source-quote, .table-wrap, .diagram';
test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('A teljes anyag JavaScript nélkül, fájlból és nyomtatva is olvasható', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const page = await context.newPage();
    await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
    await expect(page.locator('#aktivacios-galeria figure')).toHaveCount(11);
    await expect(page.locator('#perceptron-pelda')).toContainText('1; 0,5; −1,5');
    await expect(page.locator('#derivalt-levezetes')).toContainText('−(1/N)');
    await expect(page.locator('#bp-pelda')).toContainText('0,6327');
    await expect(page.locator('#illesztes-tablazat')).toContainText('0,474');
    await expect(page.locator('#kezi-kod')).toContainText('learn_delta');
    await expect(page.locator('#net-status')).toContainText('13 tanulható paraméter');
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

test('Az ábrák, táblázatok és kitöltött laborok mindkét témában elférnek', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(chapter);
  for (const box of ['Globális','Elemi','Laterális','Rétegközi']) await page.getByRole('checkbox', {name:box}).check();
  for (let i = 0; i < 3; i++) await page.getByRole('button', {name:'Egy teljes korszak'}).click();
  for (let i = 0; i < 6; i++) await page.getByRole('button', {name:'Következő fázis'}).click();
  for (const width of [320,390,768,1024,1365]) {
    await page.setViewportSize({width,height:900});
    for (const dark of [false,true]) {
      const toggle = page.getByRole('switch', {name:'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.chapter-cover, .timeline, .comparison, .ledger, .worked, .steps, .shape-gallery, .mechanisms, .source-quote, .diagram, pre, .trace, .lab, .correction').evaluateAll((nodes,width) => nodes.filter(node => {
        const box = node.getBoundingClientRect();
        return box.left < -1 || box.right > width+1 || node.scrollWidth > node.clientWidth+1;
      }).map(node => node.id || node.className),width);
      expect(overflow,`${width}px, dark=${dark}`).toEqual([]);
    }
  }
});

test('A kezdőlap és az ötödik fejezet ide vezet, a haladás külön mentődik', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name:'Mesterséges neurális hálózatok'}).click();
  await expect(page).toHaveURL(new RegExp(chapter+'$'));
  await page.getByRole('button', {name:'Késznek jelölöm a fejezetet'}).click();
  await page.reload();
  await expect(page.getByRole('button', {name:'Kész jelölés törlése'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('link', {name:'← Előző: Prolog és fuzzy logika'}).click();
  await expect(page.getByRole('button', {name:'Késznek jelölöm a fejezetet'})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('link', {name:'Következő: 06 · Mesterséges neurális hálózatok →'}).click();
  await expect(page).toHaveURL(new RegExp(chapter+'$'));
  await expect(page.locator('a[href*="07-szamitasi"]')).toHaveCount(0);
});

test('Fájlmegnyitásból is működik a perceptronlabor', async ({page}) => {
  await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
  await page.getByRole('button', {name:'Egy teljes korszak'}).click();
  await expect(page.locator('#perc-status')).toContainText('1. korszak');
});
