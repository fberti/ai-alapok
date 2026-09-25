// 01 · A fejezet interaktív bemutatói.
(() => {
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, attrs = {}, text = '') => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text) node.textContent = text;
    return node;
  };
  const svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    return node;
  };
  const fmt = (n) => n.toLocaleString('hu-HU');

  /* Tartalomjegyzék: az aktuális rész jelölése */
  function initToc() {
    const links = [...document.querySelectorAll('.toc a[href^="#"]')];
    if (!('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
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

  /* Mentális kor */
  function initMentalAge() {
    const age = $('#mk-eletkor'), level = $('#mk-szint'), out = $('#mk-eredmeny');
    if (!age || !level || !out) return;
    const update = () => {
      const a = Number(age.value), m = Number(level.value);
      if (!Number.isFinite(a) || !Number.isFinite(m) || a < 3 || a > 15 || m < 3 || m > 13) {
        out.innerHTML = '<p>Adj meg 3 és 15 év közötti életkort és 3 és 13 közötti korszintet.</p>';
        return;
      }
      const q = Math.round((m / a) * 100);
      const diff = m - a;
      const rel = diff === 0 ? 'pontosan a korosztályának megfelelő szinten áll'
        : diff > 0 ? `${diff} évvel előrébb tart a korosztályánál` : `${-diff} évvel hátrébb tart a korosztályánál`;
      out.innerHTML = `<p><strong>Mentális kor: ${m} év.</strong> A gyermek ${rel}.</p>` +
        `<p>Stern hányadosa: ${m} ÷ ${a} × 100 = <strong>${q}</strong>.</p>` +
        (a > 13 ? '<p>Figyelem: 13 év fölött a korszintes skála már nem mér, ezért a hányados félrevezető. Ez az egyik oka, hogy ma eltérés-IQ-t használnak.</p>' : '');
    };
    age.addEventListener('input', update);
    level.addEventListener('input', update);
    update();
  }

  /* Turing-játék */
  const turingRounds = [
    {
      question: 'Mit ettél ma reggel?',
      a: 'Semmit, elkéstem. Egy kávé volt a buszon, azt is kilöttyintettem. Miért?',
      b: 'Reggelire zabkását ettem friss gyümölccsel, amely kiegyensúlyozott és tápláló kezdést biztosít a naphoz.',
      machine: 'b',
      lesson: 'A B válasz hibátlan, de olyan, mint egy reklámszöveg. Jones és Bergen kísérleteiben a bírálók leginkább a stílusra és a hangnemre figyeltek, nem a tudásra.'
    },
    {
      question: 'Mennyi 2849 × 7316?',
      a: '20 843 284.',
      b: 'Hű, ezt fejben nem. Úgy húszmillió körül? Adj egy számológépet.',
      machine: 'a',
      lesson: 'Az A azonnal és hibátlanul számolt, ez leleplezi. Turing ezért írta a példájába, hogy a gép várjon fél percet, és hibázzon – a jó utánzáshoz az emberi gyengeségek utánzása is kell.'
    },
    {
      question: 'Szerinted mi a legjobb dolog a télben?',
      a: 'nem akarok erről beszélni. következő',
      b: 'A forralt bor, meg hogy korán sötétedik, és van ürügy otthon maradni egy könyvvel.',
      machine: 'b',
      lesson: 'Csapda volt: az A valódi ember, csak nem akart együttműködni. Ez a PDF egyik kritikája – az együttműködést megtagadó ember is „megbukhat” a teszten.'
    }
  ];
  function initTuring() {
    const box = $('#turing-kor');
    if (!box) return;
    let round = 0, correct = 0;
    const render = () => {
      box.replaceChildren();
      if (round >= turingRounds.length) {
        box.append(el('p', {}, `Vége. ${turingRounds.length} körből ${correct} alkalommal találtad el, melyik a gép.`));
        box.append(el('p', {}, 'A tanulság: a döntést sokszor apró stílusjegyek és a partner együttműködése befolyásolja, nem az, hogy ki az „intelligensebb”.'));
        const again = el('button', { type: 'button' }, 'Újrakezdés');
        again.addEventListener('click', () => { round = 0; correct = 0; render(); again.blur(); box.querySelector('button')?.focus(); });
        box.append(again);
        return;
      }
      const r = turingRounds[round];
      box.append(el('p', { class: 'u-round-count' }, `${round + 1}. kör / ${turingRounds.length}`));
      const fig = el('figure', { class: 'u-dialogue' });
      const dl = el('dl');
      [['Bíráló', r.question, ''], ['A alany', r.a, 'u-other'], ['B alany', r.b, 'u-other']].forEach(([who, text, cls]) => {
        const row = el('div', cls ? { class: cls } : {});
        row.append(el('dt', {}, who), el('dd', {}, text));
        dl.append(row);
      });
      fig.append(dl);
      box.append(fig);
      const choice = el('div', { class: 'u-choice', role: 'group', 'aria-label': 'Melyik a gép?' });
      const feedback = el('div', { class: 'u-out' });
      ['a', 'b'].forEach((key) => {
        const btn = el('button', { type: 'button' }, `${key.toUpperCase()} a gép`);
        btn.addEventListener('click', () => {
          choice.querySelectorAll('button').forEach((b) => { b.disabled = true; });
          const ok = key === r.machine;
          if (ok) correct += 1;
          feedback.replaceChildren(
            el('p', { class: ok ? 'u-ok' : 'u-bad' }, ok ? 'Eltaláltad.' : `Nem talált: a gép a(z) ${r.machine.toUpperCase()} alany volt.`),
            el('p', {}, r.lesson)
          );
          const next = el('button', { type: 'button' }, round + 1 < turingRounds.length ? 'Következő kör' : 'Eredmény');
          next.addEventListener('click', () => { round += 1; render(); box.querySelector('button')?.focus(); });
          feedback.append(next);
          next.focus();
        });
        choice.append(btn);
      });
      box.append(choice, feedback);
    };
    render();
  }

  /* Szimbolikus egyszerűsítés */
  function parsePolynomial(input) {
    let s = input.replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/\*/g, '').replace(/²/g, '^2').replace(/³/g, '^3');
    if (!s) return null;
    if (!/^[+-]/.test(s)) s = '+' + s;
    const re = /([+-])(\d+)?(x(?:\^(\d+))?)?/y;
    const terms = [];
    while (re.lastIndex < s.length) {
      const start = re.lastIndex;
      const m = re.exec(s);
      if (!m || (m[2] === undefined && m[3] === undefined) || re.lastIndex === start) return null;
      const sign = m[1] === '-' ? -1 : 1;
      const coef = m[2] === undefined ? 1 : Number(m[2]);
      const exp = m[3] === undefined ? 0 : (m[4] === undefined ? 1 : Number(m[4]));
      if (exp > 20) return null;
      terms.push({ coef: sign * coef, exp });
    }
    return terms;
  }
  function termHtml(coef, exp, first) {
    const abs = Math.abs(coef);
    const sign = coef < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ');
    const num = exp === 0 ? String(abs) : (abs === 1 ? '' : String(abs));
    const x = exp === 0 ? '' : exp === 1 ? 'x' : `x<sup>${exp}</sup>`;
    return sign + num + x;
  }
  function polyHtml(terms) {
    const nz = terms.filter((t) => t.coef !== 0);
    if (!nz.length) return '0';
    return nz.map((t, i) => termHtml(t.coef, t.exp, i === 0)).join('');
  }
  function simplify(terms) {
    const groups = new Map();
    terms.forEach((t) => groups.set(t.exp, [...(groups.get(t.exp) || []), t.coef]));
    const combined = [...groups.entries()].sort((p, q) => p[0] - q[0]).map(([exp, cs]) => ({ exp, coef: cs.reduce((a, b) => a + b, 0), parts: cs }));
    return combined;
  }
  function initSymbolic() {
    const input = $('#szimb-be'), btn = $('#szimb-gomb'), out = $('#szimb-ki');
    if (!input || !btn || !out) return;
    const run = () => {
      const terms = parsePolynomial(input.value);
      if (!terms) {
        out.innerHTML = '<p class="u-bad">Ezt a kifejezést nem tudom értelmezni.</p><p>Használj egész számokat, <code>x</code>-et, <code>^</code> hatványjelet, valamint + és − jelet. Például: <code>2x^2 - x + 3</code>.</p>';
        return;
      }
      const combined = simplify(terms);
      const grouped = combined.map((g) => {
        const label = g.exp === 0 ? 'konstansok' : g.exp === 1 ? 'x-es tagok' : `x<sup>${g.exp}</sup>-es tagok`;
        return `${label}: ${g.parts.map((c) => (c < 0 ? '(' + c + ')' : c)).join(' + ')} = ${g.coef}`;
      });
      const result = polyHtml(combined);
      const again = polyHtml(simplify(combined.filter((t) => t.coef !== 0)));
      out.innerHTML =
        `<p><strong>1. Tagokra bontás:</strong> ${terms.map((t) => termHtml(t.coef, t.exp, true)).join(' ; ')}</p>` +
        `<p><strong>2. Egynemű tagok csoportosítása és összevonása:</strong> ${grouped.join(' ; ')}</p>` +
        `<p><strong>3. Rendezés növekvő kitevő szerint:</strong> ${result}</p>` +
        `<p><strong>4. Újabb menet:</strong> a szabályok ismételt alkalmazása után ${again === result ? 'a kifejezés már nem változik, elértük a fixpontot.' : 'a kifejezés tovább változott.'}</p>` +
        `<p>Out = <strong>${result}</strong></p>`;
    };
    btn.addEventListener('click', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    run();
  }

  /* Élkeresés */
  function initEdges() {
    const inBox = $('#el-be'), outBox = $('#el-ki'), text = $('#el-szoveg');
    if (!inBox || !outBox) return;
    const N = 8;
    const px = Array.from({ length: N * N }, (_, i) => {
      const r = Math.floor(i / N), c = i % N;
      return (r >= 2 && r <= 5 && c >= 1 && c <= 4) || (r >= 4 && r <= 5 && c >= 5 && c <= 6);
    });
    const buttons = px.map((_, i) => {
      const b = el('button', { type: 'button', 'aria-label': `${Math.floor(i / N) + 1}. sor, ${(i % N) + 1}. oszlop` });
      b.addEventListener('click', () => { px[i] = !px[i]; render(); });
      inBox.append(b);
      return b;
    });
    const cells = px.map(() => { const s = el('span'); outBox.append(s); return s; });
    const dark = (r, c) => r >= 0 && r < N && c >= 0 && c < N && px[r * N + c];
    function render() {
      let darkCount = 0, edgeCount = 0;
      px.forEach((on, i) => {
        const r = Math.floor(i / N), c = i % N;
        buttons[i].setAttribute('aria-pressed', String(on));
        const edge = on && (!dark(r - 1, c) || !dark(r + 1, c) || !dark(r, c - 1) || !dark(r, c + 1));
        cells[i].className = edge ? 'u-edge' : on ? 'u-fill' : '';
        if (on) darkCount += 1;
        if (edge) edgeCount += 1;
      });
      text.textContent = `${darkCount} sötét képpontból ${edgeCount} él, ${darkCount - edgeCount} belső pont. Az élkeresés után a gépnek már csak a körvonalakkal kell dolgoznia – ez a nagy adatmennyiség első csökkentése.`;
    }
    render();
  }

  /* Mintavételezés és kvantálás */
  function initSampling() {
    const svg = $('#hang-svg'), n = $('#hang-n'), b = $('#hang-b'), nOut = $('#hang-n-ki'), bOut = $('#hang-b-ki'), text = $('#hang-szoveg');
    if (!svg || !n || !b) return;
    const W = 600, H = 220, pad = 14;
    const f = (t) => 0.6 * Math.sin(2 * Math.PI * 2 * t) + 0.35 * Math.sin(2 * Math.PI * 5 * t + 0.6);
    const X = (t) => pad + t * (W - 2 * pad);
    const Y = (v) => H / 2 - v * (H / 2 - pad);
    function render() {
      const count = Number(n.value), bits = Number(b.value), L = 2 ** bits;
      nOut.textContent = String(count); bOut.textContent = String(bits);
      svg.replaceChildren(svgEl('title', {}));
      svg.firstChild.textContent = `Hanghullám ${count} mintával és ${L} kvantálási szinttel`;
      svg.append(svgEl('line', { class: 'u-axis', x1: pad, x2: W - pad, y1: H / 2, y2: H / 2 }));
      if (L <= 16) for (let k = 0; k < L; k += 1) { const y = Y(-1 + (2 * k) / (L - 1)); svg.append(svgEl('line', { class: 'u-level', x1: pad, x2: W - pad, y1: y, y2: y })); }
      let d = '';
      for (let i = 0; i <= 300; i += 1) { const t = i / 300; d += `${i ? 'L' : 'M'}${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`; }
      svg.append(svgEl('path', { class: 'u-wave', d }));
      const q = (v) => (L === 1 ? 0 : Math.round(((v + 1) / 2) * (L - 1)) / (L - 1) * 2 - 1);
      let stair = '', err = 0;
      const samples = [];
      for (let i = 0; i < count; i += 1) {
        const t0 = i / count, t1 = (i + 1) / count, tm = (i + 0.5) / count;
        const v = q(f(tm));
        samples.push([tm, v]);
        stair += `${i ? 'L' : 'M'}${X(t0).toFixed(1)},${Y(v).toFixed(1)}L${X(t1).toFixed(1)},${Y(v).toFixed(1)}`;
      }
      for (let i = 0; i < 300; i += 1) { const t = (i + 0.5) / 300; const k = Math.min(count - 1, Math.floor(t * count)); err += Math.abs(f(t) - samples[k][1]); }
      err /= 300;
      svg.append(svgEl('path', { class: 'u-stair', d: stair }));
      samples.forEach(([t, v]) => svg.append(svgEl('circle', { class: 'u-dot', cx: X(t).toFixed(1), cy: Y(v).toFixed(1), r: 3.5 })));
      const warn = count <= 10 ? ' Túl kevés a minta: a hullám gyors (másodpercenként 5-ös) rezgése elvész. A mintavételezési tétel szerint legalább kétszer annyi minta kell, mint a leggyorsabb rezgés frekvenciája.' : '';
      text.innerHTML = `<p>${count} minta × ${bits} bit = <strong>${fmt(count * bits)} bit</strong> adat, ${fmt(L)} kvantálási szint. Átlagos eltérés az eredetitől: <strong>${(err * 100).toFixed(0)}%</strong> a teljes kitéréshez képest.${warn}</p>`;
    }
    n.addEventListener('input', render);
    b.addEventListener('input', render);
    render();
  }

  /* Nyolc vezér */
  function* queenSearch(state) {
    const cols = state.cols;
    function* rec(row) {
      if (row === 8) { yield { type: 'solved' }; return true; }
      for (let c = 0; c < 8; c += 1) {
        state.tries += 1;
        const safe = cols.every((oc, r) => oc !== c && Math.abs(oc - c) !== row - r);
        yield { type: 'try', row, col: c, safe };
        if (safe) {
          cols.push(c); state.placed += 1;
          yield { type: 'place', row, col: c };
          if (yield* rec(row + 1)) return true;
          cols.pop(); state.backs += 1;
          yield { type: 'back', row, col: c };
        }
      }
      return false;
    }
    yield* rec(0);
  }
  function initQueens() {
    const board = $('#vezer-tabla'), status = $('#vezer-allapot');
    if (!board || !status) return;
    let manual = new Set();
    let search = null, state = null, last = null, done = false;
    const cells = [];
    for (let r = 0; r < 8; r += 1) for (let c = 0; c < 8; c += 1) {
      const b = el('button', { type: 'button' });
      if ((r + c) % 2 === 1) b.classList.add('u-dark');
      b.addEventListener('click', () => {
        search = null; done = false; last = null;
        const key = r * 8 + c;
        if (manual.has(key)) manual.delete(key); else manual.add(key);
        render();
      });
      b.addEventListener('keydown', (e) => {
        const moves = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 };
        if (!(e.key in moves)) return;
        e.preventDefault();
        const next = r * 8 + c + moves[e.key];
        if (next >= 0 && next < 64 && !(e.key === 'ArrowLeft' && c === 0) && !(e.key === 'ArrowRight' && c === 7)) cells[next].focus();
      });
      cells.push(b); board.append(b);
    }
    const queens = () => (search ? state.cols.map((c, r) => r * 8 + c) : [...manual]);
    function render(msg) {
      const qs = queens();
      const attacked = new Set();
      qs.forEach((a) => qs.forEach((b) => {
        if (a === b) return;
        const [ra, ca, rb, cb] = [Math.floor(a / 8), a % 8, Math.floor(b / 8), b % 8];
        if (ra === rb || ca === cb || Math.abs(ra - rb) === Math.abs(ca - cb)) attacked.add(a);
      }));
      cells.forEach((b, i) => {
        const has = qs.includes(i);
        b.textContent = has ? '♛' : (search && last && last.type === 'try' && !last.safe && last.row * 8 + last.col === i ? '×' : '');
        b.classList.toggle('u-attacked', attacked.has(i));
        b.setAttribute('aria-label', `${Math.floor(i / 8) + 1}. sor, ${(i % 8) + 1}. oszlop${has ? ', vezér' : ''}${attacked.has(i) ? ', ütésben' : ''}`);
      });
      if (msg) { status.innerHTML = msg; return; }
      const n = qs.length;
      status.innerHTML = n === 8 && attacked.size === 0
        ? '<p class="u-ok">Nyolc vezér, egyik sem üti a másikat. Ez egy megoldás!</p>'
        : `<p>${n} vezér a táblán, ebből ${attacked.size} ütésben.</p>`;
    }
    function step() {
      if (!search || done) {
        manual = new Set();
        state = { cols: [], tries: 0, placed: 0, backs: 0 };
        search = queenSearch(state); done = false;
      }
      const { value, done: finished } = search.next();
      if (finished || !value) { done = true; return; }
      last = value;
      const stats = `Vizsgált mezők: ${state.tries}, lerakások: ${state.placed}, visszalépések: ${state.backs}.`;
      const where = value.row !== undefined ? `${value.row + 1}. sor, ${value.col + 1}. oszlop` : '';
      let msg;
      if (value.type === 'try') msg = value.safe ? `Próba: ${where} – szabad mező.` : `Próba: ${where} – ütésben van, kihagyjuk.`;
      else if (value.type === 'place') msg = `Lerakás: ${where}.`;
      else if (value.type === 'back') msg = `Zsákutca: a ${value.row + 2}. sorban nincs szabad mező, ezért felvesszük a vezért innen: ${where}.`;
      else { msg = '<strong>Megvan az első megoldás.</strong>'; done = true; }
      render(`<p>${msg}</p><p>${stats}</p>`);
    }
    $('#vezer-lepes').addEventListener('click', step);
    $('#vezer-vegig').addEventListener('click', () => { if (!search || done) step(); while (!done) step(); });
    $('#vezer-torles').addEventListener('click', () => { manual = new Set(); search = null; done = false; last = null; render(); });
    render();
  }

  /* DENDRAL-szabály */
  function initDendral() {
    const svg = $('#dendral-svg'), out = $('#dendral-ki');
    const boxes = [...document.querySelectorAll('#dendral-labor input[data-csucs]')];
    if (!svg || !out || !boxes.length) return;
    const W = 560, H = 190, left = 30, right = 20, base = 150;
    const X = (m) => left + (m / 100) * (W - left - right);
    const minor = [[15, 12], [27, 10], [29, 14], [39, 9], [41, 16], [57, 8], [69, 6], [85, 5]];
    const main = { 43: 120, 58: 55, 71: 80, 86: 70 };
    function render() {
      svg.replaceChildren(svgEl('title', {}));
      svg.firstChild.textContent = 'Egyszerűsített tömegspektrum';
      svg.append(svgEl('line', { class: 'u-axis', x1: left, x2: W - right, y1: base, y2: base }));
      svg.append(svgEl('line', { class: 'u-axis', x1: left, x2: left, y1: 15, y2: base }));
      [0, 20, 40, 60, 80, 100].forEach((m) => { const t = svgEl('text', { x: X(m) - 6, y: base + 16 }); t.textContent = String(m); svg.append(t); });
      const lab = svgEl('text', { x: W - right - 90, y: base + 34 }); lab.textContent = 'tömeg/töltés'; svg.append(lab);
      minor.forEach(([m, h]) => svg.append(svgEl('rect', { class: 'u-bar', x: X(m) - 2, y: base - h, width: 4, height: h })));
      const on = new Set(boxes.filter((b) => b.checked).map((b) => Number(b.dataset.csucs)));
      Object.entries(main).forEach(([m, h]) => {
        if (!on.has(Number(m))) return;
        svg.append(svgEl('rect', { class: 'u-bar u-on', x: X(Number(m)) - 3, y: base - h, width: 6, height: h }));
        const t = svgEl('text', { x: X(Number(m)) - 8, y: base - h - 5 }); t.textContent = m; svg.append(t);
      });
      const missing = [43, 58, 71, 86].filter((m) => !on.has(m));
      out.innerHTML = missing.length === 0
        ? '<p class="u-ok">Minden feltétel teljesül: a szabály elsül.</p><p>Következtetés: a propil-keton részszerkezet jelen lehet. A szerkezetgeneráló ezután csak az ilyen részszerkezetet tartalmazó jelölteket vizsgálja.</p>'
        : `<p class="u-bad">A szabály nem sül el.</p><p>Hiányzó feltétel: csúcs ${missing.join(', ')} tömeg/töltésnél. Egyetlen hiányzó csúcs is elég, hogy a szabály ne következtessen – a feltételek ÉS kapcsolatban állnak.</p>`;
    }
    boxes.forEach((b) => b.addEventListener('change', render));
    render();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const key = 'mi-alapok-01-kviz';
    try { const prev = localStorage.getItem(key); if (prev) result.textContent = `Legutóbbi eredményed: ${prev}. Bármikor újra kitöltheted, vagy kihagyhatod.`; else result.textContent = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.'; } catch { result.textContent = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.'; }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const sets = [...form.querySelectorAll('fieldset')];
      let score = 0, answered = 0;
      sets.forEach((fs) => {
        const chosen = fs.querySelector('input:checked');
        const fb = fs.querySelector('.u-feedback');
        if (!chosen) { fb.textContent = 'Nem válaszoltál – ez rendben van.'; fb.className = 'u-feedback'; return; }
        answered += 1;
        const ok = chosen.value === fs.dataset.helyes;
        if (ok) score += 1;
        fb.className = 'u-feedback ' + (ok ? 'u-ok' : 'u-bad');
        fb.textContent = (ok ? 'Helyes. ' : `Nem egészen, a helyes válasz: ${fs.dataset.helyes}). `) + fb.dataset.magyarazat;
      });
      const summary = `${sets.length} kérdésből ${answered} megválaszolva, ${score} helyes`;
      result.textContent = `${summary}. Az eredmény nem befolyásolja a továbblépést.`;
      try { localStorage.setItem(key, summary); } catch { /* a tárolás nem kötelező */ }
    });
    form.addEventListener('reset', () => {
      form.querySelectorAll('.u-feedback').forEach((fb) => { fb.textContent = ''; fb.className = 'u-feedback'; });
      result.textContent = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToc();
    initMentalAge();
    initTuring();
    initSymbolic();
    initEdges();
    initSampling();
    initQueens();
    initDendral();
    initQuiz();
  });
})();
