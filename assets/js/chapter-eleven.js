// 11 · Zárthelyi-gyakorló: tartalomjegyzék, változatgenerátor, önértékelő pontlap, kvíz és nyomtatás.
// A számítások a tesztelt zh.js modellben vannak.
(() => {
  const Z = CourseZh;
  /** @param {string} sel @returns {any} */
  const $ = (sel) => document.querySelector(sel);
  const fmt = Z.fmt;
  const sub = (/** @type {string} */ s) => s.replace(/(\d)/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);
  /** Biztonságos szöveg HTML-be. @param {string|number} s */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /** @param {string} key */
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  /** @param {string} key @param {string} value */
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* a tárolás nem kötelező */ } };

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

  /* Változatgenerátor */
  /** @type {Record<string, (seed:number) => {task:string, sol:string}>} */
  const builders = {
    halo(seed) {
      const v = Z.netVariant(seed);
      const P = (/** @type {number} */ n) => (n < 0 ? `(${fmt(n)})` : fmt(n));
      const [x1, x2, x3] = v.x.map(P);
      const task = `<p><strong>4. feladat, ${seed}. változat.</strong> A minta-zh hálója (ReLU minden neuronban, a g₂ torzítása −25) ezzel a bemenettel: <strong>x₁ = ${fmt(v.x[0])}, x₂ = ${fmt(v.x[1])}, x₃ = ${fmt(v.x[2])}</strong>.</p>
<p>(a) Mik az 1. rejtett réteg potenciáljai? (b) Mik a 2. rejtett réteg kimenetei? (c) Mi a háló kimenete? (d) Hány neuronnál tér el a potenciál a kimenettől?</p>`;
      const [a1, a2, a3] = v.a1, [b1, b2] = v.a2;
      const sol = `<p>(a) a(h₁) = 3·${x1} + (−2)·${x2} + 2·${x3} = <strong>${fmt(a1)}</strong>; a(h₂) = 1·${x1} + 4·${x3} = <strong>${fmt(a2)}</strong>; a(h₃) = 3·${x1} + 2·${x2} = <strong>${fmt(a3)}</strong>. Kimenetek: ${v.o1.map((n) => fmt(n)).join(', ')}.</p>
<p>(b) a(g₁) = 2·${fmt(v.o1[0])} + 2·${fmt(v.o1[1])} + (−2)·${fmt(v.o1[2])} = ${fmt(b1)} → <strong>${fmt(v.o2[0])}</strong>; a(g₂) = 2·${fmt(v.o1[1])} + 2·${fmt(v.o1[2])} − 25 = ${fmt(b2)} → <strong>${fmt(v.o2[1])}</strong>.</p>
<p>(c) a(y) = 3·${fmt(v.o2[0])} + 5·${fmt(v.o2[1])} = ${fmt(v.ay)}, a kimenet <strong>${fmt(v.y)}</strong>.</p>
<p>(d) <strong>${v.differ}</strong> neuronnál: ott, ahol a potenciál negatív.</p>`;
      return { task, sol };
    },
    fuzzy(seed) {
      const v = Z.fuzzyVariant(seed);
      const names = (/** @type {'hom'|'para'} */ k, /** @type {Record<string, number>} */ m) => Z.FUZZY[k].filter((t) => m[t.key] > 0).map((t) => `${t.name} ${fmt(m[t.key])}`).join(', ') || 'mindegyik 0';
      const seb = Object.fromEntries(Z.FUZZY.seb.map((t) => [t.key, t.name]));
      const hom = Object.fromEntries(Z.FUZZY.hom.map((t) => [t.key, t.name]));
      const para = Object.fromEntries(Z.FUZZY.para.map((t) => [t.key, t.name]));
      const task = `<p><strong>7. feladat, ${seed}. változat.</strong> A minta-zh tagsági függvényei és öt szabálya, ezzel a bemenettel: <strong>HŐM = ${v.hom} °C, PÁRA = ${v.para}%</strong>.</p>
<p>(a) Mik a tagsági értékek? (b) Mik a szabályok értékei? (c) Mennyi a SEBESSÉG súlypont-módszerrel?</p>`;
      const rules = v.rules.map((r, i) => `${i + 1}. ${hom[r.h]} ÉS ${para[r.p]} → ${seb[r.o]}: <strong>${fmt(r.value)}</strong>`).join('<br>');
      const active = Object.entries(v.level).filter(([, h]) => h > 0).map(([k, h]) => `${seb[k]} ${fmt(h)}-nél levágva`).join(', ');
      const sol = `<p>(a) HŐM: ${names('hom', v.mh)}. PÁRA: ${names('para', v.mp)}.</p>
<p>(b) ÉS = minimum:<br>${rules}</p>
<p>(c) Aktív kimeneti halmazok: ${active}. Egy h magasan levágott háromszög területe 10 · h · (2 − h), közepe a csúcs. A súlypont: <strong>${fmt(v.centroid || 0, 1)}%</strong>.</p>`;
      return { task, sol };
    },
    lampa(seed) {
      const v = Z.lampVariant(seed);
      const C = (/** @type {number} */ i) => `C${sub(String(i + 1))}`;
      const on = v.pop.map((b, i) => `${C(i)}: ${Z.decode(b).join(', ')}`).join('; ');
      const task = `<p><strong>9. feladat, ${seed}. változat.</strong> A minta-zh 8 lámpája, legfeljebb 20 egység energia, túlsúlynál a fitnesz 0. Egyedek: ${esc(on)}.</p>
<p>(a) Add meg a kromoszómákat! (b) Számold ki a fitneszeket! (c) Versenyek: ${C(v.pairs[0][0])}–${C(v.pairs[0][1])} és ${C(v.pairs[1][0])}–${C(v.pairs[1][1])}. Kik a szülők? (d) Egypontos keresztezés a ${v.k}. bit után: mik az utódok (C₅, C₆) és a fitneszük? (e) Melyik három egyed az elit? (f) A többiek közül kinek a legnagyobb az esélye rangsor alapú túlélésnél?</p>`;
      const rows = v.pop.map((b, i) => { const l = Z.lamps(b); return `${C(i)} = <code>${b}</code>: energia ${l.energy}, fényerő ${l.bright}, f = <strong>${l.fitness}</strong>`; }).join('<br>');
      const kids = v.kids.map((b, i) => { const l = Z.lamps(b); return `${C(4 + i)} = <code>${b.slice(0, v.k)}|${b.slice(v.k)}</code> (${l.on.join(', ') || 'egyik sem ég'}): energia ${l.energy}, f = <strong>${l.fitness}</strong>`; }).join('<br>');
      const sol = `<p>(a–b)<br>${rows}</p>
<p>(c) A nagyobb fitnesz nyer: a szülők <strong>${C(v.parents[0])} és ${C(v.parents[1])}</strong>.</p>
<p>(d)<br>${kids}</p>
<p>(e) A hat egyed rangsora: ${v.ranked.map((e) => `${sub(e.name)} (${e.fitness})`).join(', ')}. Az elit: <strong>${v.elite.map((e) => sub(e.name)).join(', ')}</strong>.</p>
<p>(f) A maradék közül <strong>${sub(v.rest[0].name)}</strong> áll az első helyen.</p>`;
      return { task, sol };
    }
  };
  function initGenerator() {
    const task = $('#gen-feladat'), sol = $('#gen-megoldas-doboz'), btnNew = $('#gen-uj'), btnSol = $('#gen-megoldas'), panel = $('#gen-panel');
    if (!task || !sol || !btnNew || !btnSol || !panel) return;
    /** @type {HTMLButtonElement[]} */
    const tabs = /** @type {HTMLButtonElement[]} */ ([...document.querySelectorAll('[data-gen]')]);
    /** @type {Record<string, number>} */
    const seeds = { halo: 1, fuzzy: 1, lampa: 1 };
    let kind = 'halo';
    const showSol = (/** @type {boolean} */ open) => {
      sol.hidden = !open;
      btnSol.setAttribute('aria-expanded', String(open));
      btnSol.textContent = open ? 'Megoldás elrejtése' : 'Megoldás mutatása';
    };
    const draw = () => {
      const r = builders[kind](seeds[kind]);
      task.innerHTML = r.task;
      sol.innerHTML = r.sol;
      showSol(false);
    };
    const select = (/** @type {string} */ k) => {
      kind = k;
      tabs.forEach((t) => { const on = t.dataset.gen === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on) panel.setAttribute('aria-labelledby', t.id); });
      draw();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t.dataset.gen || 'halo'));
      t.addEventListener('keydown', (/** @type {KeyboardEvent} */ e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        select(next.dataset.gen || 'halo');
      });
    });
    btnNew.addEventListener('click', () => { seeds[kind] += 1; draw(); });
    btnSol.addEventListener('click', () => showSol(sol.hidden));
    select('halo');
  }

  /* Önértékelő pontlap */
  function initScore() {
    const form = $('#pontlap-urlap'), sum = $('#pontlap-osszeg'), bar = $('#pontlap-sav'), advice = $('#pontlap-tanacs'), tf = $('#pl-tf');
    if (!form || !sum || !bar || !advice || !tf) return;
    for (let i = 0; i <= 15; i++) { const o = document.createElement('option'); o.value = String(i); o.textContent = `${i} / 15`; tf.appendChild(o); }
    const key = 'mi-alapok-11-pontlap';
    /** @type {HTMLInputElement[]} */
    const boxes = /** @type {HTMLInputElement[]} */ ([...form.querySelectorAll('input[type=checkbox]')]);
    const saved = read(key);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        tf.value = String(s.tf || 0);
        boxes.forEach((b, i) => { b.checked = !!(s.boxes || [])[i]; });
      } catch { /* sérült mentés: üres pontlap */ }
    }
    const update = () => {
      let total = Number(tf.value);
      /** @type {Array<{name:string, missing:number, link:string, where:string}>} */
      const weak = [];
      form.querySelectorAll('fieldset').forEach((/** @type {HTMLFieldSetElement} */ fs) => {
        const legend = (fs.querySelector('legend') || {}).textContent || '';
        const max = Number((legend.match(/\((\d+)\)/) || [])[1] || 0);
        let got = 0;
        if (fs.contains(tf)) got = Number(tf.value);
        else /** @type {HTMLInputElement[]} */ ([...fs.querySelectorAll('input[type=checkbox]')]).forEach((b) => { if (b.checked) got += Number(b.dataset.pont); });
        if (!fs.contains(tf)) total += got;
        if (max - got >= Math.max(2, max * 0.4)) weak.push({ name: legend.replace(/\s*\(\d+\)$/, ''), missing: max - got, link: fs.dataset.link || '#', where: fs.dataset.fejezet || '' });
      });
      sum.textContent = `${total} / 100 pont`;
      bar.style.width = `${total}%`;
      weak.sort((a, b) => b.missing - a.missing);
      advice.innerHTML = total === 0 ? 'Jelöld be, mi sikerült. A pontlap a böngésződben marad.'
        : weak.length ? `A legtöbb pontot itt hagytad: ${weak.slice(0, 3).map((w) => `<a class="xref" href="${esc(w.link)}">${esc(w.name)}</a> (−${w.missing}, ${esc(w.where)})`).join('; ')}. Ezeket érdemes újra átnézni.`
          : 'Minden feladatban megszerezted a pontok nagy részét. Próbáld ki a változatgenerátort új számokkal!';
      write(key, JSON.stringify({ tf: Number(tf.value), boxes: boxes.map((b) => b.checked) }));
    };
    form.addEventListener('change', update);
    form.addEventListener('reset', () => setTimeout(update, 0));
    update();
  }

  /* Kvíz */
  function initQuiz() {
    const form = $('#kviz-urlap'), result = $('#kviz-eredmeny');
    if (!form || !result) return;
    const storeKey = 'mi-alapok-11-kviz';
    const hint = 'Jelölj meg annyi választ, amennyit szeretnél, majd ellenőrizd.';
    const prev = read(storeKey);
    result.textContent = prev ? `Legutóbbi eredményed: ${prev}. Bármikor újra kitöltheted, vagy kihagyhatod.` : hint;
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
      write(storeKey, summary);
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
    initGenerator();
    initScore();
    initQuiz();
    initPrint();
  });
})();
