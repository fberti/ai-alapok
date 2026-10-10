const {test} = require('node:test');
const assert = require('node:assert/strict');
const G = require('../assets/js/genetic');
const near = (actual, expected, eps = 1e-9) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≠ ${expected}`);
const P1 = [1, 3, 2, 3, 1, 3, 2, 3], P2 = [3, 1, 3, 2, 3, 1, 3, 2];

test('A véletlengenerátor ugyanabból a magból ugyanazt a sorozatot adja', () => {
  const a = G.rng(7), b = G.rng(7), c = G.rng(8);
  const sa = [a(), a(), a()], sb = [b(), b(), b()];
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, [c(), c(), c()]);
  assert.ok(sa.every(x => x >= 0 && x < 1));
});

test('A kódolási példák rátermettsége és visszafejtése helyes', () => {
  assert.equal(G.countOnes([1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1]), 4);
  const t = G.diagonalsTarget(5);
  assert.equal(t.length, 25);
  assert.equal(t.filter(b => b === 0).length, 9);
  assert.equal(G.matches(t, t), 25);
  near(G.decodeReal([1, 0, 1, 1, 0, 1, 0, 0], 0, 10), 10 * 180 / 255);
  assert.deepEqual(G.knapsack([1, 0, 0, 1, 1, 0]), {weight: 8, value: 14, fitness: 14});
  assert.equal(G.knapsack([1, 0, 0, 1, 1, 1]).fitness, 0);
  assert.equal(G.knapsack([1, 0, 1, 1, 1, 0]).fitness, 18);
});

test('A három kiválasztási mód valószínűségei egyeznek a kézi számítással', () => {
  const f = [1, 2, 3, 14];
  G.rouletteProbs(f).forEach((p, i) => near(p, [0.05, 0.1, 0.15, 0.7][i]));
  G.tournamentProbs(f).forEach((p, i) => near(p, [1, 3, 5, 7][i] / 16));
  G.linearRankProbs(f).forEach((p, i) => near(p, [0.1, 0.2, 0.3, 0.4][i]));
  G.tournamentProbs([2, 2, 5]).forEach((p, i) => near(p, [2 / 9, 2 / 9, 5 / 9][i]));
  assert.deepEqual(G.ranks([3, 1, 3, 2]), [3.5, 1, 3.5, 2]);
  G.rouletteProbs([0, 0]).forEach(p => near(p, 0.5));
  assert.throws(() => G.rouletteProbs([1, -1]));
  const fit = [2, 3, 4, 1], probs = G.rouletteProbs(fit);
  assert.deepEqual([0.55, 0.31, 0.82, 0.07].map(r => 'ABCD'[G.pick(probs, r)]), ['C', 'B', 'C', 'A']);
});

test('A PDF rangsor alapú képlete 1-re összegződik, és P < 0,5 esetén az utolsó többet kap', () => {
  const p = G.pdfRankProbs(4, 0.4);
  [0.4, 0.24, 0.144, 0.216].forEach((x, i) => near(p[i], x));
  near(p.reduce((s, x) => s + x, 0), 1);
  const q = G.pdfRankProbs(4, 0.6);
  assert.ok(q[3] < q[2]);
  assert.throws(() => G.pdfRankProbs(4, 1));
});

test('A keresztezések a PDF példáit adják', () => {
  assert.deepEqual(G.onePoint(P1, P2, 5), [[1, 3, 2, 3, 1, 1, 3, 2], [3, 1, 3, 2, 3, 3, 2, 3]]);
  assert.deepEqual(G.twoPoint(P1, P2, 3, 5), [[1, 3, 2, 2, 3, 3, 2, 3], [3, 1, 3, 3, 1, 1, 3, 2]]);
  const [a, b] = G.onePoint(P1, P2, 3);
  assert.deepEqual(G.onePoint(a, b, 5), G.twoPoint(P1, P2, 3, 5));
  const mask = [0, 1, 2, 3, 4, 5, 6, 7].map(i => [0, 1, 3, 6].includes(i));
  const [u1, u2] = G.uniform(P1, P2, mask);
  assert.deepEqual(u2, [1, 3, 3, 3, 3, 1, 2, 2]);
  assert.deepEqual(u1, [3, 1, 2, 2, 1, 3, 3, 3]);
  assert.throws(() => G.onePoint(P1, P2, 0));
});

test('Az útvonal-újrakapcsolás és a mutáció a PDF szerint működik', () => {
  const steps = G.pathRelink([1, 0, 0, 0], [0, 1, 1, 1]);
  assert.deepEqual(steps, [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0]]);
  assert.deepEqual(steps.map(s => G.hamming(s, [0, 1, 1, 1])), [3, 2, 1]);
  assert.deepEqual(G.mutate(P1, 5, 1), [1, 3, 2, 3, 1, 1, 2, 3]);
  assert.deepEqual(P1, [1, 3, 2, 3, 1, 3, 2, 3]);
});

test('A távolságok és a változatosság a kézi példával egyeznek', () => {
  const pop = ['101000', '011010', '110110', '000001'].map(s => [...s].map(Number));
  assert.deepEqual(G.diversity(pop), [10, 10, 12, 12]);
  assert.equal(G.manhattan([1, 2, 4], [3, 2, 1]), 5);
  near(G.euclidean([1, 2, 4], [3, 2, 1]), Math.sqrt(13));
});

test('A teljes genetikus algoritmus megismételhető, és megoldja a téglalapfeladatot', () => {
  const a = G.runGA({seed: 1}), b = G.runGA({seed: 1});
  assert.deepEqual(a.history.map(h => h.best), b.history.map(h => h.best));
  assert.equal(a.reason, 'megoldas');
  assert.equal(a.best.best, 12);
  assert.deepEqual(a.best.bestBits, new Array(12).fill(1));
  for (let i = 1; i < a.history.length; i++) assert.ok(a.history[i].best >= a.history[i - 1].best, 'elitizmussal a legjobb nem romlik');
  const capped = G.runGA({problem: 'atlok', maxGen: 3, seed: 2});
  assert.equal(capped.reason, 'generacio');
  assert.equal(capped.generations, 3);
  const flat = G.runGA({problem: 'atlok', pm: 0, pc: 0, plateau: 5, maxGen: 500, seed: 3});
  assert.equal(flat.reason, 'plato');
  assert.throws(() => G.runGA({problem: 'nincs'}));
});

test('A hegymászó a helyi csúcson ragad, a populáció a globálist is megtalálhatja', () => {
  const hc = G.runLandscape({mode: 'hegymaszo', generations: 200, seed: 1});
  const [x, y] = hc[hc.length - 1][0];
  assert.ok(Math.abs(G.landscape(x, y) - 0.75) < 0.01);
  const ga = G.runLandscape({seed: 3, generations: 60});
  const best = Math.max(...ga[ga.length - 1].map(([px, py]) => G.landscape(px, py)));
  assert.ok(best > 0.99);
  assert.equal(ga.length, 61);
  assert.equal(ga[0].length, 30);
});
