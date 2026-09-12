(() => {
  const model = CourseLogic;
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
  /** @param {unknown} error */
  function message(error) {return error instanceof Error ? error.message : 'A képletet nem sikerült feldolgozni.';}
  /** @param {string} tag @param {string} text */
  function textNode(tag,text) {const node = document.createElement(tag); node.textContent = text; return node;}
  function renderTruth() {
    const input = control('truth-input'), output = element('truth-result'); output.replaceChildren();
    try {
      const result = model.truthTable(input.value), table = document.createElement('table');
      table.append(textNode('caption',`A(z) ${input.value} képlet igazságtáblája`));
      const head = document.createElement('thead'), header = document.createElement('tr');
      [...result.variables,'Eredmény'].forEach(name => {const cell = textNode('th',name); cell.setAttribute('scope','col'); header.append(cell);});
      head.append(header); table.append(head);
      const body = document.createElement('tbody');
      result.rows.forEach(row => {
        const tr = document.createElement('tr');
        [...result.variables.map(name => row.values[name]),row.result].forEach(value => tr.append(textNode('td',value ? 'igaz' : 'hamis')));
        body.append(tr);
      });
      table.append(body); output.append(table);
      element('truth-status').textContent = `${result.rows.length} interpretáció. A képlet ${result.kind}. ${result.kind === 'ellentmondás' ? 'Nincs igaz sora, ezért kielégíthetetlen.' : 'Van igaz sora, ezért kielégíthető.'}`;
      input.setAttribute('aria-invalid','false');
    } catch (error) {input.setAttribute('aria-invalid','true'); element('truth-status').textContent = message(error);}
  }
  element('truth-form').addEventListener('submit', event => {event.preventDefault(); renderTruth();});
  renderTruth();

  const sentences = {
    sun:{formula:'p -> !q', help:'A HA–AKKOR csak a napsütés és tanulás együttes igaz esetét tiltja.'},
    both:{formula:'p & q', help:'Az ÉS mindkét tag igaz voltát kéri.'},
    either:{formula:'p | q', help:'A megengedő VAGY akkor is igaz, ha mindkét tag igaz.'}
  };
  function checkSentence() {
    const input = control('sentence-input');
    const target = sentences[/** @type {keyof typeof sentences} */ (control('sentence-choice').value)];
    try {
      const candidate = model.truthTable(input.value);
      if (candidate.variables.some(name => !['p','q'].includes(name))) throw Error('Csak p és q változót használj ebben a feladatban.');
      const expected = model.truthTable(target.formula);
      const counterexample = expected.rows.find(row => {
        const actual = candidate.rows.find(item => candidate.variables.every(name => item.values[name] === row.values[name]));
        return actual?.result !== row.result;
      });
      element('sentence-status').textContent = counterexample
        ? `Még nem ugyanaz. Ellenpélda: p = ${counterexample.values.p ? 'igaz' : 'hamis'}, q = ${counterexample.values.q ? 'igaz' : 'hamis'}. Itt a két képlet eltér. ${target.help}`
        : `Helyes: a képleted minden sorban egyezik a mondat jelentésével. ${target.help}`;
      input.setAttribute('aria-invalid','false');
    } catch (error) {input.setAttribute('aria-invalid','true'); element('sentence-status').textContent = `${message(error)} ${target.help}`;}
  }
  control('sentence-input').addEventListener('input',checkSentence);
  control('sentence-choice').addEventListener('change',checkSentence);
  checkSentence();

  const stepNames = ['Ekvivalenciák eltüntetése','Implikációk eltüntetése','Tagadás az atomokig','Klózok konjunkciója'];
  /** @type {string[]} */
  let steps = [];
  let stepIndex = 0;
  const next = element('cnf-next');
  if (!(next instanceof HTMLButtonElement)) throw Error('Hiányzó léptetőgomb.');
  const startCnf = () => {
    const input = control('cnf-input');
    steps = []; stepIndex = 0; next.disabled = true; element('cnf-results').replaceChildren();
    try {
      steps = model.normalForm(input.value).steps;
      input.setAttribute('aria-invalid','false'); next.disabled = false;
      element('cnf-status').textContent = `Kiinduló képlet: ${input.value}. Következik az első átalakítás.`;
    } catch (error) {input.setAttribute('aria-invalid','true'); element('cnf-status').textContent = message(error);}
  };
  element('cnf-form').addEventListener('submit', event => {event.preventDefault(); startCnf();});
  next.addEventListener('click', () => {
    if (stepIndex >= steps.length) return;
    const item = document.createElement('li');
    item.append(textNode('strong',stepNames[stepIndex]),textNode('code',steps[stepIndex]));
    element('cnf-results').append(item); stepIndex++;
    next.disabled = stepIndex === steps.length;
    element('cnf-status').textContent = `${stepIndex}/4. ${stepNames[stepIndex-1]}. ${steps[stepIndex-1]}${next.disabled ? ' Kész. A négy lépés minden igazságértéket megőriz.' : ''}`;
    if (next.disabled) element('cnf-status').focus();
  });
  // An edited input must never advance the previous formula's cached steps.
  control('cnf-input').addEventListener('input', () => {
    steps = []; stepIndex = 0; next.disabled = true; element('cnf-results').replaceChildren();
    element('cnf-status').textContent = 'A képlet megváltozott. Indíts új átalakítást.';
  });
  startCnf();

  /** @type {{clause:string[], parents?:number[], pivot?:string}[]} */
  let proof = [];
  function renderProof() {
    const list = element('resolution-tree'); list.replaceChildren();
    const selectors = [control('resolution-left'),control('resolution-right')];
    const previous = selectors.map(select => select.value);
    selectors.forEach(select => select.replaceChildren());
    proof.forEach((node,index) => {
      const title = `C${index+1} = ${node.clause.join(' ∨ ') || '□'}`;
      const li = document.createElement('li'); li.append(textNode('strong',title));
      if (node.parents) {
        li.dataset.derived = 'true';
        li.append(textNode('small',`Szülők: C${node.parents[0]+1} + C${node.parents[1]+1} · törölt pár: ${node.pivot}, ¬${node.pivot}.`));
      } else li.append(textNode('small','Kiinduló klóz a PDF példájából.'));
      list.append(li);
      selectors.forEach(select => {
        const option = document.createElement('option'); option.value = String(index); option.textContent = title; select.append(option);
      });
    });
    selectors.forEach((select,index) => {select.value = previous[index] && Number(previous[index]) < proof.length ? previous[index] : String(index);});
  }
  function resetProof() {
    proof = [['p','¬q'],['¬p','r'],['¬r','¬s'],['q'],['s']].map(clause => ({clause}));
    renderProof(); control('resolution-left').value = '0'; control('resolution-right').value = '1'; control('resolution-pivot').value = 'p';
    element('resolution-status').textContent = 'Öt kiinduló klóz. Válassz szülőket és törlendő változót.';
  }
  element('resolution-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const left = Number(control('resolution-left').value), right = Number(control('resolution-right').value), pivot = control('resolution-pivot').value;
      if (left === right) throw Error('Két különböző szülőklózt válassz.');
      if (proof.some(node => node.clause.length === 0)) throw Error('A cáfolat már kész. Új próbához állítsd vissza a fát.');
      if (proof.length >= 40) throw Error('Elérted a 40 csomópontos taneszköz korlátját. Állítsd vissza a fát.');
      const clause = model.resolve(proof[left].clause,proof[right].clause,pivot);
      if (clause.some(literal => clause.includes(literal.startsWith('¬') ? literal.slice(1) : `¬${literal}`))) throw Error('Ez a rezolvens tautológia. Nem ad új megszorítást, ezért nem adjuk a fához.');
      if (proof.some(node => node.clause.length === clause.length && node.clause.every(literal => clause.includes(literal)))) throw Error('Ez a klóz már szerepel a fában. Válassz másik lépést.');
      proof.push({clause,parents:[left,right],pivot}); renderProof();
      element('resolution-status').textContent = clause.length ? `C${proof.length} hozzáadva: ${clause.join(' ∨ ')}. A szülőklózok is megmaradtak.` : `C${proof.length} = □. Üres klóz: a kiinduló klózhalmaz kielégíthetetlen. A cáfolat kész.`;
    } catch (error) {element('resolution-status').textContent = message(error);}
  });
  element('resolution-reset').addEventListener('click',resetProof);
  resetProof();

  const scopes = {
    x:'A külső ∀x hatóköre az egész szögletes zárójeles rész. Mindkét x kötött. A két y is a hatókörben van, de nem az x kvantora köti őket.',
    y:'A belső ∃y hatóköre csak a Q-beli rész. Csak a Q-beli y-t köti; az ottani x-et továbbra is a külső ∀x köti.',
    free:'A P-beli y szabad. Egyetlen y-kvantor hatóköre sem terjed ki rá. A formula ezért nem mondat.'
  };
  document.querySelectorAll('button[data-scope]').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('data-scope');
      document.querySelectorAll('button[data-scope]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
      element('scope-formula').querySelectorAll('[data-scope-region]').forEach(item => item.classList.toggle('scope-active',item.getAttribute('data-scope-region') === selected));
      element('scope-formula').querySelectorAll('[data-binding]').forEach(item => item.classList.toggle('binding-active',item.getAttribute('data-binding') === selected));
      element('scope-status').textContent = scopes[/** @type {keyof typeof scopes} */ (selected)];
    });
  });
})();
