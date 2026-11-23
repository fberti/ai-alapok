// A 10. fejezet statikus ábráinak és táblázatainak előállítása a tesztelt search.js modellből.
// Használat a projekt gyökeréből: node eszkozok/10-abrak.cjs [sablon] [kimenet]
// Alapértelmezés: eszkozok/10-sablon.html → fejezetek/10-informalt-kereses.html
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const S = require(path.join(ROOT, 'assets/js/search.js'));
const {CITY_INF, CITY_HEUR_302, ZH, CODE18} = S;
const F = {};
const esc = S.esc;
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')).replace('.', ',');
const sub = (t, id) => { const l = S.labels(t.nodes)[id]; return esc(l.name) + (l.index === null ? '' : `<sub>${l.index}</sub>`); };
const hOf = (t, id) => t.heur[t.nodes[id].state] ?? 0;
/** Egy frontelem: név és f = g + h (vagy csak h). */
const item = (t, id, mode) => `${sub(t, id)} (${mode === 'h' ? fmt(hOf(t, id)) : `${fmt(t.nodes[id].cost)}+${fmt(hOf(t, id))}=${fmt(t.nodes[id].cost + hOf(t, id))}`})`;
const list = (t, ids, mode) => (ids.length ? ids.map((i) => item(t, i, mode)).join(', ') : '–');

/** Lépésenkénti fronttáblázat informált kereséshez. mode: 'f' (g+h=f) vagy 'h'. */
function frontTable(t, {id, caption, mode = 'f'}) {
  let rows = `<tr><td>0.</td><td>–</td><td>${list(t, t.initialFront, mode)}</td><td>A front a Start állapot.</td></tr>`;
  t.steps.forEach((s, i) => {
    let note;
    if (s.goal && t.nodes[s.visit].status === 'goal') note = '<strong>Cél, megállunk.</strong>';
    else if (s.goal) note = `Feltárás közben előkerült a cél (${sub(t, t.goalNode)}), megállunk.`;
    else if (s.children.length) note = `Új: ${s.children.map((c) => sub(t, c)).join(', ')}.`;
    else note = 'Nincs új gyereke.';
    if (s.skipped.length && !s.goal) note += ` Kihagyva, mert már az úton van: ${s.skipped.map(esc).join(', ')}.`;
    rows += `<tr><td>${i + 1}.</td><td>${item(t, s.visit, mode)}</td><td>${list(t, s.front, mode)}</td><td>${note}</td></tr>`;
  });
  const head = mode === 'h' ? 'A front utána (h)' : 'A front utána (g+h=f), rendezve';
  return `<div class="u-table-wrap"><table class="u-table u-table-trace" id="${id}"><caption>${caption}</caption><thead><tr><th>Lépés</th><th>Belépünk</th><th>${head}</th><th>Mi történt?</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
const fig = (id, svg, cap, cls = 'u-tree') => `<figure class="u-plot ${cls}" id="${id}"><div class="u-scroll">${svg}</div><figcaption>${cap}</figcaption></figure>`;

/* Városok (PDF 302., 304.) */
F['city-map'] = S.graphSvg(CITY_INF, {id: 'inf-g', title: 'A 302. és 304. oldal térképe: Miskolcról Szolnokra, élhosszakkal és a becsült hátralévő távolsággal (h)', heur: CITY_INF.heur});
const tG = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'greedy', heur: CITY_HEUR_302});
F['greedy-tree'] = fig('moho-fa', S.treeSvg(tG, {id: 'greedy-t', title: 'A mohó legjobb-első keresés fája Miskolcról Szolnokra', gap: 100, heur: CITY_HEUR_302, heurMode: 'h'}),
  'A 302. oldal keresőfája. A csomópont alatt a becslés, h(n), alatta a belelépés sorszáma. A kiemelt út Miskolc → Hatvan → Kecskemét → Szolnok, 130 + 71 + 55 = 256 km (a 304. oldal élhosszaival).');
F['greedy-table'] = frontTable(tG, {id: 'moho-front', mode: 'h', caption: 'A mohó legjobb-első keresés frontja lépésenként, a 302. oldal becsléseivel. Mindig a legkisebb h(n) értékű frontcsomópontba lépünk; a g(n) útköltséget nem nézzük.'});
const tA = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'astar', heur: CITY_INF.heur});
F['astar-tree'] = fig('astar-fa', S.treeSvg(tA, {id: 'astar-t', title: 'Az A* keresés fája Miskolcról Szolnokra, g+h=f értékekkel', gap: 108, heur: CITY_INF.heur}),
  'A 304. oldal keresőfája. A csomópont alatt g(n) + h(n) = f(n), alatta a belelépés sorszáma. A kiemelt út Miskolc → Polgár → Debrecen → Szolnok, 70 + 60 + 110 = 240 km. A Kecskemét (256) a frontban marad: drágább, mint a már megtalált 240.');
F['astar-table'] = frontTable(tA, {id: 'astar-front', caption: 'Az A* frontja lépésenként, f szerint növekvő sorrendben (a 304. oldal becsléseivel). A Polgár után a keresés Hatvanra, majd vissza Debrecenre vált: ez a súlypont-áthelyeződés.'});
const tU = S.search(CITY_INF.adj, 'Miskolc', 'Szolnok', {strategy: 'ucs'});
F['city-ucs'] = `<p>Összevetésül: az egyenletes költségű keresés (h = 0) ugyanezen a térképen ${tU.visits} belelépéssel találja meg ugyanezt a 240 km-es utat (${tU.steps.map((s) => esc(tU.nodes[s.visit].state)).join(', ')}), az A* ${tA.visits}-tel. A különbség itt kicsi, mert a térkép kicsi; egy országos térképen a jó becslés a feltárt városok nagy részét megspórolja.</p>`;

/* Kurzuskód: 18_A_csillag_algoritmus.py */
F['code18-map'] = S.graphSvg(CODE18, {id: 'c18-g', title: 'A 18_A_csillag_algoritmus.py gráfja: S-ből G-be, a csomópontokban a HEURISTICS értékei', heur: CODE18.heur});
{
  const c = S.checkHeuristic(CODE18.adj, CODE18.heur, 'G');
  const ways = {S: 'S → A → D → C → E → G', A: 'A → D → C → E → G', B: 'B → C → E → G', C: 'C → E → G', D: 'D → C → E → G', E: 'E → G', F: 'F → G', G: '–'};
  let rows = '';
  S.states(CODE18.adj).forEach((n) => {
    const h = CODE18.heur[n], hs = c.hStar[n];
    rows += `<tr${h > hs ? ' class="u-row-hit"' : ''}><td>${n}</td><td>${h}</td><td>${hs}</td><td>${esc(ways[n])}</td><td>${h > hs ? `<strong class="u-bad">túlbecsül ${h - hs}-gyel</strong>` : h === hs ? 'pontos' : 'jó (alulbecsül)'}</td></tr>`;
  });
  F['code18-check'] = `<div class="u-table-wrap"><table class="u-table u-table-num" id="kod18-ellenorzes"><caption>A HEURISTICS értékei a valódi hátralévő legkisebb költséggel, h*(n)-nel összevetve (a gráf irányított éleivel számolva). Egyetlen állapotnál, D-nél becsül túl.</caption><thead><tr><th>Állapot</th><th>h(n)</th><th>h*(n)</th><th>A legolcsóbb út a célba</th><th>Értékelés</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  F['code18-incons'] = c.inconsistent.map((e) => `${e.from} → ${e.to}: ${e.hFrom} &gt; ${e.cost} + ${e.hTo}`).join('; ');
}
const t18 = S.search(CODE18.adj, 'S', 'G', {strategy: 'astar', heur: CODE18.heur});
F['code18-table'] = frontTable(t18, {id: 'kod18-front', caption: `A kurzus A*-programjának futása (a gyerekek sorrendje a GRAPH szótáré, egyenlő f esetén a korábban felvett út marad elöl, ahogy a Python stabil <code>sorted</code> függvényénél). ${t18.visits} utat vesz ki a frontból; a B, a C, az E és az F kétszer is sorra kerül, mert a program fakeresést végez.`});

/* Felszín (PDF 305–307.) */
{
  const runs = [{path: S.hillClimb(S.landscape, 3).path, cls: 'u-run'}, {path: S.hillClimb(S.landscape, 44).path, cls: 'u-run3'}, {path: S.hillClimb(S.landscape, 56).path, cls: 'u-run3'}, {path: S.hillClimb(S.landscape, 68).path, cls: 'u-run2'}];
  F['land-fig'] = fig('felszin-abra', S.landscapeSvg({id: 'land-t', title: 'A többcsúcsú felszín négy hegymászó-indulással', runs}),
    'A fejezet felszíne: 101 állapot (x = 0 … 100), mindegyiknek egy magassága van. Egy állapot szomszédai x − 1 és x + 1. Négy hegymászó-indulás: x = 3-ból a 12-es helyi csúcsra (0,55), x = 44-ből visszafelé a 34-es helyi csúcsra (0,75), x = 56-ról sehova, mert a fennsíkon mindkét szomszéd ugyanolyan magas, és csak x = 68-ból a 80-as globális csúcsra (1). A 101 kiinduló állapotból mindössze 28 vezet a globális csúcsra.', 'u-plot-wide');
}
{
  const f = (x) => -S.landscape(x);
  const a = S.anneal(f, {start: 12, T0: 0.3, alpha: 0.998, seed: 1});
  const b = S.anneal(f, {start: 12, T0: 0.3, alpha: 0.95, seed: 1});
  F['sa-fig'] = fig('hutes-abra', S.landscapeSvg({id: 'sa-t', title: 'Egy szimulált hűtés pályája a felszínen', trail: a.xs.filter((_, i) => i % 4 === 0).concat([a.x]), labels: true}),
    `Szimulált hűtés x = 12-ből, T<sub>0</sub> = 0,3, α = 0,998, mag = 1. A pontok a meglátogatott állapotok, a halványak a korai, forró szakaszból. ${a.iterations} lépés után a globális csúcson (x = ${a.x}) áll meg; közben ${a.worseAccepted} rontó lépést fogadott el és ${a.worseRejected}-t utasított el. Ugyanez α = 0,95 gyors hűtéssel ${b.iterations} lépés után x = ${b.x}-nél, ${b.x === 12 ? 'a kiinduló helyi csúcson' : 'egy helyi csúcson'} ragad.`, 'u-plot-wide');
  F['sa-series'] = fig('hutes-idosor', S.seriesSvg({id: 'sa-s', title: 'A hőmérséklet és a magasság a lépésszám függvényében', series: [{values: a.Ts, cls: 'u-ser-t', label: `hőmérséklet T (0 … ${fmt(0.3)})`}, {values: a.xs.map((x) => S.landscape(x)), cls: 'u-ser-f', label: 'magasság (0 … 1)', max: 1}]}),
    'Ugyanennek a futásnak az idősora. Az elején, amikor T még nagy, a magasság vadul ugrál: sok rontó lépést elfogad. Ahogy T csökken, a rontások egyre kisebbek és ritkábbak, végül a pálya egy csúcson megnyugszik. Ez a PDF megfigyelése: a konvergálást „egyre kisebb romlási szakaszok jellemzik”.', 'u-plot-wide');
}
{
  const deltas = [0.05, 0.1, 0.25, 0.5], temps = [1, 0.3, 0.1, 0.03, 0.01];
  let rows = '';
  deltas.forEach((d) => { rows += `<tr><td>${fmt(d)}</td>${temps.map((T) => { const p = S.acceptance(d, T); return `<td>${p >= 0.0995 ? `${Math.round(p * 100)}%` : p >= 0.000995 ? `${fmt(Math.round(p * 1000) / 10)}%` : '≈ 0%'}</td>`; }).join('')}</tr>`; });
  F['accept-table'] = `<div class="u-table-wrap"><table class="u-table u-table-num" id="elfogadas-tabla"><caption>Egy Δ-val rosszabb szomszéd elfogadásának valószínűsége, exp(−Δ / T), különböző hőmérsékleteken. Forrón szinte minden rontást elfogad, hidegen szinte semmit.</caption><thead><tr><th>Romlás Δ</th>${temps.map((T) => `<th>T = ${fmt(T)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
{
  const f = (x) => -S.landscape(x);
  const rate = (o) => { let n = 0; for (let seed = 1; seed <= 100; seed++) if (Math.abs(S.anneal(f, {start: 12, seed, ...o}).x - 80) <= 4) n += 1; return n; };
  const hill = (k) => { let n = 0; for (let seed = 1; seed <= 100; seed++) if (S.restartHill(S.landscape, {start: 12, restarts: k, seed}).best.x === 80) n += 1; return n; };
  const rows = [
    ['Hegymászó x = 12-ből', '–', '0'],
    ['Hegymászó + 3 véletlen újraindítás', '–', String(hill(3))],
    ['Hegymászó + 10 véletlen újraindítás', '–', String(hill(10))],
    ['Szimulált hűtés, T₀ = 0,3, α = 0,95', 'gyors', String(rate({T0: 0.3, alpha: 0.95}))],
    ['Szimulált hűtés, T₀ = 0,3, α = 0,99', 'közepes', String(rate({T0: 0.3, alpha: 0.99}))],
    ['Szimulált hűtés, T₀ = 0,3, α = 0,998', 'lassú', String(rate({T0: 0.3, alpha: 0.998}))],
    ['Szimulált hűtés, T₀ = 0,3, α = 0,999', 'nagyon lassú', String(rate({T0: 0.3, alpha: 0.999}))],
    ['Szimulált hűtés, T₀ = 0,05, α = 0,999', 'hideg kezdés', String(rate({T0: 0.05, alpha: 0.999}))],
    ['Szimulált hűtés, logaritmikus, T₀ = 1, 6000 lépés', 'logaritmikus', String(rate({T0: 1, schedule: 'log', maxIter: 6000}))],
    ['Szimulált hűtés, logaritmikus, T₀ = 1, 20 000 lépés', 'logaritmikus', String(rate({T0: 1, schedule: 'log', maxIter: 20000}))]
  ];
  F['local-rates'] = `<div class="u-table-wrap"><table class="u-table u-table-num" id="lokalis-esely"><caption>Hányszor ér a globális csúcsra (x = 80 ± 4) száz különböző véletlenmaggal, x = 12-ből indulva. A szimulált hűtés szomszédja legfeljebb 8 lépésre van; a leállás a PDF feltétele: az utolsó 100 lépésben a magasság legfeljebb 0,0005-tel változott.</caption><thead><tr><th>Eljárás</th><th>Hűtés</th><th>Siker 100 futásból</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
}

/* Minta-zh 8(b) */
F['zh-map'] = S.graphSvg(ZH, {id: 'zh-g', title: 'A minta-zh gráfja a heurisztika értékeivel: S-ből G-be, 13 csomópont, 19 irányított, súlyozott él', heur: ZH.heur});
const zA = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: ZH.heur, order: 'abc', tie: 'abc'});
F['zh-tree'] = fig('zh-astar-fa', S.treeSvg(zA, {id: 'zh-astar-t', title: 'A minta-zh A*-keresőfája g+h=f értékekkel', gap: 62, heur: ZH.heur}),
  'Az A* keresőfája ABC-döntetlenfeloldással, belelépéskori célteszttel, útellenőrzéses fakereséssel. A csomópont alatt g + h = f, alatta a belelépés sorszáma. Az ismételt állapotok indexe a feltárás sorrendje: C₁ a B, C₂ a D gyereke; Y₁ az S, Y₂ az X gyereke. A kiemelt út S → A → D → K → V → G, 18.');
F['zh-table'] = frontTable(zA, {id: 'zh-astar-front', caption: 'A front lépésenként. Rendezés f szerint; egyenlő f esetén ABC-sorrend (a 2. lépésben B a D előtt, a végén C₂ a W előtt). A cél kiválasztásakor állunk meg.'});
const zG = S.search(ZH.adj, 'S', 'G', {strategy: 'greedy', heur: ZH.heur, order: 'abc', tie: 'abc'});
F['zh-greedy-table'] = frontTable(zG, {id: 'zh-moho-front', mode: 'h', caption: 'A mohó legjobb-első keresés ugyanezen a gráfon: csak h(n) számít. Hat belelépés, ugyanaz a 18 költségű út.'});
const zFix = S.search(ZH.adj, 'S', 'G', {strategy: 'astar', heur: {...ZH.heur, W: 2}, order: 'abc', tie: 'abc'});
F['zh-fixed-table'] = frontTable(zFix, {id: 'zh-javitott-front', caption: 'Ugyanez h(W) = 2 elfogadható becsléssel. A V kiterjesztése után a W (15 + 2 = 17) megelőzi a G-t (18), és a keresés az optimális 17-es utat adja.'});

/* Hat város: a 304. oldal térképe Szeged nélkül (2017-es vizsgakérdés) */
{
  const adj = {}; Object.entries(CITY_INF.adj).forEach(([k, v]) => { if (k !== 'Szeged') adj[k] = v.filter(([t]) => t !== 'Szeged'); });
  const pos = {...CITY_INF.pos}; delete pos.Szeged;
  const heur = {...CITY_INF.heur}; delete heur.Szeged;
  const g6 = {...CITY_INF, name: 'Hat város', adj, pos, heur, h: 250};
  F['six-map'] = S.graphSvg(g6, {id: 'hat-g', title: 'Hat város: a 304. oldal térképe Szeged nélkül', heur});
  const t6 = S.search(adj, 'Miskolc', 'Szolnok', {strategy: 'astar', heur});
  F['six-table'] = frontTable(t6, {id: 'hat-varos-front', caption: 'A* a hat városon. A 2. lépés után a keresés a Polgár-ágról a Hatvan-ágra vált (Hatvan 228 &lt; Debrecen 230), a 3. lépés után vissza Debrecenre (230 &lt; Kecskemét 256): két súlypont-áthelyeződés.'});
}

for (const k of ['city-map', 'code18-map', 'zh-map', 'six-map']) F[k] = `<div class="u-scroll">${F[k]}</div>`;
const tpl = process.argv[2] || path.join(__dirname, '10-sablon.html');
const out = process.argv[3] || path.join(ROOT, 'fejezetek/10-informalt-kereses.html');
const src = fs.readFileSync(tpl, 'utf8');
const html = src.replace(/<!--@([a-z0-9-]+)-->/g, (m, k) => { if (!(k in F)) throw new Error('Hiányzó darab: ' + k); return F[k]; });
const left = Object.keys(F).filter((k) => !src.includes(`<!--@${k}-->`));
if (left.length) console.error('Fel nem használt darabok:', left.join(', '));
fs.writeFileSync(out, html);
console.log('kész', out, html.length);
