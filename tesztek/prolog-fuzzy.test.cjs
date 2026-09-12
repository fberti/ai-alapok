const {test} = require('node:test');
const assert = require('node:assert/strict');
const model = require('../assets/js/prolog-fuzzy');

test('A vizsgapélda a két szabályt minimumként, a kimenetet maximumként egyesíti', () => {
  const result = model.exam(65,6);
  assert.deepEqual(result.memberships, {medium:.25,good:.75,excellent:0,rare:.5,frequent:.5});
  assert.deepEqual(result.strengths, [.5,.25]);
  // Independent polygon integration: area = 5/8, first moment = 253/96.
  assert.ok(Math.abs(result.centroid - 253/60) < 1e-8);
  assert.ok(Math.abs(result.weighted - 14/3) < 1e-8);
  assert.equal(result.maximum, 4.75); // Plateau [4.5,5], mean of maxima.
  assert.equal(model.exam(0,0).centroid, null);
  assert.equal(model.exam(0,0).weighted, null);
  assert.equal(model.exam(0,0).maximum, null);
  assert.throws(() => model.exam(NaN,6));
  assert.throws(() => model.exam(50,13));
});

test('Egyetlen aktív szabály és holtverseny esetén is helyes a súlypont és a maximumhely', () => {
  const good = model.exam(50,12);
  assert.equal(good.centroid,4);
  assert.equal(good.weighted,4);
  assert.equal(good.maximum,4);
  const excellent = model.exam(70,0);
  assert.ok(Math.abs(excellent.centroid - 14/3) < 1e-10);
  assert.equal(excellent.weighted,5);
  assert.equal(excellent.maximum,5);
  const tie = model.exam(60,6);
  assert.equal(tie.maximum,4.25);
  assert.equal(tie.weighted,4.5);
  assert.ok(Math.abs(tie.centroid - 173/42) < 1e-10);
});

test('A tagsági görbék csúcsa, válla és széle a megadott paramétereket követi', () => {
  assert.equal(model.triangle(65,30,50,70), .25);
  assert.equal(model.triangle(5,4,5,5), 1);
  assert.equal(model.triangle(6,4,5,5), 0);
  assert.equal(model.trapezoid(6,0,0,3,9), .5);
  assert.equal(model.trapezoid(0,0,0,3,9), 1);
  assert.equal(model.curve('gaussian',50,50,10), 1);
  assert.ok(Math.abs(model.curve('gaussian',60,50,10) - .6065306597) < 1e-9);
  assert.equal(model.curve('triangle',60,50,10), 0);
  assert.equal(model.curve('trapezoid',55,50,10), 1);
  assert.throws(() => model.curve('gaussian',50,50,0));
});

test('Az első részcél utáni cut fordított sorrendben elvágja az egyetlen megoldást', () => {
  assert.deepEqual(model.prologTrace(false, true).answers, ['kleopatra']);
  const result = model.prologTrace(true, true);
  assert.deepEqual(result.answers, []);
  assert.equal(result.steps.filter(s => s.kind === 'match').length, 1);
  assert.ok(result.steps.findIndex(s => s.kind === 'cut') < result.steps.findIndex(s => s.kind === 'failure'));
});

test('A teljes keresés mindkét ténysorrendben Kleopátrát adja, de fordítva előbb zsákutcába jut', () => {
  const normal = model.prologTrace(false, false);
  const reversed = model.prologTrace(true, false);
  assert.deepEqual(normal.answers, ['kleopatra']);
  assert.deepEqual(reversed.answers, ['kleopatra']);
  assert.equal(reversed.steps.find(s => s.kind === 'failure').goal, 'szebb(ursula,ursula)');
  assert.ok(reversed.steps.findIndex(s => s.kind === 'failure') < reversed.steps.findIndex(s => s.kind === 'answer'));
  assert.ok(normal.steps.findIndex(s => s.kind === 'answer') < normal.steps.findIndex(s => s.kind === 'failure'));
});
