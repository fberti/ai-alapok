# A 9. mérföldkő ellenőrzése

Oldal: `fejezetek/09-neminformalt-kereses.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 276–298. fájloldal, valamint a 2025. december 5-i minta-zh 8. feladata.

A fejezet az 1–8. fejezet mintájára készült. Csak a 9. mérföldkő valósult meg; az informált keresés (heurisztika, legjobb-első, A*, hegymászó, szimulált hűtés) a 10. mérföldkőre marad, a fejezet csak a g(n), h(n), f(n) jelölést vezeti be előképként. A kezdőlap és a nyolcadik fejezet ide vezet, a 10. fejezet nem aktív. Nincs új futásidejű függőség, szerveroldali kód vagy külső erőforrás.

Új vagy módosított fájlok: `assets/js/search.js` (keresőmodell), `assets/js/chapter-nine.js` (laborvezérlés), `assets/css/chapter-nine.css`, `assets/js/browser-globals.d.ts`, `tesztek/search.test.cjs`, `tesztek/bongeszo/chapter-nine.spec.cjs`, `tesztek/pages.test.cjs`, `index.html`, `fejezetek/08-genetikus-algoritmusok.html` (továbblépés a 9. fejezetre), `README.md`, `HASZNALAT.md`, `LEFEDETTSEGI_TERKEP.md`, `TERV.md`.

A fejezet statikus ábráit (keresőfák, gráfok, fronttáblázatok, tologatós kirakó, táblák) a `search.js` modell rajzolta egy egyszeri generálólépéssel; a kész HTML-ben SVG-ként és táblázatként szerepelnek, így JavaScript nélkül is olvashatók.

## Lefedettség

A PDF szövegét `pdftotext -layout` eszközzel olvastuk ki. A 279., 281., 283–286., 289–290., 292., 294. és 297–298. oldal ábráit képként, a gráfokat és fákat 200–300 dpi-s kivágásban is átnéztük.

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 276 | Címlap, szerzői megjelölés | forráslista |
| 277 | A keresés célja (idézet), ismeretfeldolgozás, következtetőgráfok | `#kereses`, `#ismeretfeldolgozas` |
| 278 | A három lépés, a kereséssel megoldható problémák jellemzője (idézet), Winston-hivatkozás | `#harom-lepes`, `#harom-lepes-sor` |
| 279 | Az amőba három reprezentációja b ≈ 400, ≤ 80, ≤ 32 elágazással, a megjegyzés (idézet) | `#reprezentacio`, `#amoba-reprezentaciok`, `#amoba-abra`, `#amoba-labor` |
| 280 | Teljesség, optimalitás, időigény, tárigény | `#jellemzok`, `#negy-jellemzo` |
| 281 | Állapottér, Start, Cél, út, leállási feltétel, kvázioptimális megoldás; az absztrakt gráf | `#allapotter`, `#absztrakt-graf`, `#osszetevok` |
| 282 | Operátor-, út-, keresési és teljes költség a PDF példáival | `#koltsegek` |
| 283 | Keresőgráf, kiterjesztés (idézet), állapotgráf és keresőfa egymás mellett | `#keresofa`, `#graf-es-fa`, `#fix-front` |
| 284 | b, átlagos b, m, d, l, front, g(n), h(n), f(n); a szintszámozott fa | `#fa-jellemzok`, `#szintek` |
| 285 | A városos útkeresés térképe és formális leírása | `#peldak`, `#varos-terkep`, `#varos-formalis`, `#fix-leallas` |
| 286 | A csonka sakktábla lefedési feladata | `#domino`, `#domino-megoldas` |
| 287 | Az általános kereső eljárás négy lépése, a 2. lépés szabadsága (idézet) | `#altalanos`, `#altalanos-lepesek` |
| 288 | Neminformált (vak) keresés jellemzői, az öt típus | `#vak-vs-informalt`, `#ot-eljaras` |
| 289 | Szélességi keresés, a számozott fa, módosítások, jellemzők | `#szelessegi`, `#szelessegi-szamozas`, `#bfs-tulajdonsagok` |
| 290 | Szélességi keresés a városokon | `#varos-bfs-fa`, `#varos-bfs-front` |
| 291 | Elágaztatás és ugrálás = egyenletes költségű keresés, módosítások, leállás, jellemzők | `#egyenletes`, `#ucs-tulajdonsagok`, `#fix-ucs`, `#fix-nev` |
| 292 | A PDF táblázata és fája (cél: Kecskemét) | `#varos-ucs-fa`, `#varos-ucs-front`, `#fix-ucs-tabla` |
| 293 | Mélységi keresés, visszalépés, jellemzők, memóriaigény | `#melysegi`, `#dfs-tulajdonsagok`, `#fix-dfs` |
| 294 | Mélységi keresés a városokon (cél: Szolnok) | `#varos-dfs-fa`, `#varos-dfs-front`, `#fix-varosok` |
| 295 | Mélységkorlátos keresés, benzinkút-példa, „átmenet az informált kereséshez” (idézet) | `#korlatos`, `#varos-dls-front`, `#dls-tulajdonsagok` |
| 296 | Iteratív mélyítés, jellemzők | `#iterativ`, `#ids-tulajdonsagok` |
| 297 | Az iteratív mélyítés ábrája korlát = 0…3, feltárási és belelépési sorszámmal | `#ids-0` – `#ids-3` |
| 298 | A tologatós kirakó szélességi keresőfája (szöveg nélküli ábra) | `#kirako-allas`, `#kirako-fa` |

A 297. oldalon a modell pontosan a PDF számait adja: 1, 3, 7 és 12 belelépés, a célt 13.-ként tárja fel. A 298. oldal 27 állása, köztük az induló állás 3 ismétlése, a modellből (az üres hely fel, jobbra, le, balra sorrendjével, feltáráskori célteszttel) állás szerint egyezik.

## Konvenciók

A PDF ábrái nem egyetlen konvenciót követnek. A szélességi példa (290.) és a kirakó (298.) feltáráskori céltesztet használ, az egyenletes költségű (292.) belelépéskorit, ahogy az általános eljárás 3. lépése és a kurzus programjai is. A fejezet minden példánál kimondja a konvenciót, és ahol eltérő eredményt adna, mindkettőt megmutatja. Az alapértelmezés: fakeresés útellenőrzéssel (a kurzuskód `adjacent not in path` szabálya), a gyerekek az ábrák sorrendjében vagy ABC-sorrendben, az ismétlődő csomópontok indexe a feltárás sorrendje.

## Kiigazítások

Nyolc doboz:

- a keresőgráf helyett keresőfa, és a front nem a fa összes levele, hanem a még be nem lépett levelek (283–284. oldal);
- a célfeltétel nem garantál optimális utat, az optimalitás az eljárás tulajdonsága; ellenpélda a mélységi keresés 276 km-es útja (285.);
- az „elágaztatás és ugrálás (branch and bound)” név: az eljárás az egyenletes költségű keresés (Dijkstra), a branch and bound a levágásos optimalizálás (korlátozás és szétválasztás) neve (288., 291.);
- az egyenletes költségű keresés teljességének és optimalitásának feltétele ε > 0, képlete O(b^(1+⌊C*/ε⌋)), nem b^d; példa: C* = 240, ε = 50, a keresés egy 4. szintű csomópontba is belép (291.);
- a 292. oldal táblázata: a sorszám 0, 1, 3, 4 helyett 0–3, a front rendezetlen, a cél Kecskemét;
- a mélységi keresés képletei O(b^m) és O(b·m), nem d-vel; teljesség csak körszűréssel; ellenpélda a 281. oldal d–g köre (293.);
- a várospéldák ellentmondásai: Budapest–Dunaújváros 60 vagy 61 km, változó cél, a 294. oldal fájáról hiányzó Szeged (285–294.);
- a `21_Ugralas_es_elagazas.py` aszimmetrikus éle (C → F 8, F → C 10).

Kiegészítés-dobozok: a dominófeladat színezési megoldása, a célteszt helye (belelépéskor vagy feltáráskor, ellenpéldával), a szélességi keresés feltételei.

## Kódok

A `resources/code/` két keresőprogramja szervesen szerepel: a `20_Szelessegben_es_melysegben_eloszor.py` a szélességi és a mélységi keresésnél, a `21_Ugralas_es_elagazas.py` az egyenletes költségű keresésnél. Mindkettőt változatlanul, Python 3-mal futtattuk.

| Program | Kimenet | Megjegyzés |
|---|---|---|
| `20_…py`, `bfs` | `['S', 'A', 'D', 'G']` | Célteszt belelépéskor; útellenőrzéses fakeresés, nem gráfkeresés. |
| `20_…py`, `dfs` | `['S', 'A', 'D', 'C', 'E', 'G']` | A `queue[0:0] = new_paths` sorrendtartó veremként működik. |
| `21_…py`, `bandb` | `['S', 'A', 'D', 'C', 'E', 'G']`, költség 32 (nem írja ki) | 14 út kerül ki a frontból; stabil rendezés. Nem vág le ágat, tehát nem branch and bound. |

Az F → C él költsége (10 a C → F 8 helyett) valószínűleg elírás, de hatástalan: F-be csak C-ből lehet jutni, így az útellenőrzés miatt az él sosem használható. F → C = 8 mellett ugyanaz az út, költség és lépésszám jön ki; ezt Python és a modell tesztje is ellenőrzi. A program minden lehetséges egyszerű útját is felsoroltuk: 32, 33, 35, 36, 40, 47.

## Minta-zh 8(a)

A gráf élsúlyait a feladatlap 150 dpi-s képéről vettük át, és a megadott listával egyeztettük (19 él, kör nélkül). A feladatszöveg „A és H csomópontok” megjegyzése elírás, ezt a gyakorló jelzi.

| Konvenció | Talált út | Költség | Maradék front |
|---|---|---|---|
| Fakeresés, ABC, célteszt belelépéskor (fő megoldás) | S A B C E F V G₃ | 34 | W, G₂, G₁, D, X, Y |
| Ugyanez, célteszt feltáráskor | S A B C G | 33 | E, D, X, Y |
| Gráfkeresés (frontban lévőt nem vesz fel újra), belelépéskor | S A B C G | 33 | D, X, Y |

Továbbgondolásként szerepel a szélességi keresés (S A B C G, 33; 15 belelépés), az egyenletes költségű keresés teljes fronttáblával (S A D K V W G, 17; maradék front C 18, G 18, V 18, G 20, Y 21, Y 23, G 23), az iteratív mélyítés (5 kör, 32 belelépés), a feltáráskori célteszt hibája egyenletes költségnél (23 a 17 helyett) és a mélységkorlátos l = 3 eset. A 2017-es, más intézményből származó vizsgasor „számozza be a csomópontokat” feladattípusa a 281. oldal gráfján kapott gyakorlót (szélességi 16, iteratív mélyítés 34 sorszám). Minden számot egy független Python-program és a modell tesztje is kiszámolt.

## Saját anyag

Nem a PDF-ből: a három labor, a dominófeladat megoldása, a fa- és gráfkeresés összevetése, a célteszt-kiegészítés, a b = 10 idő- és memóriatáblázat, az összevető és a döntési táblázat, az öt gyakorló blokk és a 14 kvízkérdés. A városos négy út hosszát (320, 240, 296, 276 km) és az egyenletes költségű keresés Debrecen-céllal kapott 17 lépését is mi számoltuk.

## Tesztek

- `npm test`: 66 sikeres teszt, köztük a `search.js` modell 12 új tesztje (a PDF 290., 292., 294., 297. és 298. oldalának bejárásai, a minta-zh három konvenciója, a zh-gráf szélességi, egyenletes költségű és iteratív mélyítéses bejárása, a kurzuskódok gráfjai, az aszimmetrikus él hatástalansága, a saját gráf beolvasása, a képletek és az SVG-rajzolók) és a bővített oldalteszt.
- `npm run typecheck`: hibátlan.
- `npx playwright test`: 166 sikeres böngészőteszt asztali és telefonos beállítással. A 9. fejezet 9 tesztje mindkét beállításon lefutott: hibamentes betöltés, a keresőlabor a PDF példáival és a zh-feladattal, iteratív mélyítés, korlát, saját gráf, hibás bemenet, ismétlésszűrés nélküli kör, az amőba- és a költséglabor, a kvíz, a 320, 390, 768 és 1365 px széles nézet világos és sötét témában, a JavaScript nélküli olvasás fájlból, a nyomtatás és a navigáció.
- Asztali világos, telefonos sötét és 320 px-es világos képernyőképet is átnéztünk; a széles keresőfák és gráfok saját, vízszintesen görgethető keretben jelennek meg, az oldal nem görget vízszintesen.

Firefox és Safari nem kapott külön futtatást. A nyomtatást emulált nyomtatási nézetben ellenőriztük, valódi nyomtatón nem.
