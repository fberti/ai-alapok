const CourseProgress = (() => {
  const key = 'ai-alapok:chapter-1:complete';
  /** @param {Pick<Storage, 'getItem'> | null} store */
  function readProgress(store) {
    try {return store?.getItem(key) === 'true';} catch {return false;}
  }
  /** @param {Pick<Storage, 'setItem' | 'removeItem'> | null} store @param {boolean} complete */
  function writeProgress(store, complete) {
    if (!store) return false;
    try {if (complete) store.setItem(key,'true'); else store.removeItem(key); return true;} catch {return false;}
  }
  function mount() {
    /** @type {Storage | null} */
    let store = null;
    try {store = window.localStorage;} catch { /* Reading remains available. */ }
    let complete = readProgress(store);
    const buttons = document.querySelectorAll('[data-progress-toggle]');
    const labels = document.querySelectorAll('[data-progress-label]');
    /** @param {boolean} [saved] */
    function render(saved = true) {
      buttons.forEach(button => {
        button.setAttribute('aria-pressed',String(complete));
        button.textContent = complete ? 'Kész jelölés törlése' : 'Késznek jelölöm a fejezetet';
      });
      labels.forEach(label => label.textContent = `Saját haladás: ${complete ? 'késznek jelölve.' : 'nincs késznek jelölve.'}${saved ? '' : ' A böngésző nem engedte a mentést. A jelölés csak most él.'}`);
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      complete = !complete; render(writeProgress(store,complete));
    }));
    window.addEventListener('storage', event => {if (event.key === key || event.key === null) {complete = readProgress(store); render();}});
    render();
  }
  return {readProgress, writeProgress, mount};
})();
if (typeof module !== 'undefined') module.exports = CourseProgress;
if (typeof document !== 'undefined') CourseProgress.mount();
