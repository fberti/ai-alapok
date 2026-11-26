// A teljes kurzus végső ellenőrzése a GitHub Pages projektoldalnak megfelelő /ai-alapok/ alkönyvtárból.
const {test, expect} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const pages = ['index.html', 'eloadasfelvetelek.html', 'fogalomtar.html', ...fs.readdirSync(path.join(root, 'fejezetek')).filter(f => /^\d\d-.*\.html$/.test(f)).sort().map(f => `fejezetek/${f}`)];

test('Mind a tizenegy fejezet szerepel, és minden oldal közvetlenül megnyitva és újratöltve hibátlan', async ({page}) => {
  expect(pages.filter(p => p.startsWith('fejezetek/'))).toHaveLength(11);
  for (const p of pages) {
    const errors = [];
    const onErr = e => errors.push(e.message);
    const onCon = m => { if (m.type() === 'error') errors.push(m.text()); };
    page.on('pageerror', onErr); page.on('console', onCon);
    const res = await page.goto(p);
    expect(res.status(), p).toBe(200);
    await page.reload();
    await expect(page.locator('main')).toBeVisible();
    page.off('pageerror', onErr); page.off('console', onCon);
    expect(errors, p).toEqual([]);
  }
});

test('Nincs törött belső hivatkozás vagy erőforrás az oldalakon (HTTP-n át)', async ({page, request}) => {
  const checked = new Map();
  for (const p of pages) {
    await page.goto(p);
    const urls = await page.evaluate(() => [...document.querySelectorAll('a[href], link[href], script[src], img[src]')].map(e => e.href || e.src));
    for (const u of urls) {
      const url = new URL(u);
      if (url.origin !== new URL(page.url()).origin) continue;
      const key = url.origin + url.pathname;
      if (!checked.has(key)) checked.set(key, (await request.get(key)).status());
      expect(checked.get(key), `${p} → ${url.pathname}`).toBe(200);
      if (url.hash && url.pathname.endsWith('.html')) {
        const html = await (await request.get(key)).text();
        expect(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${p} → ${url.pathname}${url.hash}`).toBe(true);
      }
    }
  }
  expect(checked.size).toBeGreaterThan(20);
});

test('A kezdőlapi kereső a fogalomtárba visz, és a találatokra szűr', async ({page}) => {
  await page.goto('index.html');
  await page.locator('#kereso-kezdolap').fill('perceptron');
  await page.locator('#kereses button[type=submit]').click();
  await expect(page).toHaveURL(/fogalomtar\.html\?q=perceptron/);
  await expect(page.locator('#g-talalat')).toContainText('fogalom');
  await expect(page.locator('.g-terms > li:visible').first()).toContainText(/erceptron/);
  await page.locator('#g-kereso').fill('hegymaszo');
  await expect(page.locator('.g-terms > li:visible')).toHaveCount(3);
  await page.locator('#g-kereso').fill('');
  await expect(page.locator('#g-talalat')).toHaveText('');
});

test('A kereszthivatkozás a jobb oldali sávban nyílik, a célhoz görget, követi a témát és bezárható', async ({page}) => {
  await page.goto('fejezetek/03-tudasreprezentacio.html');
  const link = page.locator('a.xref[href*="09-neminformalt-kereses.html#szelessegi"]');
  await link.scrollIntoViewIfNeeded();
  const before = await link.evaluate(el => el.getBoundingClientRect().top);
  await link.click();
  const panel = page.locator('.xref-panel');
  await expect(panel).toBeVisible();
  await expect(page).toHaveURL(/03-tudasreprezentacio\.html$/);
  const frame = page.frameLocator('.xref-frame');
  await expect(frame.locator('.xref-target')).toHaveCount(1);
  await expect(frame.locator('.site-header')).toBeHidden();
  const after = await link.evaluate(el => el.getBoundingClientRect().top);
  expect(Math.abs(after - before)).toBeLessThan(80);
  if (test.info().project.name === 'asztali') {
    await page.locator('.site-header [data-theme-toggle]').click();
    await expect(frame.locator('html')).toHaveAttribute('data-theme', await page.locator('html').getAttribute('data-theme'));
  }
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  const width = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(width).toBeLessThanOrEqual(1);
});

test('Az Oldalsáv gomb tartalomlistát nyit, és onnan egy szakasz a sávban olvasható', async ({page}) => {
  await page.goto('fejezetek/01-mi-es-intelligencia.html');
  await page.locator('[data-xref-browse]').click();
  await expect(page.locator('.xref-chapter')).toHaveCount(12);
  await page.locator('.xref-search').fill('rezolucio');
  const hit = page.locator('.xref-chapter:not([hidden]) li:not([hidden]) a').first();
  await expect(hit).toBeVisible();
  await hit.click();
  await expect(page.locator('.xref-frame')).toBeVisible();
  await expect(page.frameLocator('.xref-frame').locator('.xref-target')).toHaveCount(1);
});

test('A fejléc görgetés után keskeny sávként látható marad, a tetején teljes méretű', async ({page}) => {
  await page.goto('fejezetek/03-tudasreprezentacio.html');
  const header = page.locator('.site-header');
  const full = (await header.boundingBox()).height;
  await page.evaluate(() => window.scrollTo(0, 2500));
  await expect(page.locator('html')).toHaveClass(/header-compact/);
  await expect.poll(async () => (await header.boundingBox()).y).toBe(0);
  await expect.poll(async () => (await header.boundingBox()).height).toBeLessThan(Math.min(full, 60));
  await expect(page.locator('.site-header [data-theme-toggle]')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('html')).not.toHaveClass(/header-compact/);
});
