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

/* ---------- 10. fejezet: informált és lokális keresés ---------- */
const {CITY_INF, CITY_HEUR_302, CODE18} = S;
/** f = g + h értékek a front állapotaira. */
const fvals = (t, ids = t.front) => ids.map(i => t.nodes[i].cost + t.heur[t.nodes[i].state]);

test('Mohó legjobb-első keresés a PDF 302. oldalán: Miskolc, Polgár, Hatvan, Kecskemét, Szolnok', () => {
  for (const heur of [CITY_INF.heur, CITY_HEUR_302]) {
    const t = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'greedy', heur});
    assert.deepEqual(order(t), ['Miskolc', 'Polgár', 'Hatvan', 'Kecskemét', 'Szolnok']);
    assert.deepEqual(t.path, ['Miskolc', 'Hatvan', 'Kecskemét', 'Szolnok']);
    assert.equal(t.cost, 256);
    // A PDF táblázatának frontjai (a választott elem nélkül).
    assert.deepEqual(t.steps.map(s => s.front.map(i => t.nodes[i].state)), [['Polgár', 'Hatvan'], ['Hatvan', 'Debrecen'], ['Kecskemét', 'Debrecen'], ['Szolnok', 'Szeged', 'Debrecen'], ['Szeged', 'Debrecen']]);
  }
});

test('A* a PDF 304. oldalán: f-értékek 140, 228, 230, 240, 256, és az optimális 240 km', () => {
  const t = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'astar', heur: CITY_INF.heur});
  assert.deepEqual(order(t), ['Miskolc', 'Polgár', 'Hatvan', 'Debrecen', 'Szolnok']);
  assert.deepEqual(t.path, ['Miskolc', 'Polgár', 'Debrecen', 'Szolnok']);
  assert.equal(t.cost, 240);
  assert.deepEqual(t.steps.map(s => fvals(t, s.front)), [[140, 228], [228, 230], [230, 256], [240, 256], [256]]);
  assert.equal(S.hStar(CITY_INF.adj, 'Szolnok').Miskolc, 240);
  const c = S.checkHeuristic(CITY_INF.adj, CITY_INF.heur, 'Szolnok');
  assert.ok(c.admissible && c.consistent && c.goalZero);
  assert.ok(S.checkHeuristic(CITY_INF.adj, CITY_HEUR_302, 'Szolnok').admissible);
  // A 302. oldal becsléseivel is ugyanez az út.
  assert.deepEqual(S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'astar', heur: CITY_HEUR_302}).path, t.path);
  // h = 0 mellett az A* egyenletes költségű keresés.
  const zero = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'astar', heur: {}});
  const ucs = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'ucs'});
  assert.deepEqual(order(zero), order(ucs));
});

test('Minta-zh 8(b): A* ABC-döntetlennel, útellenőrzéses fakereséssel 18-at talál, mert h(W) túlbecsül', () => {
  const t = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: ZH.heur, order: 'abc', tie: 'abc'});
  assert.deepEqual(order(t), ['S', 'A', 'B', 'D', 'K', 'V', 'X', 'G']);
  assert.deepEqual(t.path, ['S', 'A', 'D', 'K', 'V', 'G']);
  assert.equal(t.cost, 18);
  assert.deepEqual(front(t), ['C₂', 'W', 'C₁', 'Y₂', 'Y₁']);
  assert.deepEqual(fvals(t), [19, 19, 29, 36, 38]);
  assert.deepEqual(t.steps.map(s => fvals(t, s.front)), [[10, 17, 38], [11, 11, 17, 38], [11, 17, 29, 38], [14, 17, 19, 29, 38], [16, 17, 19, 29, 38], [17, 18, 19, 19, 29, 38], [18, 19, 19, 29, 36, 38], [19, 19, 29, 36, 38]]);
  const c = S.checkHeuristic(ZH.adj, ZH.heur, 'G');
  assert.deepEqual(c.over, [{state: 'W', h: 4, hStar: 2}]);
  assert.deepEqual(c.inconsistent.map(e => `${e.from}>${e.to}`), ['Y>B', 'C>E', 'W>G']);
  assert.equal(c.hStar.S, 17);
  // Gráfkereséssel ugyanaz az út, a frontból kiesik a drágább C és Y.
  const g = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: ZH.heur, order: 'abc', tie: 'abc', repeats: 'graph'});
  assert.equal(g.cost, 18);
  assert.deepEqual(front(g).map(s => s[0]), ['C', 'W', 'Y']);
  // Feltáráskori célteszttel is 18.
  assert.equal(S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: ZH.heur, order: 'abc', tie: 'abc', goalTest: 'generate'}).cost, 18);
  // Javított h(W) = 2 mellett az optimális 17.
  const fixed = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: {...ZH.heur, W: 2}, order: 'abc', tie: 'abc'});
  assert.deepEqual(fixed.path, ['S', 'A', 'D', 'K', 'V', 'W', 'G']);
  assert.equal(fixed.cost, 17);
  // A mohó keresés ugyanazt a 18-as utat 6 belelépéssel.
  const gr = S.search(ZH.adj, 'S', 'G', {strategy: 'greedy', heur: ZH.heur, order: 'abc', tie: 'abc'});
  assert.deepEqual(order(gr), ['S', 'A', 'D', 'K', 'V', 'G']);
  assert.equal(gr.cost, 18);
});

test('A 18_A_csillag_algoritmus.py: h(D) = 25 túlbecsül, mégis 32; h(D) = 28 mellett 35; zárt listával 35', () => {
  const c = S.checkHeuristic(CODE18.adj, CODE18.heur, 'G');
  assert.deepEqual(c.over, [{state: 'D', h: 25, hStar: 24}]);
  assert.equal(c.inconsistent.length, 5);
  const t = S.search(CODE18.adj, 'S', 'G', {strategy: 'astar', heur: CODE18.heur});
  assert.deepEqual(t.path, ['S', 'A', 'D', 'C', 'E', 'G']);
  assert.equal(t.cost, 32);
  assert.equal(t.visits, 12);
  const bad = S.search(CODE18.adj, 'S', 'G', {strategy: 'astar', heur: {...CODE18.heur, D: 28}});
  assert.deepEqual(bad.path, ['S', 'B', 'C', 'E', 'G']);
  assert.equal(bad.cost, 35);
  const closed = S.search(CODE18.adj, 'S', 'G', {strategy: 'astar', heur: CODE18.heur, repeats: 'graph'});
  assert.equal(closed.cost, 35);
  const greedy = S.search(CODE18.adj, 'S', 'G', {strategy: 'greedy', heur: CODE18.heur});
  assert.deepEqual(greedy.path, ['S', 'B', 'C', 'F', 'G']);
  assert.equal(greedy.cost, 36);
});

test('A heurisztikás ábrák g+h=f címkét és h-értéket rajzolnak', () => {
  const t = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: ZH.heur, order: 'abc', tie: 'abc'});
  const svg = S.treeSvg(t, {heur: ZH.heur});
  assert.match(svg, /15\+4=19/);
  assert.match(svg, /18\+0=18/);
  assert.match(S.graphSvg(ZH, {heur: ZH.heur}), /class="u-gh">16</);
  assert.match(S.graphSvg(CITY_INF, {heur: CITY_INF.heur}), /h=130/);
});

test('Hegymászó: a felszín csúcsai, a fennsík és a vonzási tartományok', () => {
  const L = S.landscape;
  assert.equal(L(80), 1);
  assert.equal(L(56), 0.45);
  assert.equal(S.hillClimb(L, 0).x, 12);
  assert.equal(S.hillClimb(L, 40).x, 34);
  assert.equal(S.hillClimb(L, 70).x, 80);
  assert.equal(S.hillClimb(L, 100).x, 95);
  const p = S.hillClimb(L, 56);
  assert.equal(p.stop, 'plateau');
  assert.deepEqual(p.path, [56]);
  assert.equal(S.hillClimb(L, 12).stop, 'peak');
  let global = 0;
  for (let x = 0; x <= 100; x++) if (S.hillClimb(L, x).x === 80) global += 1;
  assert.equal(global, 28);
  const r = S.restartHill(L, {start: 12, restarts: 10, seed: 3});
  assert.equal(r.runs.length, 11);
  assert.deepEqual(S.restartHill(L, {start: 12, restarts: 10, seed: 3}), r);
});

test('Szimulált hűtés: elfogadási valószínűség, reprodukálható mag, hűtési ütemek', () => {
  assert.equal(S.acceptance(-0.1, 0.5), 1);
  assert.ok(Math.abs(S.acceptance(0.1, 0.1) - Math.exp(-1)) < 1e-12);
  assert.equal(S.acceptance(0.1, 0), 0);
  assert.ok(S.acceptance(0.2, 1) > S.acceptance(0.2, 0.1));
  const f = (x) => -S.landscape(x);
  const a = S.anneal(f, {start: 12, T0: 0.3, alpha: 0.998, seed: 1});
  const b = S.anneal(f, {start: 12, T0: 0.3, alpha: 0.998, seed: 1});
  assert.deepEqual(a.xs, b.xs);
  assert.equal(a.x, 80);
  assert.equal(a.stop, 'stable');
  // A hőmérséklet szigorúan csökken.
  assert.ok(a.Ts.every((T, i) => i === 0 || T < a.Ts[i - 1]));
  assert.ok(Math.abs(S.temperature('log', 0, 0, 1, 0) - 1) < 1e-12);
  assert.ok(S.temperature('log', 20000, 0, 1, 0) > 0.069);
  // Gyors hűtés: ritkán jut a globális csúcsra; lassú: gyakran.
  const rate = (alpha) => { let n = 0; for (let seed = 1; seed <= 100; seed++) if (Math.abs(S.anneal(f, {start: 12, T0: 0.3, alpha, seed}).x - 80) <= 4) n += 1; return n; };
  assert.ok(rate(0.95) <= 5);
  assert.ok(rate(0.999) >= 60);
  // Nulla közeli hőmérsékleten rontó lépést nem fogad el.
  const cold = S.anneal(f, {start: 12, T0: 1e-9, alpha: 0.99, seed: 5, tMin: 1e-12});
  assert.equal(cold.worseAccepted, 0);
  assert.equal(cold.x, 12);
});

test('Döntési segéd a záró összevetéshez', () => {
  assert.deepEqual(S.recommend({need: 'path', costs: 'varied', heuristic: true, memory: 'ok', optimal: true}).ids, ['astar']);
  assert.deepEqual(S.recommend({need: 'path', costs: 'varied', heuristic: true, memory: 'tight', optimal: true}).ids, ['astar', 'ida']);
  assert.deepEqual(S.recommend({need: 'path', costs: 'varied', heuristic: false, memory: 'ok', optimal: true}).ids, ['ucs']);
  assert.deepEqual(S.recommend({need: 'path', costs: 'equal', heuristic: false, memory: 'tight', optimal: true}).ids, ['ids']);
  assert.deepEqual(S.recommend({need: 'path', costs: 'varied', heuristic: true, memory: 'ok', optimal: false}).ids, ['greedy']);
  assert.equal(S.recommend({need: 'state', costs: 'equal', heuristic: false, memory: 'ok', optimal: true}).ids[0], 'sa');
});

test('Feltáráskori célteszt elfogadható becsléssel is elrontja az A* optimalitását (zh, h(W) = 2)', () => {
  const t = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: {...ZH.heur, W: 2}, order: 'abc', tie: 'abc', goalTest: 'generate'});
  assert.equal(t.cost, 18);
  assert.deepEqual(front(t), ['X', 'C₂', 'C₁', 'Y']);
});
