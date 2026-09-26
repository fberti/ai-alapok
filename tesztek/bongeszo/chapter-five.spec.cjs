const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/05-prolog-es-fuzzy.html';

test('Az ötödik fejezet hibaüzenet nélkül betölt', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('keres választ a gép');
  await expect(page.locator('#prolog-idovonal li')).toHaveCount(9);
  await expect(page.locator('.u-fix')).toHaveCount(6);
  await expect(page.locator('#gorbe-alakok figure')).toHaveCount(6);
  for (const fig of await page.locator('.u-quote, .u-formula-quote').all()) await expect(fig.locator('figcaption')).toContainText('PDF');
  expect(errors).toEqual([]);
});

test('A Prolog-léptető mutatja a zsákutcát, a visszalépést és a vágás árát', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#prolog-program')).toContainText('szebb(kleopatra, gina).');
  await page.locator('#prolog-lepes').click();
  await expect(page.locator('#prolog-naplo li')).toHaveCount(1);
  await expect(page.locator('#prolog-naplo')).toContainText('sokkal_szebb(Valaki, ursula)');
  await page.locator('#prolog-csere').check();
  await expect(page.locator('#prolog-naplo li')).toHaveCount(0);
  await expect(page.locator('#prolog-program')).toContainText(/szebb\(gina, ursula\)\.\nszebb\(kleopatra/);
  await page.locator('#prolog-vegig').click();
  await expect(page.locator('#prolog-naplo')).toContainText('szebb(ursula, ursula)');
  await expect(page.locator('#prolog-naplo')).toContainText('Visszalépés');
  await expect(page.locator('#prolog-ki')).toContainText('Valaki = kleopatra');
  await expect(page.locator('#prolog-lepes')).toBeDisabled();
  await page.locator('#prolog-vagas').check();
  await page.locator('#prolog-vegig').click();
  await expect(page.locator('#prolog-ki')).toContainText('Nincs megoldás');
  await page.locator('#prolog-uj').click();
  await expect(page.locator('#prolog-naplo li')).toHaveCount(0);
  await page.locator('#prolog-csere').uncheck();
  await page.locator('#prolog-vagas').uncheck();
  await page.locator('#prolog-harmadik').check();
  await page.locator('#prolog-vegig').click();
  await expect(page.locator('#prolog-ki')).toContainText('Valaki = anna');
});

test('A görberajzoló számol, és jelzi a hibás sorrendet', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#gorbe-ki')).toContainText('μ(2)');
  await page.locator('#gorbe-alak').selectOption('triangle');
  await page.locator('#gorbe-p-b').fill('0');
  await page.locator('#gorbe-p-b').dispatchEvent('input');
  await page.locator('#gorbe-x').fill('-2');
  await page.locator('#gorbe-x').dispatchEvent('input');
  await expect(page.locator('#gorbe-ki')).toContainText('μ(−2) = 0,5');
  await page.locator('#gorbe-p-a').fill('4');
  await page.locator('#gorbe-p-a').dispatchEvent('input');
  await expect(page.locator('#gorbe-ki')).toContainText('sorrend');
  await page.locator('#gorbe-alak').selectOption('gauss');
  await expect(page.locator('#gorbe-parameterek input')).toHaveCount(2);
  await expect(page.locator('#gorbe-rajz path.u-curve')).toHaveCount(1);
});

test('Az élő vizsgajegy a példát adja, és az üres kimenetet jelzi', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#vizsga-ki')).toContainText('4,24');
  await expect(page.locator('#vizsga-ki')).toContainText('R1');
  await page.locator('#vizsga-modszer').selectOption('weighted');
  await expect(page.locator('#vizsga-ki')).toContainText('4,69');
  await page.locator('#vizsga-modszer').selectOption('max');
  await expect(page.locator('#vizsga-ki')).toContainText('jeles');
  await page.locator('#vizsga-pont').fill('95');
  await page.locator('#vizsga-pont').dispatchEvent('input');
  await page.locator('#vizsga-ora').fill('11');
  await page.locator('#vizsga-ora').dispatchEvent('input');
  await expect(page.locator('#vizsga-ki')).toContainText('Egyik szabály sem');
});

test('A kvíz minden helyes választ elfogad', async ({page}) => {
  await page.goto(chapter);
  const answers = {k1: 'b', k2: 'c', k3: 'a', k4: 'b', k5: 'c', k6: 'a', k7: 'b', k8: 'c', k9: 'a', k10: 'b'};
  for (const [name, value] of Object.entries(answers)) await page.locator(`input[name=${name}][value=${value}]`).check();
  await page.getByRole('button', {name: 'Válaszok ellenőrzése'}).click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('10 kérdésből 10 megválaszolva, 10 helyes');
});

test('Nincs vízszintes túlcsordulás egyik szélességen és témában sem', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  await page.locator('#prolog-csere').check();
  await page.locator('#prolog-vegig').click();
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-stack > li, .u-tree-fig, .u-plot, .u-shapes figure, .u-clausebox, .u-dialogue p, .u-stree li, .u-cycle li, .u-lab, .u-example, .u-log li, .u-formula').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül, fájlból is olvasható minden levezetés', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, '../..', chapter)).href);
  await expect(page.locator('#ket-fa')).toContainText('szebb(ursula, ursula)');
  await expect(page.locator('#altalanos-fa')).toContainText('F23');
  await expect(page.locator('#vizsga-levezetes')).toContainText('4,24');
  await expect(page.locator('#fuzzy-kimenet')).toContainText('1.6499999999999997');
  await expect(page.locator('#homerseklet-halmazok svg')).toBeVisible();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2c, 3a');
  await expect(page.locator('#prolog-lepes')).toBeHidden();
  await context.close();
});

test('Nyomtatásban sötét témából is világos papírra kerül minden olvasási elem', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('switch', {name: 'Sötét mód'}).click();
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('#ket-fa')).toBeVisible();
  await expect(page.locator('#vizsga-levezetes')).toBeVisible();
  const bg = await page.locator('.u-example').first().evaluate(n => getComputedStyle(n).backgroundColor);
  expect(bg).toBe('rgb(255, 254, 249)');
});

test('A kezdőlap és a negyedik fejezet ide vezet', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name: /Prolog és fuzzy logika/}).click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.goto('fejezetek/04-formalis-logika.html');
  await page.locator('.u-links a[href="05-prolog-es-fuzzy.html"]').click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
});
