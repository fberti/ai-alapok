// 09 · Neminformált keresés: a fejezet tesztelt keresőmodellje.
// Klasszikus szkript: a böngészőben CourseSearch néven, Node alatt modulként érhető el.
const CourseSearch = (() => {
  /**
   * Szomszédsági lista: állapot → [szomszéd, élköltség] párok, a kiterjesztés sorrendjében.
   * @typedef {Record<string, Array<[string, number]>>} Adjacency
   */
  /**
   * Egy ábrázolható gráf: szomszédsági lista, csomópont-koordináták és címkék.
   * @typedef {{name:string, adj:Adjacency, pos:Record<string,[number,number]>, start:string, goal:string, weighted:boolean, w:number, h:number}} GraphDef
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
   * @typedef {{nodes:TreeNode[], steps:Step[], initialFront:number[], found:boolean, goalNode:number|null, path:string[], cost:number, reason:'found'|'exhausted'|'cutoff'|'limit', visits:number, generated:number, maxFront:number, front:number[], strategy:string, limit:number|null}} Trace
   */
  /**
   * A keresés beállításai.
   * @typedef {{strategy?:'bfs'|'ucs'|'dfs'|'dls', goalTest?:'expand'|'generate', repeats?:'path'|'graph'|'none', order?:'given'|'abc', limit?:number|null, maxVisits?:number}} SearchOptions
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
    pos: { Y: [30, 30], B: [300, 30], C: [570, 30], X: [138, 70], A: [205, 125], D: [300, 125], E: [435, 125], S: [84, 179], F: [435, 233], G: [570, 233], K: [300, 341], V: [435, 341], W: [570, 341] }
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

  /* ---------- Az általános kereső eljárás (PDF 287.) ---------- */
  /**
   * Egyetlen keresés: szélességi, egyenletes költségű, mélységi vagy mélységkorlátos.
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
      if (strategy !== 'ucs') return;
      // Stabil rendezés: egyenlő költségnél a korábban felvett csomópont marad elöl.
      front = front.map((id, i) => [id, i]).sort((a, b) => nodes[a[0]].cost - nodes[b[0]].cost || a[1] - b[1]).map((p) => p[0]);
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
            if (strategy === 'ucs' && nodes[inFront].cost > n.cost + c) {
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
        visits, generated: nodes.length, maxFront, front: [...front], strategy, limit
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

  /** Futtatás név szerint, az IDS-t is beleértve, egyforma alakú eredménnyel. @param {Adjacency} adj @param {string} start @param {string} goal @param {Omit<SearchOptions, 'strategy'> & {strategy?: 'bfs'|'ucs'|'dfs'|'dls'|'ids', maxDepth?:number}} opts */
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
   * @param {{title?:string, id?:string, showCost?:boolean, showVisit?:boolean, gap?:number, step?:number, levels?:boolean, current?:boolean, name?:(n:TreeNode, label:string) => string}} [opt]
   */
  function treeSvg(trace, opt = {}) {
    const snap = snapshot(trace, opt.step ?? trace.steps.length);
    const shown = trace.nodes.filter((n) => n.id < snap.generated);
    const lay = layoutTree(shown);
    const lab = labels(trace.nodes);
    const gap = opt.gap || 96, rowH = opt.showCost ? 74 : 62, pad = opt.levels ? 52 : 10;
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
      if (opt.showVisit !== false && visited(n)) meta.push(`#${n.visit}`);
      if (opt.showCost) meta.push(`${num(n.cost)}`);
      if (meta.length) s += `<text x="${x}" y="${y + 38}" text-anchor="middle" class="u-tmeta">${esc(meta.join(' · '))}</text>`;
      s += '</g>';
    });
    return s + '</svg>';
  }

  /**
   * Az állapotgráf (térkép) SVG-je; a csomópontok állapota CSS-osztályként jelenik meg.
   * @param {GraphDef} g
   * @param {{id?:string, title?:string, marks?:Record<string,string>, pathEdges?:string[], showGoal?:boolean}} [opt]
   */
  function graphSvg(g, opt = {}) {
    const marks = opt.marks || {};
    const onPath = new Set(opt.pathEdges || []);
    const inside = Object.keys(g.pos).every((n) => n.length <= 2);
    const r = inside ? 13 : 9;
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
      s += `<g class="u-gnode${m}${role}${inside ? ' u-gnode-in' : ''}"><circle cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${inside ? y + 5 : y + 24}" text-anchor="middle">${esc(n)}</text></g>`;
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

  return { CITY, ZH, ABSTRACT, CODE21, BINARY, GRAPHS, neighbors, states, pathOf, search, ids, run, labels, labelText,
    parseGraph, circleLayout, layoutTree, snapshot, treeSvg, graphSvg, complexity, gomoku, puzzleMoves, puzzleSpace, esc };
})();
if (typeof module !== 'undefined') module.exports = CourseSearch;
