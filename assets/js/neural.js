const CourseNeural = (() => {
  /** @param {number} a */
  const sigmoid = a => 1 / (1 + Math.exp(-a));
  /** @type {Record<string, {label:string, f:(a:number, p:number) => number, param?:number}>} */
  const activations = {
    linear:{label:'Lineáris', f:(a,p) => p*a, param:1},
    threshold:{label:'Küszöb', f:a => a >= 0 ? 1 : 0},
    sign:{label:'Szignum', f:a => a > 0 ? 1 : a < 0 ? -1 : 0},
    piecewise:{label:'Darabonként lineáris', f:a => a >= .5 ? 1 : a <= -.5 ? 0 : a+.5},
    relu:{label:'ReLU', f:a => Math.max(0,a)},
    leakyRelu:{label:'Szivárgó ReLU', f:a => a >= 0 ? a : .01*a},
    gaussian:{label:'Gauss', f:a => Math.exp(-a*a)},
    sigmoid:{label:'Szigmoid', f:sigmoid},
    swish:{label:'Swish', f:(a,p) => a*sigmoid(p*a), param:1},
    tanh:{label:'tanh', f:Math.tanh},
    elu:{label:'ELU', f:(a,p) => a > 0 ? a : p*(Math.exp(a)-1), param:1}
  };
  /** @param {string} name @param {number} a @param {number} [param] */
  function activate(name, a, param) {
    const act = activations[name];
    if (!act || !Object.hasOwn(activations,name)) throw Error(`Ismeretlen aktivációs függvény: ${name}`);
    if (!Number.isFinite(a)) throw Error('Az aktiváció véges szám legyen.');
    return act.f(a, param ?? act.param ?? 1);
  }
  /** @param {number[]} x @param {number[]} w */
  function dot(x, w) {
    if (x.length !== w.length || !x.every(Number.isFinite) || !w.every(Number.isFinite)) throw Error('A bemenetek és súlyok száma egyezzen, értékük véges legyen.');
    return x.reduce((sum,xi,i) => sum + xi*w[i], 0);
  }
  /** Bias = −θ: a = Σ wᵢxᵢ + b. @param {number[]} x @param {number[]} w @param {number} bias @param {string} name @param {number} [param] */
  function neuron(x, w, bias, name, param) {
    const a = dot(x,w) + bias;
    return {a, o:activate(name,a,param)};
  }
  /** The PDF 194. oldal hálója: u1 a (0,1), u2 az (1,0) mintát jelzi, u3 VAGY. @param {number} x1 @param {number} x2 */
  function xorByHand(x1, x2) {
    const h1 = neuron([x1,x2],[-1,1],-.5,'threshold').o, h2 = neuron([x1,x2],[1,-1],-.5,'threshold').o;
    return {hidden:[h1,h2], o:neuron([h1,h2],[1,1],-.5,'threshold').o};
  }
  /** @param {number[]} d */
  const table = d => [[0,0],[0,1],[1,0],[1,1]].map((x,i) => ({x, d:d[i]}));
  const gates = {and:table([0,0,0,1]), or:table([0,1,1,1]), nand:table([1,1,1,0]), xor:table([0,1,1,0])};
  /** @typedef {{x:number[], d:number}} Sample */
  /** @param {Sample[]} samples @param {number[]} w @param {number} bias */
  function countCorrect(samples, w, bias) {
    return samples.filter(s => neuron(s.x,w,bias,'threshold').o === s.d).length;
  }
  /** Rosenblatt-szabály egy mintára: w ← w + r(d−o)x, b ← b + r(d−o).
   * @param {Sample} sample @param {number[]} weights @param {number} bias @param {number} rate */
  function perceptronUpdate({x,d}, weights, bias, rate) {
    const o = neuron(x,weights,bias,'threshold').o;
    if (o === d) return {o, weights:[...weights], bias, changed:false};
    return {o, weights:weights.map((wi,i) => wi + rate*(d-o)*x[i]), bias:bias + rate*(d-o), changed:true};
  }
  /** @param {Sample[]} samples @param {{weights:number[], bias:number, rate:number, maxEpochs:number}} options */
  function trainPerceptron(samples, {weights, bias, rate, maxEpochs}) {
    if (!(rate > 0) || !Number.isInteger(maxEpochs) || maxEpochs < 1) throw Error('Pozitív tanulási ráta és legalább egy korszak kell.');
    let w = [...weights], b = bias, epochs = 0, converged = false;
    /** @type {{epoch:number, x:number[], d:number, o:number, weights:number[], bias:number}[]} */
    const steps = [];
    while (epochs < maxEpochs && !converged) {
      epochs++;
      let errors = 0;
      for (const sample of samples) {
        const r = perceptronUpdate(sample,w,b,rate);
        if (r.changed) errors++;
        w = r.weights; b = r.bias;
        steps.push({epoch:epochs, x:sample.x, d:sample.d, o:r.o, weights:[...w], bias:b});
      }
      converged = errors === 0;
    }
    return {weights:w, bias:b, epochs, converged, steps};
  }
  /** Egyetlen szigmoid neuron, egy minta, E = (t−o)², torzítás nélkül, ahogy a PDF 209. oldalán.
   * @param {number[]} x @param {number[]} w @param {number} t @param {number} rate */
  function singleNeuronStep(x, w, t, rate) {
    const o = sigmoid(dot(x,w)), error = (t-o)**2;
    const gradient = x.map(xi => -2*(t-o)*o*(1-o)*xi);
    const next = w.map((wi,i) => wi - rate*gradient[i]), wrongSign = w.map((wi,i) => wi + rate*gradient[i]);
    /** @param {number[]} v */
    const errorAt = v => (t - sigmoid(dot(x,v)))**2;
    return {o, error, gradient, next, nextError:errorAt(next), wrongSign, wrongSignError:errorAt(wrongSign)};
  }
  /** @type {Record<string, {E:(w:number) => number, dE:(w:number) => number}>} */
  const landscapes = {
    bowl:{E:w => (w-2)**2, dE:w => 2*(w-2)},
    twoValleys:{E:w => (w*w-1)**2 + .3*w, dE:w => 4*w*(w*w-1) + .3}
  };
  /** @param {string} name @param {number} start @param {number} rate @param {number} steps */
  function descend(name, start, rate, steps) {
    const land = landscapes[name];
    if (!land || !Object.hasOwn(landscapes,name)) throw Error('Ismeretlen hibafelület.');
    if (!(rate > 0) || !Number.isFinite(start) || !Number.isInteger(steps) || steps < 1) throw Error('Véges kezdőpont, pozitív ráta és lépésszám kell.');
    let w = start;
    const points = [{w, E:land.E(w)}];
    /** @type {'converged'|'oscillating'|'diverged'|'running'} */
    let status = 'running';
    for (let k = 0; k < steps; k++) {
      if (Math.abs(land.dE(w)) < 1e-4) {status = 'converged'; break;}
      w -= rate*land.dE(w);
      if (!Number.isFinite(w) || Math.abs(w) > 50) {status = 'diverged'; points.push({w:Math.sign(w)*50, E:Infinity}); break;}
      points.push({w, E:land.E(w)});
    }
    if (status === 'running' && Math.abs(land.dE(w)) < 1e-4) status = 'converged';
    if (status === 'running' && points.length > 4) {
      const [a,b,c] = points.slice(-3).map(p => p.w);
      const flips = Math.sign(b-a) !== Math.sign(c-b), shrinking = Math.abs(c-b) < .9*Math.abs(b-a);
      if (flips && !shrinking) status = 'oscillating';
    }
    return {points, status};
  }
  /** @typedef {{w:number[], b:number}} Unit */
  /** @typedef {{hidden:Unit[], output:Unit}} Network */
  /** @returns {Network} */
  function exampleNetwork() {
    return {hidden:[{w:[.4,.2], b:.1},{w:[-.3,.6], b:-.2}], output:{w:[.6,-.5], b:.1}};
  }
  /** @param {Network} net */
  const clone = net => ({hidden:net.hidden.map(u => ({w:[...u.w], b:u.b})), output:{w:[...net.output.w], b:net.output.b}});
  /** @param {Network} net @param {number[]} x */
  function forward(net, x) {
    const hidden = net.hidden.map(u => neuron(x,u.w,u.b,'sigmoid').o);
    return {hidden, o:neuron(hidden,net.output.w,net.output.b,'sigmoid').o};
  }
  /** Egy minta, E = ½(t−o)², δ a negatív deriváltat jelöli (PDF 211.).
   * @param {Network} net @param {number[]} x @param {number} t @param {number} rate */
  function backpropStep(net, x, t, rate) {
    const {hidden, o} = forward(net,x);
    const error = .5*(t-o)**2, deltaOut = o*(1-o)*(t-o);
    const deltaHidden = hidden.map((h,j) => h*(1-h)*net.output.w[j]*deltaOut);
    const next = clone(net);
    next.output.w = next.output.w.map((w,j) => w + rate*deltaOut*hidden[j]);
    next.output.b += rate*deltaOut;
    next.hidden.forEach((u,j) => {u.w = u.w.map((w,i) => w + rate*deltaHidden[j]*x[i]); u.b += rate*deltaHidden[j];});
    return {hidden, o, error, deltaOut, deltaHidden, next};
  }
  /** @param {Network} start @param {number} rate @param {number} epochs */
  function trainXor(start, rate, epochs) {
    let net = clone(start);
    const loss = () => gates.xor.reduce((sum,s) => sum + .5*(s.d - forward(net,s.x).o)**2, 0)/4;
    const losses = [loss()];
    for (let e = 0; e < epochs; e++) {
      for (const s of gates.xor) net = backpropStep(net,s.x,s.d,rate).next;
      losses.push(loss());
    }
    return {net, losses, outputs:gates.xor.map(s => forward(net,s.x).o)};
  }
  const feedbackKinds = ['global','self','lateral','interlayer'];
  /** @param {{inputs:number, hidden:number[], outputs:number, feedback:string[]}} spec */
  function networkSummary({inputs, hidden, outputs, feedback}) {
    /** @param {number} n */
    const ok = n => Number.isInteger(n) && n >= 1 && n <= 8;
    if (!ok(inputs) || !ok(outputs) || hidden.length > 4 || !hidden.every(ok) || !feedback.every(f => feedbackKinds.includes(f))) throw Error('1–8 neuron rétegenként, legfeljebb 4 rejtett réteg.');
    const layers = [inputs,...hidden,outputs], processing = [...hidden,outputs];
    const weights = layers.slice(1).reduce((sum,n,i) => sum + n*layers[i], 0);
    const biases = processing.reduce((a,b) => a+b, 0);
    /** @type {Record<string, number>} */
    const all = {
      global:outputs*inputs,
      self:processing.reduce((a,b) => a+b, 0),
      lateral:processing.reduce((sum,n) => sum + n*(n-1), 0),
      interlayer:processing.slice(1).reduce((sum,n,i) => sum + n*processing[i], 0)
    };
    /** @type {Record<string, number>} */
    const feedbackEdges = {};
    for (const f of feedback) feedbackEdges[f] = all[f];
    const loops = Object.values(feedbackEdges).reduce((a,b) => a+b, 0);
    return {layers, weights, biases, parameters:weights+biases+loops, feedbackEdges,
      kind:loops > 0 ? 'visszacsatolt' : 'előrecsatolt', depth:hidden.length ? 'többrétegű' : 'egyrétegű'};
  }
  // Rögzített, zajos mintavétel a sin(2πx) görbéből; a zaj előre megadott, hogy a grafikon ismételhető legyen.
  const trainX = Array.from({length:10},(_,i) => i/9);
  const trainNoise = [.12,-.08,.15,-.1,.05,-.14,.09,-.05,.11,-.12];
  const testX = Array.from({length:9},(_,i) => (i+.5)/9);
  const testNoise = [-.05,.06,-.04,.07,-.06,.03,-.07,.05,-.03];
  /** @param {number} x */
  const truth = x => Math.sin(2*Math.PI*x);
  const trainSet = trainX.map((x,i) => ({x, y:truth(x)+trainNoise[i]}));
  const testSet = testX.map((x,i) => ({x, y:truth(x)+testNoise[i]}));
  /** Legkisebb négyzetes illesztés Householder-QR-rel a [−1,1]-re skálázott x-en.
   * @param {{x:number, y:number}[]} points @param {number} degree */
  function polyFit(points, degree) {
    const m = points.length, n = degree+1;
    if (m < n) throw Error('Kevés pont.');
    const A = points.map(p => Array.from({length:n},(_,j) => (2*p.x-1)**j)), y = points.map(p => p.y);
    for (let k = 0; k < n; k++) {
      const norm = Math.hypot(...A.slice(k).map(r => r[k]));
      const alpha = A[k][k] > 0 ? -norm : norm;
      const v = A.slice(k).map((r,i) => r[k] - (i === 0 ? alpha : 0));
      const vv = v.reduce((s,vi) => s + vi*vi, 0);
      if (vv === 0) continue;
      for (let j = k; j < n; j++) {
        const s = 2*v.reduce((sum,vi,i) => sum + vi*A[k+i][j], 0)/vv;
        v.forEach((vi,i) => {A[k+i][j] -= s*vi;});
      }
      const s = 2*v.reduce((sum,vi,i) => sum + vi*y[k+i], 0)/vv;
      v.forEach((vi,i) => {y[k+i] -= s*vi;});
    }
    const c = Array(n).fill(0);
    for (let i = n-1; i >= 0; i--) c[i] = (y[i] - A[i].slice(i+1).reduce((s,a,j) => s + a*c[i+1+j], 0))/A[i][i];
    return c;
  }
  /** @param {number[]} c @param {number} x */
  const polyValue = (c, x) => c.reduce((s,ci,j) => s + ci*(2*x-1)**j, 0);
  /** @param {number} degree */
  function overfitting(degree) {
    if (!Number.isInteger(degree) || degree < 0 || degree > 9) throw Error('A fokszám 0 és 9 közötti egész.');
    const c = polyFit(trainSet,degree);
    /** @param {{x:number, y:number}[]} set */
    const mse = set => set.reduce((s,p) => s + (polyValue(c,p.x)-p.y)**2, 0)/set.length;
    return {coefficients:c, trainError:mse(trainSet), testError:mse(testSet), trainSet, testSet,
      curve:Array.from({length:101},(_,i) => ({x:i/100, y:polyValue(c,i/100)}))};
  }
  /** @param {number[]} p */
  function checkDistribution(p) {
    if (!p.every(v => Number.isFinite(v) && v >= 0) || Math.abs(p.reduce((a,b) => a+b, 0) - 1) > 1e-9) throw Error('Valószínűségi eloszlás kell.');
  }
  /** @param {number[]} p */
  function entropy(p) {
    checkDistribution(p);
    return p.reduce((s,v) => v > 0 ? s - v*Math.log2(v) : s, 0);
  }
  /** @param {number[]} p @param {number[]} q */
  function klDivergence(p, q) {
    checkDistribution(p); checkDistribution(q);
    return p.reduce((s,v,i) => v === 0 ? s : q[i] === 0 ? Infinity : s + v*Math.log2(v/q[i]), 0);
  }
  /** @param {number[][]} joint */
  function mutualInformation(joint) {
    checkDistribution(joint.flat());
    const px = joint.map(r => r.reduce((a,b) => a+b, 0)), py = joint[0].map((_,j) => joint.reduce((s,r) => s + r[j], 0));
    return joint.reduce((s,r,i) => s + r.reduce((t,v,j) => v > 0 ? t + v*Math.log2(v/(px[i]*py[j])) : t, 0), 0);
  }
  return {activations, activate, neuron, xorByHand, gates, countCorrect, perceptronUpdate, trainPerceptron, singleNeuronStep, landscapes, descend,
    exampleNetwork, forward, backpropStep, trainXor, networkSummary, overfitting, entropy, klDivergence, mutualInformation};
})();
if (typeof module !== 'undefined') module.exports = CourseNeural;
