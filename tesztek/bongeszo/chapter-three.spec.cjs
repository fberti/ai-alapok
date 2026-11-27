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
  const answers = {k1: 'b', k2: 'c', k3: 'a', k4: 'b', k5: 'c', k6: 'a', k7: 'b', k8: 'a', k9: 'c', k10: 'b', k11: 'b', k12: 'c'};
  for (const [name, value] of Object.entries(answers)) await page.locator(`input[name=${name}][value=${value}]`).check();
  await page.getByRole('button', {name: 'Válaszok ellenőrzése'}).click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('12 kérdésből 12 megválaszolva, 12 helyes');
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
  await expect(page.locator('#kviz-eredmeny')).toContainText('11b, 12c');
  await expect(page.locator('#halo-alapertek')).toContainText('hamis');
  await expect(page.locator('#konyha-szamitas')).toContainText('93,3%');
  await expect(page.locator('#halo-csomopont')).toBeHidden();
  await context.close();
});

test('A szógráf labor gráfon és keresőfán mutatja a keresést', async ({page}) => {
  await page.goto(chapter);
  const lab = page.locator('#szograf-labor');
  await expect(lab.locator('.u-wg-n')).toHaveCount(10);
  await expect(page.locator('#szograf-ki')).toContainText('front egyetlen eleme a start (sírni)');
  await expect(page.locator('#szograf-vissza')).toBeDisabled();
  await page.locator('#szograf-lep').click();
  await expect(page.locator('#szograf-ki')).toContainText('Feltárt gyerekek: szomorú₁, könny, hang₁');
  await expect(page.locator('#szograf-front li')).toHaveText(['szomorú₁', 'könny', 'hang₁']);
  await expect(lab.locator('.u-wg-n.is-cur')).toHaveAttribute('data-n', 'sírni');
  await expect(page.locator('#szograf-fa svg .u-tnode')).toHaveCount(4);
  await page.locator('#szograf-vegig').click();
  await expect(page.locator('#szograf-ki')).toContainText('Kész: sírni → szomorú → kényelem, 2 lépés');
  await expect(lab.locator('.u-wg-n.is-path')).toHaveCount(3);
  await expect(page.locator('#szograf-fa svg .u-tnode-goal')).toHaveCount(1);
  await expect(page.locator('#szograf-lep')).toBeDisabled();
  await lab.locator('[data-szg="könny,fotel,bfs"]').click();
  await expect(page.locator('#szograf-ki')).toContainText('front egyetlen eleme a start (könny)');
  for (let i = 0; i < 3; i++) await page.locator('#szograf-lep').click();
  await expect(page.locator('#szograf-ki')).toContainText('Zsákutca');
  await page.locator('#szograf-vegig').click();
  await expect(page.locator('#szograf-ki')).toContainText('könny → sírni → szomorú → kényelem → fotel');
  await expect(page.locator('#szograf-stat')).toContainText('10 / 10');
  await page.locator('#szograf-alg').selectOption('dfs');
  await page.locator('#szograf-vegig').click();
  await expect(page.locator('#szograf-stat')).toContainText('5 / 5');
});

test('A szógráf labor teljes méretben a rajzot a vezérlők mellé rendezi', async ({page}) => {
  await page.goto(chapter);
  const lab = page.locator('#szograf-labor');
  await lab.locator(':scope > .lab-full-btn').click();
  await expect(lab.locator('.lab-split-main #szograf-rajz')).toHaveCount(1);
  await expect(lab.locator('.lab-split-main #szograf-fa')).toHaveCount(1);
  await expect(lab.locator('.lab-split-side #szograf-lep')).toHaveCount(1);
  const box = await lab.locator('#szograf-rajz').boundingBox();
  const vh = page.viewportSize().height;
  expect(box.height).toBeLessThanOrEqual(vh);
  await lab.locator(':scope > .lab-full-btn').click();
  await expect(lab.locator('.lab-split')).toHaveCount(0);
});
