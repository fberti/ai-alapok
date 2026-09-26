const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/07-szamitasi-problemak.html';

/** Csúszka vagy számmező beállítása és az input esemény kiváltása. */
async function set(page, sel, value) {
  await page.locator(sel).fill(String(value));
  await page.locator(sel).dispatchEvent('input');
}

test('A hetedik fejezet hibaüzenet nélkül betölt', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('nehéz');
  await expect(page.locator('.u-fix')).toHaveCount(14);
  await expect(page.locator('.u-lab')).toHaveCount(7);
  await expect(page.locator('#terkep tbody tr')).toHaveCount(28);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).toContainText('PDF');
  expect(errors).toEqual([]);
});

test('A növekedési verseny lépésszámot és időt mutat', async ({page}) => {
  await page.goto(chapter);
  await set(page, '#nov-n', 10);
  await expect(page.locator('#nov-ki')).toContainText('3 628 800');
  await expect(page.locator('#nov-ki')).toContainText('3,6 ms');
  await set(page, '#nov-n', 30);
  await expect(page.locator('#nov-ki')).toContainText('1,1 s');
  await expect(page.locator('#nov-sav-fact')).toHaveAttribute('style', /width/);
});

test('A Venn-labor a kiválasztott feladat helyét jelöli', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#venn-feladat').selectOption('sat');
  await expect(page.locator('#venn-npc')).toHaveClass(/u-hit/);
  await expect(page.locator('#venn-ki')).toContainText('NP-teljes');
  await page.locator('#venn-feladat').selectOption('tsp');
  await expect(page.locator('#venn-nph')).toHaveClass(/u-hit/);
  await expect(page.locator('#venn-npc')).not.toHaveClass(/u-hit/);
  await page.locator('#venn-feladat').selectOption('faktor');
  await expect(page.locator('#venn-ki')).toContainText('nem ismert');
});

test('A SAT-megoldó klózonként értékel, és végigpróbálja a behelyettesítéseket', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#sat-ki')).toContainText('2 / 3');
  await page.locator('#sat-y').click();
  await expect(page.locator('#sat-ki')).toContainText('kielégíti');
  await page.locator('#sat-mind').click();
  await expect(page.locator('#sat-tabla tbody tr')).toHaveCount(4);
  await expect(page.locator('#sat-tabla tbody tr.u-row-hit')).toHaveCount(1);
  await page.locator('#sat-keplet').selectOption('ellentmondas');
  await page.locator('#sat-mind').click();
  await expect(page.locator('#sat-tabla tbody tr')).toHaveCount(8);
  await expect(page.locator('#sat-tabla tbody tr.u-row-hit')).toHaveCount(0);
  await expect(page.locator('#sat-osszeg')).toContainText('7 / 8');
});

test('A gráflabor klikket, csúcsfedést és Hamilton-utat ellenőriz', async ({page}) => {
  await page.goto(chapter);
  for (const v of ['A', 'B', 'D', 'E']) await page.locator(`#graf-${v}`).click();
  await expect(page.locator('#graf-ki')).toContainText('4 csúcsú klikk');
  await page.locator('#graf-C').click();
  await expect(page.locator('#graf-ki')).toContainText('nem klikk');
  await page.locator('#graf-mod').selectOption('fedes');
  await page.locator('#graf-torol').click();
  for (const v of ['B', 'D', 'E']) await page.locator(`#graf-${v}`).click();
  await expect(page.locator('#graf-ki')).toContainText('fedetlen');
  await page.locator('#graf-F').click();
  await expect(page.locator('#graf-ki')).toContainText('lefedő csúcshalmaz');
  await page.locator('#graf-mod').selectOption('hamilton');
  for (const v of ['A', 'B', 'C', 'F', 'G', 'D', 'E']) await page.locator(`#graf-${v}`).click();
  await expect(page.locator('#graf-ki')).toContainText('Hamilton-út');
  await expect(page.locator('#graf-ki')).toContainText('Hamilton-kör');
  await expect(page.locator('#graf-rajz .u-edge-on')).toHaveCount(7);
});

test('A hátizsák-labor összesít, és megmutatja a kétféle optimumot', async ({page}) => {
  await page.goto(chapter);
  await set(page, '#hz-4', 1);
  await set(page, '#hz-0', 1);
  await expect(page.locator('#hz-ki')).toContainText('16 kg');
  await expect(page.locator('#hz-ki')).toContainText('túl nehéz');
  await page.locator('#hz-opt01').click();
  await expect(page.locator('#hz-ki')).toContainText('15 $');
  await page.locator('#hz-optkorl').click();
  await expect(page.locator('#hz-ki')).toContainText('36 $');
  await expect(page.locator('#hz-4')).toHaveValue('3');
});

test('Az utazóügynök-labor útvonalat mér, és ellenőrzi a döntési kérdést', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#tsp-nn').click();
  await expect(page.locator('#tsp-ki')).toContainText('18,18');
  await page.locator('#tsp-opt').click();
  await expect(page.locator('#tsp-ki')).toContainText('17,34');
  await expect(page.locator('#tsp-ki')).toContainText('5040');
  await set(page, '#tsp-k', 17);
  await expect(page.locator('#tsp-dontes')).toContainText('nem');
  await page.locator('#tsp-torol').click();
  for (const v of [0, 1, 2]) await page.locator(`#tsp-v${v}`).click();
  await expect(page.locator('#tsp-ki')).toContainText('3 / 8');
  await expect(page.locator('#tsp-rajz .u-route')).toHaveCount(1);
});

test('A rekeszpakoló kézzel és két mohó szabállyal is pakol', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#rp-ff').click();
  await expect(page.locator('#rp-ki')).toContainText('4 rekesz');
  await page.locator('#rp-ffd').click();
  await expect(page.locator('#rp-ki')).toContainText('3 rekesz');
  await expect(page.locator('#rp-ki')).toContainText('alsó korlát: 3');
  await page.locator('#rp-3').selectOption('0');
  await expect(page.locator('#rp-ki')).toContainText('túlcsordul');
});

test('A kvíz kihagyható, és kiértékeli a válaszokat', async ({page}) => {
  await page.goto(chapter);
  await page.locator('input[name=k1][value=b]').check();
  await page.locator('#kviz-urlap button[type=submit]').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1 megválaszolva');
  await expect(page.locator('#kviz-urlap fieldset').first().locator('.u-feedback')).toHaveClass(/u-(ok|bad)/);
});

test('Telefonon sincs vízszintes görgetés, világos és sötét témában sem', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#tsp-opt').click();
  await page.locator('#sat-mind').click();
  await page.locator('#rp-ffd').click();
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-plot, .u-lab, .u-example, .u-formula, .u-cards > div, .u-fix, .u-add, .u-field > div').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül, fájlból is olvasható minden ábra és példa', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, '../..', chapter)).href);
  await expect(page.locator('#venn-abrak svg')).toHaveCount(2);
  await expect(page.locator('#novekedes-tabla')).toContainText('3 628 800');
  await expect(page.locator('#lcs-tabla')).toContainText('ALA');
  await expect(page.locator('#tsp-dontes-pelda')).toContainText('17,34');
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b');
  await expect(page.locator('#tsp-nn')).toBeHidden();
  await context.close();
});

test('Nyomtatásban sötét témából is világos papírra kerül minden olvasási elem', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('switch', {name: 'Sötét mód'}).click();
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('#venn-abrak')).toBeVisible();
  await expect(page.locator('.u-lab').first()).toBeHidden();
  const bg = await page.locator('.u-example').first().evaluate(n => getComputedStyle(n).backgroundColor);
  expect(bg).toBe('rgb(255, 254, 249)');
});

test('A kezdőlap és a hatodik fejezet ide vezet', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name: /Nevezetes számítási problémák/}).click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.goto('fejezetek/06-neuralis-halozatok.html');
  await page.locator('.u-links a[href="07-szamitasi-problemak.html"]').click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
});
