const {test} = require('node:test');
const assert = require('node:assert/strict');
const model = require('../assets/js/complexity');
const near = (actual, expected, eps = 1e-9) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≠ ${expected}`);

test('A növekedési verseny lépésszámai és idői helyesek', () => {
  const g = model.growth(10);
  assert.deepEqual([g.n, g.square, g.exponential, g.factorial], [10, 100, 1024, 3628800]);
  assert.equal(model.growth(20).factorial, 2432902008176640000);
  assert.equal(model.humanTime(5e-10), 'kevesebb mint 1 µs');
  assert.equal(model.humanTime(0.0036288), '3,6 ms');
  assert.equal(model.humanTime(90), '1,5 perc');
  assert.equal(model.humanTime(2 * 86400), '2 nap');
  assert.equal(model.humanTime(3.15576e7 * 36.6), '36,6 év');
  assert.equal(model.humanTime(3.15576e7 * 2.5e9), '2,5 milliárd év');
  assert.match(model.humanTime(3.15576e7 * 1e30), /^1,0 · 10\^30 év$/);
  assert.throws(() => model.growth(-1));
});

test('Az áramkör topologikus sorrendben, lineárisan kiértékelhető', () => {
  const circuit = [
    {id: 'x', op: 'IN'}, {id: 'y', op: 'IN'}, {id: 'z', op: 'IN'},
    {id: 'g3', op: 'OR', in: ['g1', 'g2']},
    {id: 'g1', op: 'AND', in: ['x', 'y']},
    {id: 'g2', op: 'NOT', in: ['z']}
  ];
  const r = model.evalCircuit(circuit, {x: 1, y: 0, z: 1});
  assert.equal(r.output, 0);
  assert.deepEqual(r.order.slice(-1), ['g3']);
  assert.ok(r.order.indexOf('g1') < r.order.indexOf('g3') && r.order.indexOf('g2') < r.order.indexOf('g3'));
  assert.equal(model.evalCircuit(circuit, {x: 1, y: 1, z: 1}).output, 1);
  assert.throws(() => model.evalCircuit([{id: 'a', op: 'NOT', in: ['b']}, {id: 'b', op: 'NOT', in: ['a']}], {}), /kör/);
});

test('A 3SUM két mutatóval megtalálja a nulla összegű hármast', () => {
  const r = model.threeSum([8, -25, 4, 10, -10, 3, 15]);
  assert.deepEqual(r.triple, [-25, 10, 15]);
  assert.ok(r.steps > 0 && r.steps <= 7 * 7);
  assert.equal(model.threeSum([1, 2, 3, -1]).triple, null);
  assert.deepEqual(model.kSum([2, 7, -5, 1, -6, 9], 4).sort((a, b) => a - b), [-6, -5, 2, 9]);
  assert.equal(model.kSum([1, 2, 3], 2), null);
});

test('A hozzárendelés a legolcsóbb teljes párosítást adja', () => {
  const r = model.assignment([[9, 2, 7], [6, 4, 3], [5, 8, 1]]);
  assert.deepEqual(r.match, [1, 0, 2]);
  assert.equal(r.cost, 9);
  assert.equal(model.assignment([[4, 1, 3], [2, 0, 5]]).cost, 3);
});

test('Az élfedés, az elemmegkülönböztetés és a nyelvüresség könnyen eldönthető', () => {
  const edges = [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['b', 'e']];
  assert.equal(model.isEdgeCover(['a', 'b', 'c', 'd', 'e'], edges, [0, 2, 3]), true);
  assert.equal(model.isEdgeCover(['a', 'b', 'c', 'd', 'e'], edges, [0, 2]), false);
  assert.equal(model.minEdgeCover(['a', 'b', 'c', 'd', 'e'], edges).length, 3);
  assert.equal(model.minEdgeCover(['a', 'b', 'z'], [['a', 'b']]), null);
  assert.deepEqual(model.distinct([4, 9, 1, 7]), {distinct: true, duplicate: null});
  assert.deepEqual(model.distinct([4, 9, 1, 9, 7]), {distinct: false, duplicate: 9});
  const dfa = {start: 'q0', accept: ['q3'], edges: [['q0', 'a', 'q1'], ['q1', 'b', 'q0'], ['q2', 'a', 'q3']]};
  assert.equal(model.languageEmpty(dfa).empty, true);
  assert.deepEqual(model.languageEmpty(dfa).reachable.sort(), ['q0', 'q1']);
  const r = model.languageEmpty({...dfa, edges: [...dfa.edges, ['q1', 'a', 'q2']]});
  assert.equal(r.empty, false);
  assert.equal(r.witness, 'aaa');
});

test('A leghosszabb közös részsorozat dinamikus programozással', () => {
  const r = model.lcs('ABCBDAB', 'BDCABA');
  assert.equal(r.length, 4);
  assert.equal(r.sequence.length, 4);
  assert.equal(r.table.length, 8);
  assert.equal(r.table[7][6], 4);
  assert.equal(model.lcs('KUTYA', 'MACSKA').sequence, 'KA');
  assert.equal(model.lcs('ALMAFA', 'BALATON').sequence, 'ALA');
});

test('A SAT-formula kiértékelése, nyers erős keresés és Max-SAT', () => {
  const pdf = [[1, 1, 2], [-1, -2, -2], [-1, 2, 2]];
  assert.deepEqual(model.evalCnf(pdf, [false, true]).satisfied, [true, true, true]);
  const rows = model.bruteForceSat(pdf, 2);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.filter(r => r.ok).map(r => r.assignment), [[false, true]]);
  const unsat = [[1, 2], [1, -2], [-1, 2], [-1, -2]];
  assert.equal(model.bruteForceSat(unsat, 2).some(r => r.ok), false);
  assert.equal(model.maxSat(unsat, 2).best, 3);
  assert.throws(() => model.evalCnf([[3]], [true]));
});

test('Klikk, csúcsfedés és Hamilton-út ellenőrzése és kimerítő keresése', () => {
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const edges = [['A', 'B'], ['A', 'D'], ['A', 'E'], ['B', 'D'], ['B', 'E'], ['D', 'E'], ['B', 'C'], ['C', 'E'], ['C', 'F'], ['E', 'F'], ['D', 'G'], ['E', 'G'], ['F', 'G']];
  assert.equal(model.isClique(edges, ['A', 'B', 'D', 'E']), true);
  assert.equal(model.isClique(edges, ['A', 'B', 'C']), false);
  assert.deepEqual(model.maxClique(nodes, edges), ['A', 'B', 'D', 'E']);
  assert.equal(model.isVertexCover(edges, ['B', 'D', 'E', 'F']), true);
  assert.equal(model.isVertexCover(edges, ['B', 'D', 'E']), false);
  assert.deepEqual(model.minVertexCover(nodes, edges), ['B', 'D', 'E', 'F']);
  assert.deepEqual(model.checkPath(nodes, edges, ['A', 'B', 'C', 'F', 'G', 'D', 'E']), {ok: true, missing: [], badStep: null, cycle: true});
  assert.equal(model.checkPath(nodes, edges, ['A', 'C']).badStep, 0);
  const found = model.findHamiltonPath(nodes, edges);
  assert.equal(model.checkPath(nodes, edges, found).ok, true);
  assert.equal(model.findHamiltonPath(['a', 'b', 'c', 'd'], [['a', 'b'], ['a', 'c'], ['a', 'd']]), null);
});

test('Hátizsák: a PDF példája és a kurzus kódjának elemei', () => {
  const pdf = [{w: 12, v: 4}, {w: 2, v: 2}, {w: 1, v: 2}, {w: 1, v: 1}, {w: 4, v: 10}];
  assert.deepEqual(model.knapsackTotals(pdf, [0, 1, 1, 1, 1], 15), {weight: 8, value: 15, ok: true});
  assert.equal(model.knapsackTotals(pdf, [1, 0, 0, 0, 1], 15).ok, false);
  assert.deepEqual(model.knapsack01(pdf, 15), {value: 15, take: [0, 1, 1, 1, 1]});
  assert.equal(model.knapsackUnbounded(pdf, 15).value, 36);
  const code = [[1, 2], [2, 3], [2, 4], [4, 5], [3, 7], [6, 9]].map(([w, v]) => ({w, v}));
  assert.equal(model.knapsackTotals(code, [1, 0, 0, 1, 1, 0], 10).value, 14);
  assert.deepEqual(model.knapsack01(code, 10), {value: 18, take: [1, 0, 1, 1, 1, 0]});
});

test('Rekeszpakolás: terhelés, alsó korlát és első illesztés', () => {
  const sizes = [2, 5, 4, 7, 1, 3, 8];
  assert.equal(model.binLowerBound(sizes, 10), 3);
  assert.equal(model.firstFit(sizes, 10).bins.length, 4);
  const ffd = model.firstFit(sizes, 10, true);
  assert.equal(ffd.bins.length, 3);
  assert.deepEqual(ffd.bins.map(b => b.reduce((a, i) => a + sizes[i], 0)), [10, 10, 10]);
  const loads = model.binLoads(sizes, [0, 1, 1, 2, 1, 2, 0], 10);
  assert.deepEqual(loads.loads, [10, 10, 10]);
  assert.equal(loads.ok, true);
  assert.equal(model.binLoads(sizes, [0, 0, 0, 1, 1, 2, 2], 10).ok, false);
  assert.equal(model.binLoads(sizes, [0, 0, 1, 1, null, 2, 2], 10).complete, false);
});

test('Utazóügynök: a PDF két ábrája, a legközelebbi szomszéd és a döntési változat', () => {
  const pts = [[1, 1], [4, 2], [5, 2], [6, 4], [4, 4], [3, 6], [1, 5], [2, 3]];
  const d = model.euclidean(pts);
  const best = model.tspBruteForce(d);
  near(best.length, model.tourLength(d, [0, 7, 6, 5, 4, 3, 2, 1]));
  near(best.length, 17.342617547667327, 1e-9);
  const nn = model.nearestNeighbour(d, 0);
  assert.deepEqual(nn.tour, [0, 7, 1, 2, 3, 4, 5, 6]);
  near(nn.length, 18.18033988749895, 1e-9);
  const yes = model.tspDecision(d, [0, 7, 6, 5, 4, 3, 2, 1], 18);
  assert.equal(yes.valid && yes.yes, true);
  near(yes.length, best.length);
  assert.equal(model.tspDecision(d, [0, 7, 6, 5, 4, 3, 2, 1], 17).yes, false);
  assert.equal(model.tspDecision(d, [0, 7, 6, 5], 18).valid, false);
  const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const g = model.graphDistances(names, [['a', 'b', 12], ['a', 'c', 10], ['a', 'g', 12], ['b', 'c', 8], ['b', 'd', 12], ['c', 'd', 11], ['c', 'e', 3], ['c', 'g', 9], ['d', 'e', 11], ['d', 'f', 10], ['e', 'f', 6], ['e', 'g', 7], ['g', 'f', 9]]);
  const opt = model.tspBruteForce(g);
  assert.equal(opt.length, 63);
  assert.equal(opt.tour.map(i => names[i]).join(''), 'abdfgec');
  assert.equal(opt.checked, 720);
});

test('Metrikus k-középpont, flow shop és háromdimenziós párosítás', () => {
  const pts = [[0, 0], [1, 0], [0, 1], [8, 8], [9, 8], [8, 9]];
  const d = model.euclidean(pts);
  near(model.kCenterRadius(d, [0, 3]), 1);
  near(model.kCenterRadius(d, [1, 4]), Math.SQRT2);
  near(model.bestKCenter(d, 2).radius, 1);
  const times = [[3, 2, 2], [2, 4, 1], [2, 2, 3]];
  assert.equal(model.flowShopMakespan(times, [0, 1, 2]), 14);
  assert.deepEqual(model.bestFlowShop(times), {order: [0, 2, 1], makespan: 12});
  const triples = [['x1', 'y1', 'z1'], ['x1', 'y2', 'z2'], ['x2', 'y2', 'z1'], ['x2', 'y1', 'z2']];
  assert.equal(model.isMatching3D(triples, [0, 1]), false);
  assert.equal(model.isMatching3D(triples, [0, 3]), false);
  assert.equal(model.isMatching3D(triples, [1, 2]), false);
  assert.equal(model.isMatching3D([['x1', 'y1', 'z1'], ['x2', 'y2', 'z2']], [0, 1]), true);
});

test('Leghosszabb út és faktorizálás döntési változata', () => {
  const nodes = ['a', 'b', 'c', 'd'];
  const edges = [['a', 'b'], ['b', 'c'], ['c', 'a'], ['c', 'd']];
  assert.equal(model.longestPath(nodes, edges).length, 3);
  assert.deepEqual(model.hasFactorBelow(91, 10), {yes: true, factor: 7});
  assert.deepEqual(model.hasFactorBelow(91, 7), {yes: false, factor: null});
  assert.deepEqual(model.hasFactorBelow(97, 97), {yes: false, factor: null});
  assert.deepEqual(model.hasFactorBelow(7, 10), {yes: true, factor: 7});
  assert.deepEqual(model.hasFactorBelow(1, 10), {yes: false, factor: null});
});
