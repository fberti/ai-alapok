const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/10-informalt-kereses.html';

test('A tizedik fejezet hibaüzenet nélkül betölt, a gyakorlás és a kvíz csukva van', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('használd a sejtésed');
  await expect(page.locator('.u-fix')).toHaveCount(8);
  await expect(page.locator('.u-lab')).toHaveCount(4);
  await expect(page.locator('details.u-practice')).toHaveCount(5);
  for (const d of await page.locator('details.u-practice, details.u-quiz-wrap').all()) expect(await d.getAttribute('open')).toBeNull();
  await expect(page.locator('#kviz-urlap fieldset')).toHaveCount(12);
  await expect(page.locator('#kviz-urlap .u-hint')).toHaveCount(12);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).toContainText(/PDF|zh/);
  expect(errors).toEqual([]);
});

test('A heurisztika-labor ellenőrzi a becslést, és a két keresőt egymás mellett futtatja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#hl-ellenorzes')).toContainText('Elfogadható: igen');
  await page.locator('#hl-vegig').click();
  await expect(page.locator('#hl-moho-ki')).toContainText('Miskolc → Hatvan → Kecskemét → Szolnok, költség 256');
  await expect(page.locator('#hl-astar-ki')).toContainText('Miskolc → Polgár → Debrecen → Szolnok, költség 240');
  await page.locator('[data-hl="city,over"]').click();
  await page.locator('#hl-vegig').click();
  await expect(page.locator('#hl-astar-ki')).toContainText('költség 256');
  await page.locator('[data-hl="zh,zh"]').click();
  await expect(page.locator('#hl-ellenorzes')).toContainText('W (4 > 2)');
  await page.locator('#hl-lep').click();
  await expect(page.locator('#hl-astar-front li')).toHaveText(['A (2+8=10)', 'X (1+16=17)', 'Y₁ (23+15=38)']);
  await page.locator('#hl-vegig').click();
  await expect(page.locator('#hl-astar-ki')).toContainText('S → A → D → K → V → G, költség 18');
  await expect(page.locator('#hl-astar-front li')).toHaveText(['C₂ (8+11=19)', 'W (15+4=19)', 'C₁ (18+11=29)', 'Y₂ (21+15=36)', 'Y₁ (23+15=38)']);
  await expect(page.locator('#hl-osszegzes')).toContainText('nem optimális');
  // A becslés kézzel is átírható.
  await page.locator('#hl-h label[data-state="W"] input').fill('2');
  await expect(page.locator('#hl-astar-ki')).toContainText('költség 17');
  await page.locator('#hl-celteszt').selectOption('generate');
  await expect(page.locator('#hl-astar-ki')).toContainText('költség 18');
  await page.locator('#hl-celteszt').selectOption('expand');
  await page.locator('[data-hl="code18,code"]').click();
  await page.locator('#hl-ismetles').selectOption('graph');
  await expect(page.locator('#hl-astar-ki')).toContainText('költség 35');
  await page.locator('[data-hl="keep,star"]').click();
  await expect(page.locator('#hl-ellenorzes')).toContainText('Konzisztens: igen');
  await expect(page.locator('#hl-h label.u-over')).toHaveCount(0);
});

test('A hegymászó és a szimulált hűtés laborja reprodukálható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#hm-ki')).toContainText('x = 12 → x = 12');
  await page.locator('#hm-start').fill('68');
  await page.locator('#hm-start').dispatchEvent('input');
  await expect(page.locator('#hm-ki')).toContainText('globális csúcs');
  await page.locator('#hm-start').fill('56');
  await page.locator('#hm-start').dispatchEvent('input');
  await expect(page.locator('#hm-ki')).toContainText('fennsíkon');
  await expect(page.locator('#sa-ki')).toContainText('x = 80');
  await expect(page.locator('#sa-ki')).toContainText('a globális csúcson');
  const first = await page.locator('#sa-ki').textContent();
  await page.locator('#sa-ujmag').click();
  await page.locator('#sa-mag').fill('1');
  await page.locator('#sa-mag').dispatchEvent('change');
  await expect(page.locator('#sa-ki')).toHaveText(first);
  await page.locator('#sa-alpha').fill('0.95');
  await page.locator('#sa-alpha').dispatchEvent('input');
  await expect(page.locator('#sa-ki')).toContainText('nem a globális csúcson');
  await page.locator('#sa-szaz').click();
  await expect(page.locator('#sa-szaz-ki')).toContainText('közül');
  await page.locator('#sa-utem').selectOption('log');
  await expect(page.locator('#sa-alpha')).toBeDisabled();
  await page.locator('#val-cel').selectOption('state');
  await expect(page.locator('#osszevetes-tabla tr.u-rec')).toHaveCount(2);
  await page.locator('#val-cel').selectOption('path');
  await expect(page.locator('#osszevetes-tabla tr.u-rec')).toHaveCount(1);
  await expect(page.locator('#val-ki')).toContainText('A*');
});

test('A kvíz kinyitható, kihagyható, és kiértékeli a válaszokat', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#kviz-lenyilo > summary').click();
  await page.locator('input[name=k1][value=b]').check();
  await page.locator('input[name=k2][value=a]').check();
  await page.locator('#kviz-urlap button[type=submit]').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('2 megválaszolva, 1 helyes');
  await expect(page.locator('#kviz-urlap fieldset').nth(1).locator('.u-feedback')).toHaveClass(/u-bad/);
});

test('Telefonon sincs vízszintes görgetés, világos és sötét témában sem', async ({page}) => {
  await page.goto(chapter);
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  await page.locator('[data-hl="zh,zh"]').click();
  await page.locator('#hl-vegig').click();
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-plot, .u-lab, .u-cards > div, .u-fix, .u-add, details.u-practice, .u-quiz fieldset, .u-panel, .u-rows, .u-pseudo').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül, fájlból is olvasható minden ábra, táblázat és a zh-megoldás', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, '../..', chapter)).href);
  await expect(page.locator('#astar-fa svg circle')).toHaveCount(6);
  await expect(page.locator('#astar-front')).toContainText('130+100=230');
  await expect(page.locator('#moho-front')).toContainText('Kecskemét');
  await expect(page.locator('#kod18-ellenorzes')).toContainText('túlbecsül 1-gyel');
  await expect(page.locator('#felszin-abra svg')).toHaveCount(1);
  await expect(page.locator('#elfogadas-tabla')).toContainText('37%');
  await expect(page.locator('#lokalis-esely')).toContainText('Szimulált hűtés');
  await expect(page.locator('#osszevetes-tabla tbody tr')).toHaveCount(10);
  await expect(page.locator('#heur-labor .u-nojs-only')).toBeVisible();
  await expect(page.locator('#heur-labor .u-js-only')).toBeHidden();
  await page.locator('#gyak-zh > summary').click();
  await page.locator('#gyak-zh > ol > li .u-sol > summary').nth(2).click();
  await expect(page.locator('#gyak-zh > ol > li .u-sol').nth(2)).toContainText('C₂ (19), W (19), C₁ (29), Y₂ (36), Y₁ (38)');
  await expect(page.locator('#zh-astar-front')).toContainText('18+0=18');
  await page.locator('#kviz-lenyilo > summary').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2c, 3b');
  await context.close();
});

test('Nyomtatásban a gyakorló feladatok kinyílnak, a laborok eltűnnek', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('switch', {name: 'Sötét mód'}).click();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('.u-lab').first()).toBeHidden();
  await expect(page.locator('#gyak-zh > ol > li .u-sol').nth(1)).toContainText('S → A → D → K → V → G');
  expect(await page.locator('#gyak-zh').getAttribute('open')).not.toBeNull();
  const bg = await page.locator('.u-fix').first().evaluate(n => getComputedStyle(n).backgroundColor);
  expect(bg).toBe('rgb(255, 240, 224)');
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await page.locator('#gyak-zh').getAttribute('open')).toBeNull();
});

test('A kezdőlap és a kilencedik fejezet ide vezet, innen a fogalomtár és a kezdőlap érhető el', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name: /Informált és lokális keresés/}).click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.goto('fejezetek/09-neminformalt-kereses.html');
  await page.locator('.u-links a[href="10-informalt-kereses.html"]').click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.locator('.u-links a[href="../fogalomtar.html"]').click();
  await expect(page).toHaveURL(/fogalomtar\.html$/);
});
