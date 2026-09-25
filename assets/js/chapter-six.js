(() => {
  const model = CourseNeural;
  const SVG = 'http://www.w3.org/2000/svg';
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
  /** @param {string} id */
  function button(id) {
    const node = element(id);
    if (!(node instanceof HTMLButtonElement)) throw Error(`Hiányzó gomb: ${id}`);
    return node;
  }
  /** Hungarian decimal comma and a real minus sign. @param {number} value @param {number} [min] @param {number} [max] */
  function format(value, min = 3, max = min) {
    return value.toLocaleString('hu-HU',{minimumFractionDigits:min, maximumFractionDigits:max, useGrouping:false}).replace('-','−');
  }
  /** @param {string} tag @param {Record<string, string | number>} attrs */
  function svg(tag, attrs) {
    const node = document.createElementNS(SVG,tag);
    for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,String(value));
    return node;
  }
  /** @param {HTMLElement} list @param {string} title @param {string} text @param {string} [kind] */
  function addTrace(list, title, text, kind = '') {
    const li = document.createElement('li'), code = document.createElement('code');
    if (kind) li.dataset.kind = kind;
    code.textContent = title; li.append(code, document.createTextNode(text)); list.append(li);
  }
  /** @param {HTMLInputElement} node @param {string} text */
  const valueText = (node, text) => node.setAttribute('aria-valuetext',text);

  // 1 · Állítható neuron és közös aktivációs grafikon.
  /** @param {number} a */
  const neuronX = a => 280 + 60*a;
  /** @param {number} o */
  const neuronY = o => 182.5 - 65*Math.max(-1.5,Math.min(2.5,o));
  /** @param {string} name */
  function activationPath(name) {
    let d = '', prev = NaN;
    for (let i = 0; i <= 320; i++) {
      const a = -4 + i/40, o = model.activate(name,a);
      d += `${i === 0 || Math.abs(o-prev) > .5 ? 'M' : 'L'}${neuronX(a).toFixed(1)} ${neuronY(o).toFixed(1)}`;
      prev = o;
    }
    return d;
  }
  const neuronIds = ['neuron-x1','neuron-x2','neuron-w1','neuron-w2','neuron-bias'];
  function renderNeuron() {
    const [x1,x2,w1,w2,bias] = neuronIds.map(id => input(id).valueAsNumber);
    const name = select('neuron-activation').value, label = model.activations[name].label;
    const {a,o} = model.neuron([x1,x2],[w1,w2],bias,name);
    element('neuron-curve').setAttribute('d',activationPath(name));
    const group = element('neuron-overlay-paths');
    group.replaceChildren();
    /** @type {string[]} */
    const compared = [];
    element('neuron-overlay').querySelectorAll('input:checked').forEach(box => {
      if (!(box instanceof HTMLInputElement) || box.value === name) return;
      group.append(svg('path',{class:'curve faint', d:activationPath(box.value)}));
      compared.push(model.activations[box.value].label);
    });
    const point = element('neuron-point');
    point.setAttribute('cx',neuronX(Math.max(-4,Math.min(4,a))).toFixed(1)); point.setAttribute('cy',neuronY(o).toFixed(1));
    /** @param {number} v */
    const term = v => v < 0 ? `(${format(v,1)})` : format(v,1);
    const text = `a = ${format(a)}, mert ${term(w1)}·${term(x1)} + ${term(w2)}·${term(x2)} + ${term(bias)}. A kimenet o = ${format(o)} (${label}).`;
    element('neuron-status').textContent = text;
    element('neuron-chart-desc').textContent = `${label} kiemelve${compared.length ? `; összevetésben: ${compared.join(', ')}` : ''}. A pont: a = ${format(a)}, o = ${format(o)}.`;
    for (const id of neuronIds) valueText(input(id),format(input(id).valueAsNumber,1));
  }
  for (const id of neuronIds) input(id).addEventListener('input',renderNeuron);
  select('neuron-activation').addEventListener('change',renderNeuron);
  element('neuron-overlay').addEventListener('change',renderNeuron);
  renderNeuron();

  // 2 · Réteges háló szerkesztő.
  const feedbackNames = {global:'globális', self:'elemi', lateral:'laterális', interlayer:'rétegközi'};
  /** @param {string} id @param {number} min @param {number} max */
  function bounded(id, min, max) {
    const value = input(id).valueAsNumber;
    return Number.isFinite(value) ? Math.max(min,Math.min(max,Math.round(value))) : min;
  }
  function renderNetwork() {
    const inputs = bounded('net-inputs',1,6), outputs = bounded('net-outputs',1,6), width = bounded('net-width',1,6);
    const hidden = Array(bounded('net-layers',0,3)).fill(width);
    /** @type {string[]} */
    const feedback = [];
    element('net-feedback').querySelectorAll('input:checked').forEach(box => {if (box instanceof HTMLInputElement) feedback.push(box.value);});
    const s = model.networkSummary({inputs,hidden,outputs,feedback});
    const xs = s.layers.map((_,k) => 70 + k*460/(s.layers.length-1));
    const pos = s.layers.map((n,k) => Array.from({length:n},(_,i) => ({x:xs[k], y:150 + (i-(n-1)/2)*Math.min(45,230/Math.max(1,n-1))})));
    const root = element('net-svg');
    root.replaceChildren(svg('title',{id:'net-svg-title'}));
    /** @param {string} cls @param {string} d */
    const path = (cls, d) => root.append(svg('path',{class:cls, d}));
    for (let k = 0; k+1 < pos.length; k++) for (const a of pos[k]) for (const b of pos[k+1]) path('edge',`M${a.x} ${a.y}L${b.x} ${b.y}`);
    const processing = pos.slice(1), last = pos[pos.length-1];
    if (feedback.includes('global')) for (const a of last) for (const b of pos[0]) path('edge-back',`M${a.x} ${a.y}Q${(a.x+b.x)/2} 330 ${b.x} ${b.y}`);
    if (feedback.includes('self')) for (const a of processing.flat()) path('edge-back',`M${a.x-8} ${a.y-16}C${a.x-24} ${a.y-48} ${a.x+24} ${a.y-48} ${a.x+8} ${a.y-16}`);
    if (feedback.includes('lateral')) for (const layer of processing) layer.forEach((a,i) => layer.slice(i+1).forEach(b => path('edge-back',`M${a.x+14} ${a.y}Q${a.x+30+(b.y-a.y)/4} ${(a.y+b.y)/2} ${b.x+14} ${b.y}`)));
    if (feedback.includes('interlayer')) for (let k = 1; k < processing.length; k++) for (const a of processing[k]) for (const b of processing[k-1]) path('edge-back',`M${a.x} ${a.y}Q${(a.x+b.x)/2} ${Math.min(a.y,b.y)-40} ${b.x} ${b.y}`);
    pos.forEach((layer,k) => layer.forEach(p => root.append(svg('circle',{class:k === 0 ? 'node input' : 'node', cx:p.x, cy:p.y, r:16}))));
    const loops = Object.entries(s.feedbackEdges).map(([k,v]) => `${feedbackNames[/** @type {keyof typeof feedbackNames} */ (k)]}: ${v}`);
    const text = `A háló ${s.kind}, ${s.depth}. Rétegek: ${s.layers.join('–')}. Előrecsatoló súlyok: ${s.weights}, torzítások: ${s.biases}${loops.length ? `, visszacsatoló kapcsolatok (${loops.join('; ')})` : ''}. Összesen ${s.parameters} tanulható paraméter.`;
    element('net-status').textContent = text;
    root.querySelector('title')?.append(text);
  }
  for (const id of ['net-inputs','net-outputs','net-layers','net-width']) input(id).addEventListener('input',renderNetwork);
  element('net-feedback').addEventListener('change',renderNetwork);
  renderNetwork();

  // 3 · Szeparálhatóság és perceptrontanítás.
  const gateNames = {and:'ÉS', or:'VAGY', nand:'NEM-ÉS', xor:'XOR'};
  const perc = {w:[0,0], b:0, index:0, epoch:0, errors:0, clean:false};
  const percIds = ['perc-w1','perc-w2','perc-bias'];
  const gate = () => /** @type {keyof typeof gateNames} */ (select('perc-gate').value);
  /** @param {number} x1 */
  const px = x1 => 80 + 160*x1;
  /** @param {number} x2 */
  const py = x2 => 240 - 160*x2;
  function renderPerceptron() {
    const samples = model.gates[gate()], [w1,w2] = perc.w, b = perc.b;
    const line = element('perc-line');
    if (Math.abs(w2) > 1e-9) line.setAttribute('d',[-.5,1.5].map((x1,i) => `${i ? 'L' : 'M'}${px(x1)} ${py(-(w1*x1+b)/w2).toFixed(1)}`).join(''));
    else if (Math.abs(w1) > 1e-9) line.setAttribute('d',`M${px(-b/w1).toFixed(1)} 0V320`);
    else line.setAttribute('d','');
    const points = element('perc-points');
    points.replaceChildren(...samples.map(s => {
      const ok = model.neuron(s.x,perc.w,b,'threshold').o === s.d;
      return svg('circle',{class:`${s.d ? 'point-one' : 'point-zero'}${ok ? '' : ' wrong'}`, cx:px(s.x[0]), cy:py(s.x[1]), r:9});
    }));
    const correct = model.countCorrect(samples,perc.w,b);
    let text = `${gateNames[gate()]} kapu · ${perc.epoch}. korszak. w₁ = ${format(w1,1,2)}; w₂ = ${format(w2,1,2)}; torzítás = ${format(b,1,2)}. Helyes: ${correct}/4.`;
    if (perc.clean) text += ' Hibátlan korszak: a tanítás kész.';
    else if (gate() === 'xor' && perc.epoch >= 5) text += ' Az XOR nem szétválasztható: egyetlen egyenes sem jó mind a négy pontra.';
    element('perc-status').textContent = text;
    element('perc-desc').textContent = `${text} ${line.getAttribute('d') ? `Döntési határ: ${format(w1,1,2)}·x₁ + ${format(w2,1,2)}·x₂ + ${format(b,1,2)} = 0.` : 'Minden súly nulla, nincs döntési határ.'} A hibásan osztályozott pontok vastag keretet kapnak.`;
    percIds.forEach((id,i) => {const v = [w1,w2,b][i]; input(id).value = String(v); valueText(input(id),format(v,1,2));});
  }
  function perceptronStep() {
    const samples = model.gates[gate()], sample = samples[perc.index];
    const r = model.perceptronUpdate(sample,perc.w,perc.b,Number(select('perc-rate').value));
    perc.w = r.weights; perc.b = r.bias;
    if (r.changed) perc.errors++;
    const list = element('perc-trace');
    addTrace(list,`${perc.epoch+1}. korszak · (${sample.x.join(',')}) → ${sample.d}`,
      `Kimenet: ${r.o}. ${r.changed ? `Hiba, módosítunk: w = (${format(perc.w[0],1,2)}; ${format(perc.w[1],1,2)}), torzítás = ${format(perc.b,1,2)}.` : 'Jó válasz, nincs változás.'}`, r.changed ? 'failure' : '');
    while (list.children.length > 12) list.firstElementChild?.remove();
    perc.index++;
    if (perc.index === samples.length) {perc.epoch++; perc.clean = perc.errors === 0; perc.index = 0; perc.errors = 0;}
    else perc.clean = false;
    renderPerceptron();
  }
  function resetPerceptron() {
    Object.assign(perc,{w:[0,0], b:0, index:0, epoch:0, errors:0, clean:false});
    element('perc-trace').replaceChildren();
    renderPerceptron();
  }
  button('perc-step').addEventListener('click',perceptronStep);
  button('perc-epoch').addEventListener('click', () => {do perceptronStep(); while (perc.index !== 0);});
  button('perc-reset').addEventListener('click',resetPerceptron);
  select('perc-gate').addEventListener('change',resetPerceptron);
  for (const id of percIds) input(id).addEventListener('input', () => {
    Object.assign(perc,{w:[input('perc-w1').valueAsNumber,input('perc-w2').valueAsNumber], b:input('perc-bias').valueAsNumber, index:0, errors:0, clean:false});
    renderPerceptron();
  });
  resetPerceptron();

  // 4 · Gradiensvölgy.
  const views = {bowl:{w:[-3,7], E:[-1,25]}, twoValleys:{w:[-2.2,2.2], E:[-.6,10]}};
  let gdSteps = 0;
  function renderDescent() {
    const land = /** @type {keyof typeof views} */ (select('gd-land').value), view = views[land];
    const rate = input('gd-rate').valueAsNumber, start = input('gd-start').valueAsNumber;
    /** @param {number} w */
    const X = w => 40 + 480*(w-view.w[0])/(view.w[1]-view.w[0]);
    /** @param {number} E */
    const Y = E => 280 - 260*(Math.max(view.E[0],Math.min(view.E[1],E))-view.E[0])/(view.E[1]-view.E[0]);
    const E = model.landscapes[land].E;
    element('gd-curve').setAttribute('d',Array.from({length:201},(_,i) => {const w = view.w[0] + i*(view.w[1]-view.w[0])/200; return `${i ? 'L' : 'M'}${X(w).toFixed(1)} ${Y(E(w)).toFixed(1)}`;}).join(''));
    const result = gdSteps ? model.descend(land,start,rate,gdSteps) : {points:[{w:start, E:E(start)}], status:'running'};
    const visible = result.points.map(p => ({x:X(Math.max(view.w[0],Math.min(view.w[1],p.w))), y:Y(p.E)}));
    element('gd-path').setAttribute('d',visible.map((p,i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(''));
    const last = result.points[result.points.length-1], end = visible[visible.length-1];
    element('gd-point').setAttribute('cx',end.x.toFixed(1)); element('gd-point').setAttribute('cy',end.y.toFixed(1));
    let text = `${result.points.length-1}. lépés · η = ${format(rate,2)} · `;
    if (result.status === 'diverged') text += 'w nagyobb, mint 50. A súly elszáll: minden lépés nagyobb, mint az előző.';
    else {
      text += `w = ${format(last.w)} · E = ${format(last.E)}.`;
      if (result.status === 'converged') text += land === 'twoValleys' && last.w > 0 ? ' Megállt, de ez csak lokális minimum: a bal oldali völgy mélyebb.' : ' Megállt: a derivált közel 0, ez a legmélyebb pont.';
      if (result.status === 'oscillating') text += ' A súly oszcillál: a minimum két oldala között ugrál.';
    }
    element('gd-status').textContent = text;
    element('gd-desc').textContent = `${land === 'bowl' ? 'Tál alakú hibafüggvény, minimum w = 2-nél.' : 'Két völgy: a mélyebb w ≈ −1,04-nél, a sekélyebb w ≈ 0,96-nál.'} Kezdőpont w = ${format(start,1)}. ${text}`;
    valueText(input('gd-rate'),format(rate,2)); valueText(input('gd-start'),format(start,1));
  }
  button('gd-step').addEventListener('click', () => {gdSteps++; renderDescent();});
  button('gd-run').addEventListener('click', () => {gdSteps += 20; renderDescent();});
  button('gd-reset').addEventListener('click', () => {gdSteps = 0; renderDescent();});
  for (const id of ['gd-rate','gd-start']) input(id).addEventListener('input', () => {gdSteps = 0; renderDescent();});
  select('gd-land').addEventListener('change', () => {gdSteps = 0; renderDescent();});
  renderDescent();

  // 5 · Túlillesztés.
  function renderFit() {
    const degree = input('fit-degree').valueAsNumber, r = model.overfitting(degree);
    element('fit-curve').setAttribute('d',r.curve.map((p,i) => `${i ? 'L' : 'M'}${(40+500*p.x).toFixed(1)} ${(110-60*Math.max(-1.6,Math.min(1.6,p.y))).toFixed(1)}`).join(''));
    let verdict = 'Ez jó egyensúly: a teszthiba is kicsi.';
    if (degree <= 2) verdict = 'Ez alulilleszkedés: a modell túl egyszerű, mindkét hiba nagy.';
    else if (degree >= 7 && r.testError > 1.5*r.trainError) verdict = 'Ez túlillesztés: a tanítóhiba kicsi, a teszthiba nagyobb.';
    const text = `${degree}. fok · tanítóhiba ${format(r.trainError)} · teszthiba ${format(r.testError)}. ${verdict}`;
    element('fit-status').textContent = text; element('fit-desc').textContent = text;
    valueText(input('fit-degree'),`${degree}. fok`);
  }
  input('fit-degree').addEventListener('input',renderFit);
  renderFit();

  // 6 · Előre és vissza.
  /** @type {{net:ReturnType<typeof model.exampleNetwork>, phase:number, epochs:number, result:ReturnType<typeof model.backpropStep> | null}} */
  const bp = {net:model.exampleNetwork(), phase:0, epochs:0, result:null};
  const sample = () => model.gates.xor[Number(select('bp-sample').value)];
  /** @param {number} v */
  const f4 = v => format(v,4);
  /** @param {number[]} w */
  const pair = w => `(${w.map(f4).join('; ')})`;
  function clearBackprop(message = 'A háló készen áll. Következik az előre számolás.') {
    bp.phase = 0; bp.result = null;
    element('bp-trace').replaceChildren();
    element('bp-status').textContent = message;
  }
  button('bp-next').addEventListener('click', () => {
    if (bp.phase === 6 && bp.result) {bp.net = bp.result.next; clearBackprop();}
    const {x,d} = sample(), rate = Number(select('bp-rate').value);
    if (bp.phase === 0) bp.result = model.backpropStep(bp.net,x,d,rate);
    const r = bp.result;
    if (!r) return;
    const net = bp.net, list = element('bp-trace');
    const a = net.hidden.map(u => u.w[0]*x[0] + u.w[1]*x[1] + u.b);
    const texts = [
      ['1 · Előre, rejtett réteg', `a₁ = ${f4(a[0])} → h₁ = ${f4(r.hidden[0])}; a₂ = ${f4(a[1])} → h₂ = ${f4(r.hidden[1])}.`],
      ['2 · Előre, kimenet', `o = ${f4(r.o)}; E = ½(${d} − o)² = ${f4(r.error)}.`],
      ['3 · Kimeneti δ', `δₒ = o(1 − o)(t − o) = ${f4(r.deltaOut)}.`],
      ['4 · Rejtett δ-k', `δ₁ = h₁(1 − h₁)·w₁·δₒ = ${f4(r.deltaHidden[0])}; δ₂ = ${f4(r.deltaHidden[1])}.`],
      ['5 · Új súlyok', `Kimenet ${pair(r.next.output.w)}, torzítás ${f4(r.next.output.b)}. Rejtett 1: ${pair(r.next.hidden[0].w)}, ${f4(r.next.hidden[0].b)}. Rejtett 2: ${pair(r.next.hidden[1].w)}, ${f4(r.next.hidden[1].b)}.`],
      ['6 · Ellenőrzés', (() => {const o = model.forward(r.next,x).o; return `Ugyanerre a mintára most o = ${f4(o)}, E = ${f4(.5*(d-o)**2)}. Korábban E = ${f4(r.error)} volt.`;})()]
    ];
    const [title,text] = texts[bp.phase];
    addTrace(list,title,text);
    bp.phase++;
    element('bp-status').textContent = `${bp.phase}/6. ${text}${bp.phase === 6 ? ' A következő gomb az új súlyokkal kezd új lépést.' : ''}`;
  });
  button('bp-train').addEventListener('click', () => {
    const r = model.trainXor(bp.net,Number(select('bp-rate').value),500);
    bp.net = r.net; bp.epochs += 500;
    clearBackprop(`Összesen ${bp.epochs} korszak. Átlagos hiba: ${f4(r.losses[r.losses.length-1])}. Kimenetek: ${model.gates.xor.map((s,i) => `${s.x[0]} XOR ${s.x[1]} → ${format(r.outputs[i])}`).join('; ')}.`);
  });
  button('bp-reset').addEventListener('click', () => {bp.net = model.exampleNetwork(); bp.epochs = 0; clearBackprop();});
  select('bp-sample').addEventListener('change', () => clearBackprop());
  select('bp-rate').addEventListener('change', () => clearBackprop());
  clearBackprop();
})();
