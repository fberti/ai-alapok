const {test} = require('node:test');
const assert = require('node:assert/strict');
const Rules = require('../assets/js/rules.js');
test('Az előreláncolás lezárja a tényeket, nem módosít bemenetet, és nem talál ki hiányzó tényt', () => {
  const input = ['a','b','c'];
  assert.deepEqual(Rules.forward(input).facts, ['a','b','c','e']);
  assert.deepEqual(input, ['a','b','c']);
  assert.deepEqual(Rules.forward(['a','b','c','d']).facts, ['a','b','c','d','e','f','g']);
  assert.deepEqual(Rules.apply(input,'R3'), input);
  assert.deepEqual(Rules.apply(input,'ismeretlen'), input);
  assert.deepEqual(Rules.applicable(['a','b','c','d']).map(r => r.id), ['R1','R2']);
});
test('A PDF a,b,c,d tényeiből e,f,g következik, egyesével', () => {
  let facts = ['a','b','c','d'];
  for (const id of ['R1','R2','R3']) facts = Rules.apply(facts, id);
  assert.deepEqual(facts, ['a','b','c','d','e','f','g']);
  assert.deepEqual(Rules.applicable(facts), []);
});
test('A g cél hátraláncolása az e és f részcélon át ellenőrzi a tényeket', () => {
  const result = Rules.backward(['a','b','c','d'], 'g');
  assert.equal(result.proven, true);
  assert.deepEqual(result.steps.filter(s => s.kind === 'goal').map(s => s.fact), ['g','e','a','b','f','c','d']);
  assert.equal(Rules.backward(['a','b','c'], 'g').proven, false);
  assert.equal(Rules.backward([], 'x').proven, false);
});
