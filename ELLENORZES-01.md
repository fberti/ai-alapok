# Az 1. mérföldkő ellenőrzése

## Hatókör

Alap: `7958a985ec5ad5ce30f7756aeb086a7dcce3580b`.

Az összevetés a teljes új munkapéldányra és az indexbe tett változásokra terjedt ki.

Csak az első fejezet és a közös alkalmazásváz készült el.

## Forráslefedés

A fizikai PDF-oldalszámokat használjuk.

- 1–4: `#intelligencia`, meghatározások és az MI három megközelítése.
- 5–7: `#meres`, tesztek, történet, korreláció és Cattell-pontosítás.
- 8–9: `#turing`, eljárás, kritikák és történeti eredmények.
- 10–15: `#szimbolumok`, játékok, bizonyítás, programozás és algebra.
- 16–21: `#erzekeles`, látás, robotika és hangfeldolgozás.
- 22–23: `#nyelv`, fordítás és a teljes Éva–Imre-példa.
- 24–25: `#tervezes`, korlátok, nyolc vezér és cselekvéstervezés.
- 26–31: `#szakertok`, minden rendszerpélda és a DENDRAL szabálya.
- 32–34: `#alkalmazasok`, minden alkalmazási példa tíz kártyában.
- 35: `#jovo`, eredeti ábra, magyar feladatlista és kritikai értelmezés.

Az ábrákból kiolvasott 15. oldali algebrai példák és a 31. oldali spektrumszabály külön ellenőrzést kaptak.

A 35. oldalt a szövegkinyerés nem adta vissza.

Képként is ellenőriztük és megőriztük.

A spektrum új rajza szemléltető példa, nem eredeti mért adatsor.

## Tesztek

A négy egyeztetett határon először hibázó teszt készült:

- helyi oldalak és hivatkozások;
- nyolc vezér szabályai;
- kvízértékelés;
- saját haladás tárolása.

A megvalósítás után ezek sikeresek lettek.

Végső eredmény:

- `npm run typecheck`: sikeres.
- `npm test`: 9 sikeres teszt.
- `npm run test:browser`: 16 sikeres Chromium-teszt.
- `git diff --check`: sikeres.

A böngészőtesztek asztali és telefonos nézetet használnak.

Vizsgálják a közvetlen `file://` megnyitást, az alkönyvtáras címet, újratöltést, játékot, billentyűzetet, kvízt, haladást és a többi bemutatót.

A tiltott helyi tárolót és a JavaScript nélküli olvasást is ellenőrzik.

A böngésző JavaScript-hibája megbuktatja a tesztet.

A kezdőlap és a fejezet asztali, illetve telefonos képe külön vizuális ellenőrzést kapott.

Firefox és Safari nem kapott külön futtatást.

## Standards

A megvalósítási szabályok alapján végzett saját kódellenőrzés.

A külön ellenőrző ügynök indítása használati korlát miatt meghiúsult.

Ez nem független ügynöki ellenőrzés.

Talált és javított hiány: a „klóz” első használatához nem tartozott magyarázat.

A szabályzat előírja a nehéz szavak magyarázatát.

A fejezet most megadja a jelentését.

Nyitott súlyos szabálysértést nem találtam.

## Spec

A `TERV.md` első mérföldköve és a PDF 1–35. oldala alapján végzett saját ellenőrzés.

Talált és javított hiány: a 35. oldali feladatlista nem őrizte meg az eredeti ábra pontjait.

Az eredeti ábra most nagyítható képként is szerepel.

Talált és javított hiány: a szituációkalkulus keresésének irányítási nehézsége kimaradt.

A tervezési rész most ezt is elmagyarázza.

A hat bemutató, a tízkérdéses kvíz és a saját haladás működik.

A későbbi fejezetek nem kaptak előre megírt tartalmat vagy hibás linket.

Összesítés: Standards 1 javított hiány; Spec 2 javított hiány. Ismert nyitott blokkoló hiba nincs.

## Közzététel

A magyar útmutató: `HASZNALAT.md`.

GitHub Pages-re nem tettük közzé az oldalt.

A forrás PDF 35. oldalának képét a tananyag részeként őrizzük meg, eredeti forrásjelölésével.

Nyilvános közzététel előtt a kép továbbközlési jogát a tár tulajdonosa ellenőrizze.

## Összevetés az új forrásokkal (MI1 diák, minta-zh)

Forrás: az 1. előadás diái (`MI1.pptx`, 37 dia), a 2025. december 5-i minta-zárthelyi, kiegészítésként egy 2017-es vizsgasor.

A diák 1–7. és 10–36. diája a PDF 1–35. oldalával egyezik. Ezeket a fejezet már lefedte.

A korábbi kiigazítások a diákra is érvényesek: McCarthy és 1955, a két Cattell, Binet és a francia kormány, a „ma is használt” DENDRAL, a „rabota”.

Hiányzott a 8. dia: Winston meghatározása.

Most idézetként szerepel a `#mi` részben, négylépéses lánccal (`#winston-lanc`) és a nyolc vezéres példával.

Hiányzott a 9. dia: a gyenge és az erős MI.

Most a dia mondata idézetként, a két álláspont pedig párhuzamos összehasonlításként (`#gyenge-eros-mi`) szerepel. Kapcsolódik a „tudat” kiigazításhoz és a kínai szobához (`#kinai-szoba`).

Új fogalomkártya és 9. kvízkérdés is készült hozzá. Bekerült a tanulási célok közé és az összefoglalóba is.

A 3. dia hat elemű összegzése kiegészíti a „Közös mag” kiemelést.

A 11. dia szerint Turing „legkésőbb 2000-re” jósolt. Az eredeti „nagyjából ötven évet” mond. Ezt egy mondat jelzi a jóslat után.

Minta-zh 1(c): a Turing-teszt célja annak eldöntése, hogy a gép emberhez hasonlóan gondolkodik-e. Ez igaz (10. dia). A fejezet most külön mondja a teszt célját és azt, amit ténylegesen mér. A záró kiemelés ezt mindkettőt tartalmazza.

Minta-zh 1(o): a „sokkal rosszabb színvonal” hamis (28. dia). A szakértőrendszeres kiigazítás után egy kiemelés ezt kimondja.

A 2017-es vizsgasor intelligencia-kérdései közül az alkalmazási területek listája, az érvényesség és a megbízhatóság már szerepelt. Descartes négy elve a 4. fejezetben van.

Newell meghatározását, Sternberg összetevőelméletét és Sloman szándékosság-fogalmát nem vettük át. Ezek nem szerepelnek a kurzus diáin, és más intézmény vizsgájából származnak. Az ágensek bővebb tárgyalása (kooperáció, koordináció) sem került be, mert az a diákon csak listaelem.

`assets/js/chapter-one.js`: a szigorú `checkJs` 58 implicit `any` hibát jelzett már a kiinduló állapotban is. JSDoc-típusjelölésekkel javítottuk, a működés nem változott.

Eredmény: `npm run typecheck` sikeres. `npm test`: az 1. fejezet tesztjei sikeresek. Egy hiba más fejezet (02) folyamatban lévő munkájából ered (`#s-giarratano`). Egy helyi `file://` Chromium-próba asztali és telefonos nézetben hibátlan volt: kvíz, nyolc vezér, DENDRAL, nincs vízszintes görgetés, JavaScript nélkül is látható új elemek. A böngészőtesztsort a koordinátor futtatja.
