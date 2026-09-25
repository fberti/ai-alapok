const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/04-formalis-logika-uj.html';

test('Az új negyedik fejezet hibaüzenet nélkül betölt', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('hogy egy következtetés helyes');
  await expect(page.locator('#idovonal li')).toHaveCount(15);
  await expect(page.locator('#pdf-letra li')).toHaveCount(4);
  await expect(page.locator('.u-fix')).toHaveCount(5);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test('A formulavizsgáló elemez, osztályoz és lépésenként kiértékel', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#formula-ki')).toContainText('= 16');
  await expect(page.locator('#formula-tabla tbody tr')).toHaveCount(16);
  await expect(page.locator('#formula-lepesek')).toContainText('T → F');
  await expect(page.locator('#formula-lepesek')).toContainText('hamis');
  await page.locator('#formula-be').fill('p | !p');
  await expect(page.locator('#formula-ki')).toContainText('tautológia');
  await page.locator('#formula-be').fill('p & ~p');
  await expect(page.locator('#formula-ki')).toContainText('kielégíthetetlen');
  await page.locator('#formula-be').fill('p & -> q');
  await expect(page.locator('#formula-ki')).toContainText('Nem jól formált');
  await page.locator('#formula-be').fill('!p & q | r -> s');
  await expect(page.locator('#formula-ki')).toContainText('((((¬p) ∧ q) ∨ r) → s)');
  await page.locator('#formula-minta').selectOption({label: 'A menzai rejtvény formája'});
  await expect(page.locator('#formula-ki')).toContainText('tautológia');
});

test('A rezolúciós műhely üres klózt vagy telítődést talál', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#rez-klozok input[value="0"]').check();
  await page.locator('#rez-klozok input[value="1"]').check();
  await page.locator('#rez-par').click();
  await expect(page.locator('#rez-ki')).toContainText('C6: ¬q ∨ r');
  await page.locator('#rez-vegig').click();
  await expect(page.locator('#rez-ki')).toContainText('üres klóz');
  await page.locator('#rez-keszlet').selectOption({index: 2});
  await page.locator('#rez-vegig').click();
  await expect(page.locator('#rez-ki')).toContainText('kielégíthető');
  await page.locator('#rez-keszlet').selectOption({index: 3});
  await page.locator('#rez-klozok input[value="0"]').check();
  await page.locator('#rez-klozok input[value="1"]').check();
  await page.locator('#rez-par').click();
  await expect(page.locator('#rez-ki')).toContainText('2 ellentett literálpárt');
  await page.locator('#rez-sajat').fill('a ∨ b; !a; ~b');
  await page.locator('#rez-betolt').click();
  await page.locator('#rez-vegig').click();
  await expect(page.locator('#rez-ki')).toContainText('kielégíthetetlen');
});

test('A világ-bemutató nem ad ellenpéldát', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#vilag-ki')).toContainText('F3 is igaz');
  await page.locator('#vilag-trukk').click();
  await expect(page.locator('#vilag-ki')).toContainText('F1 hamis');
  await page.getByLabel('S(Anna, szócséplés)').check();
  await expect(page.locator('#vilag-ki')).toContainText('F2 hamis');
  await expect(page.locator('#vilag-ki')).not.toContainText('Ellenpélda!');
});

test('A kvíz minden helyes választ elfogad', async ({page}) => {
  await page.goto(chapter);
  const answers = {k1: 'c', k2: 'b', k3: 'a', k4: 'c', k5: 'b', k6: 'a', k7: 'c', k8: 'b', k9: 'a', k10: 'c', k11: 'b', k12: 'a'};
  for (const [name, value] of Object.entries(answers)) await page.locator(`input[name=${name}][value=${value}]`).check();
  await page.getByRole('button', {name: 'Válaszok ellenőrzése'}).click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('12 kérdésből 12 megválaszolva, 12 helyes');
});

test('Nincs vízszintes túlcsordulás egyik szélességen és témában sem', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-stack > li, .u-tree-fig, .u-venn-row > div, .u-ladder li, .u-bind, .u-formula, .u-knf, .u-triples li, .u-lab, .u-example').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül is olvasható minden levezetés', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(chapter);
  await expect(page.locator('#kiertekeles-pelda')).toContainText('az A formula hamis');
  await expect(page.locator('#knf-atalakitas')).toContainText('(p ∨ q ∨ r) ∧ (¬p ∨ ¬q ∨ r)');
  await expect(page.locator('#rezolucio-pelda')).toContainText('NIL');
  await expect(page.locator('#ertik-tabla')).toContainText('y ← Rezolúció');
  await expect(page.locator('#venn svg').first()).toBeVisible();
  await expect(page.locator('#kviz-eredmeny')).toContainText('1c, 2b, 3a');
  await expect(page.locator('#formula-be')).toBeHidden();
  await context.close();
});
