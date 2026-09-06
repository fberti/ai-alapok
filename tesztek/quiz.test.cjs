const {test} = require('node:test');
const assert = require('node:assert/strict');
const {grade, questions} = require('../assets/js/quiz.js');
test('A kvíz magyarázatot ad a helyes és hibás válaszhoz is', () => {
  assert.equal(grade(0, 1).correct, true);
  assert.equal(grade(0, 0).correct, false);
  assert.match(grade(0, 0).text, /következetes/);
});
test('A hiányzó válasz nem helyes találat és nem tiltja le az oldalt', () => {
  assert.equal(grade(0, null).correct, false);
  assert.match(grade(0, null).text, /Válassz/);
  assert.equal(questions.length, 10);
  for (const question of questions) {
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.ok(question.explanation.length > 30);
  }
});
