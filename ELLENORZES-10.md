# A 10. mérföldkő és a teljes kurzus ellenőrzése

Oldal: `fejezetek/10-informalt-kereses.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 299–307. fájloldal; a 2025. december 5-i minta-zh 8(b) feladata; egy 2017-es, más intézményből származó vizsgasor kérdései.

A fejezet a 9. fejezet mintájára készült, annak komponenseivel és keresőmodelljével. Nincs új futásidejű függőség, szerveroldali kód vagy külső erőforrás.

Új fájlok: `fejezetek/10-informalt-kereses.html`, `assets/css/chapter-ten.css`, `assets/js/chapter-ten.js`, `fogalomtar.html`, `assets/css/fogalomtar.css`, `assets/js/fogalomtar.js`, `eszkozok/09-sablon.html`, `eszkozok/09-abrak.cjs`, `eszkozok/10-sablon.html`, `eszkozok/10-abrak.cjs`, `eszkozok/fogalomtar.cjs`, `tesztek/bongeszo/chapter-ten.spec.cjs`, `tesztek/bongeszo/kurzus.spec.cjs`.

Módosított fájlok: `assets/js/search.js` (mohó legjobb-első, A/A*, h*, elfogadhatóság- és konzisztencia-ellenőrzés, felszín, hegymászó, újraindítás, szimulált hűtés, rajzolók, döntési segéd; a meglévő API változatlan), `tesztek/search.test.cjs`, `tesztek/pages.test.cjs`, `index.html`, `fejezetek/09-neminformalt-kereses.html` (a sablonból újragenerálva: továbblépés a 10. fejezetre), `fejezetek/08-genetikus-algoritmusok.html` (egy hivatkozás), `README.md`, `HASZNALAT.md`, `LEFEDETTSEGI_TERKEP.md`, `TERV.md`. A `browser-globals.d.ts` nem változott: a fejezet ugyanazt a `CourseSearch` globális nevet használja, a fogalomtár szkriptje nem exportál semmit.

## Lefedettség

A PDF szövegét `pdftotext` eszközzel olvastuk ki, mind a kilenc oldalt 100 dpi-s képként is átnéztük. Ábrát a 302. és a 304. oldal tartalmaz; ezek gráfját, becsléseit, élhosszait, keresőfáit és táblázatait pontosan átvettük, SVG-ben rajzoltuk újra.

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 299 | Informált (heurisztikus) keresés, az előny fajtái, a heurisztika tévedhet (idézet), h(n), „a jó függvény nem becsüli túl… 0” (idézet) | `#heurisztika` |
| 300 | Globális és lokális információ, a hat eljárás, „csak lokális extrémumot” (idézet); IDA* és tabukeresés kiegészítésként | `#globalis-lokalis`, `#globalis-vs-lokalis`, `#ida-tabu` |
| 301 | Legjobbat először keresés, Winston hegymászócsapata (idézet), a módosított 2. lépés, jellemzők | `#legjobb-elso`, `#moho-lepesek`, `#moho-tulajdonsagok`, `#fix-moho` |
| 302 | A városos példa: térkép, becslések, keresőfa, táblázat | `#moho-terkep`, `#moho-fa`, `#moho-front`, `#fix-tablak` |
| 303 | A és A*, f = g + h, az optimalitás tétele (idézet), f′ jelölés, jellemzők | `#a-csillag`, `#fix-astar`, `#fix-lokalis`, `#elfogadhato-vs-konzisztens` |
| 304 | A* várospélda élhosszakkal, f-értékekkel, táblázattal; „elágaztatás és ugrálás + legjobb-első” | `#astar-fa`, `#astar-front`, `#harom-kulcs` |
| 305 | Hegymászó keresés, lépései (idézet), jellemzők, a felület alakjának hatása | `#hegymaszo`, `#hegymaszo-lepesek`, `#fix-hegymaszo`, `#felszin-abra`, `#hegymaszo-labor` |
| 306 | Szimulált hűtés: fémhűtési hasonlat (idézet), rontó lépések, lassú hűtés, nagy feladatok, közelítő eredmény, leállási feltétel | `#hutes`, `#fix-hutes`, `#lokalis-esely` |
| 307 | A minimalizáló pszeudokód (teljes idézet), csökkenő hőmérséklet, véletlenszám, egyre kisebb romlások | `#hutes`, `#elfogadas-tabla`, `#hutes-abra`, `#hutes-idosor`, `#hutes-labor` |

A `LEFEDETTSEGI_TERKEP.md` 10. mérföldkövének mind a 12 pontja teljesül. A TERV kötelező tartalmából a „keresés teljessége, optimalitása, ideje és tárigénye pontos feltételekkel” a `#moho-tulajdonsagok`, `#fix-astar`, `#hegymaszo-tulajdonsagok` és a záró `#osszevetes-tabla` részben, a „konvergencia és gyakorlati leállási feltétel” a `#hutes` és `#fix-hutes` részben szerepel.

## Kiigazítások (8)

1. `#fix-moho` – a mohó keresés „Teljes” csak véges térben, ismétlésszűréssel; nem „lokális optimumban végződik”, hanem nem optimális utat adhat. Ellenpélda: S–A–S kör ismétlésszűrés nélkül.
2. `#fix-astar` – az A* optimalitása: fakeresésnél elfogadható, zárt listás gráfkeresésnél konzisztens becslés kell; teljesség: véges b, lépésköltség ≥ ε > 0. Ellenpélda: a kurzuskód becslésével zárt listával 35 a 32 helyett.
3. `#fix-lokalis` – az A* nem végződik lokális optimumban; túlbecslő becsléssel (A-keresés) nem optimális utat adhat. Példa: minta-zh, 18 a 17 helyett.
4. `#fix-tablak` – a 302. és 304. oldal táblázatainak hiányzó 2. sora, a két oldal eltérő becslései (Polgár 90/70, Debrecen 110/100); az eredményt nem változtatják.
5. `#fix-hegymaszo` – a pszeudokódból hiányzik a megállás helyi csúcson; példa: 12, 13, 12, 13, … oszcilláció.
6. `#fix-hutes` – a globális optimum csak valószínűségi értelemben és logaritmikus hűtéssel garantált (Geman–Geman 1984, Hajek 1988); a dia maximumot mond, a pszeudokód minimalizál. Számpélda a fejezet felszínén.
7. `#fix-kod18` – `18_A_csillag_algoritmus.py`: h(D) = 25 > h*(D) = 24 (D → C → E → G), a becslés öt élen inkonzisztens. Optimális eredmény szerencséből (D f-értéke 33, a nem optimális célok 35 és 36); ellenpélda h(D) = 28 → `['S', 'B', 'C', 'E', 'G']`, 35. Konzisztens javítás: S 23, A 21, B 14, C 13, D 15, E 6, F 5, G 0.
8. `#fix-zh` – a minta-zh becslése W-nél túloz (4 > 2), ezért szigorúan A-keresés, és az eredmény 18, nem az optimális 17; három élen inkonzisztens (Y→B, C→E, W→G). h(S) = 0 elfogadható, és a Startnál hatástalan.

Kiegészítések: IDA* és tabukeresés (`#ida-tabu`), a légvonal elfogadhatósága és a PDF számainak kitalált volta (`#legvonal`), jó heurisztikák könnyített feladatból, dominancia (`#jo-becsles`), sztochasztikus hegymászó, szimulált hűtés és GA kapcsolata (`#hegymaszo-ga`).

## A PDF várospéldáinak becslései

A 304. oldal becslései elfogadhatók és konzisztensek (h* : Miskolc 240, Hatvan 126, Polgár 170, Debrecen 110, Kecskemét 55, Szeged 65, Szolnok 0; minden élre h(n) ≤ c + h(n′)). A 302. oldal két eltérő értéke (90, 110) szintén elfogadható és konzisztens. Mohó: Miskolc, Polgár, Hatvan, Kecskemét, Szolnok → 256 km; A*: f = 140, 228, 230, 240, 256 → Miskolc–Polgár–Debrecen–Szolnok, 240 km. Mindkét bejárás egyezik a PDF táblázatával.

## Oktatói kódok

Mindkettőt változatlanul futtattuk Python 3-mal.

- `19_Legjobbat_eloszor.py` → `['S', 'B', 'C', 'F', 'G']` (a 18-as program költségeivel 36; az optimum 32).
- `18_A_csillag_algoritmus.py` → `['S', 'A', 'D', 'C', 'E', 'G']`, 32, 12 kivétel a frontból. Célteszt kivételkor (helyes), fakeresés útellenőrzéssel, stabil rendezés. A gráf a 21-es program gráfja, az F → C 10 / C → F 8 aszimmetriával (a 9. fejezet kiigazítása tárgyalja; a futást nem befolyásolja). h(D) = 28-cal futtatva 35.

## Minta-zh 8(b)

Konvenció: f szerinti rendezés, egyenlőségnél ABC; célteszt belelépéskor (kivételkor); fakeresés útellenőrzéssel, az ismételt csomópontok feltárási sorrendű indexével (mint a 9. fejezet zh-megoldásában).

- Belelépések: S (0), A (10), B (11, ABC-döntetlen D-vel), D (11), K (14), V (16), X (17), G (18).
- Talált út: S → A → D → K → V → G, költsége 18.
- Maradék front: C₂ (19), W (19), C₁ (29), Y₂ (36), Y₁ (38).
- Zárt listás gráfkereséssel: ugyanaz az út, front C (19), W (19), Y (36). Feltáráskori célteszttel: ugyanaz az út, front X (17), C₂ (19), C₁ (29), Y (38).
- Egyenletes költségű keresés: 17 (S → A → D → K → V → W → G), az A* tehát a zh becslésével nem az optimális utat találja. Javított h(W) = 2-vel az A* 17-et ad; ugyanezzel feltáráskori céltesztnél ismét 18-at. Mohó: 18, 6 belelépés.

Minden számot két független úton számoltunk: a `search.js` modellel (unit tesztek rögzítik) és egy külön Python-programmal (útellenőrzéses fakeresés és zárt listás gráfkeresés, Dijkstra a h*-hoz). Az eredmények egyeznek.

## Laborok, gyakorlók, kvíz

Négy labor: heurisztika-tervező mohó és A* egymás melletti futtatásával (elfogadható és túlbecslő becslés összevetése gombokkal), hegymászó a többcsúcsú felszínen újraindításokkal, szimulált hűtés T₀-, α-, ütem- és magbeállítással (100 magos sikeráránnyal), keresőválasztó a záró összevető táblázathoz. A szimulált hűtés álvéletlen-generátora (mulberry32) magból reprodukálható; a modell tesztelt.

Öt lenyíló gyakorló blokk (mohó keresés, heurisztika-ellenőrzés, hegymászó és hűtés, minta-zh 8(b) 3 + 5 feladattal, 2017-es vizsgakérdések 5 mintaválasszal) és 12 kvízkérdés tippekkel, JavaScript nélkül is látható megoldókulccsal.

## A teljes kurzus végső ellenőrzése

Elkészült a `fogalomtar.html` (a TERV „A teljes kurzus lezárása” szakasza szerint): a tíz fejezet 277 fogalma és összes szakasza egy oldalon, ékezetfüggetlen, azonnali szűréssel; a kezdőlap keresőmezője ide visz. JavaScript nélkül a teljes lista olvasható. A haladásjelző opcionális maradt (csak a kvízeredmény tárolódik helyben). A kurzus hálózat nélkül is működik.

A `tesztek/bongeszo/kurzus.spec.cjs` a Playwright-szerveren, a GitHub Pages projektoldalnak megfelelő `http://127.0.0.1:48173/ai-alapok/` alkönyvtárból, asztali és telefonos nézetben:

- mind a 13 oldalt (kezdőlap, felvételek, fogalomtár, 10 fejezet) közvetlenül megnyitja és újratölti: mindegyik 200-as választ ad, JavaScript-hiba és konzolhiba nincs;
- minden oldal összes belső `a`, `link`, `script` és `img` hivatkozását HTTP-n lekéri, és a horgonyok létezését is ellenőrzi: nincs törött belső hivatkozás;
- a kezdőlapi kereső a fogalomtárba visz, és szűr.

A `tesztek/pages.test.cjs` statikusan is ellenőrzi az összes oldal relatív hivatkozásait és horgonyait, az azonosítók egyediségét, valamint azt, hogy a két generált fejezet és a fogalomtár megegyezik a scriptek friss kimenetével.

Telefonos elrendezés: a 10. fejezeten 320, 390, 768 és 1365 px szélességen, világos és sötét témában nincs oldalszintű vízszintes görgetés és kilógó doboz; a kezdőlapon és a fogalomtáron 320 px-en sincs. Nyomtatásban a gyakorlók kinyílnak, a laborok eltűnnek, a sötét téma világosra vált.

## Generálóscriptek

A 9. fejezet scriptje a munkakönyvtárból került a tárba (`eszkozok/09-abrak.cjs`, `eszkozok/09-sablon.html`); csak a modell útvonala lett relatív és kapott alapértelmezett be- és kimenetet. A tárból futtatva bájtra azonos HTML-t állít elő, mint a korábban beadott fejezet (a 10. fejezetre mutató három új hivatkozás előtt is ellenőrizve). A `search.js` bővítése után is azonos maradt. A futtatás leírása: `HASZNALAT.md`, „Generált oldalak”.

## Tesztek

- `npm test`: 77/77 sikeres.
- `npm run typecheck`: hibátlan.
- `npm run test:browser`: 188/188 sikeres (asztali és telefonos projekt), köztük az új `chapter-ten.spec.cjs` és `kurzus.spec.cjs`.
