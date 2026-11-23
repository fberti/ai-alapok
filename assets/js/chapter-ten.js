// 10 · A fejezet kipróbálható laborjai. A keresés és a lokális keresés a search.js modellben van.
(() => {
  const K = CourseSearch;
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** @param {string} tag @param {string} [cls] @param {string} [text] */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  /** Magyar számformátum, legfeljebb a megadott tizedesjeggyel. @param {number} n @param {number} [d] */
  const fmt = (n, d = 1) => (Number.isInteger(n) ? String(n) : n.toFixed(d).replace(/0+$/, '').replace(/\.$/, '')).replace('.', ',');

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

  /* 1 · Heurisztika-tervező, mohó és A* egymás mellett – PDF 301–304. */
  function initHeurLab() {
    const grid = $('#hl-h'), check = $('#hl-ellenorzes'), map = $('#hl-terkep');
    if (!grid || !check || !map) return;
    const gSel = $('#hl-graf'), tie = $('#hl-dontetlen'), rep = $('#hl-ismetles'), gt = $('#hl-celteszt');
    /** @type {any} */
    let graph = K.INFORMED.city;
    /** @type {Record<string, number>} */
    let heur = { ...graph.heur };
    /** @type {any} */
    let tG = null;
    /** @type {any} */
    let tA = null;
    let pos = 0;
    const maxStep = () => Math.max(tG ? tG.steps.length : 0, tA ? tA.steps.length : 0);
    /** @param {string} key @param {string} preset @returns {Record<string, number>} */
    function presetHeur(key, preset) {
      const g = K.INFORMED[key];
      const base = { ...(/** @type {Record<string, number>} */ (g.heur)) };
      if (preset === '302') return { ...K.CITY_HEUR_302 };
      if (preset === 'over') { Object.keys(base).forEach((k) => { base[k] *= 2; }); return base; }
      if (preset === 'fix') return { ...base, W: 2 };
      if (preset === 'd28') return { ...base, D: 28 };
      return base;
    }
    function buildGrid() {
      grid.innerHTML = '';
      K.states(graph.adj).forEach((s) => {
        const lab = /** @type {HTMLLabelElement} */ (el('label'));
        lab.dataset.state = s;
        const name = el('span', '', `h(${s})`);
        const inp = /** @type {HTMLInputElement} */ (el('input'));
        inp.type = 'number'; inp.min = '0'; inp.step = '1'; inp.value = String(heur[s] ?? 0);
        inp.setAttribute('aria-label', `A(z) ${s} állapot becslése`);
        inp.addEventListener('input', () => { const v = Number(inp.value.replace(',', '.')); heur[s] = Number.isFinite(v) && v >= 0 ? v : 0; compute(true); });
        lab.append(name, inp, el('small'));
        grid.append(lab);
      });
    }
    function syncInputs() {
      grid.querySelectorAll('label').forEach((/** @type {HTMLLabelElement} */ lab) => {
        const inp = /** @type {HTMLInputElement} */ (lab.querySelector('input'));
        inp.value = String(heur[lab.dataset.state || ''] ?? 0);
      });
    }
    /** @param {boolean} toEnd */
    function compute(toEnd) {
      const opts = { heur, tie: tie.value, repeats: rep.value, goalTest: gt.value, order: /** @type {'given'|'abc'} */ (tie.value === 'abc' ? 'abc' : 'given'), maxVisits: 300 };
      tG = K.search(graph.adj, graph.start, graph.goal, { ...opts, strategy: 'greedy' });
      tA = K.search(graph.adj, graph.start, graph.goal, { ...opts, strategy: 'astar' });
      const c = K.checkHeuristic(graph.adj, heur, graph.goal);
      grid.querySelectorAll('label').forEach((/** @type {HTMLLabelElement} */ lab) => {
        const s = lab.dataset.state || '', hs = c.hStar[s];
        const over = c.over.some((o) => o.state === s);
        lab.classList.toggle('u-over', over);
        /** @type {HTMLElement} */ (lab.querySelector('small')).textContent = Number.isFinite(hs) ? `h* = ${fmt(hs)}${over ? ' · túlbecsül' : ''}` : 'a cél innen elérhetetlen';
      });
      const parts = [];
      parts.push(c.admissible ? 'Elfogadható: igen, sehol sem becsül túl.' : `Elfogadható: nem. Túlbecsül: ${c.over.map((o) => `${o.state} (${fmt(o.h)} > ${fmt(o.hStar)})`).join(', ')}.`);
      parts.push(c.consistent ? 'Konzisztens: igen.' : `Konzisztens: nem. Sérül ${c.inconsistent.length} élen: ${c.inconsistent.slice(0, 6).map((e) => `${e.from} → ${e.to} (${fmt(e.hFrom)} > ${fmt(e.cost)} + ${fmt(e.hTo)})`).join(', ')}${c.inconsistent.length > 6 ? ', …' : ''}.`);
      if (!c.goalZero) parts.push(`A célban h ≠ 0 (${fmt(heur[graph.goal] || 0)}).`);
      parts.push(`A legolcsóbb út költsége: h*(${graph.start}) = ${fmt(c.hStar[graph.start])}.`);
      check.textContent = parts.join(' ');
      pos = toEnd ? maxStep() : 0;
      render();
    }
    /** @param {any} t @param {string} kind */
    function panel(t, kind) {
      const k = Math.min(pos, t.steps.length);
      const snap = K.snapshot(t, k);
      const labs = K.labels(t.nodes);
      const hv = (/** @type {number} */ id) => heur[t.nodes[id].state] ?? 0;
      const val = (/** @type {number} */ id) => (kind === 'greedy' ? fmt(hv(id)) : `${fmt(t.nodes[id].cost)}+${fmt(hv(id))}=${fmt(t.nodes[id].cost + hv(id))}`);
      const front = $(`#hl-${kind === 'greedy' ? 'moho' : 'astar'}-front`), tree = $(`#hl-${kind === 'greedy' ? 'moho' : 'astar'}-fa`), out = $(`#hl-${kind === 'greedy' ? 'moho' : 'astar'}-ki`);
      front.innerHTML = '';
      snap.front.forEach((/** @type {number} */ id) => front.append(el('li', '', `${K.labelText(labs[id])} (${val(id)})`)));
      tree.innerHTML = K.treeSvg(t, { id: `hl-${kind}-t`, title: `${kind === 'greedy' ? 'Mohó' : 'A*'} keresőfa`, step: k, current: true, heur, heurMode: kind === 'greedy' ? 'h' : 'f', gap: graph === K.INFORMED.city ? 92 : 62 });
      let msg;
      if (k === 0) msg = `Kezdés: a front a Start (${graph.start}).`;
      else {
        const st = t.steps[k - 1];
        msg = `${k}. lépés: belépünk ide: ${K.labelText(labs[st.visit])} (${val(st.visit)}).`;
        if (st.goal && t.nodes[st.visit].status === 'goal') msg += ' Ez a cél.';
        else if (st.goal) msg += ` Feltáráskor előkerült a cél: ${K.labelText(labs[t.goalNode])}.`;
      }
      if (k === t.steps.length) msg += t.found ? ` Kész: ${t.path.join(' → ')}, költség ${fmt(t.cost)}, ${t.visits} belelépés.` : ' Nincs út a célba.';
      out.textContent = msg;
      return snap;
    }
    function render() {
      if (!tG || !tA) return;
      panel(tG, 'greedy');
      const snap = panel(tA, 'astar');
      // A térkép az A* állapotát mutatja.
      /** @type {Record<string,string>} */
      const marks = {};
      snap.explored.forEach((/** @type {string} */ s) => { marks[s] = 'vis'; });
      snap.front.forEach((/** @type {number} */ id) => { if (!marks[tA.nodes[id].state]) marks[tA.nodes[id].state] = 'front'; });
      if (snap.current !== null) marks[tA.nodes[snap.current].state] = 'cur';
      /** @type {string[]} */
      const pathEdges = [];
      if (pos >= tA.steps.length && tA.found) tA.path.forEach((/** @type {string} */ s, /** @type {number} */ i) => { marks[s] = 'path'; if (i) pathEdges.push(`${tA.path[i - 1]}>${s}`); });
      map.innerHTML = K.graphSvg(graph, { id: 'hl-g', title: `${graph.name}: az A* keresés állapota a becslésekkel`, heur, marks, pathEdges });
      const sum = $('#hl-osszegzes');
      if (pos >= maxStep()) {
        const best = K.hStar(graph.adj, graph.goal)[graph.start];
        const verdict = (/** @type {any} */ t) => (t.found ? (Math.abs(t.cost - best) < 1e-9 ? 'optimális' : `nem optimális, ${fmt(t.cost - best)}-gyel drágább`) : 'nem talált utat');
        sum.textContent = `Mohó: ${fmt(tG.cost)} (${verdict(tG)}), ${tG.visits} belelépés. A (A*): ${fmt(tA.cost)} (${verdict(tA)}), ${tA.visits} belelépés. A legolcsóbb út: ${fmt(best)}.`;
      } else sum.textContent = `Lépés: ${pos} / ${maxStep()}. Lépkedj tovább, vagy ugorj a végére.`;
      $('#hl-vissza').disabled = pos === 0;
      $('#hl-lep').disabled = pos >= maxStep();
      $('#hl-vegig').disabled = pos >= maxStep();
    }
    function graphChanged() { graph = K.INFORMED[gSel.value]; heur = { ...graph.heur }; buildGrid(); compute(false); }
    gSel.addEventListener('change', graphChanged);
    [tie, rep, gt].forEach((x) => x.addEventListener('change', () => compute(true)));
    $('#hl-lep').addEventListener('click', () => { pos = Math.min(maxStep(), pos + 1); render(); });
    $('#hl-vissza').addEventListener('click', () => { pos = Math.max(0, pos - 1); render(); });
    $('#hl-vegig').addEventListener('click', () => { pos = maxStep(); render(); });
    $('#hl-ujra').addEventListener('click', () => { pos = 0; render(); });
    document.querySelectorAll('[data-hl]').forEach((b) => b.addEventListener('click', () => {
      const [g, preset] = String(/** @type {HTMLElement} */ (b).dataset.hl).split(',');
      if (g !== 'keep' && g !== gSel.value) { gSel.value = g; graph = K.INFORMED[g]; buildGrid(); }
      if (preset === 'zero') heur = Object.fromEntries(K.states(graph.adj).map((s) => [s, 0]));
      else if (preset === 'star') { const hs = K.hStar(graph.adj, graph.goal); heur = Object.fromEntries(K.states(graph.adj).map((s) => [s, Number.isFinite(hs[s]) ? hs[s] : 0])); }
      else heur = presetHeur(g, preset);
      syncInputs();
      compute(false);
    }));
    graphChanged();
  }

  /* 2 · Hegymászó a többcsúcsú felszínen – PDF 305. */
  function initHill() {
    const fig = $('#hm-abra'), out = $('#hm-ki');
    if (!fig || !out) return;
    const start = $('#hm-start'), restarts = $('#hm-ujra'), seed = $('#hm-mag');
    const why = (/** @type {string} */ s) => (s === 'plateau' ? 'fennsíkon állt meg' : 'csúcson állt meg');
    function draw() {
      const x0 = Number(start.value), k = Number(restarts.value), sd = Math.max(1, Math.round(Number(seed.value)) || 1);
      $('#hm-start-ki').textContent = String(x0);
      $('#hm-ujra-ki').textContent = String(k);
      const r = K.restartHill(K.landscape, { start: x0, restarts: k, seed: sd });
      const runs = r.runs.map((run, i) => ({ path: run.path, cls: run === r.best ? 'u-run2' : i === 0 ? 'u-run' : 'u-run3' }));
      // A legjobb fut legfelül.
      runs.sort((a, b) => (a.cls === 'u-run2' ? 1 : 0) - (b.cls === 'u-run2' ? 1 : 0));
      fig.innerHTML = K.landscapeSvg({ id: 'hm-t', title: `Hegymászó x = ${x0}-ból, ${k} újraindítással`, runs });
      out.innerHTML = '';
      const list = el('ol', 'u-mini-steps');
      r.runs.forEach((run, i) => list.append(el('li', '', `${i === 0 ? 'Indulás' : `${i}. újraindítás`}: x = ${run.path[0]} → x = ${run.x}, magasság ${fmt(run.value, 2)}, ${run.path.length - 1} lépés, ${why(run.stop)}.`)));
      const global = r.best.x === 80;
      out.append(list, el('p', global ? 'u-ok' : '', `A legjobb: x = ${r.best.x}, magasság ${fmt(r.best.value, 2)}${global ? ' – ez a globális csúcs.' : ' – ez csak helyi csúcs vagy fennsík; próbálj több újraindítást vagy másik magot.'} Összesen ${r.steps} lépés.`));
    }
    [start, restarts].forEach((x) => x.addEventListener('input', draw));
    seed.addEventListener('change', draw);
    seed.addEventListener('input', draw);
    draw();
  }

  /* 3 · Szimulált hűtés csúszkákkal – PDF 306–307. */
  function initAnneal() {
    const fig = $('#sa-abra'), series = $('#sa-idosor'), out = $('#sa-ki');
    if (!fig || !series || !out) return;
    const t0 = $('#sa-t0'), alpha = $('#sa-alpha'), start = $('#sa-start'), sched = $('#sa-utem'), seed = $('#sa-mag');
    const f = (/** @type {number} */ x) => -K.landscape(x);
    const read = () => ({ T0: Number(t0.value), alpha: Number(alpha.value), start: Number(start.value), schedule: sched.value, seed: Math.max(1, Math.round(Number(seed.value)) || 1) });
    const stops = { stable: 'az utolsó 100 lépésben a magasság legfeljebb 0,0005-tel változott (a PDF leállási feltétele)', tmin: 'a hőmérséklet 0,0001 alá csökkent', maxIter: 'elérte a 6000 lépéses korlátot, a keresés még nem nyugodott meg' };
    function draw() {
      const p = read();
      $('#sa-t0-ki').textContent = fmt(p.T0, 2);
      $('#sa-alpha-ki').textContent = fmt(p.alpha, 4);
      $('#sa-start-ki').textContent = String(p.start);
      alpha.disabled = p.schedule === 'log';
      const r = K.anneal(f, p);
      const every = Math.max(1, Math.ceil(r.xs.length / 400));
      fig.innerHTML = K.landscapeSvg({ id: 'sa-lab-t', title: 'A szimulált hűtés pályája a felszínen', trail: r.xs.filter((_, i) => i % every === 0).concat([r.x]) });
      series.innerHTML = K.seriesSvg({ id: 'sa-lab-s', title: 'Hőmérséklet és magasság a lépésszám függvényében', series: [{ values: r.Ts, cls: 'u-ser-t', label: `hőmérséklet (0 … ${fmt(p.T0, 2)})`, max: p.T0 }, { values: r.xs.map((x) => K.landscape(x)), cls: 'u-ser-f', label: 'magasság (0 … 1)', max: 1 }] });
      const global = Math.abs(r.x - 80) <= 4;
      out.innerHTML = '';
      out.append(
        el('p', global ? 'u-ok' : '', `Megállt: x = ${r.x}, magasság ${fmt(-r.value, 2)}${global ? ' – a globális csúcson.' : ' – nem a globális csúcson.'}`),
        el('p', '', `${r.iterations} lépés; javító vagy egyenlő lépés ${r.better}, elfogadott rontó lépés ${r.worseAccepted}, elutasított rontó lépés ${r.worseRejected}. A hőmérséklet a végén ${fmt(r.Ts[r.Ts.length - 1], 4)}. Leállás oka: ${stops[r.stop]}.`)
      );
    }
    [t0, alpha, start].forEach((x) => x.addEventListener('input', draw));
    [sched, seed].forEach((x) => x.addEventListener('change', draw));
    $('#sa-ujmag').addEventListener('click', () => { seed.value = String((Number(seed.value) || 1) + 1); draw(); });
    $('#sa-szaz').addEventListener('click', () => {
      const p = read();
      let hits = 0, steps = 0;
      for (let s = 1; s <= 100; s++) { const r = K.anneal(f, { ...p, seed: s }); if (Math.abs(r.x - 80) <= 4) hits += 1; steps += r.iterations; }
      $('#sa-szaz-ki').textContent = `Ezekkel a beállításokkal az 1–100. mag közül ${hits} jutott a globális csúcsra, átlagosan ${Math.round(steps / 100)} lépéssel.`;
    });
    draw();
  }

  /* 4 · Melyik keresőt válasszam? */
  function initChooser() {
    const out = $('#val-ki'), table = $('#osszevetes-tabla');
    if (!out || !table) return;
    const need = $('#val-cel'), costs = $('#val-koltseg'), heur = $('#val-becsles'), mem = $('#val-memoria'), opt = $('#val-optimum');
    function draw() {
      const q = { need: need.value, costs: costs.value, heuristic: heur.value === 'igen', memory: mem.value, optimal: opt.value === 'igen' };
      [costs, heur, mem].forEach((x) => { x.disabled = q.need === 'state'; });
      const r = K.recommend(q);
      table.querySelectorAll('tr[data-alg]').forEach((/** @type {HTMLElement} */ tr) => tr.classList.toggle('u-rec', r.ids.includes(tr.dataset.alg || '')));
      const names = r.ids.map((id) => { const tr = table.querySelector(`tr[data-alg="${id}"] td`); return tr ? tr.textContent : id; });
      out.textContent = `Ajánlott: ${names.join(', ')}. ${r.why}`;
    }
    [need, costs, heur, mem, opt].forEach((x) => x.addEventListener('change', draw));
    draw();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-10-kviz';
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
    initHeurLab();
    initHill();
    initAnneal();
    initChooser();
    initQuiz();
    initPrint();
  });
})();
