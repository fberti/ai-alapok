// 07 · A fejezet kipróbálható laborjai. A számítás a complexity.js modellben van.
(() => {
  const M = CourseComplexity;
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** Magyar számformátum: tizedesvessző. @param {number} n */
  const fmt = (n, digits = 2) => Number(n.toFixed(digits)).toString().replace('.', ',').replace('-', '−');
  const SUP = /** @type {Record<string, string>} */ ({ 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' });
  /** Nagy egész: ezres tagolás, milliárd fölött normálalak. @param {number} n */
  const big = (n) => {
    if (n < 1e9) return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const e = Math.floor(Math.log10(n));
    return `${fmt(n / 10 ** e, 1)} · 10${String(e).split('').map((d) => SUP[d]).join('')}`;
  };
  /** Mindenhol a modell humanTime szövegét használjuk, a kitevőt felső indexbe írva. @param {number} steps */
  const time = (steps) => M.humanTime(steps / 1e9).replace(/10\^(\d+)/, (_, e) => '10' + e.split('').map((/** @type {string} */ d) => SUP[d]).join(''));

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

  /* 1 · Növekedési verseny – PDF 223. */
  function initGrowth() {
    const input = $('#nov-n'), out = $('#nov-ki');
    if (!input || !out) return;
    const top = Math.log10(M.growth(60).factorial);
    const rows = /** @type {[string, string, (g: ReturnType<typeof M.growth>) => number][]} */ ([
      ['n', 'nov-sav-n', (g) => g.n], ['n²', 'nov-sav-sq', (g) => g.square], ['2ⁿ', 'nov-sav-exp', (g) => g.exponential], ['n!', 'nov-sav-fact', (g) => g.factorial]]);
    const draw = () => {
      const n = Number(input.value), g = M.growth(n);
      $('#nov-n-ki').textContent = String(n);
      out.innerHTML = '';
      for (const [label, id, f] of rows) {
        const steps = f(g);
        $(`#${id}`).style.width = `${Math.max(1, (Math.log10(Math.max(1, steps)) / top) * 100)}%`;
        const p = document.createElement('p');
        p.textContent = `${label}: ${big(steps)} lépés · ${time(steps)}`;
        out.append(p);
      }
    };
    input.addEventListener('input', draw);
    draw();
  }

  /* 2 · Hová tartozik? – PDF 223. */
  const PLACES = /** @type {Record<string, {region:string, text:string}>} */ ({
    aramkor: { region: 'venn-p', text: 'P. Topologikus sorrendben lineáris időben kiértékelhető. Mivel P része NP-nek, NP-ben is benne van, de feltéve, hogy P ≠ NP, nem NP-teljes.' },
    lcs2: { region: 'venn-p', text: 'P. Két sorozatra dinamikus programozással n² nagyságrendű lépés. Tetszőleges számú sorozatra már NP-nehéz lenne.' },
    sat: { region: 'venn-npc', text: 'NP-teljes. Egy behelyettesítés gyorsan ellenőrizhető, és Cook–Levin tétele szerint minden NP-beli feladat visszavezethető rá. Ez volt az első NP-teljes feladat.' },
    klikk: { region: 'venn-npc', text: 'NP-teljes, ha k is a bemenet része. Egy javasolt csúcshalmazról gyorsan ellenőrizhető, hogy klikk-e.' },
    fedes: { region: 'venn-npc', text: 'NP-teljes. Ügyelj a kérdésre: legfeljebb k csúcs, nem legalább.' },
    minfedes: { region: 'venn-nph', text: 'NP-nehéz, de nem NP-ben van: ez optimalizálási feladat, a válasz egy szám, nem igen vagy nem. Ugyanolyan nehéz, mint a döntési változat.' },
    tspd: { region: 'venn-npc', text: 'NP-teljes. A tanú a városok listája, az ellenőrzés n összeadás és egy összehasonlítás.' },
    tsp: { region: 'venn-nph', text: 'NP-nehéz optimalizálási feladat. Nem döntési kérdés, ezért NP-n kívül esik, de legalább olyan nehéz, mint bármely NP-beli feladat.' },
    faktor: { region: 'venn-np', text: 'NP-ben (és co-NP-ben) van, de a pontos helye nem ismert: nem tudjuk, P-beli-e, és valószínűleg nem NP-teljes. Jelölt „köztes” feladat.' },
    megallas: { region: 'venn-nph', text: 'NP-nehéz és eldönthetetlen: semmilyen algoritmus nem dönti el mindig helyesen, megáll-e egy program. Ez a ritka kivétel, nem a szabály.' }
  });
  function initVenn() {
    const sel = $('#venn-feladat'), out = $('#venn-ki');
    if (!sel || !out) return;
    const regions = ['venn-p', 'venn-np', 'venn-npc', 'venn-nph'].map((id) => document.getElementById(id));
    sel.addEventListener('change', () => {
      const place = PLACES[sel.value];
      regions.forEach((r) => r && r.classList.toggle('u-hit', !!place && r.id === place.region));
      out.textContent = place ? place.text : 'Válassz egy feladatot a listából.';
    });
  }

  /* 3 · SAT mini-megoldó – PDF 234–235. */
  const FORMULAS = /** @type {Record<string, {vars:number, clauses:number[][]}>} */ ({
    pdf: { vars: 2, clauses: [[1, 1, 2], [-1, -2, -2], [-1, 2, 2]] },
    harom: { vars: 3, clauses: [[1, 2, 3], [-1, -2, 3], [1, -2, -3], [-1, 2, -3]] },
    ellentmondas: { vars: 3, clauses: [[1, 2, 3], [1, 2, -3], [1, -2, 3], [1, -2, -3], [-1, 2, 3], [-1, 2, -3], [-1, -2, 3], [-1, -2, -3]] }
  });
  const NAMES = ['x', 'y', 'z'];
  /** @param {number} l */
  const lit = (l) => (l < 0 ? '¬' : '') + NAMES[Math.abs(l) - 1];
  /** @param {boolean} b */
  const tf = (b) => (b ? 'IGAZ' : 'HAMIS');
  function initSat() {
    const sel = $('#sat-keplet'), list = $('#sat-klozok'), out = $('#sat-ki'), table = $('#sat-tabla'), sum = $('#sat-osszeg');
    if (!sel || !list || !out) return;
    const buttons = NAMES.map((n) => $(`#sat-${n}`));
    const values = [false, false, false];
    const clearTable = () => { table.tHead.innerHTML = ''; table.tBodies[0].innerHTML = ''; sum.textContent = ''; };
    const draw = () => {
      const f = FORMULAS[sel.value];
      buttons.forEach((b, i) => {
        b.hidden = i >= f.vars;
        b.setAttribute('aria-pressed', String(values[i]));
        b.textContent = `${NAMES[i]} = ${tf(values[i])}`;
      });
      const r = M.evalCnf(f.clauses, values.slice(0, f.vars));
      list.innerHTML = '';
      f.clauses.forEach((c, i) => {
        const li = document.createElement('li');
        li.className = r.satisfied[i] ? 'u-ok' : 'u-bad';
        li.textContent = `(${c.map(lit).join(' ∨ ')}) ${r.satisfied[i] ? '✓' : '✗'}`;
        list.append(li);
      });
      out.textContent = `${r.count} / ${f.clauses.length} klóz teljesül. ` + (r.value ? 'Ez a behelyettesítés kielégíti a formulát.' : 'A formula erre a behelyettesítésre HAMIS.');
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => { values[i] = !values[i]; draw(); }));
    sel.addEventListener('change', () => { clearTable(); draw(); });
    $('#sat-mind').addEventListener('click', () => {
      const f = FORMULAS[sel.value], rows = M.bruteForceSat(f.clauses, f.vars), best = M.maxSat(f.clauses, f.vars);
      clearTable();
      const head = table.tHead.insertRow();
      for (const h of [...NAMES.slice(0, f.vars), 'teljesülő klózok', 'formula']) { const th = document.createElement('th'); th.textContent = h; head.append(th); }
      for (const row of rows) {
        const tr = table.tBodies[0].insertRow();
        if (row.ok) tr.className = 'u-row-hit';
        for (const cell of [...row.assignment.map(tf), `${row.count} / ${f.clauses.length}`, row.ok ? 'IGAZ' : 'HAMIS']) tr.insertCell().textContent = cell;
      }
      const good = rows.filter((r) => r.ok).length;
      sum.textContent = `${rows.length} behelyettesítésből ${good} elégíti ki a formulát. Max-SAT: a legjobb behelyettesítés ${best.best} / ${f.clauses.length} klózt teljesít.`;
    });
    draw();
  }

  /* 4 · Gráflabor – PDF 236–238., 243. */
  const G = {
    nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    edges: [['A', 'B'], ['A', 'D'], ['A', 'E'], ['B', 'D'], ['B', 'E'], ['D', 'E'], ['B', 'C'], ['C', 'E'], ['C', 'F'], ['E', 'F'], ['D', 'G'], ['E', 'G'], ['F', 'G']],
    pos: /** @type {Record<string, number[]>} */ ({ A: [40, 45], B: [150, 28], C: [262, 45], D: [55, 150], E: [155, 108], F: [265, 150], G: [155, 192] })
  };
  function initGraph() {
    const svg = $('#graf-rajz'), out = $('#graf-ki'), mode = $('#graf-mod'), bar = $('#graf-gombok');
    if (!svg || !out || !mode || !bar) return;
    /** @type {string[]} */
    let chosen = [];
    const has = (/** @type {string} */ u, /** @type {string} */ v) => G.edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
    const buttons = G.nodes.map((n) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'u-toggle'; b.id = `graf-${n}`; b.textContent = n; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => toggle(n));
      bar.append(b);
      return b;
    });
    /** @param {string} n */
    const toggle = (n) => {
      if (mode.value === 'hamilton') {
        if (chosen[chosen.length - 1] === n) chosen.pop();
        else if (!chosen.includes(n)) chosen.push(n);
      } else chosen = chosen.includes(n) ? chosen.filter((x) => x !== n) : [...chosen, n];
      draw();
    };
    const draw = () => {
      /** @type {Map<string, string>} */
      const edgeClass = new Map(), m = mode.value;
      /** @type {string[][]} */
      let extra = [];
      let msg = '';
      if (m === 'klikk') {
        const missing = chosen.flatMap((u, i) => chosen.slice(i + 1).filter((v) => !has(u, v)).map((v) => [u, v]));
        G.edges.forEach(([u, v]) => { if (chosen.includes(u) && chosen.includes(v)) edgeClass.set(`${u}${v}`, 'u-edge-on'); });
        extra = missing;
        const best = M.maxClique(G.nodes, G.edges).length;
        msg = !chosen.length ? 'Válassz csúcsokat: a klikkben bármely kettő szomszédos.'
          : M.isClique(G.edges, chosen) ? `A(z) ${chosen.join(', ')} halmaz ${chosen.length} csúcsú klikk. A legnagyobb klikk ${best} csúcsú.`
          : `Ez nem klikk: hiányzik ${missing.map(([u, v]) => `a(z) ${u}–${v}`).join(', ')} él.`;
      } else if (m === 'fedes') {
        const open = G.edges.filter(([u, v]) => !chosen.includes(u) && !chosen.includes(v));
        G.edges.forEach(([u, v]) => edgeClass.set(`${u}${v}`, chosen.includes(u) || chosen.includes(v) ? 'u-edge-on' : 'u-edge-bad'));
        const best = M.minVertexCover(G.nodes, G.edges).length;
        msg = open.length ? `${open.length} fedetlen él maradt: ${open.map(([u, v]) => `${u}–${v}`).join(', ')}.`
          : `A(z) ${chosen.join(', ')} halmaz ${chosen.length} csúcsú lefedő csúcshalmaz. A legkisebb ${best} csúcsú.`;
      } else {
        const r = M.checkPath(G.nodes, G.edges, chosen);
        chosen.slice(1).forEach((v, i) => edgeClass.set([chosen[i], v].sort().join(''), has(chosen[i], v) ? 'u-edge-on' : 'u-edge-bad'));
        if (r.badStep !== null) extra = [[chosen[r.badStep], chosen[r.badStep + 1]]];
        if (r.cycle) edgeClass.set([chosen[0], chosen[chosen.length - 1]].sort().join(''), 'u-edge-on');
        msg = !chosen.length ? 'Kattints a csúcsokra az út sorrendjében. Az utolsó csúcsra újra kattintva visszaléphetsz.'
          : r.badStep !== null ? `Nincs ${chosen[r.badStep]}–${chosen[r.badStep + 1]} él, ez nem út. Lépj vissza.`
          : r.ok ? `Hamilton-út: ${chosen.join(' → ')}.` + (r.cycle ? ` A(z) ${chosen[chosen.length - 1]}–${chosen[0]} él bezárja: ez Hamilton-kör is.` : ' Kör nem lesz belőle, mert a két vége nem szomszédos.')
          : `Eddig: ${chosen.join(' → ')}. Még hiányzik: ${r.missing.join(', ')}.`;
      }
      let s = '';
      for (const [u, v] of G.edges) s += `<path class="u-edge ${edgeClass.get([u, v].sort().join('')) || ''}" d="M${G.pos[u]}L${G.pos[v]}"/>`;
      for (const [u, v] of extra) if (!has(u, v)) s += `<path class="u-edge u-edge-bad" d="M${G.pos[u]}L${G.pos[v]}"/>`;
      G.nodes.forEach((n) => {
        const on = chosen.includes(n), [x, y] = G.pos[n];
        s += `<circle class="u-node${on ? ' u-node-on' : ''}" data-node="${n}" cx="${x}" cy="${y}" r="16"/><text class="u-svg-sym${on ? ' u-on' : ''}" x="${x}" y="${y + 5}" text-anchor="middle" pointer-events="none">${n}</text>`;
        if (m === 'hamilton' && on) s += `<text class="u-svg-small" x="${x + 17}" y="${y - 12}">${chosen.indexOf(n) + 1}.</text>`;
      });
      svg.innerHTML = `<title id="graf-rajz-t">A gráflabor gráfja. Kijelölve: ${chosen.join(', ') || 'semmi'}.</title>` + s;
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(chosen.includes(G.nodes[i]))));
      out.textContent = msg;
    };
    svg.addEventListener('click', (/** @type {MouseEvent} */ e) => {
      const n = /** @type {Element} */ (e.target).getAttribute('data-node');
      if (n) toggle(n);
    });
    mode.addEventListener('change', () => { chosen = []; draw(); });
    $('#graf-torol').addEventListener('click', () => { chosen = []; draw(); });
    $('#graf-megoldas').addEventListener('click', () => {
      chosen = mode.value === 'klikk' ? M.maxClique(G.nodes, G.edges) : mode.value === 'fedes' ? M.minVertexCover(G.nodes, G.edges) : M.findHamiltonPath(G.nodes, G.edges) || [];
      draw();
    });
    draw();
  }

  /* 5 · Hátizsák – PDF 239. */
  const ITEMS = [{ w: 12, v: 4 }, { w: 2, v: 2 }, { w: 1, v: 2 }, { w: 1, v: 1 }, { w: 4, v: 10 }];
  const CAP = 15;
  function initKnapsack() {
    const out = $('#hz-ki'), bar = $('#hz-savszel');
    if (!out || !bar) return;
    const inputs = ITEMS.map((_, i) => $(`#hz-${i}`));
    /** @param {string} note */
    const draw = (note = '') => {
      const counts = inputs.map((el) => Math.max(0, Math.floor(Number(el.value) || 0)));
      const t = M.knapsackTotals(ITEMS, counts, CAP);
      bar.style.width = `${Math.min(100, (t.weight / CAP) * 100)}%`;
      bar.classList.toggle('u-over', !t.ok);
      out.textContent = `Súly: ${t.weight} kg / ${CAP} kg · érték: ${t.value} $. ` + (t.ok ? 'Belefér.' : 'Ez túl nehéz, a hátizsák nem bírja el!') + (note ? ` ${note}` : '');
    };
    /** @param {number[]} counts @param {string} note */
    const load = (counts, note) => { inputs.forEach((el, i) => { el.value = String(counts[i]); }); draw(note); };
    inputs.forEach((el) => el.addEventListener('input', () => draw()));
    $('#hz-opt01').addEventListener('click', () => { const r = M.knapsack01(ITEMS, CAP); load(r.take, `Ez a 0/1 változat optimuma: ${r.value} $.`); });
    $('#hz-optkorl').addEventListener('click', () => { const r = M.knapsackUnbounded(ITEMS, CAP); load(r.counts, `Ez a korlátlan darabszámú változat optimuma: ${r.value} $.`); });
    $('#hz-torol').addEventListener('click', () => load(ITEMS.map(() => 0), ''));
    draw();
  }

  /* 6 · Utazóügynök – PDF 241–242., 253. */
  const CITIES = [[1, 1], [4, 2], [5, 2], [6, 4], [4, 4], [3, 6], [1, 5], [2, 3]];
  function initTsp() {
    const svg = $('#tsp-rajz'), out = $('#tsp-ki'), bar = $('#tsp-gombok'), dec = $('#tsp-dontes'), kIn = $('#tsp-k');
    if (!svg || !out || !bar || !dec || !kIn) return;
    const d = M.euclidean(CITIES), X = (/** @type {number} */ x) => 40 + (x - 1) * 50, Y = (/** @type {number} */ y) => 230 - (y - 1) * 40;
    const opt = M.tspBruteForce(d);
    /** @type {number[]} */
    let tour = [];
    let note = '';
    const buttons = CITIES.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'u-toggle'; b.id = `tsp-v${i}`; b.textContent = String(i); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => pick(i));
      bar.append(b);
      return b;
    });
    /** @param {number} i */
    const pick = (i) => {
      if (tour[tour.length - 1] === i) tour.pop(); else if (!tour.includes(i)) tour.push(i);
      note = ''; draw();
    };
    const draw = () => {
      const full = tour.length === CITIES.length;
      let s = '<g class="u-axis"><path d="M20 250H305M20 250V15"/>';
      for (let i = 1; i <= 6; i++) s += `<text x="${X(i)}" y="262" text-anchor="middle">${i}</text><text x="12" y="${Y(i) + 4}" text-anchor="middle">${i}</text>`;
      s += '</g>';
      if (tour.length > 1) s += `<path class="u-route" d="M${tour.map((i) => `${X(CITIES[i][0])} ${Y(CITIES[i][1])}`).join('L')}${full ? 'Z' : ''}"/>`;
      CITIES.forEach(([x, y], i) => { s += `<circle class="u-city${tour.includes(i) ? ' u-city-on' : ''}" data-city="${i}" cx="${X(x)}" cy="${Y(y)}" r="11"/><text class="u-city-t" x="${X(x)}" y="${Y(y) + 4}" text-anchor="middle" pointer-events="none">${i}</text>`; });
      svg.innerHTML = `<title id="tsp-rajz-t">Az utazóügynök-labor térképe. Útvonal: ${tour.join(', ') || 'még üres'}.</title>` + s;
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(tour.includes(i))));
      const len = tour.slice(1).reduce((acc, c, i) => acc + d[tour[i]][c], 0);
      out.textContent = !tour.length ? 'Kattints a városokra a bejárás sorrendjében. Az utolsóra újra kattintva visszaléphetsz.'
        : full ? `Körút: ${tour.join(' → ')} → ${tour[0]}. Hossza ${fmt(M.tourLength(d, tour))} egység. Az optimum ${fmt(opt.length)}.${note ? ' ' + note : ''}`
        : `Útvonal: ${tour.join(' → ')} · ${tour.length} / ${CITIES.length} város · eddigi hossz ${fmt(len)} egység.`;
      decide();
    };
    const decide = () => {
      const k = Number(kIn.value);
      if (tour.length !== CITIES.length) { dec.textContent = 'A döntési kérdéshez egy teljes körút kell tanúként.'; return; }
      const r = M.tspDecision(d, tour, k);
      dec.textContent = `Ellenőrzés ${CITIES.length} összeadással: ${fmt(r.length)} < ${fmt(k)}? ` + (r.yes ? 'Igen, ez a tanú igazolja az igen választ.' : 'Nem. Ez a tanú nem igazolja az igen választ, de ebből még nem következik, hogy nincs jobb körút.');
    };
    svg.addEventListener('click', (/** @type {MouseEvent} */ e) => {
      const c = /** @type {Element} */ (e.target).getAttribute('data-city');
      if (c !== null) pick(Number(c));
    });
    kIn.addEventListener('input', decide);
    $('#tsp-nn').addEventListener('click', () => { const r = M.nearestNeighbour(d, 0); tour = r.tour; note = 'Ezt a mohó legközelebbi szomszéd szabály adta, a 0. városból indulva.'; draw(); });
    $('#tsp-opt').addEventListener('click', () => { tour = opt.tour; note = `A kimerítő keresés mind az ${opt.checked} körutat végignézte (7! = 5040).`; draw(); });
    $('#tsp-torol').addEventListener('click', () => { tour = []; note = ''; draw(); });
    draw();
  }

  /* 7 · Rekeszpakolás – PDF 250. */
  const SIZES = [2, 5, 4, 7, 1, 3, 8], BIN = 10, SLOTS = 4;
  function initBins() {
    const wrap = $('#rp-tetelek'), vis = $('#rp-rekeszek'), out = $('#rp-ki');
    if (!wrap || !vis || !out) return;
    const selects = SIZES.map((size, i) => {
      const label = document.createElement('label');
      label.textContent = `${i + 1}. tétel · méret ${size}`;
      const sel = document.createElement('select');
      sel.id = `rp-${i}`;
      sel.add(new Option('— még sehol', ''));
      for (let b = 0; b < SLOTS; b++) sel.add(new Option(`${b + 1}. rekesz`, String(b)));
      sel.addEventListener('change', draw);
      label.append(sel);
      wrap.append(label);
      return sel;
    });
    const lower = M.binLowerBound(SIZES, BIN);
    function draw() {
      const assign = selects.map((s) => (s.value === '' ? null : Number(s.value)));
      const r = M.binLoads(SIZES, assign, BIN);
      vis.innerHTML = '';
      for (let b = 0; b < SLOTS; b++) {
        const div = document.createElement('div'), load = r.loads[b] || 0;
        if (load > BIN) div.className = 'u-over';
        assign.forEach((a, i) => {
          if (a !== b) return;
          const span = document.createElement('span');
          span.style.height = `${(SIZES[i] / BIN) * 100}%`;
          span.textContent = String(SIZES[i]);
          div.append(span);
        });
        const small = document.createElement('small');
        small.textContent = `${b + 1}. · ${load}/${BIN}`;
        div.append(small);
        vis.append(div);
      }
      const waiting = assign.filter((a) => a === null).length;
      const over = r.loads.map((l, b) => (l > BIN ? b + 1 : 0)).filter(Boolean);
      out.textContent = `${r.used} rekesz használatban (alsó korlát: ${lower}). ` +
        (over.length ? `A(z) ${over.join('., ')}. rekesz túlcsordul!` : waiting ? `Még ${waiting} tétel vár a helyére.` : r.used === lower ? 'Minden tétel a helyén, és ez eléri az alsó korlátot: optimális.' : 'Minden tétel a helyén, de az alsó korlátnál több rekesz kell. Van jobb pakolás?');
    }
    /** @param {boolean} decreasing */
    const run = (decreasing) => {
      M.firstFit(SIZES, BIN, decreasing).bins.forEach((bin, b) => bin.forEach((i) => { selects[i].value = String(b); }));
      draw();
    };
    $('#rp-ff').addEventListener('click', () => run(false));
    $('#rp-ffd').addEventListener('click', () => run(true));
    $('#rp-torol').addEventListener('click', () => { selects.forEach((s) => { s.value = ''; }); draw(); });
    draw();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-07-kviz';
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
    initGrowth();
    initVenn();
    initSat();
    initGraph();
    initKnapsack();
    initTsp();
    initBins();
    initQuiz();
  });
})();
