# Az 5. mérföldkő ellenőrzése

Oldal: `fejezetek/05-prolog-es-fuzzy.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 122–141. fájloldal.

A fejezet az átdolgozott 1–4. fejezet mintájára, újonnan készült. Csak az 5. mérföldkő valósult meg. A kezdőlap és a negyedik fejezet ide vezet, a 6–10. fejezet nem aktív. A közös téma és a közös CSS változatlan. Nincs új függőség, szerveroldali kód vagy külső erőforrás.

## Lefedettség

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 122 | Név, szerzők és év (kiigazítva), predikátumkonstans, általános cél, „több lehetőség, lassabb rendszer”, deklaratív jelleg | `#prolog`, `#prolog-idovonal`, `#deklarativ` |
| 123 | Mintaillesztés, sorrend, automatikus visszalépés, vágás és a logikai ideál, Kowalski képlete, logika és vezérlés | `#deklarativ`, `#kowalski`, `#logika-vezerles` |
| 124 | `symbol` típus, lista, bemenő és kimenő változó, `P if Q and R and S`, fej és törzs | `#klozok`, `#fej-torzs`, `#csalad-parbeszed` |
| 125 | Horn-halmaz (kiigazítva), rezolúciós stratégia (kiigazítva), változók, `true` és `fail`, rendszerpredikátumok, infix operátorok | `#klozok`, `#elteres-tabla`, `#mukodes` |
| 126 | Aritmetika (kiigazítva), `:-`, klózok mint adatok, ítéletváltozók, `assert` és `retract`, `[Fej | Törzs]`, a vágás (kiigazítva) | `#elteres-tabla`, `#listak`, `#keresofak` |
| 127 | A teljes Turbo Prolog-program és mai alakja | `#kleopatra-program` |
| 128 | Illesztés, visszalépés, hátraláncolás, összes lehetőség, zsákutca | `#mukodes`, `#prolog-algoritmus` |
| 129 | F1, F11, F12, F2, F21–F23 séma (kép) | `#altalanos-fa` |
| 130–131 | Mindkét keresőfa kötésekkel, zsákutcával és visszalépéssel | `#ket-fa`, `#prolog-labor` |
| 132 | Zadeh (kiigazítva), végtelen értékű logika, négy erősség, szabályozástechnika | `#fuzzy`, `#fuzzy-idovonal` |
| 133–134 | Tagsági fok, A = {(x, μ(x))}, [0; 1] leképezés, nyelvi érték, hórihorgas 200 cm → 0,9, fizikai és fuzzy változó | `#tagsag`, `#horihorgas` |
| 135 | Hat tagságifüggvény-alak (kép), center, width, slope, mean, standard deviation | `#gorbe-alakok`, `#gorbe-labor` |
| 136 | Öt hőmérsékleti címke, töréspontok, kvartilisek és kerítések (kép) | `#homerseklet-halmazok`, `#kerites-tabla` |
| 137–138 | Antecedens, konzekvens, nyelvi tagság, ÉS mint minimum, VAGY mint maximum | `#szabalyok`, `#fuzzy-muveletek` |
| 139 | Egyszerre működő szabályok, kollektív döntés, három defuzzifikálási módszer | `#folyamat`, `#defuzz-modszerek` |
| 140 | Mindkét vizsgaszabály, minimum, levágás, egyesítés (kép) | `#vizsga`, `#vizsga-levezetes`, `#vizsga-labor` |
| 141 | Szabályozási kör: mérés, fuzzifikálás, következtetés, defuzzifikálás, folyamat | `#szabalyozasi-kor` |

A 129., 135., 136. és 140. oldalt képként is megvizsgáltuk. Idővonal két helyen van, mert a Prolog és a fuzzy logika története időrendi. Az összevetések párhuzamos nézetet, az algoritmus és a számítások lépéssort, a Prolog-kérdések párbeszédet kaptak. Idézet csak szó szerinti PDF-szövegből készült, oldalszámmal. A hórihorgas görbe, a hat alakzat paraméterei és a vizsgajegy skálái a jegyzet leolvasásai, illetve saját választásai. A fejezet ezt kimondja.

A hat kiigazítás: a Prolog születése (Colmerauer és Roussel, 1972), a Horn-halmaz meghatározása, a keresési stratégia gazdája, az `=` és az `is` különbsége, a vágás válaszvesztése és Lotfi Zadeh neve. A tagsági fok és a valószínűség különbsége kiegészítésbe került, mert a PDF mondata helyes, csak félreolvasható.

## Kód és próbák

A `resources/code/` fájljait a fejezet megírása előtt áttekintettük.

- `resources/code/11_Fuzzy.py`: a teljes fájl változatlanul, lépésenkénti magyarázattal szerepel. A számítási részt scikit-fuzzy 0.5.0-val, ideiglenes `uv run --no-project` környezetben futtattuk. Csak a grafikus háttér lett Agg, a `view()` és a `plt.show()` hívások kimaradtak. Kimenet: `1.6499999999999997`, `centroid`. A tagsági fokokat, a szabályerősségeket és a MOM-változat 1,3-as eredményét a könyvtárból olvastuk ki. A folytonos számítás 1,613-at ad. A különbséget a négy pontos kimeneti rács okozza, a fejezet ezt elmagyarázza.
- `resources/code/12_Logika.py`: a tényei és szabályai a Horn-klózok magyarázatánál, Prolog-átirat mellett szerepelnek. A Prolog-válaszokat a jegyzet saját megoldója adta. A pyDatalog programot most nem futtattuk. A 4. fejezet a teljes kimenetét már ismertette.

A számítás külön modellben van: `assets/js/prolog-fuzzy.js`. Ez egy kis SLD-megoldó vágással és lépésnaplóval, valamint a fuzzy függvények, a vizsgajegy és a termosztát folytonos modellje. A modell tesztjei (`tesztek/prolog-fuzzy.test.cjs`) hibázó futással indultak. Az egyik első elvárás hibás volt: a PDF sorrendjénél is van zsákutca, amikor a Prolog további választ keres. A tesztet a valódi viselkedéshez igazítottuk. A három labor böngészős tesztje szintén a vezérlőkód előtt, hibázó futással készült.

Végső futtatások:

- `npm run typecheck`: az új fájlokban nincs hiba. A `chapter-one.js` 58 korábbi típushibája változatlanul megmaradt, ez a mérföldkő nem érintette.
- `npm test`: 15 sikeres teszt, ebből 10 az új modellé.
- `npm run test:browser -- --workers=2`: 62 sikeres futás, ebből 18 az ötödik fejezeté, asztali és telefonos projektben.
- `git diff --check`: sikeres.

A böngészős próbák ellenőrzik a léptető zsákutcáját, visszalépését és a vágás miatti válaszvesztést, a görberajzoló számítását és hibajelzését, a vizsgajegy három módszerét és az üres kimenetet, mind a 10 kvízválaszt, a 320, 390, 768 és 1365 pixeles szélességet mindkét témában, a JavaScript nélküli közvetlen fájlmegnyitást, a sötét témából nyomtatást és a kezdőlapi, illetve a negyedik fejezetbeli linket. Képernyőképen ellenőriztük a világos asztali és a sötét telefonos nézetet. A túlnyúló ábrafeliratot és a telefonon rosszul törő jelölőnégyzet-címkéket javítottuk.

A felhasználói bevitel nem kerül HTML-ként az oldalba. A napló és a hibaüzenetek szövegét a kód kódolja. Nincs `eval`.

## Kódellenőrzés

A két szempontot két független alügynök vizsgálta: a szabályokat (`AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md`, kódszagok) és a specifikációt (`TERV.md` 5. mérföldkő, PDF 122–141). Az idézetek szó szerintiek, a számítások helyesek, a vágás kezelése helyes.

Javítva: a megoldó a névtelen `_` változó előfordulásait egy változóként kezelte (új hibázó teszt, majd javítás). A tagsági fok és a valószínűség dobozát kiegészítéssé alakítottuk. Új „Egyszerűen mondva” doboz került a keresés és a vágás mellé. A vágás hatása az eredeti sorrendben is pontos leírást kapott. Az ábracímek tizedesvesszőt használnak. A hat alakzat paramétereiről a szöveg már kimondja, hogy saját választások. A vizsgalabor a győztes szabály nevét a modellből veszi, és a módszerválasztás csak egyszer rajzol újra.

Nem javított, tudatos döntés: a `$`, `esc`, `initToc` és `initQuiz` függvény másolata az 1–4. fejezet mintáját követi. A közös modulba emelés mind az öt fejezetet érintené, ezért nem ennek a mérföldkőnek a része. A görberajzoló alakválasztós, paraméteres rajzoló, nem szabadkézi. A harmadik tény kapcsolója a vágás „zöld” hatását mutatja, két válasz esetén.
