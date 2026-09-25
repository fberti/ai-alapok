const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/02-tudasbazisok.html';

test('Az új második fejezet hibaüzenet nélkül betölt', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('a tapasztalat a gépbe');
  await expect(page.locator('#tudas-kezikonyv dl > div')).toHaveCount(9);
  await expect(page.locator('#reszletes-tudas > div')).toHaveCount(13);
  await expect(page.locator('#k-sablonok tbody tr')).toHaveCount(6);
  await expect(page.locator('#winston-tabla tbody tr')).toHaveCount(8);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test('Az interjúszimulátor szabályokat gyűjt', async ({page}) => {
  await page.goto(chapter);
  const buttons = page.locator('#interju-gombok button');
  await expect(buttons).toHaveCount(6);
  await buttons.nth(0).click();
  await expect(page.locator('#interju-valasz')).toContainText('villámlás');
  await expect(page.locator('#interju-jegyzet li')).toHaveCount(1);
  for (let i = 1; i < 6; i += 1) await buttons.nth(i).click();
  await expect(page.locator('#interju-jegyzet li')).toHaveCount(10);
  await expect(page.locator('#interju-valasz')).toContainText('Mind a hat sablont');
});

test('A rendezés billentyűzettel is működik', async ({page}) => {
  await page.goto(chapter);
  const items = page.locator('#sorrend-lista li');
  await expect(items).toHaveCount(6);
  const want = ['Archívumkutatás', 'Tudás Kézikönyv első', 'szakértő kiválasztása', 'Nyitott végű', 'átírása', 'leíró és az eljárási'];
  for (let target = 0; target < want.length; target += 1) {
    let idx = -1;
    for (let i = 0; i < 6; i += 1) if ((await items.nth(i).innerText()).includes(want[target])) idx = i;
    while (idx > target) {
      await items.nth(idx).getByRole('button', {name: /^Fel/}).focus();
      await page.keyboard.press('Enter');
      idx -= 1;
    }
  }
  await page.locator('#sorrend-ellenoriz').click();
  await expect(page.locator('#sorrend-ki')).toContainText('Pontosan így');
});

test('A szabálylánc mindkét irányban levezeti g-t, d nélkül nem', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#lanc-osszegzes')).toContainText('g végkövetkeztetés levezethető');
  for (let i = 0; i < 5; i += 1) await page.locator('#lanc-elore-lep').click();
  await expect(page.locator('#lanc-elore li')).toHaveCount(5);
  await expect(page.locator('#lanc-elore')).toContainText('új tény: h');
  await expect(page.locator('#lanc-elore-lep')).toBeDisabled();
  while (await page.locator('#lanc-hatra-lep').isEnabled()) await page.locator('#lanc-hatra-lep').click();
  await expect(page.locator('#lanc-hatra')).toContainText('R4 szabályt egyszer sem');
  await page.locator('#lanc-tenyek input[value=d]').uncheck();
  await expect(page.locator('#lanc-osszegzes')).toContainText('nem vezethető le');
  while (await page.locator('#lanc-hatra-lep').isEnabled()) await page.locator('#lanc-hatra-lep').click();
  await expect(page.locator('#lanc-hatra')).toContainText('Igaz-e d?');
});

test('A konfliktusfeloldás és a kvíz visszajelez', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#konfliktus-szabalyok input[value=S2]').check();
  await expect(page.locator('#konfliktus-ki')).toContainText('specifikusság');
  const answers = {k1: 'b', k2: 'c', k3: 'a', k4: 'c', k5: 'b', k6: 'a', k7: 'b', k8: 'a', k9: 'c', k10: 'b'};
  for (const [name, value] of Object.entries(answers)) await page.locator(`input[name=${name}][value=${value}]`).check();
  await page.getByRole('button', {name: 'Válaszok ellenőrzése'}).click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('10 kérdésből 10 megválaszolva, 10 helyes');
});

test('Nincs vízszintes túlcsordulás egyik szélességen és témában sem', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-rows > div, .u-manual, .u-waterfall li, .u-arch, .u-cycle li, .u-duo, .u-lab, .u-dialogue').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül is olvasható minden levezetés', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(chapter);
  await expect(page.locator('#ket-levezetes')).toContainText('Elsül az R3');
  await expect(page.locator('#ket-levezetes')).toContainText('R4 szabályt egyszer sem');
  await expect(page.locator('#kovetkeztetesi-fa svg')).toBeVisible();
  await expect(page.locator('#sorrend-ki')).toContainText('A helyes sorrend');
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2c, 3a');
  await expect(page.locator('#lanc-tenyek')).toBeHidden();
  await context.close();
});
