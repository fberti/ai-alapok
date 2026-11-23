const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/09-neminformalt-kereses.html';

test('A kilencedik fejezet hibaüzenet nélkül betölt, a gyakorlás és a kvíz csukva van', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('keress rendszeresen');
  await expect(page.locator('.u-fix')).toHaveCount(8);
  await expect(page.locator('.u-lab')).toHaveCount(3);
  await expect(page.locator('details.u-practice')).toHaveCount(5);
  for (const d of await page.locator('details.u-practice, details.u-quiz-wrap').all()) expect(await d.getAttribute('open')).toBeNull();
  await expect(page.locator('#kviz-urlap fieldset')).toHaveCount(14);
  await expect(page.locator('#kviz-urlap .u-hint')).toHaveCount(14);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).toContainText(/PDF|zh/);
  expect(errors).toEqual([]);
});

test('A keresőlabor a PDF példáit és a minta-zh mélységi keresését adja', async ({page}) => {
  await page.goto(chapter);
  await page.locator('[data-kl^="city,bfs"]').click();
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('Budapest → Kecskemét → Szolnok → Debrecen, költség 240');
  await expect(page.locator('#kl-stat')).toContainText('8');
  await page.locator('[data-kl^="city,ucs"]').click();
  await page.locator('#kl-lep').click();
  await page.locator('#kl-lep').click();
  await expect(page.locator('#kl-front li').first()).toHaveText('Dunaújváros (61)');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('Budapest → Kecskemét, költség 75');
  await page.locator('[data-kl^="zh,dfs"]').click();
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('S → A → B → C → E → F → V → G, költség 34');
  await expect(page.locator('#kl-front li')).toHaveText(['W (31)', 'G₂ (30)', 'G₁ (33)', 'D (4)', 'X (1)', 'Y (23)']);
  await page.locator('#kl-celteszt').selectOption('generate');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('S → A → B → C → G, költség 33');
  await page.locator('#kl-celteszt').selectOption('expand');
  await page.locator('#kl-alg').selectOption('ucs');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('költség 17');
  await expect(page.locator('#kl-fa svg .u-tnode-goal')).toHaveCount(1);
});

test('A keresőlabor iteratív mélyítést, korlátot, saját gráfot és ismétlésszűrést kezel', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#kl-alg').selectOption('ids');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('korlát = 3');
  await page.locator('#kl-alg').selectOption('dls');
  await page.locator('#kl-korlat').fill('1');
  await page.locator('#kl-korlat').dispatchEvent('change');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('A korlátig nincs cél');
  await page.locator('#kl-graf').selectOption('abstract');
  await page.locator('#kl-alg').selectOption('dfs');
  await page.locator('#kl-ismetles').selectOption('none');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('lépéskorlátot');
  await page.locator('#kl-graf').selectOption('sajat');
  await expect(page.locator('#kl-sajat')).toBeVisible();
  await page.locator('#kl-alg').selectOption('ucs');
  await page.locator('#kl-ismetles').selectOption('path');
  await page.locator('#kl-vegig').click();
  await expect(page.locator('#kl-ki')).toContainText('S → A → B → C → G, költség 7');
  await page.locator('#kl-sajat').fill('A B x');
  await page.locator('#kl-sajat').dispatchEvent('change');
  await expect(page.locator('#kl-hiba')).toContainText('nemnegatív');
  await page.locator('#kl-lejatszas').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#kl-lejatszas')).toHaveAttribute('aria-pressed', /true|false/);
});

test('Az amőba- és a költséglabor a fejezet számait mutatja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#am-ki')).toContainText('399');
  await expect(page.locator('#am-ki')).toContainText('80');
  await expect(page.locator('#am-ki')).toContainText('32');
  await page.locator('#am-sor').fill('1');
  await page.locator('#am-sor').dispatchEvent('input');
  await expect(page.locator('#am-ki')).toContainText('A tábla széle levág');
  await expect(page.locator('#ko-ki')).toContainText('111 111');
  await expect(page.locator('#ko-ki')).toContainText('123 456');
  await page.locator('#ko-l').fill('3');
  await page.locator('#ko-l').dispatchEvent('input');
  await expect(page.locator('#ko-ki')).toContainText('nem találja meg');
});

test('A kvíz kinyitható, kihagyható, és kiértékeli a válaszokat', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#kviz-lenyilo > summary').click();
  await page.locator('input[name=k1][value=b]').check();
  await page.locator('input[name=k2][value=a]').check();
  await page.locator('#kviz-urlap button[type=submit]').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('2 megválaszolva, 1 helyes');
  await expect(page.locator('#kviz-urlap fieldset').first().locator('.u-feedback')).toHaveClass(/u-ok/);
  await expect(page.locator('#kviz-urlap fieldset').nth(1).locator('.u-feedback')).toHaveClass(/u-bad/);
});

test('Telefonon sincs vízszintes görgetés, világos és sötét témában sem', async ({page}) => {
  await page.goto(chapter);
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  await page.locator('[data-kl^="zh,dfs"]').click();
  await page.locator('#kl-vegig').click();
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-plot, .u-lab, .u-example, .u-cards > div, .u-fix, .u-add, details.u-practice, .u-quiz fieldset, .u-panel, .u-rows').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül, fájlból is olvasható minden keresőfa, táblázat és gyakorlás', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, '../..', chapter)).href);
  await expect(page.locator('#varos-bfs-fa svg circle')).toHaveCount(15);
  await expect(page.locator('#varos-ucs-front')).toContainText('Kecskemét');
  await expect(page.locator('#varos-dfs-fa svg')).toHaveCount(1);
  await expect(page.locator('.u-ids svg')).toHaveCount(4);
  await expect(page.locator('#kirako-fa svg .u-pz-goal')).toHaveCount(1);
  await expect(page.locator('#osszevetes-tabla')).toContainText('O(b · m)');
  await expect(page.locator('#kereso-labor .u-nojs-only')).toBeVisible();
  await expect(page.locator('#kereso-labor .u-js-only')).toBeHidden();
  await page.locator('#gyak-zh > summary').click();
  await page.locator('#gyak-zh .u-sol > summary').nth(2).click();
  await expect(page.locator('#gyak-zh .u-sol').nth(2)).toContainText('W, G₂, G₁, D, X, Y');
  await expect(page.locator('#zh-dfs-front')).toContainText('G');
  await page.locator('#kviz-lenyilo > summary').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2c, 3a');
  await context.close();
});

test('Nyomtatásban a gyakorló feladatok kinyílnak, a laborok eltűnnek', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('switch', {name: 'Sötét mód'}).click();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('.u-lab').first()).toBeHidden();
  await expect(page.locator('#gyak-zh .u-sol').nth(1)).toContainText('S → A → B → C → E → F → V → G');
  expect(await page.locator('#gyak-zh').getAttribute('open')).not.toBeNull();
  const bg = await page.locator('.u-fix').first().evaluate(n => getComputedStyle(n).backgroundColor);
  expect(bg).toBe('rgb(255, 240, 224)');
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await page.locator('#gyak-zh').getAttribute('open')).toBeNull();
});

test('A kezdőlap és a nyolcadik fejezet ide vezet', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name: /Neminformált keresés/}).click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.goto('fejezetek/08-genetikus-algoritmusok.html');
  await page.locator('.u-links a[href="09-neminformalt-kereses.html"]').click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
});
