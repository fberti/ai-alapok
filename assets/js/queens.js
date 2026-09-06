// Classic script modules also work when the HTML is opened from disk.
const Queens = (() => {
  /** @param {number[]} cells */
  function evaluateBoard(cells) {
    const conflicts = new Set();
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const row = Math.floor(cells[i] / 8) - Math.floor(cells[j] / 8);
        const col = cells[i] % 8 - cells[j] % 8;
        if (row === 0 || col === 0 || Math.abs(row) === Math.abs(col)) {
          conflicts.add(cells[i]); conflicts.add(cells[j]);
        }
      }
    }
    return {count: cells.length, conflicts: [...conflicts], solved: cells.length === 8 && conflicts.size === 0};
  }
  /** @param {number[]} cells @param {number} cell */
  function toggleQueen(cells, cell) {
    if (!Number.isInteger(cell) || cell < 0 || cell > 63) return [...cells];
    if (cells.includes(cell)) return cells.filter(value => value !== cell);
    return cells.length < 8 ? [...cells, cell] : [...cells];
  }
  function mount() {
    const board = document.getElementById('queens-board');
    const status = document.getElementById('queens-status');
    if (!board || !status) return;
    /** @type {number[]} */
    let cells = [];
    const buttons = Array.from({length:64}, (_, cell) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.toggle('dark', (Math.floor(cell / 8) + cell % 8) % 2 === 1);
      button.tabIndex = cell === 0 ? 0 : -1;
      button.addEventListener('click', () => {
        const full = cells.length === 8 && !cells.includes(cell);
        cells = toggleQueen(cells, cell);
        render();
        if (full) status.textContent += ' Már nyolc vezér van a táblán. Előbb vegyél le egyet.';
      });
      button.addEventListener('focus', () => buttons.forEach(b => b.tabIndex = b === button ? 0 : -1));
      button.addEventListener('keydown', event => {
        const row = Math.floor(cell / 8), col = cell % 8;
        /** @type {Record<string, number>} */
        const moves = {ArrowRight:row * 8 + (col + 1) % 8, ArrowLeft:row * 8 + (col + 7) % 8,
          ArrowDown:((row + 1) % 8) * 8 + col, ArrowUp:((row + 7) % 8) * 8 + col,
          Home:row * 8, End:row * 8 + 7};
        if (event.key in moves) {event.preventDefault(); buttons[moves[event.key]].focus();}
      });
      board.append(button);
      return button;
    });
    function render() {
      const result = evaluateBoard(cells);
      buttons.forEach((button, cell) => {
        const occupied = cells.includes(cell), conflict = result.conflicts.includes(cell);
        button.textContent = occupied ? '♛' : '';
        button.setAttribute('aria-pressed', String(occupied));
        button.setAttribute('aria-label', `${Math.floor(cell / 8) + 1}. sor, ${cell % 8 + 1}. oszlop: ${occupied ? 'vezér' : 'üres'}${conflict ? ', ütközés' : ''}`);
        button.classList.toggle('conflict', conflict);
      });
      if (status) status.textContent = result.solved ? 'Megoldva! Mind a 8 vezér biztonságban van.' :
        `${result.count}/8 vezér. ${result.conflicts.length ? result.conflicts.length + ' vezér ütközik másikkal.' : 'Nincs ütközés.'}`;
    }
    document.getElementById('queens-reset')?.addEventListener('click', () => {cells = []; render();});
    document.getElementById('queens-solution')?.addEventListener('click', () => {cells = [0,12,23,29,34,46,49,59]; render();});
    render();
  }
  return {evaluateBoard, toggleQueen, mount};
})();
if (typeof module !== 'undefined') module.exports = Queens;
if (typeof document !== 'undefined') Queens.mount();
