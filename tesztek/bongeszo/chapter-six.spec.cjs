const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/06-neuralis-halozatok.html';
test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('Mind a tizennégy kvízválasz ellenőrizhető, javítható és kihagyható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.getByRole('link', {name:'Most kihagyom a kvízt →'})).toHaveAttribute('href','#osszegzes');
  const questions = page.locator('#quiz-questions fieldset');
  await expect(questions).toHaveCount(14);
  await questions.first().getByRole('button').click();
  await expect(questions.first().locator('.feedback')).toContainText('Válassz');
  await questions.first().locator('input').nth(1).check();
  await questions.first().getByRole('button').click();
  await expect(questions.first().locator('.feedback')).not.toContainText('Így van!');
  for (const [index,answer] of [0,2,1,1,0,2,1,0,2,0,1,2,0,1].entries()) {
    await questions.nth(index).locator('input').nth(answer).check();
    await questions.nth(index).getByRole('button').click();
    await expect(questions.nth(index).locator('.feedback')).toContainText('Így van!');
  }
  await expect(page.locator('#quiz-score')).toContainText('14 helyes');
  await page.getByRole('button', {name:'Kvíz újrakezdése'}).click();
  await expect(page.locator('#quiz-score')).toContainText('0/14');
});

test('Az állítható neuron számol, függvényt vált és összevet', async ({page}) => {
  await page.goto(chapter);
  const status = page.locator('#neuron-status');
  await expect(status).toContainText('a = 0,700');
  await expect(status).toContainText('o = 0,668');
  await page.getByRole('combobox', {name:'Aktivációs függvény'}).selectOption('threshold');
  await expect(status).toContainText('o = 1,000');
  await page.getByLabel('w₁ súly').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(status).toContainText('a = 0,600');
  await page.getByRole('checkbox', {name:'ReLU'}).check();
  await page.getByRole('checkbox', {name:'tanh'}).check();
  await expect(page.locator('#neuron-overlay-paths path')).toHaveCount(2);
  await expect(page.locator('#neuron-chart-desc')).toContainText('ReLU');
  await expect(page.locator('#neuron-curve')).not.toHaveAttribute('d','');
});

test('A hálószerkesztő súlyt számol és felismeri a visszacsatolást', async ({page}) => {
  await page.goto(chapter);
  const status = page.locator('#net-status');
  await expect(status).toContainText('13 tanulható paraméter');
  await expect(status).toContainText('előrecsatolt');
  await page.getByRole('checkbox', {name:'Laterális'}).check();
  await expect(status).toContainText('visszacsatolt');
  await expect(status).toContainText('laterális: 6');
  await expect(page.locator('#net-svg .edge-back')).not.toHaveCount(0);
  await page.getByRole('checkbox', {name:'Laterális'}).uncheck();
  await page.getByLabel('Rejtett rétegek').fill('0');
  await expect(status).toContainText('egyrétegű');
  await expect(status).toContainText('3 tanulható paraméter');
  await expect(page.locator('#net-svg circle')).toHaveCount(3);
});

test('A perceptron megtanulja az ÉS kaput, az XOR-nál elakad', async ({page}) => {
  await page.goto(chapter);
  const status = page.locator('#perc-status'), epoch = page.getByRole('button', {name:'Egy teljes korszak'});
  await page.getByRole('button', {name:'Egy tanítási lépés'}).click();
  await expect(page.locator('#perc-trace li')).toHaveCount(1);
  await expect(status).toContainText('torzítás = −0,5');
  for (let i = 0; i < 6; i++) await epoch.click();
  await expect(status).toContainText('Helyes: 4/4');
  await expect(status).toContainText('Hibátlan korszak');
  await page.getByLabel('Logikai kapu').selectOption('xor');
  await expect(page.locator('#perc-trace li')).toHaveCount(0);
  for (let i = 0; i < 10; i++) await epoch.click();
  await expect(status).not.toContainText('Helyes: 4/4');
  await expect(status).toContainText('nem szétválasztható');
  await page.getByLabel('Logikai kapu').selectOption('or');
  await page.getByLabel('Perceptron w₁').fill('1');
  await page.getByLabel('Perceptron w₂').fill('1');
  await page.getByLabel('Perceptron torzítás').fill('-0.5');
  await expect(status).toContainText('Helyes: 4/4');
});

test('A gradiensvölgy konvergál, oszcillál és elszáll', async ({page}) => {
  await page.goto(chapter);
  const status = page.locator('#gd-status'), run = page.getByRole('button', {name:'Húsz lépés'});
  await run.click();
  await expect(status).toContainText('20. lépés');
  await expect(status).toContainText('w = 1,954');
  await page.getByLabel('Tanulási ráta, η').fill('1');
  await expect(status).toContainText('0. lépés');
  await run.click();
  await expect(status).toContainText('oszcillál');
  await page.getByLabel('Tanulási ráta, η').fill('1.1');
  await run.click();
  await expect(status).toContainText('elszáll');
  await page.getByLabel('Hibafelület').selectOption('twoValleys');
  await page.getByLabel('Tanulási ráta, η').fill('0.05');
  await page.getByLabel('Kezdő súly').fill('2');
  await run.click(); await run.click();
  await expect(status).toContainText('lokális minimum');
});

test('A fokszámcsúszka mutatja a túlillesztést', async ({page}) => {
  await page.goto(chapter);
  const status = page.locator('#fit-status'), degree = page.getByLabel('A polinom fokszáma');
  await expect(status).toContainText('teszthiba 0,016');
  await degree.fill('9');
  await expect(status).toContainText('teszthiba 0,474');
  await expect(status).toContainText('túlillesztés');
  await degree.focus(); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
  await expect(status).toContainText('5. fok');
  await expect(status).toContainText('teszthiba 0,004');
});

test('A hibavisszaterjesztés hat fázisa a végigszámolt példát adja', async ({page}) => {
  await page.goto(chapter);
  const next = page.getByRole('button', {name:'Következő fázis'});
  for (let i = 0; i < 6; i++) await next.click();
  const trace = page.locator('#bp-trace');
  await expect(trace.locator('li')).toHaveCount(6);
  for (const value of ['0,6225','0,5707','0,1052','−0,0124','0,6327','0,0836']) await expect(trace).toContainText(value);
  await next.click();
  await expect(trace.locator('li')).toHaveCount(1);
  await page.getByRole('button', {name:'Kiinduló háló'}).click();
  await expect(trace.locator('li')).toHaveCount(0);
  await page.getByLabel('Háló tanulási rátája, η').selectOption('2');
  const train = page.getByRole('button', {name:'500 korszak XOR-tanítás'});
  await train.click(); await train.click();
  await expect(page.locator('#bp-status')).toContainText('1000 korszak');
  await expect(page.locator('#bp-status')).toContainText('0 → 0,0');
});
