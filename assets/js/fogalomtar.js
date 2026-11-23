// Fogalomtár: azonnali szűrés a fogalmak, fejezetek és szakaszok között, ékezetektől függetlenül.
(() => {
  /** @param {string} s */
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  document.addEventListener('DOMContentLoaded', () => {
    const input = /** @type {HTMLInputElement|null} */ (document.getElementById('g-kereso'));
    const status = document.getElementById('g-talalat');
    if (!input || !status) return;
    const box = input, out = status;
    /** @param {ParentNode} root @param {string} sel @returns {HTMLElement[]} */
    const all = (root, sel) => /** @type {HTMLElement[]} */ ([...root.querySelectorAll(sel)]);
    /** @param {Element} e @param {string[]} words */
    const hit = (e, words) => { const k = norm(/** @type {HTMLElement} */ (e).dataset.kereses || ''); return words.every((w) => k.includes(w)); };
    function filter() {
      const words = norm(box.value.trim()).split(/\s+/).filter(Boolean);
      let terms = 0, sections = 0;
      all(document, '.g-chapter-list > li').forEach((ch) => {
        const own = hit(ch, words);
        let shown = 0;
        all(ch, '.g-sections > li').forEach((s) => {
          const ok = own || hit(s, words);
          s.hidden = !ok;
          if (ok && words.length && !own) shown += 1;
        });
        ch.hidden = !own && shown === 0;
        sections += shown;
      });
      all(document, '.g-chapter').forEach((sec) => {
        let n = 0;
        all(sec, '.g-terms > li').forEach((li) => { const ok = hit(li, words); li.hidden = !ok; if (ok) n += 1; });
        sec.hidden = n === 0;
        terms += n;
      });
      out.textContent = words.length ? `${terms} fogalom és ${sections} szakasz felel meg a keresésnek.` : '';
    }
    input.addEventListener('input', filter);
    const q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; filter(); }
  });
})();
