// 02 · A fejezet interaktív bemutatói.
(() => {
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  /** @param {string} tag @param {Record<string, string>} [attrs] @param {string} [text] */
  const el = (tag, attrs = {}, text = '') => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text) node.textContent = text;
    return node;
  };
  /** @param {string} text */
  const code = (text) => `<code>${text}</code>`;

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

  /* Interjúszimulátor */
  const interview = [
    {
      k: 'K1', label: 'Miért?', question: 'Miért vizsgálta meg a portot?',
      answer: 'Ha előtte villámlás volt, akkor általában jó ötlet megvizsgálni a gép portjait, mert a villámlás kárt szokott tenni bennük.',
      rules: ['HA villámlás volt AKKOR vizsgáld meg a portot'],
      effect: 'A K1 egy puszta cselekvésből szabályt csinált: előkerült a feltétel (villámlás).', pdf: true
    },
    {
      k: 'K2', label: 'Hogyan?', question: 'Hogyan vizsgálja meg a portot?',
      answer: 'Először megnézem, nem sérült-e a csatlakozó. Aztán egy tesztdugót teszek bele, amely a kiküldött jelet visszaküldi. Ha nem jön vissza, a port rossz.',
      rules: ['HA a port gyanús AKKOR nézd meg a csatlakozó sérülését', 'HA a tesztdugón nem jön vissza a jel AKKOR a port hibás'],
      effect: 'A K2 egy nagy lépést kisebb, alacsonyabb szintű lépésekre bontott.'
    },
    {
      k: 'K3', label: 'Mikor? Mindig?', question: 'Igaz, hogy villámlás után mindig a portot kell vizsgálni?',
      answer: 'Nem mindig. Ha a gép túlfeszültség-védő elosztóra volt kötve, a villám ritkán árt a portnak. Akkor inkább a kábelt nézem meg.',
      rules: ['HA villámlás volt ÉS nem volt túlfeszültség-védő AKKOR a port gyanús', 'HA villámlás volt ÉS volt túlfeszültség-védő AKKOR vizsgáld meg a kábelt'],
      effect: 'A K3 megmutatta, hogy a szabály túl általános volt, ezért két pontosabb szabály lett belőle.'
    },
    {
      k: 'K4', label: 'Alternatívák?', question: 'Vannak más alternatívái ennek a problémának?',
      answer: 'Igen, a fentit meg kell előznie egy kérdésnek, hogy volt-e több furcsán viselkedő billentyű – nem feltétlenül mind, de kettőnél több.',
      rules: ['HA villámlás volt ÉS kettőnél több billentyű furcsa AKKOR a port gyanús'],
      effect: 'A K4 egy korábbi, kimondatlan feltételt hozott elő.', pdf: true
    },
    {
      k: 'K5', label: 'Mi lenne, ha nem…?', question: 'Mi lenne, ha nem lett volna villámlás?',
      answer: 'Akkor a beállításokra gyanakodnék. Ha sok billentyű furcsa, valaki átállíthatta a port sebességét vagy paritását.',
      rules: ['HA nem volt villámlás ÉS kettőnél több billentyű furcsa AKKOR ellenőrizd a port beállításait'],
      effect: 'A K5 szabályt adott arra az esetre is, amikor a jelenlegi feltétel nem áll fenn.'
    },
    {
      k: 'K6', label: 'Mondana többet?', question: 'Tudna többet mondani a furcsán viselkedő billentyűkről?',
      answer: 'Ha csak egy vagy két billentyű viselkedne furcsán, akkor meg kellene vizsgálni, jók-e a kontaktusaik. A sebesség minden billentyűre kihatna, a paritás kb. a billentyűk felére.',
      rules: ['HA legfeljebb két billentyű furcsa AKKOR vizsgáld meg a kontaktusokat', 'HA minden billentyű furcsa AKKOR a sebesség beállítása gyanús', 'HA kb. a billentyűk fele furcsa AKKOR a paritás beállítása gyanús'],
      effect: 'A K6 új témát nyitott, és egyszerre három szabályt hozott. A PDF-ben ez a válasz egy K1 kérdésre érkezik.', pdf: true
    }
  ];
  function initInterview() {
    const box = $('#interju-gombok'), out = $('#interju-valasz'), notes = $('#interju-jegyzet'), reset = $('#interju-ujra');
    if (!box || !out || !notes) return;
    /** @type {() => void} */
    const empty = () => { notes.innerHTML = ''; notes.append(el('li', { class: 'u-empty' }, 'Még nincs szabály.')); };
    out.innerHTML = '<p>Válassz egy kérdéssablont.</p>';
    interview.forEach((item) => {
      const b = el('button', { type: 'button', 'aria-pressed': 'false' });
      b.innerHTML = `<strong>${item.k}</strong> · ${item.label}<small>${item.question}</small>`;
      b.addEventListener('click', () => {
        const first = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', 'true');
        out.innerHTML = `<p><strong>Tudásmérnök (${item.k}):</strong> ${item.question}</p>` +
          `<p><strong>Szakértő:</strong> ${item.answer}</p>` +
          `<p><em>${item.effect}</em> ${item.pdf ? '(A válasz a PDF 51. oldaláról.)' : '(Szemléltető válasz.)'}</p>`;
        if (!first) { out.insertAdjacentHTML('beforeend', '<p>Ezt már megkérdezted, a szabályai a jegyzetfüzetben vannak.</p>'); return; }
        const placeholder = notes.querySelector('.u-empty');
        if (placeholder) placeholder.remove();
        item.rules.forEach((r) => { const li = el('li'); li.innerHTML = `${code(r)} <small>(${item.k})</small>`; notes.append(li); });
        const asked = box.querySelectorAll('[aria-pressed=true]').length;
        if (asked === interview.length) out.insertAdjacentHTML('beforeend', `<p class="u-ok">Mind a hat sablont használtad: ${notes.children.length} szabály gyűlt össze egyetlen mondatból.</p>`);
      });
      box.append(b);
    });
    empty();
    if (reset) reset.addEventListener('click', () => {
      box.querySelectorAll('button').forEach((/** @type {Element} */ b) => b.setAttribute('aria-pressed', 'false'));
      empty();
      out.innerHTML = '<p>Új interjú. Válassz egy kérdéssablont.</p>';
    });
  }

  /* Rendezés */
  const tasks = [
    'Archívumkutatás és első konzultációk a szakértőkkel',
    'A Tudás Kézikönyv első változatának megírása',
    'A szakértő kiválasztása és motiválása',
    'Nyitott végű interjú a K1–K6 kérdésekkel',
    'Az interjú átírása és szövegrészekre bontása',
    'A leíró és az eljárási tudás rögzítése a kézikönyvben'
  ];
  const phaseOf = [1, 1, 2, 3, 4, 4];
  function initSort() {
    const list = $('#sorrend-lista'), check = $('#sorrend-ellenoriz'), shuffle = $('#sorrend-kever'), out = $('#sorrend-ki');
    if (!list || !check || !out) return;
    /** @type {number[]} */
    let order = [];
    /** @param {number} [focusIdx] @param {number} [dir] */
    const render = (focusIdx, dir) => {
      list.innerHTML = '';
      order.forEach((t, i) => {
        const li = el('li');
        const text = el('span', {}, tasks[t]);
        const btns = el('span', { class: 'u-sort-btns' });
        const up = /** @type {HTMLButtonElement} */ (el('button', { type: 'button', class: 'u-ghost', 'aria-label': `Fel: ${tasks[t]}` }, 'Fel'));
        const down = /** @type {HTMLButtonElement} */ (el('button', { type: 'button', class: 'u-ghost', 'aria-label': `Le: ${tasks[t]}` }, 'Le'));
        up.disabled = i === 0;
        down.disabled = i === order.length - 1;
        up.addEventListener('click', () => move(i, -1));
        down.addEventListener('click', () => move(i, 1));
        btns.append(up, down);
        li.append(text, btns);
        list.append(li);
      });
      if (focusIdx !== undefined) {
        const row = list.children[focusIdx];
        const target = /** @type {HTMLButtonElement | undefined} */ (row && row.querySelectorAll('button')[(dir || 0) < 0 ? 0 : 1]);
        const fallback = /** @type {HTMLButtonElement | null} */ (row && row.querySelector('button:not([disabled])'));
        (target && !target.disabled ? target : fallback)?.focus();
      }
    };
    /** @param {number} i @param {number} d */
    const move = (i, d) => {
      const j = i + d;
      if (j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      out.innerHTML = `<p>Áthelyezve: „${tasks[order[j]]}” most a ${j + 1}. helyen áll.</p>`;
      render(j, d);
    };
    const mix = () => {
      do {
        order = tasks.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i -= 1) { const r = Math.floor(Math.random() * (i + 1)); [order[i], order[r]] = [order[r], order[i]]; }
      } while (order.every((v, i) => v === i));
      render();
      out.innerHTML = '<p>Rendezd sorba a teendőket, majd kattints az Ellenőrzés gombra.</p>';
    };
    check.addEventListener('click', () => {
      let good = 0;
      [...list.children].forEach((li, i) => {
        const ok = order[i] === i;
        if (ok) good += 1;
        li.classList.toggle('u-right', ok);
        li.classList.toggle('u-wrong', !ok);
      });
      if (good === tasks.length) {
        out.innerHTML = '<p class="u-ok">Pontosan így. Szakaszok szerint: 1–1–2–3–4–4.</p><p>Az első szakasz a kézikönyvvel zárul, és a negyedik is abba ír. A kézikönyv tehát a projekt elejét és végét is összeköti.</p>';
      } else {
        const hints = order.map((t, i) => (t === i ? null : `a ${i + 1}. helyen álló teendő a(z) ${phaseOf[t]}. szakaszhoz tartozik`)).filter(Boolean);
        out.innerHTML = `<p class="u-bad">${good} / ${tasks.length} teendő áll jó helyen.</p><p>Tipp: ${hints[0]}. A szakaszok sorrendje: feltárás → források → kinyerés → elemzés.</p>`;
      }
    });
    if (shuffle) shuffle.addEventListener('click', mix);
    mix();
  }

  /* Szabálylánc: előre- és hátraláncolás */
  const rules = [
    { id: 'R1', if: ['a', 'b'], then: 'e' },
    { id: 'R2', if: ['c', 'd'], then: 'f' },
    { id: 'R3', if: ['e', 'f'], then: 'g' },
    { id: 'R4', if: ['b', 'c'], then: 'h' }
  ];
  /** @param {string[]} xs */
  const fmtList = (xs) => xs.map((x) => code(x)).join(', ');

  /** @typedef {{text: string, known: Set<string>, fired: string[], focus?: string}} Step */
  /** @param {string[]} facts @returns {Step[]} */
  function forwardTrace(facts) {
    const known = new Set(facts);
    /** @type {Step[]} */
    const steps = [];
    /** @type {string[]} */
    const fired = [];
    for (;;) {
      const conflict = rules.filter((r) => r.if.every((c) => known.has(c)) && !known.has(r.then));
      if (!conflict.length) {
        steps.push({ text: `Nincs több alkalmazható szabály, a folyamat leáll. Tények: ${fmtList([...known].sort())}.`, known: new Set(known), fired: [...fired] });
        break;
      }
      const r = conflict[0];
      known.add(r.then);
      fired.push(r.id);
      steps.push({
        text: `Alkalmazható: ${conflict.map((x) => x.id).join(', ')}. Elsül az <strong>${r.id}</strong> → új tény: ${code(r.then)}${r.then === 'g' ? ' ✓' : ''}.`,
        known: new Set(known), fired: [...fired], focus: r.then
      });
    }
    return steps;
  }

  /** @param {string[]} facts @returns {Step[]} */
  function backwardTrace(facts) {
    const known = new Set(facts);
    /** @type {Set<string>} */
    const proven = new Set();
    /** @type {string[]} */
    const fired = [];
    /** @type {Step[]} */
    const steps = [];
    /** @param {string} text @param {string} [focus] */
    const snap = (text, focus) => steps.push({ text, known: new Set([...known, ...proven]), fired: [...fired], focus });
    /** @param {string} goal @param {number} depth @returns {boolean} */
    const prove = (goal, depth) => {
      const pad = depth ? 'Részcél' : 'Cél';
      if (known.has(goal)) { snap(`${pad}: ${code(goal)} – ismert tény ✓`, goal); return true; }
      const rule = rules.find((r) => r.then === goal);
      if (!rule) {
        snap(`${pad}: ${code(goal)} – nem ismert tény, és nincs rá szabály. A rendszer most rákérdezne: „Igaz-e ${goal}?” Itt a válasz: nem.`, goal);
        return false;
      }
      snap(`${pad}: ${code(goal)} – nem ismert tény. Az <strong>${rule.id}</strong> adja, részcélok: ${fmtList(rule.if)}.`, goal);
      for (const c of rule.if) {
        if (!prove(c, depth + 1)) { snap(`${code(goal)} nem igazolható, mert ${code(c)} hiányzik.`, goal); return false; }
      }
      proven.add(goal);
      fired.push(rule.id);
      snap(`Az <strong>${rule.id}</strong> szerint ${code(goal)} igazolva${goal === 'g' ? ' ✓' : ''}.`, goal);
      return true;
    };
    const ok = prove('g', 0);
    snap(ok ? 'A cél igazolva. A <code>h</code> tényt és az R4 szabályt egyszer sem kellett megvizsgálni.' : 'A cél a megadott tényekből nem igazolható.');
    return steps;
  }

  function initChain() {
    const host = $('#lanc-fa'), src = $('#kovetkeztetesi-fa svg');
    /** @type {HTMLInputElement[]} */
    const boxes = [...document.querySelectorAll('#lanc-tenyek input')].map((n) => /** @type {HTMLInputElement} */ (n));
    const summary = $('#lanc-osszegzes');
    const fwdList = $('#lanc-elore'), bwdList = $('#lanc-hatra');
    const fwdBtn = $('#lanc-elore-lep'), bwdBtn = $('#lanc-hatra-lep'), reset = $('#lanc-ujra');
    if (!host || !src || !boxes.length || !summary || !fwdList || !bwdList || !fwdBtn || !bwdBtn) return;
    /** @type {SVGSVGElement} */
    const svg = src.cloneNode(true);
    svg.querySelectorAll('[id]').forEach((/** @type {Element} */ n) => n.removeAttribute('id'));
    svg.removeAttribute('aria-labelledby');
    svg.setAttribute('aria-hidden', 'true');
    host.append(svg);

    /** @type {Step[]} */
    let fwd = [];
    /** @type {Step[]} */
    let bwd = [];
    /** @type {string[]} */
    let facts = [];
    let fi = 0, bi = 0;
    /** @param {{known: Set<string>, fired: string[], focus?: string}} state */
    const paint = (state) => {
      svg.querySelectorAll('[data-node]').forEach((g) => {
        const n = /** @type {SVGGElement} */ (g).dataset.node || '';
        g.classList.toggle('u-true', facts.includes(n));
        g.classList.toggle('u-derived', !facts.includes(n) && state.known.has(n));
        g.classList.toggle('u-focus', state.focus === n);
      });
      svg.querySelectorAll('line[data-el]').forEach((l) => l.classList.toggle('u-on', state.fired.includes(/** @type {SVGLineElement} */ (l).dataset.el || '')));
    };
    const full = () => {
      const all = fwd[fwd.length - 1];
      paint({ known: all.known, fired: all.fired });
    };
    /** @param {HTMLOListElement} ol @param {Step[]} steps @param {number} n */
    const list = (ol, steps, n) => {
      ol.innerHTML = '';
      if (!n) { ol.append(el('li', { class: 'u-empty' }, 'Nyomd meg a Következő lépés gombot.')); return; }
      steps.slice(0, n).forEach((s) => { const li = el('li'); li.innerHTML = s.text; ol.append(li); });
    };
    const restart = () => {
      facts = boxes.filter((b) => b.checked).map((b) => b.value);
      fwd = forwardTrace(facts);
      bwd = backwardTrace(facts);
      fi = 0; bi = 0;
      list(fwdList, fwd, 0); list(bwdList, bwd, 0);
      fwdBtn.disabled = false; bwdBtn.disabled = false;
      full();
      const all = fwd[fwd.length - 1].known;
      const derived = ['e', 'f', 'g', 'h'].filter((x) => all.has(x));
      summary.textContent = `Igaz tények: ${facts.length ? facts.join(', ') : 'nincs'}. Levezethető: ${derived.length ? derived.join(', ') : 'semmi'}. A g végkövetkeztetés ${all.has('g') ? 'levezethető' : 'nem vezethető le'}.`;
    };
    fwdBtn.addEventListener('click', () => {
      fi = Math.min(fi + 1, fwd.length);
      list(fwdList, fwd, fi);
      paint(fwd[fi - 1]);
      if (fi === fwd.length) fwdBtn.disabled = true;
    });
    bwdBtn.addEventListener('click', () => {
      bi = Math.min(bi + 1, bwd.length);
      list(bwdList, bwd, bi);
      paint(bwd[bi - 1]);
      if (bi === bwd.length) bwdBtn.disabled = true;
    });
    boxes.forEach((b) => b.addEventListener('change', restart));
    if (reset) reset.addEventListener('click', restart);
    restart();
  }

  /* Konfliktusfeloldás */
  /** @type {Record<string, {strategy: string, text: string}>} */
  const conflict = {
    S1: {
      strategy: 'szabálysorrend',
      text: 'Ez a szabály áll elöl a szabálybázisban, ezért a <strong>szabálysorrend</strong> stratégia ezt választaná. Egyszerű és kiszámítható, de a tudásmérnöknek gondosan kell sorba raknia a szabályokat. Itt ez kerülőút: a csatlakozó rendben lesz, a hiba marad.'
    },
    S2: {
      strategy: 'specifikusság',
      text: 'Ennek a szabálynak van a legtöbb feltétele, ezért a <strong>specifikusság</strong> stratégia ezt választaná. A több feltétel pontosabb helyzetet ír le, így ez rendszerint jobb választás. Új tény: <code>a port gyanús</code>, amely újabb szabályokat indíthat.'
    },
    S3: {
      strategy: 'frissesség',
      text: 'Ez a szabály a legutóbb bekerült (3.) tényre épül, ezért a <strong>frissesség</strong> stratégia ezt választaná. Így a rendszer mindig a legújabb információra reagál, mintha a beszélgetés fonalát követné. Új tény: <code>a sebesség beállítása gyanús</code>.'
    }
  };
  function initConflict() {
    /** @type {HTMLInputElement[]} */
    const radios = [...document.querySelectorAll('#konfliktus-szabalyok input')].map((n) => /** @type {HTMLInputElement} */ (n));
    const out = $('#konfliktus-ki');
    if (!radios.length || !out) return;
    out.innerHTML = '<p>Válassz egy szabályt a konfliktushalmazból.</p>';
    radios.forEach((r) => r.addEventListener('change', () => {
      const pick = conflict[r.value];
      const others = Object.entries(conflict).filter(([k]) => k !== r.value).map(([k, v]) => `${k}: ${v.strategy}`).join('; ');
      out.innerHTML = `<p><strong>${r.value} alkalmazva.</strong> ${pick.text}</p>` +
        `<p>A másik két szabály stratégiája: ${others}. A refrakció miatt ${r.value} erre a ténykészletre többé nem sül el, a következő ciklusban a maradék két szabály közül választunk.</p>` +
        '<p class="u-ok">Nincs „egyetlen helyes” válasz: a konfliktusfeloldási stratégia a tudásmérnök tervezési döntése, és megváltoztatja a következtetés menetét.</p>';
    }));
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const key = 'mi-alapok-02-kviz';
    const hint = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.';
    try { const prev = localStorage.getItem(key); result.textContent = prev ? `Legutóbbi eredményed: ${prev}. Bármikor újra kitöltheted, vagy kihagyhatod.` : hint; } catch { result.textContent = hint; }
    form.addEventListener('submit', (/** @type {Event} */ e) => {
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
      form.querySelectorAll('.u-feedback').forEach((/** @type {HTMLElement} */ fb) => { fb.textContent = ''; fb.className = 'u-feedback'; });
      result.textContent = hint;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToc();
    initInterview();
    initSort();
    initChain();
    initConflict();
    initQuiz();
  });
})();
