const {test} = require('node:test');
const assert = require('node:assert/strict');
const model = require('../assets/js/neural');
const near = (actual, expected, eps = 1e-9) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≠ ${expected}`);

test('Mind a tizenegy aktivációs függvény a PDF képletét követi', () => {
  const f = model.activate;
  assert.equal(Object.keys(model.activations).length, 11);
  assert.equal(f('linear', 3, 2), 6);
  assert.equal(f('threshold', 0), 1);
  assert.equal(f('threshold', -1e-9), 0);
  assert.deepEqual([-2, 0, 2].map(a => f('sign', a)), [-1, 0, 1]);
  assert.deepEqual([-1, -.5, 0, .5, 1].map(a => f('piecewise', a)), [0, 0, .5, 1, 1]);
  assert.deepEqual([-2, 0, 3].map(a => f('relu', a)), [0, 0, 3]);
  near(f('leakyRelu', -2), -.02);
  assert.equal(f('leakyRelu', 2), 2);
  assert.equal(f('gaussian', 0), 1);
  near(f('gaussian', 1), Math.exp(-1));
  assert.equal(f('sigmoid', 0), .5);
  assert.equal(f('sigmoid', -1000), 0);
  near(f('swish', 1), 1 / (1 + Math.exp(-1)));
  assert.ok(f('swish', -1) < 0 && f('swish', -1) < f('swish', -5), 'A swish nem monoton');
  near(f('tanh', .5), Math.tanh(.5));
  near(f('elu', -1), Math.exp(-1) - 1);
  assert.equal(f('elu', 2), 2);
  assert.throws(() => f('softmax', 1));
  assert.throws(() => f('sigmoid', NaN));
});

test('A neuron súlyozott összeget és kimenetet számol, a torzítás −θ', () => {
  const r = model.neuron([1, 0], [.6, .6], -.5, 'threshold');
  near(r.a, .1);
  assert.equal(r.o, 1);
  assert.equal(model.neuron([0, 0], [.6, .6], -.5, 'threshold').o, 0);
  assert.throws(() => model.neuron([1], [1, 2], 0, 'relu'));
});

test('A kézzel beállított kétrétegű háló az XOR-t valósítja meg', () => {
  assert.deepEqual([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => model.xorByHand(a, b).o), [0, 1, 1, 0]);
  assert.deepEqual(model.xorByHand(0, 1).hidden, [1, 0]);
});

test('A perceptron megtanulja az ÉS és VAGY kaput, az XOR-t nem', () => {
  for (const gate of ['and', 'or', 'nand']) {
    const r = model.trainPerceptron(model.gates[gate], {weights: [0, 0], bias: 0, rate: .5, maxEpochs: 50});
    assert.equal(r.converged, true, gate);
    assert.equal(model.countCorrect(model.gates[gate], r.weights, r.bias), 4, gate);
  }
  const xor = model.trainPerceptron(model.gates.xor, {weights: [0, 0], bias: 0, rate: .5, maxEpochs: 50});
  assert.equal(xor.converged, false);
  assert.equal(xor.epochs, 50);
  assert.ok(model.countCorrect(model.gates.xor, xor.weights, xor.bias) <= 3);
  const first = xor.steps[0];
  assert.deepEqual(Object.keys(first).sort(), ['bias', 'd', 'epoch', 'o', 'weights', 'x']);
});

test('Egy neuron deriváltja negatív előjelű, a helyes lépés csökkenti a hibát', () => {
  const r = model.singleNeuronStep([1, 2], [.5, -.25], 1, .4);
  assert.equal(r.o, .5);
  assert.equal(r.error, .25);
  assert.deepEqual(r.gradient, [-.25, -.5]);
  near(r.next[0], .6); near(r.next[1], -.05);
  near(r.nextError, (1 - 1 / (1 + Math.exp(-.5))) ** 2);
  assert.ok(r.nextError < r.error);
  near(r.wrongSign[0], .4); near(r.wrongSign[1], -.45);
  assert.ok(r.wrongSignError > r.error);
});

test('A gradienscsökkentés konvergál, oszcillál vagy elszáll a tanulási rátától függően', () => {
  const small = model.descend('bowl', -2, .1, 60);
  assert.equal(small.status, 'converged');
  near(small.points.at(-1).w, 2, 1e-3);
  assert.equal(model.descend('bowl', -2, 1, 20).status, 'oscillating');
  assert.equal(model.descend('bowl', -2, 1.2, 40).status, 'diverged');
  const local = model.descend('twoValleys', 2, .05, 200);
  assert.equal(local.status, 'converged');
  assert.ok(local.points.at(-1).w > 0, 'Jobbról indulva a sekélyebb völgyben akad el');
  assert.ok(model.descend('twoValleys', -2, .05, 200).points.at(-1).w < 0);
  assert.throws(() => model.descend('bowl', 0, -1, 5));
});

test('A hibavisszaterjesztés egy lépése kézzel ellenőrizhető számokat ad', () => {
  const net = model.exampleNetwork();
  const r = model.backpropStep(net, [1, 0], 1, .5);
  const sig = x => 1 / (1 + Math.exp(-x));
  const h1 = sig(.4 * 1 + .1), h2 = sig(-.3 * 1 - .2);
  near(r.hidden[0], h1); near(r.hidden[1], h2);
  const o = sig(.6 * h1 - .5 * h2 + .1);
  near(r.o, o);
  const dOut = o * (1 - o) * (1 - o);
  near(r.deltaOut, dOut);
  near(r.deltaHidden[0], h1 * (1 - h1) * .6 * dOut);
  near(r.deltaHidden[1], h2 * (1 - h2) * -.5 * dOut);
  near(r.next.output.w[0], .6 + .5 * dOut * h1);
  near(r.next.hidden[0].w[0], .4 + .5 * r.deltaHidden[0] * 1);
  assert.equal(r.next.hidden[0].w[1], .2, 'Nulla bemenet súlya nem változik');
  assert.equal(net.output.w[0], .6, 'Az eredeti háló nem módosul');
  assert.ok(model.backpropStep(r.next, [1, 0], 1, .5).error < r.error);
});

test('A mintapéldás háló hibavisszaterjesztéssel megtanulja az XOR-t', () => {
  const r = model.trainXor(model.exampleNetwork(), 1, 3000);
  assert.ok(r.losses.at(-1) < r.losses[0] / 10);
  assert.deepEqual(r.outputs.map(Math.round), [0, 1, 1, 0]);
});

test('A hálószerkesztő megszámolja a súlyokat és a visszacsatolásokat', () => {
  const ff = model.networkSummary({inputs: 2, hidden: [3], outputs: 1, feedback: []});
  assert.deepEqual([ff.weights, ff.biases, ff.parameters, ff.kind, ff.depth], [9, 4, 13, 'előrecsatolt', 'többrétegű']);
  const single = model.networkSummary({inputs: 3, hidden: [], outputs: 2, feedback: []});
  assert.deepEqual([single.weights, single.depth], [6, 'egyrétegű']);
  const rec = model.networkSummary({inputs: 3, hidden: [3, 3], outputs: 3, feedback: ['global', 'self', 'lateral', 'interlayer']});
  assert.equal(rec.kind, 'visszacsatolt');
  assert.deepEqual(rec.feedbackEdges, {global: 9, self: 9, lateral: 18, interlayer: 18});
  assert.equal(rec.parameters, rec.weights + rec.biases + 54, 'A visszacsatoló kapcsolatoknak is van súlyuk');
  assert.throws(() => model.networkSummary({inputs: 0, hidden: [], outputs: 1, feedback: []}));
});

test('A polinomillesztés növekvő fokszámmal a tanítóhibát csökkenti, a teszthibát végül növeli', () => {
  const results = [1, 3, 9].map(d => model.overfitting(d));
  assert.ok(results[0].trainError > results[1].trainError);
  assert.ok(results[2].trainError < 1e-6, 'Tíz pontra kilencedfokú polinom interpolál');
  assert.ok(results[1].testError < results[0].testError);
  assert.ok(results[2].testError > results[1].testError * 5);
  assert.equal(model.overfitting(3).curve.length, 101);
  assert.throws(() => model.overfitting(10));
});

test('Az entrópia, a kölcsönös információ és a KL-divergencia bitben', () => {
  near(model.entropy([.5, .5]), 1);
  near(model.entropy([1, 0]), 0);
  near(model.entropy([.9, .1]), .4689955935892812);
  near(model.klDivergence([.5, .5], [.9, .1]), .5 * Math.log2(.5 / .9) + .5 * Math.log2(.5 / .1));
  assert.equal(model.klDivergence([.5, .5], [.5, .5]), 0);
  near(model.mutualInformation([[.25, .25], [.25, .25]]), 0);
  near(model.mutualInformation([[.5, 0], [0, .5]]), 1);
  assert.throws(() => model.entropy([.5, .6]));
});

test('Egyetlen perceptronlépés csak hibás kimenetnél módosít', () => {
  const miss = model.perceptronUpdate({x: [1, 1], d: 1}, [0, 0], -.5, .5);
  assert.deepEqual(miss, {o: 0, weights: [.5, .5], bias: 0, changed: true});
  const hit = model.perceptronUpdate({x: [0, 0], d: 0}, [.5, .5], -.5, .5);
  assert.deepEqual(hit, {o: 0, weights: [.5, .5], bias: -.5, changed: false});
});
