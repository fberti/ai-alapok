(() => {
  /** @param {string} id */
  function element(id) {
    const el = document.getElementById(id);
    if (!el) throw Error(`Hiányzó elem: ${id}`);
    return el;
  }
  const initialFacts = ['a','b','c','d'];
  let facts = [...initialFacts];
  function renderRules() {
    element('rule-facts').textContent = `Tények: ${facts.join(', ')}.${facts.includes('g') ? ' A g cél igazolva.' : ''}`;
    document.querySelectorAll('button[data-rule]').forEach(button => {
      if (button instanceof HTMLButtonElement) button.disabled = !CourseRules.applicable(facts).some(rule => rule.id === button.dataset.rule);
    });
  }
  document.querySelectorAll('button[data-rule]').forEach(button => button.addEventListener('click', () => {
    if (button instanceof HTMLButtonElement) facts = CourseRules.apply(facts, button.dataset.rule || '');
    renderRules();
  }));
  element('rule-reset').addEventListener('click', () => {facts = [...initialFacts]; renderRules();});
  renderRules();

  const stages = ['Előzetes tudás és problématartomány feltárása','Információforrások azonosítása','Részletes tudás kinyerése','Elemzés, kódolás és dokumentálás'];
  let order = [1,0,3,2];
  /** @param {number} [focusStage] @param {number} [direction] */
  function renderOrder(focusStage, direction) {
    const list = element('process-order'); list.replaceChildren();
    order.forEach((stage, index) => {
      const item = document.createElement('li'); item.append(stages[stage]);
      const controls = document.createElement('div'); controls.className = 'lab-controls';
      [-1,1].forEach(delta => {
        const button = document.createElement('button'); button.type = 'button';
        button.textContent = delta === -1 ? 'Fel ↑' : 'Le ↓';
        button.setAttribute('aria-label', `${delta === -1 ? 'Fel' : 'Le'}: ${stages[stage]}`);
        button.disabled = index + delta < 0 || index + delta >= order.length;
        button.addEventListener('click', () => {
          [order[index],order[index+delta]] = [order[index+delta],order[index]];
          renderOrder(stage,delta);
          element('process-feedback').textContent = `${stages[stage]}: új helye ${index+delta+1}. Ellenőrizd a sorrendet.`;
        });
        controls.append(button);
        if (stage === focusStage && delta === direction && !button.disabled) button.dataset.restoreFocus = 'true';
      });
      item.append(controls); list.append(item);
    });
    const target = list.querySelector('[data-restore-focus]') || (focusStage !== undefined ? list.children[order.indexOf(focusStage)].querySelector('button:not(:disabled)') : null);
    if (target instanceof HTMLElement) target.focus();
  }
  element('process-check').addEventListener('click', () => {
    element('process-feedback').textContent = order.every((stage,index) => stage === index)
      ? 'Helyes sorrend! Előbb a területet határoljuk be, majd forrást keresünk, részletes tudást nyerünk ki és feldolgozzuk.'
      : 'Még nem jó a sorrend. Előbb a feladat körét tisztázd; az elemzés a részletes tudás kinyerése után jön.';
  });
  element('process-reset').addEventListener('click', () => {order = [1,0,3,2]; renderOrder(); element('process-feedback').textContent = 'A kezdő sorrend visszaállt.';});
  renderOrder(); element('process-feedback').textContent = 'Rendezd a négy lépést a Fel és Le gombbal.';

  /** @type {ReturnType<typeof setInterval> | undefined} */
  let timer;
  let position = 0;
  /** @type {string[]} */
  let forward = [];
  /** @type {string[]} */
  let backward = [];
  let proven = false;
  const stepButton = element('chain-step');
  function stop() {
    clearInterval(timer); timer = undefined;
    element('chain-play').textContent = 'Lejátszás';
    element('chain-play').setAttribute('aria-pressed','false');
  }
  function renderTrace() {
    for (const [id, steps] of /** @type {[string,string[]][]} */ ([['forward-trace',forward],['backward-trace',backward]])) {
      const list = element(id); list.replaceChildren();
      steps.slice(0,position).forEach(text => {const li = document.createElement('li'); li.textContent = text; list.append(li);});
    }
    const done = position >= Math.max(forward.length,backward.length);
    if (stepButton instanceof HTMLButtonElement) stepButton.disabled = done;
    const play = element('chain-play'); if (play instanceof HTMLButtonElement) play.disabled = done;
    element('chain-status').textContent = done ? `Mindkét eljárás véget ért: ${proven ? 'g igazolva' : 'g nem igazolható'}.` : `${position}. lépés. Folytasd a léptetéssel vagy a lejátszással.`;
    if (done) stop();
  }
  function resetTrace() {
    stop(); position = 0;
    const includeD = element('include-d');
    const input = includeD instanceof HTMLInputElement && includeD.checked ? initialFacts : ['a','b','c'];
    const forwardResult = CourseRules.forward(input);
    forward = [...forwardResult.steps, forwardResult.facts.includes('g') ? 'g: igazolva.' : 'g nem igazolható.'];
    const result = CourseRules.backward(input,'g');
    backward = result.steps.map(step => step.text); proven = result.proven;
    renderTrace();
  }
  function step() {position++; renderTrace();}
  stepButton.addEventListener('click', step);
  element('chain-play').addEventListener('click', () => {
    if (timer !== undefined) {stop(); return;}
    element('chain-play').textContent = 'Megállítás'; element('chain-play').setAttribute('aria-pressed','true');
    timer = setInterval(step,1000);
  });
  element('chain-reset').addEventListener('click',resetTrace);
  element('include-d').addEventListener('change',resetTrace);
  document.addEventListener('visibilitychange', () => {if (document.hidden) stop();});
  window.addEventListener('pagehide',stop);
  resetTrace();

  let conflictFacts = [...initialFacts];
  function renderConflict() {
    const available = CourseRules.applicable(conflictFacts);
    element('conflict-set').textContent = `Konfliktushalmaz: ${available.map(rule => rule.id).join(', ') || 'üres'}. Tények: ${conflictFacts.join(', ')}.`;
    document.querySelectorAll('button[data-conflict]').forEach(button => {
      if (button instanceof HTMLButtonElement) button.disabled = !available.some(rule => rule.id === button.dataset.conflict);
    });
  }
  document.querySelectorAll('button[data-conflict]').forEach(button => button.addEventListener('click', () => {
    if (!(button instanceof HTMLButtonElement)) return;
    const available = CourseRules.applicable(conflictFacts);
    const policy = element('conflict-policy');
    const expected = policy instanceof HTMLSelectElement && policy.value === 'priority'
      ? available.find(rule => rule.id === 'R2') || available[0] : available[0];
    if (!expected) return;
    if (button.dataset.conflict !== expected.id) {
      element('conflict-feedback').textContent = `A szabály alkalmazható, de a választott elv szerint most ${expected.id} következik. Nem változtak a tények.`;
      return;
    }
    conflictFacts = CourseRules.apply(conflictFacts,expected.id);
    element('conflict-feedback').textContent = `Helyes választás: ${expected.id}. Új tény: ${expected.then}.${expected.then === 'g' ? ' A célt elérted!' : ''}`;
    renderConflict();
  }));
  element('conflict-policy').addEventListener('change', () => {element('conflict-feedback').textContent = 'Az új elv a következő választásra érvényes. A tények nem változtak.';});
  element('conflict-reset').addEventListener('click', () => {conflictFacts = [...initialFacts]; renderConflict(); element('conflict-feedback').textContent = 'Válassz a konfliktushalmazból.';});
  renderConflict();

  const interview = [
    ['Előtte villámlás volt. Ilyenkor a port sérülése is felmerül.', 'K1: A döntés indokából feltételes szabály születik. Ez gyanú, nem biztos diagnózis.'],
    ['Előbb rögzítem a tüneteket és az eszköz típusát, majd kiválasztom a hozzá illő ellenőrzést.', 'K2: A nagy lépést kisebb eljárási lépésekre bontjuk. Saját oktatási kiegészítés.'],
    ['Nem mindig. Egy-két hibás billentyűnél előbb a helyi kontaktus hibáját vizsgálnám.', 'K3: A szabály érvényességi körét és kivételeit keressük. Saját oktatási kiegészítés.'],
    ['Előbb tisztázni kell, kettőnél több billentyű hibás-e. Egy-kettőnél a kontaktus is lehet ok.', 'K4: Más döntési út kerül elő. A következő K1 kérdéssel az indokát is feltárhatod.'],
    ['Ha nem volt villámlás, ez az indok kiesik. A hiba okát más adatokból keresném tovább.', 'K5: Megváltoztatunk egy feltételt. Nem állítjuk, hogy villámlás nélkül lehetetlen a port hibája. Saját oktatási kiegészítés.'],
    ['A port a gép csatlakozási pontja. A típusa és a használt adatátvitel is befolyásolja a vizsgálatot.', 'K6: Egy említett fogalmat bontunk ki, új párbeszédet nyitva. Saját oktatási kiegészítés.']
  ].map(([answer,effect]) => ({answer,effect}));
  document.querySelectorAll('button[data-interview]').forEach(button => button.addEventListener('click', () => {
    if (!(button instanceof HTMLButtonElement)) return;
    const response = interview[Number(button.dataset.interview)];
    if (!response) return;
    element('interview-answer').textContent = `Szakértő: ${response.answer}`;
    element('interview-effect').textContent = response.effect;
    document.querySelectorAll('[data-interview]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  }));
  element('interview-reset').addEventListener('click', () => {
    element('interview-answer').textContent = 'Melyik kérdésből lesz feltételes szabály?';
    element('interview-effect').textContent = 'A gomb alatt a kérdés hasznát is megmutatjuk.';
    document.querySelectorAll('[data-interview]').forEach(button => button.setAttribute('aria-pressed','false'));
  });
})();
