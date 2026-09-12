const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/05-prolog-es-fuzzy.html';
test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('Mind a tíz kvízválasz ellenőrizhető, javítható és kihagyható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.getByRole('link', {name:'Most kihagyom a kvízt →'})).toHaveAttribute('href','#osszegzes');
  const questions = page.locator('#quiz-questions fieldset');
  await expect(questions).toHaveCount(10);
  await questions.first().getByRole('button').click();
  await expect(questions.first().locator('.feedback')).toContainText('Válassz');
  await questions.first().locator('input').nth(2).check();
  await questions.first().getByRole('button').click();
  await expect(questions.first().locator('.feedback')).not.toContainText('Így van!');
  for (const [index,answer] of [0,1,2,0,1,2,0,1,2,0].entries()) {
    await questions.nth(index).locator('input').nth(answer).check();
    await questions.nth(index).getByRole('button').click();
    await expect(questions.nth(index).locator('.feedback')).toContainText('Így van!');
  }
  await expect(page.locator('#quiz-score')).toContainText('10 helyes');
  await page.getByRole('button', {name:'Kvíz újrakezdése'}).click();
  await expect(page.locator('#quiz-score')).toContainText('0/10');
});

test('A vizsgalabor módszert vált, jelzi az üres kimenetet és visszaáll', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#exam-status')).toContainText('4,217');
  await page.getByLabel('Defuzzifikálás módja').selectOption('weighted');
  await expect(page.locator('#exam-status')).toContainText('4,667');
  await page.getByLabel('Defuzzifikálás módja').selectOption('maximum');
  await expect(page.locator('#exam-status')).toContainText('4,750');
  await page.getByLabel('Zárthelyi pontszám').fill('0');
  await expect(page.locator('#exam-status')).toContainText('Nincs aktív szabály');
  await expect(page.locator('#exam-marker')).toHaveAttribute('visibility','hidden');
  await page.getByRole('button', {name:'65 pont és 6 óra visszaállítása'}).click();
  await expect(page.locator('#exam-status')).toContainText('4,217');
  await expect(page.locator('#exam-marker')).toHaveAttribute('visibility','visible');
  await page.getByLabel('Látogatott órák').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#exam-memberships')).toContainText('6,5 óra');
  await expect(page.locator('#exam-status')).not.toContainText('4,217');
});

test('A tagsági görbe alakja és pontja billentyűvel módosítható', async ({page}) => {
  await page.goto(chapter);
  const before = await page.locator('#curve-path').getAttribute('d');
  await page.getByLabel('Görbe alakja').selectOption('gaussian');
  await expect(page.locator('#curve-status')).toContainText('0,882');
  await expect(page.locator('#curve-path')).not.toHaveAttribute('d',before);
  const x = page.locator('#curve-x');
  await x.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#curve-status')).toContainText('x = 61');
  await page.locator('#curve-width').fill('10');
  await expect(page.locator('#curve-status')).toContainText('w = 10');
  await expect(page.locator('#curve-desc')).toContainText('0,546');
});

test('A Prolog-léptető sorrendet és vágást vált, majd tiszta állapotból újraindul', async ({page}) => {
  await page.goto(chapter);
  await page.getByLabel('Tények sorrendje').selectOption('reversed');
  await page.getByRole('checkbox', {name:'Vágás az első részcél után'}).check();
  const next = page.getByRole('button', {name:'Következő Prolog-lépés'});
  await next.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#prolog-steps li')).toHaveCount(1);
  while (await next.isEnabled()) await next.click();
  await expect(page.locator('#prolog-status')).toContainText('0 megoldás');
  await expect(page.locator('#prolog-steps')).toContainText('szebb(ursula,ursula)');
  await page.getByRole('checkbox', {name:'Vágás az első részcél után'}).uncheck();
  await expect(page.locator('#prolog-steps li')).toHaveCount(0);
  while (await next.isEnabled()) await next.click();
  await expect(page.locator('#prolog-steps')).toContainText('Megoldás: Valaki = kleopatra');
  await expect(page.locator('#prolog-status')).toContainText('1 megoldás');
  await page.getByRole('button', {name:'Keresés újrakezdése'}).click();
  await expect(next).toBeEnabled();
  await expect(page.locator('#prolog-steps li')).toHaveCount(0);
});
