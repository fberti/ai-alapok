// 08 · Genetikus algoritmusok: a fejezet tesztelt számítási modellje.
// Minden véletlen lépés egy magból (seed) induló, megismételhető generátort használ.
const CourseGenetic = (() => {
  /* ---------- Véletlen ---------- */
  /** Kis, megismételhető véletlenszám-generátor (mulberry32). @param {number} seed */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Rátermettség ---------- */
  /** A piros téglalapok száma (PDF 264.): az egyesek száma. @param {number[]} bits */
  const countOnes = (bits) => bits.reduce((s, b) => s + b, 0);
  /** Az n × n-es bittérkép célmintája: fekete (0) a két átlón, fehér (1) máshol. @param {number} n */
  function diagonalsTarget(n) {
    const t = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) t.push(r === c || r + c === n - 1 ? 0 : 1);
    return t;
  }
  /** Hány pozíción egyezik a kromoszóma a célmintával? @param {number[]} bits @param {number[]} target */
  const matches = (bits, target) => bits.reduce((s, b, i) => s + (b === target[i] ? 1 : 0), 0);
  /** A 16_Genetikus_algoritmus_hatizsak.py tárgyai: [súly, érték], és a teherbírás. */
  const KNAPSACK = { items: [[1, 2], [2, 3], [2, 4], [4, 5], [3, 7], [6, 9]], cap: 10 };
  /** A kód kiértékelése: túlsúly esetén 0. @param {number[]} bits */
  function knapsack(bits, items = KNAPSACK.items, cap = KNAPSACK.cap) {
    let weight = 0, value = 0;
    bits.forEach((b, i) => { if (b) { weight += items[i][0]; value += items[i][1]; } });
    return { weight, value, fitness: weight > cap ? 0 : value };
  }
  /** Bináris genotípus visszafejtése a [lo, hi] intervallum egy számára. @param {number[]} bits @param {number} lo @param {number} hi */
  function decodeReal(bits, lo, hi) {
    const k = bits.reduce((s, b) => s * 2 + b, 0);
    return lo + (hi - lo) * k / (2 ** bits.length - 1);
  }

  /* ---------- Kiválasztás ---------- */
  /** Rátermettség-arányos (rulett) valószínűségek. @param {number[]} fit */
  function rouletteProbs(fit) {
    if (fit.some((f) => f < 0)) throw Error('A rulettkerékhez nemnegatív rátermettség kell.');
    const sum = fit.reduce((s, f) => s + f, 0);
    return sum === 0 ? fit.map(() => 1 / fit.length) : fit.map((f) => f / sum);
  }
  /** Átlagos rangok: a leggyengébb rangja 1, egyenlőségnél a rangok átlaga. @param {number[]} fit */
  function ranks(fit) {
    const order = fit.map((f, i) => [f, i]).sort((a, b) => a[0] - b[0]);
    /** @type {number[]} */
    const r = new Array(fit.length);
    for (let s = 0; s < order.length;) {
      let e = s;
      while (e + 1 < order.length && order[e + 1][0] === order[s][0]) e++;
      for (let k = s; k <= e; k++) r[order[k][1]] = (s + e) / 2 + 1;
      s = e + 1;
    }
    return r;
  }
  /** Lineáris rangsoroló kiválasztás: a valószínűség a ranggal arányos. @param {number[]} fit */
  function linearRankProbs(fit) {
    const r = ranks(fit), sum = r.reduce((s, x) => s + x, 0);
    return r.map((x) => x / sum);
  }
  /** Versenyeztetés k résztvevővel, visszatevéssel; döntetlennél egyenlő esély. @param {number[]} fit @param {number} [k] */
  function tournamentProbs(fit, k = 2) {
    const n = fit.length, values = [...new Set(fit)].sort((a, b) => a - b);
    let below = 0;
    /** @type {Map<number, number>} */
    const share = new Map();
    for (const v of values) {
      const count = fit.filter((f) => f === v).length;
      const pGroup = ((below + count) / n) ** k - (below / n) ** k;
      share.set(v, pGroup / count);
      below += count;
    }
    return fit.map((f) => /** @type {number} */ (share.get(f)));
  }
  /** A PDF 274. oldalának rangsor alapú túlélési valószínűségei, a legjobbtól a legrosszabbig. @param {number} n @param {number} P */
  function pdfRankProbs(n, P) {
    if (!(P > 0 && P < 1)) throw Error('A P paraméter 0 és 1 közé essen.');
    const p = [];
    for (let i = 1; i < n; i++) p.push(P * (1 - P) ** (i - 1));
    p.push((1 - P) ** (n - 1));
    return p;
  }
  /** Index kiválasztása a halmozott valószínűségek alapján. @param {number[]} probs @param {number} r 0 ≤ r < 1 */
  function pick(probs, r) {
    let c = 0;
    for (let i = 0; i < probs.length; i++) { c += probs[i]; if (r < c) return i; }
    return probs.length - 1;
  }

  /* ---------- Genetikus operátorok ---------- */
  /** Egypontos keresztezés: a vágás a cut. gén előtt van. @template T @param {T[]} a @param {T[]} b @param {number} cut */
  function onePoint(a, b, cut) {
    if (cut < 1 || cut >= a.length) throw Error('A vágási pont 1 és a hossz − 1 közé essen.');
    return [[...a.slice(0, cut), ...b.slice(cut)], [...b.slice(0, cut), ...a.slice(cut)]];
  }
  /** Kétpontos keresztezés: az [i, j) szakasz cserél gazdát. @template T @param {T[]} a @param {T[]} b @param {number} i @param {number} j */
  function twoPoint(a, b, i, j) {
    const [lo, hi] = i <= j ? [i, j] : [j, i];
    return [[...a.slice(0, lo), ...b.slice(lo, hi), ...a.slice(hi)], [...b.slice(0, lo), ...a.slice(lo, hi), ...b.slice(hi)]];
  }
  /** Egyenletes keresztezés: ahol a maszk igaz, ott cserélnek a szülők. @template T @param {T[]} a @param {T[]} b @param {boolean[]} mask */
  function uniform(a, b, mask) {
    return [a.map((g, i) => (mask[i] ? b[i] : g)), b.map((g, i) => (mask[i] ? a[i] : g))];
  }
  /** Útvonal-újrakapcsolás: köztes megoldások, balról jobbra egy-egy eltérő gént átírva. @template T @param {T[]} a @param {T[]} b */
  function pathRelink(a, b) {
    const steps = [];
    let cur = [...a];
    for (let i = 0; i < a.length; i++) {
      if (cur[i] === b[i]) continue;
      cur = [...cur];
      cur[i] = b[i];
      if (cur.some((g, k) => g !== b[k])) steps.push(cur);
    }
    return steps;
  }
  /** Mutáció: egy gén értékét másik allélra cseréljük. @template T @param {T[]} a @param {number} pos @param {T} value */
  function mutate(a, pos, value) { const c = [...a]; c[pos] = value; return c; }

  /* ---------- Távolság és változatosság ---------- */
  /** @param {number[]} a @param {number[]} b */
  const hamming = (a, b) => a.reduce((s, x, i) => s + (x !== b[i] ? 1 : 0), 0);
  /** @param {number[]} a @param {number[]} b */
  const manhattan = (a, b) => a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0);
  /** @param {number[]} a @param {number[]} b */
  const euclidean = (a, b) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
  /** Egyedenkénti változatosság: a többiektől mért távolságok összege (PDF 273.). @param {number[][]} pop @param {(a:number[], b:number[]) => number} [dist] */
  const diversity = (pop, dist = hamming) => pop.map((a) => pop.reduce((s, b) => s + dist(a, b), 0));

  /* ---------- Teljes genetikus algoritmus ---------- */
  /** @typedef {{name:string, length:number, optimum:number, fitness:(b:number[]) => number}} Problem */
  /** @type {Record<string, Problem>} */
  const PROBLEMS = {
    teglalap: { name: '12 téglalap', length: 12, optimum: 12, fitness: countOnes },
    atlok: { name: '5 × 5 bittérkép, két átló', length: 25, optimum: 25, fitness: (b) => matches(b, diagonalsTarget(5)) },
    hatizsak: { name: 'Hátizsák, 6 tárgy', length: 6, optimum: 18, fitness: (b) => knapsack(b).fitness }
  };
  /**
   * @typedef {{problem:string, popSize:number, pc:number, pm:number, selection:'rulett'|'verseny'|'rang',
   *   crossover:'egy'|'ket'|'egyenletes', elite:number, maxGen:number, plateau:number, seed:number}} GaConfig
   * @typedef {{gen:number, best:number, avg:number, bestBits:number[]}} GaStep
   */
  /** @param {Partial<GaConfig>} cfg */
  function runGA(cfg) {
    /** @type {GaConfig} */
    const c = { problem: 'teglalap', popSize: 16, pc: 0.7, pm: 0.01, selection: 'verseny', crossover: 'egy', elite: 1, maxGen: 100, plateau: 0, seed: 1, ...cfg };
    const prob = PROBLEMS[c.problem];
    if (!prob) throw Error(`Ismeretlen feladat: ${c.problem}`);
    if (c.popSize < 2) throw Error('A populáció legalább kételemű legyen.');
    const r = rng(c.seed), L = prob.length;
    /** @type {number[][]} */
    let pop = Array.from({ length: c.popSize }, () => Array.from({ length: L }, () => (r() < 0.5 ? 1 : 0)));
    /** @type {GaStep[]} */
    const history = [];
    let bestSoFar = -Infinity, lastImprove = 0, reason = '';
    for (let gen = 0; ; gen++) {
      const fit = pop.map(prob.fitness);
      const bi = fit.indexOf(Math.max(...fit));
      history.push({ gen, best: fit[bi], avg: fit.reduce((s, f) => s + f, 0) / fit.length, bestBits: pop[bi] });
      if (fit[bi] > bestSoFar) { bestSoFar = fit[bi]; lastImprove = gen; }
      if (fit[bi] >= prob.optimum) { reason = 'megoldas'; break; }
      if (gen >= c.maxGen) { reason = 'generacio'; break; }
      if (c.plateau > 0 && gen - lastImprove >= c.plateau) { reason = 'plato'; break; }
      const probs = c.selection === 'rulett' ? rouletteProbs(fit) : c.selection === 'rang' ? linearRankProbs(fit) : null;
      const select = () => {
        if (probs) return pop[pick(probs, r())];
        const i = Math.floor(r() * pop.length), j = Math.floor(r() * pop.length);
        return pop[fit[i] >= fit[j] ? i : j];
      };
      const order = fit.map((f, i) => [f, i]).sort((a, b) => b[0] - a[0]);
      /** @type {number[][]} */
      const next = order.slice(0, Math.min(c.elite, c.popSize)).map(([, i]) => [...pop[i]]);
      while (next.length < c.popSize) {
        const a = select(), b = select();
        let kids = [[...a], [...b]];
        if (r() < c.pc) {
          if (c.crossover === 'egy') kids = onePoint(a, b, 1 + Math.floor(r() * (L - 1)));
          else if (c.crossover === 'ket') kids = twoPoint(a, b, Math.floor(r() * (L + 1)), Math.floor(r() * (L + 1)));
          else kids = uniform(a, b, a.map(() => r() < 0.5));
        }
        for (const kid of kids) {
          for (let g = 0; g < L; g++) if (r() < c.pm) kid[g] = 1 - kid[g];
          if (next.length < c.popSize) next.push(kid);
        }
      }
      pop = next;
    }
    return { history, reason, generations: history.length - 1, best: history[history.length - 1] };
  }

  /* ---------- Populáció egy függvény felszínén ---------- */
  /** Két csúcsú felszín a [0, 1] × [0, 1] négyzeten: széles helyi és keskeny globális csúcs. @param {number} x @param {number} y */
  const landscape = (x, y) => 0.75 * Math.exp(-((x - 0.25) ** 2 + (y - 0.3) ** 2) / (2 * 0.18 ** 2)) + Math.exp(-((x - 0.72) ** 2 + (y - 0.68) ** 2) / (2 * 0.08 ** 2));
  /** Normális eloszlású szám (Box–Muller). @param {() => number} r */
  const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const clamp01 = (/** @type {number} */ v) => Math.min(1, Math.max(0, v));
  /**
   * Generációk sorozata a felszínen. A „hegymaszo” egyelemű populáció, csak mutációval (PDF 260.).
   * @param {{mode?:'ga'|'hegymaszo', popSize?:number, generations?:number, sigma?:number, seed?:number, start?:[number, number]}} cfg
   */
  function runLandscape(cfg) {
    const { mode = 'ga', popSize = 30, generations = 60, sigma = 0.05, seed = 1, start = [0.2, 0.22] } = cfg;
    const r = rng(seed);
    /** @type {number[][]} */
    let pop = mode === 'hegymaszo' ? [[...start]] : Array.from({ length: popSize }, () => [r(), r()]);
    const frames = [pop.map((p) => [...p])];
    for (let g = 0; g < generations; g++) {
      if (mode === 'hegymaszo') {
        const [x, y] = pop[0], cand = [clamp01(x + sigma * gauss(r)), clamp01(y + sigma * gauss(r))];
        if (landscape(cand[0], cand[1]) >= landscape(x, y)) pop = [cand];
      } else {
        const fit = pop.map(([x, y]) => landscape(x, y));
        const select = () => { const i = Math.floor(r() * pop.length), j = Math.floor(r() * pop.length); return pop[fit[i] >= fit[j] ? i : j]; };
        const bi = fit.indexOf(Math.max(...fit));
        const next = [[...pop[bi]]];
        while (next.length < pop.length) {
          const a = select(), b = select();
          const kid = [r() < 0.5 ? a[0] : b[0], r() < 0.5 ? a[1] : b[1]];
          if (r() < 0.3) { kid[0] = clamp01(kid[0] + sigma * gauss(r)); kid[1] = clamp01(kid[1] + sigma * gauss(r)); }
          next.push(kid);
        }
        pop = next;
      }
      frames.push(pop.map((p) => [...p]));
    }
    return frames;
  }

  return { rng, countOnes, diagonalsTarget, matches, KNAPSACK, knapsack, decodeReal,
    rouletteProbs, ranks, linearRankProbs, tournamentProbs, pdfRankProbs, pick,
    onePoint, twoPoint, uniform, pathRelink, mutate, hamming, manhattan, euclidean, diversity,
    PROBLEMS, runGA, landscape, runLandscape };
})();
if (typeof module !== 'undefined') module.exports = CourseGenetic;
