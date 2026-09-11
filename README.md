# MI-alapok – fejlesztési terv

Ez a könyvtár egy magyar nyelvű, többoldalas, interaktív MI-kurzus terve.

A forrás a következő fájl:

`/forlinux/MEGA/MEGABase/ME/mest_int_alapjai/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`

A forrás 307 oldalból áll.

## Állapot

- [x] A PDF tartalmának felosztása elkészült.
- [x] A tíz fejezet és mérföldkő terve elkészült.
- [x] A teljes lefedettségi térkép elkészült.
- [x] 1. mérföldkő: kezdőlap, közös alkalmazásváz és az első fejezet.
- [x] 2. mérföldkő: tudásbázisok és szakértőrendszerek.
- [x] 3. mérföldkő: tudásreprezentáció, hálók, keretek és esetek.
- [ ] 4–10. mérföldkő: további fejezetek.

## Az elkészült alkalmazás

Nyisd meg az `index.html` fájlt.

Használat, tesztelés és GitHub Pages: [HASZNALAT.md](HASZNALAT.md).

Az első fejezet hat interaktív bemutatót és tíz opcionális kvízkérdést tartalmaz.

A második fejezet öt interaktív bemutatót és kilenc opcionális kvízkérdést tartalmaz.

Az átdolgozott második fejezet a PDF nélkül is követhető. Látható lépéssorok, összevetések és szerkesztett párbeszéd tagolják. A kézikönyv és a részletes tudás teljes tartalma kattintás nélkül olvasható. Mindkét láncolási irányhoz írásos levezetés tartozik. Az oktatói `resources/code/12_Logika.py` szabályait a kapcsolódó magyarázat mutatja be.

A harmadik fejezet négy interaktív labort és nyolc opcionális kvízkérdést tartalmaz.

Ellenőrzés: [ELLENORZES-02.md](ELLENORZES-02.md), [ELLENORZES-03.md](ELLENORZES-03.md).

A kiigazítások kiemelt dobozban, magyarázattal és forrással szerepelnek.

## Tartalmi forma

Minden fejezet önállóan érthető tananyag legyen.

Az olvasónak ne kelljen mellette megnyitnia a forrás PDF-et.

A forrás érdemi anyaga szervesen simuljon bele a magyarázatba.

A hosszabb szöveget tartalmi célú vizuális elemek tagolják.

Időrendi anyaghoz idővonal tartozik.

Összevetéshez párhuzamos elrendezés tartozik.

Folyamathoz lépéssor vagy folyamatábra tartozik.

A hiteles forrásmondatok idézetet és látható forrásjelölést kaphatnak.

A vizuális tagolás nem válthatja fel a teljes, összefüggő magyarázatot.

A részletes szabályokat az `IMPLEMENTALASI_SZABALYOK.md` tartalmazza.

## Parancs

Egy fejezet megvalósításához ezt a formát használd:

```text
/implement #1
```

A szám 1 és 10 között lehet.

A parancs csak a megadott mérföldkövet valósítja meg.

A megvalósítás előtt az ügynök olvassa el ezeket a fájlokat:

1. `README.md`
2. `TERV.md`
3. `LEFEDETTSEGI_TERKEP.md`
4. `IMPLEMENTALASI_SZABALYOK.md`

## A mérföldkövek sorrendje

1. MI, intelligencia és alkalmazások
2. Tudásbázisok és szakértőrendszerek
3. Tudásreprezentáció
4. Formális logika
5. Prolog és fuzzy logika
6. Mesterséges neurális hálózatok
7. Nevezetes számítási problémák
8. Genetikus algoritmusok
9. Neminformált keresés
10. Informált és lokális keresés

A részletes terv a `TERV.md` fájlban van.
