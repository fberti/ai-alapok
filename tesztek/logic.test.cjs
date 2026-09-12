const {test} = require('node:test');
const assert = require('node:assert/strict');
const logic = require('../assets/js/logic.js');

test('Mind az öt művelet, az állandók és az elsőbbség a megadott táblát követi', () => {
  for (const [formula, results] of [
    ['!p', [false,true]], ['p & q', [true,false,false,false]],
    ['p | q', [true,true,true,false]], ['p <-> q', [true,false,false,true]],
    ['T', [true]], ['F', [false]], ['!F', [true]],
    ['p | q & !p', [true,true,true,false]],
    ['p -> q -> p', [true,true,true,true]]
  ]) assert.deepEqual(logic.truthTable(formula).rows.map(row => row.result),results,formula);
  assert.equal(logic.truthTable('p ∨ ¬p').kind,'tautológia');
  assert.equal(logic.truthTable('p ∧ ¬p').kind,'ellentmondás');
  assert.deepEqual(logic.truthTable('p ≡ q'),logic.truthTable('p <-> q'));
});

test('A hibás, túl nagy és programkódnak látszó bemenet nem értékelhető', () => {
  for (const formula of ['', 'p &', 'p q', '(p', 'p)', 'p + q', 'P(x)', 'alert(1)', '<script>', 'true', 'p & q & r & s & t', '!'.repeat(161)+'p']) {
    assert.throws(() => logic.truthTable(formula), Error, formula);
  }
  assert.equal(logic.truthTable('(p & q) -> (r <-> !s)').rows.length,16);
  const rows = logic.truthTable('(p & q) -> (r <-> !s)').rows;
  assert.equal(rows.find(row => row.values.p && row.values.q && !row.values.r && !row.values.s).result,false);
  assert.equal(rows.find(row => !row.values.p && row.values.q && row.values.r && !row.values.s).result,true);
});

test('Az ekvivalencia, a kettős tagadás és a kétoldali szétosztás helyes KNF-et ad', () => {
  assert.deepEqual(logic.normalForm('p <-> (q & r)').clauses,[['¬p','q'],['¬p','r'],['¬q','¬r','p']]);
  assert.deepEqual(logic.normalForm('!(p | !q)').clauses,[['¬p'],['q']]);
  assert.deepEqual(logic.normalForm('(p & q) | (r & s)').clauses,[['p','r'],['p','s'],['q','r'],['q','s']]);
  assert.deepEqual(logic.normalForm('!!p').clauses,[['p']]);
});

test('Az állandók és tautologikus klózok a klózhalmazban egyszerűsödnek', () => {
  assert.deepEqual(logic.normalForm('T').clauses,[]);
  assert.deepEqual(logic.normalForm('F').clauses,[[]]);
  assert.deepEqual(logic.normalForm('(!T | p) & (q | !q)').clauses,[['p']]);
  assert.deepEqual(logic.normalForm('p & !T').clauses,[[]]);
});

test('A robbanásszerű normálformát már a megjelenítés előtt korlátozzuk', () => {
  assert.throws(() => logic.normalForm(Array(30).fill('p').join('↔')), /túl nagy/);
  assert.throws(() => logic.normalForm(Array(10).fill('(p & q)').join(' | ')), /túl nagy/);
  assert.deepEqual(logic.normalForm('p -> q').clauses,[['¬p','q']]);
});

test('Az implikáció csak igaz előtag és hamis utótag mellett hamis', () => {
  const table = logic.truthTable('p -> q');
  assert.deepEqual(table.variables, ['p', 'q']);
  assert.deepEqual(table.rows.map(row => row.result), [true, false, true, true]);
  assert.equal(table.kind, 'esetleges');
});

test('A normálforma négy lépésben megszünteti a nyilakat és szétosztja a VAGY műveletet', () => {
  const result = logic.normalForm('p -> (q & r)');
  assert.equal(result.steps.length, 4);
  assert.equal(result.steps[1], '(¬p ∨ (q ∧ r))');
  assert.equal(result.steps[3], '((¬p ∨ q) ∧ (¬p ∨ r))');
  assert.deepEqual(result.clauses, [['¬p','q'],['¬p','r']]);
});

test('A PDF rezolúciós lánca üres klózt ad, de két párt nem törlünk egyszerre', () => {
  const first = logic.resolve(['p','¬q'],['¬p','r'],'p');
  assert.deepEqual(first, ['¬q','r']);
  const second = logic.resolve(first,['¬r','¬s'],'r');
  assert.deepEqual(second, ['¬q','¬s']);
  const third = logic.resolve(second,['q'],'q');
  assert.deepEqual(logic.resolve(third,['s'],'s'), []);
  assert.deepEqual(logic.resolve(['p','q'],['¬p','¬q'],'p'), ['q','¬q']);
  assert.throws(() => logic.resolve(['p'],['q'],'p'), /ellentett/);
});
