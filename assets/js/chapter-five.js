// 05 · A fejezet interaktív bemutatói. A számítás a prolog-fuzzy.js modellben van.
(() => {
  const M = CoursePrologFuzzy;
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** @param {string} s */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /** Magyar számformátum: tizedesvessző, valódi mínuszjel. @param {number} n */
  const fmt = (n, digits = 2) => {
    const s = Number(n.toFixed(digits)).toString();
    return s.replace('.', ',').replace('-', '−');
  };

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

  /* 1 · Prolog-léptető – PDF 126, 130–131. */
  const KIND = { call: 'cél', match: 'illesztés', redo: 'visszalépés', fail: 'meghiúsul', cut: 'vágás', prune: 'levágott ág', answer: 'megoldás', done: 'vége' };
  function initProlog() {
    const log = $('#prolog-naplo'), out = $('#prolog-ki'), code = $('#prolog-program'), next = $('#prolog-lepes'), all = $('#prolog-vegig');
    if (!log || !out || !code) return;
    const opts = () => ({ reversed: $('#prolog-csere').checked, cut: $('#prolog-vagas').checked, extra: $('#prolog-harmadik').checked });
    /** @type {ReturnType<typeof M.kleopatra>} */
    let run = M.kleopatra(opts());
    let shown = 0;
    const status = () => {
      const answers = run.steps.slice(0, shown).filter((s) => s.kind === 'answer').length;
      const finished = shown >= run.steps.length;
      next.disabled = finished; all.disabled = finished;
      if (!shown) out.innerHTML = '<p>Nyomd meg a „Következő lépés” gombot. A kérdés: <code>?- sokkal_szebb(Valaki, ursula).</code></p>';
      else if (finished) out.innerHTML = run.answers.length
        ? `<p><strong class="u-ok">Válaszok: ${run.answers.map(esc).join(' ; ')}</strong></p><p>${run.steps.length} lépés kellett hozzá.</p>`
        : `<p><strong class="u-bad">Nincs megoldás.</strong> ${run.steps.length} lépés után a Prolog a „false” választ adja.</p>`;
      else out.innerHTML = `<p>${shown}. lépés a(z) ${run.steps.length}-ből. Eddig ${answers} válasz.</p>`;
    };
    const show = (/** @type {number} */ upto) => {
      for (; shown < upto; shown += 1) {
        const s = run.steps[shown];
        const li = document.createElement('li');
        li.className = `k-${s.kind}`;
        li.style.marginLeft = `${Math.min(s.depth, 4) * 0.9}rem`;
        li.innerHTML = `<b>${KIND[s.kind]}</b> ${esc(s.text)}`;
        log.append(li);
      }
      log.scrollTop = log.scrollHeight;
      status();
    };
    const reset = () => {
      const o = opts();
      run = M.kleopatra(o);
      code.textContent = M.kleopatraSource(o);
      shown = 0; log.innerHTML = '';
      status();
    };
    next.addEventListener('click', () => show(shown + 1));
    all.addEventListener('click', () => show(run.steps.length));
    $('#prolog-uj').addEventListener('click', reset);
    $('#prolog-beallitas').addEventListener('change', reset);
    reset();
  }

  /* Közös ábrarajzoló a két fuzzy bemutatóhoz. */
  /**
   * @param {{w: number, h: number, x0: number, x1: number}} f
   * @returns {{X: (x: number) => number, Y: (y: number) => number, line: (fn: (x: number) => number, n?: number) => string, axes: (ticks: number[], unit: string) => string}}
   */
  function frame(f) {
    const pad = { l: 26, r: 10, t: 12, b: 26 };
    const X = (/** @type {number} */ x) => +(pad.l + ((x - f.x0) / (f.x1 - f.x0)) * (f.w - pad.l - pad.r)).toFixed(1);
    const Y = (/** @type {number} */ y) => +(f.h - pad.b - y * (f.h - pad.t - pad.b)).toFixed(1);
    return {
      X, Y,
      line: (fn, n = 200) => Array.from({ length: n + 1 }, (_, i) => { const x = f.x0 + ((f.x1 - f.x0) * i) / n; return `${i ? 'L' : 'M'}${X(x)} ${Y(fn(x))}`; }).join(''),
      axes: (ticks, unit) => `<g class="u-axis"><path d="M${X(f.x0)} ${Y(0)}H${X(f.x1)}M${X(f.x0)} ${Y(0)}V${Y(1)}"/><text x="${X(f.x0) - 5}" y="${Y(1) + 4}" text-anchor="end">1</text><text x="${X(f.x0) - 5}" y="${Y(0) + 4}" text-anchor="end">0</text>${ticks.map((t) => `<text x="${X(t)}" y="${Y(0) + 16}" text-anchor="middle">${fmt(t)}</text>`).join('')}<text x="${X(f.x1)}" y="${Y(0) + 16}" text-anchor="end">${unit}</text></g>`
    };
  }

  /* 2 · Tagságifüggvény-rajzoló – PDF 135. */
  /** @type {Record<string, [string, string, number, number, number][]>} */
  const SHAPES = {
    triangle: [['a', 'bal talppont (a)', -10, 10, -4], ['b', 'csúcs (b)', -10, 10, 1], ['c', 'jobb talppont (c)', -10, 10, 5]],
    trapezoid: [['a', 'bal talppont (a)', -10, 10, -6], ['b', 'tető eleje (b)', -10, 10, -3], ['c', 'tető vége (c)', -10, 10, 5], ['d', 'jobb talppont (d)', -10, 10, 8]],
    ramp: [['a', 'indulás (a)', -10, 10, -5], ['b', 'telítődés (b)', -10, 10, 3]],
    gauss: [['mean', 'várható érték', -10, 10, 2], ['sigma', 'szórás', 0.5, 8, 2.5]],
    bell: [['a', 'szélesség', 0.5, 8, 4], ['b', 'meredekség', 0.5, 8, 3], ['c', 'közép', -10, 10, 0]]
  };
  function initCurve() {
    const sel = $('#gorbe-alak'), box = $('#gorbe-parameterek'), xIn = $('#gorbe-x'), svg = $('#gorbe-rajz'), out = $('#gorbe-ki');
    if (!sel || !box || !svg || !out) return;
    const F = frame({ w: 440, h: 180, x0: -10, x1: 10 });
    const build = () => {
      box.innerHTML = SHAPES[sel.value].map(([k, label, min, max, v]) =>
        `<label>${label}: <output id="gorbe-p-${k}-ki">${fmt(v)}</output><input type="range" id="gorbe-p-${k}" data-k="${k}" min="${min}" max="${max}" step="0.5" value="${v}"></label>`).join('');
      draw();
    };
    const draw = () => {
      /** @type {Record<string, number>} */
      const p = {};
      box.querySelectorAll('input').forEach((/** @type {HTMLInputElement} */ i) => {
        p[/** @type {string} */ (i.dataset.k)] = Number(i.value);
        const o = document.getElementById(`${i.id}-ki`); if (o) o.textContent = fmt(Number(i.value));
      });
      const x = Number(xIn.value);
      $('#gorbe-x-ki').textContent = fmt(x);
      const shape = /** @type {'ramp'|'triangle'|'trapezoid'|'gauss'|'bell'} */ (sel.value);
      try {
        const mu = M.shape(shape, x, p);
        const fn = (/** @type {number} */ t) => M.shape(shape, t, p);
        svg.innerHTML = `${F.axes([-10, -5, 0, 5, 10], 'x')}<path class="u-curve" d="${F.line(fn, 400)}"/><path class="u-guide" d="M${F.X(x)} ${F.Y(0)}V${F.Y(mu)}H${F.X(-10)}"/><circle class="u-dot" cx="${F.X(x)}" cy="${F.Y(mu)}" r="4"/>`;
        out.innerHTML = `<p><strong>μ(${fmt(x)}) = ${fmt(mu)}</strong>. Az x = ${fmt(x)} pont ${fmt(mu)} mértékben tartozik a halmazba.</p>`;
      } catch (e) {
        svg.innerHTML = F.axes([-10, -5, 0, 5, 10], 'x');
        out.innerHTML = `<p class="u-bad">Hibás paraméterek: ${esc(/** @type {Error} */ (e).message)}</p>`;
      }
    };
    sel.addEventListener('change', build);
    box.addEventListener('input', draw);
    xIn.addEventListener('input', draw);
    build();
  }

  /* 3 · Élő vizsgajegy – PDF 140. */
  const GRADES = ['', 'elégtelen', 'elégséges', 'közepes', 'jó', 'jeles'];
  const LABELS = { jo: 'jó', jeles: 'jeles' };
  function initExam() {
    const score = $('#vizsga-pont'), hours = $('#vizsga-ora'), method = $('#vizsga-modszer'), svg = $('#vizsga-rajz'), out = $('#vizsga-ki');
    if (!score || !hours || !svg || !out) return;
    const F = frame({ w: 440, h: 170, x0: 1, x1: 5 });
    const draw = () => {
      const sc = Number(score.value), hr = Number(hours.value);
      $('#vizsga-pont-ki').textContent = fmt(sc);
      $('#vizsga-ora-ki').textContent = fmt(hr);
      const r = M.exam(sc, hr), m = r.memberships;
      const [r1, r2] = r.rules;
      const area = `M${r.points.map((p) => `${F.X(p.x)} ${F.Y(p.y)}`).join('L')}L${F.X(5)} ${F.Y(0)}L${F.X(1)} ${F.Y(0)}Z`;
      /** @type {{centroid: number | null, weighted: number | null, max: number | null}} */
      const values = { centroid: r.centroid, weighted: r.weighted, max: r.maxRule ? r.maxRule.peak : null };
      const result = values[/** @type {'centroid'|'weighted'|'max'} */ (method.value)];
      svg.innerHTML = `${F.axes([1, 2, 3, 4, 5], 'jegy')}<path class="u-s2 u-thin" d="${F.line((g) => M.triangle(g, 3, 4, 5))}"/><path class="u-s4 u-thin" d="${F.line((g) => M.triangle(g, 4, 5, 5))}"/>${
        r1.strength + r2.strength > 0 ? `<path class="u-area" d="${area}"/>` : ''}${result !== null ? `<path class="u-guide" d="M${F.X(result)} ${F.Y(0)}V${F.Y(1)}"/>` : ''}`;
      const lines = [
        `<p>Tagságok: ZH közepes ${fmt(m.kozepes)} · jó ${fmt(m.jo)} · kiváló ${fmt(m.kivalo)}; látogatás ritka ${fmt(m.ritka)} · gyakori ${fmt(m.gyakori)}.</p>`,
        `<p>R1 (jó ÉS ritka → jeles): min(${fmt(m.jo)}; ${fmt(m.ritka)}) = <strong>${fmt(r1.strength)}</strong>. R2 (közepes ÉS gyakori → jó): min(${fmt(m.kozepes)}; ${fmt(m.gyakori)}) = <strong>${fmt(r2.strength)}</strong>.</p>`
      ];
      if (result === null) {
        lines.push('<p><strong class="u-bad">Egyik szabály sem teljesül:</strong> mindkét erősség 0. Az egyesített kimenet üres, ezért a rendszer nem ad jegyet. Ehhez a bemenethez új szabály kellene.</p>');
      } else {
        const best = /** @type {NonNullable<typeof r.maxRule>} */ (r.maxRule);
        const how = method.value === 'centroid' ? 'területközéppont' : method.value === 'weighted' ? 'maximumok súlyozott átlaga' : `legnagyobb érvényesség: ${best.name} győz, következménye ${LABELS[best.label]}`;
        const g = Math.round(result);
        lines.push(`<p><strong>Eredmény (${how}): ${fmt(result)}</strong>, kerekítve ${g} (${GRADES[g]}).</p>`);
      }
      out.innerHTML = lines.join('');
    };
    [score, hours].forEach((el) => el.addEventListener('input', draw));
    method.addEventListener('change', draw);
    draw();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-05-kviz';
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
    initProlog();
    initCurve();
    initExam();
    initQuiz();
  });
})();
