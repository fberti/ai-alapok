// 09 · A fejezet kipróbálható laborjai. A keresés a search.js modellben van.
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
  /** Magyar számformátum. @param {number} n */
  const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1)).replace('.', ',');
  /** Felső indexes számjegyek. @param {number} n */
  const sup = (n) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
  /** Nagy számok olvashatóan: 3 jegyű tagolás vagy normálalak. @param {number} n */
  function big(n) {
    if (!Number.isFinite(n)) return '∞';
    if (n < 1e7) return Math.round(n).toLocaleString('hu-HU');
    const e = Math.floor(Math.log10(n)), m = n / 10 ** e;
    return `${m.toFixed(1).replace('.', ',')} · 10${sup(e)}`;
  }
  /** Időtartam másodpercből. @param {number} s */
  function dur(s) {
    if (s < 1e-3) return 'kevesebb mint 1 ms';
    if (s < 1) return `${fmt(Math.round(s * 1000))} ms`;
    if (s < 120) return `${fmt(Math.round(s * 10) / 10)} s`;
    if (s < 7200) return `${fmt(Math.round(s / 60))} perc`;
    if (s < 172800) return `${fmt(Math.round(s / 3600))} óra`;
    if (s < 63072000) return `${fmt(Math.round(s / 86400))} nap`;
    return `${big(s / 31536000)} év`;
  }
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* 1 · Amőba: három reprezentáció – PDF 279. */
  function initGomoku() {
    const box = $('#am-tabla'), out = $('#am-ki');
    if (!box || !out) return;
    const ids = ['sor', 'oszlop', 'jelek', 'mely'];
    const read = () => ids.map((id) => Number($(`#am-${id}`).value));
    function draw() {
      let [row, col, stones, depth] = read();
      row = Math.min(20, Math.max(1, Math.round(row) || 10));
      col = Math.min(20, Math.max(1, Math.round(col) || 10));
      stones = Math.min(399, Math.max(1, Math.round(stones) || 1));
      depth = Math.min(6, Math.max(1, Math.round(depth) || 6));
      $('#am-mely-ki').textContent = String(depth);
      const g = K.gomoku(row, col, stones);
      const c = 14;
      let s = `<svg viewBox="0 0 ${20 * c + 2} ${20 * c + 2}" role="img" class="u-board" aria-label="20 × 20-as tábla, az utolsó jel a ${row}. sor ${col}. oszlopában">`;
      for (let r = 1; r <= 20; r++) for (let k = 1; k <= 20; k++) {
        const dr = r - row, dc = k - col, sq = Math.abs(dr) <= 4 && Math.abs(dc) <= 4;
        const star = sq && (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc));
        const cls = !dr && !dc ? 'u-b-last' : star ? 'u-b-star' : sq ? 'u-b-sq' : 'u-b-cell';
        s += `<rect class="${cls}" x="${1 + (k - 1) * c}" y="${1 + (r - 1) * c}" width="${c}" height="${c}"/>`;
      }
      box.innerHTML = s + '</svg>';
      const rows = [['1 · Minden üres mező', g.all], ['2 · 9 × 9-es négyzet', g.square], ['3 · Csillag', g.star]];
      const table = el('table', 'u-table u-table-num');
      const head = el('tr');
      ['Reprezentáció', 'Elágazási tényező (b)', `Állás ${depth} féllépés mélyen (≈ b${sup(depth)})`, 'Idő 10⁶ állás/s mellett'].forEach((h) => head.append(el('th', '', h)));
      const thead = el('thead'); thead.append(head); table.append(thead);
      const tbody = el('tbody');
      rows.forEach(([name, b]) => {
        const tr = el('tr'), n = Number(b) ** depth;
        [String(name), String(b), big(n), dur(n / 1e6)].forEach((v) => tr.append(el('td', '', v)));
        tbody.append(tr);
      });
      table.append(tbody);
      out.innerHTML = '';
      const wrap = el('div', 'u-table-wrap'); wrap.append(table);
      out.append(wrap, el('p', '', `A csillag ${g.star}, a négyzet ${g.square} mezőt vizsgál. ${g.star < 32 ? 'A tábla széle levág a csillagból és a négyzetből is: a széleken még kisebb az elágazás.' : 'A tábla közepén a csillag mind a 32, a négyzet mind a 80 mezője a táblán van.'} Az arány ${depth} féllépésnél ${big((g.square / g.star) ** depth)}-szeres a négyzet és a csillag között.`));
    }
    ids.forEach((id) => { $(`#am-${id}`).addEventListener('input', draw); $(`#am-${id}`).addEventListener('change', draw); });
    draw();
  }

  /* 2 · Keresőlabor – PDF 287–297. */
  function initLab() {
    const map = $('#kl-terkep'), tree = $('#kl-fa'), out = $('#kl-ki');
    if (!map || !tree || !out) return;
    const gSel = $('#kl-graf'), sSel = $('#kl-start'), cSel = $('#kl-cel'), alg = $('#kl-alg'), lim = $('#kl-korlat');
    const gt = $('#kl-celteszt'), rep = $('#kl-ismetles'), ord = $('#kl-sorrend'), txt = $('#kl-sajat'), und = $('#kl-iranyitatlan');
    const ownBox = $('#kl-sajat-doboz'), err = $('#kl-hiba');
    /** @type {{iterations: any[], found:boolean, path:string[], cost:number, reason:string, visits:number, generated:number}} */
    let res = /** @type {any} */ (null);
    /** @type {Array<{it:number, k:number}>} */
    let frames = [];
    let pos = 0;
    /** @type {number|undefined} */
    let timer;
    /** @type {any} */
    let graph = K.CITY;
    function currentGraph() {
      const key = gSel.value;
      ownBox.hidden = key !== 'sajat';
      if (key !== 'sajat') { err.textContent = ''; return K.GRAPHS[key]; }
      const p = K.parseGraph(txt.value, { undirected: und.checked });
      err.textContent = p.errors.join(' ');
      // A felvétel sorrendje: az első sor kiinduló csomópontja a Start, az utoljára megjelenő csomópont a cél.
      const order = Object.keys(p.adj);
      return { name: 'Saját gráf', adj: p.adj, pos: K.circleLayout(order, 520, 360), start: order[0] || '', goal: order[order.length - 1] || '', weighted: true, w: 520, h: 360 };
    }
    /** @param {boolean} keep */
    function fillStates(keep) {
      const names = K.states(graph.adj);
      [[sSel, graph.start], [cSel, graph.goal]].forEach(([sel, def]) => {
        const old = sel.value;
        sel.innerHTML = '';
        names.forEach((n) => { const o = /** @type {HTMLOptionElement} */ (el('option', '', n)); o.value = n; sel.append(o); });
        sel.value = keep && names.includes(old) ? old : def;
      });
    }
    function compute() {
      stop();
      const strategy = alg.value;
      lim.disabled = strategy !== 'dls';
      if (!graph.adj[sSel.value]) { res = /** @type {any} */ (null); frames = []; render(); return; }
      res = K.run(graph.adj, sSel.value, cSel.value, {
        strategy, limit: Math.max(0, Math.min(12, Math.round(Number(lim.value)) || 0)),
        goalTest: gt.value, repeats: rep.value, order: ord.value, maxVisits: 300, maxDepth: 10
      });
      frames = [];
      res.iterations.forEach((t, it) => { for (let k = 0; k <= t.steps.length; k++) frames.push({ it, k }); });
      pos = 0;
      render();
    }
    function render() {
      if (!res || !frames.length) { out.textContent = 'Adj meg legalább egy élt, és válassz kiinduló állapotot.'; map.innerHTML = ''; tree.innerHTML = ''; return; }
      const { it, k } = frames[pos];
      const t = res.iterations[it];
      const snap = K.snapshot(t, k);
      const labs = K.labels(t.nodes);
      // Térkép: aktuális, front, bejárt, és a végén a talált út.
      /** @type {Record<string,string>} */
      const marks = {};
      snap.explored.forEach((s) => { marks[s] = 'vis'; });
      snap.front.forEach((id) => { if (!marks[t.nodes[id].state]) marks[t.nodes[id].state] = 'front'; });
      if (snap.current !== null) marks[t.nodes[snap.current].state] = 'cur';
      const last = pos === frames.length - 1;
      /** @type {string[]} */
      let pathEdges = [];
      if (last && res.found) { res.path.forEach((s, i) => { marks[s] = 'path'; if (i) pathEdges.push(`${res.path[i - 1]}>${s}`); }); }
      map.innerHTML = K.graphSvg({ ...graph, start: sSel.value, goal: cSel.value }, { id: 'kl-g', title: `${graph.name}: a keresés állapota`, marks, pathEdges });
      tree.innerHTML = K.treeSvg(t, { id: 'kl-t', title: 'A keresőfa eddig feltárt része', step: k, current: true, showCost: graph.weighted, gap: Math.max(56, Math.min(96, 9 * Math.max(...K.states(graph.adj).map((s) => s.length)) + 20)) });
      const fl = $('#kl-front'), vl = $('#kl-bejart');
      fl.innerHTML = ''; vl.innerHTML = '';
      snap.front.forEach((id) => fl.append(el('li', '', K.labelText(labs[id]) + (graph.weighted ? ` (${fmt(t.nodes[id].cost)})` : ''))));
      snap.explored.forEach((s) => vl.append(el('li', '', s)));
      const names = { bfs: 'Szélességi', ucs: 'Egyenletes költségű', dfs: 'Mélységi', dls: 'Mélységkorlátos', ids: 'Iteratív mélyítés' };
      const head = `${names[/** @type {'bfs'} */ (alg.value)]} keresés${alg.value === 'ids' ? `, korlát = ${it}` : alg.value === 'dls' ? `, korlát = ${t.limit}` : ''}. `;
      let msg;
      if (k === 0) msg = `Kezdés: a front egyetlen eleme a Start (${sSel.value}).`;
      else {
        const step = t.steps[k - 1], node = t.nodes[step.visit];
        msg = `${k}. lépés: belépünk ide: ${K.labelText(labs[step.visit])} (mélység ${node.depth}${graph.weighted ? `, útköltség ${fmt(node.cost)}` : ''}). `;
        if (step.goal && node.status === 'goal') msg += 'Ez a cél.';
        else if (step.goal) msg += `Feltárás közben előkerült a cél: ${K.labelText(labs[/** @type {number} */ (t.goalNode)])}.`;
        else if (step.cut) msg += 'A mélységi korlátnál vagyunk: nem terjesztjük ki.';
        else if (step.children.length) msg += `Feltárt gyerekek: ${step.children.map((/** @type {number} */ c) => K.labelText(labs[c])).join(', ')}.`;
        else msg += 'Nincs új gyereke.';
        if (step.skipped.length) msg += ` Kihagyva (${rep.value === 'graph' ? 'már bejártuk vagy a frontban van' : 'már az úton van'}): ${step.skipped.join(', ')}.`;
      }
      if (last) {
        if (res.found) msg += ` Kész: ${res.path.join(' → ')}${graph.weighted ? `, költség ${fmt(res.cost)}` : `, ${res.path.length - 1} lépés`}.`;
        else if (res.reason === 'limit') msg += ' A keresés elérte a lépéskorlátot: ismétlésszűrés nélkül körbe-körbe járhat.';
        else if (res.reason === 'cutoff') msg += ' A korlátig nincs cél, de mélyebben lehet: a keresés nem teljes.';
        else msg += ' A front kiürült: innen nem érhető el a cél.';
      }
      out.textContent = head + msg;
      const st = $('#kl-stat');
      st.innerHTML = '';
      const done = res.iterations.slice(0, it).reduce((s, x) => s + x.visits, 0) + k;
      [['Belelépés eddig', String(done)], ['Feltárt csomópont (ebben a körben)', String(snap.generated)], ['A front mérete', String(snap.front.length)], ['Lépés', `${pos} / ${frames.length - 1}`]].forEach(([a, b]) => {
        const d = el('div'); d.append(el('b', '', b), a); st.append(d);
      });
      $('#kl-vissza').disabled = pos === 0;
      $('#kl-lep').disabled = last;
      $('#kl-vegig').disabled = last;
    }
    function stop() { if (timer !== undefined) { clearInterval(timer); timer = undefined; } $('#kl-lejatszas').textContent = 'Lejátszás'; $('#kl-lejatszas').setAttribute('aria-pressed', 'false'); }
    function graphChanged() { graph = currentGraph(); fillStates(false); compute(); }
    gSel.addEventListener('change', graphChanged);
    txt.addEventListener('change', () => { graph = currentGraph(); fillStates(true); compute(); });
    und.addEventListener('change', () => { graph = currentGraph(); fillStates(true); compute(); });
    [sSel, cSel, alg, lim, gt, rep, ord].forEach((x) => x.addEventListener('change', compute));
    lim.addEventListener('input', compute);
    $('#kl-lep').addEventListener('click', () => { stop(); pos = Math.min(frames.length - 1, pos + 1); render(); });
    $('#kl-vissza').addEventListener('click', () => { stop(); pos = Math.max(0, pos - 1); render(); });
    $('#kl-vegig').addEventListener('click', () => { stop(); pos = frames.length - 1; render(); });
    $('#kl-ujra').addEventListener('click', () => { stop(); pos = 0; render(); });
    $('#kl-lejatszas').addEventListener('click', () => {
      if (timer !== undefined) { stop(); return; }
      if (pos >= frames.length - 1) pos = 0;
      $('#kl-lejatszas').textContent = 'Szünet';
      $('#kl-lejatszas').setAttribute('aria-pressed', 'true');
      timer = window.setInterval(() => {
        pos += 1;
        render();
        if (pos >= frames.length - 1) stop();
      }, reduceMotion ? 1600 : 900);
    });
    // Az „Egyéni” gomb nyitja és csukja a részletes beállításokat.
    const customBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('kl-egyeni-gomb'));
    const customBox = document.getElementById('kl-egyeni');
    if (customBtn && customBox) customBtn.addEventListener('click', () => {
      const open = customBox.hidden;
      customBox.hidden = !open;
      customBtn.setAttribute('aria-expanded', String(open));
    });
    // Előbeállítások a fejezet példáihoz.
    document.querySelectorAll('[data-kl]').forEach((b) => b.addEventListener('click', () => {
      const [g, a, s, c, test, order] = String(/** @type {HTMLElement} */ (b).dataset.kl).split(',');
      gSel.value = g; graph = currentGraph(); fillStates(false);
      alg.value = a; sSel.value = s; cSel.value = c; gt.value = test; ord.value = order; rep.value = 'path';
      compute();
      document.getElementById('kereso-labor')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }));
    graphChanged();
  }

  /* 3 · Idő- és tárigény – PDF 289–296. */
  function initCost() {
    const out = $('#ko-ki');
    if (!out) return;
    const ids = ['b', 'd', 'm', 'l', 'arany'];
    function draw() {
      const v = Object.fromEntries(ids.map((id) => [id, Number($(`#ko-${id}`).value)]));
      ids.forEach((id) => { $(`#ko-${id}-ki`).textContent = String(v[id]); });
      const c = K.complexity({ b: v.b, d: v.d, m: v.m, l: v.l, ratio: v.arany });
      /** @type {Array<[string, {time:number, memory:number}]>} */
      const rows = [['Szélességi', c.bfs], ['Egyenletes költségű', c.ucs], ['Mélységi', c.dfs], ['Mélységkorlátos', c.dls], ['Iteratív mélyítés', c.ids]];
      const max = Math.max(...rows.map((r) => Math.log10(Math.max(10, r[1].time))));
      out.innerHTML = '';
      const bars = el('div', 'u-bars-h');
      rows.forEach(([name, r]) => {
        const row = el('div');
        row.append(el('span', '', String(name)));
        const pair = el('div', 'u-barpair');
        const t = el('i'); t.style.width = `${(Math.log10(Math.max(1, r.time)) / max) * 100}%`;
        const m = el('i', 'u-mem'); m.style.width = `${(Math.log10(Math.max(1, r.memory)) / max) * 100}%`;
        pair.append(t, el('small', '', `idő: ${big(r.time)} csomópont, ${dur(r.time / 1e6)}`), m, el('small', '', `tár: ${big(r.memory)} csomópont`));
        row.append(pair);
        bars.append(row);
      });
      const warn = [];
      if (v.l < v.d) warn.push(`l = ${v.l} < d = ${v.d}: a mélységkorlátos keresés nem találja meg a célt.`);
      if (v.m < v.d) warn.push(`m nem lehet kisebb d-nél: a legmélyebb ág legalább olyan mély, mint a cél.`);
      out.append(bars, el('p', '', `Logaritmikus skála: egy sávhossz-egység tízszeres különbség. ${warn.join(' ')}`));
    }
    ids.forEach((id) => $(`#ko-${id}`).addEventListener('input', draw));
    draw();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-09-kviz';
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
    initGomoku();
    initLab();
    initCost();
    initQuiz();
    initPrint();
  });
})();
