const CourseComplexity = (() => {
  /* ---------- Növekedés ---------- */
  /** @param {number} n */
  function factorial(n) { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }
  /** Lépésszámok egy n méretű bemenetre. @param {number} n */
  function growth(n) {
    if (!Number.isInteger(n) || n < 0) throw Error('Az n nemnegatív egész legyen.');
    return {n, square:n*n, exponential:2**n, factorial:factorial(n)};
  }
  /** @param {number} x @param {number} [digits] */
  const hu = (x, digits = 1) => x.toFixed(digits).replace('.', ',');
  /** Emberi időegység, ha a gép másodpercenként egymilliárd lépést tesz. @param {number} seconds */
  function humanTime(seconds) {
    const year = 3.15576e7;
    if (seconds < 1e-6) return 'kevesebb mint 1 µs';
    if (seconds < 1e-3) return `${hu(seconds*1e6)} µs`;
    if (seconds < 1) return `${hu(seconds*1e3)} ms`;
    if (seconds < 60) return `${hu(seconds)} s`;
    if (seconds < 3600) return `${hu(seconds/60)} perc`;
    if (seconds < 86400) return `${hu(seconds/3600)} óra`;
    if (seconds < year) { const d = seconds/86400; return `${Number.isInteger(d) ? d : hu(d)} nap`; }
    const y = seconds/year;
    if (y < 1e6) return `${hu(y)} év`;
    if (y < 1e9) return `${hu(y/1e6)} millió év`;
    if (y < 1e12) return `${hu(y/1e9)} milliárd év`;
    const e = Math.floor(Math.log10(y));
    return `${hu(y/10**e)} · 10^${e} év`;
  }

  /* ---------- P-beli problémák ---------- */
  /** @typedef {{id:string, op:'IN'|'AND'|'OR'|'NOT', in?:string[]}} Gate */
  /** Áramkörérték: topologikus sorrend (Kahn), majd kiértékelés. @param {Gate[]} gates @param {Record<string, number>} inputs */
  function evalCircuit(gates, inputs) {
    const byId = new Map(gates.map(g => [g.id, g]));
    const indeg = new Map(gates.map(g => [g.id, (g.in || []).length]));
    /** @type {Map<string, string[]>} */
    const users = new Map(gates.map(g => [g.id, []]));
    gates.forEach(g => (g.in || []).forEach(s => { const u = users.get(s); if (!u) throw Error(`Ismeretlen bemenet: ${s}`); u.push(g.id); }));
    const queue = gates.filter(g => indeg.get(g.id) === 0).map(g => g.id), order = [];
    while (queue.length) {
      const id = /** @type {string} */ (queue.shift());
      order.push(id);
      for (const u of users.get(id) || []) { indeg.set(u, (indeg.get(u) || 0) - 1); if (indeg.get(u) === 0) queue.push(u); }
    }
    if (order.length !== gates.length) throw Error('Az áramkörben kör van, nincs topologikus sorrend.');
    /** @type {Record<string, number>} */
    const values = {};
    for (const id of order) {
      const g = /** @type {Gate} */ (byId.get(id)), a = (g.in || []).map(s => values[s]);
      values[id] = g.op === 'IN' ? (inputs[id] ? 1 : 0) : g.op === 'NOT' ? 1 - a[0] : g.op === 'AND' ? Number(a.every(Boolean)) : Number(a.some(Boolean));
    }
    return {order, values, output:values[order[order.length - 1]]};
  }
  /** 3SUM rendezéssel és két mutatóval, O(n²). @param {number[]} list */
  function threeSum(list) {
    const a = [...list].sort((x, y) => x - y);
    let steps = 0;
    for (let i = 0; i < a.length - 2; i++) {
      let lo = i + 1, hi = a.length - 1;
      while (lo < hi) {
        steps++;
        const s = a[i] + a[lo] + a[hi];
        if (s === 0) return {triple:[a[i], a[lo], a[hi]], steps};
        if (s < 0) lo++; else hi--;
      }
    }
    return {triple:null, steps};
  }
  /** k-SUM kimerítő kereséssel (kis példákhoz). @param {number[]} list @param {number} k @returns {number[]|null} */
  function kSum(list, k, start = 0, target = 0) {
    if (k === 0) return target === 0 ? [] : null;
    for (let i = start; i < list.length; i++) {
      const rest = kSum(list, k - 1, i + 1, target - list[i]);
      if (rest) return [list[i], ...rest];
    }
    return null;
  }
  /** Minden lehetséges sorrend. @param {number[]} items @returns {number[][]} */
  function permutations(items) {
    if (items.length <= 1) return [items];
    return items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(p => [x, ...p]));
  }
  /** Hozzárendelés: ügynök × feladat költségmátrix, legfeljebb egy feladat ügynökönként.
   * A kis példákhoz kimerítő keresés; a gyakorlatban a magyar módszer O(n³). @param {number[][]} cost */
  function assignment(cost) {
    const tasks = cost[0].length;
    if (cost.length > tasks) throw Error('Több ügynök, mint feladat: fordítsd meg a mátrixot.');
    let best = {match:/** @type {number[]} */ ([]), cost:Infinity};
    for (const p of permutations([...Array(tasks).keys()])) {
      const match = p.slice(0, cost.length), c = match.reduce((s, t, i) => s + cost[i][t], 0);
      if (c < best.cost) best = {match, cost:c};
    }
    return best;
  }
  /** @param {string[]} nodes @param {string[][]} edges @param {number[]} chosen élindexek */
  function isEdgeCover(nodes, edges, chosen) {
    const covered = new Set(chosen.flatMap(i => edges[i]));
    return nodes.every(v => covered.has(v));
  }
  /** Legkisebb élfedés kimerítő kereséssel; elszigetelt pontnál nincs. @param {string[]} nodes @param {string[][]} edges */
  function minEdgeCover(nodes, edges) {
    if (!isEdgeCover(nodes, edges, edges.map((_, i) => i))) return null;
    for (let k = 1; k <= edges.length; k++) for (const c of combinations(edges.length, k)) if (isEdgeCover(nodes, edges, c)) return c;
    return null;
  }
  /** Minden k elemű indexhalmaz lexikografikus sorrendben. @param {number} n @param {number} k @returns {number[][]} */
  function combinations(n, k, start = 0) {
    if (k === 0) return [[]];
    const out = [];
    for (let i = start; i <= n - k; i++) for (const rest of combinations(n, k - 1, i + 1)) out.push([i, ...rest]);
    return out;
  }
  /** Elemmegkülönböztetés halmazzal, várhatóan lineáris időben. @param {unknown[]} list */
  function distinct(list) {
    const seen = new Set();
    for (const x of list) { if (seen.has(x)) return {distinct:false, duplicate:x}; seen.add(x); }
    return {distinct:true, duplicate:null};
  }
  /** Nyelvüresség: elérhető-e elfogadó állapot a kezdőből (szélességi bejárás).
   * @param {{start:string, accept:string[], edges:string[][]}} dfa */
  function languageEmpty(dfa) {
    /** @type {Map<string, string>} */
    const word = new Map([[dfa.start, '']]), queue = [dfa.start];
    while (queue.length) {
      const q = /** @type {string} */ (queue.shift());
      if (dfa.accept.includes(q)) return {empty:false, witness:word.get(q), reachable:[...word.keys()]};
      for (const [from, sym, to] of dfa.edges) if (from === q && !word.has(to)) { word.set(to, word.get(q) + sym); queue.push(to); }
    }
    return {empty:true, witness:null, reachable:[...word.keys()]};
  }
  /** Leghosszabb közös részsorozat két sorozatra, dinamikus programozással. @param {string} a @param {string} b */
  function lcs(a, b) {
    const t = Array.from({length:a.length + 1}, () => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      t[i][j] = a[i-1] === b[j-1] ? t[i-1][j-1] + 1 : Math.max(t[i-1][j], t[i][j-1]);
    let i = a.length, j = b.length, seq = '';
    while (i && j) {
      if (a[i-1] === b[j-1]) { seq = a[i-1] + seq; i--; j--; }
      else if (t[i-1][j] >= t[i][j-1]) i--; else j--;
    }
    return {length:t[a.length][b.length], sequence:seq, table:t};
  }

  /* ---------- SAT ---------- */
  /** Klóz: literálok listája, +i az i. változó, −i a tagadása (1-től számozva).
   * @param {number[][]} clauses @param {boolean[]} assignment */
  function evalCnf(clauses, assignment) {
    const satisfied = clauses.map(c => c.some(l => {
      const v = assignment[Math.abs(l) - 1];
      if (v === undefined) throw Error(`Nincs értéke a ${Math.abs(l)}. változónak.`);
      return l > 0 ? v : !v;
    }));
    return {satisfied, count:satisfied.filter(Boolean).length, value:satisfied.every(Boolean)};
  }
  /** Mind a 2ⁿ behelyettesítés, az igazságtábla sorrendjében. @param {number[][]} clauses @param {number} n */
  function bruteForceSat(clauses, n) {
    return Array.from({length:2**n}, (_, r) => {
      const assignment = Array.from({length:n}, (_, i) => Boolean((r >> (n - 1 - i)) & 1));
      const e = evalCnf(clauses, assignment);
      return {assignment, count:e.count, ok:e.value};
    });
  }
  /** @param {number[][]} clauses @param {number} n */
  function maxSat(clauses, n) {
    const rows = bruteForceSat(clauses, n), best = Math.max(...rows.map(r => r.count));
    return {best, assignment:/** @type {{assignment:boolean[]}} */ (rows.find(r => r.count === best)).assignment};
  }

  /* ---------- Gráfok ---------- */
  /** @param {string[][]} edges */
  const adjacency = edges => { const s = new Set(); edges.forEach(([u, v]) => { s.add(`${u}|${v}`); s.add(`${v}|${u}`); }); return s; };
  /** @param {string[][]} edges @param {string[]} set */
  function isClique(edges, set) {
    const adj = adjacency(edges);
    return set.every((u, i) => set.slice(i + 1).every(v => adj.has(`${u}|${v}`)));
  }
  /** @param {string[][]} edges @param {string[]} set */
  const isVertexCover = (edges, set) => edges.every(([u, v]) => set.includes(u) || set.includes(v));
  /** @param {string[]} nodes @param {string[][]} edges */
  function maxClique(nodes, edges) {
    for (let k = nodes.length; k > 0; k--) for (const c of combinations(nodes.length, k)) { const s = c.map(i => nodes[i]); if (isClique(edges, s)) return s; }
    return [];
  }
  /** @param {string[]} nodes @param {string[][]} edges */
  function minVertexCover(nodes, edges) {
    for (let k = 0; k <= nodes.length; k++) for (const c of combinations(nodes.length, k)) { const s = c.map(i => nodes[i]); if (isVertexCover(edges, s)) return s; }
    return nodes;
  }
  /** Hamilton-út ellenőrzése: badStep az első hiányzó él indexe. @param {string[]} nodes @param {string[][]} edges @param {string[]} path */
  function checkPath(nodes, edges, path) {
    const adj = adjacency(edges);
    let badStep = null;
    for (let i = 0; i + 1 < path.length; i++) if (!adj.has(`${path[i]}|${path[i+1]}`)) { badStep = i; break; }
    const missing = nodes.filter(v => !path.includes(v)), repeated = new Set(path).size !== path.length;
    const ok = badStep === null && !missing.length && !repeated;
    return {ok, missing, badStep, cycle:ok && adj.has(`${path[path.length-1]}|${path[0]}`)};
  }
  /** Visszalépéses keresés. @param {string[]} nodes @param {string[][]} edges @returns {string[]|null} */
  function findHamiltonPath(nodes, edges) {
    const adj = adjacency(edges);
    /** @param {string[]} path @returns {string[]|null} */
    const extend = path => {
      if (path.length === nodes.length) return path;
      for (const v of nodes) if (!path.includes(v) && adj.has(`${path[path.length-1]}|${v}`)) { const r = extend([...path, v]); if (r) return r; }
      return null;
    };
    for (const s of nodes) { const r = extend([s]); if (r) return r; }
    return null;
  }
  /** Leghosszabb egyszerű út (élszám) kimerítő kereséssel. @param {string[]} nodes @param {string[][]} edges */
  function longestPath(nodes, edges) {
    const adj = adjacency(edges);
    let best = /** @type {string[]} */ ([]);
    /** @param {string[]} path */
    const walk = path => {
      if (path.length > best.length) best = path;
      for (const v of nodes) if (!path.includes(v) && adj.has(`${path[path.length-1]}|${v}`)) walk([...path, v]);
    };
    nodes.forEach(s => walk([s]));
    return {length:Math.max(0, best.length - 1), path:best};
  }

  /* ---------- Hátizsák és rekeszpakolás ---------- */
  /** @typedef {{w:number, v:number}} Item */
  /** @param {Item[]} items @param {number[]} counts @param {number} cap */
  function knapsackTotals(items, counts, cap) {
    const weight = items.reduce((s, it, i) => s + it.w*(counts[i] || 0), 0), value = items.reduce((s, it, i) => s + it.v*(counts[i] || 0), 0);
    return {weight, value, ok:weight <= cap};
  }
  /** 0/1 hátizsák dinamikus programozással, O(n·W). @param {Item[]} items @param {number} cap */
  function knapsack01(items, cap) {
    const t = Array.from({length:items.length + 1}, () => Array(cap + 1).fill(0));
    items.forEach((it, i) => { for (let c = 0; c <= cap; c++) t[i+1][c] = Math.max(t[i][c], it.w <= c ? t[i][c - it.w] + it.v : -Infinity); });
    const take = Array(items.length).fill(0);
    for (let i = items.length, c = cap; i > 0; i--) if (t[i][c] !== t[i-1][c]) { take[i-1] = 1; c -= items[i-1].w; }
    return {value:t[items.length][cap], take};
  }
  /** Korlátlan darabszámú változat (a PDF „darabszám” megfogalmazása). @param {Item[]} items @param {number} cap */
  function knapsackUnbounded(items, cap) {
    const best = Array(cap + 1).fill(0), pick = Array(cap + 1).fill(-1);
    for (let c = 1; c <= cap; c++) { best[c] = best[c-1]; items.forEach((it, i) => { if (it.w <= c && best[c - it.w] + it.v > best[c]) { best[c] = best[c - it.w] + it.v; pick[c] = i; } }); }
    const counts = Array(items.length).fill(0);
    for (let c = cap; c > 0;) { if (pick[c] < 0) c--; else { counts[pick[c]]++; c -= items[pick[c]].w; } }
    return {value:best[cap], counts};
  }
  /** @param {number[]} sizes @param {(number|null)[]} bins melyik rekeszbe került a tétel @param {number} cap */
  function binLoads(sizes, bins, cap) {
    const used = Math.max(0, ...bins.map(b => b === null ? -1 : b)) + 1, loads = Array(used).fill(0);
    bins.forEach((b, i) => { if (b !== null) loads[b] += sizes[i]; });
    const complete = bins.every(b => b !== null), fits = loads.every(l => l <= cap);
    return {loads, used:loads.filter(l => l > 0).length, complete, fits, ok:complete && fits};
  }
  /** @param {number[]} sizes @param {number} cap */
  const binLowerBound = (sizes, cap) => Math.ceil(sizes.reduce((a, b) => a + b, 0)/cap);
  /** Első illesztés; decreasing esetén előbb csökkenő sorrendbe rendez. @param {number[]} sizes @param {number} cap */
  function firstFit(sizes, cap, decreasing = false) {
    const order = sizes.map((_, i) => i);
    if (decreasing) order.sort((a, b) => sizes[b] - sizes[a]);
    /** @type {number[][]} */
    const bins = [], loads = [];
    for (const i of order) {
      const b = loads.findIndex(l => l + sizes[i] <= cap);
      if (b < 0) { bins.push([i]); loads.push(sizes[i]); } else { bins[b].push(i); loads[b] += sizes[i]; }
    }
    return {bins, loads};
  }

  /* ---------- Utazóügynök ---------- */
  /** @param {number[][]} pts */
  const euclidean = pts => pts.map(p => pts.map(q => Math.hypot(p[0] - q[0], p[1] - q[1])));
  /** Súlyozott gráf távolságmátrixa, hiányzó élnél Infinity. @param {string[]} names @param {[string, string, number][]} edges */
  function graphDistances(names, edges) {
    const d = names.map((_, i) => names.map((_, j) => i === j ? 0 : Infinity));
    edges.forEach(([u, v, w]) => { const i = names.indexOf(u), j = names.indexOf(v); d[i][j] = d[j][i] = w; });
    return d;
  }
  /** Zárt körút hossza. @param {number[][]} d @param {number[]} tour */
  const tourLength = (d, tour) => tour.reduce((s, c, i) => s + d[c][tour[(i + 1) % tour.length]], 0);
  /** Kimerítő keresés a 0. városból, (n−1)! körút. @param {number[][]} d */
  function tspBruteForce(d) {
    let best = {tour:/** @type {number[]} */ ([]), length:Infinity}, checked = 0;
    for (const p of permutations([...Array(d.length).keys()].slice(1))) {
      checked++;
      const tour = [0, ...p], length = tourLength(d, tour);
      if (length < best.length - 1e-12) best = {tour, length};
    }
    return {...best, checked};
  }
  /** Mohó heurisztika: mindig a legközelebbi még nem látott város. @param {number[][]} d @param {number} start */
  function nearestNeighbour(d, start) {
    const tour = [start];
    while (tour.length < d.length) {
      const c = tour[tour.length - 1];
      let next = -1;
      d[c].forEach((x, j) => { if (!tour.includes(j) && (next < 0 || x < d[c][next])) next = j; });
      tour.push(next);
    }
    return {tour, length:tourLength(d, tour)};
  }
  /** Döntési változat: a tanú körút érvényes-e, és rövidebb-e k-nál. Polinomiális ellenőrzés.
   * @param {number[][]} d @param {number[]} tour @param {number} k */
  function tspDecision(d, tour, k) {
    const valid = tour.length === d.length && new Set(tour).size === d.length;
    const length = valid ? tourLength(d, tour) : NaN;
    return {valid, length, yes:valid && length < k};
  }

  /* ---------- További NP-nehéz feladatok ---------- */
  /** A legtávolabbi város távolsága a legközelebbi raktártól. @param {number[][]} d @param {number[]} centers */
  const kCenterRadius = (d, centers) => Math.max(...d.map(row => Math.min(...centers.map(c => row[c]))));
  /** @param {number[][]} d @param {number} k */
  function bestKCenter(d, k) {
    let best = {centers:/** @type {number[]} */ ([]), radius:Infinity};
    for (const c of combinations(d.length, k)) { const r = kCenterRadius(d, c); if (r < best.radius) best = {centers:c, radius:r}; }
    return best;
  }
  /** Permutációs flow shop: minden munka ugyanabban a gépsorrendben halad. times[munka][gép]. @param {number[][]} times @param {number[]} order */
  function flowShopMakespan(times, order) {
    const done = Array(times[0].length).fill(0);
    for (const j of order) times[j].forEach((t, m) => { done[m] = Math.max(done[m], m ? done[m-1] : 0) + t; });
    return done[done.length - 1];
  }
  /** @param {number[][]} times */
  function bestFlowShop(times) {
    let best = {order:/** @type {number[]} */ ([]), makespan:Infinity};
    for (const order of permutations([...times.keys()])) { const m = flowShopMakespan(times, order); if (m < best.makespan) best = {order, makespan:m}; }
    return best;
  }
  /** Páronként minden koordinátában különböző hármasok. @param {string[][]} triples @param {number[]} chosen */
  function isMatching3D(triples, chosen) {
    return [0, 1, 2].every(dim => new Set(chosen.map(i => triples[i][dim])).size === chosen.length);
  }
  /** Van-e 1 < f < k osztója n-nek? Próbaosztás, a bitszámban exponenciális. @param {number} n @param {number} k */
  function hasFactorBelow(n, k) {
    for (let f = 2; f < k && f*f <= n; f++) if (n % f === 0) return {yes:true, factor:f};
    for (let f = 2; f*f <= n; f++) if (n % f === 0 && n/f < k) return {yes:true, factor:n/f};
    return n > 1 && n < k ? {yes:true, factor:n} : {yes:false, factor:null};
  }

  return {growth, humanTime, evalCircuit, threeSum, kSum, assignment, isEdgeCover, minEdgeCover, distinct, languageEmpty, lcs,
    evalCnf, bruteForceSat, maxSat, isClique, isVertexCover, maxClique, minVertexCover, checkPath, findHamiltonPath, longestPath,
    knapsackTotals, knapsack01, knapsackUnbounded, binLoads, binLowerBound, firstFit,
    euclidean, graphDistances, tourLength, tspBruteForce, nearestNeighbour, tspDecision,
    kCenterRadius, bestKCenter, flowShopMakespan, bestFlowShop, isMatching3D, hasFactorBelow};
})();
if (typeof module !== 'undefined') module.exports = CourseComplexity;
