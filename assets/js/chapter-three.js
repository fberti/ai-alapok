// 03 · A fejezet interaktív bemutatói.
(() => {
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** @param {HTMLSelectElement} select @param {string[]} values @param {string[]} [labels] */
  const fill = (select, values, labels = values) => {
    select.innerHTML = '';
    values.forEach((v, i) => { const o = document.createElement('option'); o.value = v; o.textContent = labels[i]; select.append(o); });
  };
  /** @param {number} x */
  const pct = (x) => `${(x * 100).toFixed(1).replace('.', ',')}%`;
  /** @param {number|undefined} x */
  const hu = (x) => String(x).replace('.', ',');

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

  /* 1 · Kérdezd a hálót – a PDF 70. oldalának hálója */
  /** @type {Record<string, {up: string|null, edge: string, props: string[]}>} */
  const net = {
    'Állat': { up: null, edge: '', props: ['mozog', 'táplálkozik', 'lélegzik'] },
    'Madár': { up: 'Állat', edge: 'is_a', props: ['szárnya van', 'tud repülni', 'csőre van'] },
    'Hal': { up: 'Állat', edge: 'is_a', props: ['uszonya van', 'tud úszni', 'vízben él'] },
    'Veréb': { up: 'Madár', edge: 'instance_of', props: ['szürke', 'ugrál'] },
    'Gólya': { up: 'Madár', edge: 'instance_of', props: ['hosszúlábú', 'kéményen fészkel', 'fehér'] },
    'Cápa': { up: 'Hal', edge: 'instance_of', props: ['erős fogú', 'veszélyes'] },
    'Angolna': { up: 'Hal', edge: 'instance_of', props: ['kígyószerű', 'fürge'] }
  };
  const allProps = Object.values(net).flatMap((n) => n.props);

  /** Felfelé halad, amíg meg nem találja a tulajdonságot. @param {string} node @param {string} prop */
  function lookup(node, prop) {
    const path = [node];
    /** @type {string|null} */ let cur = node;
    while (cur) {
      if (net[cur].props.includes(prop)) return { found: true, where: cur, path };
      cur = net[cur].up;
      if (cur) path.push(cur);
    }
    return { found: false, where: null, path };
  }
  /** Minden csomópont, amely a megadott osztály alatt van. @param {string} cls */
  const below = (cls) => Object.keys(net).filter((n) => n !== cls && lookup(n, '__nincs__').path.includes(cls));

  function initNet() {
    const node = $('#halo-csomopont'), prop = $('#halo-tulajdonsag'), out = $('#halo-valasz');
    const cls = $('#cel-osztaly'), cprop = $('#cel-tulajdonsag'), cout = $('#cel-valasz');
    if (!node || !prop || !out) return;
    fill(node, Object.keys(net));
    fill(prop, allProps);
    node.value = 'Cápa'; prop.value = 'lélegzik';
    const ask = () => {
      const r = lookup(node.value, prop.value);
      const steps = r.path.length - 1;
      const route = r.path.join(' → ');
      out.innerHTML = r.found
        ? `<p><strong class="u-ok">Igen.</strong> A „${prop.value}” tulajdonság a <strong>${r.where}</strong> csomópontnál van tárolva.</p><p>Útvonal: ${route} (${steps} lépés felfelé${steps === 0 ? ', saját tulajdonság' : ', öröklés'}).</p>`
        : `<p><strong>A háló nem tud róla.</strong> Végigjárt útvonal: ${route}. Egyik csomópontnál sincs „${prop.value}”.</p><p>Ez nem jelenti azt, hogy a válasz „nem”: a hallgatás nem tagadás.</p>`;
    };
    node.addEventListener('change', ask); prop.addEventListener('change', ask); ask();
    if (!cls || !cprop || !cout) return;
    fill(cls, ['Állat', 'Madár', 'Hal']);
    fill(cprop, allProps);
    cls.value = 'Madár'; cprop.value = 'kéményen fészkel';
    const match = () => {
      const candidates = below(cls.value);
      const rows = candidates.map((c) => {
        const r = lookup(c, cprop.value);
        return { c, ok: r.found, where: r.where };
      });
      const hits = rows.filter((r) => r.ok);
      const tried = rows.map((r) => `${r.c} ${r.ok ? '✓' : '✗'}`).join(', ');
      cout.innerHTML = `<p>Célháló: <code>?X</code> a(z) ${cls.value} alatt, és <code>?X</code> jellemzője „${cprop.value}”.</p>` +
        `<p>Kipróbált jelöltek: ${tried}.</p>` +
        (hits.length
          ? `<p><strong class="u-ok">Illeszkedés:</strong> ${hits.map((h) => `<code>?X = ${h.c}</code>${h.where !== h.c ? ` (örökölve: ${h.where})` : ''}`).join(', ')}.</p>`
          : '<p><strong>Nincs illeszkedő rész.</strong> A célháló sehol sem fektethető rá a nagy hálóra.</p>');
    };
    cls.addEventListener('change', match); cprop.addEventListener('change', match); match();
  }

  /* 2 · Öröklési konfliktus – PDF 74–75. */
  /** @typedef {{from: string, dist: number, value: string, def?: boolean}} Claim */
  /** @type {Record<string, {name: string, claims: Claim[], attr: string}>} */
  const conflicts = {
    auto: { name: 'Kaszkadőr_autó', attr: 'biztosítása', claims: [{ from: 'Kaszkadőr_eszköz', dist: 1, value: 'nem lehet' }, { from: 'Autó', dist: 1, value: 'lehet', def: true }] },
    motor: { name: 'Kaszkadőr_motor', attr: 'biztosítása', claims: [{ from: 'Kaszkadőr_eszköz', dist: 1, value: 'nem lehet' }] },
    taxi: { name: 'Taxi', attr: 'biztosítása', claims: [{ from: 'Autó', dist: 1, value: 'lehet', def: true }] },
    pityuka: { name: 'Pityuka', attr: 'repülés', claims: [{ from: 'Pityuka (saját)', dist: 0, value: 'nem tud' }, { from: 'Madár', dist: 2, value: 'tud', def: true }] }
  };
  /** @param {string} obj @param {string} method */
  function resolve(obj, method) {
    const c = conflicts[obj];
    const values = [...new Set(c.claims.map((x) => x.value))];
    const list = c.claims.map((x) => `${x.from} (${x.dist} lépés${x.def ? ', alapérték' : ''}): ${x.value}`).join('; ');
    /** @type {{verdict: string, why: string, conflict: boolean}} */
    let r;
    if (values.length === 1) r = { verdict: values[0], why: 'Csak egyféle érték érkezik, nincs mit feloldani.', conflict: false };
    else if (method === 'naiv') r = { verdict: values.join(' ÉS ') , why: 'A naiv öröklés minden elérhető értéket átvesz: ellentmondás.', conflict: true };
    else if (method === 'specifikus') {
      const min = Math.min(...c.claims.map((x) => x.dist));
      const best = c.claims.filter((x) => x.dist === min);
      r = best.length === 1
        ? { verdict: best[0].value, why: `A legközelebbi állítás (${best[0].from}, ${min} lépés) nyer.`, conflict: false }
        : { verdict: 'döntetlen', why: `Mindkét állítás ${min} lépésre van, a specifikusság nem dönt. Alapértelmezés vagy prioritás kell.`, conflict: true };
    } else if (method === 'alapertek') {
      const strict = c.claims.filter((x) => !x.def);
      r = strict.length === 1
        ? { verdict: strict[0].value, why: `Az alapérték felülírható, a szigorú állítás (${strict[0].from}) nyer.`, conflict: false }
        : { verdict: 'döntetlen', why: 'Nincs pontosan egy szigorú állítás.', conflict: true };
    } else {
      const order = method === 'prio-eszkoz' ? ['Kaszkadőr_eszköz', 'Autó'] : ['Autó', 'Kaszkadőr_eszköz'];
      const pick = order.map((o) => c.claims.find((x) => x.from === o)).find(Boolean);
      r = pick
        ? { verdict: pick.value, why: `A rangsor első eleme, a(z) ${pick.from} dönt.`, conflict: false }
        : { verdict: 'nem alkalmazható', why: 'Ez a rangsor a kaszkadőr szülőkre szól, itt nincs ilyen szülő. Válassz specifikusságot vagy alapértelmezést.', conflict: true };
    }
    return { ...r, list, c };
  }
  function initConflict() {
    const sel = $('#orokles-objektum'), out = $('#orokles-ki');
    if (!sel || !out) return;
    const radios = [...document.querySelectorAll('#orokles-modszer input')].map((n) => /** @type {HTMLInputElement} */ (n));
    const show = () => {
      const method = (radios.find((x) => x.checked) || radios[0]).value;
      const r = resolve(sel.value, method);
      out.innerHTML = `<p><strong>${r.c.name}</strong> · érkező állítások: ${r.list}.</p>` +
        `<p>Eredmény: <strong class="${r.conflict ? 'u-bad' : 'u-ok'}">${r.c.attr}: ${r.verdict}</strong></p><p>${r.why}</p>`;
    };
    sel.addEventListener('change', show);
    radios.forEach((x) => x.addEventListener('change', show));
    show();
  }

  /* 3 · Keretszerkesztő – PDF 79. */
  /** @typedef {{value?: string, min?: number, max?: number, need?: string}} Slot */
  /** @type {Record<string, {parent: string|null, slots: Record<string, Slot>}>} */
  const frames = {
    'Bútor': { parent: null, slots: { 'Magasság': { min: 0.2, max: 4 }, 'Anyag': { value: 'fa' }, 'Súlya': { need: 'Térfogat × fajsúly' } } },
    'Szék': { parent: 'Bútor', slots: { 'Szín': { value: 'barna' }, 'Lábszám': { value: '4' }, 'Funkció': { value: 'ülőhely' } } },
    'Asztal': { parent: 'Bútor', slots: { 'Funkció': { value: 'étkezés' }, 'Magasság': { value: '1 m (alapérték)', min: 0.4, max: 1.4 }, 'Lábszám': { value: '4' } } },
    'Bárszék': { parent: 'Szék', slots: { 'Magasság': { value: '1,2 m' }, 'Lábszám': { value: '3' }, 'Anyag': { value: 'alumínium' } } },
    'Bárszék-17': { parent: 'Bárszék', slots: { 'Térfogat': { value: '1,1 dm³' }, 'Fajsúly': { value: '2,7 kg/dm³' } } }
  };
  /** @param {string} name */
  function chain(name) {
    /** @type {string[]} */
    const out = [];
    /** @type {string|null} */
    let c = name;
    while (c) { out.push(c); c = frames[c].parent; }
    return out;
  }
  /** A keret teljes, öröklés utáni képe. @param {string} name */
  function effective(name) {
    /** @type {{slot: string, value: string, from: string}[]} */
    const rows = [];
    const seen = new Set();
    chain(name).forEach((f) => {
      Object.entries(frames[f].slots).forEach(([k, s]) => {
        const text = s.value || (s.need ? `IF_NEEDED: ${s.need}` : `${hu(s.min)} m és ${hu(s.max)} m között`);
        if (seen.has(k)) {
          if (s.min !== undefined) rows.push({ slot: k, value: `határ: ${hu(s.min)}–${hu(s.max)} m`, from: `örökölt korlát: ${f}` });
          return;
        }
        seen.add(k);
        const own = f === name;
        rows.push({ slot: k, value: text, from: own ? 'saját' : `örökölt: ${f}` });
      });
    });
    return rows;
  }
  /** IF_ADDED: az új magasság ellenőrzése minden örökölt korláttal. @param {string} name @param {number} h */
  function checkHeight(name, h) {
    const limits = chain(name).map((f) => ({ f, s: frames[f].slots['Magasság'] })).filter((x) => x.s && x.s.min !== undefined);
    const broken = limits.filter((x) => !(h > /** @type {number} */ (x.s.min) && h < /** @type {number} */ (x.s.max)));
    return { limits, broken };
  }
  function initFrames() {
    const sel = $('#keret-valaszto'), body = $('#keret-tabla tbody'), out = $('#keret-ki'), input = $('#keret-magassag');
    if (!sel || !body || !out || !input) return;
    fill(sel, Object.keys(frames));
    sel.value = 'Bárszék';
    const render = () => {
      body.innerHTML = effective(sel.value).map((r) => `<tr><td>${r.slot}</td><td>${r.value}</td><td>${r.from}</td></tr>`).join('');
      out.innerHTML = `<p>A ${sel.value} lánca: ${chain(sel.value).join(' → ')}. A keretkezelő alulról felfelé keres, az első talált érték érvényes.</p>`;
    };
    sel.addEventListener('change', render);
    $('#keret-beir').addEventListener('click', () => {
      const h = Number(String(input.value).replace(',', '.'));
      if (!Number.isFinite(h)) { out.innerHTML = '<p class="u-bad">Adj meg egy számot méterben.</p>'; return; }
      const { limits, broken } = checkHeight(sel.value, h);
      const list = limits.map((x) => `${x.f}: ${hu(x.s.min)}–${hu(x.s.max)} m`).join('; ');
      out.innerHTML = broken.length
        ? `<p><strong class="u-bad">IF_ADDED: elutasítva.</strong> ${hu(h)} m nem fér bele ebbe: ${broken.map((x) => `${x.f} (${hu(x.s.min)}–${hu(x.s.max)} m)`).join(', ')}.</p><p>Ellenőrzött korlátok: ${list}.</p>`
        : `<p><strong class="u-ok">IF_ADDED: elfogadva.</strong> ${hu(h)} m minden örökölt korlátnak megfelel (${list}).</p>`;
    });
    $('#keret-suly').addEventListener('click', () => {
      const rows = effective(sel.value);
      const v = (/** @type {string} */ k) => { const r = rows.find((x) => x.slot === k); return r ? Number(r.value.split(' ')[0].replace(',', '.')) : NaN; };
      const vol = v('Térfogat'), dens = v('Fajsúly');
      out.innerHTML = Number.isFinite(vol) && Number.isFinite(dens)
        ? `<p><strong class="u-ok">IF_NEEDED lefutott</strong> (a Bútortól örökölt eljárás): ${hu(vol)} dm³ × ${hu(dens)} kg/dm³ = <strong>${(vol * dens).toFixed(2).replace('.', ',')} kg</strong>.</p>`
        : `<p><strong>IF_NEEDED elindult, de nem tud számolni:</strong> a ${sel.value} keretben nincs térfogat vagy fajsúly. Ilyenkor a rendszer megkérdezi a felhasználót. Próbáld a Bárszék-17 egyeddel!</p>`;
    });
    render();
  }

  /* 4 · Esethasonlóság – PDF 85–87. */
  /** @type {Record<string, number>} */
  const hue = { piros: 0, narancs: 30, 'sárga': 60, 'zöld': 120, 'kék': 240 };
  const grades = ['csúnya', 'átlagos', 'szép', 'gyönyörű'];
  const cases = [
    { id: 'E1', h: 58, c: 'piros', g: 'szép', sol: 'bükkfa láb, rétegelt nyírfa lap, vízbázisú festék', ok: true },
    { id: 'E2', h: 76, c: 'narancs', g: 'gyönyörű', sol: 'tömör tölgy, olajozott felület', ok: true },
    { id: 'E3', h: 60, c: 'kék', g: 'átlagos', sol: 'festett MDF lap', ok: false }
  ];
  /** @param {{h: number, c: string, g: string}} q @param {{h: number, c: string, g: string}} e @param {number[]} w */
  function similarity(q, e, w) {
    const sh = Math.max(0, 1 - Math.abs(q.h - e.h) / 40);
    const d = Math.abs(hue[q.c] - hue[e.c]);
    const sc = 1 - Math.min(d, 360 - d) / 180;
    const sg = 1 - Math.abs(grades.indexOf(q.g) - grades.indexOf(e.g)) / 3;
    const total = w[0] + w[1] + w[2];
    return { sh, sc, sg, all: total ? (w[0] * sh + w[1] * sc + w[2] * sg) / total : 0 };
  }
  function initCases() {
    const hIn = $('#uj-magassag'), cIn = $('#uj-szin'), gIn = $('#uj-kidolgozas'), bars = $('#eset-savok'), out = $('#eset-dontes');
    const wIn = ['#s-magassag', '#s-szin', '#s-kidolgozas'].map((s) => $(s));
    const tIn = $('#kuszob');
    if (!hIn || !cIn || !gIn || !bars || !out || !tIn) return;
    fill(cIn, Object.keys(hue), Object.keys(hue).map((k) => `${k} (${hue[k]}°)`));
    fill(gIn, grades);
    cIn.value = 'narancs'; gIn.value = 'szép';
    const n2 = (/** @type {number} */ x) => x.toFixed(2).replace('.', ',');
    const update = () => {
      const q = { h: Number(hIn.value), c: cIn.value, g: gIn.value };
      const w = wIn.map((x) => Number(x.value));
      const t = Number(tIn.value) / 100;
      $('#uj-magassag-ki').textContent = `${q.h} cm`;
      ['#s-magassag-ki', '#s-szin-ki', '#s-kidolgozas-ki'].forEach((s, i) => { $(s).textContent = String(w[i]); });
      $('#kuszob-ki').textContent = `${tIn.value}%`;
      const scored = cases.map((e) => ({ e, s: similarity(q, e, w) })).sort((a, b) => b.s.all - a.s.all);
      const best = scored[0];
      bars.innerHTML = scored.map(({ e, s }, i) => `<li class="${i === 0 ? 'u-best' : ''}"><strong>${e.id}</strong> · ${e.h} cm, ${e.c}, ${e.g} · <strong>${pct(s.all)}</strong>` +
        `<div class="u-bar" aria-hidden="true"><span style="width:${(s.all * 100).toFixed(1)}%"></span></div>` +
        `<small>magasság ${n2(s.sh)} · szín ${n2(s.sc)} · kidolgozás ${n2(s.sg)} · minősítés: ${e.ok ? 'jó' : 'rossz'}</small></li>`).join('');
      if (w.every((x) => x === 0)) { out.innerHTML = '<p class="u-bad">Minden súly 0: így semmi sem hasonlít semmire. Adj legalább egy jellemzőnek súlyt.</p>'; return; }
      const warn = best.e.ok ? '' : `<p class="u-bad">Figyelem: a legközelebbi eset (${best.e.id}) minősítése rossz. A megoldását („${best.e.sol}”) nem szabad megismételni.</p>`;
      out.innerHTML = (best.s.all >= t
        ? `<p><strong class="u-ok">Újrafelhasználás.</strong> ${best.e.id} hasonlósága ${pct(best.s.all)} ≥ ${tIn.value}%. A megoldás: ${best.e.sol}.</p>`
        : `<p><strong>Hozzáigazítás.</strong> A legjobb eset (${best.e.id}) hasonlósága ${pct(best.s.all)} &lt; ${tIn.value}%. A műhely ember segítségével igazítja a megoldást, aztán az új eset bekerül az esetbázisba.</p>`) + warn;
    };
    [hIn, cIn, gIn, tIn, ...wIn].forEach((x) => x.addEventListener('input', update));
    [cIn, gIn].forEach((x) => x.addEventListener('change', update));
    update();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const key = 'mi-alapok-03-kviz';
    const hint = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.';
    try { const prev = localStorage.getItem(key); result.textContent = prev ? `Legutóbbi eredményed: ${prev}. Bármikor újra kitöltheted, vagy kihagyhatod.` : hint; } catch { result.textContent = hint; }
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
      try { localStorage.setItem(key, summary); } catch { /* a tárolás nem kötelező */ }
    });
    form.addEventListener('reset', () => {
      form.querySelectorAll('.u-feedback').forEach((/** @type {HTMLElement} */ fb) => { fb.textContent = ''; fb.className = 'u-feedback'; });
      result.textContent = hint;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToc();
    initNet();
    initConflict();
    initFrames();
    initCases();
    initQuiz();
  });
})();
