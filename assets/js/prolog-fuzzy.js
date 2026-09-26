// 05 · A fejezet számítási modellje: kis Prolog-megoldó és fuzzy függvények.
// Klasszikus szkript, hogy közvetlen fájlmegnyitásnál is fusson. Node alatt modulként tesztelhető.
const CoursePrologFuzzy = (() => {
  /* ---------- Prolog ---------- */
  /** @typedef {{name: string, args: string[]}} Term */
  /** @typedef {{head: Term, body: Term[]}} Clause */
  /** @typedef {{kind: 'call'|'match'|'redo'|'fail'|'cut'|'prune'|'answer'|'done', depth: number, text: string}} Step */
  /** @typedef {Map<string, string>} Subst */

  /** @param {string} a */
  const isVar = (a) => /^[A-ZÁÉÍÓÖŐÚÜŰ_]/.test(a);
  /** A megoldó a változókat „név#sorszám” alakra nevezi át. Kiíráskor a sorszám elmarad. @param {string} a */
  const plain = (a) => a.split('#')[0];

  /** Egy atom vagy predikátum beolvasása: szebb(gina, ursula), !, true. @param {string} src @returns {Term} */
  function parseTerm(src) {
    const s = src.trim();
    if (s === '!') return { name: '!', args: [] };
    const m = /^([a-z][\wáéíóöőúüű]*)\s*(?:\((.*)\))?$/s.exec(s);
    if (!m) {
      if ((s.match(/\(/g) || []).length !== (s.match(/\)/g) || []).length) throw new Error(`Hiányzó vagy fölösleges zárójel: „${s}”.`);
      throw new Error(`Nem értelmezhető kifejezés: „${s}”.`);
    }
    const args = m[2] === undefined ? [] : m[2].split(',').map((a) => a.trim());
    if (args.some((a) => !/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű_][\wáéíóöőúüű]*$/.test(a))) throw new Error(`Az argumentumok csak atomok vagy változók lehetnek: „${s}”.`);
    return { name: m[1], args };
  }

  /** Program beolvasása. Minden klóz ponttal zárul, a törzs vesszővel tagolt. @param {string} src @returns {Clause[]} */
  function parseProgram(src) {
    return src.split(/\.(?=\s|$)/).map((c) => c.trim()).filter(Boolean).map((c) => {
      const [head, body] = c.split(':-');
      const goals = body === undefined ? [] : (body.match(/[^,()]+(?:\([^()]*\))?/g) || []).map(parseTerm);
      return { head: parseTerm(head), body: goals };
    });
  }

  /** @param {string} a @param {Subst} s @returns {string} */
  const walk = (a, s) => { let v = a; while (isVar(v) && s.has(v)) v = /** @type {string} */ (s.get(v)); return v; };
  /** @param {Term} t @param {Subst} s */
  const show = (t, s) => (t.args.length ? `${t.name}(${t.args.map((a) => plain(walk(a, s))).join(', ')})` : t.name);

  /** @param {Term} a @param {Term} b @param {Subst} s @returns {Subst | null} */
  function unify(a, b, s) {
    if (a.name !== b.name || a.args.length !== b.args.length) return null;
    const out = new Map(s);
    for (let i = 0; i < a.args.length; i += 1) {
      const x = walk(a.args[i], out), y = walk(b.args[i], out);
      if (x === y) continue;
      if (isVar(x)) out.set(x, y);
      else if (isVar(y)) out.set(y, x);
      else return null;
    }
    return out;
  }

  /**
   * Mélységi, balról jobbra haladó SLD-rezolúció vágással, lépésnaplóval.
   * @param {Clause[]} program @param {Term} query @param {{maxSteps?: number}} [opts]
   */
  function solve(program, query, opts = {}) {
    const maxSteps = opts.maxSteps ?? 400;
    /** @type {Step[]} */
    const steps = [];
    /** @type {string[]} */
    const answers = [];
    let fresh = 0;
    /** @param {Step['kind']} kind @param {number} depth @param {string} text */
    const log = (kind, depth, text) => {
      if (steps.length >= maxSteps) throw new Error(`A keresés ${maxSteps} lépés után sem ért véget. Valószínűleg végtelen ciklusba került.`);
      steps.push({ kind, depth, text });
    };
    /** @typedef {{term: Term, barrier: object}} Goal */

    /**
     * A visszatérési érték egy vágási korlát, ha egy vágás a hívási láncon feljebb lévő választási pontokat törli.
     * @param {Goal[]} goals @param {Subst} s @param {number} depth
     * @returns {Generator<Subst, object | null, void>}
     */
    function* run(goals, s, depth) {
      if (!goals.length) { yield s; return null; }
      const [first, ...rest] = goals;
      if (first.term.name === '!') {
        log('cut', depth, 'Vágás (!): a szabály eddigi választásai rögzülnek. A szabály többi klózát és a vágás előtti részcélok további megoldásait már nem próbáljuk.');
        const r = yield* run(rest, s, depth);
        return r ?? first.barrier;
      }
      const barrier = {};
      const shown = show(first.term, s);
      log('call', depth, `Cél: ${shown}`);
      const candidates = program.map((c, i) => ({ c, i })).filter(({ c }) => c.head.name === first.term.name && c.head.args.length === first.term.args.length);
      let tried = 0;
      for (const { c, i } of candidates) {
        const n = (fresh += 1);
        /** A névtelen változó minden előfordulása külön változó. @param {Term} t @returns {Term} */
        const rename = (t) => ({ name: t.name, args: t.args.map((a) => (a === '_' ? `_#${n}.${(fresh += 1)}` : isVar(a) ? `${a}#${n}` : a)) });
        const head = rename(c.head);
        const s2 = unify(head, first.term, s);
        if (!s2) continue;
        if (tried > 0) log('redo', depth, `Visszalépés a(z) ${shown} célhoz. A következő illeszkedő klózt próbáljuk: ${i + 1}. klóz.`);
        tried += 1;
        const bound = [...s2.keys()].filter((k) => !s.has(k)).map((k) => `${plain(k)} = ${plain(walk(k, s2))}`);
        const kind = c.body.length ? 'szabály' : 'tény';
        log('match', depth, `Illeszkedik a(z) ${i + 1}. klózra (${kind}): ${show(c.head, new Map())}.${bound.length ? ` Kötések: ${bound.join(', ')}.` : ''}${c.body.length ? ` Új részcélok: ${c.body.map((t) => show(rename(t), s2)).join(', ')}.` : ''}`);
        const r = yield* run([...c.body.map((t) => ({ term: rename(t), barrier })), ...rest], s2, depth + 1);
        if (r === barrier) { log('prune', depth, `A vágás miatt a(z) ${shown} cél többi klózát nem próbáljuk.`); return null; }
        if (r) {
          if (candidates.at(-1)?.i !== i) log('prune', depth, `A vágás miatt a(z) ${shown} cél többi illeszkedő klóza kimarad.`);
          return r;
        }
      }
      log('fail', depth, tried ? `A(z) ${shown} célnak nincs több megoldása. Visszalépünk.` : `Zsákutca: a(z) ${shown} célra nincs illeszkedő tény vagy szabály. A cél meghiúsul.`);
      return null;
    }

    const vars = [...new Set(query.args.filter(isVar))];
    const top = run([{ term: query, barrier: {} }], new Map(), 0);
    for (let r = top.next(); !r.done; r = top.next()) {
      const s = r.value;
      const text = vars.length ? vars.map((v) => `${v} = ${plain(walk(v, s))}`).join(', ') : 'true';
      answers.push(text);
      log('answer', 0, `Megoldás: ${text}. Újabb válaszért a Prolog visszalép a legutóbbi választási ponthoz.`);
    }
    log('done', 0, answers.length ? `Nincs több megoldás. Összesen ${answers.length} válasz. A végső „false” csak ennyit jelent, a korábbi válaszokat nem vonja vissza.` : 'Nincs megoldás: a Prolog a „false” választ adja.');
    return { steps, answers };
  }

  /** A PDF 127. oldalának programja mai jelöléssel. @param {{reversed?: boolean, cut?: boolean, extra?: boolean}} o */
  function kleopatraSource(o) {
    const facts = ['szebb(kleopatra, gina).', 'szebb(gina, ursula).'];
    if (o.reversed) facts.reverse();
    if (o.extra) facts.push('szebb(anna, gina).');
    return [...facts, `sokkal_szebb(A, C) :- szebb(A, B), ${o.cut ? '!, ' : ''}szebb(B, C).`].join('\n');
  }
  /** @param {{reversed?: boolean, cut?: boolean, extra?: boolean}} o */
  const kleopatra = (o) => solve(parseProgram(kleopatraSource(o)), parseTerm('sokkal_szebb(Valaki, ursula)'));

  /* ---------- Fuzzy ---------- */
  /** @param {number} x @param {number} a @param {number} b @param {number} c */
  function triangle(x, a, b, c) {
    if (x < a || x > c) return 0;
    if (x === b) return 1;
    return x < b ? (x - a) / (b - a) : (c - x) / (c - b);
  }
  /** @param {number} x @param {number} a @param {number} b @param {number} c @param {number} d */
  function trapezoid(x, a, b, c, d) {
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    return x < b ? (x - a) / (b - a) : (d - x) / (d - c);
  }
  /** Rámpa: a alatt 0, b fölött 1. @param {number} x @param {number} a @param {number} b */
  const ramp = (x, a, b) => (x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a));
  /** @param {number} x @param {number} mean @param {number} sigma */
  const gauss = (x, mean, sigma) => Math.exp(-0.5 * ((x - mean) / sigma) ** 2);
  /** Általánosított harang: a a szélesség, b a meredekség, c a közép. @param {number} x @param {number} a @param {number} b @param {number} c */
  const bell = (x, a, b, c) => 1 / (1 + Math.abs((x - c) / a) ** (2 * b));
  /** A jegyzet leolvasása a PDF 134. oldalának ábrájáról. @param {number} x */
  const horihorgas = (x) => ramp(x, 155, 205);

  /** @typedef {'ramp'|'triangle'|'trapezoid'|'gauss'|'bell'} ShapeName */
  /** @param {ShapeName} name @param {number} x @param {Record<string, number>} p */
  function shape(name, x, p) {
    const v = Object.values(p);
    if (!v.every(Number.isFinite)) throw new Error('Minden paraméter véges szám legyen.');
    const ordered = (/** @type {number[]} */ xs) => xs.every((q, i) => i === 0 || xs[i - 1] <= q);
    if (name === 'ramp') { if (!(p.a < p.b)) throw new Error('A rámpánál a < b sorrend kell.'); return ramp(x, p.a, p.b); }
    if (name === 'triangle') { if (!ordered([p.a, p.b, p.c]) || p.a === p.c) throw new Error('A háromszögnél a ≤ b ≤ c sorrend kell, és a < c.'); return triangle(x, p.a, p.b, p.c); }
    if (name === 'trapezoid') { if (!ordered([p.a, p.b, p.c, p.d]) || p.a === p.d) throw new Error('A trapéznál a ≤ b ≤ c ≤ d sorrend kell, és a < d.'); return trapezoid(x, p.a, p.b, p.c, p.d); }
    if (name === 'gauss') { if (!(p.sigma > 0)) throw new Error('A szórás legyen pozitív.'); return gauss(x, p.mean, p.sigma); }
    if (name === 'bell') { if (!(p.a > 0 && p.b > 0)) throw new Error('A szélesség és a meredekség legyen pozitív.'); return bell(x, p.a, p.b, p.c); }
    throw new Error('Ismeretlen görbe.');
  }

  /** A PDF 136. oldalának öt hőmérsékleti halmaza (°C). @param {number} x */
  const temperature = (x) => ({
    nagyonAlacsony: trapezoid(x, -Infinity, -Infinity, 19, 25),
    alacsony: triangle(x, 19, 25, 31),
    kozepes: trapezoid(x, 25, 31, 35, 41),
    magas: triangle(x, 35, 41, 47),
    nagyonMagas: trapezoid(x, 41, 47, Infinity, Infinity)
  });

  /** Súlypont darabonként lineáris közelítéssel, sűrű rácson. @param {(x: number) => number} f @param {number} lo @param {number} hi */
  function centroidOf(f, lo, hi, n = 6000) {
    let area = 0, moment = 0;
    let x1 = lo, y1 = f(lo);
    for (let i = 1; i <= n; i += 1) {
      const x2 = lo + ((hi - lo) * i) / n, y2 = f(x2), w = x2 - x1;
      area += (w * (y1 + y2)) / 2;
      moment += (w * (x1 * (2 * y1 + y2) + x2 * (y1 + 2 * y2))) / 6;
      x1 = x2; y1 = y2;
    }
    return area > 1e-12 ? moment / area : null;
  }

  const EXAM_OUT = {
    jo: (/** @type {number} */ g) => triangle(g, 3, 4, 5),
    jeles: (/** @type {number} */ g) => triangle(g, 4, 5, 5)
  };
  /** A PDF 140. oldalának két szabálya a jegyzet saját skáláival. @param {number} score @param {number} hours */
  function exam(score, hours) {
    if (!Number.isFinite(score) || score < 0 || score > 100 || !Number.isFinite(hours) || hours < 0 || hours > 12) {
      throw new Error('A pontszám 0–100, az óraszám 0–12 közötti szám legyen.');
    }
    const memberships = {
      kozepes: triangle(score, 30, 50, 70), jo: triangle(score, 50, 70, 90), kivalo: trapezoid(score, 70, 90, 100, 100),
      ritka: trapezoid(hours, 0, 0, 3, 9), gyakori: trapezoid(hours, 3, 9, 12, 12)
    };
    const rules = [
      { name: 'R1', label: /** @type {'jeles'|'jo'} */ ('jeles'), peak: 5, strength: Math.min(memberships.jo, memberships.ritka) },
      { name: 'R2', label: /** @type {'jeles'|'jo'} */ ('jo'), peak: 4, strength: Math.min(memberships.kozepes, memberships.gyakori) }
    ];
    /** @param {number} g */
    const aggregate = (g) => Math.max(...rules.map((r) => Math.min(r.strength, EXAM_OUT[r.label](g))));
    const total = rules.reduce((a, r) => a + r.strength, 0);
    const best = rules.reduce((a, r) => (r.strength > a.strength ? r : a));
    const points = Array.from({ length: 201 }, (_, i) => { const g = 1 + i * 0.02; return { x: g, y: aggregate(g) }; });
    return {
      memberships, rules, points,
      centroid: total > 0 ? centroidOf(aggregate, 1, 5) : null,
      weighted: total > 0 ? rules.reduce((a, r) => a + r.peak * r.strength, 0) / total : null,
      maxRule: best.strength > 0 ? { name: best.name, label: best.label, peak: best.peak } : null
    };
  }

  /** A resources/code/11_Fuzzy.py szabályai folytonos kimeneti tengelyen. @param {number} t @param {number} target */
  function thermostat(t, target) {
    /** @param {number} x */
    const five = (x) => ({ veryCold: triangle(x, 0, 0, 10), cold: triangle(x, 0, 10, 20), warm: triangle(x, 10, 20, 30), hot: triangle(x, 20, 30, 40), veryHot: triangle(x, 30, 40, 40) });
    const a = five(t), b = five(target);
    const strengths = {
      heat: Math.min(Math.max(a.cold, a.veryCold), b.warm),
      cool: Math.min(Math.max(a.hot, a.veryHot), b.warm),
      noChange: Math.min(a.warm, b.warm)
    };
    /** @param {number} y */
    const agg = (y) => Math.max(Math.min(strengths.cool, triangle(y, 0, 0, 1.5)), Math.min(strengths.noChange, triangle(y, 0, 1.5, 3)), Math.min(strengths.heat, triangle(y, 1.5, 3, 3)));
    return { inputs: { temperature: a, target: b }, strengths, centroid: centroidOf(agg, 0, 3) };
  }

  return { parseTerm, parseProgram, solve, kleopatra, kleopatraSource, triangle, trapezoid, ramp, gauss, bell, horihorgas, shape, temperature, exam, thermostat };
})();
if (typeof module !== 'undefined') module.exports = CoursePrologFuzzy;
