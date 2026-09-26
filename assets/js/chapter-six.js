// 06 · A fejezet kipróbálható mini példái. A számítás a neural.js modellben van.
(() => {
  const M = CourseNeural;
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** Magyar számformátum: tizedesvessző, valódi mínuszjel. @param {number} n */
  const fmt = (n, digits = 2) => {
    const s = Number(n.toFixed(digits)).toString();
    return s.replace('.', ',').replace('-', '−');
  };
  /** Rögzített tizedesjegyszám, például 0,0000. @param {number} n @param {number} digits */
  const fix = (n, digits) => n.toFixed(digits).replace('.', ',').replace('-', '−');
  /** @param {number} n */
  const r1 = (n) => Math.round(n * 10) / 10;

  /** Egyszerű koordináta-rendszer az SVG-rajzokhoz.
   * @param {{w:number, h:number, x0:number, x1:number, y0:number, y1:number, l?:number, r?:number, t?:number, b?:number}} o */
  function frame({ w, h, x0, x1, y0, y1, l = 32, r = 10, t = 12, b = 24 }) {
    /** @param {number} x */
    const X = (x) => r1(l + ((x - x0) / (x1 - x0)) * (w - l - r));
    /** @param {number} y */
    const Y = (y) => r1(h - b - ((y - y0) / (y1 - y0)) * (h - t - b));
    /** @param {number[]} xt @param {number[]} yt @param {string} [xl] @param {string} [yl] */
    const axes = (xt, yt, xl = '', yl = '') => {
      const zx = X(Math.min(Math.max(0, x0), x1)), zy = Y(Math.min(Math.max(0, y0), y1));
      let s = `<g class="u-axis"><path d="M${X(x0)} ${zy}H${X(x1)}M${zx} ${Y(y0)}V${Y(y1)}"/>`;
      for (const v of xt) s += `<text x="${X(v)}" y="${h - b + 14}" text-anchor="middle">${fmt(v)}</text>`;
      for (const v of yt) s += `<text x="${l - 5}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
      if (xl) s += `<text x="${X(x1)}" y="${h - 3}" text-anchor="end">${xl}</text>`;
      if (yl) s += `<text x="${l + 4}" y="${t + 2}">${yl}</text>`;
      return s + '</g>';
    };
    /** Mintavételezett görbe, nagy ugrásnál megszakítva. @param {(x:number) => number} fn */
    const line = (fn, n = 200, jump = Infinity) => {
      let d = '', prev = NaN;
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, y = fn(x);
        d += `${Number.isNaN(prev) || Math.abs(y - prev) > jump ? 'M' : 'L'}${X(x)} ${Y(y)}`;
        prev = y;
      }
      return d;
    };
    /** @param {string} id */
    const clip = (id) => `<defs><clipPath id="${id}"><rect x="${l}" y="${t}" width="${w - l - r}" height="${h - t - b}"/></clipPath></defs>`;
    return { X, Y, axes, line, clip };
  }
  /** Csúszka értéke, a mellette lévő output frissítésével. @param {string} id */
  const slider = (id) => {
    const el = $(`#${id}`), out = $(`#${id}-ki`), v = Number(el.value);
    if (out) out.textContent = fmt(v);
    return v;
  };
  /** @param {string[]} ids @param {() => void} fn */
  const onInput = (ids, fn) => ids.forEach((id) => $(`#${id}`).addEventListener('input', fn));
  /** Nyílhegy-definíció egy élő rajzhoz. @param {string} id */
  const arrowDef = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="u-arrowhead"/></marker></defs>`;

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

  /* 1 · A péntek esti neuron – PDF 150–152. */
  const ACT_NAMES = /** @type {Record<string, string>} */ ({ threshold: 'küszöb', sigmoid: 'szigmoid', relu: 'ReLU', tanh: 'tanh' });
  function initNeuron() {
    const svg = $('#buli-rajz'), out = $('#buli-ki');
    if (!svg || !out) return;
    const labels = ['barátok', 'eső', 'zh'];
    const draw = () => {
      const x = [1, 2, 3].map((i) => ($(`#buli-x${i}`).checked ? 1 : 0));
      const w = [1, 2, 3].map((i) => slider(`buli-w${i}`)), w0 = slider('buli-w0');
      const act = $('#buli-akt').value;
      const { a, o } = M.neuron(x, w, w0, act);
      const edge = (/** @type {number} */ wi, /** @type {string} */ d) => `<path class="u-edge${wi < 0 ? ' u-edge-neg' : ''}" style="stroke-width:${fmt(0.8 + 1.6 * Math.abs(wi), 1).replace(',', '.')}" d="${d}"/>`;
      let s = arrowDef('buli-ny');
      s += w.map((wi, i) => edge(wi, `M84 ${40 + i * 55}L236 90`)).join('') + edge(w0, 'M260 22L260 64');
      s += '<path class="u-edge-o" d="M284 90H380" marker-end="url(#buli-ny)"/>';
      s += x.map((xi, i) => `<circle class="u-node${xi ? ' u-node-on' : ''}" cx="66" cy="${40 + i * 55}" r="17"/><text x="66" y="${45 + i * 55}" text-anchor="middle" class="u-svg-small${xi ? ' u-on' : ''}">${xi}</text><text x="8" y="${45 + i * 55}" class="u-svg-small">${labels[i]}</text><text x="${150}" y="${i === 0 ? 50 : i === 1 ? 84 : 124}" class="u-svg-small">${fmt(w[i], 1)}</text>`).join('');
      s += `<text x="270" y="18" class="u-svg-small">w₀ = ${fmt(w0, 1)}</text>`;
      s += `<circle class="u-node u-node-strong" cx="260" cy="90" r="24"/><text x="260" y="95" text-anchor="middle" class="u-svg-small">a = ${fmt(a, 1)}</text>`;
      s += `<text x="392" y="86" class="u-svg-sym">o</text><text x="392" y="106" class="u-svg-small">${fmt(o, 2)}</text>`;
      svg.innerHTML = s;
      const terms = w.map((wi, i) => `${fmt(wi, 1)} · ${x[i]}`).join(' + ').replace(/\+ −/g, '− ');
      const go = a >= 0;
      out.innerHTML = `<p>Súlyozott összeg: ${terms} + ${fmt(w0, 1)}</p><p><strong>a = ${fmt(a, 2)}</strong>. Kimenet (${ACT_NAMES[act]}): <strong>o = ${fmt(o, 2)}</strong>.</p><p>${go ? 'Az aktiváció nem negatív, tehát <strong>megyek a buliba</strong>.' : 'Az aktiváció negatív, tehát <strong>otthon maradok</strong>, és tanulok.'}</p>`;
    };
    onInput(['buli-w1', 'buli-w2', 'buli-w3', 'buli-w0'], draw);
    ['buli-x1', 'buli-x2', 'buli-x3', 'buli-akt'].forEach((id) => $(`#${id}`).addEventListener('change', draw));
    draw();
  }

  /* 2 · Aktivációs függvények egy grafikonon – PDF 153–166. */
  function initActivation() {
    const svg = $('#akt-rajz'), out = $('#akt-ki'), box = $('#akt-valasztas');
    if (!svg || !out || !box) return;
    const F = frame({ w: 440, h: 260, x0: -3, x1: 3, y0: -1.5, y1: 3 });
    const draw = () => {
      const a = slider('akt-a'), beta = slider('akt-beta'), alfa = slider('akt-alfa');
      /** @param {string} name */
      const param = (name) => (name === 'swish' ? beta : name === 'elu' ? alfa : undefined);
      /** @type {string[]} */
      const names = [...box.querySelectorAll('input:checked')].map((/** @type {HTMLInputElement} */ i) => i.value);
      let s = F.clip('akt-clip') + F.axes([-3, -2, -1, 0, 1, 2, 3], [-1, 0, 1, 2, 3], 'a');
      s += `<path class="u-guide" d="M${F.X(a)} ${F.Y(-1.5)}V${F.Y(3)}"/><g clip-path="url(#akt-clip)">`;
      const jumpy = ['threshold', 'sign'];
      s += names.map((n) => `<path class="u-fn k-${n}" d="${F.line((t) => M.activate(n, t, param(n)), 240, jumpy.includes(n) ? 0.4 : Infinity)}"/>`).join('');
      s += names.map((n) => `<circle class="u-dot" cx="${F.X(a)}" cy="${F.Y(M.activate(n, a, param(n)))}" r="3.5"/>`).join('');
      svg.innerHTML = s + '</g>';
      const rows = names.map((n) => {
        const d = M.derivative(n, a, param(n));
        return `<tr><td><span class="u-swatch k-${n}"></span>${M.activations[n].label}</td><td>${fmt(M.activate(n, a, param(n)), 3)}</td><td>${d === null ? 'nem értelmezett' : fmt(d, 3)}</td></tr>`;
      }).join('');
      out.innerHTML = names.length
        ? `<p>Az a = ${fmt(a, 1)} helyen:</p><div class="u-table-wrap"><table class="u-table u-table-num"><thead><tr><th>Függvény</th><th>f(a)</th><th>Derivált, f′(a)</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : '<p>Jelölj ki legalább egy függvényt.</p>';
    };
    onInput(['akt-a', 'akt-beta', 'akt-alfa'], draw);
    box.addEventListener('change', draw);
    draw();
  }

  /* 3 · Hálóépítő – PDF 167–175. */
  const FEEDBACK_NAMES = /** @type {Record<string, string>} */ ({ global: 'globális', self: 'elemi', lateral: 'laterális', interlayer: 'rétegközi' });
  function initNetwork() {
    const svg = $('#halo-rajz'), out = $('#halo-osszeg');
    if (!svg || !out) return;
    const draw = () => {
      const inputs = Number($('#halo-be').value), hiddenLayers = Number($('#halo-rejtett').value);
      const perLayer = Number($('#halo-rejtett-db').value), outputs = Number($('#halo-ki-db').value);
      $('#halo-rejtett-db').disabled = hiddenLayers === 0;
      const feedback = Object.keys(FEEDBACK_NAMES).filter((f) => $(`#halo-v-${f}`).checked);
      const hidden = Array(hiddenLayers).fill(perLayer);
      const r = M.networkSummary({ inputs, hidden, outputs, feedback });
      const layers = r.layers, W = 520, H = 250, maxN = Math.max(...layers), gap = Math.min(40, 170 / Math.max(1, maxN - 1));
      /** @param {number} c */
      const X = (c) => r1(60 + (c * (W - 120)) / Math.max(1, layers.length - 1));
      /** @param {number} c @param {number} i */
      const Y = (c, i) => r1(115 + (i - (layers[c] - 1) / 2) * gap);
      let edges = '', back = '', nodes = '';
      layers.forEach((n, c) => {
        for (let i = 0; i < n; i++) {
          if (c + 1 < layers.length) for (let k = 0; k < layers[c + 1]; k++) edges += `<path class="u-edge u-edge-thin" d="M${X(c) + 11} ${Y(c, i)}L${X(c + 1) - 11} ${Y(c + 1, k)}"/>`;
          nodes += `<circle class="u-node${c ? ' u-node-strong' : ''}" cx="${X(c)}" cy="${Y(c, i)}" r="10"/>`;
        }
      });
      const last = layers.length - 1;
      if (feedback.includes('global')) for (let i = 0; i < layers[last]; i++) for (let k = 0; k < layers[0]; k++) back += `<path class="u-edge-back u-edge-thin" d="M${X(last)} ${Y(last, i) + 10}C${X(last)} 245 ${X(0)} 245 ${X(0)} ${Y(0, k) + 10}"/>`;
      for (let c = 1; c < layers.length; c++) for (let i = 0; i < layers[c]; i++) {
        if (feedback.includes('self')) back += `<path class="u-edge-back" d="M${X(c) - 5} ${Y(c, i) - 9}C${X(c) - 18} ${Y(c, i) - 30} ${X(c) + 18} ${Y(c, i) - 30} ${X(c) + 5} ${Y(c, i) - 9}"/>`;
        if (feedback.includes('lateral')) for (let k = i + 1; k < layers[c]; k++) back += `<path class="u-edge-back u-edge-thin" d="M${X(c) + 10} ${Y(c, i)}C${X(c) + 28 + 6 * (k - i)} ${Y(c, i)} ${X(c) + 28 + 6 * (k - i)} ${Y(c, k)} ${X(c) + 10} ${Y(c, k)}"/>`;
        if (feedback.includes('interlayer') && c >= 2) for (let k = 0; k < layers[c - 1]; k++) back += `<path class="u-edge-back u-edge-thin" d="M${X(c)} ${Y(c, i) - 10}C${X(c)} 8 ${X(c - 1)} 8 ${X(c - 1)} ${Y(c - 1, k) - 10}"/>`;
      }
      svg.innerHTML = edges + back + nodes;
      const loops = Object.entries(r.feedbackEdges).map(([k, v]) => `${FEEDBACK_NAMES[k]}: ${v}`).join(', ');
      const loopSum = Object.values(r.feedbackEdges).reduce((s, v) => s + v, 0);
      out.innerHTML = `<p>Felépítés: ${layers.join('-')}. A háló <strong>${r.kind}</strong> és <strong>${r.depth}</strong> (${hiddenLayers} rejtett réteg).</p>`
        + `<p><strong>${r.weights} súly</strong> előre + ${r.biases} torzítás${loopSum ? ` + ${loopSum} visszacsatoló súly (${loops})` : ''} = <strong>${r.parameters} tanulható paraméter</strong>.</p>`;
    };
    ['halo-be', 'halo-rejtett', 'halo-rejtett-db', 'halo-ki-db', 'halo-v-global', 'halo-v-self', 'halo-v-lateral', 'halo-v-interlayer'].forEach((id) => $(`#${id}`).addEventListener('change', draw));
    draw();
  }

  /* 4 · Az önmagára visszacsatolt neuron – PDF 174–176. */
  function initRecurrent() {
    const svg = $('#hurok-rajz'), out = $('#hurok-ki');
    if (!svg || !out) return;
    const F = frame({ w: 440, h: 180, x0: 0, x1: 40, y0: -1.1, y1: 1.1 });
    const draw = () => {
      const w = slider('hurok-w'), x = slider('hurok-x'), start = slider('hurok-start');
      const r = M.recurrentTrace(w, x, start, 40);
      const path = r.values.map((v, t) => `${t ? 'L' : 'M'}${F.X(t)} ${F.Y(v)}`).join('');
      svg.innerHTML = F.axes([0, 10, 20, 30, 40], [-1, 0, 1], 't') + `<path class="u-curve" d="${path}"/>` + r.values.map((v, t) => `<circle class="u-dot" cx="${F.X(t)}" cy="${F.Y(v)}" r="2"/>`).join('');
      const lastV = r.values[40], prev = r.values[39];
      // Egy nyugalmi pont akkor stabil, ha a leképezés meredeksége ott 1-nél kisebb: |w · (1 − o²)| < 1.
      const unstable = Math.abs(w * (1 - lastV * lastV)) > 1;
      const msg = r.status === 'converged'
        ? `A kimenet <strong>megnyugszik</strong> (konvergál): o ≈ ${fmt(lastV, 3)}.${unstable ? ' Ez azonban <strong>instabil</strong> nyugalmi pont: a legkisebb eltérésre is elmozdulna róla. Állítsd a kezdőértéket egy kicsit arrébb!' : ''}`
        : r.status === 'oscillating'
          ? `A kimenet <strong>oszcillál</strong>: minden lépésben ${fmt(prev, 3)} és ${fmt(lastV, 3)} között billeg, és sosem áll meg.`
          : `40 lépés alatt még nem nyugodott meg, az utolsó érték ${fmt(lastV, 3)}. Ez a határeset lassú: a súly a nyugalom és a lengés határa közelében van.`;
      out.innerHTML = `<p>o(t+1) = tanh(${fmt(w, 1)} · o(t) + ${fmt(x, 2)}), o(0) = ${fmt(start, 2)}.</p><p>${msg}</p>`;
    };
    onInput(['hurok-w', 'hurok-x', 'hurok-start'], draw);
    draw();
  }

  /* 5 · Túlillesztés – PDF 178. */
  function initFit() {
    const svg = $('#illesztes-rajz'), out = $('#illesztes-ki');
    if (!svg || !out) return;
    const F = frame({ w: 440, h: 220, x0: 0, x1: 1, y0: -1.6, y1: 1.6 });
    const draw = () => {
      const d = slider('illesztes-fok');
      const r = M.overfitting(d);
      let s = F.clip('fit-clip') + F.axes([0, 0.5, 1], [-1, 0, 1], 'x');
      s += `<path class="u-curve" clip-path="url(#fit-clip)" d="${r.curve.map((p, i) => `${i ? 'L' : 'M'}${F.X(p.x)} ${F.Y(p.y)}`).join('')}"/>`;
      s += r.trainSet.map((p) => `<circle class="u-pt-train" cx="${F.X(p.x)}" cy="${F.Y(p.y)}" r="4"/>`).join('');
      s += r.testSet.map((p) => `<rect class="u-pt-test" x="${F.X(p.x) - 3.5}" y="${F.Y(p.y) - 3.5}" width="7" height="7"/>`).join('');
      svg.innerHTML = s;
      const verdict = d <= 2 ? 'Alulillesztés: a görbe még a tanítópontokat sem követi.'
        : d <= 6 ? 'Jó egyensúly: a görbe a trendet követi, és a tesztpontokon is kicsi a hiba.'
          : d <= 8 ? 'A teszthiba már nő: a görbe kezdi a zajt is megtanulni.'
            : 'Túlillesztés: a görbe minden tanítóponton átmegy, a tesztpontokon nagyot téved. Adatbázisszerű működés.';
      out.innerHTML = `<p><strong>${d}. fokú</strong> polinom, ${d + 1} paraméter: tanítóhiba ${fix(r.trainError, 4)}, teszthiba ${fix(r.testError, 4)}.</p><p>${verdict}</p>`;
    };
    onInput(['illesztes-fok'], draw);
    draw();
  }

  /** Kapcsológomb: aria-pressed váltása. @param {string} id @param {() => void} fn */
  const toggle = (id, fn) => $(`#${id}`).addEventListener('click', (/** @type {Event} */ e) => {
    const b = /** @type {HTMLButtonElement} */ (e.currentTarget);
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    fn();
  });
  /** @param {string} id */
  const pressed = (id) => ($(`#${id}`).getAttribute('aria-pressed') === 'true' ? 1 : 0);

  /* 6 · McCulloch–Pitts-neuron – PDF 182–183. */
  function initMp() {
    const out = $('#mp-ki');
    if (!out) return;
    const draw = () => {
      const theta = Number($('#mp-kuszob').value);
      const r = M.mpNeuron([pressed('mp-x1'), pressed('mp-x2')], [pressed('mp-tilt')], theta);
      const gate = theta === 2 ? 'Θ = 2 mellett a neuron ÉS kapu.' : 'Θ = 1 mellett a neuron VAGY kapu.';
      const state = r.blocked
        ? 'A <strong>tiltó bemenet</strong> aktív, ezért a neuron nem tüzelhet, bármennyi a gerjesztés. Kimenet: <strong>0</strong>.'
        : r.fires ? `Az összeg eléri a küszöböt, a neuron <strong>tüzel</strong>. Kimenet: <strong>1</strong>.` : `Az összeg a küszöb alatt van, a neuron <strong>nem tüzel</strong>. Kimenet: <strong>0</strong>.`;
      out.innerHTML = `<p>Gerjesztő összeg: ${r.sum}, küszöb: Θ = ${theta}. ${state}</p><p>${gate}</p>`;
    };
    ['mp-x1', 'mp-x2', 'mp-tilt'].forEach((id) => toggle(id, draw));
    $('#mp-kuszob').addEventListener('change', draw);
    draw();
  }

  /* 7 · Egyeneshúzó és perceptrontanítás – PDF 187–191. */
  function initPerceptron() {
    const svg = $('#pc-rajz'), out = $('#pc-ki'), log = $('#pc-naplo');
    if (!svg || !out || !log) return;
    const F = frame({ w: 260, h: 260, x0: -0.5, x1: 1.5, y0: -0.5, y1: 1.5, l: 28, b: 26 });
    const st = { idx: 0, epoch: 1, errors: 0, done: false, note: '' };
    const samples = () => M.gates[/** @type {'and'|'or'|'nand'|'xor'} */ ($('#pc-kapu').value)];
    const weights = () => ({ w: [slider('pc-w1'), slider('pc-w2')], theta: slider('pc-theta') });
    /** @param {number[]} w @param {number} theta */
    const setWeights = (w, theta) => {
      $('#pc-w1').value = String(w[0]); $('#pc-w2').value = String(w[1]); $('#pc-theta').value = String(theta);
    };
    const draw = () => {
      const { w, theta } = weights(), set = samples();
      let s = F.clip('pc-clip') + F.axes([0, 1], [1], 'x₁', 'x₂');
      if (w[0] !== 0 || w[1] !== 0) {
        // A határ: w1·x1 + w2·x2 = Θ, a négyzet két szélső pontjával megrajzolva.
        const pts = Math.abs(w[1]) > 1e-9
          ? [[-0.5, (theta - w[0] * -0.5) / w[1]], [1.5, (theta - w[0] * 1.5) / w[1]]]
          : [[theta / w[0], -0.5], [theta / w[0], 1.5]];
        s += `<path class="u-guide" clip-path="url(#pc-clip)" d="M${F.X(pts[0][0])} ${F.Y(pts[0][1])}L${F.X(pts[1][0])} ${F.Y(pts[1][1])}"/>`;
      }
      s += set.map((p) => {
        const ok = M.neuron(p.x, w, -theta, 'threshold').o === p.d, cx = F.X(p.x[0]), cy = F.Y(p.x[1]);
        return `<circle class="${ok ? 'u-pt-good' : 'u-pt-wrong'}" cx="${cx}" cy="${cy}" r="13"/><circle class="${p.d ? 'u-pt-pos' : 'u-pt-neg'}" cx="${cx}" cy="${cy}" r="8"/><text class="u-pt-label" x="${cx}" y="${cy + 4}" text-anchor="middle">${p.d}</text>`;
      }).join('');
      svg.innerHTML = s;
      const good = M.countCorrect(set, w, -theta);
      out.innerHTML = `<p>A határ: ${fmt(w[0], 2)} · x₁ + ${fmt(w[1], 2)} · x₂ = ${fmt(theta, 2)}. <strong>${good}/4 minta helyes.</strong>${good === 4 ? ' Ez a határ szétválasztja a pontokat.' : ''}</p>${st.note ? `<p>${st.note}</p>` : ''}`;
    };
    const resetRun = () => { Object.assign(st, { idx: 0, epoch: 1, errors: 0, done: false, note: '' }); log.innerHTML = ''; };
    const learned = () => `<strong>Megtanulta</strong> a ${st.epoch}. korszakban: egy teljes kör hiba nélkül.`;
    /* Egy minta a PDF 188. oldalának szabályával; a korszak végén eldől, kész-e a tanítás. */
    const step = () => {
      if (st.done) return;
      const set = samples(), sample = set[st.idx], { w, theta } = weights();
      const rate = Number($('#pc-rata').value);
      const r = M.perceptronUpdate(sample, w, -theta, rate);
      const newTheta = -r.bias;
      if (r.changed) st.errors += 1;
      setWeights(r.weights.map((v) => Math.round(v * 1e6) / 1e6), Math.round(newTheta * 1e6) / 1e6);
      const li = document.createElement('li');
      li.className = r.changed ? 'u-log-hit' : 'u-log-ok';
      li.textContent = `${st.epoch}. korszak · x = (${sample.x.join('; ')}), d = ${sample.d}, o = ${r.o}: ${r.changed ? `hibás, w ${sample.d ? '+' : '−'} ${fmt(rate)}·x → w = (${fmt(r.weights[0])}; ${fmt(r.weights[1])}), Θ = ${fmt(newTheta)}` : 'helyes, nincs változás'}`;
      log.appendChild(li);
      while (log.children.length > 120) log.removeChild(log.firstChild);
      log.scrollTop = log.scrollHeight;
      st.idx += 1;
      if (st.idx < set.length) return;
      st.idx = 0;
      if (st.errors === 0) st.done = true;
      else { st.epoch += 1; st.errors = 0; }
    };
    const epoch = () => { do step(); while (st.idx !== 0 && !st.done); };
    $('#pc-lepes').addEventListener('click', () => {
      st.note = st.done ? 'A tanítás már kész. Nullázd a súlyokat, vagy válassz másik kaput.' : '';
      step();
      if (st.done && !st.note) st.note = learned();
      draw();
    });
    $('#pc-korszak').addEventListener('click', () => {
      const before = st.epoch;
      epoch();
      st.note = st.done ? learned() : `A ${before}. korszak véget ért, volt benne hiba.`;
      draw();
    });
    $('#pc-vegig').addEventListener('click', () => {
      for (let n = 0; n < 50 && !st.done; n++) epoch();
      st.note = st.done ? learned()
        : `50 korszak után sem tanulta meg. ${$('#pc-kapu').value === 'xor' ? 'Az XOR nem szeparálható lineárisan: nincs olyan egyenes, amely mind a négy pontot jó oldalra tenné.' : 'Próbáld tovább.'}`;
      draw();
    });
    /* Lejátszás: mintánként léptet, amíg kész, vagy 50 korszak el nem telik. */
    const play = $('#pc-lejatszas');
    /** @type {number | undefined} */
    let timer;
    const stop = () => { clearInterval(timer); timer = undefined; play.setAttribute('aria-pressed', 'false'); play.textContent = 'Lejátszás lépésenként'; };
    play.addEventListener('click', () => {
      if (timer !== undefined) { stop(); return; }
      play.setAttribute('aria-pressed', 'true'); play.textContent = 'Megállítás';
      timer = window.setInterval(() => {
        step();
        st.note = st.done ? learned() : st.epoch > 50 ? '50 korszak után sem tanulta meg.' : '';
        draw();
        if (st.done || st.epoch > 50) stop();
      }, 1000);
    });
    $('#pc-nullaz').addEventListener('click', () => { stop(); setWeights([0, 0], 0); resetRun(); draw(); });
    $('#pc-kapu').addEventListener('change', () => { stop(); resetRun(); draw(); });
    onInput(['pc-w1', 'pc-w2', 'pc-theta'], () => { st.note = ''; st.done = false; draw(); });
    draw();
  }

  /* 8 · XOR-kapcsoló – PDF 194. */
  function initXor() {
    const svg = $('#xor-rajz'), out = $('#xor-ki');
    if (!svg || !out) return;
    const draw = () => {
      const x1 = pressed('xor-x1'), x2 = pressed('xor-x2');
      const r = M.xorByHand(x1, x2), [h1, h2] = r.hidden;
      /** @param {number} cx @param {number} cy @param {number} on @param {string} name */
      const node = (cx, cy, on, name) => `<circle class="u-node${on ? ' u-node-on' : ''}" cx="${cx}" cy="${cy}" r="20"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" class="u-svg-sym${on ? ' u-on' : ''}">${name}</text>`;
      svg.innerHTML = arrowDef('xor-ny')
        + '<path class="u-edge" d="M90 158L82 104" marker-end="url(#xor-ny)"/><path class="u-edge u-edge-neg" d="M92 158L204 108" marker-end="url(#xor-ny)"/><path class="u-edge u-edge-neg" d="M208 158L96 108" marker-end="url(#xor-ny)"/><path class="u-edge" d="M210 158L218 104" marker-end="url(#xor-ny)"/><path class="u-edge" d="M86 66L136 42" marker-end="url(#xor-ny)"/><path class="u-edge" d="M214 66L164 42" marker-end="url(#xor-ny)"/>'
        + node(90, 176, x1, 'x₁') + node(210, 176, x2, 'x₂') + node(80, 86, h1, 'u1') + node(220, 86, h2, 'u2') + node(150, 30, r.o, 'u3');
      out.innerHTML = `<p>Bemenet: (${x1}; ${x2}). Rejtett réteg: u1 = ${h1}, u2 = ${h2} → <strong>kimenet: ${r.o}</strong>.</p><p>${h1 ? 'Az u1 a (0; 1) mintát ismerte fel.' : h2 ? 'Az u2 az (1; 0) mintát ismerte fel.' : 'Egyik rejtett neuron sem tüzel, ezért az u3 VAGY-a 0.'}</p>`;
    };
    ['xor-x1', 'xor-x2'].forEach((id) => toggle(id, draw));
    draw();
  }

  /* 9 · Cinkelt érmék – PDF 206. */
  function initEntropy() {
    const out = $('#ent-ki'), bar = $('#ent-savo');
    if (!out || !bar) return;
    const draw = () => {
      const p = slider('ent-p'), q = slider('ent-q');
      const P = [p, 1 - p], Q = [q, 1 - q];
      const h = M.entropy(P), kl = M.klDivergence(P, Q);
      bar.style.width = `${Math.round(h * 100)}%`;
      out.innerHTML = `<p>A p érme entrópiája: <strong>H = ${fmt(h, 2)} bit</strong>. ${h > 0.99 ? 'Teljesen kiszámíthatatlan.' : h < 0.01 ? 'Semmi meglepetés: mindig ugyanaz jön.' : 'Részben megjósolható.'}</p><p>KL(p ‖ q) = <strong>${fmt(kl, 2)} bit</strong>, KL(q ‖ p) = ${Number.isFinite(M.klDivergence(Q, P)) ? `${fmt(M.klDivergence(Q, P), 2)} bit` : 'végtelen, mert a p-ben 0 valószínűségű az, ami a q-ban lehetséges'}.</p>`;
    };
    onInput(['ent-p', 'ent-q'], draw);
    draw();
  }

  /* 10 · Gradiensvölgy – PDF 208. */
  const LAND_VIEW = /** @type {Record<string, {x0:number, x1:number, y0:number, y1:number, xt:number[], yt:number[]}>} */ ({
    bowl: { x0: -4, x1: 8, y0: 0, y1: 40, xt: [-4, -2, 0, 2, 4, 6, 8], yt: [10, 20, 30, 40] },
    twoValleys: { x0: -2.2, x1: 2.2, y0: -0.6, y1: 4, xt: [-2, -1, 0, 1, 2], yt: [0, 1, 2, 3, 4] }
  });
  function initGradient() {
    const svg = $('#gd-rajz'), out = $('#gd-ki');
    if (!svg || !out) return;
    let n = 0;
    const draw = () => {
      const name = $('#gd-felulet').value, rate = slider('gd-rata'), start = slider('gd-start');
      const v = LAND_VIEW[name], land = M.landscapes[name];
      const F = frame({ w: 440, h: 230, ...v });
      const r = M.descend(name, start, rate, Math.max(1, n));
      const pts = n === 0 ? r.points.slice(0, 1) : r.points;
      const shown = pts.filter((p) => Number.isFinite(p.E));
      let s = F.clip('gd-clip') + F.axes(v.xt, v.yt, 'w', 'E');
      s += `<g clip-path="url(#gd-clip)"><path class="u-s3 u-thin" d="${F.line(land.E, 240)}"/>`;
      s += `<path class="u-trail" d="${shown.map((p, i) => `${i ? 'L' : 'M'}${F.X(p.w)} ${F.Y(p.E)}`).join('')}"/>`;
      s += shown.map((p, i) => `<circle class="${i === shown.length - 1 ? 'u-ball' : 'u-dot'}" cx="${F.X(p.w)}" cy="${F.Y(p.E)}" r="${i === shown.length - 1 ? 7 : 3}"/>`).join('') + '</g>';
      svg.innerHTML = s;
      const last = pts[pts.length - 1], steps = pts.length - 1;
      const where = Number.isFinite(last.E) ? `w = ${fmt(last.w, 3)}, E = ${fmt(last.E, 3)}, derivált: ${fmt(land.dE(last.w), 3)}` : 'a golyó kirepült a képből';
      let msg = n === 0 ? `Kezdőpont: w = ${fmt(start, 2)}, E = ${fmt(land.E(start), 2)}. Nyomd meg az „Egy lépés” gombot!` : `${steps}. lépés: ${where}.`;
      if (n > 0 && r.status === 'converged') {
        msg += name === 'bowl' ? ' A golyó <strong>megérkezett</strong> a völgy aljára.'
          : last.w > 0 ? ' A golyó megérkezett, de egy <strong>lokális minimumba</strong>: a mélyebb völgy a bal oldalon van, oda innen nem jut át.'
            : ' A golyó <strong>megérkezett</strong> a mélyebb, globális minimumba.';
      } else if (n > 0 && r.status === 'diverged') msg += ' A lépések egyre nagyobbak: a tanítás <strong>elszáll</strong>.';
      else if (n > 0 && r.status === 'oscillating') msg += ' A golyó a völgy két oldala között <strong>pattog</strong>, és nem ér le.';
      out.innerHTML = `<p>${msg}</p>`;
    };
    const reset = () => { n = 0; draw(); };
    $('#gd-lepes').addEventListener('click', () => { n += 1; draw(); });
    $('#gd-futtat').addEventListener('click', () => { n = 60; draw(); });
    $('#gd-uj').addEventListener('click', reset);
    $('#gd-felulet').addEventListener('change', reset);
    onInput(['gd-rata', 'gd-start'], reset);
    draw();
  }

  /* 11 · Hibavisszaterjesztés lépésenként – PDF 210–212. */
  function initBackprop() {
    const svg = $('#bp-rajz'), curve = $('#bp-gorbe'), out = $('#bp-ki');
    if (!svg || !curve || !out) return;
    let net = M.exampleNetwork(), phase = 0;
    /** @type {ReturnType<typeof M.backpropStep> | null} */
    let res = null;
    const sample = () => M.gates.xor[Number($('#bp-minta').value)];
    const eta = () => Number($('#bp-eta').value);
    const buttons = () => {
      $('#bp-hiba').disabled = phase !== 1;
      $('#bp-frissit').disabled = phase !== 2;
    };
    const draw = () => {
      const s = sample(), f = M.forward(net, s.x);
      const P = { x1: [50, 60], x2: [50, 180], h1: [210, 60], h2: [210, 180], o: [370, 120] };
      /** @param {number[]} a @param {number[]} b @param {number} w @param {number} dy */
      const edge = (a, b, w, dy = -6) => {
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        return `<path class="u-edge${w < 0 ? ' u-edge-neg' : ''}" d="M${a[0] + 20} ${a[1]}L${b[0] - 22} ${b[1]}" marker-end="url(#bp-ny)"/><text x="${mx}" y="${my + dy}" text-anchor="middle" class="u-num">${fmt(w, 3)}</text>`;
      };
      let g = arrowDef('bp-ny');
      g += edge(P.x1, P.h1, net.hidden[0].w[0]) + edge(P.x1, P.h2, net.hidden[1].w[0], -14) + edge(P.x2, P.h1, net.hidden[0].w[1], 22) + edge(P.x2, P.h2, net.hidden[1].w[1], 18);
      g += edge(P.h1, P.o, net.output.w[0]) + edge(P.h2, P.o, net.output.w[1], 20);
      /** @param {number[]} p @param {string} name @param {string} val @param {string} [delta] @param {string} [bias] */
      const node = (p, name, val, delta = '', bias = '') => `<circle class="u-node u-node-strong" cx="${p[0]}" cy="${p[1]}" r="22"/><text x="${p[0]}" y="${p[1] - 3}" text-anchor="middle" class="u-svg-small">${name}</text><text x="${p[0]}" y="${p[1] + 11}" text-anchor="middle" class="u-num">${val}</text>${bias ? `<text x="${p[0]}" y="${p[1] - 30}" text-anchor="middle" class="u-num">w₀ ${bias}</text>` : ''}${delta ? `<text x="${p[0]}" y="${p[1] + 40}" text-anchor="middle" class="u-num u-delta">δ ${delta}</text>` : ''}`;
      const shown = phase >= 1 && res;
      g += node(P.x1, 'x₁', String(s.x[0])) + node(P.x2, 'x₂', String(s.x[1]));
      g += node(P.h1, 'h1', shown ? fmt(f.hidden[0], 3) : '?', phase >= 2 && res ? fmt(res.deltaHidden[0], 4) : '', fmt(net.hidden[0].b, 3));
      g += node(P.h2, 'h2', shown ? fmt(f.hidden[1], 3) : '?', phase >= 2 && res ? fmt(res.deltaHidden[1], 4) : '', fmt(net.hidden[1].b, 3));
      g += node(P.o, 'o', shown ? fmt(f.o, 3) : '?', phase >= 2 && res ? fmt(res.deltaOut, 4) : '', fmt(net.output.b, 3));
      g += `<text x="370" y="196" text-anchor="middle" class="u-svg-small">elvárt: t = ${s.d}</text>`;
      svg.innerHTML = g;
      buttons();
    };
    /** @param {string} html */
    const say = (html) => { out.innerHTML = html; };
    $('#bp-elore').addEventListener('click', () => {
      const s = sample();
      res = M.backpropStep(net, s.x, s.d, eta());
      phase = 1;
      draw();
      say(`<p><strong>1 · Előre.</strong> h1 = ${fmt(res.hidden[0], 4)}, h2 = ${fmt(res.hidden[1], 4)}, a kimenet o = <strong>${fmt(res.o, 4)}</strong>. Az elvárt t = ${s.d}, a hiba E = ½ · (t − o)² = <strong>${fmt(res.error, 4)}</strong>.</p>`);
    });
    $('#bp-hiba').addEventListener('click', () => {
      if (!res) return;
      phase = 2;
      draw();
      say(`<p><strong>2 · Hibák vissza.</strong> A kimenet: δ = o(1 − o)(t − o) = <strong>${fmt(res.deltaOut, 4)}</strong>. A rejtett neuronok a kimenethez vezető súlyukkal arányos részt kapnak: δ(h1) = <strong>${fmt(res.deltaHidden[0], 4)}</strong>, δ(h2) = <strong>${fmt(res.deltaHidden[1], 4)}</strong>.</p>`);
    });
    $('#bp-frissit').addEventListener('click', () => {
      if (!res) return;
      const s = sample(), before = res.error;
      net = res.next;
      const after = M.backpropStep(net, s.x, s.d, eta()).error;
      phase = 0; res = null;
      draw();
      say(`<p><strong>3 · Frissítés</strong> w ← w + η · δ · bemenet szerint. A kimeneti súlyok: <strong>${fmt(net.output.w[0], 4)}</strong> és ${fmt(net.output.w[1], 4)}, torzítás ${fmt(net.output.b, 4)}. A h1 súlyai: ${fmt(net.hidden[0].w[0], 4)} és ${fmt(net.hidden[0].w[1], 4)}, a h2-éi: ${fmt(net.hidden[1].w[0], 4)} és ${fmt(net.hidden[1].w[1], 4)}.</p><p>Ugyanerre a mintára a hiba ${fmt(before, 4)}-ről ${fmt(after, 4)}-re ${after < before ? 'csökkent' : 'változott'}.</p>`);
    });
    $('#bp-tanit').addEventListener('click', () => {
      const r = M.trainXor(net, eta(), 3000);
      net = r.net; phase = 0; res = null;
      const F = frame({ w: 440, h: 150, x0: 0, x1: 3000, y0: 0, y1: Math.max(0.15, ...r.losses) });
      curve.innerHTML = F.axes([0, 1000, 2000, 3000], [0, 0.1], 'korszak', 'hiba') + `<path class="u-curve" d="${r.losses.filter((_, i) => i % 10 === 0).map((l, i) => `${i ? 'L' : 'M'}${F.X(i * 10)} ${F.Y(l)}`).join('')}"/>`;
      const good = r.outputs.filter((o, i) => Math.round(o) === M.gates.xor[i].d).length;
      draw();
      say(`<p>3000 korszak után a kimenetek: ${M.gates.xor.map((g, i) => `(${g.x.join('; ')}) → ${fmt(r.outputs[i], 2)}`).join(', ')}. Az átlagos hiba ${fmt(r.losses[0], 4)}-ről ${fmt(r.losses[r.losses.length - 1], 4)}-re csökkent.</p><p>${good === 4 ? 'Kerekítve <strong>mind a 4 minta helyes</strong>: a háló megtanulta az XOR-t.' : `Kerekítve ${good}/4 minta helyes. A háló még egy platón lehet: nyomd meg újra a gombot.`}</p>`);
    });
    $('#bp-uj').addEventListener('click', () => { net = M.exampleNetwork(); phase = 0; res = null; curve.innerHTML = ''; draw(); say('<p>Visszaálltak a kezdősúlyok. Kezdd az „Előre” gombbal!</p>'); });
    $('#bp-minta').addEventListener('change', () => { phase = 0; res = null; draw(); });
    draw();
    say('<p>Kezdd az „1 · Előre” gombbal! A kérdőjelek helyére a neuronok kimenete kerül.</p>');
  }

  /* 12 · Verseny a rétegben – PDF 218. */
  const MECH = /** @type {Record<string, string>} */ ({ competitive: 'versengő', cooperative: 'együttműködő', normalizing: 'normalizáló' });
  function initMechanism() {
    const bars = $('#mech-rajz'), out = $('#mech-ki');
    if (!bars || !out) return;
    let n = 0;
    const draw = () => {
      const acts = [1, 2, 3].map((i) => slider(`mech-a${i}`)), kind = $('#mech-fajta').value;
      const r = M.mechanism(kind, acts, 0.2, Math.max(1, n));
      const hist = n === 0 ? r.history.slice(0, 1) : r.history.slice(0, n + 1);
      const last = hist[hist.length - 1];
      bars.innerHTML = last.map((v, i) => `<div><span style="height:${Math.round(Math.min(1, v) * 100)}%"></span><small>${i + 1}. · ${fmt(v, 3)}</small></div>`).join('');
      const vec = `(${last.map((v) => fmt(v, 3)).join('; ')})`;
      const stepsTaken = hist.length - 1, prev = hist[hist.length - 2];
      const stable = stepsTaken > 0 && last.every((v, i) => Math.abs(v - prev[i]) < 1e-12);
      let msg = `${stepsTaken}. lépés, ${MECH[kind]} mechanizmus: ${vec}.`;
      if (kind === 'competitive' && stable && r.winner !== null) msg += ` A <strong>${r.winner + 1}. neuron nyert</strong>, a többiek kiestek.`;
      if (kind === 'cooperative' && last.every((v) => v === 1)) msg += ' Mindhárom neuron <strong>telített</strong>: együtt nyertek.';
      if (kind === 'normalizing' && stepsTaken > 0) msg += ` Az aktivációk <strong>összege ${fmt(last.reduce((s, v) => s + v, 0), 3)}</strong>, az arányok megmaradtak.`;
      if (stable && stepsTaken > 0) msg += ' Az állapot már nem változik.';
      out.innerHTML = `<p>${msg}</p>`;
    };
    const reset = () => { n = 0; draw(); };
    $('#mech-lepes').addEventListener('click', () => { n += 1; draw(); });
    $('#mech-futtat').addEventListener('click', () => { n = 100; draw(); });
    $('#mech-uj').addEventListener('click', reset);
    $('#mech-fajta').addEventListener('change', reset);
    onInput(['mech-a1', 'mech-a2', 'mech-a3'], reset);
    draw();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-06-kviz';
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
    initNeuron();
    initActivation();
    initNetwork();
    initRecurrent();
    initFit();
    initMp();
    initPerceptron();
    initXor();
    initEntropy();
    initGradient();
    initBackprop();
    initMechanism();
    initQuiz();
  });
})();
