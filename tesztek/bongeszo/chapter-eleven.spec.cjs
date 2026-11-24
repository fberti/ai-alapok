const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/11-zh-gyakorlo.html';

test('A tizenegyedik fejezet hibaüzenet nélkül betölt, a gyakorlás és a kvíz csukva van', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('egy biztos menet');
  await expect(page.locator('details.u-practice')).toHaveCount(15);
  for (const d of await page.locator('details.u-practice, details.u-quiz-wrap').all()) expect(await d.getAttribute('open')).toBeNull();
  await expect(page.locator('#gyak-tf-zh > ol > li')).toHaveCount(15);
  await expect(page.locator('#gyak-tf-uj .u-tf > li')).toHaveCount(36);
  await expect(page.locator('#kviz-urlap fieldset')).toHaveCount(12);
  await expect(page.locator('#kviz-urlap .u-hint')).toHaveCount(12);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).toContainText('Minta-zh');
  await expect(page.locator('#g2-osszegzes tbody tr')).toHaveCount(5);
  await expect(page.locator('#g2-astar-front')).toContainText('G (10+0=10)');
  expect(errors).toEqual([]);
});

test('A változatgenerátor új feladatot és megoldást ad, billentyűzettel is', async ({page}) => {
  await page.goto(chapter);
  const task = page.locator('#gen-feladat');
  await expect(task).toContainText('4. feladat, 1. változat');
  await expect(page.locator('#gen-megoldas-doboz')).toBeHidden();
  await page.locator('#gen-megoldas').click();
  await expect(page.locator('#gen-megoldas-doboz')).toBeVisible();
  await expect(page.locator('#gen-megoldas')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#gen-uj').click();
  await expect(task).toContainText('2. változat');
  await expect(page.locator('#gen-megoldas-doboz')).toBeHidden();
  await page.locator('#gen-tab-halo').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#gen-tab-fuzzy')).toHaveAttribute('aria-selected', 'true');
  await expect(task).toContainText('7. feladat, 1. változat');
  await page.locator('#gen-megoldas').click();
  await expect(page.locator('#gen-megoldas-doboz')).toContainText('%');
  await page.locator('#gen-tab-lampa').click();
  await expect(task).toContainText('9. feladat');
  await page.locator('#gen-megoldas').click();
  await expect(page.locator('#gen-megoldas-doboz')).toContainText('Az elit');
});

test('A pontlap összead, tanácsot ad, és újratöltés után is megmarad', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#pontlap-osszeg')).toHaveText('0 / 100 pont');
  await page.locator('#pl-tf').selectOption('12');
  for (const cb of await page.locator('#pontlap-urlap fieldset').nth(1).locator('input[type=checkbox]').all()) await cb.check();
  await page.locator('#pontlap-urlap input[data-pont="12"]').check();
  await expect(page.locator('#pontlap-osszeg')).toHaveText('34 / 100 pont');
  await expect(page.locator('#pontlap-tanacs a').first()).toHaveAttribute('href', /fejezetek|\.html#/);
  await page.reload();
  await expect(page.locator('#pontlap-osszeg')).toHaveText('34 / 100 pont');
  await page.locator('#pontlap-urlap button[type=reset]').click();
  await expect(page.locator('#pontlap-osszeg')).toHaveText('0 / 100 pont');
});

test('A kvíz kiértékel, és nem zár el semmit', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#kviz-lenyilo > summary').click();
  await page.locator('input[name=k1][value=b]').check();
  await page.locator('input[name=k2][value=a]').check();
  await page.locator('#kviz-urlap button[type=submit]').click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('12 kérdésből 2 megválaszolva, 1 helyes');
  await expect(page.locator('#kviz-urlap fieldset').nth(1).locator('.u-feedback')).toContainText('két klóz');
});

test('Telefonon nincs vízszintes görgetés', async ({page}) => {
  await page.goto(chapter);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
