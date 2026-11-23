// 09–10 · Neminformált, informált és lokális keresés: a két fejezet tesztelt keresőmodellje.
// Klasszikus szkript: a böngészőben CourseSearch néven, Node alatt modulként érhető el.
const CourseSearch = (() => {
  /**
   * Szomszédsági lista: állapot → [szomszéd, élköltség] párok, a kiterjesztés sorrendjében.
   * @typedef {Record<string, Array<[string, number]>>} Adjacency
   */
  /**
   * Egy ábrázolható gráf: szomszédsági lista, csomópont-koordináták és címkék.
   * @typedef {{name:string, adj:Adjacency, pos:Record<string,[number,number]>, start:string, goal:string, weighted:boolean, w:number, h:number, heur?:Record<string,number>}} GraphDef
   */
  /**
   * A keresőfa egy csomópontja.
   * @typedef {{id:number, state:string, parent:number|null, depth:number, cost:number, gen:number, visit:number|null, status:'front'|'visited'|'goal'|'cut'|'dropped'}} TreeNode
   */
  /**
   * Egy lépés: melyik csomópontba léptünk be, és milyen lett utána a front.
   * @typedef {{visit:number, children:number[], skipped:string[], front:number[], explored:string[], goal:boolean, cut:boolean}} Step
   */
  /**
   * Egy keresés teljes nyoma.
   * @typedef {{nodes:TreeNode[], steps:Step[], initialFront:number[], found:boolean, goalNode:number|null, path:string[], cost:number, reason:'found'|'exhausted'|'cutoff'|'limit', visits:number, generated:number, maxFront:number, front:number[], strategy:string, limit:number|null, heur:Record<string,number>|null}} Trace
   */
  /**
   * A keresés beállításai. A greedy (mohó legjobb-első) és az astar (A, illetve A*) a heur becslést használja;
   * a tie a rendezett frontban az egyenlő kulcsú csomópontok sorrendje: fifo = a korábban felvett elöl, abc = ábécérend.
   * @typedef {{strategy?:'bfs'|'ucs'|'dfs'|'dls'|'greedy'|'astar', goalTest?:'expand'|'generate', repeats?:'path'|'graph'|'none', order?:'given'|'abc', limit?:number|null, maxVisits?:number, heur?:Record<string,number>, tie?:'fifo'|'abc'}} SearchOptions
   */

  /* ---------- A fejezet gráfjai ---------- */
  /** @param {Record<string, Array<[string, number]>>} adj @returns {Adjacency} */
  const withSinks = (adj) => {
    /** @type {Adjacency} */
    const out = {};
    Object.entries(adj).forEach(([k, v]) => { out[k] = v.map(([t, c]) => [t, c]); v.forEach(([t]) => { if (!(t in adj)) out[t] = out[t] || []; }); });
    return out;
  };

  /** A PDF várospéldája (285., 290., 292., 294. oldal): irányított élek, a gyerekek sorrendje az ábrák szerinti. */
  /** @type {GraphDef} */
  const CITY = {
    name: 'Városok (PDF 285.)', weighted: true, start: 'Budapest', goal: 'Debrecen', w: 640, h: 470,
    adj: withSinks({
      Budapest: [['Dunaújváros', 61], ['Kecskemét', 75], ['Hatvan', 60]],
      Dunaújváros: [['Pécs', 50], ['Kecskemét', 50]],
      Kecskemét: [['Szeged', 75], ['Szolnok', 55]],
      Hatvan: [['Kecskemét', 71], ['Miskolc', 130]],
      Szolnok: [['Szeged', 65], ['Debrecen', 110]],
      Miskolc: [['Polgár', 70]],
      Polgár: [['Debrecen', 60]],
      Pécs: [['Szeged', 150]]
    }),
    pos: { Budapest: [70, 150], Hatvan: [270, 118], Miskolc: [410, 32], Polgár: [458, 140], Debrecen: [578, 176], Kecskemét: [242, 285], Szolnok: [430, 285], Dunaújváros: [80, 333], Pécs: [72, 465], Szeged: [425, 450] }
  };

  /** A 2025. december 5-i minta-zh 8. feladatának gráfja: irányított, súlyozott. */
  /** @type {GraphDef} */
  const ZH = {
    name: 'Minta-zh, 8. feladat', weighted: true, start: 'S', goal: 'G', w: 600, h: 370,
    adj: withSinks({
      S: [['A', 2], ['X', 1], ['Y', 23]], X: [['Y', 20]], Y: [['B', 4]], A: [['B', 1], ['D', 2]], B: [['C', 15]],
      D: [['C', 4], ['K', 5]], C: [['E', 2], ['G', 15]], E: [['F', 4], ['G', 10]], F: [['V', 4]], K: [['V', 3]],
      V: [['G', 6], ['W', 3]], W: [['G', 2]]
    }),
    pos: { Y: [30, 30], B: [300, 30], C: [570, 30], X: [138, 70], A: [205, 125], D: [300, 125], E: [435, 125], S: [84, 179], F: [435, 233], G: [570, 233], K: [300, 341], V: [435, 341], W: [570, 341] },
    // A feladatlap csomópontjaiban álló alsó számok: a 8(b) rész heurisztikája.
    heur: { S: 0, Y: 15, X: 16, A: 8, B: 8, D: 7, C: 11, E: 8, F: 5, G: 0, K: 5, V: 4, W: 4 }
  };

  /** A PDF 281. és 283. oldalának absztrakt állapotgráfja: egységnyi élköltség, két körrel. */
  /** @type {GraphDef} */
  const ABSTRACT = {
    name: 'Absztrakt állapotgráf (PDF 281.)', weighted: false, start: 'Start', goal: 'Cél', w: 560, h: 260,
    adj: withSinks({
      Start: [['a', 1], ['b', 1], ['c', 1]], a: [['d', 1]], b: [['d', 1], ['e', 1], ['f', 1]], c: [['f', 1]],
      d: [['g', 1]], e: [['g', 1], ['h', 1]], f: [['Start', 1], ['h', 1]], g: [['d', 1], ['Cél', 1]], h: [['Cél', 1]]
    }),
    pos: { Start: [30, 140], a: [118, 50], b: [170, 150], c: [148, 228], d: [280, 22], e: [290, 120], f: [288, 220], g: [440, 70], h: [432, 170], Cél: [525, 116] }
  };

  /** A resources/code/21_Ugralas_es_elagazas.py gráfja, változatlanul (F→C 10, C→F 8). */
  /** @type {GraphDef} */
  const CODE21 = {
    name: 'Kurzuskód (21_Ugralas_es_elagazas.py)', weighted: true, start: 'S', goal: 'G', w: 560, h: 300,
    adj: withSinks({
      S: [['A', 2], ['B', 12]], A: [['S', 2], ['D', 6]], B: [['C', 1], ['S', 12]],
      C: [['B', 1], ['D', 2], ['E', 10], ['F', 8]], D: [['A', 6], ['C', 2], ['G', 32]], E: [['C', 10], ['G', 12]], F: [['C', 10], ['G', 15]]
    }),
    pos: { S: [30, 150], A: [150, 50], B: [150, 250], D: [290, 50], C: [290, 250], E: [400, 160], F: [420, 280], G: [530, 120] }
  };

  /** A PDF 302. és 304. oldalának térképe (legjobb-első és A*): Miskolcról Szolnokra, a 304. oldal élhosszaival és becsléseivel. */
  /** @type {GraphDef} */
  const CITY_INF = {
    name: 'Városok, informált (PDF 302–304.)', weighted: true, start: 'Miskolc', goal: 'Szolnok', w: 470, h: 330,
    adj: withSinks({
      Miskolc: [['Hatvan', 130], ['Polgár', 70]], Hatvan: [['Kecskemét', 71]], Polgár: [['Debrecen', 60]], Debrecen: [['Szolnok', 110]],
      Kecskemét: [['Szolnok', 55], ['Szeged', 75]], Szeged: [['Szolnok', 65]]
    }),
    pos: { Miskolc: [235, 14], Hatvan: [70, 80], Polgár: [300, 105], Debrecen: [440, 150], Kecskemét: [40, 215], Szolnok: [265, 215], Szeged: [250, 322] },
    heur: { Miskolc: 130, Hatvan: 98, Polgár: 70, Debrecen: 100, Kecskemét: 55, Szolnok: 0, Szeged: 65 }
  };
  /** A 302. oldal két eltérő becslése (a 304. oldalon Polgár 70, Debrecen 100). */
  const CITY_HEUR_302 = { ...CITY_INF.heur, Polgár: 90, Debrecen: 110 };

  /** A resources/code/18_A_csillag_algoritmus.py gráfja és HEURISTICS szótára, változatlanul. */
  /** @type {GraphDef} */
  const CODE18 = { ...CODE21, name: 'Kurzuskód (18_A_csillag_algoritmus.py)', heur: { S: 30, A: 25, B: 20, C: 17, D: 25, E: 6, F: 5, G: 0 } };

  /** A PDF 297. oldalának teljes bináris fája: 3 mélységű, a cél a jobb–bal–jobb levél. */
  const BINARY = (() => {
    /** @type {Adjacency} */
    const adj = { gyökér: [['L', 1], ['R', 1]] };
    ['L', 'R', 'LL', 'LR', 'RL', 'RR'].forEach((p) => { adj[p] = [[p + 'L', 1], [p + 'R', 1]]; });
    ['LLL', 'LLR', 'LRL', 'LRR', 'RLL', 'RLR', 'RRL', 'RRR'].forEach((p) => { adj[p] = []; });
    return { name: 'Bináris fa (PDF 297.)', weighted: false, start: 'gyökér', goal: 'RLR', adj, pos: {}, w: 0, h: 0 };
  })();

  /** @type {Record<string, GraphDef>} */
  const GRAPHS = { city: CITY, zh: ZH, abstract: ABSTRACT, code21: CODE21 };
  /** Az informált keresések gráfjai (10. fejezet). */
  /** @type {Record<string, GraphDef>} */
  const INFORMED = { city: CITY_INF, zh: ZH, code18: CODE18 };

  /* ---------- Segédek ---------- */
  /** @param {Adjacency} adj @param {string} state @param {'given'|'abc'} order @returns {Array<[string, number]>} */
  function neighbors(adj, state, order) {
    const list = (adj[state] || []).map(([t, c]) => /** @type {[string, number]} */ ([t, c]));
    if (order === 'abc') list.sort((a, b) => a[0].localeCompare(b[0], 'hu'));
    return list;
  }
  /** Az összes állapot ábécérendben. @param {Adjacency} adj */
  function states(adj) {
    const s = new Set(Object.keys(adj));
    Object.values(adj).forEach((v) => v.forEach(([t]) => s.add(t)));
    return [...s].sort((a, b) => a.localeCompare(b, 'hu'));
  }
  /** A gyökértől a csomópontig vezető út állapotai. @param {TreeNode[]} nodes @param {number} id */
  function pathOf(nodes, id) {
    /** @type {string[]} */
    const out = [];
    /** @type {number|null} */
    let cur = id;
    while (cur !== null) { out.unshift(nodes[cur].state); cur = nodes[cur].parent; }
    return out;
  }

  /* ---------- Az általános kereső eljárás (PDF 287., 301., 303.) ---------- */
  /**
   * Egyetlen keresés: szélességi, egyenletes költségű, mélységi, mélységkorlátos, mohó legjobb-első vagy A (A*).
   * A rendezett frontú eljárások kulcsa: ucs → g(n), greedy → h(n), astar → f(n) = g(n) + h(n).
   * A front a csomópontok azonosítóinak listája; az első elem a következő választás.
   * @param {Adjacency} adj @param {string} start @param {string} goal @param {SearchOptions} [opts]
   * @returns {Trace}
   */
  function search(adj, start, goal, opts = {}) {
    const strategy = opts.strategy || 'bfs';
    const goalTest = opts.goalTest || 'expand';
    const repeats = opts.repeats || 'path';
    const order = opts.order || 'given';
    const limit = strategy === 'dls' ? (opts.limit ?? 0) : null;
    const maxVisits = opts.maxVisits || 400;
    const heur = opts.heur || null;
    const tie = opts.tie || 'fifo';
    /** @param {string} s */
    const hv = (s) => (heur && Number.isFinite(heur[s]) ? heur[s] : 0);
    const sorted = strategy === 'ucs' || strategy === 'greedy' || strategy === 'astar';
    /** @param {number} id */
    const key = (id) => strategy === 'greedy' ? hv(nodes[id].state) : strategy === 'astar' ? nodes[id].cost + hv(nodes[id].state) : nodes[id].cost;
    /** @type {TreeNode[]} */
    const nodes = [{ id: 0, state: start, parent: null, depth: 0, cost: 0, gen: 1, visit: null, status: 'front' }];
    /** @type {number[]} */
    let front = [0];
    /** @type {Step[]} */
    const steps = [];
    /** @type {Set<string>} */
    const explored = new Set();
    let visits = 0, maxFront = 1, cutoff = false;
    /** @type {number|null} */
    let goalNode = null;
    /** @type {Trace['reason']} */
    let reason = 'exhausted';
    const initialFront = [0];
    const sortFront = () => {
      if (!sorted) return;
      // Stabil rendezés: egyenlő kulcsnál a korábban felvett csomópont marad elöl (abc: előbb az ábécérend dönt).
      front = front.map((id, i) => [id, i]).sort((a, b) => key(a[0]) - key(b[0])
        || (tie === 'abc' ? nodes[a[0]].state.localeCompare(nodes[b[0]].state, 'hu') : 0) || a[1] - b[1]).map((p) => p[0]);
    };
    if (goalTest === 'generate' && start === goal) {
      nodes[0].status = 'goal';
      return finish(true, 0, 'found');
    }
    while (front.length) {
      if (visits >= maxVisits) { reason = 'limit'; break; }
      sortFront();
      const id = /** @type {number} */ (front.shift());
      const n = nodes[id];
      visits += 1;
      n.visit = visits;
      n.status = 'visited';
      explored.add(n.state);
      /** @type {Step} */
      const step = { visit: id, children: [], skipped: [], front: [], explored: [], goal: false, cut: false };
      steps.push(step);
      if (goalTest === 'expand' && n.state === goal) {
        n.status = 'goal';
        step.goal = true;
        step.front = [...front];
        step.explored = [...explored];
        return finish(true, id, 'found');
      }
      if (limit !== null && n.depth >= limit) {
        if ((adj[n.state] || []).length) { cutoff = true; step.cut = true; n.status = 'cut'; }
        step.front = [...front];
        step.explored = [...explored];
        continue;
      }
      const onPath = new Set(pathOf(nodes, id));
      /** @type {number[]} */
      const kids = [];
      let hit = /** @type {number|null} */ (null);
      for (const [t, c] of neighbors(adj, n.state, order)) {
        if (repeats !== 'none' && onPath.has(t)) { step.skipped.push(t); continue; }
        if (repeats === 'graph') {
          if (explored.has(t)) { step.skipped.push(t); continue; }
          const inFront = front.concat(kids).find((f) => nodes[f].state === t);
          if (inFront !== undefined) {
            if ((strategy === 'ucs' || strategy === 'astar') && nodes[inFront].cost > n.cost + c) {
              nodes[inFront].status = 'dropped';
              front = front.filter((f) => f !== inFront);
              const k = kids.indexOf(inFront);
              if (k >= 0) kids.splice(k, 1);
            } else { step.skipped.push(t); continue; }
          }
        }
        const child = { id: nodes.length, state: t, parent: id, depth: n.depth + 1, cost: n.cost + c, gen: nodes.length + 1, visit: null, status: /** @type {TreeNode['status']} */ ('front') };
        nodes.push(child);
        kids.push(child.id);
        if (goalTest === 'generate' && t === goal) { child.status = 'goal'; hit = child.id; break; }
      }
      step.children = [...kids];
      if (hit !== null) {
        const rest = kids.filter((k) => k !== hit);
        front = strategy === 'dfs' || strategy === 'dls' ? rest.concat(front) : front.concat(rest);
        sortFront();
        step.goal = true;
        step.front = [...front];
        step.explored = [...explored];
        maxFront = Math.max(maxFront, front.length + 1);
        return finish(true, hit, 'found');
      }
      front = strategy === 'dfs' || strategy === 'dls' ? kids.concat(front) : front.concat(kids);
      sortFront();
      maxFront = Math.max(maxFront, front.length);
      step.front = [...front];
      step.explored = [...explored];
    }
    if (reason !== 'limit') reason = cutoff ? 'cutoff' : 'exhausted';
    return finish(false, null, reason);

    /** @param {boolean} found @param {number|null} gid @param {Trace['reason']} why @returns {Trace} */
    function finish(found, gid, why) {
      goalNode = gid;
      return {
        nodes, steps, initialFront, found, goalNode, reason: why,
        path: gid === null ? [] : pathOf(nodes, gid),
        cost: gid === null ? NaN : nodes[gid].cost,
        visits, generated: nodes.length, maxFront, front: [...front], strategy, limit, heur
      };
    }
  }

  /**
   * Iteratív mélyítés: mélységkorlátos keresés 0, 1, 2, … korláttal (PDF 296–297.).
   * @param {Adjacency} adj @param {string} start @param {string} goal
   * @param {SearchOptions & {maxDepth?:number}} [opts]
   */
  function ids(adj, start, goal, opts = {}) {
    const maxDepth = opts.maxDepth ?? 12;
    /** @type {Trace[]} */
    const iterations = [];
    for (let l = 0; l <= maxDepth; l++) {
      const t = search(adj, start, goal, { ...opts, strategy: 'dls', limit: l });
      iterations.push(t);
      if (t.found || t.reason !== 'cutoff') break;
    }
    const last = iterations[iterations.length - 1];
    return {
      iterations, found: last.found, path: last.path, cost: last.cost,
      reason: last.found ? 'found' : last.reason === 'cutoff' ? 'limit' : last.reason,
      visits: iterations.reduce((s, t) => s + t.visits, 0),
      generated: iterations.reduce((s, t) => s + t.generated, 0)
    };
  }

  /** Futtatás név szerint, az IDS-t is beleértve, egyforma alakú eredménnyel. @param {Adjacency} adj @param {string} start @param {string} goal @param {Omit<SearchOptions, 'strategy'> & {strategy?: 'bfs'|'ucs'|'dfs'|'dls'|'ids'|'greedy'|'astar', maxDepth?:number}} opts */
  function run(adj, start, goal, opts) {
    if (opts.strategy === 'ids') return ids(adj, start, goal, { ...opts, strategy: 'dls' });
    const t = search(adj, start, goal, /** @type {SearchOptions} */ (opts));
    return { iterations: [t], found: t.found, path: t.path, cost: t.cost, reason: t.reason, visits: t.visits, generated: t.generated };
  }

  /**
   * Címkék: az ismételt állapotok a feltárás sorrendjében indexet kapnak (Kecskemét₁, Kecskemét₂ …).
   * @param {TreeNode[]} nodes @returns {Array<{name:string, index:number|null}>}
   */
  function labels(nodes) {
    /** @type {Record<string, number>} */
    const total = {};
    nodes.forEach((n) => { total[n.state] = (total[n.state] || 0) + 1; });
    /** @type {Record<string, number>} */
    const seen = {};
    return nodes.map((n) => {
      seen[n.state] = (seen[n.state] || 0) + 1;
      return { name: n.state, index: total[n.state] > 1 ? seen[n.state] : null };
    });
  }
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  /** Szöveges címke alsó indexszel. @param {{name:string, index:number|null}} l */
  const labelText = (l) => l.name + (l.index === null ? '' : String(l.index).split('').map((d) => SUB[Number(d)]).join(''));

  /* ---------- Saját gráf szövegből ---------- */
  /**
   * Soronként egy él: „A B 3” vagy „A -> B 3”. A költség elhagyható (1). A # utáni rész megjegyzés.
   * @param {string} text @param {{undirected?:boolean}} [opt]
   * @returns {{adj:Adjacency, errors:string[], edges:number}}
   */
  function parseGraph(text, opt = {}) {
    /** @type {Adjacency} */
    const adj = {};
    /** @type {string[]} */
    const errors = [];
    let edges = 0;
    /** @param {string} a @param {string} b @param {number} c */
    const add = (a, b, c) => {
      adj[a] = adj[a] || [];
      adj[b] = adj[b] || [];
      const old = adj[a].find((e) => e[0] === b);
      if (old) old[1] = c; else adj[a].push([b, c]);
    };
    text.split(/\r?\n/).forEach((raw, i) => {
      const line = raw.replace(/#.*/, '').trim();
      if (!line) return;
      const parts = line.replace(/->|→|>/g, ' ').split(/[\s;]+/).filter(Boolean);
      if (parts.length < 2 || parts.length > 3) { errors.push(`${i + 1}. sor: két csomópont és egy költség kell, például „A B 3”.`); return; }
      const [a, b] = parts;
      const c = parts.length === 3 ? Number(parts[2].replace(',', '.')) : 1;
      if (!Number.isFinite(c) || c < 0) { errors.push(`${i + 1}. sor: a költség nemnegatív szám legyen.`); return; }
      if (a.length > 14 || b.length > 14) { errors.push(`${i + 1}. sor: legfeljebb 14 karakteres csomópontnevet használj.`); return; }
      add(a, b, c);
      if (opt.undirected) add(b, a, c);
      edges += 1;
    });
    return { adj, errors, edges };
  }
  /** Körbe rendezett koordináták egy saját gráfhoz. @param {string[]} names @param {number} w @param {number} h */
  function circleLayout(names, w, h) {
    /** @type {Record<string,[number,number]>} */
    const pos = {};
    const r = Math.min(w, h) / 2 - 34;
    names.forEach((n, i) => {
      const a = -Math.PI / 2 + 2 * Math.PI * i / Math.max(1, names.length);
      pos[n] = [Math.round(w / 2 + r * Math.cos(a)), Math.round(h / 2 + r * Math.sin(a))];
    });
    return pos;
  }

  /* ---------- Rajzolás: SVG szövegként (statikus ábrákhoz és a laborhoz is) ---------- */
  /** @param {string} s */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  /** @param {number} n */
  const num = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1)).replace('.', ',');

  /**
   * A keresőfa elrendezése: a levelek egymás mellé, a szülő a gyerekei fölé kerül.
   * @param {TreeNode[]} nodes @returns {{x:number[], depth:number, leaves:number}}
   */
  function layoutTree(nodes) {
    /** @type {number[][]} */
    const kids = nodes.map(() => []);
    nodes.forEach((n) => { if (n.parent !== null) kids[n.parent].push(n.id); });
    const x = nodes.map(() => 0);
    let next = 0, depth = 0;
    /** @param {number} id @returns {number} */
    const place = (id) => {
      depth = Math.max(depth, nodes[id].depth);
      if (!kids[id].length) { x[id] = next; next += 1; return x[id]; }
      const xs = kids[id].map(place);
      x[id] = (xs[0] + xs[xs.length - 1]) / 2;
      return x[id];
    };
    if (nodes.length) place(0);
    return { x, depth, leaves: next };
  }

  /**
   * A keresés állapota k lépés után: látható csomópontok, front, aktuális csomópont.
   * @param {Trace} trace @param {number} k
   */
  function snapshot(trace, k) {
    const step = Math.max(0, Math.min(k, trace.steps.length));
    let gen = 1;
    for (let i = 0; i < step; i++) trace.steps[i].children.forEach((c) => { gen = Math.max(gen, c + 1); });
    const last = step ? trace.steps[step - 1] : null;
    return {
      step, generated: gen,
      front: last ? last.front : trace.initialFront,
      current: last ? last.visit : null,
      explored: last ? last.explored : [],
      done: step === trace.steps.length
    };
  }

  /**
   * A keresőfa SVG-je. A csomópont alatt a belelépés sorszáma (#) és kérésre az útköltség (g).
   * @param {Trace} trace
   * heur megadásakor a csomópont alatt „g+h=f” (heurMode: 'h' esetén „h=…”) áll, a belelépés sorszáma alatta.
   * @param {{title?:string, id?:string, showCost?:boolean, showVisit?:boolean, gap?:number, step?:number, levels?:boolean, current?:boolean, name?:(n:TreeNode, label:string) => string, heur?:Record<string,number>, heurMode?:'f'|'h'}} [opt]
   */
  function treeSvg(trace, opt = {}) {
    const snap = snapshot(trace, opt.step ?? trace.steps.length);
    const shown = trace.nodes.filter((n) => n.id < snap.generated);
    const lay = layoutTree(shown);
    const lab = labels(trace.nodes);
    const heur = opt.heur || null;
    const gap = opt.gap || 96, rowH = heur ? 86 : opt.showCost ? 74 : 62, pad = opt.levels ? 52 : 10;
    const W = Math.max(1, lay.leaves) * gap + 2 * pad, H = lay.depth * rowH + 64;
    /** @param {number} id */
    const X = (id) => pad + gap / 2 + lay.x[id] * gap;
    /** @param {number} id */
    const Y = (id) => 14 + shown[id].depth * rowH;
    const front = new Set(snap.front);
    const visited = (/** @type {TreeNode} */ n) => n.visit !== null && n.visit <= snap.step;
    /** @type {Set<number>} */
    const goalPath = new Set();
    if (snap.done && trace.goalNode !== null) {
      /** @type {number|null} */
      let c = trace.goalNode;
      while (c !== null) { goalPath.add(c); c = trace.nodes[c].parent; }
    }
    const minW = Math.min(W, Math.max(300, lay.leaves * 78));
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" class="u-tree-svg" style="min-width:${minW}px"${opt.id ? ` aria-labelledby="${esc(opt.id)}-t"` : ''}>`;
    if (opt.title) s += `<title${opt.id ? ` id="${esc(opt.id)}-t"` : ''}>${esc(opt.title)}</title>`;
    if (opt.levels) for (let d = 0; d <= lay.depth; d++) s += `<text x="4" y="${18 + d * rowH}" class="u-tlevel">${d}. szint</text>`;
    shown.forEach((n) => {
      if (n.parent === null) return;
      const on = goalPath.has(n.id);
      s += `<path class="u-tedge${on ? ' u-tedge-on' : ''}" d="M${X(n.parent)} ${Y(n.parent) + 8}L${X(n.id)} ${Y(n.id) - 9}"/>`;
    });
    shown.forEach((n) => {
      const l = lab[n.id];
      const cls = ['u-tnode'];
      if (n.status === 'goal' && snap.done) cls.push('u-tnode-goal');
      else if (opt.current && snap.current === n.id) cls.push('u-tnode-cur');
      else if (visited(n)) cls.push('u-tnode-vis');
      if (front.has(n.id)) cls.push('u-tnode-front');
      if (n.status === 'cut' && visited(n)) cls.push('u-tnode-cut');
      if (n.status === 'dropped') cls.push('u-tnode-drop');
      const x = X(n.id), y = Y(n.id);
      s += `<g class="${cls.join(' ')}"><circle cx="${x}" cy="${y}" r="7"/>`;
      const name = opt.name ? opt.name(n, labelText(l)) : null;
      if (name !== null) s += `<text x="${x}" y="${y + 23}" text-anchor="middle" class="u-tname">${esc(name)}</text>`;
      else s += `<text x="${x}" y="${y + 23}" text-anchor="middle" class="u-tname">${esc(l.name)}${l.index === null ? '' : `<tspan class="u-tsub" dy="4">${l.index}</tspan>`}</text>`;
      const meta = [];
      if (heur) {
        const hn = Number.isFinite(heur[n.state]) ? heur[n.state] : 0;
        const expr = opt.heurMode === 'h' ? `h=${num(hn)}` : `${num(n.cost)}+${num(hn)}=${num(n.cost + hn)}`;
        s += `<text x="${x}" y="${y + 38}" text-anchor="middle" class="u-tmeta u-tf">${esc(expr)}</text>`;
        if (opt.showVisit !== false && visited(n)) s += `<text x="${x}" y="${y + 51}" text-anchor="middle" class="u-tmeta">#${n.visit}</text>`;
      } else {
        if (opt.showVisit !== false && visited(n)) meta.push(`#${n.visit}`);
        if (opt.showCost) meta.push(`${num(n.cost)}`);
      }
      if (meta.length) s += `<text x="${x}" y="${y + 38}" text-anchor="middle" class="u-tmeta">${esc(meta.join(' · '))}</text>`;
      s += '</g>';
    });
    return s + '</svg>';
  }

  /**
   * Az állapotgráf (térkép) SVG-je; a csomópontok állapota CSS-osztályként jelenik meg.
   * @param {GraphDef} g
   * heur megadásakor a csomópontoknál a becslés is látszik (rövid nevű csomópontban a név alatt, egyébként „h=…” a kör fölött).
   * @param {{id?:string, title?:string, marks?:Record<string,string>, pathEdges?:string[], showGoal?:boolean, heur?:Record<string,number>}} [opt]
   */
  function graphSvg(g, opt = {}) {
    const marks = opt.marks || {};
    const onPath = new Set(opt.pathEdges || []);
    const heur = opt.heur || null;
    const inside = Object.keys(g.pos).every((n) => n.length <= 2);
    const r = inside ? (heur ? 17 : 13) : 9;
    let s = `<svg viewBox="-16 -16 ${g.w + 32} ${g.h + (inside ? 32 : 40)}" role="img" class="u-graph-svg" style="min-width:${Math.round(g.w * 0.7)}px"${opt.id ? ` aria-labelledby="${esc(opt.id)}-t"` : ''}>`;
    if (opt.title) s += `<title${opt.id ? ` id="${esc(opt.id)}-t"` : ''}>${esc(opt.title)}</title>`;
    s += '<defs><marker id="' + esc(opt.id || 'g') + '-nyil" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="u-arrowhead"/></marker></defs>';
    /** @type {Set<string>} */
    const drawn = new Set();
    Object.entries(g.adj).forEach(([a, list]) => list.forEach(([b, c]) => {
      const pa = g.pos[a], pb = g.pos[b];
      if (!pa || !pb) return;
      const back = (g.adj[b] || []).some(([t]) => t === a);
      const dx = pb[0] - pa[0], dy = pb[1] - pa[1], len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      // Ellentétes élpárnál a két él kissé szétválik.
      const off = back ? 5 : 0, ox = -uy * off, oy = ux * off;
      const x1 = pa[0] + ux * r + ox, y1 = pa[1] + uy * r + oy, x2 = pb[0] - ux * (r + 2) + ox, y2 = pb[1] - uy * (r + 2) + oy;
      const key = `${a}>${b}`;
      s += `<path class="u-gedge${onPath.has(key) ? ' u-gedge-on' : ''}" d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#${esc(opt.id || 'g')}-nyil)"/>`;
      if (g.weighted) {
        const mx = (x1 + x2) / 2 + ox * 1.6 - uy * 9, my = (y1 + y2) / 2 + oy * 1.6 + ux * 9;
        s += `<text class="u-gcost" x="${mx.toFixed(1)}" y="${(my + 4).toFixed(1)}" text-anchor="middle">${num(c)}</text>`;
      }
      drawn.add(key);
    }));
    Object.entries(g.pos).forEach(([n, [x, y]]) => {
      const m = marks[n] ? ` u-g-${marks[n]}` : '';
      const role = n === g.start ? ' u-g-start' : (opt.showGoal !== false && n === g.goal ? ' u-g-goal' : '');
      const hn = heur && Number.isFinite(heur[n]) ? num(heur[n]) : null;
      const ty = inside ? (hn !== null ? y + 1 : y + 5) : y + 24;
      let label = `<text x="${x}" y="${ty}" text-anchor="middle">${esc(n)}</text>`;
      if (hn !== null) label += inside ? `<text x="${x}" y="${y + 13}" text-anchor="middle" class="u-gh">${hn}</text>` : `<text x="${x}" y="${y - 14}" text-anchor="middle" class="u-gh">h=${hn}</text>`;
      s += `<g class="u-gnode${m}${role}${inside ? ' u-gnode-in' : ''}"><circle cx="${x}" cy="${y}" r="${r}"/>${label}</g>`;
    });
    return s + '</svg>';
  }

  /* ---------- Idő- és tárigény (PDF 289–296., AIMA 3.4) ---------- */
  /**
   * Nagyságrendi becslés: generált csomópontok és egyszerre tárolt csomópontok száma.
   * @param {{b:number, d:number, m:number, l:number, ratio:number}} p ratio = C* osztva ε-nal
   */
  function complexity(p) {
    const { b, d, m, l, ratio } = p;
    let bfsTime = 0, idsTime = 0;
    for (let i = 0; i <= d; i++) { bfsTime += b ** i; idsTime += (d + 1 - i) * b ** i; }
    const u = 1 + Math.floor(ratio);
    return {
      bfs: { time: bfsTime, memory: b ** d },
      ucs: { time: b ** u, memory: b ** u },
      dfs: { time: b ** m, memory: b * m },
      dls: { time: b ** l, memory: b * l },
      ids: { time: idsTime, memory: b * d }
    };
  }

  /* ---------- Amőba: a három reprezentáció elágazási tényezője (PDF 279.) ---------- */
  /**
   * Egy 20 × 20-as táblán az utolsó lépés (sor, oszlop; 1-től számozva) körüli jelöltmezők száma.
   * A számítás az üres mezők felső korlátja: a többi jel helyét nem nézi.
   * @param {number} row @param {number} col @param {number} [stones] a táblán lévő jelek száma @param {number} [size]
   */
  function gomoku(row, col, stones = 1, size = 20) {
    const inside = (/** @type {number} */ r, /** @type {number} */ c) => r >= 1 && r <= size && c >= 1 && c <= size;
    let square = 0, star = 0;
    for (let dr = -4; dr <= 4; dr++) for (let dc = -4; dc <= 4; dc++) {
      if (!dr && !dc) continue;
      if (inside(row + dr, col + dc)) square += 1;
    }
    [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(([dr, dc]) => {
      for (let k = 1; k <= 4; k++) { if (inside(row + dr * k, col + dc * k)) star += 1; if (inside(row - dr * k, col - dc * k)) star += 1; }
    });
    return { all: size * size - stones, square, star };
  }

  /* ---------- Tologatós kirakó (PDF 298.) ---------- */
  /** Az üres mező mozgatása fel, jobbra, le, balra sorrendben. @param {string} s 9 karakter, „_” az üres. */
  function puzzleMoves(s) {
    const i = s.indexOf('_'), r = Math.floor(i / 3), c = i % 3;
    /** @type {string[]} */
    const out = [];
    [[-1, 0], [0, 1], [1, 0], [0, -1]].forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr > 2 || cc < 0 || cc > 2) return;
      const j = rr * 3 + cc, t = s.split('');
      [t[i], t[j]] = [t[j], t[i]];
      out.push(t.join(''));
    });
    return out;
  }
  /** A kirakó állapotterének szomszédsági listája az indulóállapottól adott mélységig. @param {string} start @param {number} depth */
  function puzzleSpace(start, depth) {
    /** @type {Adjacency} */
    const adj = {};
    let layer = [start];
    for (let k = 0; k < depth; k++) {
      /** @type {string[]} */
      const next = [];
      layer.forEach((s) => { if (adj[s]) return; adj[s] = puzzleMoves(s).map((t) => [t, 1]); adj[s].forEach(([t]) => next.push(t)); });
      layer = next;
    }
    layer.forEach((s) => { if (!adj[s]) adj[s] = puzzleMoves(s).map((t) => [t, 1]); });
    return adj;
  }

  /* ---------- Heurisztika: valódi hátralévő költség, elfogadhatóság, konzisztencia (PDF 299., 303.) ---------- */
  /**
   * h*(n): a valódi legolcsóbb költség n-ből a célba (Dijkstra a megfordított gráfon). Elérhetetlen állapotnál Infinity.
   * @param {Adjacency} adj @param {string} goal @returns {Record<string, number>}
   */
  function hStar(adj, goal) {
    /** @type {Record<string, Array<[string, number]>>} */
    const rev = {};
    states(adj).forEach((n) => { rev[n] = []; });
    Object.entries(adj).forEach(([a, list]) => list.forEach(([b, c]) => { (rev[b] = rev[b] || []).push([a, c]); }));
    /** @type {Record<string, number>} */
    const dist = {};
    Object.keys(rev).forEach((n) => { dist[n] = Infinity; });
    dist[goal] = 0;
    const done = new Set();
    for (;;) {
      let best = null, bd = Infinity;
      for (const n of Object.keys(dist)) if (!done.has(n) && dist[n] < bd) { bd = dist[n]; best = n; }
      if (best === null) break;
      done.add(best);
      (rev[best] || []).forEach(([a, c]) => { if (bd + c < dist[a]) dist[a] = bd + c; });
    }
    return dist;
  }
  /**
   * Egy becslés ellenőrzése: hol becsül túl (h(n) > h*(n)), és mely éleken sérül a konzisztencia (h(n) > c(n, n') + h(n')).
   * @param {Adjacency} adj @param {Record<string, number>} heur @param {string} goal
   */
  function checkHeuristic(adj, heur, goal) {
    const star = hStar(adj, goal);
    /** @param {string} s */
    const hv = (s) => (Number.isFinite(heur[s]) ? heur[s] : 0);
    const over = states(adj).filter((s) => Number.isFinite(star[s]) && hv(s) > star[s]).map((s) => ({ state: s, h: hv(s), hStar: star[s] }));
    /** @type {Array<{from:string, to:string, cost:number, hFrom:number, hTo:number}>} */
    const inconsistent = [];
    Object.entries(adj).forEach(([a, list]) => list.forEach(([b, c]) => { if (hv(a) > c + hv(b)) inconsistent.push({ from: a, to: b, cost: c, hFrom: hv(a), hTo: hv(b) }); }));
    return { hStar: star, over, inconsistent, admissible: over.length === 0, consistent: inconsistent.length === 0, goalZero: hv(goal) === 0 };
  }

  /* ---------- Lokális keresés egy többcsúcsú felszínen (PDF 305–307.) ---------- */
  /**
   * Determinisztikus álvéletlen-generátor (mulberry32): ugyanaz a mag ugyanazt a sorozatot adja.
   * @param {number} seed @returns {() => number} egyenletes eloszlású szám a [0, 1) intervallumban
   */
  function rng(seed) {
    let a = (Math.floor(seed) >>> 0) || 1;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** A felszín értelmezési tartománya: egész x, 0 ≤ x ≤ 100. */
  const LAND_MAX = 100;
  /**
   * A fejezet többcsúcsú felszíne: 0,25-ös alapszint, négy csúcs (x = 12: 0,55; x = 34: 0,75; x = 80: 1, a globális; x = 95: 0,6)
   * és egy lapos fennsík (50 ≤ x ≤ 62: 0,45).
   * A fennsíkon az érték pontosan 0,45, máshol sehol sincs két egyforma szomszéd. @param {number} x
   */
  function landscape(x) {
    const g = (/** @type {number} */ m, /** @type {number} */ w, /** @type {number} */ a) => a * Math.exp(-(((x - m) / w) ** 2));
    let v = 0.25 + g(12, 4, 0.3) + g(34, 6, 0.5) + g(80, 8, 0.75) + g(95, 2.5, 0.33);
    if (x >= 50 && x <= 62) v = Math.max(v, 0.45);
    return v;
  }
  /** @param {number} x */
  const clampX = (x) => Math.max(0, Math.min(LAND_MAX, Math.round(x)));
  /**
   * Hegymászó keresés (legmeredekebb emelkedő): a két szomszéd (x − 1, x + 1) közül a jobbikba lép, ha az szigorúan jobb; különben megáll.
   * @param {(x:number) => number} f @param {number} start
   * @returns {{path:number[], x:number, value:number, stop:'peak'|'plateau'}}
   */
  function hillClimb(f, start) {
    let x = clampX(start);
    const path = [x];
    for (let guard = 0; guard <= LAND_MAX + 1; guard++) {
      const nb = [x - 1, x + 1].filter((y) => y >= 0 && y <= LAND_MAX);
      const best = nb.reduce((a, b) => (f(b) > f(a) ? b : a));
      if (f(best) <= f(x)) {
        const flat = nb.some((y) => f(y) === f(x));
        return { path, x, value: f(x), stop: flat ? 'plateau' : 'peak' };
      }
      x = best;
      path.push(x);
    }
    return { path, x, value: f(x), stop: 'peak' };
  }
  /**
   * Hegymászó véletlen újraindításokkal: az első indulás a megadott pont, a többi álvéletlen.
   * @param {(x:number) => number} f @param {{start?:number, restarts?:number, seed?:number}} [opt]
   */
  function restartHill(f, opt = {}) {
    const rand = rng(opt.seed ?? 1);
    const runs = [hillClimb(f, opt.start ?? 0)];
    for (let i = 0; i < (opt.restarts ?? 0); i++) runs.push(hillClimb(f, Math.floor(rand() * (LAND_MAX + 1))));
    const best = runs.reduce((a, b) => (b.value > a.value ? b : a));
    return { runs, best, steps: runs.reduce((s, r) => s + r.path.length - 1, 0) };
  }
  /**
   * Rontó lépés elfogadásának valószínűsége minimalizálásnál: Δ = f(r) − f(n) > 0 esetén exp(−Δ / T), különben 1.
   * @param {number} delta @param {number} T
   */
  function acceptance(delta, T) {
    if (delta <= 0) return 1;
    if (T <= 0) return 0;
    return Math.exp(-delta / T);
  }
  /**
   * A hőmérséklet a k. lépésben. geom: T_k = α · T_(k−1); log: T_k = T0 · ln 2 / ln(k + 2) (Geman–Geman, Hajek-féle lassú hűtés).
   * @param {'geom'|'log'} schedule @param {number} k @param {number} prev @param {number} T0 @param {number} alpha
   */
  function temperature(schedule, k, prev, T0, alpha) {
    return schedule === 'log' ? T0 * Math.LN2 / Math.log(k + 2) : prev * alpha;
  }
  /**
   * Szimulált hűtés a PDF minimalizáló pszeudokódja szerint (307. oldal). A szomszéd egy álvéletlen pont n ± radius-on belül (alapérték 8).
   * Leállás: az utolsó window lépésben f(n) legfeljebb eps-szel változott, vagy T < tMin, vagy elfogyott a maxIter.
   * @param {(x:number) => number} f minimalizálandó függvény
   * @param {{start?:number, T0?:number, alpha?:number, schedule?:'geom'|'log', seed?:number, radius?:number, maxIter?:number, tMin?:number, eps?:number, window?:number}} [opt]
   */
  function anneal(f, opt = {}) {
    const T0 = opt.T0 ?? 0.3, alpha = opt.alpha ?? 0.995, schedule = opt.schedule || 'geom';
    const radius = Math.max(1, Math.round(opt.radius ?? 8)), maxIter = opt.maxIter ?? 6000, tMin = opt.tMin ?? 1e-4;
    const eps = opt.eps ?? 5e-4, win = opt.window ?? 100;
    const rand = rng(opt.seed ?? 1);
    let n = clampX(opt.start ?? 12), T = T0, k = 0;
    const xs = [n], fs = [f(n)], Ts = [T];
    let worseAccepted = 0, worseRejected = 0, better = 0;
    let best = { x: n, value: f(n), k: 0 };
    /** @type {'stable'|'tmin'|'maxIter'} */
    let stop = 'maxIter';
    while (k < maxIter) {
      let r = n;
      while (r === n) r = clampX(n + Math.floor(rand() * (2 * radius + 1)) - radius);
      const fr = f(r), fn = f(n);
      if (fr <= fn) { n = r; better += 1; }
      else if (Math.exp((fn - fr) / T) > rand()) { n = r; worseAccepted += 1; }
      else worseRejected += 1;
      k += 1;
      T = temperature(schedule, k, T, T0, alpha);
      xs.push(n); fs.push(f(n)); Ts.push(T);
      if (f(n) < best.value) best = { x: n, value: f(n), k };
      if (k >= win) {
        const last = fs.slice(-win);
        if (Math.max(...last) - Math.min(...last) <= eps) { stop = 'stable'; break; }
      }
      if (T < tMin) { stop = 'tmin'; break; }
    }
    return { xs, fs, Ts, x: n, value: f(n), best, iterations: k, worseAccepted, worseRejected, better, stop };
  }

  /* ---------- A felszín és az idősorok rajza ---------- */
  /**
   * A felszín SVG-je. runs: hegymászó-utak (kezdőpont karika, végpont pötty, nyíl a lépések irányában);
   * trail: szimulált hűtés pályája (pontok, a későbbiek erősebbek); marks: feliratozott pontok.
   * @param {{id?:string, title?:string, runs?:Array<{path:number[], cls?:string}>, trail?:number[], labels?:boolean}} [opt]
   */
  function landscapeSvg(opt = {}) {
    const W = 560, H = 250, L = 34, R = 10, T = 18, B = 34;
    /** @param {number} x */
    const X = (x) => L + (x / LAND_MAX) * (W - L - R);
    /** @param {number} y */
    const Y = (y) => T + (1 - y / 1.1) * (H - T - B);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" class="u-land-svg"${opt.id ? ` aria-labelledby="${esc(opt.id)}-t"` : ''}>`;
    if (opt.title) s += `<title${opt.id ? ` id="${esc(opt.id)}-t"` : ''}>${esc(opt.title)}</title>`;
    s += `<g class="u-axis"><path d="M${L} ${T - 6}V${H - B}H${W - R}"/>`;
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => { s += `<text x="${L - 5}" y="${Y(v) + 4}" text-anchor="end">${num(v).replace(/,0+$/, '')}</text><path class="u-grid" d="M${L} ${Y(v)}H${W - R}"/>`; });
    for (let x = 0; x <= LAND_MAX; x += 10) s += `<text x="${X(x)}" y="${H - B + 15}" text-anchor="middle">${x}</text>`;
    s += `<text x="${W - R}" y="${H - 4}" text-anchor="end">állapot (x)</text><text x="4" y="${T - 6}">magasság</text></g>`;
    s += `<rect class="u-plateau" x="${X(50)}" y="${Y(0.45)}" width="${X(62) - X(50)}" height="${Y(0) - Y(0.45)}"/>`;
    let d = '';
    for (let x = 0; x <= LAND_MAX; x++) d += `${x ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(landscape(x)).toFixed(1)}`;
    s += `<path class="u-curve" d="${d}"/>`;
    if (opt.labels !== false) {
      [[12, 'helyi csúcs 0,55'], [34, 'helyi csúcs 0,75'], [80, 'globális csúcs 1'], [95, 'helyi 0,6']].forEach(([x, t]) => {
        s += `<text class="u-peak" x="${X(Number(x))}" y="${Y(landscape(Number(x))) - 7}" text-anchor="middle">${t}</text>`;
      });
      s += `<text class="u-peak" x="${X(56)}" y="${Y(0.45) - 7}" text-anchor="middle">fennsík 0,45</text>`;
    }
    (opt.trail || []).forEach((x, i, a) => {
      const op = (0.15 + 0.85 * (i / Math.max(1, a.length - 1))).toFixed(2);
      s += `<circle class="u-trail" cx="${X(x).toFixed(1)}" cy="${Y(landscape(x)).toFixed(1)}" r="3" style="opacity:${op}"/>`;
    });
    if (opt.trail && opt.trail.length) {
      const e = opt.trail[opt.trail.length - 1];
      s += `<circle class="u-end" cx="${X(e)}" cy="${Y(landscape(e))}" r="6"/>`;
    }
    (opt.runs || []).forEach((r) => {
      const cls = r.cls || 'u-run';
      const pts = r.path.map((x) => `${X(x).toFixed(1)} ${(Y(landscape(x)) - 0).toFixed(1)}`);
      if (pts.length > 1) s += `<path class="${cls}" d="M${pts.join('L')}"/>`;
      const a = r.path[0], e = r.path[r.path.length - 1];
      s += `<circle class="${cls}-start" cx="${X(a)}" cy="${Y(landscape(a))}" r="5"/><circle class="${cls}-end" cx="${X(e)}" cy="${Y(landscape(e))}" r="5"/>`;
    });
    return s + '</svg>';
  }
  /**
   * Egyszerű idősor-grafikon (például T_k és a magasság a lépésszám függvényében), saját skálával soronként.
   * @param {{id?:string, title?:string, series:Array<{values:number[], cls:string, label:string, max?:number}>}} opt
   */
  function seriesSvg(opt) {
    const W = 560, H = 170, L = 34, R = 10, T = 40, B = 26;
    const n = Math.max(...opt.series.map((x) => x.values.length)) - 1 || 1;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" class="u-series-svg"${opt.id ? ` aria-labelledby="${esc(opt.id)}-t"` : ''}>`;
    if (opt.title) s += `<title${opt.id ? ` id="${esc(opt.id)}-t"` : ''}>${esc(opt.title)}</title>`;
    s += `<g class="u-axis"><path d="M${L} ${T - 4}V${H - B}H${W - R}"/><text x="${L}" y="${H - 8}">0</text><text x="${W - R}" y="${H - 8}" text-anchor="end">${n} lépés</text></g>`;
    opt.series.forEach((ser, k) => {
      const max = ser.max ?? Math.max(...ser.values, 1e-9);
      const step = Math.max(1, Math.floor(ser.values.length / 400));
      let d = '';
      for (let i = 0; i < ser.values.length; i += step) d += `${d ? 'L' : 'M'}${(L + (i / n) * (W - L - R)).toFixed(1)} ${(T + (1 - Math.min(1, ser.values[i] / max)) * (H - T - B)).toFixed(1)}`;
      s += `<path class="${ser.cls}" d="${d}"/><text class="${ser.cls}-label" x="${L}" y="${12 + k * 14}">${esc(ser.label)}</text>`;
    });
    return s + '</svg>';
  }

  /* ---------- Döntési segéd a záró összevetéshez ---------- */
  /**
   * Ajánlott eljárás(ok) néhány kérdés alapján. A kulcsok az összevető táblázat sorainak azonosítói.
   * @param {{need:'path'|'state', costs:'equal'|'varied', heuristic:boolean, memory:'ok'|'tight', optimal:boolean}} q
   * @returns {{ids:string[], why:string}}
   */
  function recommend(q) {
    if (q.need === 'state') {
      return q.optimal
        ? { ids: ['sa', 'hill'], why: 'Csak a jó állapot kell, az út nem: lokális keresés. A globális optimum esélyét a szimulált hűtés (vagy az újraindított hegymászó) növeli, garanciát gyakorlati időben egyik sem ad.' }
        : { ids: ['hill', 'sa'], why: 'Csak egy elég jó állapot kell: a hegymászó gyors és szinte memória nélküli. Ha gyakran helyi csúcson ragad, jöhet a szimulált hűtés.' };
    }
    if (q.heuristic) {
      if (!q.optimal) return { ids: ['greedy'], why: 'Van becslés, és bármilyen út megfelel: a mohó legjobb-első gyakran nagyon gyorsan célba ér, de nem garantál legolcsóbb utat.' };
      return q.memory === 'tight'
        ? { ids: ['astar', 'ida'], why: 'Elfogadható becsléssel az A* optimális, de a frontja nagy lehet. Szűkös memóriánál az IDA* ugyanezt a garanciát kis memóriával adja, több újraszámolás árán.' }
        : { ids: ['astar'], why: 'Elfogadható becsléssel az A* optimális, és a jó becslés miatt jóval kevesebb csomópontot terjeszt ki, mint az egyenletes költségű keresés.' };
    }
    if (q.costs === 'varied') return { ids: ['ucs'], why: 'Nincs becslés, a költségek eltérnek: az egyenletes költségű keresés optimális (ez az A* h = 0 mellett).' };
    return q.memory === 'tight'
      ? { ids: ['ids'], why: 'Egyforma lépésköltség, nincs becslés, kevés memória: az iteratív mélyítés teljes, lépésszámban optimális, és O(b · d) memóriát kér.' }
      : { ids: ['bfs', 'ids'], why: 'Egyforma lépésköltség és van memória: a szélességi keresés egyszerű és optimális; nagy mélységnél az iteratív mélyítés takarékosabb.' };
  }

  return { CITY, ZH, ABSTRACT, CODE21, BINARY, GRAPHS, neighbors, states, pathOf, search, ids, run, labels, labelText,
    parseGraph, circleLayout, layoutTree, snapshot, treeSvg, graphSvg, complexity, gomoku, puzzleMoves, puzzleSpace, esc,
    CITY_INF, CITY_HEUR_302, CODE18, INFORMED, hStar, checkHeuristic,
    rng, LAND_MAX, landscape, hillClimb, restartHill, acceptance, temperature, anneal, landscapeSvg, seriesSvg, recommend };
})();
if (typeof module !== 'undefined') module.exports = CourseSearch;
