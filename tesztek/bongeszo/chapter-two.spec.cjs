const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/02-tudasbazisok.html';
test('A tudáskinyerés lépései billentyűzettel rendezhetők', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#process-check').click();
  await expect(page.locator('#process-feedback')).toContainText('Még nem');
  await page.locator('#process-order li').nth(1).getByRole('button',{name:/Fel/}).focus();
  await page.keyboard.press('Enter');
  await page.locator('#process-order li').nth(3).getByRole('button',{name:/Fel/}).click();
  await page.locator('#process-check').click();
  await expect(page.locator('#process-feedback')).toContainText('Helyes');
  await page.locator('#process-reset').click();
  await page.locator('#process-check').click();
  await expect(page.locator('#process-feedback')).toContainText('Még nem');
});
test('Az interjú mind a hat kérdéshez választ és magyarázatot ad', async ({page}) => {
  await page.goto(chapter);
  for (let i=0;i<6;i++) {
    await page.locator('[data-interview]').nth(i).click();
    await expect(page.locator('#interview-answer')).toContainText('Szakértő:');
    await expect(page.locator('#interview-effect')).toContainText(`K${i+1}`);
  }
  await page.locator('#interview-reset').click();
  await expect(page.locator('#interview-answer')).toContainText('Melyik kérdés');
});
test('A két láncolási irány lejátszható, megállítható és hiányzó tényt is jelez', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#chain-play').click();
  await expect(page.locator('#chain-play')).toHaveText('Megállítás');
  await page.locator('#chain-play').click();
  await expect(page.locator('#chain-play')).toHaveText('Lejátszás');
  for (let i=0;i<30 && await page.locator('#chain-step').isEnabled();i++) await page.locator('#chain-step').click();
  await expect(page.locator('#chain-status')).toContainText('g igazolva');
  await expect(page.locator('#backward-trace')).toContainText('g: igazolva');
  await page.locator('#include-d').uncheck();
  for (let i=0;i<30 && await page.locator('#chain-step').isEnabled();i++) await page.locator('#chain-step').click();
  await expect(page.locator('#chain-status')).toContainText('g nem igazolható');
  await page.locator('#chain-reset').click();
  await expect(page.locator('#chain-step')).toBeEnabled();
});
test('A konfliktusjáték az elv szerint választ, és rossz választásnál nem lép', async ({page}) => {
  await page.goto(chapter);
  await page.selectOption('#conflict-policy','priority');
  await page.locator('[data-conflict="R1"]').click();
  await expect(page.locator('#conflict-feedback')).toContainText('R2');
  await expect(page.locator('#conflict-set')).toContainText('R1, R2');
  for (const rule of ['R2','R1','R3']) await page.locator(`[data-conflict="${rule}"]`).click();
  await expect(page.locator('#conflict-set')).toContainText('a, b, c, d, f, e, g');
  await page.locator('#conflict-reset').click();
  await page.selectOption('#conflict-policy','order');
  await page.locator('[data-conflict="R1"]').click();
  await expect(page.locator('#conflict-set')).toContainText('a, b, c, d, e');
});
test('A második fejezet kész jelölése nem változtatja meg az elsőét', async ({page}) => {
  await page.goto(chapter);
  await page.locator('[data-progress-toggle]').click();
  await page.reload();
  await expect(page.locator('[data-progress-toggle]')).toHaveAttribute('aria-pressed','true');
  await page.goto('fejezetek/01-mi-es-intelligencia.html');
  await expect(page.locator('[data-progress-toggle]')).toHaveAttribute('aria-pressed','false');
});
test('A kilenc kvízkérdés értékelhető, törölhető és kihagyható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('fieldset')).toHaveCount(9);
  const first = page.locator('fieldset').first();
  await first.getByRole('button').click();
  await expect(first.locator('.feedback')).toContainText('Válassz');
  await first.getByRole('radio').nth(0).check(); await first.getByRole('button').click();
  await expect(first.locator('.feedback')).toContainText('Még nem');
  const answers = [1,0,2,1,0,2,1,0,2];
  for (let i=0;i<answers.length;i++) {
    const question = page.locator('fieldset').nth(i);
    await question.getByRole('radio').nth(answers[i]).check(); await question.getByRole('button').click();
    await expect(question.locator('.feedback')).toContainText('Így van');
  }
  await expect(page.locator('#quiz-score')).toContainText('9 helyes');
  await first.getByRole('radio').nth(0).check();
  await expect(page.locator('#quiz-score')).toContainText('8/9');
  await page.locator('#quiz-reset').click();
  await expect(page.locator('#quiz-score')).toContainText('0/9');
  await page.getByRole('link',{name:'Most kihagyom a kvízt →'}).click();
  await expect(page).toHaveURL(/#osszegzes$/);
});
test('Kezdőlapról, újratöltve és fájlként is működik, mobilon sincs túllógás', async ({page}) => {
  await page.goto('');
  await page.getByRole('link',{name:/Tudásbázisok és szakértőrendszerek/}).click();
  await page.reload();
  await expect(page.locator('h1')).toContainText('láttam korábban');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const {pathToFileURL} = require('node:url');
  await page.goto(pathToFileURL(require('node:path').resolve(chapter)).href);
  await page.locator('[data-rule="R1"]').click();
  await expect(page.locator('#rule-facts')).toContainText('a, b, c, d, e');
  await expect(page.locator('fieldset')).toHaveCount(9);
});
test('A tananyag JavaScript nélkül is olvasható, külső fájlt nem tölt be', async ({browser,baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage(); const external = [];
  page.on('request', request => {if (!request.url().startsWith(baseURL)) external.push(request.url());});
  await page.goto(baseURL+chapter);
  await expect(page.locator('#osszegzes')).toContainText('A tudásból működő lépések lesznek.');
  await expect(page.getByRole('heading',{name:'A Tudás Kézikönyv teljes kezdeti tartalma'})).toBeVisible();
  await expect(page.locator('#tudas-kezikonyv')).toContainText('prototípusban közreműködő szakértők nevét');
  await expect(page.locator('#tudas-kezikonyv dd').nth(1)).toBeVisible();
  expect(external).toEqual([]); await context.close();
});
test('Tiltott tároló és csökkentett mozgás mellett is működik', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw Error('Tiltott');}}));
  await page.goto(chapter);
  await page.locator('[data-progress-toggle]').click();
  await expect(page.locator('[data-progress-label]')).toContainText('nem engedte a mentést');
  await page.locator('#chain-step').click();
  await expect(page.locator('#forward-trace li').last()).toHaveCSS('animation-name','none');
  await page.getByRole('switch',{name:'Sötét mód'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));
test('A szabálylánc csak teljes feltételből vezet le új tényt, és újrakezdhető', async ({page}) => {
  await page.goto(chapter);
  const lab = page.locator('#szabaly-labor');
  await expect(lab.getByRole('button',{name:/R3:/})).toBeDisabled();
  await lab.getByRole('button',{name:/R1:/}).click();
  await expect(lab.locator('[role="status"]')).toContainText('a, b, c, d, e');
  await lab.getByRole('button',{name:/R2:/}).click();
  await lab.getByRole('button',{name:/R3:/}).click();
  await expect(lab.locator('[role="status"]')).toContainText('g');
  await lab.getByRole('button',{name:'Szabálylánc újrakezdése'}).click();
  await expect(lab.getByRole('button',{name:/R3:/})).toBeDisabled();
});
