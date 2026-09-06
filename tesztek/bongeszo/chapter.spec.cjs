const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/01-mi-es-intelligencia.html';
test.beforeEach(async ({page}) => {
  page.on('pageerror', error => {throw error;});
});
test('Közvetlen fájlmegnyitásnál is működnek a játékok', async ({page}) => {
  const {pathToFileURL} = require('node:url');
  const path = require('node:path');
  await page.goto(pathToFileURL(path.resolve(chapter)).href);
  await page.locator('#queens-solution').click();
  await expect(page.locator('#queens-status')).toContainText('Megoldva!');
  await expect(page.locator('#quiz-questions fieldset')).toHaveCount(10);
});
test('A fejezet közvetlenül és a kezdőlapról is működik alkönyvtárban', async ({page}) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('');
  await page.getByRole('link',{name:/Kezdjük az alapokkal/}).click();
  await expect(page.getByRole('heading',{level:1})).toContainText('Mitől lesz');
  await page.reload();
  await expect(page.locator('#queens-board button')).toHaveCount(64);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('A nyolc vezér játék kapcsolható, megoldható és törölhető', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('button',{name:'1. sor, 1. oszlop: üres',exact:true}).click();
  await page.getByRole('button',{name:'1. sor, 2. oszlop: üres',exact:true}).click();
  await expect(page.locator('#queens-status')).toContainText('2 vezér ütközik');
  await page.getByRole('button',{name:'Mutass egy megoldást'}).click();
  await expect(page.locator('#queens-status')).toContainText('Megoldva!');
  await page.getByRole('button',{name:'Tábla ürítése'}).click();
  await expect(page.locator('#queens-status')).toContainText('0/8');
  const first=page.locator('#queens-board button').first();
  await first.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space');
  await expect(page.locator('#queens-board button').nth(1)).toHaveAttribute('aria-pressed','true');
});
test('A kvíz visszajelzést ad, újrakezdhető és kihagyható', async ({page}) => {
  await page.goto(chapter);
  const q=page.locator('fieldset').first();
  await q.getByRole('button').click();
  await expect(q.locator('.feedback')).toContainText('Válassz');
  await q.getByRole('radio').nth(0).check(); await q.getByRole('button').click();
  await expect(q.locator('.feedback')).toContainText('Még nem egészen');
  await q.getByRole('radio').nth(1).check(); await q.getByRole('button').click();
  await expect(q.locator('.feedback')).toContainText('Így van');
  await expect(page.locator('#quiz-score')).toContainText('1 helyes');
  await page.getByRole('button',{name:'Kvíz újrakezdése'}).click();
  await expect(page.locator('#quiz-score')).toContainText('0/10');
  await page.getByRole('link',{name:/Most kihagyom/}).click();
  await expect(page).toHaveURL(/#osszegzes$/);
});
test('A kész jelölés újratöltés után is látszik és törölhető', async ({page}) => {
  await page.goto(chapter);
  await page.locator('[data-progress-toggle]').click(); await page.reload();
  await expect(page.locator('[data-progress-toggle]')).toHaveAttribute('aria-pressed','true');
  await page.goto(''); await expect(page.locator('[data-progress-label]')).toContainText('késznek jelölve.');
  await page.goto(chapter); await page.locator('[data-progress-toggle]').click(); await page.reload();
  await expect(page.locator('[data-progress-toggle]')).toHaveAttribute('aria-pressed','false');
});
test('Minden bemutató működik és a szűrés visszaállítható', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('button',{name:'Tanuló spamszűrő',exact:true}).click();
  await expect(page.locator('#case-feedback')).toContainText('adatból tanulás');
  await page.getByRole('button',{name:'Ennyiből nem dönthető el'}).click();
  await expect(page.locator('#turing-feedback')).toContainText('Mindkét választ előre írtuk');
  await page.getByRole('button',{name:'Szándék',exact:true}).click();
  await expect(page.locator('#meaning-feedback')).toContainText('ne dohányozzon');
  await page.locator('[data-layer="edges"]').check();
  await expect(page.locator('#vision-edges')).toBeVisible();
  await page.locator('[data-layer="edges"]').uncheck();
  await expect(page.locator('#vision-edges')).toBeHidden();
  await page.selectOption('#app-filter','robot');
  await expect(page.locator('.app-card:visible')).toHaveCount(3);
  await page.selectOption('#app-filter','all');
  await expect(page.locator('.app-card:visible')).toHaveCount(10);
});
test('JavaScript nélkül is olvasható, és nincs külső erőforrásigény', async ({browser,baseURL}) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage(); const external=[];
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:48173/')) external.push(r.url());});
  await page.goto(baseURL+chapter);
  await expect(page.getByRole('heading',{name:'A jóslat nem menetrend.'})).toBeVisible();
  await expect(page.locator('.correction')).not.toHaveCount(0);
  expect(external).toEqual([]); await context.close();
});
test('A tiltott helyi tároló mellett is működik a fejezet', async ({page}) => {
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('Tiltott tároló');}}));
  await page.goto(chapter); await page.locator('[data-progress-toggle]').click();
  await expect(page.locator('[data-progress-label]')).toContainText('nem engedte a mentést');
  await page.getByRole('button',{name:'Mutass egy megoldást'}).click();
  await expect(page.locator('#queens-status')).toContainText('Megoldva!');
});
