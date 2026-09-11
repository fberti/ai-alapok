const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/03-tudasreprezentacio.html';
test('A harmadik fejezet linkje, haladása, témája és elrendezése működik hiba nélkül', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  await page.goto('index.html');
  await page.locator('a[href="fejezetek/03-tudasreprezentacio.html"]').click();
  await page.locator('[data-progress-toggle]').click();
  await page.reload();
  await expect(page.locator('[data-progress-toggle]')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('switch',{name:'Sötét mód'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('region',{name:'Útkeresés Python-kódrészlete'})).toHaveAttribute('tabindex','0');
  await page.goto('fejezetek/02-tudasbazisok.html');
  await expect(page.locator('[data-progress-toggle]')).toHaveAttribute('aria-pressed','false');
  await page.locator('a[href="03-tudasreprezentacio.html"]').click();
  expect(errors).toEqual([]);
});
test('A tananyag JavaScript nélkül és közvetlen fájlként is olvasható', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  const {pathToFileURL} = require('node:url');
  const path = require('node:path');
  await page.goto(pathToFileURL(path.resolve(chapter)).href);
  await expect(page.locator('#keretek')).toContainText('16:50');
  await expect(page.locator('#esetek')).toContainText('50%');
  await expect(page.locator('noscript')).toBeVisible();
  await context.close();
});
test('A nyolc kvízválasz helyes, a kvíz törölhető és kihagyható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('fieldset')).toHaveCount(8);
  for (const [index,choice] of [1,0,2,1,0,2,1,0].entries()) {
    const question = page.locator('fieldset').nth(index);
    await question.locator('input').nth(choice).check();
    await question.getByRole('button').click();
    await expect(question.locator('.feedback')).toContainText('Így van');
  }
  await expect(page.locator('#quiz-score')).toContainText('8 helyes');
  await page.locator('#quiz-reset').click();
  await expect(page.locator('#quiz-score')).toContainText('0/8');
  await page.getByRole('link',{name:'Most kihagyom a kvízt →'}).click();
  await expect(page).toHaveURL(/#osszegzes$/);
});
test('Az esetsúlyok, a nulla súly és a hibás régi megoldás visszajelzést adnak', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#case-results li').first()).toContainText('Olvasósarok');
  const set = async (id,value) => page.locator(`#${id}`).fill(String(value));
  await set('case-height',75); await set('case-seats',8);
  await expect(page.locator('#case-answer')).toContainText('Ne vedd át');
  await set('weight-height',0); await set('weight-seats',0);
  await expect(page.locator('#case-answer')).toContainText('Legalább egy súly');
  await expect(page.locator('#case-results')).not.toContainText('NaN');
  await page.locator('#case-reset').click();
  await expect(page.locator('#case-answer')).toContainText('100%');
  await page.locator('#case-height').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#case-height-value')).toHaveText('46 cm');
});
test('A keret saját értéket, hibát, törlést és öröklést mutat', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#frame-answer')).toContainText('alumínium');
  await page.selectOption('#frame-kind','Asztal');
  await expect(page.locator('#frame-answer')).toContainText('1 m');
  await page.locator('#frame-height').fill('1.3');
  await expect(page.locator('#frame-event')).toContainText('IF_ADDED');
  await page.locator('#frame-height').fill('1.2');
  await expect(page.locator('#frame-event')).toContainText('IF_MODIFIED');
  await page.locator('#frame-height').fill('1.4');
  await expect(page.locator('#frame-height')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#frame-answer')).toContainText('alatt');
  await page.locator('#frame-reset').click();
  await expect(page.locator('#frame-event')).toContainText('IF_DELETED');
  await expect(page.locator('#frame-answer')).toContainText('Asztal alapértéke');
});
test('A helyi kivétel és az elsőbbség láthatóan változtatja a választ', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#bird-answer')).toContainText('Repülhet: nem');
  await page.locator('#bird-exception').uncheck();
  await expect(page.locator('#bird-answer')).toContainText('Repülhet: igen');
  await expect(page.locator('#insurance-answer')).toContainText('ellentmondás');
  for (const [policy, answer] of [['default','nem'],['car','igen'],['stunt','nem']]) {
    await page.selectOption('#insurance-policy',policy);
    await expect(page.locator('#insurance-answer')).toContainText(`Biztosítása lehet: ${answer}`);
  }
  await page.locator('#conflict-reset').click();
  await expect(page.locator('#insurance-answer')).toContainText('ellentmondás');
});
test('A háló billentyűzettel bővíthető, lekérdezhető és visszaállítható', async ({page}) => {
  await page.goto(chapter);
  await page.getByLabel('Forrás vagy új csomópont').fill('Csipike');
  await page.getByLabel('Kapcsolat típusa').selectOption('instance_of');
  await page.getByLabel('Cél vagy tulajdonság').fill('Veréb');
  await page.getByRole('button',{name:'Él hozzáadása'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#network-status')).toContainText('Él hozzáadva');
  await page.getByLabel('Vizsgált csomópont').selectOption('Csipike');
  await expect(page.locator('#network-answer')).toContainText('Csipike → Veréb → Madár → Állat');
  await expect(page.locator('#network-answer')).toContainText('lélegzik');
  await page.getByRole('button',{name:'Törlés: Csipike instance_of Veréb',exact:true}).click();
  await expect(page.locator('#network-answer')).toContainText('Nincs út');
  await page.getByRole('button',{name:'Háló visszaállítása'}).click();
  await expect(page.getByLabel('Vizsgált csomópont').locator('option')).toHaveCount(7);
});
