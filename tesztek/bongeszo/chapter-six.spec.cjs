const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/06-neuralis-halozatok.html';

/** Csúszka vagy számmező beállítása és az input esemény kiváltása. */
async function set(page, sel, value) {
  await page.locator(sel).fill(String(value));
  await page.locator(sel).dispatchEvent('input');
}

test('A hatodik fejezet hibaüzenet nélkül betölt', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(chapter);
  await expect(page.locator('h1')).toContainText('súlyokból');
  await expect(page.locator('#tortenet li')).toHaveCount(11);
  await expect(page.locator('#aktivacios-galeria figure')).toHaveCount(11);
  await expect(page.locator('.u-fix')).toHaveCount(17);
  await expect(page.locator('.u-lab')).toHaveCount(12);
  for (const fig of await page.locator('.u-quote').all()) await expect(fig.locator('figcaption')).toContainText('PDF');
  expect(errors).toEqual([]);
});

test('A buli-neuron súlyozott összeget számol, és a bemenetre reagál', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#buli-ki')).toContainText('a = −0,2');
  await expect(page.locator('#buli-ki')).toContainText('otthon');
  await page.locator('#buli-x3').uncheck();
  await expect(page.locator('#buli-ki')).toContainText('a = 1,8');
  await expect(page.locator('#buli-ki')).toContainText('megyek');
  await page.locator('#buli-akt').selectOption('sigmoid');
  await expect(page.locator('#buli-ki')).toContainText('0,86');
  await expect(page.locator('#buli-rajz path.u-edge')).toHaveCount(4);
});

test('Az aktivációs grafikon a kijelölt függvényeket rajzolja és a deriváltat is mutatja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#akt-rajz path.u-fn')).toHaveCount(4);
  await page.locator('input[name=akt][value=gaussian]').check();
  await expect(page.locator('#akt-rajz path.u-fn')).toHaveCount(5);
  await set(page, '#akt-a', 0);
  await expect(page.locator('#akt-ki')).toContainText('nem értelmezett');
  await expect(page.locator('#akt-ki')).toContainText('0,25');
});

test('A hálószerkesztő megszámolja a súlyokat, és felismeri a visszacsatolást', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#halo-osszeg')).toContainText('9 súly');
  await expect(page.locator('#halo-osszeg')).toContainText('13 tanulható paraméter');
  await expect(page.locator('#halo-osszeg')).toContainText('előrecsatolt');
  await page.locator('#halo-v-global').check();
  await expect(page.locator('#halo-osszeg')).toContainText('visszacsatolt');
  await expect(page.locator('#halo-rajz path.u-edge-back')).not.toHaveCount(0);
  await page.locator('#halo-rejtett').selectOption('0');
  await expect(page.locator('#halo-osszeg')).toContainText('egyrétegű');
});

test('A visszacsatolt neuron megnyugszik vagy oszcillál', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#hurok-ki')).toContainText('0,365');
  await set(page, '#hurok-w', -3);
  await set(page, '#hurok-x', 0);
  await expect(page.locator('#hurok-ki')).toContainText('oszcillál');
});

test('A túlillesztés-labor a tanító- és a teszthibát is mutatja', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#illesztes-ki')).toContainText('3. fokú');
  await set(page, '#illesztes-fok', 9);
  await expect(page.locator('#illesztes-ki')).toContainText('tanítóhiba 0,0000');
  await expect(page.locator('#illesztes-ki')).toContainText('0,4743');
});

test('Az MP-neuron küszöböl, és a tiltó bemenet mindent leállít', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#mp-ki')).toContainText('nem tüzel');
  await page.locator('#mp-x1').click();
  await page.locator('#mp-x2').click();
  await expect(page.locator('#mp-x1')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#mp-ki')).toContainText('tüzel');
  await expect(page.locator('#mp-ki')).not.toContainText('nem tüzel');
  await page.locator('#mp-tilt').click();
  await expect(page.locator('#mp-ki')).toContainText('tiltó');
});

test('A perceptron kézzel és tanítással is elválasztja az ÉS-t, az XOR-t soha', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#pc-ki')).toContainText('/4');
  await set(page, '#pc-w1', 1);
  await set(page, '#pc-w2', 1);
  await set(page, '#pc-theta', 1.5);
  await expect(page.locator('#pc-ki')).toContainText('4/4');
  await page.locator('#pc-nullaz').click();
  await page.locator('#pc-lepes').click();
  await expect(page.locator('#pc-naplo li')).toHaveCount(1);
  await page.locator('#pc-lejatszas').click();
  await expect(page.locator('#pc-naplo li')).toHaveCount(2, {timeout: 3000});
  await page.locator('#pc-lejatszas').click();
  await expect(page.locator('#pc-lejatszas')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#pc-vegig').click();
  await expect(page.locator('#pc-ki')).toContainText('Megtanulta');
  await expect(page.locator('#pc-ki')).toContainText('6. korszak');
  await page.locator('#pc-kapu').selectOption('xor');
  await page.locator('#pc-vegig').click();
  await expect(page.locator('#pc-ki')).toContainText('50 korszak');
  await expect(page.locator('#pc-ki')).not.toContainText('4/4');
});

test('Az XOR-háló kapcsolói a rejtett neuronokat is mutatják', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#xor-ki')).toContainText('kimenet: 0');
  await page.locator('#xor-x1').click();
  await expect(page.locator('#xor-ki')).toContainText('u2 = 1');
  await expect(page.locator('#xor-ki')).toContainText('kimenet: 1');
  await page.locator('#xor-x2').click();
  await expect(page.locator('#xor-ki')).toContainText('kimenet: 0');
  await expect(page.locator('#xor-rajz .u-node-on')).toHaveCount(2);
});

test('Az entrópia-labor bitben számol', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#ent-ki')).toContainText('H = 1 bit');
  await set(page, '#ent-p', 0.9);
  await expect(page.locator('#ent-ki')).toContainText('0,47 bit');
  await expect(page.locator('#ent-ki')).toContainText('KL');
});

test('A gradiensvölgy megérkezik, oszcillál, elszáll, vagy lokális minimumban reked', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#gd-lepes').click();
  await expect(page.locator('#gd-ki')).toContainText('1. lépés');
  await page.locator('#gd-futtat').click();
  await expect(page.locator('#gd-ki')).toContainText('megérkezett');
  await set(page, '#gd-rata', 1.2);
  await page.locator('#gd-futtat').click();
  await expect(page.locator('#gd-ki')).toContainText('elszáll');
  await set(page, '#gd-rata', 1);
  await page.locator('#gd-futtat').click();
  await expect(page.locator('#gd-ki')).toContainText('pattog');
  await page.locator('#gd-felulet').selectOption('twoValleys');
  await set(page, '#gd-rata', 0.05);
  await set(page, '#gd-start', 2);
  await page.locator('#gd-futtat').click();
  await expect(page.locator('#gd-ki')).toContainText('lokális');
});

test('A hibavisszaterjesztés lépésről lépésre a kézi számokat adja, majd megtanulja az XOR-t', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#bp-hiba')).toBeDisabled();
  await page.locator('#bp-elore').click();
  await expect(page.locator('#bp-ki')).toContainText('0,5707');
  await page.locator('#bp-hiba').click();
  await expect(page.locator('#bp-ki')).toContainText('0,1052');
  await page.locator('#bp-frissit').click();
  await expect(page.locator('#bp-ki')).toContainText('0,6327');
  await page.locator('#bp-tanit').click();
  await expect(page.locator('#bp-ki')).toContainText('mind a 4');
  await expect(page.locator('#bp-gorbe path.u-curve')).toHaveCount(1);
});

test('A versengő réteg egy győztest hagy, az együttműködő együtt telít', async ({page}) => {
  await page.goto(chapter);
  await page.locator('#mech-futtat').click();
  await expect(page.locator('#mech-ki')).toContainText('2. neuron nyert');
  await page.locator('#mech-fajta').selectOption('cooperative');
  await page.locator('#mech-futtat').click();
  await expect(page.locator('#mech-ki')).toContainText('telít');
  await page.locator('#mech-fajta').selectOption('normalizing');
  await page.locator('#mech-lepes').click();
  await expect(page.locator('#mech-ki')).toContainText('összege 1');
});

test('A kvíz minden helyes választ elfogad', async ({page}) => {
  await page.goto(chapter);
  const answers = {k1: 'b', k2: 'c', k3: 'a', k4: 'b', k5: 'c', k6: 'a', k7: 'b', k8: 'c', k9: 'a', k10: 'b', k11: 'c', k12: 'a', k13: 'b', k14: 'c'};
  for (const [name, value] of Object.entries(answers)) await page.locator(`input[name=${name}][value=${value}]`).check();
  await page.getByRole('button', {name: 'Válaszok ellenőrzése'}).click();
  await expect(page.locator('#kviz-eredmeny')).toContainText('14 kérdésből 14 megválaszolva, 14 helyes');
});

test('Nincs vízszintes túlcsordulás egyik szélességen és témában sem', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(chapter);
  await page.locator('#halo-v-global').check();
  await page.locator('#halo-v-lateral').check();
  await page.locator('#pc-vegig').click();
  await page.locator('#bp-elore').click();
  await page.locator('#bp-hiba').click();
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({width, height: 900});
    for (const dark of [false, true]) {
      const toggle = page.getByRole('switch', {name: 'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.u-compare > div, .u-stack > li, .u-plot, .u-gallery figure, .u-lab, .u-example, .u-log li, .u-formula, .u-cycle li, .u-cards > div, .u-fix, .u-add').evaluateAll(
        (nodes, limit) => nodes.filter(n => { const b = n.getBoundingClientRect(); return b.left < -1 || b.right > limit + 1 || n.scrollWidth > n.clientWidth + 1; }).map(n => n.id || n.className), width);
      expect(overflow, `${width}px, ${dark ? 'sötét' : 'világos'}`).toEqual([]);
    }
  }
});

test('JavaScript nélkül, fájlból is olvasható minden levezetés és ábra', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, '../..', chapter)).href);
  await expect(page.locator('#aktivacios-galeria svg')).toHaveCount(11);
  await expect(page.locator('#es-tanitas')).toContainText('Θ = 3');
  await expect(page.locator('#bp-pelda')).toContainText('0,6327');
  await expect(page.locator('#derivalt-pelda')).toContainText('0,143');
  await expect(page.locator('#kod-futas')).toContainText('93');
  await expect(page.locator('#kviz-eredmeny')).toContainText('1b, 2c, 3a');
  await expect(page.locator('#pc-lepes')).toBeHidden();
  await context.close();
});

test('Nyomtatásban sötét témából is világos papírra kerül minden olvasási elem', async ({page}) => {
  await page.goto(chapter);
  await page.getByRole('switch', {name: 'Sötét mód'}).click();
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('#aktivacios-galeria')).toBeVisible();
  await expect(page.locator('#bp-pelda')).toBeVisible();
  await expect(page.locator('.u-lab').first()).toBeHidden();
  const bg = await page.locator('.u-example').first().evaluate(n => getComputedStyle(n).backgroundColor);
  expect(bg).toBe('rgb(255, 254, 249)');
});

test('A kezdőlap és az ötödik fejezet ide vezet', async ({page}) => {
  await page.goto('index.html');
  await page.getByRole('link', {name: /Mesterséges neurális hálózatok/}).click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
  await page.goto('fejezetek/05-prolog-es-fuzzy.html');
  await page.locator('.u-links a[href="06-neuralis-halozatok.html"]').click();
  await expect(page).toHaveURL(new RegExp(chapter + '$'));
});
