// 11 · Zárthelyi-gyakorló: a minta-zh számolós feladatainak tesztelt modellje és a változatgenerátor.
// Klasszikus szkript: a böngészőben CourseZh néven, Node alatt modulként érhető el.
const CourseZh = (() => {
  /* ---------- Véletlen ---------- */
  /** Megismételhető álvéletlen-generátor (mulberry32). @param {number} seed */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** Egész szám [lo, hi]-ből. @param {() => number} r @param {number} lo @param {number} hi */
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  /* ---------- 4. feladat: a minta-zh ReLU-hálója ---------- */
  /** A minta-zh 4. feladatának súlyai. A h2 → g2 és h3 → g2 él súlya 2, a g2 torzítása −25. */
  const NET = {
    hidden1: [[3, -2, 2], [1, 0, 4], [3, 2, 0]],
    hidden2: [[2, 2, -2], [0, 2, 2]],
    bias2: [0, -25],
    out: [3, 5]
  };
  /** @param {number} a */
  const relu = (a) => Math.max(0, a);
  /** @param {number[]} w @param {number[]} x */
  const dot = (w, x) => w.reduce((s, wi, i) => s + wi * x[i], 0);
  /**
   * Előreterjesztés. Az out opcionálisan a kimeneti neuron aktivációs függvénye.
   * @param {number[]} x @param {{out?:'relu'|'linear'|'step'|'sigmoid'}} [opt]
   */
  function net(x, opt = {}) {
    const a1 = NET.hidden1.map((w) => dot(w, x));
    const o1 = a1.map(relu);
    const a2 = NET.hidden2.map((w, i) => dot(w, o1) + NET.bias2[i]);
    const o2 = a2.map(relu);
    const ay = dot(NET.out, o2);
    const f = opt.out || 'relu';
    const y = f === 'linear' ? ay : f === 'step' ? (ay > 0 ? 1 : 0) : f === 'sigmoid' ? 1 / (1 + Math.exp(-ay)) : relu(ay);
    const differ = [...a1.map((a, i) => [a, o1[i]]), ...a2.map((a, i) => [a, o2[i]]), [ay, y]].filter(([a, o]) => a !== o).length;
    return { a1, o1, a2, o2, ay, y, differ };
  }

  /* ---------- 7. feladat: a minta-zh fuzzy ventilátora ---------- */
  /**
   * Háromszög (bal talp, csúcs, jobb talp). Ha a csúcs egybeesik egy talppal, a görbe ott váll.
   * @param {number} a @param {number} b @param {number} c @returns {(x:number) => number}
   */
  const tri = (a, b, c) => (x) => {
    if (x === b) return 1;
    if (x < b) return a === b ? 1 : x <= a ? 0 : (x - a) / (b - a);
    return b === c ? 1 : x >= c ? 0 : (c - x) / (c - b);
  };
  /** @typedef {{key:string, name:string, abc:[number,number,number]}} Term */
  /** @type {{hom:Term[], para:Term[], seb:Term[]}} */
  const FUZZY = {
    hom: [{ key: 'NA', name: 'Nagyon alacsony', abc: [0, 0, 10] }, { key: 'A', name: 'Alacsony', abc: [5, 10, 20] }, { key: 'K', name: 'Közepes', abc: [15, 20, 25] }, { key: 'M', name: 'Magas', abc: [20, 30, 35] }, { key: 'NM', name: 'Nagyon magas', abc: [30, 40, 40] }],
    para: [{ key: 'NSz', name: 'Nagyon száraz', abc: [0, 0, 20] }, { key: 'Sz', name: 'Száraz', abc: [10, 25, 40] }, { key: 'K', name: 'Közepes', abc: [30, 50, 70] }, { key: 'N', name: 'Nedves', abc: [60, 75, 90] }, { key: 'NN', name: 'Nagyon nedves', abc: [80, 100, 100] }],
    seb: [{ key: 'NA', name: 'Nagyon alacsony', abc: [0, 10, 20] }, { key: 'A', name: 'Alacsony', abc: [20, 30, 40] }, { key: 'K', name: 'Közepes', abc: [40, 50, 60] }, { key: 'M', name: 'Magas', abc: [60, 70, 80] }, { key: 'NM', name: 'Nagyon magas', abc: [80, 90, 100] }]
  };
  /** A minta-zh öt szabálya: [HŐM, PÁRA, SEBESSÉG], ÉS kapcsolattal. */
  const RULES = [['NA', 'NN', 'NA'], ['A', 'K', 'A'], ['K', 'K', 'K'], ['M', 'Sz', 'M'], ['NM', 'Sz', 'NM']];
  /** @param {Term[]} terms @param {number} x @returns {Record<string, number>} */
  const memberships = (terms, x) => Object.fromEntries(terms.map((t) => [t.key, tri(...t.abc)(x)]));
  /**
   * Mamdani-kiértékelés: ÉS = minimum, egyesítés = maximum, súlypont numerikus integrálással.
   * @param {number} hom @param {number} para @param {Array<[string,string,string]>} [extra] további szabályok
   */
  function fuzzy(hom, para, extra = []) {
    const mh = memberships(FUZZY.hom, hom), mp = memberships(FUZZY.para, para);
    const rules = RULES.concat(extra).map(([h, p, o]) => ({ h, p, o, value: Math.min(mh[h], mp[p]) }));
    /** @type {Record<string, number>} */
    const level = {};
    rules.forEach((r) => { level[r.o] = Math.max(level[r.o] || 0, r.value); });
    const fs = FUZZY.seb.map((t) => ({ f: tri(...t.abc), cut: level[t.key] || 0 }));
    let num = 0, den = 0;
    for (let i = 0; i <= 20000; i += 1) {
      const x = i / 200;
      const mu = Math.max(...fs.map((s) => Math.min(s.cut, s.f(x))));
      num += mu * x; den += mu;
    }
    return { mh, mp, rules, level, centroid: den > 0 ? num / den : null };
  }

  /* ---------- 9. feladat: a 8 lámpa ---------- */
  const LAMPS = 'ABCDEFGH'.split('');
  const BRIGHT = [8, 6, 10, 4, 7, 5, 9, 12];
  const ENERGY = [5, 4, 7, 3, 6, 2, 6, 9];
  const LIMIT = 20;
  /** Bekapcsolt lámpák betűiből kromoszóma. @param {string} on */
  const encode = (on) => LAMPS.map((l) => (on.includes(l) ? '1' : '0')).join('');
  /** @param {string} bits */
  const decode = (bits) => LAMPS.filter((_, i) => bits[i] === '1');
  /** Fitnesz: az összfényerő, de 0, ha az energia 20 fölött van (a kurzus hátizsákprogramjának szabálya). @param {string} bits */
  function lamps(bits) {
    let energy = 0, bright = 0;
    [...bits].forEach((b, i) => { if (b === '1') { energy += ENERGY[i]; bright += BRIGHT[i]; } });
    return { on: decode(bits), energy, bright, fitness: energy <= LIMIT ? bright : 0 };
  }
  /** Egypontos keresztezés a k. bit után. @param {string} p @param {string} q @param {number} k */
  const cross1 = (p, q, k) => [p.slice(0, k) + q.slice(k), q.slice(0, k) + p.slice(k)];
  /** Kétpontos keresztezés: a középső szakasz (i. bit után, j. bitig) cserélődik. @param {string} p @param {string} q @param {number} i @param {number} j */
  const cross2 = (p, q, i, j) => [p.slice(0, i) + q.slice(i, j) + p.slice(j), q.slice(0, i) + p.slice(i, j) + q.slice(j)];
  /** Bitmutáció az n. biten (1-től számozva). @param {string} bits @param {number} n */
  const mutate = (bits, n) => bits.slice(0, n - 1) + (bits[n - 1] === '1' ? '0' : '1') + bits.slice(n);

  /**
   * Egy teljes, a minta-zh 9. feladatával azonos menetű generáció.
   * @param {string[]} pop négy kromoszóma @param {[[number,number],[number,number]]} pairs a két verseny (0-tól számozott indexek)
   * @param {number} k a keresztezési pont @param {number} elite az elit mérete
   */
  function generation(pop, pairs, k, elite = 3) {
    const fit = pop.map((b) => lamps(b).fitness);
    // Versenyeztetés: a nagyobb fitnesz nyer; döntetlennél az elsőként felsorolt.
    const parents = pairs.map(([a, b]) => (fit[b] > fit[a] ? b : a));
    const kids = cross1(pop[parents[0]], pop[parents[1]], k);
    const all = pop.concat(kids).map((bits, i) => ({ name: `C${i + 1}`, bits, fitness: lamps(bits).fitness }));
    const ranked = all.slice().sort((x, y) => y.fitness - x.fitness || Number(x.name.slice(1)) - Number(y.name.slice(1)));
    const tieAtCut = ranked.length > elite && ranked[elite - 1].fitness === ranked[elite].fitness;
    return { fit, parents, kids, all, ranked, elite: ranked.slice(0, elite), rest: ranked.slice(elite), tieAtCut };
  }

  /* ---------- Változatgenerátor ---------- */
  /** Új bemenet a hálóhoz: egész számok −5 … 5 között, legalább egy rejtett neuron negatív potenciállal. @param {number} seed */
  function netVariant(seed) {
    const r = rng(seed);
    for (;;) {
      const x = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)];
      const t = net(x);
      if (t.differ >= 1 && t.ay !== 0 && t.a2.every((a) => a !== 0)) return { x, ...t };
    }
  }
  /** Új bemenet a fuzzy feladathoz: egész HŐM és PÁRA, legalább egy pozitív értékű szabállyal. @param {number} seed */
  function fuzzyVariant(seed) {
    const r = rng(seed);
    for (;;) {
      const hom = int(r, 0, 40), para = int(r, 0, 100);
      const t = fuzzy(hom, para);
      if (t.centroid !== null) return { hom, para, ...t };
    }
  }
  /** Új populáció a lámpafeladathoz: egyértelmű versenyek és elit. @param {number} seed */
  function lampVariant(seed) {
    const r = rng(seed);
    for (;;) {
      const pop = [0, 1, 2, 3].map(() => LAMPS.map(() => (r() < 0.45 ? '1' : '0')).join(''));
      const k = int(r, 2, 6);
      const fit = pop.map((b) => lamps(b).fitness);
      if (new Set(pop).size < 4 || fit.filter((f) => f === 0).length !== 1) continue;
      const zero = fit.indexOf(0), others = [0, 1, 2, 3].filter((i) => i !== zero);
      /** @type {[[number,number],[number,number]]} */
      const pairs = [[others[0], zero], [others[1], others[2]]];
      if (fit[pairs[1][0]] === fit[pairs[1][1]]) continue;
      const g = generation(pop, pairs, k);
      if (g.parents[0] === g.parents[1] || g.tieAtCut || g.rest[0].fitness === g.rest[1].fitness) continue;
      return { pop, pairs, k, ...g };
    }
  }

  /** Magyar számformátum legfeljebb d tizedessel. @param {number} n @param {number} [d] */
  const fmt = (n, d = 2) => {
    const s = Number.isInteger(n) ? String(n) : n.toFixed(d).replace(/0+$/, '').replace(/\.$/, '');
    return s.replace('-', '−').replace('.', ',');
  };

  return { rng, NET, net, tri, FUZZY, RULES, memberships, fuzzy, LAMPS, BRIGHT, ENERGY, LIMIT, encode, decode, lamps, cross1, cross2, mutate, generation, netVariant, fuzzyVariant, lampVariant, fmt };
})();
if (typeof module !== 'undefined') module.exports = CourseZh;
