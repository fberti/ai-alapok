/* =========================================================
   MI-alapok – magyarázó tippek a kódban
   ---------------------------------------------------------
   Használat: a kód egy szava így kap rövid magyarázatot:
     <span class="u-tok" data-tip="lista.append(x): …" tabindex="0">append</span>
   Egérrel rámutatva, koppintásra vagy billentyűzettel (Tab) a szó mellett
   buborék jelenik meg. Esc vagy máshová koppintás bezárja.
   A buborék a <body> végén él, ezért a kódblokk vízszintes görgetése nem
   vágja le. Egy fogalomnak elég az első előfordulását fókuszálhatóvá tenni
   (tabindex="0"), a többi egérrel és koppintással működik.
   JavaScript nélkül a kód változatlanul olvasható; a magyarázatot a
   kód körüli szöveg adja.
   ========================================================= */
(() => {
  'use strict';

  /** @type {HTMLElement | null} */ let tip = null;
  /** @type {HTMLElement | null} */ let current = null;

  function bubble() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'u-tooltip';
    tip.id = 'kod-tipp';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    document.body.appendChild(tip);
    return tip;
  }

  /* Egyszerű Python-színezés a példákhoz: megjegyzés, szöveg, kulcsszó,
     beépített függvény, szám. A szöveg textContent-ként kerül be, HTML-ként soha. */
  const PY = /(#.*$)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(def|return|while|for|in|if|elif|else|not|and|or|is|None|True|False|lambda|class|import|from|as|try|except|raise|break|continue|pass|with|yield|global|del)\b|\b(print|len|list|dict|set|tuple|bool|range|str|int|float|round|sorted|min|max|sum|abs|any|all|enumerate|zip|isinstance)\b(?=\()|\b(\d+)\b/gm;
  const KIND = ['', 'hl-com', 'hl-str', 'hl-kw', 'hl-fn', 'hl-num'];
  // Prolog: megjegyzés (%), szöveg, beépített kulcsszó és jel, változó (nagybetűs vagy _), szám.
  const PL = /(%.*$)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|(:-|\\\+|\?-|!|\b(?:is|fail|true|assertz|asserta|retract|write|nl)\b)|\b([A-Z_][A-Za-z0-9_]*)\b|\b(\d+)\b/gm;
  const KIND_PL = ['', 'hl-com', 'hl-str', 'hl-kw', 'hl-var', 'hl-num'];
  /** @param {string} src @param {string} [lang] */
  function highlight(src, lang) {
    const code = document.createElement('code');
    const prolog = lang === 'prolog';
    const kinds = prolog ? KIND_PL : KIND;
    let last = 0;
    for (const m of src.matchAll(prolog ? PL : PY)) {
      const i = m.index || 0;
      if (i > last) code.append(src.slice(last, i));
      const span = document.createElement('span');
      span.className = kinds[m.findIndex((g, k) => k > 0 && g !== undefined)];
      span.textContent = m[0];
      code.append(span);
      last = i + m[0].length;
    }
    if (last < src.length) code.append(src.slice(last));
    return code;
  }

  /** @param {HTMLElement} tok */
  function show(tok) {
    const t = bubble();
    if (current && current !== tok) current.classList.remove('is-active');
    current = tok;
    tok.classList.add('is-active');
    t.replaceChildren();
    const text = document.createElement('p');
    text.textContent = tok.dataset.tip || '';
    t.appendChild(text);
    if (tok.dataset.ex) {
      const label = document.createElement('p');
      label.className = 'u-tooltip-label';
      label.textContent = 'Példa';
      const pre = document.createElement('pre');
      pre.className = 'u-tooltip-ex';
      pre.appendChild(highlight(tok.dataset.ex, tok.dataset.exLang));
      t.append(label, pre);
    }
    tok.setAttribute('aria-describedby', t.id);
    t.hidden = false;
    // Elhelyezés: a szó fölé, ha nincs hely, alá; vízszintesen a képernyőn belül.
    const r = tok.getBoundingClientRect();
    const gap = 8;
    t.style.left = '0px';
    t.style.top = '0px';
    const w = t.offsetWidth, h = t.offsetHeight;
    let top = r.top - h - gap;
    t.classList.toggle('is-below', top < 8);
    if (top < 8) top = r.bottom + gap;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    t.style.left = `${Math.round(left)}px`;
    t.style.top = `${Math.round(top)}px`;
    t.style.setProperty('--arrow-x', `${Math.round(r.left + r.width / 2 - left)}px`);
  }

  function hide() {
    if (!tip || tip.hidden) return;
    tip.hidden = true;
    if (current) {
      current.classList.remove('is-active');
      current.removeAttribute('aria-describedby');
    }
    current = null;
  }

  /** @param {EventTarget | null} el */
  const tokOf = (el) => /** @type {HTMLElement | null} */ (el instanceof Element ? el.closest('.u-tok[data-tip]') : null);

  document.addEventListener('pointerover', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const tok = tokOf(ev.target);
    if (tok) show(tok);
  });
  document.addEventListener('pointerout', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const tok = tokOf(ev.target);
    if (tok && tokOf(ev.relatedTarget) !== tok && document.activeElement !== tok) hide();
  });
  document.addEventListener('focusin', (ev) => {
    const tok = tokOf(ev.target);
    if (tok) show(tok);
  });
  document.addEventListener('focusout', (ev) => {
    if (tokOf(ev.target)) hide();
  });
  // Koppintás: a szóra koppintva megjelenik, ugyanarra újra koppintva vagy máshová koppintva eltűnik.
  // A pointerdown még a fókusz előtt fut: így tudjuk, nyitva volt-e már a buborék.
  let wasOpen = false;
  document.addEventListener('pointerdown', (ev) => {
    const tok = tokOf(ev.target);
    wasOpen = !!tok && current === tok;
  });
  document.addEventListener('click', (ev) => {
    const tok = tokOf(ev.target);
    if (!tok) { hide(); return; }
    if (wasOpen && /** @type {PointerEvent} */ (ev).pointerType !== 'mouse') hide();
    else show(tok);
    wasOpen = false;
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && current) { hide(); return; }
    // Billentyűzet: egy kódblokk egyetlen Tab-megálló, a szavak között nyilakkal lépkedünk.
    const tok = tokOf(ev.target);
    if (!tok) return;
    const list = toksIn(tok);
    const i = list.indexOf(tok);
    let j = -1;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') j = Math.min(i + 1, list.length - 1);
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') j = Math.max(i - 1, 0);
    else if (ev.key === 'Home') j = 0;
    else if (ev.key === 'End') j = list.length - 1;
    if (j < 0) return;
    ev.preventDefault();
    focusTok(list, j);
  });

  /** Egy kódblokk fókuszálható szavai (fogalmanként az első előfordulás). */
  /** @param {HTMLElement} tok */
  const toksIn = (tok) => /** @type {HTMLElement[]} */ ([...(tok.closest('pre') || document).querySelectorAll('.u-tok[data-roving]')]);
  /** @param {HTMLElement[]} list @param {number} j */
  function focusTok(list, j) {
    list.forEach((t, k) => t.setAttribute('tabindex', k === j ? '0' : '-1'));
    list[j].focus();
  }
  function initRoving() {
    document.querySelectorAll('pre').forEach((pre) => {
      const list = [...pre.querySelectorAll('.u-tok[tabindex]')];
      list.forEach((t, k) => { t.setAttribute('data-roving', ''); t.setAttribute('tabindex', k === 0 ? '0' : '-1'); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRoving);
  else initRoving();
  // Görgetéskor a buborék követi a szót; ha a szó kikerül a képből, eltűnik.
  const follow = () => {
    if (!current) return;
    const r = current.getBoundingClientRect();
    // A fókuszált szóhoz a böngésző éppen odagörget: azt ne zárjuk be, csak kövessük.
    if ((r.bottom < 0 || r.top > window.innerHeight) && document.activeElement !== current) hide();
    else show(current);
  };
  window.addEventListener('scroll', follow, { passive: true, capture: true });
  window.addEventListener('resize', follow);
})();
