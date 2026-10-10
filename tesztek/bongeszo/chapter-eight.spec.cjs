const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/08-genetikus-algoritmusok.html';

/** Csúszka vagy számmező beállítása és az esemény kiváltása. */
async function set(page, sel, value) {
  await page.locator(sel).fill(String(value));
  await page.locator(sel).dispatchEvent('input');
  await page.locator(sel).dispatchEvent('change');
}

test('A nyolcadik fejezet hibaüzenet nélkül betölt, a gyakorlás és a kvíz csukva van', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('tenyészd ki');
  await expect(page.locator('.u-fix')).toHaveCount(7);
  await expect(page.locator('.u-lab')).toHaveCount(5);
  await expect(page.locator('details.u-practice')).toHaveCount(4);
  for (const d of await page.locator('details.u-practice, details.u-quiz-wrap').all()) expect(await d.getAttribute('open')).toBeNull();
  await expect(page.locator('#kviz-urlap fieldset')).toHaveCount(12);
  await expect(page.locator('#kviz-urlap .u-hint')).toHaveCount(12);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).toContainText('PDF');
  expect(errors).toEqual([]);
});

test('A kódolási labor a fenotípusból genotípust és rátermettséget ad', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#kod-ki')).toContainText('110100111010');
  await expect(page.locator('#kod-ki')).toContainText('7 / 12');
  await page.locator('#kod-fenotipus button').nth(2).click();
  await expect(page.locator('#kod-ki')).toContainText('8 / 12');
  await page.locator('#kod-feladat').selectOption('atlok');
  await expect(page.locator('#kod-fenotipus button')).toHaveCount(25);
  await expect(page.locator('#kod-ki')).toContainText('16 / 25');
  await page.locator('#kod-opt').click();
  await expect(page.locator('#kod-ki')).toContainText('25 / 25');
  await expect(page.locator('#kod-fenotipus button.u-miss')).toHaveCount(0);
});

test('A kiválasztási labor a kézi számítás értékeit mutatja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#szel-ki')).toContainText('rulett: 0,4');
  await expect(page.locator('#szel-ki')).toContainText('verseny: 0,438');
  await page.locator('#szel-sztar').click();
  await expect(page.locator('#szel-ki')).toContainText('rulett: 0,7');
  await expect(page.locator('#szel-ki')).toContainText('rang: 0,4');
  await page.locator('#szel-porget').click();
  await expect(page.locator('#szel-szim')).toContainText('Ezer rulettpörgetés');
  await set(page, '#szel-f1', -2);
  await expect(page.locator('#szel-ki')).toContainText('nemnegatív');
});

test('A keresztezési labor a PDF utódait és a javított egyenletes keresztezést adja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#ker-ki ol[aria-label="Kromoszóma: 1 3 2 3 1 1 3 2"]')).toHaveCount(1);
  await page.locator('#ker-mod').selectOption('ket');
  await set(page, '#ker-v1', 3);
  await expect(page.locator('#ker-ki ol[aria-label="Kromoszóma: 1 3 2 2 3 3 2 3"]')).toHaveCount(1);
  await page.locator('#ker-mod').selectOption('egyenletes');
  await expect(page.locator('#ker-ki ol[aria-label="Kromoszóma: 3 1 2 2 1 3 3 3"]')).toHaveCount(1);
  await expect(page.locator('#ker-ki ol[aria-label="Kromoszóma: 1 3 3 3 3 1 2 2"]')).toHaveCount(1);
  await page.locator('#mut-hely').selectOption('5');
  await page.locator('#mut-ertek').selectOption('1');
  await expect(page.locator('#ker-ki')).toContainText('mutáció után');
  await page.locator('#ker-mod').selectOption('ujra');
  await expect(page.locator('#ker-ki')).toContainText('3 köztes megoldás');
});

test('A teljes genetikus algoritmus fut, és jelzi a leállás okát', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#ga-ki')).toContainText('megtalálta az optimumot');
  await expect(page.locator('#ga-grafikon path.u-line-best')).toHaveCount(1);
  await page.locator('#ga-feladat').selectOption('atlok');
  await set(page, '#ga-max', 5);
  await expect(page.locator('#ga-ki')).toContainText('generációs korlátot');
  await page.locator('#ga-feladat').selectOption('hatizsak');
  await expect(page.locator('#ga-ki')).toContainText('kg');
});

test('A felszín laborjában a hegymászó a helyi csúcson ragad', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#fel-vegig').click();
  await expect(page.locator('#fel-ki')).toContainText('globális csúcson');
  await page.locator('#fel-mod').selectOption('hegymaszo');
  await page.locator('#fel-vegig').click();
  await expect(page.locator('#fel-ki')).toContainText('helyi csúcson');
  await expect(page.locator('#fel-svg circle.u-ind-best')).toHaveCount(1);
});

test('A kvíz kinyitható, kihagyható, és kiértékeli a válaszokat', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#kviz-lenyilo > summary').click();
  await page.locator('input[name=k1][value=b]').check();
  await page.locator('#kviz-urlap button[type=submit]').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1 megválaszolva');
  await expect(page.locator('#kviz-urlap fieldset').first().locator('.u-feedback')).toHaveClass(/u-ok/);
});

test('Telefonon sincs vízszintes görgetés, világos és sötét témában sem', async ({page}) => {
  await page.goto(chapter);
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  await page.locator('#ker-mod').selectOption('egyenletes');
  await page.locator('#kod-feladat').selectOption('atlok');
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-plot, .u-lab, .u-example, .u-formula, .u-cards > div, .u-fix, .u-add, .u-field > div, .u-cross, details.u-practice, .u-quiz fieldset').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül, fájlból is olvasható minden ábra, példa és gyakorlás', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, '../..', chapter)).href);
  await expect(page.locator('#egyenletes ol.u-genes')).toHaveCount(4);
  await expect(page.locator('#kodolas-peldak .u-rects li')).toHaveCount(12);
  await expect(page.locator('#kodolas-peldak .u-bitmap li')).toHaveCount(25);
  await expect(page.locator('#kezi-generacio')).toContainText('011111');
  await expect(page.locator('#k-abra svg')).toHaveCount(2);
  await expect(page.locator('#kod-labor .u-nojs-only')).toBeVisible();
  await expect(page.locator('#kod-labor .u-js-only')).toBeHidden();
  await page.locator('#gyak-kodolas > summary').click();
  await page.locator('#gyak-kodolas .u-sol > summary').first().click();
  await expect(page.locator('#gyak-kodolas .u-sol').first()).toContainText('rátermettség tehát 6');
  await page.locator('#kviz-lenyilo > summary').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2b, 3a');
  await context.close();
});

test('Nyomtatásban a gyakorló feladatok kinyílnak, a laborok eltűnnek', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('switch', {name: 'Sötét mód'}).click();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('.u-lab').first()).toBeHidden();
  await expect(page.locator('#gyak-tuleles .u-sol').first()).toContainText('0,2, 0,3 és 0,5');
  expect(await page.locator('#gyak-tuleles').getAttribute('open')).not.toBeNull();
  const bg = await page.locator('.u-example').first().evaluate(n => getComputedStyle(n).backgroundColor);
  expect(bg).toBe('rgb(255, 254, 249)');
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await page.locator('#gyak-tuleles').getAttribute('open')).toBeNull();
});

test('A kezdőlap és a hetedik fejezet ide vezet', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name: /Genetikus algoritmusok/}).click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.goto('fejezetek/07-szamitasi-problemak.html');
  await page.locator('.u-links a[href="08-genetikus-algoritmusok.html"]').click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
});
