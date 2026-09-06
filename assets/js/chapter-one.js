(() => {
  /** @type {Record<string, string>} */
  const cases = {
    thermostat:'Termosztát: érzékeli a hőmérsékletet és kapcsol. Ez automatizálás. A rögzített küszöb önmagában nem tanulás.',
    chess:'Klasszikus sakkprogram: szabályok és keresés alapján választ lépést. Emberi ellenfélnek tűnhet, de nem kell úgy gondolkodnia vagy tanulnia, mint egy embernek.',
    spam:'Tanuló spamszűrő: a megjelölt levelekből módosítja a döntési mintáját. Ez adatból tanulás. Nem szükséges hozzá emberi párbeszéd vagy tudat.',
    calculator:'Számológép: gyorsan hajt végre rögzített műveleteket. A gyors számolás önmagában nem általános intelligencia.'
  };
  /** @type {Record<string, string>} */
  const meanings = {
    syntax:'Szintaxis: hogyan épül fel? Múlt idejű állítmány és tárgy. A nyelvtani szerkezetet vizsgáljuk.',
    semantics:'Szó szerinti olvasat: valaki felhajította a lábbelijét. A tanult átvitt jelentés is a szemantika része lehet: „meghalt”.',
    pragmatics:'Helyzetbeli jelentés: a tüdőrákról szóló beszélgetésben halálhírként értjük. A környezet segít, nem cipődobásról beszélnek.',
    intention:'Szándék: Éva talán arra akarja figyelmeztetni Imrét, hogy ne dohányozzon annyit. Ez értelmezés, nem biztosan ismert belső gondolat.'
  };
  /** @param {string} attribute @param {string} outputId @param {Record<string,string>} values */
  function bindChoices(attribute, outputId, values) {
    const buttons = document.querySelectorAll(`button[${attribute}]`);
    const output = document.getElementById(outputId);
    buttons.forEach(button => button.addEventListener('click', () => {
      const key = button.getAttribute(attribute) || '';
      if (!output || !(key in values)) return;
      output.textContent = values[key];
      buttons.forEach(other => other.setAttribute('aria-pressed',String(other === button)));
    }));
  }
  bindChoices('data-case','case-feedback',cases);
  bindChoices('data-meaning','meaning-feedback',meanings);
  document.querySelectorAll('[data-turing]').forEach(button => button.addEventListener('click', () => {
    const output = document.getElementById('turing-feedback');
    if (!output) return;
    const choice = button.getAttribute('data-turing');
    output.textContent = choice === 'neither' ?
      'Jó óvatosság! Ebből nem lehet megállapítani a szerzőt. Mindkét választ előre írtuk. Egy gép lehet laza, egy ember lehet tárgyilagos. Ez a bemutató nem valódi Turing-teszt.' :
      `A(z) ${choice} válasza emberibbnek tűnhet neked. De ez csak stílusítélet: mindkét mondat szerkesztett példa. Nincs leleplezhető ember–gép páros. A hangvétel önmagában nem bizonyítja a tudatot.`;
  }));
  const layers = document.querySelectorAll('input[data-layer]');
  layers.forEach(input => input.addEventListener('change', () => {
    if (!(input instanceof HTMLInputElement)) return;
    const layer = document.getElementById(`vision-${input.dataset.layer}`);
    if (layer) {
      if (input.checked) layer.removeAttribute('hidden'); else layer.setAttribute('hidden','');
    }
    const count = [...layers].filter(item => item instanceof HTMLInputElement && item.checked).length;
    const output = document.getElementById('vision-feedback');
    if (output) output.textContent = count ? `${count}/5 magyarázó réteg bekapcsolva. A rajz becslési lépéseket szemléltet, nem valódi képfelismerést.` : 'Még nincs magyarázó réteg bekapcsolva.';
  }));
  const filter = document.getElementById('app-filter');
  if (filter instanceof HTMLSelectElement) filter.addEventListener('change', () => {
    let count = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      if (!(card instanceof HTMLElement)) return;
      card.hidden = filter.value !== 'all' && card.dataset.category !== filter.value;
      if (!card.hidden) count++;
    });
    const output = document.getElementById('app-count');
    if (output) output.textContent = `${count} alkalmazási kártya.`;
  });
})();
