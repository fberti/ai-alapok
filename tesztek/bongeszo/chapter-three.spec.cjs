const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/03-tudasreprezentacio.html';

test('Az új harmadik fejezet hibaüzenet nélkül betölt', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('amit egy fogalomról tudunk');
  await expect(page.locator('#allat-halo .u-net-node')).toHaveCount(7);
  await expect(page.locator('#butor-keretek .u-frame')).toHaveCount(4);
  await expect(page.locator('#demonok tbody tr')).toHaveCount(4);
  await expect(page.locator('.u-fix')).toHaveCount(2);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test('A háló öröklés útján válaszol, és illeszti a célhálót', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#halo-valasz')).toContainText('Cápa → Hal → Állat');
  await page.locator('#halo-csomopont').selectOption('Veréb');
  await page.locator('#halo-tulajdonsag').selectOption('tud úszni');
  await expect(page.locator('#halo-valasz')).toContainText('nem tud róla');
  await expect(page.locator('#cel-valasz')).toContainText('?X = Gólya');
  await page.locator('#cel-osztaly').selectOption('Állat');
  await page.locator('#cel-tulajdonsag').selectOption('lélegzik');
  await expect(page.locator('#cel-valasz')).toContainText('?X = Angolna');
});

test('Az öröklési konfliktus a módszertől függően oldódik fel', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#orokles-ki')).toContainText('nem lehet ÉS lehet');
  await page.locator('#orokles-modszer input[value=specifikus]').check();
  await expect(page.locator('#orokles-ki')).toContainText('döntetlen');
  await page.locator('#orokles-modszer input[value=prio-auto]').check();
  await expect(page.locator('#orokles-ki')).toContainText('biztosítása: lehet');
  await page.locator('#orokles-objektum').selectOption('pityuka');
  await page.locator('#orokles-modszer input[value=specifikus]').check();
  await expect(page.locator('#orokles-ki')).toContainText('repülés: nem tud');
});

test('A keretszerkesztő örököl, ellenőriz és számol', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#keret-tabla tbody')).toContainText('örökölt: Szék');
  await page.locator('#keret-beir').click();
  await expect(page.locator('#keret-ki')).toContainText('elfogadva');
  await page.locator('#keret-valaszto').selectOption('Asztal');
  await page.locator('#keret-beir').click();
  await expect(page.locator('#keret-ki')).toContainText('elutasítva');
  await page.locator('#keret-valaszto').selectOption('Bárszék-17');
  await page.locator('#keret-suly').click();
  await expect(page.locator('#keret-ki')).toContainText('2,97 kg');
});

test('Az esethasonlóság a kidolgozott példa számait adja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#eset-savok li').first()).toContainText('92,8%');
  await expect(page.locator('#eset-dontes')).toContainText('Újrafelhasználás');
  await page.locator('#s-szin').fill('3');
  await expect(page.locator('#eset-savok li').first()).toContainText('89,0%');
  await expect(page.locator('#eset-dontes')).toContainText('Hozzáigazítás');
  await page.locator('#uj-szin').selectOption('kék');
  await expect(page.locator('#eset-dontes')).toContainText('minősítése rossz');
});

test('A kvíz minden helyes választ elfogad', async ({page}) => {
  await page.goto(chapter);
  const answers = {k1: 'b', k2: 'c', k3: 'a', k4: 'b', k5: 'c', k6: 'a', k7: 'b', k8: 'a', k9: 'c', k10: 'b'};
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
      const overflow = await page.locator('.u-compare > div, .u-chain > li, .u-net, .u-net-node, .u-frame, .u-cbr, .u-triples li, .u-lab, .u-example, .u-svg').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül is olvasható minden levezetés', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(chapter);
  await expect(page.locator('#celhalo-pelda')).toContainText('?X = Gólya');
  await expect(page.locator('#barszek-tabla')).toContainText('örökölt a Széktől');
  await expect(page.locator('#eloadas-pelda')).toContainText('16:50');
  await expect(page.locator('#cbr-szamitas')).toContainText('92,8%');
  await expect(page.locator('#kaszkador-abra svg')).toBeVisible();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2c, 3a');
  await expect(page.locator('#halo-csomopont')).toBeHidden();
  await context.close();
});
