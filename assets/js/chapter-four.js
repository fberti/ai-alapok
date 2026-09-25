// 04 · A fejezet interaktív bemutatói.
(() => {
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** @param {string} s */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* Tartalomjegyzék: az aktuális rész jelölése */
  function initToc() {
    const links = [...document.querySelectorAll('.toc a[href^="#"]')];
    if (!('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((a) => [(a.getAttribute('href') || '').slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const link = byId.get(entry.target.id);
        if (link) link.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) observer.observe(s); });
  }

  /* 1 · Formulavizsgáló – PDF 98–102. */
  /** @typedef {{t: 'var', n: string} | {t: 'const', v: boolean} | {t: 'not', a: Node} | {t: 'and'|'or'|'imp'|'eqv', a: Node, b: Node}} Node */
  const OPS = { and: '∧', or: '∨', imp: '→', eqv: '≡' };
  const PREC = { eqv: 1, imp: 2, or: 3, and: 4, not: 5, var: 6, const: 6 };

  /** Jelsorozat szétbontása. @param {string} src */
  function tokenize(src) {
    /** @type {{k: string, v?: string, pos: number}[]} */
    const out = [];
    const table = [['<->', 'eqv'], ['<=>', 'eqv'], ['==', 'eqv'], ['≡', 'eqv'], ['↔', 'eqv'], ['->', 'imp'], ['=>', 'imp'], ['→', 'imp'], ['⇒', 'imp'],
      ['∧', 'and'], ['&', 'and'], ['∨', 'or'], ['|', 'or'], ['¬', 'not'], ['!', 'not'], ['~', 'not'], ['-', 'not'], ['(', '('], ['[', '['], [')', ')'], [']', ']']];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (/\s/.test(ch)) { i += 1; continue; }
      const hit = table.find(([s]) => src.startsWith(s, i));
      if (hit) { out.push({ k: hit[1], pos: i }); i += hit[0].length; continue; }
      const m = /^[a-z][a-z0-9]*/.exec(src.slice(i));
      if (m) { out.push({ k: 'var', v: m[0], pos: i }); i += m[0].length; continue; }
      if (ch === 'T' || ch === 'F') { out.push({ k: 'const', v: ch, pos: i }); i += 1; continue; }
      throw new Error(`Ismeretlen jel a(z) ${i + 1}. helyen: „${ch}”. Változónak kisbetűt, konstansnak T-t vagy F-et használj.`);
    }
    return out;
  }

  /** Rekurzív leszálló elemző a PDF precedenciasorrendjével. @param {string} src @returns {Node} */
  function parse(src) {
    const toks = tokenize(src);
    if (!toks.length) throw new Error('Üres a formula.');
    let i = 0;
    const peek = () => toks[i];
    const where = () => (peek() ? `a(z) ${peek().pos + 1}. helyen` : 'a formula végén');
    /** @returns {Node} */
    const eqv = () => { let a = imp(); while (peek() && peek().k === 'eqv') { i += 1; a = { t: 'eqv', a, b: imp() }; } return a; };
    /** @returns {Node} */
    const imp = () => { const a = or(); if (peek() && peek().k === 'imp') { i += 1; return { t: 'imp', a, b: imp() }; } return a; };
    /** @returns {Node} */
    const or = () => { let a = and(); while (peek() && peek().k === 'or') { i += 1; a = { t: 'or', a, b: and() }; } return a; };
    /** @returns {Node} */
    const and = () => { let a = not(); while (peek() && peek().k === 'and') { i += 1; a = { t: 'and', a, b: not() }; } return a; };
    /** @returns {Node} */
    const not = () => { if (peek() && peek().k === 'not') { i += 1; return { t: 'not', a: not() }; } return atom(); };
    /** @returns {Node} */
    const atom = () => {
      const t = peek();
      if (!t) throw new Error('A formula félbemaradt: a végén még egy formulának kellene állnia.');
      if (t.k === 'var') { i += 1; return { t: 'var', n: /** @type {string} */ (t.v) }; }
      if (t.k === 'const') { i += 1; return { t: 'const', v: t.v === 'T' }; }
      if (t.k === '(' || t.k === '[') {
        const close = t.k === '(' ? ')' : ']';
        i += 1;
        const inner = eqv();
        if (!peek() || peek().k !== close) throw new Error(`Hiányzik a „${close}” ${where()}.`);
        i += 1;
        return inner;
      }
      throw new Error(`Itt formulának kellene kezdődnie ${where()}, de „${src.slice(t.pos, t.pos + 3).trim()}” áll.`);
    };
    const tree = eqv();
    if (i < toks.length) throw new Error(`Fölösleges jel ${where()}. Talán hiányzik egy műveleti jel vagy zárójel.`);
    return tree;
  }

  /** @param {Node} n @param {Set<string>} [acc] */
  const vars = (n, acc = new Set()) => {
    if (n.t === 'var') acc.add(n.n);
    else if (n.t === 'not') vars(n.a, acc);
    else if (n.t !== 'const') { vars(n.a, acc); vars(n.b, acc); }
    return acc;
  };
  /** @param {Node} n @param {Record<string, boolean>} env @returns {boolean} */
  function evaluate(n, env) {
    switch (n.t) {
      case 'var': return env[n.n];
      case 'const': return n.v;
      case 'not': return !evaluate(n.a, env);
      case 'and': return evaluate(n.a, env) && evaluate(n.b, env);
      case 'or': return evaluate(n.a, env) || evaluate(n.b, env);
      case 'imp': return !evaluate(n.a, env) || evaluate(n.b, env);
      default: return evaluate(n.a, env) === evaluate(n.b, env);
    }
  }
  /** Teljes zárójelezés. @param {Node} n @returns {string} */
  function full(n) {
    if (n.t === 'var') return n.n;
    if (n.t === 'const') return n.v ? 'T' : 'F';
    if (n.t === 'not') return `(¬${full(n.a)})`;
    return `(${full(n.a)} ${OPS[n.t]} ${full(n.b)})`;
  }
  /** Takarékos zárójelezés a precedencia szerint. @param {Node} n @returns {string} */
  function show(n) {
    if (n.t === 'var') return n.n;
    if (n.t === 'const') return n.v ? 'T' : 'F';
    if (n.t === 'not') return n.a.t === 'var' || n.a.t === 'const' || n.a.t === 'not' ? `¬${show(n.a)}` : `¬(${show(n.a)})`;
    const p = PREC[n.t];
    const l = PREC[n.a.t] < p || (n.t === 'imp' && n.a.t === 'imp') ? `(${show(n.a)})` : show(n.a);
    const r = PREC[n.b.t] < p || (n.t !== 'imp' && n.b.t === n.t) ? `(${show(n.b)})` : show(n.b);
    return `${l} ${OPS[n.t]} ${r}`;
  }
  /** Behelyettesítés. @param {Node} n @param {Record<string, boolean>} env @returns {Node} */
  function subst(n, env) {
    if (n.t === 'var') return { t: 'const', v: env[n.n] };
    if (n.t === 'const') return n;
    if (n.t === 'not') return { t: 'not', a: subst(n.a, env) };
    return { t: n.t, a: subst(n.a, env), b: subst(n.b, env) };
  }
  /** A legbelső műveletek egyszerre számolódnak ki, mint a PDF 101. oldalán. @param {Node} n @returns {Node} */
  function step(n) {
    if (n.t === 'var' || n.t === 'const') return n;
    if (n.t === 'not') return n.a.t === 'const' ? { t: 'const', v: !n.a.v } : { t: 'not', a: step(n.a) };
    if (n.a.t === 'const' && n.b.t === 'const') return { t: 'const', v: evaluate(n, {}) };
    return { t: n.t, a: step(n.a), b: step(n.b) };
  }
  const tf = (/** @type {boolean} */ v) => (v ? 'T' : 'F');
  const cell = (/** @type {boolean} */ v, extra = '') => `<td class="${v ? 'u-t' : 'u-f'}${extra}">${tf(v)}</td>`;

  function initFormula() {
    const input = $('#formula-be'), out = $('#formula-ki'), table = $('#formula-tabla');
    const rowSel = $('#formula-sor'), steps = $('#formula-lepesek'), sample = $('#formula-minta');
    if (!input || !out || !table) return;
    /** @type {{tree: Node, names: string[], rows: Record<string, boolean>[]} | null} */
    let state = null;
    const showSteps = () => {
      if (!state) { steps.innerHTML = ''; return; }
      const env = state.rows[Number(rowSel.value)];
      /** @type {Node} */ let n = subst(state.tree, env);
      const lines = [show(n)];
      while (n.t !== 'const') { n = step(n); lines.push(show(n)); }
      const assign = state.names.map((v) => `${v} = ${tf(env[v])}`).join(', ');
      steps.innerHTML = `<p>Interpretáció: ${assign}</p><p><code>${esc(lines.join(';  '))}</code></p>` +
        `<p>Ebben az interpretációban a formula <strong class="${n.v ? 'u-ok' : 'u-bad'}">${n.v ? 'igaz' : 'hamis'}</strong>.</p>`;
    };
    const run = () => {
      try {
        const tree = parse(input.value);
        const names = [...vars(tree)].sort();
        if (names.length > 6) throw new Error(`${names.length} változó van a formulában. A bemutató legfeljebb 6 változót kezel, az már 64 sor.`);
        const rows = Array.from({ length: 2 ** names.length }, (_, i) =>
          Object.fromEntries(names.map((v, j) => [v, ((i >> (names.length - 1 - j)) & 1) === 0])));
        const values = rows.map((env) => evaluate(tree, env));
        const trues = values.filter(Boolean).length;
        const kind = trues === values.length
          ? '<strong class="u-ok">érvényes (tautológia)</strong>: minden interpretációban igaz'
          : trues === 0
            ? '<strong class="u-bad">kielégíthetetlen (kontradikció)</strong>: minden interpretációban hamis'
            : `<strong>kielégíthető, de nem érvényes</strong>: ${trues} interpretációban igaz, ${values.length - trues} interpretációban hamis`;
        out.innerHTML = `<p><strong class="u-ok">Jól formált formula.</strong> Teljes zárójelezéssel: <code>${esc(full(tree))}</code></p>` +
          `<p>Változók: ${names.length ? names.join(', ') : 'nincs'} · interpretációk száma: 2<sup>${names.length}</sup> = ${rows.length}.</p><p>A formula ${kind}.</p>`;
        table.innerHTML = `<caption>Az összes interpretáció. Az utolsó oszlop a teljes formula értéke.</caption><thead><tr><th>#</th>${names.map((v) => `<th>${v}</th>`).join('')}<th class="u-main">${esc(show(tree))}</th></tr></thead>` +
          `<tbody>${rows.map((env, i) => `<tr><td>I<sub>${i + 1}</sub></td>${names.map((v) => cell(env[v])).join('')}${cell(values[i], ' u-main')}</tr>`).join('')}</tbody>`;
        state = { tree, names, rows };
        rowSel.innerHTML = rows.map((env, i) => `<option value="${i}">I${i + 1}: ${names.map((v) => `${v}=${tf(env[v])}`).join(', ') || 'nincs változó'}</option>`).join('');
        showSteps();
      } catch (e) {
        state = null;
        out.innerHTML = `<p><strong class="u-bad">Nem jól formált formula.</strong> ${esc(/** @type {Error} */ (e).message)}</p>`;
        table.innerHTML = ''; rowSel.innerHTML = ''; steps.innerHTML = '';
      }
    };
    input.addEventListener('input', run);
    rowSel.addEventListener('change', showSteps);
    sample.addEventListener('change', () => { input.value = sample.value; run(); });
    document.querySelectorAll('#formula-jelek button').forEach((el) => { const b = /** @type {HTMLButtonElement} */ (el); b.addEventListener('click', () => {
      const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
      const jel = b.dataset.jel || '';
      input.value = input.value.slice(0, s) + jel + input.value.slice(e);
      input.focus(); input.setSelectionRange(s + jel.length, s + jel.length);
      run();
    }); });
    run();
    // Az első betöltéskor az I1 legyen kiválasztva, mint a PDF 100. oldalán: (T,T,F,F) = 4. sor.
    if (rowSel.options.length === 16) { rowSel.value = '3'; showSteps(); }
  }

  /* 2 · Rezolúciós műhely – PDF 105–108., javított leállással */
  /** @typedef {{lits: string[], from: number[]|null, pivot?: string}} Clause */
  const neg = (/** @type {string} */ l) => (l.startsWith('¬') ? l.slice(1) : `¬${l}`);
  const key = (/** @type {string[]} */ lits) => lits.join(' ∨ ') || 'NIL';
  const sortLits = (/** @type {string[]} */ lits) => [...new Set(lits)].sort((a, b) => a.replace('¬', '').localeCompare(b.replace('¬', '')) || a.length - b.length);
  /** @param {string} text @returns {string[][]} */
  function parseClauses(text) {
    const parts = text.split(/[;\n]/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error('Nincs egyetlen klóz sem.');
    return parts.map((p) => sortLits(p.split(/∨|\||,/).map((l) => l.trim()).filter(Boolean).map((l) => {
      const m = /^([¬!~-]*)\s*([a-z][a-z0-9]*)$/.exec(l);
      if (!m) throw new Error(`„${l}” nem literál. Egy literál egy kisbetűs változó, előtte legfeljebb tagadásjellel.`);
      return m[1].length % 2 ? `¬${m[2]}` : m[2];
    })));
  }
  /** @param {string[]} a @param {string[]} b */
  function resolvePair(a, b) {
    const pivots = a.filter((l) => b.includes(neg(l)));
    if (pivots.length !== 1) return { pivots, res: null };
    const p = pivots[0];
    return { pivots, res: sortLits([...a.filter((l) => l !== p), ...b.filter((l) => l !== neg(p))]) };
  }

  function initResolution() {
    const sel = $('#rez-keszlet'), own = $('#rez-sajat'), box = $('#rez-klozok'), out = $('#rez-ki');
    if (!sel || !box || !out) return;
    /** @type {Clause[]} */ let clauses = [];
    let done = false;
    const legend = box.querySelector('legend');
    const render = (/** @type {number} */ fresh = -1) => {
      box.innerHTML = '';
      box.append(legend);
      clauses.forEach((c, i) => {
        const label = document.createElement('label');
        if (i === fresh) label.className = 'u-new';
        if (!c.lits.length) label.classList.add('u-hit');
        const origin = c.from ? `C${c.from[0] + 1} és C${c.from[1] + 1} rezolvense, kiesett: ${c.pivot}, ${neg(c.pivot || '')}` : 'adott';
        label.innerHTML = `<input type="checkbox" value="${i}"> <span><strong>C${i + 1}:</strong> ${esc(key(c.lits))} <small>(${origin})</small></span>`;
        box.append(label);
      });
    };
    const load = (/** @type {string} */ text) => {
      try {
        clauses = parseClauses(text).map((lits) => ({ lits, from: null }));
        done = false;
        render();
        out.innerHTML = `<p>${clauses.length} klóz betöltve. Jelölj ki kettőt, vagy kérj gépi lépést.</p>`;
      } catch (e) { out.innerHTML = `<p class="u-bad">${esc(/** @type {Error} */ (e).message)}</p>`; }
    };
    const has = (/** @type {string[]} */ lits) => clauses.findIndex((c) => key(c.lits) === key(lits));
    /** @param {number} i @param {number} j @param {string} p @param {string[]} res */
    const add = (i, j, p, res) => {
      clauses.push({ lits: res, from: [i, j], pivot: p });
      const n = clauses.length;
      render(n - 1);
      if (!res.length) {
        done = true;
        return `<p>C${i + 1} és C${j + 1}: kiesik <code>${esc(p)}</code> és <code>${esc(neg(p))}</code>. Az eredmény az <strong>üres klóz (NIL)</strong>.</p><p><strong class="u-ok">A klózhalmaz kielégíthetetlen.</strong> Ha a tagadott konklúzióból indultunk, a tétel igaz.</p>`;
      }
      return `<p>C${i + 1} és C${j + 1}: kiesik <code>${esc(p)}</code> és <code>${esc(neg(p))}</code>. Új klóz: <strong>C${n}: ${esc(key(res))}</strong>.</p>`;
    };
    /** Az első olyan pár, amely új rezolvenst ad. */
    const nextPair = () => {
      for (let j = 1; j < clauses.length; j += 1) {
        for (let i = 0; i < j; i += 1) {
          const r = resolvePair(clauses[i].lits, clauses[j].lits);
          if (r.res && has(r.res) < 0) return { i, j, p: r.pivots[0], res: r.res };
        }
      }
      return null;
    };
    const saturated = () => { done = true; return `<p><strong>Telítődés:</strong> nincs több olyan rezolválható klózpár, amely új klózt adna, és üres klóz nem keletkezett.</p><p><strong class="u-ok">A klózhalmaz kielégíthető.</strong> A PDF ciklusa itt nem állna meg, a javított algoritmus igen.</p>`; };
    const finished = '<p>Az algoritmus már véget ért. Új futtatáshoz válaszd az újrakezdést.</p>';
    $('#rez-par').addEventListener('click', () => {
      const picked = [...box.querySelectorAll('input:checked')].map((x) => Number(/** @type {HTMLInputElement} */ (x).value));
      if (picked.length !== 2) { out.innerHTML = `<p>Pontosan két klózt jelölj ki, most ${picked.length} van kijelölve.</p>`; return; }
      if (done) { out.innerHTML = finished; return; }
      const [i, j] = picked;
      const r = resolvePair(clauses[i].lits, clauses[j].lits);
      if (!r.pivots.length) { out.innerHTML = `<p>C${i + 1} és C${j + 1} nem rezolválható: nincs bennük ellentett literálpár.</p>`; return; }
      if (r.pivots.length > 1) { out.innerHTML = `<p>C${i + 1} és C${j + 1} ${r.pivots.length} ellentett literálpárt tartalmaz (${r.pivots.map((p) => `${esc(p)} / ${esc(neg(p))}`).join(', ')}). A PDF szerint ez nem rezolválható pár. Bármelyik párt ejtenénk ki, a rezolvensben ott maradna egy másik változó igenlő és tagadott alakja is. Az ilyen klóz tautológia, semmit sem mond.</p>`; return; }
      const res = /** @type {string[]} */ (r.res);
      const at = has(res);
      if (at >= 0) { out.innerHTML = `<p>A rezolvens (<code>${esc(key(res))}</code>) már szerepel a halmazban: C${at + 1}. Nem ad új információt.</p>`; return; }
      out.innerHTML = add(i, j, r.pivots[0], res);
    });
    $('#rez-lepes').addEventListener('click', () => {
      if (done) { out.innerHTML = finished; return; }
      const nx = nextPair();
      out.innerHTML = nx ? add(nx.i, nx.j, nx.p, nx.res) : saturated();
    });
    $('#rez-vegig').addEventListener('click', () => {
      if (done) { out.innerHTML = finished; return; }
      let added = 0;
      /** @type {string} */ let msg = '';
      while (!done && clauses.length < 200) {
        const nx = nextPair();
        if (!nx) { msg = saturated(); break; }
        msg = add(nx.i, nx.j, nx.p, nx.res);
        added += 1;
      }
      out.innerHTML = `<p>${added} új klóz keletkezett.</p>${msg}`;
    });
    $('#rez-uj').addEventListener('click', () => load(own.value.trim() && sel.dataset.sajat === '1' ? own.value : sel.value));
    $('#rez-betolt').addEventListener('click', () => { sel.dataset.sajat = '1'; load(own.value); });
    sel.addEventListener('change', () => { sel.dataset.sajat = ''; load(sel.value); });
    load(sel.value);
  }

  /* 3 · Ellenpélda keresése – PDF 116–118. */
  const D = ['Anna', 'Bence', 'logika', 'szócséplés'];
  const SHORT = ['A', 'B', 'L', 'Sz'];
  const initialWorld = () => ({
    H: [true, true, false, false],
    T: [false, false, true, false],
    C: [false, false, false, true],
    S: [[false, false, true, false], [false, false, true, false], [false, false, false, false], [false, false, false, false]]
  });
  function initWorld() {
    const one = $('#vilag-egy tbody'), twoHead = $('#vilag-ket thead'), two = $('#vilag-ket tbody'), out = $('#vilag-ki');
    if (!one || !two || !out) return;
    let w = initialWorld();
    const draw = () => {
      one.innerHTML = D.map((d, i) => `<tr><td>${d}</td>${['H', 'T', 'C'].map((p) =>
        `<td><input type="checkbox" data-p="${p}" data-i="${i}" aria-label="${p}(${d})"${w[/** @type {'H'|'T'|'C'} */ (p)][i] ? ' checked' : ''}></td>`).join('')}</tr>`).join('');
      twoHead.innerHTML = `<tr><th>x \\ y</th>${SHORT.map((s, j) => `<th><abbr title="${D[j]}">${s}</abbr></th>`).join('')}</tr>`;
      two.innerHTML = D.map((d, i) => `<tr><td>${d}</td>${D.map((e, j) =>
        `<td><input type="checkbox" data-p="S" data-i="${i}" data-j="${j}" aria-label="S(${d}, ${e})"${w.S[i][j] ? ' checked' : ''}></td>`).join('')}</tr>`).join('');
    };
    const judge = () => {
      const idx = [0, 1, 2, 3];
      const lovesAllSubjects = (/** @type {number} */ x) => idx.every((y) => !w.T[y] || w.S[x][y]);
      const f1w = idx.find((x) => w.H[x] && lovesAllSubjects(x));
      const f1 = f1w !== undefined;
      /** @type {[number, number] | undefined} */
      let f2c;
      idx.forEach((x) => idx.forEach((y) => { if (!f2c && w.H[x] && w.C[y] && w.S[x][y]) f2c = [x, y]; }));
      const f2 = !f2c;
      const f3c = idx.find((x) => w.T[x] && w.C[x]);
      const f3 = f3c === undefined;
      const v = (/** @type {boolean} */ b) => `<strong class="u-verdict ${b ? 'u-ok' : 'u-bad'}">${b ? 'igaz' : 'hamis'}</strong>`;
      const why1 = f1 ? `${D[/** @type {number} */ (f1w)]} hallgató, és minden tárgyat szeret.` : 'Nincs olyan hallgató, aki minden tárgyat szeret.';
      const why2 = f2 ? 'Egyik hallgató sem szeret semmit, ami szócséplés.' : `${D[/** @type {[number, number]} */ (f2c)[0]]} hallgató, és szereti a(z) ${D[/** @type {[number, number]} */ (f2c)[1]]} elemet, amely szócséplés.`;
      const why3 = f3 ? 'Egyik tárgy sem szócséplés.' : `A(z) ${D[/** @type {number} */ (f3c)]} tárgy és szócséplés is.`;
      const verdict = f1 && f2 && !f3
        ? '<p><strong class="u-bad">Ellenpélda!</strong> Ez nem fordulhat elő, mert F3 következik F1-ből és F2-ből.</p>'
        : f1 && f2
          ? '<p><strong class="u-ok">F1 és F2 igaz, és F3 is igaz.</strong> Ebben a világban a következtetés rendben van.</p>'
          : '<p>Most nem igaz mindkét premissza, ezért ez a világ nem lehet ellenpélda. Az ellenpéldához F1-nek és F2-nek igaznak, F3-nak hamisnak kellene lennie.</p>';
      out.innerHTML = `<p>F1 ${v(f1)} · ${why1}</p><p>F2 ${v(f2)} · ${why2}</p><p>F3 ${v(f3)} · ${why3}</p>${verdict}`;
    };
    document.querySelectorAll('.u-world').forEach((t) => t.addEventListener('change', (/** @type {Event} */ e) => {
      const el = /** @type {HTMLInputElement} */ (e.target);
      const i = Number(el.dataset.i);
      if (el.dataset.p === 'S') w.S[i][Number(el.dataset.j)] = el.checked;
      else w[/** @type {'H'|'T'|'C'} */ (el.dataset.p)][i] = el.checked;
      judge();
    }));
    $('#vilag-trukk').addEventListener('click', () => { w.T[3] = true; draw(); judge(); });
    $('#vilag-alap').addEventListener('click', () => { w = initialWorld(); draw(); judge(); });
    draw(); judge();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-04-kviz';
    const hint = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.';
    try { const prev = localStorage.getItem(storeKey); result.textContent = prev ? `Legutóbbi eredményed: ${prev}. Bármikor újra kitöltheted, vagy kihagyhatod.` : hint; } catch { result.textContent = hint; }
    form.addEventListener('submit', (/** @type {Event} */ e) => {
      e.preventDefault();
      /** @type {HTMLFieldSetElement[]} */
      const sets = [...form.querySelectorAll('fieldset')];
      let score = 0, answered = 0;
      sets.forEach((fs) => {
        const chosen = /** @type {HTMLInputElement|null} */ (fs.querySelector('input:checked'));
        const fb = /** @type {HTMLElement} */ (fs.querySelector('.u-feedback'));
        if (!chosen) { fb.textContent = 'Nem válaszoltál – ez rendben van.'; fb.className = 'u-feedback'; return; }
        answered += 1;
        const ok = chosen.value === fs.dataset.helyes;
        if (ok) score += 1;
        fb.className = 'u-feedback ' + (ok ? 'u-ok' : 'u-bad');
        fb.textContent = (ok ? 'Helyes. ' : `Nem egészen, a helyes válasz: ${fs.dataset.helyes}). `) + fb.dataset.magyarazat;
      });
      const summary = `${sets.length} kérdésből ${answered} megválaszolva, ${score} helyes`;
      result.textContent = `${summary}. Az eredmény nem befolyásolja a továbblépést.`;
      try { localStorage.setItem(storeKey, summary); } catch { /* a tárolás nem kötelező */ }
    });
    form.addEventListener('reset', () => {
      form.querySelectorAll('.u-feedback').forEach((/** @type {HTMLElement} */ fb) => { fb.textContent = ''; fb.className = 'u-feedback'; });
      result.textContent = hint;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToc();
    initFormula();
    initResolution();
    initWorld();
    initQuiz();
  });
})();
