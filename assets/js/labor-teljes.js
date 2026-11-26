/* =========================================================
   MI-alapok – laborok teljes méretben
   ---------------------------------------------------------
   Minden `.u-lab` labor jobb felső sarkába „Teljes méret” gombot tesz.
   A gomb a böngésző teljes képernyős módjába (Fullscreen API) viszi a
   labort; ahol ez nem érhető el (például iPhone Safari), a labor a teljes
   ablakot kitölti (`.lab-full` osztály). Kilépés: ugyanaz a gomb vagy Esc.
   Teljes méretben a labor `.u-panel` paneljei egymás mellé rendeződnek
   (course.css), így egy hosszú labor is egyszerre áttekinthető.
   JavaScript nélkül a gomb nem jelenik meg, a labor a szokásos helyén marad.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const canNative = !!(document.fullscreenEnabled && root.requestFullscreen);
  /** @type {HTMLElement | null} */
  let fallbackLab = null;

  /** @param {HTMLElement} lab */
  const isFull = (lab) => document.fullscreenElement === lab || fallbackLab === lab;

  /** @param {HTMLElement} lab */
  function sync(lab) {
    const btn = /** @type {HTMLButtonElement | null} */ (lab.querySelector(':scope > .lab-full-btn'));
    if (!btn) return;
    const on = isFull(lab);
    const name = lab.querySelector('.u-lab-label, h3');
    const label = name ? (name.textContent || '').split('/').pop().trim().toLowerCase() : 'labor';
    btn.setAttribute('aria-label', on ? 'Kilépés a teljes méretből: ' + label : 'Teljes méret: ' + label);
    btn.title = on ? 'Kilépés a teljes méretből (Esc)' : 'A labor megnyitása teljes méretben';
    btn.innerHTML = on
      ? '<span aria-hidden="true">✕</span> Kilépés'
      : '<span aria-hidden="true">⛶</span> Teljes méret';
    lab.classList.toggle('lab-is-full', on);
    arrange(lab, on);
  }

  /* Teljes méretben a rajzos panelek (térkép, fa, grafikon) jobbra, nagyba
     kerülnek, a vezérlők és a szöveges panelek balra, egy ragadós oszlopba.
     Kilépéskor minden elem visszakerül az eredeti sorrendjébe. A csomópontok
     áthelyezése megtartja az eseménykezelőiket, a labor kódja nem veszi észre. */
  /** @type {WeakMap<HTMLElement, {box: HTMLElement, order: ChildNode[], side: HTMLElement, main: HTMLElement}>} */
  const split = new WeakMap();
  /** @param {HTMLElement} lab @param {boolean} on */
  function arrange(lab, on) {
    const done = split.get(lab);
    if (!on) {
      if (!done) return;
      done.order.forEach((n) => done.box.appendChild(n));
      done.side.remove();
      done.main.remove();
      done.box.classList.remove('lab-split');
      split.delete(lab);
      return;
    }
    if (done) return;
    const box = /** @type {HTMLElement | null} */ (lab.querySelector(':scope > .u-js-only'));
    if (!box) return;
    const visual = [...box.children].filter((c) => c.classList.contains('u-panel') && c.querySelector('svg, canvas, .u-scroll'));
    if (!visual.length) return;
    const order = [...box.childNodes];
    const side = document.createElement('div');
    side.className = 'lab-split-side';
    const main = document.createElement('div');
    main.className = 'lab-split-main' + (visual.length > 1 ? ' lab-split-many' : '');
    order.forEach((n) => (n instanceof Element && visual.includes(n) ? main : side).appendChild(n));
    box.append(side, main);
    box.classList.add('lab-split');
    split.set(lab, { box, order, side, main });
  }

  /** @param {HTMLElement} lab */
  function enterFallback(lab) {
    fallbackLab = lab;
    lab.classList.add('lab-full');
    root.classList.add('lab-full-open');
    lab.scrollTop = 0;
    sync(lab);
  }

  function exitFallback() {
    const lab = fallbackLab;
    if (!lab) return;
    fallbackLab = null;
    lab.classList.remove('lab-full');
    root.classList.remove('lab-full-open');
    sync(lab);
    lab.scrollIntoView({ block: 'start' });
  }

  /** @param {HTMLElement} lab */
  async function toggle(lab) {
    if (isFull(lab)) {
      if (fallbackLab === lab) exitFallback();
      else await document.exitFullscreen().catch(() => {});
      sync(lab);
      return;
    }
    if (canNative) {
      try {
        await lab.requestFullscreen({ navigationUI: 'hide' });
        sync(lab);
        return;
      } catch {
        // Ha a böngésző megtagadja (például beágyazott oldalon), marad a teljes ablak.
      }
    }
    enterFallback(lab);
  }

  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('.u-lab').forEach((lab) => sync(/** @type {HTMLElement} */ (lab)));
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && fallbackLab) {
      ev.stopPropagation();
      const btn = /** @type {HTMLElement | null} */ (fallbackLab.querySelector(':scope > .lab-full-btn'));
      exitFallback();
      btn?.focus();
    }
  }, true);

  function init() {
    document.querySelectorAll('.u-lab').forEach((node) => {
      const lab = /** @type {HTMLElement} */ (node);
      if (lab.querySelector(':scope > .lab-full-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lab-full-btn';
      btn.addEventListener('click', () => toggle(lab));
      lab.prepend(btn);
      sync(lab);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
