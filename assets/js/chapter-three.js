(() => {
  const model = CourseRepresentation;
  /** @param {string} id */
  function element(id) {
    const el = document.getElementById(id);
    if (!el) throw Error(`Hiányzó elem: ${id}`);
    return el;
  }
  /** @param {string} id */
  function control(id) {
    const el = element(id);
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) throw Error(`Hiányzó mező: ${id}`);
    return el;
  }
  let graph = model.network();
  function queryNetwork() {
    const name = control('network-query').value, route = model.path(graph,name,'Állat');
    element('network-answer').textContent = `${route ? route.join(' → ') : 'Nincs út az Állat osztályhoz.'} Jellemzők: ${model.properties(graph,name).join('; ') || 'nincs ismert jellemző'}.`;
  }
  function renderNetwork() {
    const list = element('network-edges'); list.replaceChildren();
    graph.edges.forEach((edge,index) => {
      const item = document.createElement('li'), text = document.createElement('span'), button = document.createElement('button');
      text.textContent = `${edge.from} — ${edge.relation} → ${edge.to}`;
      button.type = 'button'; button.textContent = 'Törlés';
      button.setAttribute('aria-label',`Törlés: ${edge.from} ${edge.relation} ${edge.to}`);
      button.addEventListener('click', () => {
        model.removeEdge(graph,index); renderNetwork();
        element('network-status').textContent = 'Él törölve. Az örökölt jellemzőket újraszámoltuk.';
        const next = list.querySelectorAll('button')[Math.min(index,graph.edges.length-1)];
        (next || element('network-reset')).focus();
      });
      item.append(text,button); list.append(item);
    });
    const select = control('network-query'), previous = select.value;
    select.replaceChildren(); element('network-names').replaceChildren();
    Object.keys(graph.nodes).forEach(name => {
      const option = document.createElement('option'); option.value = name; option.textContent = name;
      select.append(option); element('network-names').append(option.cloneNode(true));
    });
    if (Object.hasOwn(graph.nodes,previous)) select.value = previous;
    queryNetwork();
  }
  element('network-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      model.addEdge(graph, control('network-from').value, control('network-relation').value, control('network-to').value);
      renderNetwork(); element('network-status').textContent = 'Él hozzáadva. Válaszd ki a vizsgált csomópontot.';
    } catch (error) {element('network-status').textContent = error instanceof Error ? error.message : 'Az él nem adható hozzá.';}
  });
  control('network-query').addEventListener('change',queryNetwork);
  element('network-reset').addEventListener('click', () => {
    graph = model.network(); renderNetwork();
    control('network-from').value = 'Csipike'; control('network-to').value = 'Veréb'; control('network-relation').value = 'instance_of';
    element('network-status').textContent = 'Az eredeti háló visszaállt.';
  });
  renderNetwork();
  element('network-status').textContent = 'A háló készen áll. Adj hozzá élt, vagy válassz csomópontot.';

  const bird = element('bird-exception');
  function renderConflict() {
    const exception = bird instanceof HTMLInputElement && bird.checked;
    element('bird-answer').textContent = `Repülhet: ${model.flight(exception)}. ${exception ? 'Pityuka helyi kivétele felülírja a Madár alapértékét.' : 'Csak a Madár alapértékét használjuk; ez nem bizonyíték a tényleges repülésre.'}`;
    const policy = control('insurance-policy').value;
    const reasons = {none:'Két szigorú ág ellentétes értéket ad. A rajz nem választ.', default:'Az Autó visszavonható alapértékét a szigorú kaszkadőreszköz-tiltás felülírja.', car:'A kijelölt elsőbbség az Autó ágát választja.', stunt:'A kijelölt elsőbbség a Kaszkadőreszköz ágát választja.'};
    element('insurance-answer').textContent = `Biztosítása lehet: ${model.insurance(policy)}. ${reasons[/** @type {keyof typeof reasons} */ (policy)]}`;
  }
  bird.addEventListener('change',renderConflict);
  control('insurance-policy').addEventListener('change',renderConflict);
  element('conflict-reset').addEventListener('click', () => {
    if (bird instanceof HTMLInputElement) bird.checked = true;
    control('insurance-policy').value = 'none'; renderConflict();
  });
  renderConflict();

  let ownHeight = '';
  function renderFrame() {
    const input = control('frame-height');
    try {
      if (input instanceof HTMLInputElement && input.validity.badInput) throw Error('A magasság legyen szám.');
      const result = model.frame(control('frame-kind').value,input.value);
      element('frame-answer').textContent = `Magasság: ${result.height === null ? 'nincs megadva' : result.height.toLocaleString('hu-HU') + ' m'} (${result.source}). Anyag: ${result.material}; lábszám: ${result.legs}; szín: ${result.color}; funkció: ${result.purpose}.`;
      input.setAttribute('aria-invalid','false');
      const next = input.value;
      element('frame-event').textContent = next === ownHeight ? 'A keret adatait az öröklési láncból olvastuk.' : !next ? 'IF_DELETED: a saját érték törölve; ismét öröklünk.' : !ownHeight ? 'IF_ADDED: saját érték felvéve.' : 'IF_MODIFIED: a saját érték megváltozott.';
      ownHeight = next;
    } catch (error) {
      input.setAttribute('aria-invalid','true');
      element('frame-answer').textContent = error instanceof Error ? error.message : 'Hibás magasság.';
      element('frame-event').textContent = 'Az ellenőrzés elutasította az új értéket. Javítsd vagy töröld.';
    }
  }
  control('frame-height').addEventListener('input',renderFrame);
  control('frame-kind').addEventListener('change',renderFrame);
  element('frame-reset').addEventListener('click', () => {control('frame-height').value = ''; renderFrame();});
  renderFrame();

  const sliders = ['case-height','case-seats','weight-height','weight-seats'];
  function renderCases() {
    const values = sliders.map(id => Number(control(id).value));
    sliders.forEach((id,i) => {element(`${id}-value`).textContent = `${values[i]}${i === 0 ? ' cm' : ''}`;});
    const results = model.rankCases(values.slice(0,2),values.slice(2));
    const list = element('case-results'); list.replaceChildren();
    results.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} · ${item.score === null ? 'nincs pontszám' : (item.score*100).toLocaleString('hu-HU',{maximumFractionDigits:1})+'%'} · ${item.values[0]} cm, ${item.values[1]} ülőhely. ${item.solution} ${item.quality}`;
      list.append(li);
    });
    const best = results[0];
    element('case-answer').textContent = best.score === null ? 'Legalább egy súly legyen nagyobb nullánál. Most nincs kiválasztott eset.'
      : `${best.name}: ${(best.score*100).toLocaleString('hu-HU',{maximumFractionDigits:1})}%. ${!best.successful ? 'Ne vedd át a hibás megoldást. A sikertelen eset figyelmeztetés: több átjáróhely kell.' : best.score >= 0.8 ? 'Újrafelhasználási jelölt. Ellenőrizd az új helyzetben, mielőtt átveszed.' : 'Hozzáigazítás kell: a méretet és az ülőhelyek számát is ellenőrizd.'} Ez hasonlóság, nem sikeresély.`;
  }
  sliders.forEach(id => control(id).addEventListener('input',renderCases));
  element('case-reset').addEventListener('click', () => {
    sliders.forEach((id,i) => {control(id).value = String([45,2,1,1][i]);}); renderCases();
  });
  renderCases();
})();
