const CourseNeural = (() => {
  /** @type {Record<string, (value:number) => number>} */
  const activations = {
    linear: x => x,
    step: x => x >= 0 ? 1 : 0,
    sign: x => x >= 0 ? 1 : -1,
    piecewise: x => Math.max(0, Math.min(1, (x + 1) / 2)),
    relu: x => Math.max(0, x),
    leaky: x => x >= 0 ? x : .1 * x,
    gaussian: x => Math.exp(-x * x / 2),
    sigmoid: x => 1 / (1 + Math.exp(-x)),
    swish: x => x / (1 + Math.exp(-x)),
    tanh: x => Math.tanh(x),
    elu: x => x >= 0 ? x : Math.expm1(x)
  };
  /** @param {number[]} inputs @param {number[]} weights @param {number} bias @param {string} activation */
  function neuron(inputs, weights, bias, activation) {
    const sum = inputs.reduce((total, input, index) => total + input * weights[index], bias);
    return {sum, output:activations[activation](sum)};
  }
  /** @param {number} weight @param {number} input @param {number} target @param {number} rate */
  function gradientStep(weight, input, target, rate) {
    const output = activations.sigmoid(weight * input);
    const gradient = (output - target) * output * (1 - output) * input;
    return {output, loss:(output-target)**2/2, gradient, next:weight-rate*gradient};
  }
  /** @param {number[]} inputs @param {number[][]} hiddenWeights @param {number[]} outputWeights @param {number} target @param {number} rate */
  function backprop(inputs, hiddenWeights, outputWeights, target, rate) {
    const hidden = hiddenWeights.map(weights => neuron(inputs, weights.slice(0,2), weights[2], 'sigmoid').output);
    const output = neuron(hidden, outputWeights.slice(0,2), outputWeights[2], 'sigmoid').output;
    const outputDelta = (output-target)*output*(1-output);
    const hiddenDeltas = hidden.map((value,index) => value*(1-value)*outputWeights[index]*outputDelta);
    return {
      hidden, output, loss:(output-target)**2/2, outputDelta, hiddenDeltas,
      nextHidden:hiddenWeights.map((weights,index) => weights.map((weight,position) => weight-rate*hiddenDeltas[index]*(position === 2 ? 1 : inputs[position]))),
      nextOutput:outputWeights.map((weight,index) => weight-rate*outputDelta*(index === 2 ? 1 : hidden[index]))
    };
  }
  /** @param {number} x @param {number} y @param {number} weightX @param {number} weightY @param {number} bias */
  function classify(x,y,weightX,weightY,bias) {return x*weightX+y*weightY+bias >= 0 ? 1 : 0;}
  /** @param {number[][]} samples @param {number[]} targets @param {number[]} weights @param {number} rate */
  function perceptronEpoch(samples,targets,weights,rate) {
    const next = weights.slice();
    const changes = samples.map(([x,y],index) => {
      const prediction = classify(x,y,next[0],next[1],next[2]);
      const error = targets[index]-prediction;
      next[0] += rate*error*x; next[1] += rate*error*y; next[2] += rate*error;
      return {prediction,error,weights:next.slice()};
    });
    return {weights:next,changes};
  }
  return {activations,neuron,gradientStep,backprop,classify,perceptronEpoch};
})();
if (typeof module !== 'undefined') module.exports = CourseNeural;
