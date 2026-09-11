const {test} = require('node:test');
const assert = require('node:assert/strict');
const model = require('../assets/js/representation.js');
test('A hasonlóság súlyozott és korlátos; a nulla súly nem választ esetet', () => {
  assert.equal(model.similarity([50,5], [50,5], [1,1]), 1);
  assert.equal(model.similarity([50,5], [100,10], [1,1]), 0.5);
  assert.equal(model.similarity([50,5], [100,5], [3,1]), 0.625);
  assert.equal(model.similarity([50,5], [100,5], [0,0]), null);
  assert.equal(model.rankCases([45,2], [1,1])[0].name, 'Olvasósarok');
  assert.equal(model.rankCases([110,6], [1,1])[0].name, 'Bárpult');
  assert.equal(model.rankCases([75,8], [1,1])[0].successful, false);
});
test('A bárszék helyi értékei győznek; az asztal alapértéke és szigorú tartománya megmarad', () => {
  assert.deepEqual(model.frame('Bárszék', ''), {height:1.2, material:'alumínium', legs:3, color:'barna', purpose:'ülőhely', source:'Bárszék'});
  assert.equal(model.frame('Asztal', '').height, 1);
  assert.equal(model.frame('Asztal', '1.3').source, 'saját érték');
  for (const value of ['0.4','1.4','abc','Infinity']) assert.throws(() => model.frame('Asztal', value), /magasság/i);
  assert.equal(model.frame('Bárszék', '2').height, 2);
});
test('A kivétel felülírja az alapértéket; az autó konfliktusa csak megadott elvvel oldható fel', () => {
  assert.equal(model.flight(false), 'igen');
  assert.equal(model.flight(true), 'nem');
  assert.equal(model.insurance('none'), 'ellentmondás');
  assert.equal(model.insurance('default'), 'nem');
  assert.equal(model.insurance('car'), 'igen');
  assert.equal(model.insurance('stunt'), 'nem');
});
test('A tulajdonság öröklődik, de nem lesz osztályél; a hibás él nem változtatja meg a hálót', () => {
  const graph = model.network();
  model.addEdge(graph, 'Madár', 'featured_by', 'melegvérű');
  assert.ok(model.properties(graph, 'Veréb').includes('melegvérű'));
  assert.equal(model.path(graph, 'Veréb', 'melegvérű'), null);
  const saved = JSON.stringify(graph);
  for (const args of [['Madár','featured_by','melegvérű'],['','is_a','Állat'],['Madár','is_a','Ismeretlen']]) {
    assert.throws(() => model.addEdge(graph,...args));
    assert.equal(JSON.stringify(graph), saved);
  }
  model.addEdge(graph, '__proto__', 'instance_of', 'Veréb');
  assert.ok(model.properties(graph, '__proto__').includes('lélegzik'));
  assert.equal(Object.getPrototypeOf(graph.nodes), Object.prototype);
});
test('Új egyed örököl, törölt él után nem; a kör hibát ad', () => {
  const graph = model.network();
  model.addEdge(graph, 'Csipike', 'instance_of', 'Veréb');
  assert.deepEqual(model.path(graph, 'Csipike', 'Állat'), ['Csipike','Veréb','Madár','Állat']);
  assert.ok(model.properties(graph, 'Csipike').includes('lélegzik'));
  assert.throws(() => model.addEdge(graph, 'Állat', 'is_a', 'Veréb'), /kör/i);
  assert.throws(() => model.addEdge(graph, 'Madár', 'instance_of', 'Hal'), /típus/i);
  model.removeEdge(graph, graph.edges.length - 1);
  assert.equal(model.path(graph, 'Csipike', 'Állat'), null);
});
