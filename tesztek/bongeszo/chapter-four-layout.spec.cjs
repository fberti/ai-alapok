const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/04-formalis-logika.html';
const aids = '.proof-cover, .logic-history, .logic-pair, .logic-ledger, .proof-sheet, .proof-steps, .clause-strip, .inference-rule, .takeaway, .scope-formula';
test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('A forrás példái és levezetései külön PDF és kattintás nélkül olvashatók', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('.logic-history > li')).toHaveCount(14);
  await expect(page.locator('#teljes-igazsagtabla tbody tr')).toHaveCount(4);
  await expect(page.locator('#bizonyitasi-modszerek > div')).toHaveCount(5);
  await expect(page.locator('#knf-lepesek > li')).toHaveCount(4);
  await expect(page.locator('#pdf-rezolucio .proof-steps > li')).toHaveCount(4);
  await expect(page.locator('#elso-rendu-levezetes > li')).toHaveCount(6);
  await expect(page.locator('#szocseples')).toContainText('∃x[H(x) ∧ ∀y(T(y) → S(x,y))]');
  await expect(page.locator('#kod-pelda')).toContainText('Diado');
  await expect(page.locator('#kod-pelda')).toContainText('resources/code/12_Logika.py');
  await expect(page.locator('blockquote, details')).toHaveCount(0);
});

test('Az olvasási elemek és kitöltött laborok mindkét témában elférnek', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(chapter);
  await page.locator('#truth-input').fill('(p & q) -> (r <-> !s)');
  await page.locator('#truth-form button').click();
  for (let i = 0; i < 4; i++) await page.locator('#cnf-next').click();
  for (const width of [320,390,768,1024,1365]) {
    await page.setViewportSize({width,height:900});
    for (const dark of [false,true]) {
      const toggle = page.getByRole('switch', {name:'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow = await page.locator(aids + ', pre, .table-wrap, .generated-steps, .resolution-tree').evaluateAll((nodes,width) =>
        nodes.filter(node => {
          const box = node.getBoundingClientRect();
          return box.left < -1 || box.right > width+1 || node.scrollWidth > node.clientWidth+1;
        }).map(node => node.id || node.className),width);
      expect(overflow,`${width}px, dark=${dark}`).toEqual([]);
    }
  }
});

test('A teljes tananyag közvetlen fájlból, JavaScript nélkül és nyomtatva is elérhető', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const page = await context.newPage();
    await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
    const content = page.locator(aids), text = await content.allTextContents();
    for (const node of await content.all()) await expect(node).toBeVisible();
    await expect(page.locator('#elso-rendu-levezetes')).toContainText('K11 = □');
    for (const theme of ['light','dark']) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme,theme);
      await page.emulateMedia({media:'print'});
      for (const node of await content.all()) await expect(node).toBeVisible();
      expect(await content.allTextContents()).toEqual(text);
      await expect(page.locator('html')).toHaveCSS('color-scheme','light');
      await expect(page.locator('html')).toHaveCSS('background-color','rgb(255, 255, 255)');
      await expect(page.locator('.finish')).toHaveCSS('color','rgb(0, 0, 0)');
    }
  } finally {await context.close();}
});

test('Közvetlen fájlmegnyitásból is működik az igazságtábla', async ({page}) => {
  await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
  await page.locator('#truth-input').fill('p & !p');
  await page.locator('#truth-form button').click();
  await expect(page.locator('#truth-status')).toContainText('ellentmondás');
});

test('A kezdőlap és az előző fejezet kapcsolódik, a haladás külön menthető', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name:'Formális logika'}).click();
  await expect(page).toHaveURL(new RegExp(chapter+'$'));
  await page.getByRole('button', {name:'Késznek jelölöm a fejezetet'}).click();
  await page.reload();
  await expect(page.getByRole('button', {name:'Kész jelölés törlése'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('link', {name:'← Előző: Tudásreprezentáció'}).click();
  await expect(page.getByRole('button', {name:'Késznek jelölöm a fejezetet'})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('link', {name:'Következő: 04 · Formális logika →'}).click();
  await expect(page.locator('a[href*="05-prolog"]')).toHaveCount(0);
});
