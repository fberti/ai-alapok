(() => {
  const model = CoursePrologFuzzy;
  /** @param {string} id */
  function element(id) {
    const node = document.getElementById(id);
    if (!node) throw Error(`Hiányzó elem: ${id}`);
    return node;
  }
  /** @param {string} id */
  function input(id) {
    const node = element(id);
    if (!(node instanceof HTMLInputElement)) throw Error(`Hiányzó bemenet: ${id}`);
    return node;
  }
  /** @param {string} id */
  function select(id) {
    const node = element(id);
    if (!(node instanceof HTMLSelectElement)) throw Error(`Hiányzó választó: ${id}`);
    return node;
  }
  const next = element('prolog-next');
  if (!(next instanceof HTMLButtonElement)) throw Error('Hiányzó léptetőgomb.');
  let trace = model.prologTrace(false,false), index = 0;
  function resetProlog() {
    const cut = input('prolog-cut').checked;
    trace = model.prologTrace(select('prolog-order').value === 'reversed',cut); index = 0;
    element('prolog-steps').replaceChildren();
    element('prolog-program').textContent = trace.facts.map(([a,b]) => `szebb(${a},${b}).`).join('\n') + `\nsokkal_szebb(A,C) :- szebb(A,B), ${cut ? '!, ' : ''}szebb(B,C).`;
    element('prolog-status').textContent = 'A keresés indulásra kész. Következik a cél illesztése.';
    if (next instanceof HTMLButtonElement) next.disabled = false;
  }
  next.addEventListener('click', () => {
    const step = trace.steps[index];
    if (!step) return;
    const li = document.createElement('li'), code = document.createElement('code');
    li.dataset.kind = step.kind; code.textContent = `${index+1}. ${step.goal}`;
    li.append(code,document.createTextNode(step.text)); element('prolog-steps').append(li);
    index++; next.disabled = index === trace.steps.length;
    element('prolog-status').textContent = `${index}/${trace.steps.length}. ${step.text}`;
    if (next.disabled) element('prolog-status').focus();
  });
  select('prolog-order').addEventListener('change',resetProlog);
  input('prolog-cut').addEventListener('change',resetProlog);
  element('prolog-reset').addEventListener('click',resetProlog);
  resetProlog();

  /** @param {number} value */
  function format(value) {return value.toLocaleString('hu-HU',{minimumFractionDigits:3,maximumFractionDigits:3});}
  /** @param {number} x @param {number} y @param {number} min @param {number} max */
  function coordinate(x,y,min,max) {return `${40+500*(x-min)/(max-min)},${175-150*y}`;}
  function renderCurve() {
    const shape = select('curve-shape').value, center = input('curve-center').valueAsNumber, width = input('curve-width').valueAsNumber, x = input('curve-x').valueAsNumber;
    // Include corners as well as a fine grid so triangular shapes stay exact.
    const xs = [...new Set([...Array.from({length:201},(_,i) => i/2),center-width,center-width/2,center,center+width/2,center+width])].filter(x => x >= 0 && x <= 100).sort((a,b) => a-b);
    element('curve-path').setAttribute('d',xs.map((x,i) => `${i ? 'L' : 'M'}${coordinate(x,model.curve(shape,x,center,width),0,100)}`).join(' '));
    const marker = 40+5*x;
    element('curve-marker').setAttribute('d',`M${marker} 25V175`);
    const names = {triangle:'Háromszög',trapezoid:'Trapéz',gaussian:'Gauss'};
    const text = `${names[/** @type {keyof typeof names} */ (shape)]}: c = ${center}, w = ${width}, x = ${x} → μ(x) = ${format(model.curve(shape,x,center,width))}.`;
    element('curve-status').textContent = text; element('curve-desc').textContent = text;
    for (const id of ['curve-center','curve-width','curve-x']) input(id).setAttribute('aria-valuetext',input(id).value);
  }
  select('curve-shape').addEventListener('change',renderCurve);
  for (const id of ['curve-center','curve-width','curve-x']) input(id).addEventListener('input',renderCurve);
  renderCurve();

  function renderExam() {
    const score = input('exam-score').valueAsNumber, attendance = input('exam-attendance').valueAsNumber;
    const result = model.exam(score,attendance), m = result.memberships;
    element('exam-memberships').textContent = `${score} pont, ${attendance.toLocaleString('hu-HU')} óra. Közepes: ${format(m.medium)}; jó: ${format(m.good)}; kiváló: ${format(m.excellent)}; ritka: ${format(m.rare)}; gyakori: ${format(m.frequent)}.`;
    element('exam-rule-one').textContent = `R1 → jeles: min(${format(m.good)}; ${format(m.rare)}) = ${format(result.strengths[0])}`;
    element('exam-rule-two').textContent = `R2 → jó: min(${format(m.medium)}; ${format(m.frequent)}) = ${format(result.strengths[1])}`;
    element('exam-area').setAttribute('d',result.points.map((p,i) => `${i ? 'L' : 'M'}${coordinate(p.x,p.y,1,5)}`).join(' ') + ' L540,175 Z');
    const method = /** @type {'centroid'|'weighted'|'maximum'} */ (select('exam-method').value);
    const value = result[method];
    const text = value === null ? 'Nincs aktív szabály. Nincs defuzzifikált jegyjavaslat; a hiányzó esethez külön szabály kell.' : `Folytonos jegyjavaslat: ${format(value)}. ${select('exam-method').selectedOptions[0].textContent}; nem hivatalos vizsgajegy.`;
    element('exam-status').textContent = text;
    element('exam-desc').textContent = `Az egyesített, levágott következmények. R1 = ${format(result.strengths[0])}, R2 = ${format(result.strengths[1])}. ${text}`;
    element('exam-marker').setAttribute('visibility',value === null ? 'hidden' : 'visible');
    if (value !== null) element('exam-marker').setAttribute('d',`M${40+125*(value-1)} 25V175`);
    input('exam-score').setAttribute('aria-valuetext',`${score} pont`);
    input('exam-attendance').setAttribute('aria-valuetext',`${attendance.toLocaleString('hu-HU')} óra`);
  }
  for (const id of ['exam-score','exam-attendance']) input(id).addEventListener('input',renderExam);
  select('exam-method').addEventListener('change',renderExam);
  element('exam-reset').addEventListener('click', () => {
    input('exam-score').value = '65'; input('exam-attendance').value = '6'; select('exam-method').value = 'centroid'; renderExam();
  });
  renderExam();
})();
