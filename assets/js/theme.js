(() => {
  const storageKey = 'mi-alapok-theme';
  const root = document.documentElement;

  function savedTheme() {
    try {
      return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  /**
   * @param {unknown} theme
   * @param {boolean} [save]
   */
  function setTheme(theme, save = false) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;

    /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('button[data-theme-toggle]')).forEach((button) => {
      const isDark = nextTheme === 'dark';
      button.setAttribute('aria-checked', String(isDark));
      button.title = isDark ? 'Világos téma bekapcsolása' : 'Sötét téma bekapcsolása';
    });

    const themeColor = /** @type {HTMLMetaElement | null} */ (document.querySelector('meta[name="theme-color"]'));
    if (themeColor) themeColor.content = nextTheme === 'dark' ? '#121815' : '#f6f3eb';

    if (save) {
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // The theme still works when the browser blocks local storage.
      }
    }
  }

  setTheme(savedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    setTheme(root.dataset.theme);
    /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('button[data-theme-toggle]')).forEach((button) => {
      button.addEventListener('click', () => {
        setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
      });
    });
  });

  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) setTheme(event.newValue);
  });
})();
