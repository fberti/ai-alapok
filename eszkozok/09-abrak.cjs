// A 9. fejezet statikus ábráinak és táblázatainak előállítása a tesztelt search.js modellből.
// Használat a projekt gyökeréből: node eszkozok/09-abrak.cjs [sablon] [kimenet]
// Alapértelmezés: eszkozok/09-sablon.html → fejezetek/09-neminformalt-kereses.html
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const S = require(path.join(ROOT, 'assets/js/search.js'));
const {CITY, ZH, ABSTRACT, CODE21, BINARY} = S;
const F = {};
const esc = S.esc;
const fmt = (n) => String(n).replace('.', ',');
const lab = (t, id) => S.labelText(S.labels(t.nodes)[id]);
const sub = (t, id) => { const l = S.labels(t.nodes)[id]; return esc(l.name) + (l.index === null ? '' : `<sub>${l.index}</sub>`); };
const frontHtml = (t, ids, cost) => ids.length ? ids.map(i => sub(t, i) + (cost ? ` (${fmt(t.nodes[i].cost)})` : '')).join(', ') : '–';

/** Lépésenkénti fronttáblázat. */
function frontTable(t, {id, caption, cost = false, start = true}) {
  let rows = '';
  if (start) rows += `<tr><td>0.</td><td>–</td><td>${frontHtml(t, t.initialFront, cost)}</td><td>A front a Start állapot.</td></tr>`;
  t.steps.forEach((s, i) => {
    const kids = s.children.length ? s.children.map(c => sub(t, c) + (cost ? ` (${fmt(t.nodes[c].cost)})` : '')).join(', ') : '';
    let note;
    if (s.goal && t.nodes[s.visit].status === 'goal') note = '<strong>Cél, megállunk.</strong>';
    else if (s.goal) note = `Feltárás közben előkerült a cél (${sub(t, t.goalNode)}), megállunk.`;
    else if (s.cut) note = 'A mélységi korlátnál vagyunk, nem terjesztjük ki.';
    else if (kids) note = `Új: ${kids}.`;
    else note = 'Nincs új gyereke, zsákutca.';
    if (s.skipped.length && !s.goal) note += ` Kihagyva, mert már az úton van: ${s.skipped.map(esc).join(', ')}.`;
    rows += `<tr><td>${i + 1}.</td><td>${sub(t, s.visit)}${cost ? ` (${fmt(t.nodes[s.visit].cost)})` : ''}</td><td>${frontHtml(t, s.front, cost)}</td><td>${note}</td></tr>`;
  });
  return `<div class="u-table-wrap"><table class="u-table u-table-trace" id="${id}"><caption>${caption}</caption><thead><tr><th>Lépés</th><th>Belépünk</th><th>A front utána${cost ? ' (útköltség)' : ''}</th><th>Mi történt?</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
const fig = (id, svg, cap, cls = 'u-tree') => `<figure class="u-plot ${cls}" id="${id}"><div class="u-scroll">${svg}</div><figcaption>${cap}</figcaption></figure>`;

/* Absztrakt állapotgráf és keresőfa (281., 283., 284.) */
F['abs-graph'] = S.graphSvg(ABSTRACT, {id: 'abs-g', title: 'Az absztrakt állapotgráf: Start, a–h és Cél, irányított élekkel, két körrel (Start–b–f–Start és d–g–d)'});
const expandAdj = {Start: [['a', 1], ['b', 1], ['c', 1]], a: [], b: [['d', 1], ['e', 1], ['f', 1]], c: [], d: [], e: [], f: []};
// Csak a Start és a b kiterjesztése: egy segédköltséggel az egyenletes költségű keresés éppen b-t választja másodiknak.
const tExpB = S.search({...expandAdj, Start: [['a', 5], ['b', 1], ['c', 5]]}, 'Start', 'nincs', {strategy: 'ucs'});
F['abs-graph-hl'] = S.graphSvg(ABSTRACT, {id: 'abs-h', title: 'Állapotgráf: kiemelve a Start és a b kiterjesztésekor bejárt élek', pathEdges: ['Start>a', 'Start>b', 'Start>c', 'b>d', 'b>e', 'b>f'], marks: {Start: 'vis', b: 'vis', a: 'front', c: 'front', d: 'front', e: 'front', f: 'front'}});
F['abs-tree'] = S.treeSvg(tExpB, {id: 'abs-t', title: 'Keresőfa: a Start gyerekei a, b, c; b gyerekei d, e, f', step: 2, gap: 64, showVisit: false});
// Segédköltségekkel az egyenletes költségű keresés éppen a Start, b, d csomópontot terjeszti ki, ahogy a 284. oldal ábrája.
const lvlAdj = {Start: [['a', 9], ['b', 1], ['c', 9]], b: [['d', 1], ['e', 9], ['f', 9]], d: [['g', 9], ['h', 9], ['i', 9]], a: [], c: [], e: [], f: [], g: [], h: [], i: []};
const tLvl = S.search(lvlAdj, 'Start', 'nincs', {strategy: 'ucs'});
F['lvl-tree'] = fig('szintek', S.treeSvg(tLvl, {id: 'lvl-t', title: 'Három szint mély keresőfa: m = 3', step: 3, gap: 58, showVisit: false, levels: true}),
  'A 284. oldal keresőfája szintszámokkal. A Start a 0. szint. A fa mélysége m = 3. A Start, a b és a d elágazási tényezője egyaránt 3, ezért az átlagos elágazási tényező is (3 + 3 + 3) / 3 = 3. A front itt a, c, e, f, g, h és i: ezeket már feltártuk, de még nem léptünk beléjük.');

/* A 289. oldal számozott szélességi fája */
const bfsAdj = {n1: [['n2', 1], ['n3', 1], ['n4', 1], ['n5', 1]], n2: [['n6', 1], ['n7', 1]], n3: [['n8', 1], ['n9', 1]], n4: [['n10', 1]], n5: [['n11', 1], ['n12', 1]],
  n6: [['a', 1], ['b', 1]], n7: [], n8: [['c', 1], ['d', 1]], n9: [['e', 1]], n10: [['f', 1], ['g', 1]], n11: [], n12: [['h', 1], ['i', 1]]};
const tNum = S.search(bfsAdj, 'n1', 'n11', {strategy: 'bfs'});
F['bfs-num'] = fig('szelessegi-szamozas', S.treeSvg(tNum, {id: 'bfs-num-t', title: 'Szélességi bejárás: a csomópontok 1-től 11-ig számozva, a 11. a cél', gap: 46, showVisit: false, name: (n) => n.visit === null ? '' : (n.status === 'goal' ? `${n.visit} Cél` : String(n.visit))}),
  'A 289. oldal ábrája: a szám a belelépés sorrendje. Előbb az 1. szint mind a négy csomópontja (2–5) jön, csak utána a 2. szint (6–11). A 11. csomópont a cél. A 3. szint csomópontjait a 6–10. csomópont kiterjesztése már feltárta, de beléjük már nem lépünk. (A PDF ábrája az 5. csomópont számozatlan gyereke alá is rajzol két ágat, ezek feltárására a cél előtt nem kerül sor.)', 'u-tree');

/* Városok */
F['city-map'] = S.graphSvg(CITY, {id: 'city-g', title: 'Útkeresési térkép: tíz város, irányított, kilométerben súlyozott utakkal. Start: Budapest, cél: Debrecen.'});
const tB = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'bfs', goalTest: 'generate'});
F['city-bfs-tree'] = fig('varos-bfs-fa', S.treeSvg(tB, {id: 'city-bfs-t', title: 'A szélességi keresés fája Budapestről Debrecenbe', gap: 92}),
  'A szélességi keresés fája Budapestről Debrecenbe, ugyanaz, mint a PDF 290. oldalán. A # a belelépés sorszáma. Debrecen a 8. lépésben, Szolnok kiterjesztésekor kerül elő. A kiemelt út: Budapest → Kecskemét → Szolnok → Debrecen, 75 + 55 + 110 = 240 km. A Hatvan alatti Kecskemétbe és Miskolcba már nem lépünk be.');
F['city-bfs-table'] = frontTable(tB, {id: 'varos-bfs-front', caption: 'A szélességi keresés frontja lépésenként. Az új csomópontok a front végére kerülnek. A célt itt feltáráskor ellenőrizzük, ahogy a PDF ábrája.'});
const tU = S.search(CITY.adj, 'Budapest', 'Kecskemét', {strategy: 'ucs'});
F['city-ucs-tree'] = fig('varos-ucs-fa', S.treeSvg(tU, {id: 'city-ucs-t', title: 'Az egyenletes költségű keresés fája, cél: Kecskemét', gap: 100, showCost: true}),
  'Az egyenletes költségű keresés fája a PDF 292. oldalának példájában, ahol a cél Kecskemét. A csomópont alatt a belelépés sorszáma és a Budapesttől mért útköltség, g(n). Az ismétlődő Kecskemét a feltárás sorrendjében kap indexet.');
F['city-ucs-table'] = frontTable(tU, {id: 'varos-ucs-front', cost: true, caption: 'Az egyenletes költségű keresés frontja lépésenként, növekvő útköltség szerint rendezve (javított számozással; lásd a kiigazítást).'});
const tUD = S.search(CITY.adj, 'Budapest', 'Debrecen', {strategy: 'ucs'});
F['city-ucs-deb'] = frontTable(tUD, {id: 'varos-ucs-debrecen', cost: true, caption: `Egyenletes költségű keresés Budapestről Debrecenbe. ${tUD.visits} belépés után a front legolcsóbb eleme Debrecen (240), ekkor állunk meg.`});
const tD = S.search(CITY.adj, 'Budapest', 'Szolnok', {strategy: 'dfs'});
F['city-dfs-tree'] = fig('varos-dfs-fa', S.treeSvg(tD, {id: 'city-dfs-t', title: 'A mélységi keresés fája, cél: Szolnok', gap: 96, showCost: true}),
  'A mélységi keresés fája a PDF 294. oldalának példájában, ahol a cél Szolnok. A # a belelépés sorszáma, a második szám az útköltség. A talált út Budapest → Dunaújváros → Kecskemét → Szolnok, 61 + 50 + 55 = 166 km, pedig Budapest → Kecskemét → Szolnok csak 130 km. A PDF ábráján a Kecskemét₂ alatti Szeged nem szerepel, a futás eredménye ugyanaz.');
F['city-dfs-table'] = frontTable(tD, {id: 'varos-dfs-front', caption: 'A mélységi keresés frontja lépésenként. Az új csomópontok a front elejére kerülnek, ezért mindig a legutóbb feltárt ágon megyünk tovább.'});
const tL = S.search(CITY.adj, 'Budapest', 'Szolnok', {strategy: 'dls', limit: 2});
F['city-dls-table'] = frontTable(tL, {id: 'varos-dls-front', caption: 'Mélységkorlátos keresés l = 2 korláttal Budapestről Szolnokra. A 2. szintű csomópontokba belelépünk, de nem terjesztjük ki őket.'});

/* Iteratív mélyítés (297.) */
const it = S.ids(BINARY.adj, 'gyökér', 'RLR');
F['ids-trees'] = '<div class="u-ids">' + it.iterations.map((t, k) => fig(`ids-${k}`, S.treeSvg(t, {id: `ids-t${k}`, title: `Korlát = ${k}: ${t.visits} belelépés, ${t.generated} feltárt csomópont`, gap: 40, name: (n) => String(n.gen)}),
  `<strong>Korlát = ${k}.</strong> ${t.generated} feltárt csomópont, ${t.visits} belelépés${t.found ? '. A 13. csomópont a cél.' : '.'}`, 'u-tree u-tree-small')).join('') + '</div>';

/* Tologatós kirakó (298.) */
{
  const start = '1238457_6', goal = '1238_4765';
  const t = S.search(S.puzzleSpace(start, 3), start, goal, {strategy: 'bfs', goalTest: 'generate', repeats: 'none'});
  const lay = S.layoutTree(t.nodes);
  const gap = 54, rowH = 92, W = lay.leaves * gap + 10, H = (lay.depth + 1) * rowH;
  const X = (id) => 5 + gap / 2 + lay.x[id] * gap, Y = (id) => 8 + t.nodes[id].depth * rowH;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" class="u-tree-svg" style="min-width:640px" aria-labelledby="puz-t"><title id="puz-t">A tologatós kirakó szélességi keresőfája három szintig; a cél a jobb alsó részen</title>`;
  t.nodes.forEach(n => { if (n.parent !== null) s += `<path class="u-tedge" d="M${X(n.parent)} ${Y(n.parent) + 44}L${X(n.id)} ${Y(n.id) - 2}"/>`; });
  t.nodes.forEach(n => {
    const x0 = X(n.id) - 21, y0 = Y(n.id);
    const cls = n.status === 'goal' ? 'u-pz u-pz-goal' : (n.state === start && n.id ? 'u-pz u-pz-rep' : 'u-pz');
    s += `<g class="${cls}"><rect x="${x0}" y="${y0}" width="42" height="42" rx="3"/>`;
    n.state.split('').forEach((ch, i) => { if (ch !== '_') s += `<text x="${x0 + 7 + (i % 3) * 14}" y="${y0 + 12 + Math.floor(i / 3) * 13}" text-anchor="middle">${ch}</text>`; });
    s += '</g>';
  });
  s += '</svg>';
  F['puzzle-tree'] = fig('kirako-fa', s, `A 298. oldal keresőfája. Felül az induló állás, a cél: 1 2 3 / 8 _ 4 / 7 6 5. Az üres mező fel, jobbra, le, balra lép, ebben a sorrendben. A szaggatott keretű állások az induló állás ismétlései: ${t.nodes.filter(n => n.state === start).length - 1} ilyen van a fában. A keresés a 3. szinten, a ${t.visits}. belelépésnél, feltáráskor találja meg a célt (zöld).`, 'u-tree');
}

/* Minta-zh */
F['zh-map'] = S.graphSvg(ZH, {id: 'zh-g', title: 'A minta-zh gráfja: S-ből G-be, 13 csomópont, 19 irányított, súlyozott él'});
const zA = S.search(ZH.adj, 'S', 'G', {strategy: 'dfs', order: 'abc'});
F['zh-dfs-tree'] = fig('zh-dfs-fa', S.treeSvg(zA, {id: 'zh-dfs-t', title: 'A minta-zh mélységi keresőfája, belelépéskori célteszttel', gap: 60, showCost: true}),
  'Mélységi keresőfa ABC-sorrenddel, belelépéskori célteszttel. A # a belelépés sorszáma, a második szám az útköltség. A három G a feltárás sorrendjében kap indexet: G₁ a C, G₂ az E, G₃ a V gyereke. A keresés G₃-ba lépve áll meg.');
F['zh-dfs-table'] = frontTable(zA, {id: 'zh-dfs-front', caption: 'A front lépésenként (belelépéskori célteszt). Az első elem a következő választás.'});
const zB = S.search(ZH.adj, 'S', 'G', {strategy: 'dfs', order: 'abc', goalTest: 'generate'});
F['zh-dfs-gen-tree'] = fig('zh-dfs-gen-fa', S.treeSvg(zB, {id: 'zh-dfs-gen-t', title: 'A minta-zh mélységi keresőfája, feltáráskori célteszttel', gap: 60, showCost: true}),
  'Ugyanez feltáráskori célteszttel: a C kiterjesztésekor előkerül G, és a keresés azonnal megáll.');
F['zh-dfs-gen-table'] = frontTable(zB, {id: 'zh-dfs-gen-front', caption: 'A front lépésenként (feltáráskori célteszt).'});
const zU = S.search(ZH.adj, 'S', 'G', {strategy: 'ucs', order: 'abc'});
F['zh-ucs-table'] = frontTable(zU, {id: 'zh-ucs-front', cost: true, caption: 'Egyenletes költségű keresés a zh-gráfon. A front növekvő útköltség szerint rendezett, egyenlőségnél a korábban felvett csomópont áll elöl (ez itt az ABC-sorrenddel is egyezik).'});
const zI = S.ids(ZH.adj, 'S', 'G', {order: 'abc'});
F['zh-ids'] = '<div class="u-table-wrap"><table class="u-table" id="zh-ids-tabla"><caption>Iteratív mélyítés a zh-gráfon, ABC-sorrenddel. Egy csomópont több iterációban, sőt egy iteráción belül is többször sorra kerülhet.</caption><thead><tr><th>Korlát</th><th>Belelépések sorrendje</th><th>Eredmény</th></tr></thead><tbody>' +
  zI.iterations.map((t, k) => `<tr><td>${k}</td><td>${t.steps.map(s => esc(t.nodes[s.visit].state)).join(' ')}</td><td>${t.found ? `megvan: ${t.path.join('–')}, ${t.cost}` : 'nincs cél a korlátig'}</td></tr>`).join('') + '</tbody></table></div>';
F['code21-map'] = S.graphSvg(CODE21, {id: 'c21-g', title: 'A 21_Ugralas_es_elagazas.py gráfja: S-ből G-be, a legtöbb él mindkét irányban'});

/* Idő és tár: statikus táblázat b = 10 mellett */
{
  let rows = '';
  [2, 4, 6, 8, 10, 12].forEach(d => {
    let n = 0; for (let i = 0; i <= d; i++) n += 10 ** i;
    const sec = n / 1e6, mem = 10 ** d * 1000;
    const t = sec < 1 ? `${fmt(Number((sec * 1000).toPrecision(2)))} ms` : sec < 3600 ? `${fmt(Number(sec.toPrecision(2)))} s` : sec < 86400 * 2 ? `${fmt(Number((sec / 3600).toPrecision(2)))} óra` : sec < 86400 * 365 * 2 ? `${fmt(Number((sec / 86400).toPrecision(2)))} nap` : `${fmt(Number((sec / 86400 / 365).toPrecision(2)))} év`;
    const m = mem < 1e6 ? `${fmt(mem / 1e3)} kB` : mem < 1e9 ? `${fmt(mem / 1e6)} MB` : mem < 1e12 ? `${fmt(mem / 1e9)} GB` : mem < 1e15 ? `${fmt(mem / 1e12)} TB` : `${fmt(mem / 1e15)} PB`;
    rows += `<tr><td>${d}</td><td>${n.toLocaleString('hu-HU')}</td><td>${t}</td><td>${m}</td><td>${(10 * d).toLocaleString('hu-HU')} csomópont, ${fmt(10 * d)} kB</td></tr>`;
  });
  F['cost-table'] = `<div class="u-table-wrap"><table class="u-table u-table-num" id="ido-tar-tabla"><caption>Szélességi keresés b = 10 mellett, ha a gép másodpercenként egymillió csomópontot tár fel, és egy csomópont 1 kB memóriát foglal (feltáráskori célteszttel, a front ≈ b<sup>d</sup> csomópont). Az utolsó oszlop az iteratív mélyítés tárigénye ugyanerre a mélységre.</caption><thead><tr><th>d</th><th>Feltárt csomópont</th><th>Idő</th><th>Memória</th><th>Iteratív mélyítés memóriája</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* Amőba: 20 × 20-as tábla, az utolsó jel a (10, 10) mezőn */
{
  const c = 14, n = 20, r0 = 10, c0 = 10;
  let s = `<svg viewBox="0 0 ${n * c + 2} ${n * c + 2}" role="img" class="u-board" aria-labelledby="amoba-t"><title id="amoba-t">20 × 20-as amőbatábla; az utolsó jel körül a 9 × 9-es négyzet 80 mezője és a csillag 32 mezője kiemelve</title>`;
  for (let r = 1; r <= n; r++) for (let k = 1; k <= n; k++) {
    const dr = r - r0, dc = k - c0;
    const inSq = Math.abs(dr) <= 4 && Math.abs(dc) <= 4;
    const inStar = (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) && inSq;
    const cls = dr === 0 && dc === 0 ? 'u-b-last' : inStar ? 'u-b-star' : inSq ? 'u-b-sq' : 'u-b-cell';
    s += `<rect class="${cls}" x="${1 + (k - 1) * c}" y="${1 + (r - 1) * c}" width="${c}" height="${c}"/>`;
  }
  s += `<text x="${1 + (c0 - 0.5) * c}" y="${1 + (r0 - 0.5) * c + 4}" text-anchor="middle" class="u-b-mark">X</text></svg>`;
  F['amoba-board'] = s;
}

/* Csonka sakktábla (286.) */
{
  const c = 24;
  let s = `<svg viewBox="0 0 ${8 * c + 2} ${8 * c + 2}" role="img" class="u-board u-board-small" aria-labelledby="domino-t"><title id="domino-t">Sakktábla, amelynek a bal alsó és a jobb felső sarka hiányzik; mindkét hiányzó mező világos</title>`;
  for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) {
    if ((r === 0 && k === 7) || (r === 7 && k === 0)) { s += `<rect class="u-b-gone" x="${1 + k * c}" y="${1 + r * c}" width="${c}" height="${c}"/>`; continue; }
    s += `<rect class="${(r + k) % 2 ? 'u-b-dark' : 'u-b-light'}" x="${1 + k * c}" y="${1 + r * c}" width="${c}" height="${c}"/>`;
  }
  s += `<rect class="u-b-domino" x="${1 + 2 * c + 3}" y="${1 + 3 * c + 3}" width="${2 * c - 6}" height="${c - 6}" rx="4"/></svg>`;
  F['domino-board'] = s;
}

for (const k of ['abs-graph', 'abs-graph-hl', 'city-map', 'zh-map', 'code21-map']) F[k] = `<div class="u-scroll">${F[k]}</div>`;
const tpl = process.argv[2] || path.join(__dirname, '09-sablon.html');
const out = process.argv[3] || path.join(ROOT, 'fejezetek/09-neminformalt-kereses.html');
let html = fs.readFileSync(tpl, 'utf8');
html = html.replace(/<!--@([a-z0-9-]+)-->/g, (m, k) => { if (!(k in F)) throw new Error('Hiányzó darab: ' + k); return F[k]; });
const left = Object.keys(F).filter(k => !fs.readFileSync(tpl, 'utf8').includes(`<!--@${k}-->`));
if (left.length) console.error('Fel nem használt darabok:', left.join(', '));
fs.writeFileSync(out, html);
console.log('kész', out, html.length);
