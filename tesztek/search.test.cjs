const {test} = require('node:test');
const assert = require('node:assert/strict');
const S = require('../assets/js/search');
const {CITY, ZH, ABSTRACT, CODE21, BINARY} = S;
/** A belelépések sorrendje állapotnevekkel. */
const order = (t) => t.steps.map(s => t.nodes[s.visit].state);
/** A front állapotai indexelt címkével. */
const front = (t, ids = t.front) => { const l = S.labels(t.nodes); return ids.map(i => S.labelText(l[i])); };

test('Szélességi keresés a PDF várospéldáján (290. oldal): feltáráskori célteszttel ugyanaz a fa', () => {
  const t = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'bfs', goalTest: 'generate'});
  assert.deepEqual(t.path, ['Budapest', 'Kecskemét', 'Szolnok', 'Debrecen']);
  assert.equal(t.cost, 240);
  assert.deepEqual(order(t), ['Budapest', 'Dunaújváros', 'Kecskemét', 'Hatvan', 'Pécs', 'Kecskemét', 'Szeged', 'Szolnok']);
  // A PDF fája 15 csomópontot rajzol: 1 + 3 + 6 + 5.
  assert.equal(t.generated, 15);
  const depthCount = [0, 0, 0, 0];
  t.nodes.forEach(n => { depthCount[n.depth] += 1; });
  assert.deepEqual(depthCount, [1, 3, 6, 5]);
  const late = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'bfs'});
  assert.deepEqual(late.path, t.path);
  assert.equal(late.visits, 15);
  assert.equal(late.generated, 20);
});

test('Egyenletes költségű keresés: a PDF táblázata (292. oldal) és a Debrecen-cél', () => {
  const t = S.search(CITY.adj, 'Budapest', 'Kecskemét', {strategy: 'ucs'});
  assert.deepEqual(order(t), ['Budapest', 'Hatvan', 'Dunaújváros', 'Kecskemét']);
  assert.deepEqual(t.path, ['Budapest', 'Kecskemét']);
  assert.equal(t.cost, 75);
  assert.deepEqual(t.steps.map(s => front(t, s.front)), [
    ['Hatvan', 'Dunaújváros', 'Kecskemét₁'],
    ['Dunaújváros', 'Kecskemét₁', 'Kecskemét₂', 'Miskolc'],
    ['Kecskemét₁', 'Pécs', 'Kecskemét₃', 'Kecskemét₂', 'Miskolc'],
    ['Pécs', 'Kecskemét₃', 'Kecskemét₂', 'Miskolc']
  ]);
  assert.deepEqual(t.steps[2].front.map(i => t.nodes[i].cost), [75, 111, 111, 131, 190]);
  const d = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'ucs'});
  assert.equal(d.cost, 240);
  assert.equal(d.visits, 17);
  const g = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'ucs', repeats: 'graph'});
  assert.equal(g.cost, 240);
  assert.ok(g.visits < d.visits);
});

test('Mélységi és mélységkorlátos keresés a várospéldán (294–295. oldal)', () => {
  const t = S.search(CITY.adj, 'Budapest', 'Szolnok', {strategy: 'dfs'});
  assert.deepEqual(t.path, ['Budapest', 'Dunaújváros', 'Kecskemét', 'Szolnok']);
  assert.equal(t.cost, 166);
  assert.deepEqual(order(t), ['Budapest', 'Dunaújváros', 'Pécs', 'Szeged', 'Kecskemét', 'Szeged', 'Szolnok']);
  assert.deepEqual(front(t), ['Kecskemét₁', 'Hatvan']);
  const opt = S.search(CITY.adj, 'Budapest', 'Szolnok', {strategy: 'ucs'});
  assert.equal(opt.cost, 130);
  const l2 = S.search(CITY.adj, 'Budapest', 'Szolnok', {strategy: 'dls', limit: 2});
  assert.deepEqual(l2.path, ['Budapest', 'Kecskemét', 'Szolnok']);
  const l1 = S.search(CITY.adj, 'Budapest', 'Szolnok', {strategy: 'dls', limit: 1});
  assert.equal(l1.found, false);
  assert.equal(l1.reason, 'cutoff');
});

test('Iteratív mélyítés: a PDF 297. oldalának számai és a várospélda', () => {
  const r = S.ids(BINARY.adj, 'gyökér', 'RLR');
  assert.deepEqual(r.iterations.map(t => t.visits), [1, 3, 7, 12]);
  assert.deepEqual(r.iterations.map(t => t.generated), [1, 3, 7, 13]);
  assert.deepEqual(r.path, ['gyökér', 'R', 'RL', 'RLR']);
  assert.equal(r.visits, 23);
  const c = S.ids(CITY.adj, 'Budapest', 'Debrecen');
  assert.equal(c.iterations.length, 4);
  assert.deepEqual(c.path, ['Budapest', 'Kecskemét', 'Szolnok', 'Debrecen']);
  const none = S.ids({A: [['B', 1]], B: []}, 'A', 'Z');
  assert.equal(none.found, false);
  assert.equal(none.reason, 'exhausted');
});

test('Minta-zh 8(a): mélységi keresés ABC-sorrenddel, mindkét célteszt-konvencióval', () => {
  const t = S.search(ZH.adj, 'S', 'G', {strategy: 'dfs', order: 'abc'});
  assert.deepEqual(t.path, ['S', 'A', 'B', 'C', 'E', 'F', 'V', 'G']);
  assert.equal(t.cost, 34);
  assert.deepEqual(front(t), ['W', 'G₂', 'G₁', 'D', 'X', 'Y']);
  assert.deepEqual(S.labelText(S.labels(t.nodes)[t.goalNode]), 'G₃');
  assert.deepEqual(t.steps.map(s => front(t, s.front)), [
    ['A', 'X', 'Y'], ['B', 'D', 'X', 'Y'], ['C', 'D', 'X', 'Y'], ['E', 'G₁', 'D', 'X', 'Y'],
    ['F', 'G₂', 'G₁', 'D', 'X', 'Y'], ['V', 'G₂', 'G₁', 'D', 'X', 'Y'], ['G₃', 'W', 'G₂', 'G₁', 'D', 'X', 'Y'], ['W', 'G₂', 'G₁', 'D', 'X', 'Y']
  ]);
  const gen = S.search(ZH.adj, 'S', 'G', {strategy: 'dfs', order: 'abc', goalTest: 'generate'});
  assert.deepEqual(gen.path, ['S', 'A', 'B', 'C', 'G']);
  assert.equal(gen.cost, 33);
  assert.deepEqual(front(gen), ['E', 'D', 'X', 'Y']);
  // Gráfkeresésnél a frontban már ott lévő G₁ miatt a későbbi G-ket nem vesszük fel: más út jön ki.
  const graph = S.search(ZH.adj, 'S', 'G', {strategy: 'dfs', order: 'abc', repeats: 'graph'});
  assert.deepEqual(graph.path, ['S', 'A', 'B', 'C', 'G']);
  assert.deepEqual(order(graph), ['S', 'A', 'B', 'C', 'E', 'F', 'V', 'W', 'G']);
  assert.deepEqual(front(graph), ['D', 'X', 'Y']);
});

test('A zh-gráf további bejárásai: szélességi, egyenletes költségű és iteratív mélyítés', () => {
  const b = S.search(ZH.adj, 'S', 'G', {strategy: 'bfs', order: 'abc'});
  assert.deepEqual(b.path, ['S', 'A', 'B', 'C', 'G']);
  assert.deepEqual(order(b), ['S', 'A', 'X', 'Y', 'B', 'D', 'Y', 'B', 'C', 'C', 'K', 'B', 'C', 'E', 'G']);
  const u = S.search(ZH.adj, 'S', 'G', {strategy: 'ucs', order: 'abc'});
  assert.deepEqual(u.path, ['S', 'A', 'D', 'K', 'V', 'W', 'G']);
  assert.equal(u.cost, 17);
  assert.deepEqual(order(u), ['S', 'X', 'A', 'B', 'D', 'C', 'K', 'E', 'V', 'F', 'W', 'G']);
  assert.deepEqual(u.front.map(i => u.nodes[i].cost), [18, 18, 18, 20, 21, 23, 23]);
  const i = S.ids(ZH.adj, 'S', 'G', {order: 'abc'});
  assert.equal(i.iterations.length, 5);
  assert.deepEqual(i.path, ['S', 'A', 'B', 'C', 'G']);
  assert.deepEqual(i.iterations.map(t => t.visits), [1, 4, 8, 13, 6]);
});

test('A 281. oldal absztrakt gráfja: a kör miatt az ismétlésszűrés nélküli mélységi keresés nem áll meg', () => {
  const p = S.search(ABSTRACT.adj, 'Start', 'Cél', {strategy: 'dfs'});
  assert.deepEqual(p.path, ['Start', 'a', 'd', 'g', 'Cél']);
  const b = S.search(ABSTRACT.adj, 'Start', 'Cél', {strategy: 'bfs', goalTest: 'generate'});
  assert.deepEqual(order(b), ['Start', 'a', 'b', 'c', 'd', 'd', 'e', 'f', 'f', 'g']);
  // Az f → Start él körbe visz: d, g, d, g … ismétlésszűrés nélkül a „g → d” kör is végtelen.
  const loop = S.search({S: [['A', 1]], A: [['B', 1]], B: [['A', 1], ['C', 1]], C: []}, 'S', 'C', {strategy: 'dfs', repeats: 'none', maxVisits: 50});
  assert.equal(loop.found, false);
  assert.equal(loop.reason, 'limit');
  const ok = S.search({S: [['A', 1]], A: [['B', 1]], B: [['A', 1], ['C', 1]], C: []}, 'S', 'C', {strategy: 'dfs'});
  assert.equal(ok.found, true);
  const r = S.ids(ABSTRACT.adj, 'Start', 'Cél');
  assert.equal(r.visits, 34);
});

test('Az oktatói kódok gráfjai: 20_ és 21_ program kimenete', () => {
  const unit = Object.fromEntries(Object.entries(CODE21.adj).map(([k, v]) => [k, v.map(([t]) => [t, 1])]));
  assert.deepEqual(S.search(unit, 'S', 'G', {strategy: 'bfs'}).path, ['S', 'A', 'D', 'G']);
  assert.deepEqual(S.search(unit, 'S', 'G', {strategy: 'dfs'}).path, ['S', 'A', 'D', 'C', 'E', 'G']);
  const u = S.search(CODE21.adj, 'S', 'G', {strategy: 'ucs'});
  assert.deepEqual(u.path, ['S', 'A', 'D', 'C', 'E', 'G']);
  assert.equal(u.cost, 32);
  assert.equal(u.visits, 14);
  assert.equal(S.search(CODE21.adj, 'S', 'G', {strategy: 'bfs'}).cost, 40);
  // Az F → C él költsége (10 vagy 8) nem befolyásolja az eredményt: F-be csak C-ből lehet jutni.
  const fixed = JSON.parse(JSON.stringify(CODE21.adj));
  fixed.F[0][1] = 8;
  const v = S.search(fixed, 'S', 'G', {strategy: 'ucs'});
  assert.deepEqual([v.path, v.cost, v.visits], [u.path, u.cost, u.visits]);
});

test('A tologatós kirakó keresőfája (298. oldal)', () => {
  const start = '1238457_6', goal = '1238_4765';
  assert.deepEqual(S.puzzleMoves(start), ['1238_5746', '12384576_', '123845_76']);
  const t = S.search(S.puzzleSpace(start, 3), start, goal, {strategy: 'bfs', goalTest: 'generate', repeats: 'none'});
  assert.equal(t.path.length, 4);
  assert.equal(t.visits, 9);
  assert.equal(t.generated, 27);
  const repeated = t.nodes.filter(n => n.state === start).length;
  assert.equal(repeated, 4);
});

test('Saját gráf beolvasása, hibajelzés és címkék', () => {
  const g = S.parseGraph('A B 3\nA -> C 1,5\n# megjegyzés\nB C\nhibás sor itt van most');
  assert.equal(g.edges, 3);
  assert.deepEqual(g.adj.A, [['B', 3], ['C', 1.5]]);
  assert.deepEqual(g.adj.B, [['C', 1]]);
  assert.equal(g.errors.length, 1);
  const u = S.parseGraph('A B 2', {undirected: true});
  assert.deepEqual(u.adj.B, [['A', 2]]);
  assert.equal(S.parseGraph('A B -1').errors.length, 1);
  assert.deepEqual(S.states({b: [['a', 1]], a: []}), ['a', 'b']);
});

test('Idő- és tárigény, valamint az amőba elágazási tényezői', () => {
  const c = S.complexity({b: 10, d: 5, m: 8, l: 5, ratio: 5});
  assert.equal(c.bfs.time, 111111);
  assert.equal(c.ids.time, 123456);
  assert.equal(c.ids.memory, 50);
  assert.equal(c.dfs.time, 1e8);
  assert.equal(c.ucs.time, 1e6);
  assert.deepEqual(S.gomoku(10, 10), {all: 399, square: 80, star: 32});
  assert.deepEqual(S.gomoku(1, 1), {all: 399, square: 24, star: 12});
});

test('Az SVG-rajzolók érvényes, kódolt szöveget adnak', () => {
  const t = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'bfs', goalTest: 'generate'});
  const svg = S.treeSvg(t, {id: 'x', title: 'Fa <teszt>', showCost: true});
  assert.match(svg, /^<svg[^>]*role="img"/);
  assert.match(svg, /Fa &lt;teszt&gt;/);
  assert.equal((svg.match(/<circle/g) || []).length, 15);
  assert.equal((svg.match(/u-tnode-goal/g) || []).length, 1);
  const part = S.treeSvg(t, {step: 1});
  assert.equal((part.match(/<circle/g) || []).length, 4);
  const map = S.graphSvg(ZH, {id: 'zh'});
  assert.equal((map.match(/<circle/g) || []).length, 13);
  assert.equal((map.match(/marker-end/g) || []).length, 19);
  assert.equal(S.snapshot(t, 0).front.length, 1);
});
