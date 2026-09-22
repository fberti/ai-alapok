const {test,expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const chapter = 'fejezetek/06-neuralis-halozatok.html';
test.beforeEach(({page}) => page.on('pageerror',error => {throw error;}));

test('A neuron, aktivációk és háló topológiája az állítást követik',async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#neuron-result')).toContainText('0,200');
  await page.locator('#neuron-activation').selectOption('sigmoid');
  await expect(page.locator('#neuron-result')).toContainText('0,550');
  await page.locator('#activation-kind').selectOption('relu');
  await page.locator('#activation-x').fill('-1');
  await expect(page.locator('#activation-result')).toContainText('0,000');
  await expect(page.locator('#activation-plot path[data-activation]')).toHaveCount(11);
  await expect(page.locator('#activation-plot path[data-activation="relu"]')).toHaveAttribute('stroke','#bc6342');
  await page.locator('#layer-count').fill('3');
  await expect(page.locator('#layer-result')).toContainText('3 rejtett');
  await page.locator('#layer-links').selectOption('sparse');
  await expect(page.locator('#layer-result')).toContainText('Ritkított');
});

test('A szeparálhatóság, perceptron, gradiens és láncszabály követhető',async ({page}) => {
  await page.goto(chapter);
  await expect(page.locator('#boundary-result')).toContainText('4/4');
  await expect(page.locator('#boundary-plot line')).toHaveAttribute('x1','60');
  await expect(page.locator('#boundary-plot line')).toHaveAttribute('x2','240');
  await page.locator('#boundary-pattern').selectOption('xor');
  await expect(page.locator('#boundary-result')).toContainText('XOR-hoz egyetlen egyenes');
  await page.locator('#perceptron-next').click();
  await expect(page.locator('#perceptron-result')).toContainText('(0, 0, -1)');
  await expect(page.locator('#perceptron-plot line')).toHaveCount(0);
  await page.locator('#perceptron-next').click();
  await page.locator('#perceptron-next').click();
  await page.locator('#perceptron-next').click();
  await expect(page.locator('#perceptron-plot line')).toHaveCount(1);
  await expect(page.locator('#perceptron-plot circle[r="19"]')).toHaveCount(1);
  await page.locator('#perceptron-reset').click();
  await expect(page.locator('#perceptron-result')).toContainText('Induló súlyok');
  await page.locator('#gradient-rate').fill('1');
  await page.locator('#gradient-next').click();
  await expect(page.locator('#gradient-result')).toContainText('w = -1,000');
  await page.locator('#backprop-next').click();
  await expect(page.locator('#backprop-result')).toContainText('0,729');
  await expect(page.locator('#backprop-result')).toContainText('-0,180');
  await page.locator('#fit-complexity').fill('10');
  await expect(page.locator('#fit-result')).toContainText('0,780');
});

test('Közvetlen fájl, kvíz, haladás és a statikus tananyag',async ({page,browser}) => {
  await page.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
  await expect(page.locator('#quiz-questions fieldset')).toHaveCount(12);
  await page.getByRole('button',{name:'Késznek jelölöm a fejezetet'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Kész jelölés törlése'})).toHaveAttribute('aria-pressed','true');
  const noScript = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const printPage = await noScript.newPage();
    await printPage.goto(pathToFileURL(path.resolve(__dirname,'../..',chapter)).href);
    await expect(printPage.locator('.worked')).toHaveCount(3);
    await expect(printPage.locator('#gradiens')).toContainText('∂E/∂w');
    await expect(printPage.locator('#tanulas pre')).toContainText('model.evaluate(X,Y)');
    await expect(printPage.locator('#perceptron pre')).toContainText('w11 += error * x1 * alpha');
    await printPage.emulateMedia({media:'print'});
    await expect(printPage.locator('#tervezes')).toBeVisible();
  } finally {await noScript.close();}
});

test('A tanulási elemek telefonon és sötét témában sem lógnak ki',async ({page}) => {
  await page.goto(chapter);
  for (const width of [320,390,768,1365]) {
    await page.setViewportSize({width,height:844});
    for (const dark of [false,true]) {
      const toggle=page.getByRole('switch',{name:'Sötét mód'});
      if ((await toggle.getAttribute('aria-checked') === 'true') !== dark) await toggle.click();
      const spill = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(node => node.getBoundingClientRect().right > innerWidth+1).map(node => [node.tagName,node.id,node.getBoundingClientRect().right]).slice(0,15));
      expect(await page.evaluate(() => document.documentElement.scrollWidth),JSON.stringify(spill)).toBeLessThanOrEqual(width);
      const overflow = await page.locator('.comparison,.worked,.lab,.plot,.concept,.correction').evaluateAll((nodes,limit) => nodes.filter(node => {
        const box=node.getBoundingClientRect();return box.left < -1 || box.right > limit+1;
      }).map(node => node.id || node.className),width);
      expect(overflow).toEqual([]);
    }
  }
});
