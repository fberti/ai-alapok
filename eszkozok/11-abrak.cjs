// A 11. fejezet (zárthelyi-gyakorló) generált ábráinak és táblázatainak előállítása a tesztelt modellekből.
// Használat a projekt gyökeréből: node eszkozok/11-abrak.cjs [sablon] [kimenet]
// Alapértelmezés: eszkozok/11-sablon.html → fejezetek/11-zh-gyakorlo.html
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const S = require(path.join(ROOT, 'assets/js/search.js'));
const Z = require(path.join(ROOT, 'assets/js/zh.js'));
const {ZH2} = S;
const F = {};
const esc = S.esc;
const sub = (t, id) => { const l = S.labels(t.nodes)[id]; return esc(l.name) + (l.index === null ? '' : `<sub>${l.index}</sub>`); };
const hOf = (t, id, heur) => heur[t.nodes[id].state] ?? 0;
/** Egy frontelem a választott jelöléssel: csak név, útköltség (g), becslés (h) vagy g+h=f. */
function item(t, id, mode, heur) {
  const n = t.nodes[id];
  if (mode === 'g') return `${sub(t, id)} (${n.cost})`;
  if (mode === 'h') return `${sub(t, id)} (${hOf(t, id, heur)})`;
  if (mode === 'f') return `${sub(t, id)} (${n.cost}+${hOf(t, id, heur)}=${n.cost + hOf(t, id, heur)})`;
  return sub(t, id);
}
const list = (t, ids, mode, heur) => (ids.length ? ids.map((i) => item(t, i, mode, heur)).join(', ') : '–');
const heads = {'': 'A front utána', g: 'A front utána (útköltség), rendezve', h: 'A front utána (h), rendezve', f: 'A front utána (g+h=f), rendezve'};

/** Lépésenkénti fronttáblázat. */
function frontTable(t, {id, caption, mode = '', heur = {}}) {
  let rows = `<tr><td>0.</td><td>–</td><td>${list(t, t.initialFront, mode, heur)}</td><td>A front a Start állapot.</td></tr>`;
  t.steps.forEach((s, i) => {
    let note;
    if (s.goal && t.nodes[s.visit].status === 'goal') note = '<strong>Cél, megállunk.</strong>';
    else if (s.children.length) note = `Új: ${s.children.map((c) => sub(t, c)).join(', ')}.`;
    else note = 'Nincs új gyereke, zsákutca.';
    rows += `<tr><td>${i + 1}.</td><td>${item(t, s.visit, mode, heur)}</td><td>${list(t, s.front, mode, heur)}</td><td>${note}</td></tr>`;
  });
  return `<div class="u-table-wrap"><table class="u-table u-table-trace" id="${id}"><caption>${caption}</caption><thead><tr><th>Lépés</th><th>Belépünk</th><th>${heads[mode]}</th><th>Mi történt?</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
const fig = (id, svg, cap, cls = 'u-tree') => `<figure class="u-plot ${cls}" id="${id}"><div class="u-scroll">${svg}</div><figcaption>${cap}</figcaption></figure>`;
const run = (strategy, heur) => S.search(ZH2.adj, 'S', 'G', {strategy, heur, order: 'abc', tie: 'abc'});
const pathText = (t) => t.path.join(' → ');

/* A minta-zh ábrái: a 8. feladat gráfja és a 4. feladat hálója (ez a 6. fejezet rajza, onnan átvéve) */
F['zh-map'] = `<div class="u-scroll">${S.graphSvg(S.ZH, {id: 'zh-g', title: 'A minta-zh 8. feladatának gráfja: S-ből G-be, 13 csomópont, 19 irányított, súlyozott él, a csomópontokban a becslés', heur: S.ZH.heur})}</div>`;
{
  const six = fs.readFileSync(path.join(ROOT, 'fejezetek/06-neuralis-halozatok.html'), 'utf8');
  const k = six.indexOf('id="elore-zh-abra"');
  if (k < 0) throw new Error('A 6. fejezetből hiányzik a minta-zh hálójának ábrája (elore-zh-abra).');
  const figure = six.slice(six.lastIndexOf('<figure', k), six.indexOf('</figure>', k) + 9);
  F['zh-net'] = figure.replace('id="elore-zh-abra"', 'id="zh-halo-abra"');
}

/* A gyakorló gráf */
F['g2-map'] = `<div class="u-scroll">${S.graphSvg(ZH2, {id: 'g2-g', title: 'A gyakorló gráf: S-ből G-be, 9 csomópont, 14 irányított, súlyozott él, a csomópontokban a becslés', heur: ZH2.heur})}</div>`;
F['g2-edges'] = Object.entries(ZH2.adj).flatMap(([a, l]) => l.map(([b, c]) => `${a}→${b} ${c}`)).join(', ');
F['g2-heur'] = Object.entries(ZH2.heur).map(([n, h]) => `h(${n}) = ${h}`).join(', ');

const tD = run('dfs');
F['g2-dfs-tree'] = fig('g2-dfs-fa', S.treeSvg(tD, {id: 'g2-dfs-t', title: 'A gyakorló gráf mélységi keresőfája ABC-sorrenddel, belelépéskori célteszttel', gap: 64, showCost: true}),
  `Mélységi keresőfa. A csomópont alatt a belelépés sorszáma és az útköltség. A kiemelt út ${pathText(tD)}, költsége ${tD.cost}. Az E két példánya (E<sub>1</sub> az A, E<sub>2</sub> a D gyereke) a feltárás sorrendjében kapott indexet.`);
F['g2-dfs-table'] = frontTable(tD, {id: 'g2-dfs-front', caption: 'A mélységi keresés frontja lépésenként. Az új gyerekek ABC-sorrendben a front elejére kerülnek; mindig az első elembe lépünk.'});
F['g2-dfs-path'] = `${pathText(tD)}, költsége ${tD.cost}`;
F['g2-dfs-front'] = list(tD, tD.front, '');

const tA = run('astar', ZH2.heur);
F['g2-astar-tree'] = fig('g2-astar-fa', S.treeSvg(tA, {id: 'g2-astar-t', title: 'A gyakorló gráf A*-keresőfája g+h=f értékekkel', gap: 88, heur: ZH2.heur}),
  `A*-keresőfa. A csomópont alatt g + h = f, alatta a belelépés sorszáma. Öt belelépés elég: a becslés végig a jó úton tartja a keresést. A kiemelt út ${pathText(tA)}, költsége ${tA.cost}.`);
F['g2-astar-table'] = frontTable(tA, {id: 'g2-astar-front', mode: 'f', heur: ZH2.heur, caption: 'Az A* frontja lépésenként, f szerint rendezve; egyenlő f esetén az ABC dönt. A célt belelépéskor ellenőrizzük.'});
F['g2-astar-path'] = `${pathText(tA)}, költsége ${tA.cost}`;
F['g2-astar-front'] = list(tA, tA.front, 'f', ZH2.heur);

const tB = run('bfs'), tU = run('ucs'), tG = run('greedy', ZH2.heur);
F['g2-bfs-table'] = frontTable(tB, {id: 'g2-bfs-front', caption: 'Szélességi keresés: az új gyerekek a front végére kerülnek.'});
F['g2-ucs-table'] = frontTable(tU, {id: 'g2-ucs-front', mode: 'g', caption: 'Egyenletes költségű keresés: a front növekvő útköltség szerint rendezett, egyenlőségnél az ABC dönt.'});
F['g2-greedy-table'] = frontTable(tG, {id: 'g2-moho-front', mode: 'h', heur: ZH2.heur, caption: 'Mohó legjobb-első keresés: csak a becslés, h(n) számít.'});
{
  const rows = [['Mélységi', tD, ''], ['Szélességi', tB, ''], ['Egyenletes költségű', tU, 'g'], ['Mohó legjobb-első', tG, 'h'], ['A*', tA, 'f']]
    .map(([n, t, m]) => `<tr><td>${n}</td><td>${pathText(t)}</td><td>${t.cost}</td><td>${t.visits}</td><td>${list(t, t.front, m, ZH2.heur)}</td></tr>`).join('');
  F['g2-summary'] = `<div class="u-table-wrap"><table class="u-table" id="g2-osszegzes"><caption>Az öt kereső a gyakorló gráfon, ABC-sorrenddel, ABC-döntetlennel és belelépéskori célteszttel. A legolcsóbb út 10; ezt csak az egyenletes költségű keresés és az A* garantálja.</caption><thead><tr><th>Eljárás</th><th>Talált út</th><th>Költség</th><th>Belelépés</th><th>A front a végén</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
const over = {...ZH2.heur, F: 9};
const tO = run('astar', over);
F['g2-over-table'] = frontTable(tO, {id: 'g2-tulbecsles-front', mode: 'f', heur: over, caption: `Ugyanez h(F) = 9 túlbecsléssel (a valódi hátralévő költség 5). Az F f-értéke 5 + 9 = 14 lesz, ezért a jó ág a front végére szorul, és a keresés a ${tO.cost} költségű ${pathText(tO)} utat adja.`});
F['g2-over-path'] = `${pathText(tO)}, költsége ${tO.cost}`;

/* A lámpafeladat gyakorló változata: táblázat az elitizmushoz */
{
  const pop = ['BDFG', 'CH', 'ABEFH', 'ADG'].map(Z.encode);
  const g = Z.generation(pop, [[0, 2], [1, 3]], 3);
  const rows = g.ranked.map((e, i) => { const l = Z.lamps(e.bits); return `<tr${i < 3 ? ' class="u-row-hit"' : ''}><td>${i + 1}.</td><td>${e.name}</td><td><code>${e.bits}</code></td><td>${l.on.join(', ')}</td><td>${l.energy}</td><td>${e.fitness}</td></tr>`; }).join('');
  F['ga2-rank'] = `<div class="u-table-wrap"><table class="u-table u-table-num" id="ga2-rangsor"><caption>A hat egyed (a négy szülőjelölt és a két utód) fitnesz szerinti rangsora. A kiemelt első három az elit.</caption><thead><tr><th>Hely</th><th>Egyed</th><th>Kromoszóma</th><th>Ég</th><th>Energia</th><th>Fitnesz</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

const tpl = process.argv[2] || path.join(__dirname, '11-sablon.html');
const out = process.argv[3] || path.join(ROOT, 'fejezetek/11-zh-gyakorlo.html');
const src = fs.readFileSync(tpl, 'utf8');
const html = src.replace(/<!--@([a-z0-9-]+)-->/g, (m, k) => { if (!(k in F)) throw new Error('Hiányzó darab: ' + k); return F[k]; });
const left = Object.keys(F).filter((k) => !src.includes(`<!--@${k}-->`));
if (left.length) console.error('Fel nem használt darabok:', left.join(', '));
fs.writeFileSync(out, html);
console.log('kész', out, html.length);
