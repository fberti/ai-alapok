(() => {
  const model = CourseNeural;
  /** @param {string} id */
  function element(id) {const node = document.getElementById(id); if (!node) throw Error(`Hiányzó elem: ${id}`); return node;}
  /** @param {string} id */
  function value(id) {const node = element(id); if (!(node instanceof HTMLInputElement)) throw Error(`Hiányzó bemenet: ${id}`); return node.valueAsNumber;}
  /** @param {string} id */
  function selected(id) {const node = element(id); if (!(node instanceof HTMLSelectElement)) throw Error(`Hiányzó választó: ${id}`); return node.value;}
  /** @param {number} number */
  function format(number) {return number.toLocaleString('hu-HU',{minimumFractionDigits:3,maximumFractionDigits:3});}
  /** @param {string} tag @param {Record<string,string|number>} attributes @param {string} text */
  function svg(tag,attributes,text = '') {const node = document.createElementNS('http://www.w3.org/2000/svg',tag); Object.entries(attributes).forEach(([key,val]) => node.setAttribute(key,String(val))); node.textContent = text; return node;}
  /** @param {string[]} ids @param {() => void} render */
  function watch(ids,render) {ids.forEach(id => element(id).addEventListener('input',render)); render();}

  watch(['neuron-x1','neuron-x2','neuron-w1','neuron-w2','neuron-b','neuron-activation'],() => {
    const inputs = [value('neuron-x1'),value('neuron-x2')], weights = [value('neuron-w1'),value('neuron-w2')], bias = value('neuron-b');
    const result = model.neuron(inputs,weights,bias,selected('neuron-activation'));
    element('neuron-result').textContent = `z = ${format(inputs[0])}·${format(weights[0])} + ${format(inputs[1])}·${format(weights[1])} + ${format(bias)} = ${format(result.sum)}; kimenet = ${format(result.output)}.`;
  });
  watch(['activation-kind','activation-x'],() => {
    const kind = selected('activation-kind'), input = value('activation-x'), plot = element('activation-plot');
    const curves = Object.entries(model.activations).map(([name,activation]) => {
      const points = Array.from({length:121},(_,index) => {
        const x = -3 + index*.05, y = activation(x);
        return `${index ? 'L' : 'M'}${20+index*380/120},${Math.max(15,Math.min(215,115-y*45))}`;
      });
      return svg('path',{d:points.join(' '),fill:'none',stroke:name === kind ? '#bc6342' : 'var(--green)','stroke-width':name === kind ? 3 : 1,opacity:name === kind ? 1 : .28,'data-activation':name});
    });
    plot.replaceChildren(svg('path',{d:'M20 115 H400 M210 15 V215',class:'axis'}),...curves);
    element('activation-result').textContent = `${selected('activation-kind')}: f(${format(input)}) = ${format(model.activations[kind](input))}. A görbén z ∈ [−3,3], y ∈ [−2,2].`;
  });
  watch(['layer-count','layer-links'],() => {
    const count = value('layer-count'), sparse = selected('layer-links') === 'sparse', plot = element('layer-diagram');
    const columns = [[70,140],Array.from({length:count},(_,index) => 105+(index-(count-1)/2)*30),[105]];
    const nodes = columns.map((column,index) => column.map((y,position) => ({x:40+index*170,y,position})));
    const edges = nodes.slice(0,2).flatMap((column,index) => column.flatMap(from => nodes[index+1].filter(to => !sparse || (from.position+to.position)%2 === 0).map(to => svg('line',{x1:from.x,y1:from.y,x2:to.x,y2:to.y,stroke:'var(--green)','stroke-width':1.5}))));
    plot.replaceChildren(...edges,...nodes.flatMap((column,index) => column.flatMap(node => [svg('circle',{cx:node.x,cy:node.y,r:15,fill:index === 1 ? 'var(--lime)' : 'var(--white)'}),svg('text',{x:node.x-4,y:node.y+5},index === 0 ? 'x' : index === 1 ? 'h' : 'y')])));
    element('layer-result').textContent = `2 bemenet → ${count} rejtett → 1 kimenet; ${edges.length} súlyozott kapcsolat és ${count+1} eltolás. ${sparse ? 'Ritkított' : 'Teljes'} rétegközi háló.`;
  });
  const samples = [[0,0],[0,1],[1,0],[1,1]];
  /** @param {number[]} weights @param {number[]} targets @param {string} plotId @param {number} activeIndex */
  function renderBoundary(weights,targets,plotId,activeIndex = -1) {
    const [weightX,weightY,bias] = weights, plot = element(plotId);
    const line = Math.abs(weightY) > .001
      ? svg('line',{x1:60,y1:190+140*bias/weightY,x2:240,y2:190+140*(bias+weightX)/weightY,stroke:'var(--green)','stroke-width':2})
      : Math.abs(weightX) > .001 ? svg('line',{x1:60-180*bias/weightX,y1:20,x2:60-180*bias/weightX,y2:220,stroke:'var(--green)','stroke-width':2}) : null;
    const marks = samples.flatMap(([x,y],index) => {
      const prediction = model.classify(x,y,weightX,weightY,bias), pointX = 60+x*180, pointY = 190-y*140;
      return [svg('circle',{cx:pointX,cy:pointY,r:index === activeIndex ? 19 : 15,fill:prediction === targets[index] ? 'var(--green)' : '#bb5937'}),svg('text',{x:pointX+20,y:pointY+5},`${x},${y} → ${prediction}/${targets[index]}`)];
    });
    plot.replaceChildren(...(line ? [line] : []),...marks);
  }
  watch(['boundary-pattern','boundary-w1','boundary-w2','boundary-b'],() => {
    const pattern = selected('boundary-pattern'), targets = pattern === 'xor' ? [0,1,1,0] : pattern === 'or' ? [0,1,1,1] : [0,0,0,1];
    const weightX = value('boundary-w1'), weightY = value('boundary-w2'), bias = value('boundary-b');
    renderBoundary([weightX,weightY,bias],targets,'boundary-plot');
    const correct = samples.filter(([x,y],index) => model.classify(x,y,weightX,weightY,bias) === targets[index]).length;
    element('boundary-result').textContent = `${pattern.toUpperCase()}: ${correct}/4 pont helyes. ${pattern === 'xor' ? 'XOR-hoz egyetlen egyenes soha nem elég.' : 'Változtasd a súlyokat, és keresd az elválasztó egyenest.'}`;
  });
  let weights = [0,0,0], sampleIndex = 0;
  renderBoundary(weights,[0,0,0,1],'perceptron-plot');
  element('perceptron-next').addEventListener('click',() => {
    const sample = samples[sampleIndex%4], result = model.perceptronEpoch([sample],[sample[0]*sample[1]],weights,1);
    weights = result.weights; sampleIndex++;
    renderBoundary(weights,[0,0,0,1],'perceptron-plot',(sampleIndex-1)%4);
    element('perceptron-result').textContent = `${sampleIndex}. minta (${sample.join(',')}): becslés ${result.changes[0].prediction}, cél ${sample[0]*sample[1]}, hiba ${result.changes[0].error}. Új (w₁,w₂,b) = (${weights.join(', ')}).`;
  });
  element('perceptron-reset').addEventListener('click',() => {weights=[0,0,0];sampleIndex=0;renderBoundary(weights,[0,0,0,1],'perceptron-plot');element('perceptron-result').textContent='Induló súlyok: (0, 0, 0). A küszöb 0-nál 1-et ad.';});
  const train = [0.85,0.55,0.32,0.20,0.14,0.10,0.07,0.05,0.03,0.02,0.01], test = [0.80,0.52,0.31,0.21,0.19,0.21,0.26,0.34,0.46,0.60,0.78];
  watch(['fit-complexity'],() => {
    const plot = element('fit-plot'), complexity = value('fit-complexity');
    /** @param {number[]} values @param {string} color */
    const draw = (values,color) => svg('polyline',{points:values.map((number,index) => `${25+index*37},${205-number*210}`).join(' '),fill:'none',stroke:color,'stroke-width':3});
    plot.replaceChildren(svg('path',{d:'M25 15 V205 H400',class:'axis'}),draw(train,'var(--green)'),draw(test,'#c66540'),svg('line',{x1:25+complexity*37,y1:15,x2:25+complexity*37,y2:205,stroke:'var(--ink)','stroke-dasharray':'4 4'}),svg('text',{x:40,y:25},'tanító'),svg('text',{x:250,y:25},'teszt'));
    element('fit-result').textContent = `Bonyolultság ${complexity}: tanítóhiba ${format(train[complexity])}; teszthiba ${format(test[complexity])}. Szemléltető, előre rögzített adatsorok.`;
  });
  let position = 3;
  function renderValley() {
    const plot = element('gradient-plot'), curve = Array.from({length:101},(_,index) => {const x=-1+index*.04;return `${index?'L':'M'}${20+index*3.8},${160-Math.min(140,(x-1)**2*15)}`;});
    plot.replaceChildren(svg('path',{d:'M20 160 H400',class:'axis'}),svg('path',{d:curve.join(' '),class:'curve'}),svg('circle',{cx:20+(position+1)*95,cy:160-Math.min(140,(position-1)**2*15),r:7,fill:'#bc6342'}));
    element('gradient-result').textContent = `w = ${format(position)}; E(w) = (w−1)² = ${format((position-1)**2)}. Derivált: ${format(2*(position-1))}. η = ${format(value('gradient-rate'))}.`;
  }
  element('gradient-rate').addEventListener('input',renderValley); element('gradient-next').addEventListener('click',() => {position -= value('gradient-rate')*2*(position-1);renderValley();}); element('gradient-reset').addEventListener('click',() => {position=3;renderValley();});renderValley();
  let hiddenWeights = [[.5,-.4,0],[-.3,.6,0]],outputWeights = [.7,-.2,.1],iteration = 0, previousUpdate = '';
  function renderBackprop() {
    const result = model.backprop([1,0],hiddenWeights,outputWeights,1,value('backprop-rate'));
    element('backprop-result').textContent = `${previousUpdate}${iteration}. lépés: h = (${result.hidden.map(format).join('; ')}), y = ${format(result.output)}, E = ${format(result.loss)}; δki = ${format(result.outputDelta)}, δrejt = (${result.hiddenDeltas.map(format).join('; ')}). Következő u = (${result.nextOutput.map(format).join('; ')}), következő v₁₁ = ${format(result.nextHidden[0][0])}, v₂₁ = ${format(result.nextHidden[1][0])}.`;
    return result;
  }
  element('backprop-next').addEventListener('click',() => {const step=renderBackprop();previousUpdate=`Előző frissítés: u₁ = ${format(step.nextOutput[0])}, u₂ = ${format(step.nextOutput[1])}, v₁₁ = ${format(step.nextHidden[0][0])}, v₂₁ = ${format(step.nextHidden[1][0])}. `;hiddenWeights=step.nextHidden;outputWeights=step.nextOutput;iteration++;renderBackprop();});
  element('backprop-reset').addEventListener('click',() => {hiddenWeights=[[.5,-.4,0],[-.3,.6,0]];outputWeights=[.7,-.2,.1];iteration=0;previousUpdate='';renderBackprop();});
  element('backprop-rate').addEventListener('input',renderBackprop);renderBackprop();
  CourseQuiz.mount(ChapterSixQuiz);
})();
