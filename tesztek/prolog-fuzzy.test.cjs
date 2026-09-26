const {test} = require('node:test');
const assert = require('node:assert/strict');
const M = require('../assets/js/prolog-fuzzy.js');

const close = (actual, expected, eps = 1e-3) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≉ ${expected}`);
const kinds = (run) => run.steps.map((s) => s.kind);

test('A PDF sorrendjében az első válasz zsákutca nélkül jön, a többi válasz keresése zsákutcába fut', () => {
  const run = M.kleopatra({});
  assert.deepEqual(run.answers, ['Valaki = kleopatra']);
  assert.ok(kinds(run).indexOf('answer') < kinds(run).indexOf('fail'));
  assert.equal(kinds(run).at(-1), 'done');
  assert.match(run.steps.find((s) => s.kind === 'match').text, /Valaki = A|A = Valaki/);
});

test('Felcserélt tényeknél zsákutca és visszalépés után jön ugyanaz a válasz', () => {
  const run = M.kleopatra({reversed: true});
  assert.deepEqual(run.answers, ['Valaki = kleopatra']);
  const k = kinds(run);
  assert.ok(k.indexOf('fail') < k.indexOf('redo'), 'előbb zsákutca, aztán visszalépés');
  assert.ok(run.steps.some((s) => s.kind === 'fail' && s.text.includes('szebb(ursula, ursula)')));
});

test('A vágás felcserélt tényeknél elveszíti az egyetlen választ', () => {
  assert.deepEqual(M.kleopatra({cut: true}).answers, ['Valaki = kleopatra']);
  const run = M.kleopatra({reversed: true, cut: true});
  assert.deepEqual(run.answers, []);
  assert.ok(kinds(run).includes('cut'));
  assert.ok(!kinds(run).includes('redo'));
});

test('Harmadik ténnyel két válasz van, vágással csak az első', () => {
  assert.deepEqual(M.kleopatra({extra: true}).answers, ['Valaki = kleopatra', 'Valaki = anna']);
  assert.deepEqual(M.kleopatra({extra: true, cut: true}).answers, ['Valaki = kleopatra']);
});

test('Az általános megoldó rekurzív szabályt és listát is kezel, és korlátozza a lépésszámot', () => {
  const prog = M.parseProgram('os(X, Y) :- szulo(X, Y). os(X, Z) :- szulo(X, Y), os(Y, Z). szulo(diado, platon). szulo(platon, arisztotelesz).');
  assert.deepEqual(M.solve(prog, M.parseTerm('os(Ki, arisztotelesz)')).answers, ['Ki = platon', 'Ki = diado']);
  const loop = M.parseProgram('p(X) :- p(X).');
  assert.throws(() => M.solve(loop, M.parseTerm('p(a)'), {maxSteps: 50}), /lépés/);
  assert.throws(() => M.parseTerm('p(a'), /zárójel/);
});

test('Tagsági függvények: háromszög, trapéz, vállak, Gauss és harang', () => {
  close(M.triangle(25, 19, 25, 31), 1);
  close(M.triangle(28, 19, 25, 31), 0.5);
  close(M.trapezoid(0, 0, 0, 3, 9), 1);
  close(M.trapezoid(6, 0, 0, 3, 9), 0.5);
  close(M.trapezoid(12, 3, 9, 12, 12), 1);
  close(M.gauss(2, 0, 2), Math.exp(-0.5));
  close(M.bell(0, 2, 3, 0), 1);
  close(M.bell(2, 2, 3, 0), 0.5);
  close(M.horihorgas(200), 0.9);
  close(M.horihorgas(150), 0);
  assert.throws(() => M.shape('triangle', 1, {a: 3, b: 2, c: 4}), /sorrend/);
});

test('A PDF 136. oldalának öt hőmérsékleti halmaza lefedi a tengelyt', () => {
  for (let x = 15; x <= 55; x += 0.5) close(Object.values(M.temperature(x)).reduce((a, b) => a + b, 0), 1, 1e-9);
  const t = M.temperature(28);
  close(t.alacsony, 0.5);
  close(t.kozepes, 0.5);
});

test('A vizsgajegy-példa: minimum, levágás és három kimenet', () => {
  const r = M.exam(64, 5);
  close(r.memberships.jo, 0.7);
  close(r.memberships.ritka, 2 / 3);
  close(r.rules[0].strength, 2 / 3);
  close(r.rules[1].strength, 0.3);
  close(r.centroid, 4.2405, 2e-3);
  close(r.weighted, (5 * 2 / 3 + 4 * 0.3) / (2 / 3 + 0.3));
  assert.equal(r.maxRule.label, 'jeles');
  assert.equal(r.maxRule.peak, 5);
  const none = M.exam(95, 11);
  assert.equal(none.centroid, null);
  assert.equal(none.weighted, null);
  assert.throws(() => M.exam(120, 3), /0–100/);
});

test('A 11_Fuzzy.py termosztátja folytonos számítással 1,613 körüli', () => {
  const r = M.thermostat(16, 22);
  close(r.inputs.temperature.cold, 0.4);
  close(r.inputs.target.warm, 0.8);
  close(r.strengths.heat, 0.4);
  close(r.strengths.noChange, 0.6);
  close(r.strengths.cool, 0);
  close(r.centroid, 1.613, 2e-3);
});

test('Minden névtelen változó (_) külön változó', () => {
  const prog = M.parseProgram('t(X) :- m(X, _), m(_, X). m(a, b). m(c, a).');
  assert.deepEqual(M.solve(prog, M.parseTerm('t(X)')).answers, ['X = a']);
});
