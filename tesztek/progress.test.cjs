const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readProgress, writeProgress} = require('../assets/js/progress.js');
test('A kész jelölés menthető, visszaolvasható és törölhető', () => {
  const data = new Map();
  const store = {getItem:k => data.get(k) ?? null, setItem:(k,v) => data.set(k,v), removeItem:k => data.delete(k)};
  assert.equal(readProgress(store), false);
  assert.equal(writeProgress(store, true), true);
  assert.equal(readProgress(store), true);
  assert.equal(writeProgress(store, false), true);
  assert.equal(readProgress(store), false);
  assert.equal(data.size, 0);
});
test('A tiltott vagy hibás tároló nem akadályozza a tanulást', () => {
  const blocked = {getItem:() => {throw Error('blocked');}, setItem:() => {throw Error('blocked');}, removeItem:() => {throw Error('blocked');}};
  assert.equal(readProgress(blocked), false);
  assert.equal(writeProgress(blocked, true), false);
  assert.equal(readProgress(null), false);
  assert.equal(readProgress({getItem:()=>'bad data'}), false);
});
