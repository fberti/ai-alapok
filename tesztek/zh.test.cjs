const {test} = require('node:test');
const assert = require('node:assert/strict');
const Z = require('../assets/js/zh');
const S = require('../assets/js/search');
const close = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test('A minta-zh 4. feladata: potenciálok, kimenetek és az eltérések száma', () => {
  const t = Z.net([5, -2, -3]);
  assert.deepEqual(t.a1, [13, -7, 11]);
  assert.deepEqual(t.o2, [4, 0]);
  assert.equal(t.y, 12);
  assert.equal(t.differ, 2);
  assert.equal(Z.net([5, -2, -3], {out: 'step'}).y, 1);
  close(Z.net([5, -2, -3], {out: 'sigmoid'}).y, 0.999994, 1e-6);
});

test('A háló gyakorló változatai', () => {
  const a = Z.net([2, 3, 1]);
  assert.deepEqual([a.a1, a.a2, a.y, a.differ], [[2, 6, 12], [-8, 11], 55, 1]);
  const b = Z.net([-1, 4, 2]);
  assert.deepEqual([b.a1, b.a2, b.y, b.differ], [[-7, 7, 5], [4, -1], 12, 2]);
  const c = Z.net([1, 1, 1]);
  assert.deepEqual([c.a1, c.a2, c.y, c.differ], [[3, 5, 5], [6, -5], 18, 1]);
  // A h3 → g1 súly legfeljebb −26/11 lehet, hogy g1 kimenete 0 legyen.
  assert.ok(2 * 13 + (-26 / 11) * 11 <= 1e-9);
});

test('A minta-zh 7. feladata és a fuzzy változatok', () => {
  const zh = Z.fuzzy(23, 38);
  close(zh.mh.K, 0.4, 1e-9); close(zh.mh.M, 0.3, 1e-9); close(zh.mp.Sz, 2 / 15, 1e-9); close(zh.mp.K, 0.4, 1e-9);
  assert.deepEqual(zh.rules.map(r => Math.round(r.value * 100) / 100), [0, 0, 0.4, 0.13, 0]);
  close(zh.centroid, 55.6);
  close(Z.fuzzy(23, 38, [['M', 'K', 'M']]).centroid, 58.9);
  close(Z.fuzzy(17, 35).centroid, 40);
  close(Z.fuzzy(17, 35, [['A', 'Sz', 'NA']]).centroid, 28.95);
  close(Z.fuzzy(32, 22).centroid, 76);
  close(Z.fuzzy(8, 85).centroid, 10);
  close(Z.fuzzy(8, 85, [['A', 'N', 'A']]).centroid, 22.14);
  assert.equal(Z.fuzzy(12, 95).centroid, null);
  close(Z.fuzzy(20, 50).centroid, 50);
});

test('A minta-zh 9. feladata: egy generáció a 8 lámpán', () => {
  const pop = ['DEF', 'AE', 'ABCEG', 'AFH'].map(Z.encode);
  assert.deepEqual(pop, ['00011100', '10001000', '11101010', '10000101']);
  const g = Z.generation(pop, [[0, 2], [1, 2]], 3);
  assert.deepEqual(g.fit, [16, 15, 0, 25]);
  assert.deepEqual(g.parents, [0, 1]);
  assert.deepEqual(g.kids, ['00001000', '10011100']);
  assert.deepEqual(g.kids.map(k => Z.lamps(k).fitness), [7, 24]);
  assert.deepEqual(g.elite.map(e => e.name), ['C4', 'C6', 'C1']);
  assert.equal(g.rest[0].name, 'C2');
});

test('A lámpafeladat gyakorló változata', () => {
  const pop = ['BDFG', 'CH', 'ABEFH', 'ADG'].map(Z.encode);
  assert.deepEqual(pop, ['01010110', '00100001', '11001101', '10010010']);
  assert.deepEqual(pop.map(b => Z.lamps(b).fitness), [24, 22, 0, 21]);
  assert.equal(Z.lamps(pop[2]).bright, 38);
  assert.equal(Z.lamps(pop[2]).energy, 26);
  const g = Z.generation(pop, [[0, 2], [1, 3]], 3);
  assert.deepEqual(g.parents, [0, 1]);
  assert.deepEqual(g.kids, ['01000001', '00110110']);
  assert.deepEqual(g.kids.map(k => Z.lamps(k).fitness), [18, 28]);
  assert.deepEqual(g.elite.map(e => e.name), ['C6', 'C1', 'C2']);
  assert.deepEqual(g.rest.map(e => e.name), ['C4', 'C5', 'C3']);
  assert.deepEqual(Z.cross2(pop[0], pop[1], 2, 5), ['01100110', '00010001']);
  assert.deepEqual(Z.cross2(pop[0], pop[1], 2, 5).map(b => Z.lamps(b).fitness), [30, 16]);
  assert.equal(Z.mutate('00110110', 1), '10110110');
  assert.equal(Z.lamps('10110110').fitness, 0);
  assert.equal(Z.lamps(Z.mutate('00110110', 4)).fitness, 24);
  assert.deepEqual(Z.lamps('10100110'), {on: ['A', 'C', 'F', 'G'], energy: 20, bright: 32, fitness: 32});
  let best = 0;
  for (let i = 0; i < 256; i++) best = Math.max(best, Z.lamps(i.toString(2).padStart(8, '0')).fitness);
  assert.equal(best, 32);
});

test('Az új gyakorló gráf: az öt kereső eredménye', () => {
  const adj = S.ZH2.adj;
  const run = (strategy, heur) => S.search(adj, 'S', 'G', {strategy, heur, order: 'abc', tie: 'abc'});
  assert.deepEqual([run('dfs').path.join(''), run('dfs').cost], ['SADEG', 14]);
  assert.deepEqual([run('bfs').path.join(''), run('bfs').cost], ['SBG', 13]);
  assert.deepEqual([run('ucs').path.join(''), run('ucs').cost, run('ucs').visits], ['SCFHG', 10, 13]);
  assert.deepEqual([run('greedy', S.ZH2.heur).path.join(''), run('greedy', S.ZH2.heur).cost], ['SBG', 13]);
  const a = run('astar', S.ZH2.heur);
  assert.deepEqual([a.path.join(''), a.cost, a.visits], ['SCFHG', 10, 5]);
  const over = run('astar', {...S.ZH2.heur, F: 9});
  assert.deepEqual([over.path.join(''), over.cost], ['SBEG', 11]);
  const c = S.checkHeuristic(adj, S.ZH2.heur, 'G');
  assert.equal(c.inconsistent.length, 0);
  assert.ok(Object.keys(S.ZH2.heur).every(n => S.ZH2.heur[n] <= c.hStar[n]));
});

test('A változatgenerátor egyértelmű, megismételhető feladatokat ad', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const n = Z.netVariant(seed);
    assert.ok(n.differ >= 1);
    assert.deepEqual(Z.netVariant(seed).x, n.x);
    const f = Z.fuzzyVariant(seed);
    assert.ok(f.centroid !== null && f.centroid >= 0 && f.centroid <= 100);
    const l = Z.lampVariant(seed);
    assert.notEqual(l.parents[0], l.parents[1]);
    assert.ok(!l.tieAtCut);
    assert.equal(l.fit.filter(x => x === 0).length, 1);
  }
});
