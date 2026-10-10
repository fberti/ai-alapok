// 08 · A fejezet kipróbálható laborjai. A számítás a genetic.js modellben van.
(() => {
  const G = CourseGenetic;
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** Magyar számformátum: tizedesvessző. @param {number} n */
  const fmt = (n, digits = 2) => Number(n.toFixed(digits)).toString().replace('.', ',').replace('-', '−');
  const SVGNS = 'http://www.w3.org/2000/svg';
  /** @param {string} tag @param {Record<string, string|number>} attrs @param {string} [text] */
  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(SVGNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    if (text !== undefined) el.textContent = text;
    return el;
  }
  /** @param {string} tag @param {string} [cls] @param {string} [text] */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  /**
   * Génsor a PDF színeivel. @param {(number|string)[]} values @param {'G'|'B'} kind
   * @param {{cut?:number[], mut?:number[], swap?:number[]}} [opt]
   */
  function strip(values, kind, opt = {}) {
    const ol = el('ol', 'u-genes');
    ol.setAttribute('role', 'img');
    ol.setAttribute('aria-label', `${kind === 'G' ? 'Kromoszóma' : 'Bitsorozat'}: ${values.join(' ')}`);
    values.forEach((v, i) => {
      const li = el('li', (kind === 'G' ? 'g' : 'b') + v, String(v));
      if (opt.cut && opt.cut.includes(i)) li.classList.add('u-cut');
      if (opt.mut && opt.mut.includes(i)) li.classList.add('u-mut');
      if (opt.swap && opt.swap.includes(i)) li.classList.add('u-swap');
      ol.append(li);
    });
    return ol;
  }

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

  /* 1 · Fenotípus és genotípus – PDF 264. */
  function initCoding() {
    const sel = $('#kod-feladat'), box = $('#kod-fenotipus'), out = $('#kod-ki');
    if (!sel || !box || !out) return;
    const target = G.diagonalsTarget(5);
    /** @type {Record<string, number[]>} */
    const state = { teglalap: [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0], atlok: new Array(25).fill(1) };
    function draw() {
      const mode = sel.value, bits = state[mode];
      box.innerHTML = '';
      if (mode === 'teglalap') {
        const wrap = el('div', 'u-rects');
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'A 12 téglalap');
        bits.forEach((b, i) => {
          const btn = /** @type {HTMLButtonElement} */ (el('button', 'r' + b, b ? 'P' : 'Z'));
          btn.type = 'button';
          btn.setAttribute('aria-pressed', String(!!b));
          btn.setAttribute('aria-label', `${i + 1}. téglalap: ${b ? 'piros' : 'zöld'}`);
          btn.addEventListener('click', () => { bits[i] = 1 - bits[i]; draw(); /** @type {any} */ (box.querySelectorAll('button')[i]).focus(); });
          wrap.append(btn);
        });
        box.append(wrap);
        out.innerHTML = '';
        const p = el('p');
        p.append('Genotípus: ', el('span', 'u-bitstring', bits.join('')), `. Rátermettség: ${G.countOnes(bits)} / 12 piros téglalap.`);
        out.append(p);
      } else {
        const wrap = el('div', 'u-bitmap');
        wrap.style.gridTemplateColumns = 'repeat(5,auto)';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Az 5 × 5-ös bittérkép');
        bits.forEach((b, i) => {
          const btn = /** @type {HTMLButtonElement} */ (el('button', 'p' + b + (b !== target[i] ? ' u-miss' : ''), String(b)));
          btn.type = 'button';
          btn.setAttribute('aria-pressed', String(!b));
          btn.setAttribute('aria-label', `${Math.floor(i / 5) + 1}. sor, ${(i % 5) + 1}. oszlop: ${b ? 'fehér' : 'fekete'}`);
          btn.addEventListener('click', () => { bits[i] = 1 - bits[i]; draw(); /** @type {any} */ (box.querySelectorAll('button')[i]).focus(); });
          wrap.append(btn);
        });
        box.append(wrap);
        out.innerHTML = '';
        const rows = [0, 1, 2, 3, 4].map((r) => bits.slice(r * 5, r * 5 + 5).join('')).join(' ');
        const p = el('p');
        p.append('Genotípus: ', el('span', 'u-bitstring', rows), `. Rátermettség: ${G.matches(bits, target)} / 25 egyező képpont. A piros keretes képpontok térnek el a két átlós mintától.`);
        out.append(p);
      }
    }
    sel.addEventListener('change', draw);
    $('#kod-vel').addEventListener('click', () => { state[sel.value] = state[sel.value].map(() => (Math.random() < 0.5 ? 1 : 0)); draw(); });
    $('#kod-opt').addEventListener('click', () => { state[sel.value] = sel.value === 'teglalap' ? new Array(12).fill(1) : [...target]; draw(); });
    draw();
  }

  /* 2 · Három kiválasztási mód – PDF 265–266. */
  function initSelection() {
    const fields = $('#szel-mezok'), out = $('#szel-ki'), sim = $('#szel-szim'), kSel = $('#szel-k');
    if (!fields || !out) return;
    const names = ['A', 'B', 'C', 'D'];
    /** @type {HTMLInputElement[]} */
    const inputs = names.map((n, i) => {
      const label = el('label', '', `${n} rátermettsége `);
      const inp = /** @type {HTMLInputElement} */ (el('input'));
      inp.type = 'number'; inp.min = '0'; inp.max = '99'; inp.step = '1'; inp.id = `szel-f${i + 1}`;
      inp.value = String([2, 3, 4, 1][i]);
      label.append(inp);
      fields.append(label);
      return inp;
    });
    let runs = 0;
    const read = () => inputs.map((i) => Number(i.value));
    function probs() {
      const f = read();
      if (f.some((x) => !Number.isFinite(x) || x < 0)) return null;
      return { f, rul: G.rouletteProbs(f), ver: G.tournamentProbs(f, Number(kSel.value)), rang: G.linearRankProbs(f) };
    }
    function draw() {
      const p = probs();
      out.innerHTML = '';
      sim.textContent = 'Még nem választottunk.';
      if (!p) { out.textContent = 'Minden rátermettség legyen nemnegatív szám.'; return; }
      p.f.forEach((f, i) => {
        const row = el('div');
        row.append(el('span', '', `${names[i]} (f = ${f})`));
        const bars = el('div', 'u-probrow');
        [['', p.rul[i], 'rulett'], ['u-p2', p.ver[i], 'verseny'], ['u-p3', p.rang[i], 'rang']].forEach(([cls, v, name]) => {
          const bar = el('i', String(cls));
          bar.style.width = `${Number(v) * 100}%`;
          bars.append(bar, el('small', '', `${name}: ${fmt(Number(v), 3)}`));
        });
        row.append(bars);
        out.append(row);
      });
      if (p.f.every((x) => x === 0)) out.append(el('p', '', 'Minden rátermettség 0: a rulettkerék nem tud szeletet adni, itt egyenletes esélyt mutatunk. A Python random.choices ilyenkor hibát jelezne.'));
    }
    $('#szel-porget').addEventListener('click', () => {
      const p = probs();
      if (!p) return;
      runs += 1;
      const r = G.rng(1000 + runs), k = Number(kSel.value);
      const count = { rul: [0, 0, 0, 0], ver: [0, 0, 0, 0], rang: [0, 0, 0, 0] };
      for (let t = 0; t < 1000; t++) {
        count.rul[G.pick(p.rul, r())] += 1;
        count.rang[G.pick(p.rang, r())] += 1;
        let best = Math.floor(r() * 4);
        for (let j = 1; j < k; j++) { const c = Math.floor(r() * 4); if (p.f[c] > p.f[best]) best = c; }
        count.ver[best] += 1;
      }
      /** @param {number[]} c */
      const line = (c) => names.map((n, i) => `${n}: ${c[i]}`).join(', ');
      sim.innerHTML = '';
      sim.append(el('p', '', `Ezer rulettpörgetés: ${line(count.rul)}.`), el('p', '', `Ezer ${k}-fős verseny: ${line(count.ver)}.`), el('p', '', `Ezer rangsoroló húzás: ${line(count.rang)}.`));
    });
    $('#szel-sztar').addEventListener('click', () => { [1, 2, 3, 14].forEach((v, i) => { inputs[i].value = String(v); }); draw(); });
    inputs.forEach((i) => i.addEventListener('input', draw));
    kSel.addEventListener('change', draw);
    draw();
  }

  /* 3 · Keresztezés és mutáció – PDF 267–270. */
  function initCrossover() {
    const mode = $('#ker-mod'), v1 = $('#ker-v1'), v2 = $('#ker-v2'), maskBox = $('#ker-maszk'), pos = $('#mut-hely'), val = $('#mut-ertek'), out = $('#ker-ki');
    if (!mode || !out) return;
    const P1 = [1, 3, 2, 3, 1, 3, 2, 3], P2 = [3, 1, 3, 2, 3, 1, 3, 2];
    /** @type {HTMLInputElement[]} */
    const checks = P1.map((_, i) => {
      const label = el('label');
      const c = /** @type {HTMLInputElement} */ (el('input'));
      c.type = 'checkbox'; c.checked = [0, 1, 3, 6].includes(i);
      label.append(c, `${i + 1}.`);
      maskBox.append(label);
      return c;
    });
    for (let i = 1; i <= 8; i++) { const o = /** @type {HTMLOptionElement} */ (el('option', '', `${i}. gén (az 1. utódban)`)); o.value = String(i - 1); pos.append(o); }
    /** @param {string} title @param {HTMLElement} node */
    const row = (title, node) => { const p = el('p'); p.append(el('strong', '', `${title}: `), node); return p; };
    function draw() {
      const m = mode.value;
      v1.disabled = m === 'egyenletes' || m === 'ujra';
      v2.disabled = m !== 'ket';
      checks.forEach((c) => { c.disabled = m !== 'egyenletes'; });
      pos.disabled = m === 'ujra'; val.disabled = m === 'ujra';
      out.innerHTML = '';
      if (m === 'ujra') {
        const a = [1, 0, 0, 0], b = [0, 1, 1, 1], steps = G.pathRelink(a, b);
        out.append(row('1. szülő', strip(a, 'B')));
        steps.forEach((s, i) => out.append(row(`C${i + 1}, távolság a 2. szülőtől ${G.hamming(s, b)}`, strip(s, 'B', { mut: [s.findIndex((g, k) => g !== (i ? steps[i - 1] : a)[k])] }))));
        out.append(row('2. szülő', strip(b, 'B')), el('p', '', `Négy eltérő gén, ezért ${steps.length} köztes megoldás. Minden lépés egy gént ír át a 2. szülő felé.`));
        return;
      }
      const c1 = Math.min(7, Math.max(1, Math.round(Number(v1.value) || 1))), c2 = Math.min(7, Math.max(1, Math.round(Number(v2.value) || 1)));
      let kids, opt;
      if (m === 'egy') { kids = G.onePoint(P1, P2, c1); opt = { cut: [c1] }; }
      else if (m === 'ket') { kids = G.twoPoint(P1, P2, c1, c2); opt = { cut: [c1, c2] }; }
      else { const mask = checks.map((c) => c.checked); kids = G.uniform(P1, P2, mask); opt = { swap: mask.flatMap((b, i) => (b ? [i] : [])) }; }
      out.append(row('1. szülő', strip(P1, 'G', opt)), row('2. szülő', strip(P2, 'G', opt)), row('1. utód', strip(kids[0], 'G', opt)), row('2. utód', strip(kids[1], 'G', opt)));
      if (m === 'ket' && c1 === c2) out.append(el('p', '', 'A két vágás egybeesik, ezért nincs kicserélt szakasz: az utódok a szülők másolatai. Ez a hátizsákprogramban is előfordul.'));
      if (pos.value !== '') {
        const p = Number(pos.value), mutated = G.mutate(kids[0], p, Number(val.value));
        out.append(row('1. utód mutáció után', strip(mutated, 'G', { mut: [p] })));
        if (mutated[p] === kids[0][p]) out.append(el('p', '', 'Az új érték megegyezik a régivel, így ez nem igazi mutáció. Válassz másik allélt.'));
      }
    }
    [mode, v1, v2, pos, val, ...checks].forEach((x) => { x.addEventListener('input', draw); x.addEventListener('change', draw); });
    draw();
  }

  /* 4 · Teljes genetikus algoritmus – PDF 271–272. */
  function initGA() {
    const svg = $('#ga-grafikon'), out = $('#ga-ki');
    if (!svg || !out) return;
    const ids = ['n', 'pc', 'pm', 'elit', 'max', 'plato'];
    function update() { ids.forEach((id) => { $(`#ga-${id}-ki`).textContent = fmt(Number($(`#ga-${id}`).value), 3); }); }
    function run() {
      update();
      const problem = $('#ga-feladat').value;
      const res = G.runGA({
        problem, selection: $('#ga-szel').value, crossover: $('#ga-ker').value,
        popSize: Number($('#ga-n').value), pc: Number($('#ga-pc').value), pm: Number($('#ga-pm').value),
        elite: Number($('#ga-elit').value), maxGen: Number($('#ga-max').value), plateau: Number($('#ga-plato').value),
        seed: Math.max(1, Math.round(Number($('#ga-mag').value) || 1))
      });
      const prob = G.PROBLEMS[problem], h = res.history;
      svg.innerHTML = '';
      svg.append(svgEl('title', { id: 'ga-grafikon-cim' }, 'A legjobb és az átlagos rátermettség generációnként'));
      const L = 46, R = 545, T = 14, B = 205, maxX = Math.max(1, h.length - 1);
      /** @param {number} g */ const X = (g) => L + (R - L) * g / maxX;
      /** @param {number} f */ const Y = (f) => B - (B - T) * f / prob.optimum;
      const axis = svgEl('g', { class: 'u-axis' });
      axis.append(svgEl('path', { d: `M${L} ${T} V${B} H${R}` }));
      [0, 0.5, 1].forEach((q) => axis.append(svgEl('text', { x: L - 6, y: Y(q * prob.optimum) + 4, 'text-anchor': 'end' }, fmt(q * prob.optimum, 1))));
      axis.append(svgEl('text', { x: L, y: B + 18 }, '0'), svgEl('text', { x: R, y: B + 18, 'text-anchor': 'end' }, String(maxX)), svgEl('text', { x: (L + R) / 2, y: B + 30, 'text-anchor': 'middle' }, 'generáció'));
      svg.append(axis, svgEl('path', { class: 'u-guide', d: `M${L} ${Y(prob.optimum)} H${R}` }));
      /** @param {(s: {best:number, avg:number}) => number} f */
      const line = (f) => h.map((s, i) => `${i ? 'L' : 'M'}${X(s.gen).toFixed(1)} ${Y(f(s)).toFixed(1)}`).join(' ');
      svg.append(svgEl('path', { class: 'u-line-avg', d: line((s) => s.avg) }), svgEl('path', { class: 'u-line-best', d: line((s) => s.best) }));
      const last = res.best, why = { megoldas: `megtalálta az optimumot (${prob.optimum}) a ${last.gen}. generációban`, generacio: `elérte a ${last.gen} generációs korlátot`, plato: `${$('#ga-plato').value} generáción át nem javult, ezért a ${last.gen}. generáció után platón megállt` };
      out.innerHTML = '';
      out.append(el('p', '', `Az algoritmus ${why[/** @type {'megoldas'|'generacio'|'plato'} */ (res.reason)]}. A legjobb rátermettség ${fmt(last.best, 2)}, az átlag ${fmt(last.avg, 2)}.`));
      const bits = last.bestBits, p = el('p');
      if (problem === 'hatizsak') {
        const k = G.knapsack(bits), items = bits.flatMap((b, i) => (b ? [`${i + 1}.`] : []));
        p.append('A legjobb egyed: ', el('span', 'u-bitstring', bits.join('')), `, vagyis a(z) ${items.join(', ') || 'semmilyen'} tárgy, ${k.weight} kg és ${k.value} érték.`);
      } else if (problem === 'atlok') {
        p.append('A legjobb egyed soronként: ', el('span', 'u-bitstring', [0, 1, 2, 3, 4].map((r) => bits.slice(r * 5, r * 5 + 5).join('')).join(' ')), '. A cél: 01110 10101 11011 10101 01110.');
      } else {
        p.append('A legjobb egyed: ', el('span', 'u-bitstring', bits.join('')), `, ${G.countOnes(bits)} piros téglalap.`);
      }
      out.append(p);
    }
    ['#ga-feladat', '#ga-szel', '#ga-ker', '#ga-mag', ...ids.map((id) => `#ga-${id}`)].forEach((s) => { $(s).addEventListener('change', run); $(s).addEventListener('input', update); });
    $('#ga-fut').addEventListener('click', run);
    $('#ga-uj-mag').addEventListener('click', () => { $('#ga-mag').value = String((Number($('#ga-mag').value) || 1) % 9999 + 1); run(); });
    run();
  }

  /* 5 · Populáció a felszínen – PDF 260. és 263. */
  function initLandscape() {
    const svg = $('#fel-svg'), out = $('#fel-ki'), slider = $('#fel-gen');
    if (!svg || !out || !slider) return;
    const S = 300, N = 30, cell = S / N;
    /** @type {number[][][]} */
    let frames = [];
    const heat = svgEl('g', {});
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = (i + 0.5) / N, y = (j + 0.5) / N;
      heat.append(svgEl('rect', { class: 'u-heat', x: i * cell, y: S - (j + 1) * cell, width: cell + 0.3, height: cell + 0.3, fill: 'var(--u-accent)', 'fill-opacity': (G.landscape(x, y) * 0.85).toFixed(3) }));
    }
    const dots = svgEl('g', {});
    svg.append(heat,
      svgEl('circle', { class: 'u-peak', cx: 0.25 * S, cy: S - 0.3 * S, r: 18 }), svgEl('text', { x: 0.25 * S, y: S - 0.3 * S + 34, 'text-anchor': 'middle' }, 'helyi, 0,75'),
      svgEl('circle', { class: 'u-peak', cx: 0.72 * S, cy: S - 0.68 * S, r: 12 }), svgEl('text', { x: 0.72 * S, y: S - 0.68 * S - 34, 'text-anchor': 'middle' }, 'globális, 1,0'),
      dots);
    function compute() {
      frames = G.runLandscape({ mode: $('#fel-mod').value, seed: Math.max(1, Math.round(Number($('#fel-mag').value) || 1)), generations: 60 });
      slider.value = '0';
      draw();
    }
    function draw() {
      const k = Number(slider.value), pop = frames[k];
      $('#fel-gen-ki').textContent = String(k);
      dots.innerHTML = '';
      const fit = pop.map(([x, y]) => G.landscape(x, y)), bi = fit.indexOf(Math.max(...fit));
      pop.forEach(([x, y], i) => { if (i !== bi) dots.append(svgEl('circle', { class: 'u-ind', cx: (x * S).toFixed(1), cy: (S - y * S).toFixed(1), r: 4.5 })); });
      dots.append(svgEl('circle', { class: 'u-ind-best', cx: (pop[bi][0] * S).toFixed(1), cy: (S - pop[bi][1] * S).toFixed(1), r: 6 }));
      const nearGlobal = pop.filter(([x, y]) => Math.hypot(x - 0.72, y - 0.68) < 0.1).length;
      const where = Math.hypot(pop[bi][0] - 0.72, pop[bi][1] - 0.68) < 0.1 ? 'a globális csúcson' : Math.hypot(pop[bi][0] - 0.25, pop[bi][1] - 0.3) < 0.12 ? 'a helyi csúcson' : 'a csúcsoktól távol';
      out.textContent = `k = ${k}. A legjobb egyed magassága ${fmt(fit[bi], 3)}, ${where} áll. A globális csúcs közelében ${nearGlobal} / ${pop.length} egyed van.`;
    }
    slider.addEventListener('input', draw);
    $('#fel-lep').addEventListener('click', () => { slider.value = String(Math.min(60, Number(slider.value) + 1)); draw(); });
    $('#fel-vegig').addEventListener('click', () => { slider.value = '60'; draw(); });
    $('#fel-ujra').addEventListener('click', () => { slider.value = '0'; draw(); });
    $('#fel-mod').addEventListener('change', compute);
    $('#fel-mag').addEventListener('change', compute);
    compute();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-08-kviz';
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

  /* Nyomtatáskor a gyakorló feladatok és megoldásaik is látszanak */
  function initPrint() {
    /** @type {HTMLDetailsElement[]} */
    let opened = [];
    window.addEventListener('beforeprint', () => {
      opened = /** @type {HTMLDetailsElement[]} */ ([...document.querySelectorAll('details.u-practice, details.u-sol')]).filter((d) => !d.open);
      opened.forEach((d) => { d.open = true; });
    });
    window.addEventListener('afterprint', () => { opened.forEach((d) => { d.open = false; }); opened = []; });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToc();
    initCoding();
    initSelection();
    initCrossover();
    initGA();
    initLandscape();
    initQuiz();
    initPrint();
  });
})();
