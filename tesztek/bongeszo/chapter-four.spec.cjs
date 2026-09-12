const {test, expect} = require('@playwright/test');
const chapter = 'fejezetek/04-formalis-logika.html';

test('A mondatfeladat azonnal segít és elfogadja az ekvivalens megoldást', async ({page}) => {
  await page.goto(chapter);
  await page.getByLabel('A mondat képlete').fill('p | q');
  await expect(page.locator('#sentence-status')).toContainText('Ellenpélda');
  await page.getByLabel('A mondat képlete').fill('!(p & q)');
  await expect(page.locator('#sentence-status')).toContainText('Helyes');
  await page.getByLabel('Gyakorlómondat').selectOption('both');
  await expect(page.locator('#sentence-status')).toContainText('Ellenpélda');
  await page.getByLabel('A mondat képlete').fill('q & p');
  await expect(page.locator('#sentence-status')).toContainText('Helyes');
  await page.getByLabel('A mondat képlete').fill('r');
  await expect(page.locator('#sentence-status')).toContainText('Csak p és q');
});
test('A KNF-lépésgép végigvezet, újraindul és hibánál nem tart meg régi lépést', async ({page}) => {
  await page.goto(chapter);
  await page.getByLabel('Átalakítandó képlet').fill('p -> (q & r)');
  await page.getByRole('button', {name:'Átalakítás indítása'}).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', {name:'Következő KNF-lépés'}).click();
  await expect(page.locator('#cnf-results li')).toHaveCount(4);
  await expect(page.locator('#cnf-results li').last()).toContainText('((¬p ∨ q) ∧ (¬p ∨ r))');
  await expect(page.locator('#cnf-next')).toBeDisabled();
  await page.getByLabel('Átalakítandó képlet').fill('(');
  await page.getByRole('button', {name:'Átalakítás indítása'}).click();
  await expect(page.locator('#cnf-results li')).toHaveCount(0);
  await expect(page.locator('#cnf-next')).toBeDisabled();
  await page.getByLabel('Átalakítandó képlet').fill('p');
  await page.getByRole('button', {name:'Átalakítás indítása'}).click();
  await expect(page.locator('#cnf-next')).toBeEnabled();
});

test('A faépítő a PDF minden szülőjét követi és hibás párból nem ad klózt', async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#resolution-tree li')).toHaveCount(5);
  await page.getByLabel('Második szülőklóz').selectOption('3');
  await page.getByRole('button', {name:'Rezolvens hozzáadása'}).click();
  await expect(page.locator('#resolution-status')).toContainText('ellentett');
  await expect(page.locator('#resolution-tree li')).toHaveCount(5);
  for (const [left,right,pivot] of [['0','1','p'],['5','2','r'],['6','3','q'],['7','4','s']]) {
    await page.getByLabel('Első szülőklóz').selectOption(left);
    await page.getByLabel('Második szülőklóz').selectOption(right);
    await page.getByLabel('Törlendő változó').selectOption(pivot);
    await page.getByRole('button', {name:'Rezolvens hozzáadása'}).click();
  }
  await expect(page.locator('#resolution-tree li')).toHaveCount(9);
  await expect(page.locator('#resolution-tree li').last()).toContainText('C9 = □');
  await expect(page.locator('#resolution-tree li').last()).toContainText('C8 + C5');
  await expect(page.locator('#resolution-status')).toContainText('kielégíthetetlen');
  await page.getByRole('button', {name:'Fa visszaállítása'}).click();
  await expect(page.locator('#resolution-tree li')).toHaveCount(5);
});

test('A kvantor hatóköre és a kötött előfordulás külön, billentyűvel is kijelölhető', async ({page}) => {
  await page.goto(chapter);
  const x = page.getByRole('button', {name:'A külső ∀x hatóköre'});
  await x.focus(); await page.keyboard.press('Enter');
  await expect(x).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-scope-region="x"]')).toHaveClass(/scope-active/);
  await expect(page.locator('.binding-active')).toHaveCount(2);
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  await expect(page.locator('[data-scope-region="y"]')).toHaveClass(/scope-active/);
  await expect(page.locator('.binding-active')).toHaveCount(1);
  await expect(page.locator('#scope-status')).toContainText('csak a Q-beli');
  await page.getByRole('button', {name:'A szabad y helye'}).click();
  await expect(page.locator('[data-binding="free"]')).toHaveClass(/binding-active/);
  await expect(page.locator('.scope-active')).toHaveCount(0);
});

test('Mind a tizenkét kvízválasz helyes és a kvíz kihagyható', async ({page}) => {
  await page.goto(chapter);
  await expect(page.getByRole('link', {name:'Most kihagyom a kvízt →'})).toHaveAttribute('href','#osszegzes');
  const questions = page.locator('#quiz-questions fieldset');
  await expect(questions).toHaveCount(12);
  const answers = [1,0,2,1,0,2,1,0,2,1,0,2];
  for (const [index,answer] of answers.entries()) {
    await questions.nth(index).locator('input').nth(answer).check();
    await questions.nth(index).getByRole('button').click();
    await expect(questions.nth(index).locator('.feedback')).toContainText('Így van!');
  }
  await expect(page.locator('#quiz-score')).toContainText('12 helyes');
  await page.getByRole('button', {name:'Kvíz újrakezdése'}).click();
  await expect(page.locator('#quiz-score')).toContainText('0/12');
});

test.beforeEach(({page}) => page.on('pageerror', error => {throw error;}));

test('A tanuló saját képletből igazságtáblát kap és javíthatja a hibás bemenetet', async ({page}) => {
  await page.goto(chapter);
  await page.getByLabel('Vizsgált képlet').fill('p -> q');
  await page.getByRole('button', {name:'Igazságtábla készítése'}).click();
  await expect(page.locator('#truth-result tbody tr')).toHaveCount(4);
  await expect(page.locator('#truth-result tbody tr td:last-child')).toHaveText(['igaz','hamis','igaz','igaz']);
  await page.getByLabel('Vizsgált képlet').fill('p &');
  await page.getByRole('button', {name:'Igazságtábla készítése'}).click();
  await expect(page.locator('#truth-status')).toContainText('kell');
  await expect(page.locator('#truth-result table')).toHaveCount(0);
  await page.getByLabel('Vizsgált képlet').fill('p | !p');
  await page.getByRole('button', {name:'Igazságtábla készítése'}).click();
  await expect(page.locator('#truth-status')).toContainText('tautológia');
});
