const {test} = require('node:test');
const assert = require('node:assert/strict');
const {evaluateBoard, toggleQueen} = require('../assets/js/queens.js');
test('Nyolc, egymást nem támadó vezér megoldja a feladatot', () => {
  const board = [0,12,23,29,34,46,49,59];
  assert.deepEqual(evaluateBoard(board), {count:8, conflicts:[], solved:true});
});
test('A sor, oszlop és átló ütközése látható, a részmegoldás még nem kész', () => {
  for (const board of [[0,1], [0,8], [0,9]]) {
    assert.deepEqual(evaluateBoard(board).conflicts, board);
    assert.equal(evaluateBoard(board).solved, false);
  }
  assert.equal(evaluateBoard([0,12]).solved, false);
  assert.equal(evaluateBoard([]).solved, false);
});
test('A mező kapcsolható, a kilencedik vezér és hibás mező nem kerül a táblára', () => {
  assert.deepEqual(toggleQueen([0], 0), []);
  assert.deepEqual(toggleQueen([], 5), [5]);
  const eight = [0,1,2,3,4,5,6,7];
  assert.deepEqual(toggleQueen(eight, 8), eight);
  for (const invalid of [-1,64,1.2,NaN]) assert.deepEqual(toggleQueen([], invalid), []);
});
