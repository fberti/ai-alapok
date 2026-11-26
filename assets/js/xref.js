/* =========================================================
   MI-alapok – kereszthivatkozások a jobb oldali sávban
   ---------------------------------------------------------
   Használat: a tartalmi hivatkozás kapja meg az `xref` osztályt:
     <a class="xref" href="09-neminformalt-kereses.html#szelessegi">9. fejezet</a>
     <a class="xref" href="#allathalo">az állatháló</a>   (ugyanazon az oldalon)
   Kattintásra a hivatkozott oldal a jobb oldali sávban nyílik meg,
   a hivatkozott részhez görgetve, kiemelve. A saját szöveg a helyén marad.
   Külső oldalra csak kivételesen tegyél `xref`-et (sok oldal tiltja a
   beágyazást); ilyenkor a sáv a ↗ gombbal új lapon is megnyitja.
   Ctrl/⌘/Shift/középső kattintás: a böngésző szokásos viselkedése.
   JavaScript nélkül a link sima link marad.
   A fejléc „Tartalom” gombja üresen nyitja a sávot: ott bármelyik fejezet
   és szakasza kiválasztható. A listát a kezdőlapból (`.chapter-list h3 > a`)
   és a fejezetek tartalomjegyzékéből (`nav.toc`) olvassa ki.
   Ötlet és szerkezet: a Synopsis `assets/xref.js` modulja.
   ========================================================= */
(() => {
  'use strict';

  const EMBEDDED = window.self !== window.top;
  const script = /** @type {HTMLScriptElement | null} */ (document.currentScript);
  // A tananyag gyökere (assets/js/../../): innen olvassuk a fejezetlistát.
  const BASE = new URL('../../', (script && script.src) || location.href).href;
  const WIDTH_KEY = 'mi-alapok-xref-width';
  const CAT_KEY = 'mi-alapok-xref-catalog';
  const root = document.documentElement;

  /** @param {() => void} fn */
  const ready = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());
  /** @param {() => void} fn */
  const loaded = (fn) => (document.readyState === 'complete' ? fn() : window.addEventListener('load', fn));
  /** @param {string} k */
  function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
  /** @param {string} k @param {string} v */
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch { /* nem baj */ } }
  /** @param {unknown} t */
  const clean = (t) => String(t || '').replace(/\s+/g, ' ').trim();
  /** @param {unknown} t */
  const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] || ch));
  /** @param {unknown} t */
  const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /** @param {string} theme */
  function applyTheme(theme) {
    const t = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = t;
    root.style.colorScheme = t;
  }

  /* ============ 1. Beágyazott nézet (az oldalsávban futó oldal) ============ */
  if (EMBEDDED) {
    root.classList.add('xref-embedded');

    const post = () => {
      try { window.parent.postMessage({ type: 'xref-loc', href: location.href, title: document.title }, '*'); } catch { /* nem baj */ }
    };

    const highlight = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      /** @type {Element | null} */
      let el = document.getElementById(id);
      if (!el) return;
      // A szakaszt a címével jelöljük ki, ne az egészet.
      if (el.tagName === 'SECTION') el = el.querySelector('h2, h3') || el;
      // Csukott lenyílóban lévő célt nyissuk ki.
      for (let p = el.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement) p.open = true;
      if (el instanceof HTMLDetailsElement) el.open = true;
      // scrollIntoView a gazdaoldalt is görgetné: csak a saját ablakunkat mozgatjuk.
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12, behavior: 'instant' });
      el.classList.remove('xref-target');
      void (/** @type {HTMLElement} */ (el).offsetWidth); // az animáció újraindítása
      el.classList.add('xref-target');
    };

    ready(() => { post(); highlight(); });
    // Az ábrák és a laborok betöltés után még tolják az elrendezést.
    loaded(() => setTimeout(highlight, 80));
    window.addEventListener('hashchange', () => { post(); highlight(); });

    window.addEventListener('message', (ev) => {
      const d = ev.data || {};
      if (d.type === 'xref-theme' && d.theme) applyTheme(d.theme);
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') window.parent.postMessage({ type: 'xref-close' }, '*');
    });
    // Az oldalsávban az xref linkek ugyanabban a sávban nyílnak (sima navigáció),
    // a külső linkek viszont új lapon, mert a legtöbb oldal nem engedi a beágyazást.
    document.addEventListener('click', (ev) => {
      const a = /** @type {Element} */ (ev.target).closest?.('a[href]');
      if (!(a instanceof HTMLAnchorElement)) return;
      if (a.origin !== location.origin && !a.target) a.target = '_blank';
    });
    return;
  }

  /* ============ 2. Gazdaoldal: az oldalsáv ============ */
  /** @type {HTMLElement} */ let panel;
  /** @type {HTMLIFrameElement} */ let frame;
  /** @type {HTMLElement} */ let titleEl;
  /** @type {HTMLAnchorElement} */ let openLink;
  /** @type {HTMLButtonElement} */ let backBtn;
  /** @type {HTMLElement} */ let browse;
  /** @type {HTMLElement} */ let note;
  /** @type {string[]} */ const history = [];
  /** @type {Element | null} */ let lastAnchor = null;

  function build() {
    panel = document.createElement('aside');
    panel.className = 'xref-panel';
    panel.setAttribute('aria-label', 'Hivatkozott rész');
    panel.hidden = true;
    panel.innerHTML =
      '<div class="xref-resize" title="Húzd a sáv szélességének állításához"></div>' +
      '<div class="xref-head">' +
      '<button type="button" class="xref-btn" data-xref-back title="Vissza" aria-label="Vissza" disabled>←</button>' +
      '<button type="button" class="xref-btn" data-xref-home title="Tartalom: válassz fejezetet" aria-label="Tartalom">☰</button>' +
      '<span class="xref-title">Hivatkozás</span>' +
      '<a class="xref-btn" data-xref-open target="_blank" rel="noopener" title="Megnyitás új lapon" aria-label="Megnyitás új lapon">↗</a>' +
      '<button type="button" class="xref-btn" data-xref-close title="Bezárás (Esc)" aria-label="Bezárás">✕</button>' +
      '</div>' +
      '<p class="xref-note" hidden>Külső oldal. Ha üres marad, az oldal nem engedi a beágyazást: nyisd meg új lapon a ↗ gombbal.</p>' +
      '<div class="xref-browse" hidden>' +
      '<input type="search" class="xref-search" placeholder="Keresés a fejezetek és szakaszok között…" aria-label="Keresés a fejezetek és szakaszok között">' +
      '<div class="xref-cat"><p class="xref-muted">Betöltés…</p></div>' +
      '</div>' +
      '<iframe class="xref-frame" title="Hivatkozott rész" allow="fullscreen"></iframe>';
    document.body.appendChild(panel);
    frame = /** @type {HTMLIFrameElement} */ (panel.querySelector('iframe'));
    titleEl = /** @type {HTMLElement} */ (panel.querySelector('.xref-title'));
    openLink = /** @type {HTMLAnchorElement} */ (panel.querySelector('[data-xref-open]'));
    backBtn = /** @type {HTMLButtonElement} */ (panel.querySelector('[data-xref-back]'));
    browse = /** @type {HTMLElement} */ (panel.querySelector('.xref-browse'));
    note = /** @type {HTMLElement} */ (panel.querySelector('.xref-note'));
    panel.querySelector('[data-xref-home]')?.addEventListener('click', showBrowser);
    panel.querySelector('[data-xref-close]')?.addEventListener('click', close);
    browse.querySelector('.xref-search')?.addEventListener('input', (ev) => filterCatalog(/** @type {HTMLInputElement} */ (ev.target).value));
    browse.addEventListener('click', onBrowseClick);
    backBtn.addEventListener('click', () => {
      if (!browse.hidden && history.length) return load(history[history.length - 1], false);
      if (history.length < 2) return;
      history.pop();
      load(history[history.length - 1], false);
    });
    frame.addEventListener('load', sendTheme);

    const w = parseInt(safeGet(WIDTH_KEY) || '', 10);
    if (w) root.style.setProperty('--xref-w', w + 'px');
    resizer(/** @type {HTMLElement} */ (panel.querySelector('.xref-resize')));
  }

  /** @param {HTMLElement} handle */
  function resizer(handle) {
    handle.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      handle.setPointerCapture(ev.pointerId);
      root.classList.add('xref-resizing');
      /** @param {PointerEvent} e */
      const move = (e) => {
        const w = Math.min(Math.max(window.innerWidth - e.clientX, 320), window.innerWidth - 360);
        root.style.setProperty('--xref-w', w + 'px');
        fitLayout();
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        root.classList.remove('xref-resizing');
        safeSet(WIDTH_KEY, String(parseInt(getComputedStyle(panel).width, 10)));
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  /* Ha a sáv mellett szűk a hely, a fejezet tartalomjegyzékét elrejtjük. */
  function fitLayout() {
    const open = panel && !panel.hidden;
    const rest = window.innerWidth - (open ? panel.getBoundingClientRect().width : 0);
    root.classList.toggle('xref-narrow', !!open && rest < 1080);
  }
  window.addEventListener('resize', () => { if (panel) fitLayout(); });

  function sendTheme() {
    try { frame.contentWindow?.postMessage({ type: 'xref-theme', theme: root.dataset.theme }, '*'); } catch { /* nem baj */ }
  }

  /** @param {string} href */
  const isExternal = (href) => new URL(href, location.href).origin !== location.origin ||
    (location.protocol === 'file:' && !href.startsWith('file:'));

  /** @param {string} href @param {boolean} [push] */
  function load(href, push) {
    if (push !== false) history.push(href);
    backBtn.disabled = history.length < 2;
    browse.hidden = true;
    frame.hidden = false;
    openLink.hidden = false;
    openLink.href = href;
    note.hidden = !isExternal(href);
    frame.src = href;
  }

  /* A sáv nyitása és zárása átrendezi a fő szöveget:
     a kattintott elem maradjon ugyanott a képernyőn. */
  /** @param {Element | null} anchor @param {() => void} change */
  function keepInView(anchor, change) {
    const el = anchor && anchor.isConnected ? anchor : null;
    const before = el ? el.getBoundingClientRect().top : 0;
    root.style.overflowAnchor = 'none';
    root.style.scrollBehavior = 'auto';
    change();
    if (el) window.scrollBy(0, el.getBoundingClientRect().top - before);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.style.scrollBehavior = '';
      root.style.overflowAnchor = '';
    }));
  }

  function topElement() {
    const main = document.querySelector('main') || document.body;
    return document.elementFromPoint(main.getBoundingClientRect().left + 40, 120);
  }

  /** @param {Element | null} anchor */
  function showPanel(anchor) {
    if (!panel.hidden) return;
    keepInView(anchor, () => {
      panel.hidden = false;
      root.classList.add('xref-open');
      fitLayout();
    });
  }

  /** @param {string} href @param {string} label @param {Element | null} anchor */
  function open(href, label, anchor) {
    if (!panel) build();
    titleEl.textContent = label || 'Hivatkozás';
    lastAnchor = anchor;
    showPanel(anchor);
    load(href);
  }

  function close() {
    if (!panel || panel.hidden) return;
    const r = lastAnchor && lastAnchor.isConnected ? lastAnchor.getBoundingClientRect() : null;
    const a = r && r.top > 0 && r.top < innerHeight ? lastAnchor : topElement();
    keepInView(a, () => {
      panel.hidden = true;
      root.classList.remove('xref-open', 'xref-narrow');
    });
    if (lastAnchor instanceof HTMLElement) lastAnchor.focus({ preventScroll: true });
  }

  /* ---------- Tartalom: fejezetek és szakaszok böngészése ---------- */
  /** @typedef {{num: string, title: string, url: string, sections?: {title: string, url: string}[]}} Chapter */
  /** @type {Chapter[] | null} */ let catalog = null;
  /** @type {Promise<void> | null} */ let catalogLoading = null;

  /** @param {string} url */
  async function fetchDoc(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status + ' ' + url);
    return new DOMParser().parseFromString(await r.text(), 'text/html');
  }

  async function buildCatalog() {
    const home = await fetchDoc(BASE + 'index.html');
    /** @type {Chapter[]} */
    const chapters = [...home.querySelectorAll('.chapter-list h3 > a[href]')].map((a) => {
      const li = a.closest('li');
      const num = li && li.querySelector('.chapter-number');
      return {
        num: num ? clean(num.textContent) : '',
        title: clean(a.textContent).replace(/\s*↗$/, ''),
        url: new URL(/** @type {string} */ (a.getAttribute('href')), BASE).href,
      };
    });
    chapters.push({ num: '', title: 'Fogalomtár', url: BASE + 'fogalomtar.html' });
    await Promise.all(chapters.map(async (c) => {
      try {
        const doc = await fetchDoc(c.url);
        c.sections = [...doc.querySelectorAll("nav.toc a[href^='#']")]
          .map((a) => ({ title: clean(a.textContent), url: c.url + a.getAttribute('href') }));
      } catch { c.sections = []; }
    }));
    return chapters;
  }

  function loadCatalog() {
    if (catalog) return renderCatalog();
    if (catalogLoading) return;
    try {
      const c = JSON.parse(sessionStorage.getItem(CAT_KEY) || 'null');
      if (c && Date.now() - c.at < 10 * 60 * 1000) { catalog = c.chapters; return renderCatalog(); }
    } catch { /* nem baj */ }
    catalogLoading = buildCatalog().then((chapters) => {
      catalog = chapters;
      try { sessionStorage.setItem(CAT_KEY, JSON.stringify({ at: Date.now(), chapters })); } catch { /* nem baj */ }
      renderCatalog();
    }).catch(() => {
      const cat = browse.querySelector('.xref-cat');
      if (cat) cat.innerHTML = '<p class="xref-muted">A tartalom nem tölthető be. Helyi fájlként megnyitva a böngésző tiltja; ' +
        'indítsd egy helyi szerverrel (<code>python3 -m http.server</code>), vagy nyisd meg a GitHub Pages-oldalt.</p>';
    }).finally(() => { catalogLoading = null; });
  }

  const here = () => location.href.split('#')[0];

  function renderCatalog() {
    if (!catalog) return;
    const cur = here();
    const html = catalog.map((c) => {
      const secs = (c.sections || []).map((s) =>
        '<li data-q="' + esc(norm(s.title)) + '"><a href="' + esc(s.url) + '" data-pick>' + esc(s.title) + '</a></li>').join('');
      return '<details class="xref-chapter' + (cur === c.url ? ' current' : '') + '"' + (cur === c.url ? ' open' : '') +
        ' data-q="' + esc(norm(c.num + ' ' + c.title)) + '">' +
        '<summary>' + (c.num ? '<span class="xref-num">' + esc(c.num) + '</span> ' : '') + esc(c.title) + '</summary>' +
        '<p class="xref-whole"><a href="' + esc(c.url) + '" data-pick>A fejezet eleje</a></p>' +
        (secs ? '<ol>' + secs + '</ol>' : '') + '</details>';
    }).join('');
    const cat = browse.querySelector('.xref-cat');
    if (cat) cat.innerHTML = html;
    const q = /** @type {HTMLInputElement} */ (browse.querySelector('.xref-search')).value;
    if (q) filterCatalog(q);
  }

  /** @param {string} q */
  function filterCatalog(q) {
    const n = norm(q.trim());
    browse.querySelectorAll('.xref-chapter').forEach((node) => {
      const d = /** @type {HTMLDetailsElement} */ (node);
      const chapterHit = !!n && (d.dataset.q || '').includes(n);
      let any = false;
      d.querySelectorAll('ol > li').forEach((li) => {
        const hit = !n || chapterHit || (/** @type {HTMLElement} */ (li).dataset.q || '').includes(n);
        /** @type {HTMLElement} */ (li).hidden = !hit;
        if (hit) any = true;
      });
      d.hidden = !!n && !any && !chapterHit;
      d.open = n ? any || chapterHit : d.classList.contains('current');
    });
  }

  /** @param {Event} ev */
  function onBrowseClick(ev) {
    const me = /** @type {MouseEvent} */ (ev);
    const a = /** @type {Element} */ (ev.target).closest('a[data-pick]');
    if (!(a instanceof HTMLAnchorElement) || me.button !== 0 || me.ctrlKey || me.metaKey || me.shiftKey || me.altKey) return;
    ev.preventDefault();
    titleEl.textContent = clean(a.textContent);
    load(a.href);
  }

  function showBrowser() {
    if (!panel) build();
    if (panel.hidden) { lastAnchor = null; showPanel(topElement()); }
    browse.hidden = false;
    frame.hidden = true;
    openLink.hidden = true;
    note.hidden = true;
    titleEl.textContent = 'Tartalom';
    backBtn.disabled = history.length === 0;
    loadCatalog();
    const inp = /** @type {HTMLInputElement} */ (browse.querySelector('.xref-search'));
    if (window.innerWidth > 900) setTimeout(() => inp.focus(), 0);
  }

  function toggleBrowser() {
    if (panel && !panel.hidden && !browse.hidden) close();
    else showBrowser();
  }

  ready(() => {
    const bar = document.querySelector('.site-header .header-actions');
    if (!bar || bar.querySelector('[data-xref-browse]')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'xref-open-btn';
    b.setAttribute('data-xref-browse', '');
    b.title = 'Másik fejezet megnyitása az oldalsávban (párhuzamos olvasás)';
    b.innerHTML = '<span aria-hidden="true">◧</span> <span class="xref-open-label">Oldalsáv</span>';
    b.addEventListener('click', toggleBrowser);
    bar.insertBefore(b, bar.querySelector('[data-theme-toggle]'));
  });

  document.addEventListener('click', (ev) => {
    const a = /** @type {Element} */ (ev.target).closest?.('a.xref');
    if (!(a instanceof HTMLAnchorElement) || ev.defaultPrevented) return;
    if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    open(a.href, clean(a.dataset.xrefTitle || a.textContent), a);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && panel && !panel.hidden) close();
  });

  window.addEventListener('message', (ev) => {
    if (!frame || ev.source !== frame.contentWindow) return;
    const d = ev.data || {};
    if (d.type === 'xref-close') close();
    if (d.type === 'xref-loc') {
      titleEl.textContent = clean(String(d.title || '').split(' | ')[0]) || titleEl.textContent;
      openLink.href = d.href;
      if (history[history.length - 1] !== d.href) { history.push(d.href); backBtn.disabled = history.length < 2; }
    }
  });

  // Téma váltásakor az oldalsáv is kövesse.
  new MutationObserver(() => { if (frame) sendTheme(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /** @type {any} */ (window).MiXref = { open, close, showBrowser };
})();
