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
